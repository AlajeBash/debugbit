import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { dbAdmin } from '../../../../lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[Stripe Webhook] Warning: STRIPE_WEBHOOK_SECRET is not configured.');
    }

    // 1. Verify and construct Stripe Event securely
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret || '');
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received validated event: ${event.type}`);

    // 2. Handle relevant event lifecycles
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (!metadata || !metadata.targetId) {
          console.warn('[Stripe Webhook] Received checkout completed with corrupt metadata.');
          break;
        }

        const targetId = metadata.targetId;
        const isOrg = targetId.startsWith('org_');
        const planId = metadata.planId || 'pro';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Sync subscription credentials back into corresponding target (teams vs users)
        if (isOrg) {
          const { error } = await dbAdmin
            .from('teams')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan_id: planId,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetId);

          if (error) console.error('[Stripe Webhook] Failed to update team subscription:', error.message);
        } else {
          const { error } = await dbAdmin
            .from('users')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan_id: planId,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetId);

          if (error) console.error('[Stripe Webhook] Failed to update user subscription:', error.message);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Resolve plan ID from the updated item price
        const priceId = subscription.items.data[0]?.price.id;
        let planId = 'community';
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) planId = 'pro';
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM) planId = 'team';

        // Check if the customer maps to an organization
        const { data: team } = await dbAdmin
          .from('teams')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (team) {
          await dbAdmin
            .from('teams')
            .update({
              plan_id: planId,
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        } else {
          await dbAdmin
            .from('users')
            .update({
              plan_id: planId,
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Downgrade tenant to Community plan immediately on deletion
        const { data: team } = await dbAdmin
          .from('teams')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (team) {
          await dbAdmin
            .from('teams')
            .update({
              plan_id: 'community',
              subscription_status: 'cancelled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        } else {
          await dbAdmin
            .from('users')
            .update({
              plan_id: 'community',
              subscription_status: 'cancelled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error('[Stripe Webhook] Fatal listener crash:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
