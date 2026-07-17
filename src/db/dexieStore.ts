import Dexie, { type Table } from 'dexie';

// --- Database Models ---

export interface Session {
  id?: number;
  tabId?: number; // Target Chrome Tab ID mapping
  startTime: number;
  endTime?: number;
  url: string;
  status: 'active' | 'completed' | 'failed';
}

export interface NetworkLog {
  id?: number;
  sessionId: number;
  timestamp: number;
  method: string;
  url: string;
  status: number;
  duration: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string | null;
  responseBody?: string | null;
}

export interface ConsoleLog {
  id?: number;
  sessionId: number;
  timestamp: number;
  type: 'log' | 'info' | 'warn' | 'error' | 'exception';
  message: string;
  stack?: string;
}

export interface PerformanceMetric {
  id?: number;
  sessionId: number;
  metricName: string; // e.g., 'FCP', 'LCP', 'DOMContentLoaded', 'FID', 'CLS'
  value: number;
  timestamp: number;
}

// --- PII Redaction Constants & Utility ---

const SENSITIVE_KEYWORDS = [
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'token',
  'secret',
  'apikey',
  'api-key',
  'x-api-key',
  'credentials',
  'privatekey',
  'private-key',
  'jwt',
  'session'
];

/**
 * Recursively scans and redacts PII from any payload, headers, or log strings
 * before they are serialized and saved to the database.
 */
export function redactPII(input: any): any {
  if (input === null || input === undefined) {
    return input;
  }

  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(redactPII);
  }

  // Handle nested objects
  if (typeof input === 'object') {
    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase();
      // Check if key contains any sensitive keywords
      if (SENSITIVE_KEYWORDS.some(keyword => lowerKey.includes(sensitiveMatchWord(keyword)))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactPII(value);
      }
    }
    return redacted;
  }

  // Handle strings (JSON strings, authorization strings, form parameters)
  if (typeof input === 'string') {
    // 1. Attempt to parse JSON strings to sanitize objects recursively
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'object') {
        return JSON.stringify(redactPII(parsed));
      }
    } catch {
      // Not a valid JSON payload, process with text regex replacements
    }

    let sanitized = input;

    // 2. Redact HTTP Bearer/Basic Auth strings (e.g. "Bearer eyJ...")
    const authorizationRegex = /(Bearer\s+|Basic\s+)[A-Za-z0-9\-._~+/+=]+/gi;
    sanitized = sanitized.replace(authorizationRegex, '$1[REDACTED]');

    // 3. Redact common query parameters / form body keys (e.g., password=foo&token=bar)
    const paramRegex = /(password|token|secret|api_key|apikey|authorization)=([^&]+)/gi;
    sanitized = sanitized.replace(paramRegex, '$1=[REDACTED]');

    return sanitized;
  }

  return input;
}

// Utility mapper to ensure keyword checks map safely to key targets
function sensitiveMatchWord(keyword: string): string {
  return keyword;
}

// --- Dexie Database Class Definition ---

export class AIDebuggingCopilotDatabase extends Dexie {
  sessions!: Table<Session>;
  networkLogs!: Table<NetworkLog>;
  consoleLogs!: Table<ConsoleLog>;
  performanceMetrics!: Table<PerformanceMetric>;

  constructor() {
    super('AIDebuggingCopilotDB');
    
    this.version(2).stores({
      sessions: '++id, tabId, startTime, endTime, url, status',
      networkLogs: '++id, sessionId, timestamp, method, url, status, duration',
      consoleLogs: '++id, sessionId, timestamp, type, message',
      performanceMetrics: '++id, sessionId, metricName, value',
    });

    // Automatically apply PII scrubbing to all data being added or updated
    this.setupPIIScrubbingHooks();
  }

  private setupPIIScrubbingHooks() {
    // Network logs hook: Intercept, scrub, and save safely
    this.networkLogs.hook('creating', (_primKey, obj) => {
      if (obj.requestHeaders) obj.requestHeaders = redactPII(obj.requestHeaders);
      if (obj.responseHeaders) obj.responseHeaders = redactPII(obj.responseHeaders);
      if (obj.requestBody) obj.requestBody = redactPII(obj.requestBody);
      if (obj.responseBody) obj.responseBody = redactPII(obj.responseBody);
    });

    this.networkLogs.hook('updating', (modifications, _primKey, _obj) => {
      const mods = modifications as any;
      const updates: any = {};
      if (mods.requestHeaders) updates.requestHeaders = redactPII(mods.requestHeaders);
      if (mods.responseHeaders) updates.responseHeaders = redactPII(mods.responseHeaders);
      if (mods.requestBody) updates.requestBody = redactPII(mods.requestBody);
      if (mods.responseBody) updates.responseBody = redactPII(mods.responseBody);
      return updates;
    });

    // Console logs hook: Intercept exceptions and messages that might contain tokens
    this.consoleLogs.hook('creating', (_primKey, obj) => {
      if (obj.message) obj.message = redactPII(obj.message);
      if (obj.stack) obj.stack = redactPII(obj.stack);
    });

    this.consoleLogs.hook('updating', (modifications, _primKey, _obj) => {
      const mods = modifications as any;
      const updates: any = {};
      if (mods.message) updates.message = redactPII(mods.message);
      if (mods.stack) updates.stack = redactPII(mods.stack);
      return updates;
    });
  }
}

// Export a single database instance
export const db = new AIDebuggingCopilotDatabase();

/**
 * Automatically prunes any sessions and their telemetry logs that are older than 7 days.
 */
export async function pruneOldSessions(daysLimit = 7): Promise<void> {
  const cutoffTime = Date.now() - daysLimit * 24 * 60 * 60 * 1000;
  
  try {
    // 1. Find all session records older than the cutoff threshold
    const expiredSessions = await db.sessions
      .where('startTime')
      .below(cutoffTime)
      .toArray();
      
    if (expiredSessions.length === 0) return;
    
    const expiredSessionIds = expiredSessions
      .map(s => s.id)
      .filter((id): id is number => id !== undefined);
    
    // 2. Transact-delete all related telemetry rows of expired sessions
    await db.transaction('rw', [db.sessions, db.networkLogs, db.consoleLogs, db.performanceMetrics], async () => {
      await Promise.all([
        db.networkLogs.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.consoleLogs.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.performanceMetrics.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.sessions.where('id').anyOf(expiredSessionIds).delete()
      ]);
    });
    
    console.log(`[IndexedDB Pruner] Successfully pruned ${expiredSessionIds.length} sessions older than ${daysLimit} days.`);
  } catch (err) {
    console.error('[IndexedDB Pruner] Pruning transaction failed:', err);
  }
}
