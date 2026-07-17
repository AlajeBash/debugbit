import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] Warning: STRIPE_SECRET_KEY is not defined in your environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Ensure standard, robust API version compliance
  typescript: true,
});

export const PLANS = {
  community: {
    id: 'community',
    name: 'Community',
    priceId: '', // Free tier, no Stripe price ID required
    credits: 0,
  },
  pro: {
    id: 'pro',
    name: 'Pro Developer',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_mock_pro_123',
    credits: 100,
  },
  team: {
    id: 'team',
    name: 'Engineering Team',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM || 'price_mock_team_456',
    credits: 1000,
  },
};
