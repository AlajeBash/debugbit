'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import TelemetryStreamView from '@/components/dashboard/TelemetryStreamView';
import AiCorrelationView from '@/components/dashboard/AiCorrelationView';
import SettingsView from '@/components/dashboard/SettingsView';
import BillingView from '@/components/dashboard/BillingView';
import ChatConsole from '@/components/dashboard/ChatConsole';

// --- Types & Interfaces ---

interface MockSession {
  id: string;
  url: string;
  startTime: string;
  status: 'active' | 'completed' | 'failed';
  tabId: number;
  project: string;
  resolutionStatus: 'unresolved' | 'investigating' | 'resolved' | 'archived';
  assignee?: string;
}

interface TelemetryEvent {
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

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

// --- High Fidelity Initial Datasets ---

const INITIAL_SESSIONS: MockSession[] = [
  {
    id: 'f87a329c-8b21-4cf1-97ba-a09e13d964f1',
    url: 'https://checkout.acmefootwear.io/payment',
    startTime: '2026-07-20T14:45:10Z',
    status: 'failed',
    tabId: 104,
    project: 'Acme Production Frontend',
    resolutionStatus: 'unresolved',
    assignee: 'Alex Rivera'
  },
  {
    id: 'b11d9a24-7cc9-411a-8bde-d510287ffab2',
    url: 'https://admin.acmefootwear.io/analytics',
    startTime: '2026-07-20T14:30:15Z',
    status: 'completed',
    tabId: 104,
    project: 'Acme Production Frontend',
    resolutionStatus: 'resolved',
    assignee: 'Sarah Chen'
  },
  {
    id: 'a059bc1a-61f2-49da-bf32-e09211aa128d',
    url: 'https://checkout.acmefootwear.io/cart',
    startTime: '2026-07-20T14:15:00Z',
    status: 'active',
    tabId: 104,
    project: 'Acme Production Frontend',
    resolutionStatus: 'investigating'
  }
];

const INITIAL_EVENTS: Record<string, TelemetryEvent[]> = {
  'f87a329c-8b21-4cf1-97ba-a09e13d964f1': [
    {
      id: 'evt-1',
      category: 'performance',
      timestamp: '14:45:11',
      metricName: 'First Contentful Paint (FCP)',
      value: 840
    },
    {
      id: 'evt-2',
      category: 'performance',
      timestamp: '14:45:12',
      metricName: 'Largest Contentful Paint (LCP)',
      value: 1250
    },
    {
      id: 'evt-3',
      category: 'console',
      level: 'info',
      timestamp: '14:45:12',
      message: '[Stripe SDK] Payment listener initialized.'
    },
    {
      id: 'evt-4',
      category: 'network',
      timestamp: '14:45:13',
      method: 'GET',
      url: 'https://api.acmefootwear.io/v1/cart/items',
      status: 200,
      duration: 140
    },
    {
      id: 'evt-5',
      category: 'console',
      level: 'warn',
      timestamp: '14:45:14',
      message: '[React] Deprecated findDOMNode lifecycle used inside stripe-button-wrapper.'
    },
    {
      id: 'evt-6',
      category: 'network',
      timestamp: '14:45:15',
      method: 'POST',
      url: 'https://api.acmefootwear.io/v1/payments/charge',
      status: 500,
      duration: 1840
    },
    {
      id: 'evt-7',
      category: 'console',
      level: 'exception',
      timestamp: '14:45:16',
      message: 'Uncaught TypeError: Cannot read properties of undefined (reading "charge_id") at Checkout.onSuccess (checkout-bundle.esm.js:143:21)'
    }
  ],
  'b11d9a24-7cc9-411a-8bde-d510287ffab2': [
    {
      id: 'evt-8',
      category: 'performance',
      timestamp: '14:30:16',
      metricName: 'LCP',
      value: 2300
    },
    {
      id: 'evt-9',
      category: 'network',
      timestamp: '14:30:17',
      method: 'GET',
      url: 'https://api.acmefootwear.io/v1/analytics/conversions',
      status: 200,
      duration: 320
    },
    {
      id: 'evt-10',
      category: 'console',
      level: 'log',
      timestamp: '14:30:18',
      message: '[Analytics Dashboard] Core metrics refreshed successfully.'
    }
  ],
  'a059bc1a-61f2-49da-bf32-e09211aa128d': [
    {
      id: 'evt-11',
      category: 'performance',
      timestamp: '14:15:01',
      metricName: 'FCP',
      value: 710
    },
    {
      id: 'evt-12',
      category: 'network',
      timestamp: '14:15:02',
      method: 'GET',
      url: 'https://api.acmefootwear.io/v1/cart/items',
      status: 200,
      duration: 120
    }
  ]
};

const INITIAL_COMMENTS: Record<string, Comment[]> = {
  'f87a329c-8b21-4cf1-97ba-a09e13d964f1': [
    {
      id: 'com-1',
      author: 'Alex Rivera',
      avatar: 'AR',
      text: 'I can confirm this crash is happening on production for roughly 4% of checkout intents. Investigating Stripe API payloads.',
      timestamp: '10 mins ago'
    },
    {
      id: 'com-2',
      author: 'Sarah Chen',
      avatar: 'SC',
      text: 'Ah, the charge endpoint is throwing 500 when card balance is insufficient. We definitely need optional chaining on Checkout.',
      timestamp: '5 mins ago'
    }
  ]
};

export default function DashboardController() {
  const [activeTab, setActiveTab] = useState<string>('telemetry');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(INITIAL_SESSIONS[0].id);
  
  // Dynamic application state
  const [sessions, setSessions] = useState<MockSession[]>(INITIAL_SESSIONS);
  const [events, setEvents] = useState<Record<string, TelemetryEvent[]>>(INITIAL_EVENTS);
  const [comments, setComments] = useState<Record<string, Comment[]>>(INITIAL_COMMENTS);
  const [apiKey, setApiKey] = useState<string>('debugbit_dev_key_12345'); // Standard local developer API key
  
  // Real-Time Simulator toggle state
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // --- Real-Time Sync Polling from Chrome Extension ---
  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'success' && data.sessions && data.sessions.length > 0) {
          const liveSessionsList = data.sessions;
          
          setSessions(prevSessions => {
            const liveIds = new Set(liveSessionsList.map((s: any) => s.id));
            const filteredPrev = prevSessions.filter(s => !liveIds.has(s.id));
            return [...liveSessionsList, ...filteredPrev];
          });

          setEvents(prevEvents => {
            const nextEvents = { ...prevEvents };
            liveSessionsList.forEach((s: any) => {
              if (s.events) {
                nextEvents[s.id] = s.events;
              }
            });
            return nextEvents;
          });

          // Auto-disable mock event simulator and select the real synced session upon ingestion
          setIsSimulating(false);
          setSelectedSessionId(currentId => {
            const isMockSession = !currentId || 
                                  currentId === 'f87a329c-8b21-4cf1-97ba-a09e13d964f1' || 
                                  currentId === 'b11d9a24-7cc9-411a-8bde-d510287ffab2' || 
                                  currentId === 'a059bc1a-61f2-49da-bf32-e09211aa128d';
            if (isMockSession && liveSessionsList[0]?.id) {
              return liveSessionsList[0].id;
            }
            return currentId;
          });
        }
      } catch (err) {
        console.error('[Dashboard] Live sessions fetch failed:', err);
      }
    };

    fetchLiveSessions();
    const interval = setInterval(fetchLiveSessions, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- Live WebSocket Simulation Hook ---
  useEffect(() => {
    if (!isSimulating) return;

    const simulationInterval = setInterval(() => {
      // Pick a random session to pipe live events into
      const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
      const categories: ('console' | 'network' | 'performance')[] = ['console', 'network', 'performance'];
      const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const now = new Date();
      const timestampStr = now.toTimeString().split(' ')[0];

      let newEvent: TelemetryEvent;

      if (chosenCategory === 'console') {
        const consoleMessages = [
          '[React Hook] State compiled successfully in 12ms.',
          '[API Sync] Synchronizing cloud logging buffer...',
          '[Telemetry] Local store payload queued for background dispatch.',
          '[WDS] Hot Module Replacement active and watching.'
        ];
        newEvent = {
          id: `evt-sim-${Date.now()}`,
          category: 'console',
          level: 'log',
          timestamp: timestampStr,
          message: consoleMessages[Math.floor(Math.random() * consoleMessages.length)]
        };
      } else if (chosenCategory === 'network') {
        const urls = [
          'https://api.acmefootwear.io/v1/analytics/realtime',
          'https://api.acmefootwear.io/v1/user/settings',
          'https://api.acmefootwear.io/v1/sync/heartbeat'
        ];
        newEvent = {
          id: `evt-sim-${Date.now()}`,
          category: 'network',
          timestamp: timestampStr,
          method: 'GET',
          url: urls[Math.floor(Math.random() * urls.length)],
          status: Math.random() > 0.95 ? 500 : 200,
          duration: Math.floor(40 + Math.random() * 200)
        };
      } else {
        const metrics = ['First Input Delay (FID)', 'Cumulative Layout Shift (CLS)', 'Time to Interactive (TTI)'];
        newEvent = {
          id: `evt-sim-${Date.now()}`,
          category: 'performance',
          timestamp: timestampStr,
          metricName: metrics[Math.floor(Math.random() * metrics.length)],
          value: Math.floor(5 + Math.random() * 80)
        };
      }

      // Update events state log array
      setEvents(prev => ({
        ...prev,
        [randomSession.id]: [...(prev[randomSession.id] || []), newEvent]
      }));

    }, 4000);

    return () => clearInterval(simulationInterval);
  }, [isSimulating, sessions]);

  // --- Mutators & Handlers ---
  
  const generateNewKey = () => {
    const chars = 'abcdef0123456789';
    let randStr = '';
    for (let i = 0; i < 24; i++) {
      randStr += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(`db_sync_live_${randStr}`);
  };

  const addComment = (text: string) => {
    if (!selectedSessionId) return;
    const currentSessionComments = comments[selectedSessionId] || [];
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      author: 'Lead Architect (You)',
      avatar: 'LA',
      text: text,
      timestamp: 'Just now'
    };

    setComments(prev => ({
      ...prev,
      [selectedSessionId]: [...currentSessionComments, newComment]
    }));
  };

  const deleteComment = (commentId: string) => {
    if (!selectedSessionId) return;
    const currentSessionComments = comments[selectedSessionId] || [];
    setComments(prev => ({
      ...prev,
      [selectedSessionId]: currentSessionComments.filter(c => c.id !== commentId)
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-gray-100 overflow-hidden font-sans">
      {/* 1. Sidebar Nav */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Workspace Frame container */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* 2. Top-level Header controller */}
        <Header
          currentProject="Acme Production Frontend"
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
        />

        {/* 3. Render Viewports based on active navigation tab selection */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'telemetry' && (
            <TelemetryStreamView
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              setSelectedSessionId={setSelectedSessionId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'ai' && (
            <AiCorrelationView
              selectedSessionId={selectedSessionId}
              setSelectedSessionId={setSelectedSessionId}
              events={selectedSessionId ? events[selectedSessionId] : []}
              comments={selectedSessionId ? (comments[selectedSessionId] || []) : []}
              addComment={addComment}
              deleteComment={deleteComment}
            />
          )}

          {activeTab === 'keys' && (
            <SettingsView
              apiKey={apiKey}
              generateNewKey={generateNewKey}
            />
          )}

          {activeTab === 'billing' && (
            <BillingView />
          )}
        </main>
      </div>

      {/* Floating AI Copilot Console */}
      <ChatConsole />
    </div>
  );
}
