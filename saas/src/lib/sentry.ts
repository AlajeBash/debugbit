import * as Sentry from '@sentry/nextjs';

if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.warn('[Sentry] Warning: NEXT_PUBLIC_SENTRY_DSN is not configured.');
}

/**
 * Initializes serverless runtime error logging for background processes.
 */
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV || 'development',
    });
  }
}

/**
 * Captures exceptions securely and forwards detail payloads to corporate crash consoles.
 */
export function captureCrash(error: any, context: Record<string, any> = {}) {
  console.error('[Sentry Crash Ingest]:', error);
  try {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } catch (err: any) {
    console.error('[Sentry] Ingestion failed:', err.message);
  }
}
