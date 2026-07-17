import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { auth } from '@clerk/nextjs';
import { dbAdmin } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve the Stripe Customer ID from Postgres
    let stripeCustomerId: string | null = null;

    if (orgId) {
      const { data: team } = await dbAdmin
        .from('teams')
        .select('stripe_customer_id')
        .eq('id', orgId)
        .single();
      stripeCustomerId = team?.stripe_customer_id || null;
    } else {
      const { data: user } = await dbAdmin
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();
      stripeCustomerId = user?.stripe_customer_id || null;
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active Stripe billing profile found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Create the Billing Portal Session
    const returnUrl = `${req.nextUrl.origin}/dashboard`;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (err: any) {
    console.error('[Stripe Billing Portal] Session creation failed:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
