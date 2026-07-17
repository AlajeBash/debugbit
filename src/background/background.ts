import { db } from '../core/storage/dexieStore';

console.log('[AI Copilot Background] Service Worker initialized and running.');

let isRecording = true;

// Load initial recording state
chrome.storage.local.get('is_recording').then((data) => {
  if (data.is_recording !== undefined) {
    isRecording = data.is_recording;
  }
});

// Reactively listen to recording state updates
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.is_recording) {
    isRecording = changes.is_recording.newValue;
    console.log(`[AI Copilot Background] Recording state updated: ${isRecording}`);
  }
});

// In-memory cache mapping tabId -> active string sessionId
const activeSessions = new Map<number, string>();

/**
 * Resolves the active sessionId for a given tab.
 * If none exists, a new session record is created on the fly.
 */
async function getOrCreateSessionForTab(tabId: number, url: string): Promise<string> {
  const cachedSessionId = activeSessions.get(tabId);
  if (cachedSessionId) {
    // Double check that this session actually exists in our DB
    const exists = await db.sessions.get(cachedSessionId);
    if (exists) return cachedSessionId;
  }

  // Create a new session with cryptographically secure unique ID
  const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + '-' + Date.now();

  await db.sessions.add({
    id: sessionId,
    tabId,
    startTime: Date.now(),
    url: url || 'unknown',
    status: 'active',
    isSynced: false
  });

  activeSessions.set(tabId, sessionId);
  console.log(`[AI Copilot Background] Started new session ${sessionId} for tab ${tabId}`);
  return sessionId;
}

/**
 * Safely stops an active session by committing its endTime.
 */
async function terminateSession(tabId: number) {
  const sessionId = activeSessions.get(tabId);
  if (sessionId) {
    try {
      await db.sessions.update(sessionId, {
        endTime: Date.now(),
        status: 'completed'
      });
      console.log(`[AI Copilot Background] Session ${sessionId} for tab ${tabId} marked completed.`);
    } catch (err) {
      console.error('[AI Copilot Background] Error terminating session:', err);
    }
    activeSessions.delete(tabId);
  }
}

// Ensure sessions are wrapped up cleanly on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  terminateSession(tabId).catch(err => {
    console.error('[AI Copilot Background] Error handling tab removal:', err);
  });
});

// --- Message Router for Telemetry ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'TELEMETRY_EVENT') {
    const tabId = sender.tab?.id;
    if (!tabId) {
      // Message not sent from an active browser tab, ignore
      return;
    }

    const payload = message.payload;
    const tabUrl = sender.tab?.url || '';

    handleTelemetryMessage(tabId, tabUrl, payload)
      .then(() => {
        sendResponse({ status: 'success' });
      })
      .catch((err) => {
        console.error('[AI Copilot Background] Telemetry write failed:', err);
        sendResponse({ status: 'error', error: err.message });
      });

    // Return true to allow asynchronous response resolution
    return true;
  }
});

/**
 * Handles incoming telemetry events and saves them to Dexie / IndexedDB.
 */
async function handleTelemetryMessage(tabId: number, tabUrl: string, payload: any) {
  // If we are NOT recording, discard all incoming logs, but allow navigation setup (PAGE_LOADED)
  if (!isRecording && payload.type !== 'PAGE_LOADED') {
    return;
  }

  const timestamp = payload.timestamp || Date.now();

  // If page navigation occurs, wrap up the current session and start a fresh one!
  if (payload.type === 'PAGE_LOADED') {
    await terminateSession(tabId);
    
    const newSessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + '-' + Date.now();

    await db.sessions.add({
      id: newSessionId,
      tabId,
      startTime: timestamp,
      url: payload.url || tabUrl,
      status: 'active',
      isSynced: false
    });
    
    activeSessions.set(tabId, newSessionId);
    console.log(`[AI Copilot Background] Tab navigation. Spawning session ${newSessionId} for tab ${tabId}`);
    return;
  }

  // Resolve which sessionId this tab belongs to
  const sessionId = await getOrCreateSessionForTab(tabId, tabUrl);

  switch (payload.type) {
    case 'CONSOLE_LOG':
      await db.consoleLogs.add({
        sessionId,
        timestamp,
        type: payload.level || 'log', // log, warn, error, exception
        message: payload.message || '',
        stack: payload.stack
      });
      break;

    case 'NETWORK_LOG':
      await db.networkLogs.add({
        sessionId,
        timestamp,
        method: payload.method || 'GET',
        url: payload.url || '',
        status: payload.status !== undefined ? payload.status : 0,
        duration: payload.duration || 0,
        requestHeaders: payload.requestHeaders || {},
        responseHeaders: payload.responseHeaders || {},
        requestBody: payload.requestBody,
        responseBody: payload.responseBody
      });
      break;

    case 'PERFORMANCE_METRIC':
      await db.performanceMetrics.add({
        sessionId,
        metricName: payload.metricName || 'metric',
        value: payload.value || 0,
        timestamp
      });
      break;

    default:
      console.warn(`[AI Copilot Background] Unknown event type received: ${payload.type}`);
  }
}
