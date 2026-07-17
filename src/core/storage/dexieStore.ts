import Dexie, { type Table } from 'dexie';

// --- Database Models ---

export interface Session {
  id: string; // Unique Session ID (UUID or generated unique string)
  tabId?: number; // Target Chrome Tab ID mapping
  startTime: number;
  endTime?: number;
  url: string;
  status: 'active' | 'completed' | 'failed';
  isSynced: boolean; // Tracking for optional cloud synchronization
}

export interface NetworkLog {
  id?: number;
  sessionId: string;
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
  sessionId: string;
  timestamp: number;
  type: 'log' | 'info' | 'warn' | 'error' | 'exception';
  message: string;
  stack?: string;
}

export interface PerformanceMetric {
  id?: number;
  sessionId: string;
  metricName: string; // e.g., 'FCP', 'LCP', 'DOMContentLoaded', 'FID', 'CLS'
  value: number;
  timestamp: number;
}

export interface AIReport {
  id?: number;
  sessionId: string;
  modelUsed: string;
  content: string;
  createdAt: number;
}

export interface Screenshot {
  id?: number;
  sessionId: string;
  dataUrl: string;
  timestamp: number;
}

export interface Bookmark {
  id?: number;
  sessionId: string;
  createdAt: number;
}

export interface Preference {
  key: string;
  value: any;
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
 * before they are saved to the local database.
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
      if (SENSITIVE_KEYWORDS.some(keyword => lowerKey.includes(keyword))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactPII(value);
      }
    }
    return redacted;
  }

  // Handle strings (JSON strings, authorization strings, parameters)
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'object') {
        return JSON.stringify(redactPII(parsed));
      }
    } catch {
      // Not a valid JSON, continue with regex
    }

    let sanitized = input;

    // Redact HTTP Bearer/Basic Auth strings (e.g. "Bearer eyJ...")
    const authorizationRegex = /(Bearer\s+|Basic\s+)[A-Za-z0-9\-._~+/+=]+/gi;
    sanitized = sanitized.replace(authorizationRegex, '$1[REDACTED]');

    // Redact common query parameters / form body keys (e.g., password=foo&token=bar)
    const paramRegex = /(password|token|secret|api_key|apikey|authorization)=([^&]+)/gi;
    sanitized = sanitized.replace(paramRegex, '$1=[REDACTED]');

    return sanitized;
  }

  return input;
}

// --- Dexie Database Class Definition ---

export class AIDebuggingCopilotDatabase extends Dexie {
  sessions!: Table<Session, string>;
  networkLogs!: Table<NetworkLog, number>;
  consoleLogs!: Table<ConsoleLog, number>;
  performanceMetrics!: Table<PerformanceMetric, number>;
  aiReports!: Table<AIReport, number>;
  screenshots!: Table<Screenshot, number>;
  bookmarks!: Table<Bookmark, number>;
  preferences!: Table<Preference, string>;

  constructor() {
    super('AIDebuggingCopilotDB_v2');
    
    this.version(1).stores({
      sessions: 'id, tabId, startTime, endTime, url, status, isSynced',
      networkLogs: '++id, sessionId, timestamp, method, url, status, duration',
      consoleLogs: '++id, sessionId, timestamp, type, message',
      performanceMetrics: '++id, sessionId, metricName, value',
      aiReports: '++id, sessionId, modelUsed, createdAt',
      screenshots: '++id, sessionId, timestamp',
      bookmarks: '++id, sessionId, createdAt',
      preferences: 'key'
    });

    // Hook up local PII scrubbing
    this.setupPIIScrubbingHooks();
  }

  private setupPIIScrubbingHooks() {
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
 * Automatically prunes sessions and related telemetry logs that are older than the daysLimit.
 */
export async function pruneOldSessions(daysLimit = 7): Promise<void> {
  const cutoffTime = Date.now() - daysLimit * 24 * 60 * 60 * 1000;
  
  try {
    const expiredSessions = await db.sessions
      .where('startTime')
      .below(cutoffTime)
      .toArray();
      
    if (expiredSessions.length === 0) return;
    
    const expiredSessionIds = expiredSessions.map(s => s.id);
    
    await db.transaction('rw', [
      db.sessions, 
      db.networkLogs, 
      db.consoleLogs, 
      db.performanceMetrics,
      db.aiReports,
      db.screenshots,
      db.bookmarks
    ], async () => {
      await Promise.all([
        db.networkLogs.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.consoleLogs.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.performanceMetrics.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.aiReports.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.screenshots.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.bookmarks.where('sessionId').anyOf(expiredSessionIds).delete(),
        db.sessions.where('id').anyOf(expiredSessionIds).delete()
      ]);
    });
    
    console.log(`[IndexedDB Pruner] Successfully pruned ${expiredSessionIds.length} sessions older than ${daysLimit} days.`);
  } catch (err) {
    console.error('[IndexedDB Pruner] Pruning transaction failed:', err);
  }
}
