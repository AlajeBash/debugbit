import { create } from 'zustand';
import { db, pruneOldSessions, type Session, type NetworkLog, type ConsoleLog } from '../core/storage/dexieStore';
import { liveQuery } from 'dexie';

export type FilterType = 'all' | 'errors' | 'network' | 'logs';

export type UnifiedTelemetryEvent =
  | { id: string; timestamp: number; category: 'network'; data: NetworkLog }
  | { id: string; timestamp: number; category: 'console'; data: ConsoleLog };

interface TelemetryState {
  activeSessionId: string | null;
  selectedLog: UnifiedTelemetryEvent | null;
  filterType: FilterType;
  sessions: Session[];
  networkLogs: NetworkLog[];
  consoleLogs: ConsoleLog[];
  unifiedEvents: UnifiedTelemetryEvent[];
  
  // AI States
  geminiKey: string | null;
  isAnalyzing: boolean;
  aiReport: string | null;
  
  // Recording State
  isRecording: boolean;
  
  // Actions
  setActiveSessionId: (id: string | null) => void;
  setSelectedLog: (log: UnifiedTelemetryEvent | null) => void;
  setFilterType: (filter: FilterType) => void;
  clearCurrentSession: () => Promise<void>;
  initStore: () => () => void;
  initLogsSubscription: () => void;
  
  // AI Actions
  setGeminiKey: (key: string) => Promise<void>;
  loadGeminiKey: () => Promise<void>;
  analyzeActiveSession: () => Promise<void>;
  clearAIReport: () => void;

  // Recording Actions
  setIsRecording: (recording: boolean) => Promise<void>;
  loadRecordingState: () => Promise<void>;
}

/**
 * Resolves the target Chrome Tab ID being inspected or viewed.
 */
async function resolveCurrentTabId(): Promise<number | null> {
  // 1. Check if running inside DevTools panel context
  if (typeof chrome !== 'undefined' && chrome.devtools && chrome.devtools.inspectedWindow) {
    return chrome.devtools.inspectedWindow.tabId;
  }
  // 2. Fallback to querying active tab in current window (for popup, sidepanel)
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0 && tabs[0].id !== undefined) {
        return tabs[0].id;
      }
    } catch {}
  }
  return null;
}

