import { z } from 'zod';

/**
 * Enterprise Ingestion Schemas validating incoming Chrome Extension telemetry sync payloads.
 * Protects PostgreSQL database tables from SQL injection or malicious buffer overflow payloads.
 */

export const ConsoleLogSchema = z.object({
  type: z.enum(['log', 'info', 'warn', 'error', 'exception']),
  message: z.string().min(1).max(50000), // Max 50KB message buffer
  timestamp: z.number(),
  stack: z.string().optional(),
});

export const NetworkLogSchema = z.object({
  method: z.string().min(1).max(10),
  url: z.string().url(),
  status: z.number().int().min(100).max(599),
  duration: z.number().int().nonnegative(),
  requestHeaders: z.record(z.string()).optional(),
  responseHeaders: z.record(z.string()).optional(),
  requestBody: z.string().optional(),
  responseBody: z.string().optional(),
  timestamp: z.number(),
});

export const PerformanceMetricSchema = z.object({
  metricName: z.string().min(1).max(100),
  value: z.number(),
  timestamp: z.number(),
});

export const TelemetryPayloadSchema = z.object({
  sessionId: z.string().uuid(),
  tabId: z.number().int(),
  startTime: z.number(),
  endTime: z.number().optional(),
  url: z.string().url(),
  consoleLogs: z.array(ConsoleLogSchema),
  networkLogs: z.array(NetworkLogSchema),
  performanceMetrics: z.array(PerformanceMetricSchema),
});

/**
 * Custom validation helper wrapping Zod exceptions cleanly.
 */
export function validateTelemetryPayload(payload: any) {
  return TelemetryPayloadSchema.safeParse(payload);
}
