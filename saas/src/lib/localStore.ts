// Singleton local storage container for local development runs
// Avoids database dependencies during fast-paced developer testing sprints

export interface LocalTelemetryEvent {
  id: string;
  category: 'console' | 'network' | 'performance';
  timestamp: string;
  level?: 'log' | 'info' | 'warn' | 'error' | 'exception';
  message?: string;
  method?: string;
  url?: string;
  status?: number;
  duration?: number;
  metricName?: string;
  value?: number;
}

export interface LocalSession {
  id: string;
  url: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'failed';
  tabId?: number;
  project: string;
  resolutionStatus: 'unresolved' | 'resolved' | 'investigating';
  assignee?: string;
  events: LocalTelemetryEvent[];
}

// Global cached store to survive Next.js Dev HMR (Hot Module Replacement) rebuild cycles
const globalForStore = global as unknown as {
  localSessions: LocalSession[];
};

export const localSessions: LocalSession[] = globalForStore.localSessions || [];

if (process.env.NODE_ENV !== 'production') {
  globalForStore.localSessions = localSessions;
}

/**
 * Saves or updates a session and its events inside our in-memory singleton.
 */
export function upsertLocalSession(sessionData: any, logs: any[], network: any[], performance: any[]) {
  // Convert standard epoch timestamps to visual HH:MM:SS formats
  const formatTime = (epochMs: number) => {
    const d = new Date(epochMs);
    return d.toTimeString().split(' ')[0]; // Returns "HH:MM:SS"
  };

  const parsedEvents: LocalTelemetryEvent[] = [];

  // 1. Process Console Logs
  logs.forEach((log, idx) => {
    parsedEvents.push({
      id: `console-${idx}-${Date.now()}`,
      category: 'console',
      timestamp: formatTime(log.timestamp || Date.now()),
      level: log.type || 'log',
      message: log.message || '',
    });
  });

  // 2. Process Network Logs
  network.forEach((net, idx) => {
    parsedEvents.push({
      id: `network-${idx}-${Date.now()}`,
      category: 'network',
      timestamp: formatTime(net.timestamp || Date.now()),
      method: net.method || 'GET',
      url: net.url || '',
      status: net.status || 200,
      duration: net.duration || 120,
    });
  });

  // 3. Process Performance WebVitals
  performance.forEach((perf, idx) => {
    parsedEvents.push({
      id: `perf-${idx}-${Date.now()}`,
      category: 'performance',
      timestamp: formatTime(perf.timestamp || Date.now()),
      metricName: perf.metricName || 'FCP',
      value: perf.value || 0,
    });
  });

  // Sort events chronologically
  parsedEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const existingIndex = localSessions.findIndex(s => s.id === sessionData.id);

  const formattedSession: LocalSession = {
    id: sessionData.id,
    url: sessionData.url || 'http://localhost:3000',
    startTime: new Date(sessionData.startTime || Date.now()).toISOString(),
    endTime: sessionData.endTime ? new Date(sessionData.endTime).toISOString() : undefined,
    status: sessionData.status || 'completed',
    tabId: sessionData.tabId,
    project: 'SaaS Chrome Extension Local Client',
    resolutionStatus: sessionData.status === 'failed' ? 'unresolved' : 'resolved',
    assignee: 'Unassigned',
    events: parsedEvents
  };

  if (existingIndex >= 0) {
    localSessions[existingIndex] = formattedSession;
  } else {
    localSessions.unshift(formattedSession); // Put latest sessions at the beginning
  }

  console.log(`[Local Sync Store] Upserted session ${sessionData.id} with ${parsedEvents.length} telemetry nodes.`);
}
