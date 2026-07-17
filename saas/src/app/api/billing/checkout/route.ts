import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { auth } from '@clerk/nextjs'; // Robust Clerk identity fetching
import { dbAdmin } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Sign in required.' }, { status: 401 });
    }

    const { priceId, planId } = await req.json();

    if (!priceId || !planId) {
      return NextResponse.json({ error: 'Missing priceId or planId payload.' }, { status: 400 });
    }

    // 1. Resolve customer ID if they already exist in our DB, or let Stripe auto-create
    let stripeCustomerId: string | undefined;
    const targetId = orgId || userId; // Organization-scoped or single user-scoped

    if (orgId) {
      const { data: team } = await dbAdmin
        .from('teams')
        .select('stripe_customer_id')
        .eq('id', orgId)
        .single();
      stripeCustomerId = team?.stripe_customer_id || undefined;
    } else {
      const { data: user } = await dbAdmin
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();
      stripeCustomerId = user?.stripe_customer_id || undefined;
    }

    // 2. Create the checkout session with detailed metadata payload
    const successUrl = `${req.nextUrl.origin}/dashboard?checkout=success`;
    const cancelUrl = `${req.nextUrl.origin}/dashboard?checkout=cancelled`;

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        orgId: orgId || '',
        planId,
        targetId,
      },
      subscription_data: {
        metadata: {
          userId,
          orgId: orgId || '',
          planId,
          targetId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('[Stripe Checkout] Session creation failed:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
