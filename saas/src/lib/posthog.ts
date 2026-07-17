import { PostHog } from 'posthog-node';

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  console.warn('[PostHog] Warning: NEXT_PUBLIC_POSTHOG_KEY is not defined in your environment variables.');
}

// 1. Server-side PostHog Instance for tracking transaction metrics
export const posthogServer = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_mock_key_123',
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    flushAt: 1, // Flush instantly in serverless/lambda environments to avoid process exits before sending events
    flushInterval: 0,
  }
);

/**
 * Standard telemetry tracking helper for serverless SaaS endpoints.
 */
export function trackSaaSEvent(
  distinctId: string, 
  eventName: string, 
  properties: Record<string, any> = {}
) {
  try {
    posthogServer.capture({
      distinctId,
      event: eventName,
      properties: {
        ...properties,
        environment: process.env.NODE_ENV || 'development',
        platform: 'DebugBit SaaS',
      },
    });
  } catch (err: any) {
    console.error('[PostHog] Ingestion tracking failed:', err.message);
  }
}
