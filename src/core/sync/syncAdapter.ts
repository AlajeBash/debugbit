import { db } from '../storage/dexieStore';
import { scrubTelemetry } from './scrubber';

const DEFAULT_SAAS_GATEWAY_URL = 'https://debugbit-saas-platform.vercel.app'; // Customizable default endpoint

/**
 * Resolves the SaaS Sync Endpoint URL from Chrome Storage.
 */
export async function getSaaSEndpoint(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const result = await chrome.storage.local.get('saas_gateway_url');
      return result.saas_gateway_url || DEFAULT_SAAS_GATEWAY_URL;
    } catch {
      return DEFAULT_SAAS_GATEWAY_URL;
    }
  }
  return DEFAULT_SAAS_GATEWAY_URL;
}

/**
 * Resolves the SaaS Project API Key from Chrome Storage.
 */
export async function getProjectApiKey(): Promise<string | null> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const result = await chrome.storage.local.get('saas_project_api_key');
      return result.saas_project_api_key || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Synchronizes a specific session and all its associated telemetry logs 
 * to the centralized SaaS dashboard after executing enterprise PII scrubbing.
 */
export async function syncSessionToSaaS(sessionId: string): Promise<boolean> {
  try {
    const apiKey = await getProjectApiKey();
    if (!apiKey) {
      console.warn('[Sync Adapter] Synchronization aborted: SaaS Project API Key is not configured.');
      return false;
    }

    const gatewayUrl = await getSaaSEndpoint();

    // 1. Gather all local logs matching this session
    const [session, consoleLogs, networkLogs, performanceMetrics] = await Promise.all([
      db.sessions.get(sessionId),
      db.consoleLogs.where('sessionId').equals(sessionId).toArray(),
      db.networkLogs.where('sessionId').equals(sessionId).toArray(),
      db.performanceMetrics.where('sessionId').equals(sessionId).toArray()
    ]);

    if (!session) {
      console.error(`[Sync Adapter] Session ${sessionId} not found in local IndexedDB.`);
      return false;
    }

    // 2. Prepare payload and execute enterprise-grade client-side PII scrubbing
    const payload = {
      apiKey,
      session: {
        id: session.id,
        tabId: session.tabId,
        startTime: session.startTime,
        endTime: session.endTime,
        url: session.url,
        status: session.status
      },
      logs: consoleLogs.map(l => ({
        timestamp: l.timestamp,
        type: l.type,
        message: l.message,
        stack: l.stack
      })),
      network: networkLogs.map(n => ({
        timestamp: n.timestamp,
        method: n.method,
        url: n.url,
        status: n.status,
        duration: n.duration,
        requestHeaders: n.requestHeaders,
        responseHeaders: n.responseHeaders,
        requestBody: n.requestBody,
        responseBody: n.responseBody
      })),
      performance: performanceMetrics.map(p => ({
        metricName: p.metricName,
        value: p.value,
        timestamp: p.timestamp
      }))
    };

    // Apply zero-trust telemetry scrubber
    const scrubbedPayload = scrubTelemetry(payload);

    // 3. Dispatch payload to the SaaS Sync REST API Gateway
    const response = await fetch(`${gatewayUrl}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scrubbedPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sync Adapter] Server-side Sync failed (${response.status}):`, errorText);
      return false;
    }

    // 4. Update the local session record to mark as synced successfully
    await db.sessions.update(sessionId, { isSynced: true });
    console.log(`[Sync Adapter] Session ${sessionId} successfully synced with SaaS Cloud Platform.`);
    return true;

  } catch (err) {
    console.error(`[Sync Adapter] Sync runner encountered a critical network/storage error for session ${sessionId}:`, err);
    return false;
  }
}

/**
 * Background sync task that scans local IndexedDB for any unsynced complete sessions
 * and uploads them to the SaaS cloud gateway.
 */
export async function triggerBackgroundSyncSweep(): Promise<void> {
  try {
    const sessions = await db.sessions.toArray();
    const unsyncedSessions = sessions.filter(sess => 
      !sess.isSynced && 
      (sess.status === 'completed' || sess.status === 'failed')
    );

    if (unsyncedSessions.length === 0) return;

    console.log(`[Sync Adapter] Found ${unsyncedSessions.length} unsynced complete sessions. Initiating background upload...`);

    for (const session of unsyncedSessions) {
      await syncSessionToSaaS(session.id);
    }
  } catch (err) {
    console.error('[Sync Adapter] Background sweep failed:', err);
  }
}