// Keep references to Dexie subscription objects for proper disposal
let sessionSub: { unsubscribe: () => void } | null = null;
let logsSub: { unsubscribe: () => void } | null = null;

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  activeSessionId: null,
  selectedLog: null,
  filterType: 'all',
  sessions: [],
  networkLogs: [],
  consoleLogs: [],
  unifiedEvents: [],

  // AI Default States
  geminiKey: null,
  isAnalyzing: false,
  aiReport: null,

  // Recording State Defaults
  isRecording: true,

  setActiveSessionId: (id) => {
    set({ activeSessionId: id, selectedLog: null, aiReport: null });
    get().initLogsSubscription();
  },

  setSelectedLog: (log) => set({ selectedLog: log }),
  setFilterType: (filterType) => set({ filterType }),

  clearCurrentSession: async () => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;

    try {
      // Clear all associated telemetry logs for this session
      await Promise.all([
        db.networkLogs.where('sessionId').equals(activeSessionId).delete(),
        db.consoleLogs.where('sessionId').equals(activeSessionId).delete(),
        db.performanceMetrics.where('sessionId').equals(activeSessionId).delete(),
        db.sessions.delete(activeSessionId)
      ]);
    } catch (err) {
      console.error('[Telemetry Store] Failed to clear session data:', err);
    }

    set({ activeSessionId: null, selectedLog: null, unifiedEvents: [], aiReport: null });
  },

  initStore: () => {
    // Load Gemini Key from Chrome Storage
    get().loadGeminiKey().catch(err => {
      console.error('[Telemetry Store] Failed to load Gemini Key:', err);
    });

    // Load active recording state from storage
    get().loadRecordingState().catch(err => {
      console.error('[Telemetry Store] Failed to load recording state:', err);
    });

    // Automatically prune telemetry sessions and logs older than 7 days
    pruneOldSessions().catch(err => {
      console.error('[Telemetry Store] Background auto-pruning failed:', err);
    });

    // Subscribe to isolated sessions matching the current active Tab ID
    const sessionsObservable = liveQuery(async () => {
      const tabId = await resolveCurrentTabId();
      if (tabId !== null) {
        return db.sessions.where('tabId').equals(tabId).toArray();
      }
      return db.sessions.toArray();
    });
    
    sessionSub = sessionsObservable.subscribe({
      next: (sessionsList) => {
        // Sort sessions with latest at the top
        const sorted = [...sessionsList].sort((a, b) => b.startTime - a.startTime);
        set({ sessions: sorted });

        // Auto-select latest session if no active session is selected
        const currentActive = get().activeSessionId;
        if (!currentActive && sorted.length > 0) {
          const latestId = sorted[0].id || null;
          set({ activeSessionId: latestId });
          get().initLogsSubscription();
        }
      },
      error: (err) => console.error('[Telemetry Store] Live sessions query failed:', err)
    });

    return () => {
      if (sessionSub) {
        sessionSub.unsubscribe();
        sessionSub = null;
      }
      if (logsSub) {
        logsSub.unsubscribe();
        logsSub = null;
      }
    };
  },

  initLogsSubscription: () => {
    if (logsSub) {
      logsSub.unsubscribe();
      logsSub = null;
    }

    const sessionId = get().activeSessionId;
    if (!sessionId) {
      set({ networkLogs: [], consoleLogs: [], unifiedEvents: [] });
      return;
    }

    // Reactive liveQuery for current session's network and console events
    const logsObservable = liveQuery(async () => {
      const [network, consoleEvents] = await Promise.all([
        db.networkLogs.where('sessionId').equals(sessionId).toArray(),
        db.consoleLogs.where('sessionId').equals(sessionId).toArray()
      ]);
      return { network, consoleEvents };
    });

    logsSub = logsObservable.subscribe({
      next: ({ network, consoleEvents }) => {
        const unified: UnifiedTelemetryEvent[] = [];

        network.forEach(log => {
          unified.push({
            id: `net-${log.id}`,
            timestamp: log.timestamp,
            category: 'network',
            data: log
          });
        });

        consoleEvents.forEach(log => {
          unified.push({
            id: `console-${log.id}`,
            timestamp: log.timestamp,
            category: 'console',
            data: log
          });
        });

        // Sort chronologically (oldest to newest)
        unified.sort((a, b) => a.timestamp - b.timestamp);

        set({
          networkLogs: network,
          consoleLogs: consoleEvents,
          unifiedEvents: unified
        });

        // Refresh selected log reference if updated
        const currentSelected = get().selectedLog;
        if (currentSelected) {
          const freshItem = unified.find(item => item.id === currentSelected.id);
          if (freshItem) {
            set({ selectedLog: freshItem });
          }
        }
      },
      error: (err) => console.error('[Telemetry Store] Live logs query failed:', err)
    });
  },

  // --- AI Actions Implementation ---
  setGeminiKey: async (key: string) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ gemini_api_key: key });
      } catch (err) {
        console.error('[Telemetry Store] Storage write failed:', err);
      }
    }
    set({ geminiKey: key });
  },

  loadGeminiKey: async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await chrome.storage.local.get('gemini_api_key');
        if (result.gemini_api_key) {
          set({ geminiKey: result.gemini_api_key });
        }
      } catch (err) {
        console.error('[Telemetry Store] Storage read failed:', err);
      }
    }
  },

  analyzeActiveSession: async () => {
    const { geminiKey, unifiedEvents } = get();
    if (!geminiKey) {
      throw new Error('Gemini API Key is missing. Please add your key in settings first!');
    }

    set({ isAnalyzing: true, aiReport: null });

    try {
      const { analyzeTelemetryTimeline } = await import('../core/ai/aiAnalyzer');
      const report = await analyzeTelemetryTimeline(geminiKey, unifiedEvents);
      set({ aiReport: report, isAnalyzing: false });
    } catch (err) {
      set({ isAnalyzing: false });
      throw err;
    }
  },

  clearAIReport: () => set({ aiReport: null }),

  // --- Recording Actions Implementation ---
  setIsRecording: async (recording: boolean) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ is_recording: recording });
      } catch (err) {
        console.error('[Telemetry Store] Failed to save recording setting:', err);
      }
    }
    set({ isRecording: recording });
  },

  loadRecordingState: async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await chrome.storage.local.get('is_recording');
        if (result.is_recording !== undefined) {
          set({ isRecording: result.is_recording });
        }
      } catch (err) {
        console.error('[Telemetry Store] Failed to load recording setting:', err);
      }
    }
  }
}));
