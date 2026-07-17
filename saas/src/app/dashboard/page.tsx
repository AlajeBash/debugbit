'use client';

import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Terminal, 
  Globe, 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  Code2, 
  Database,
  Lock,
  Compass,
  LayoutDashboard,
  Users,
  CreditCard,
  Key,
  Settings,
  Share2,
  MessageSquare,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Filter,
  Check,
  Send,
  Flag
} from 'lucide-react';
import Link from 'next/link';

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

// --- High Fidelity Mock Telemetry Data ---

const MOCK_SESSIONS: MockSession[] = [
  {
    id: 'f87a329c-8b21-4cf1-97ba-a09e13d964f1',
    url: 'https://checkout.acmefootwear.io/payment',
    startTime: '2026-07-17T20:45:10Z',
    status: 'failed',
    tabId: 104,
    project: 'Acme Production Frontend',
    resolutionStatus: 'unresolved',
    assignee: 'Alex Rivera'
  },
  {
    id: 'b11d9a24-7cc9-411a-8bde-d510287ffab2',
    url: 'https://admin.acmefootwear.io/analytics',
    startTime: '2026-07-17T20:30:15Z',
    status: 'completed',
    tabId: 104,
    project: 'Acme Production Frontend',
    resolutionStatus: 'resolved',
    assignee: 'Sarah Chen'
  },
  {
    id: 'a059bc1a-61f2-49da-bf32-e09211aa128d',
    url: 'https://checkout.acmefootwear.io/cart',
    startTime: '2026-07-17T20:15:00Z',
    status: 'active',
    tabId: 104,
    project: 'Acme Production Frontend',
    resolutionStatus: 'investigating'
  }
];

const MOCK_EVENTS: Record<string, TelemetryEvent[]> = {
  'f87a329c-8b21-4cf1-97ba-a09e13d964f1': [
    {
      id: 'evt-1',
      category: 'performance',
      timestamp: '20:45:11',
      metricName: 'First Contentful Paint (FCP)',
      value: 840
    },
    {
      id: 'evt-2',
      category: 'performance',
      timestamp: '20:45:12',
      metricName: 'Largest Contentful Paint (LCP)',
      value: 1250
    },
    {
      id: 'evt-3',
      category: 'console',
      level: 'info',
      timestamp: '20:45:12',
      message: '[Stripe SDK] Payment listener initialized.'
    },
    {
      id: 'evt-4',
      category: 'network',
      timestamp: '20:45:13',
      method: 'GET',
      url: 'https://api.acmefootwear.io/v1/cart/items',
      status: 200,
      duration: 140
    },
    {
      id: 'evt-5',
      category: 'console',
      level: 'warn',
      timestamp: '20:45:14',
      message: '[React] Deprecated findDOMNode lifecycle used inside stripe-button-wrapper.'
    },
    {
      id: 'evt-6',
      category: 'network',
      timestamp: '20:45:15',
      method: 'POST',
      url: 'https://api.acmefootwear.io/v1/payments/charge',
      status: 500,
      duration: 1840
    },
    {
      id: 'evt-7',
      category: 'console',
      level: 'error',
      timestamp: '20:45:16',
      message: 'Uncaught TypeError: Cannot read properties of undefined (reading "charge_id") at Checkout.onSuccess (checkout-bundle.esm.js:143:21)'
    }
  ],
  'b11d9a24-7cc9-411a-8bde-d510287ffab2': [
    {
      id: 'evt-8',
      category: 'performance',
      timestamp: '20:30:16',
      metricName: 'LCP',
      value: 2300
    },
    {
      id: 'evt-9',
      category: 'network',
      timestamp: '20:30:17',
      method: 'GET',
      url: 'https://api.acmefootwear.io/v1/analytics/conversions',
      status: 200,
      duration: 320
    },
    {
      id: 'evt-10',
      category: 'console',
      level: 'log',
      timestamp: '20:30:18',
      message: '[Analytics Dashboard] Core metrics refreshed successfully.'
    }
  ],
  'a059bc1a-61f2-49da-bf32-e09211aa128d': [
    {
      id: 'evt-11',
      category: 'performance',
      timestamp: '20:15:01',
      metricName: 'FCP',
      value: 710
    },
    {
      id: 'evt-12',
      category: 'network',
      timestamp: '20:15:02',
      method: 'GET',
      url: 'https://api.acmefootwear.io/v1/cart/items',
      status: 200,
      duration: 120
    }
  ]
};

const MOCK_REPORTS: Record<string, string> = {
  'f87a329c-8b21-4cf1-97ba-a09e13d964f1': `# 🔍 ROOT-CAUSE DIAGNOSIS REPORT

### 🚨 Primary Issue Detected
A critical JavaScript **Runtime Exception (TypeError)** occurred during the post-payment submission phase, interrupting client-side state resolution.

---

### 🧱 Detailed Chain of Events

1. **Payment Request Dispatched**: A \`POST\` call to \`https://api.acmefootwear.io/v1/payments/charge\` was executed.
2. **Server-Side API failure**: The payment endpoint completed with a **500 Internal Server Error** status after **1,840ms** of execution.
3. **Improper Error Handling**: The client-side controller (\`Checkout.onSuccess\`) assumed a successful response payload layout. It attempted to unpack \`response.data.charge_id\` without checking the underlying HTTP code or structure.
4. **Crash**: This triggered an uncaught exception:
   \`\`\`javascript
   Uncaught TypeError: Cannot read properties of undefined (reading "charge_id")
   \`\`\`

---

### 🛠️ Code Resolution

We need to add strong status checks and optional chaining (\`?.\`) within the payment handler:

\`\`\`diff
- Checkout.onSuccess = (response) => {
-   const chargeId = response.data.charge_id;
-   showSuccessModal(chargeId);
- }
+ Checkout.onSuccess = (response) => {
+   if (!response || response.status !== 200) {
+     console.error('[Checkout] Charge endpoint failed or returned corrupt payload.');
+     showErrorNotification('Payment processing failed. Please try again.');
+     return;
+   }
+   const chargeId = response.data?.charge_id;
+   if (chargeId) {
+     showSuccessModal(chargeId);
+   } else {
+     showErrorNotification('Transaction approved but transaction reference was missing.');
+   }
+ }
\`\`\`
`,
  'b11d9a24-7cc9-411a-8bde-d510287ffab2': `# 🔍 PERFORMANCE OPTIMIZATION AUDIT

The session registered a high **Largest Contentful Paint (LCP)** of **2.3 seconds**, which exceeds Core Web Vitals recommended standards (< 1.2s).

---

### 🐢 Primary Bottlenecks Found

1. **Uncompressed Analytics Payload**: The \`/v1/analytics/conversions\` endpoint response was uncompressed (gzip was not enabled) returning **3.2MB** of raw JSON telemetry.
2. **Synchronous Chart Script Parsing**: Visual layouts were blocked waiting for heavy dashboard scripts to fetch and mount.

---

### ⚡ Proposed Fixes

Enable Gzip / Brotli compression inside Next.js config or backend proxy, and lazy-load charts:

\`\`\`javascript
// next.config.js
module.exports = {
  compress: true, // Enable gzip compression out-of-the-box
}
\`\`\`
`,
  'a059bc1a-61f2-49da-bf32-e09211aa128d': '# ⚙️ ANALYSIS SESSION IN PROGRESS\n\nNo errors or core failures have been logged in this session yet. Continue browsing or check back shortly.'
};

const INITIAL_COMMENTS: Record<string, Comment[]> = {
  'f87a329c-8b21-4cf1-97ba-a09e13d964f1': [
    {
      id: 'com-1',
      author: 'Alex Rivera',
      avatar: 'AR',
      text: 'I can confirm this crash is happening on production for roughly 4% of checkout intents. Investigating the Stripe logs now.',
      timestamp: '10 mins ago'
    },
    {
      id: 'com-2',
      author: 'Sarah Chen',
      avatar: 'SC',
      text: 'Ah, the charge endpoint is throwing 500 when Stripe card authentication is rejected. We definitely need the optional chaining fix.',
      timestamp: '5 mins ago'
    }
  ]
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'team' | 'billing' | 'keys'>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(MOCK_SESSIONS[0].id);
  const [filterType, setFilterType] = useState<'all' | 'errors' | 'network' | 'logs'>('all');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collaboration states
  const [sessionsList, setSessionsList] = useState<MockSession[]>(MOCK_SESSIONS);
  const [comments, setComments] = useState<Record<string, Comment[]>>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const currentSession = sessionsList.find(s => s.id === selectedSessionId) || sessionsList[0];
  const allSessionEvents = MOCK_EVENTS[selectedSessionId] || [];

  // Filter logs based on search & filter panel
  const filteredEvents = allSessionEvents.filter(evt => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchMsg = evt.message?.toLowerCase().includes(query);
      const matchUrl = evt.url?.toLowerCase().includes(query);
      const matchMetric = evt.metricName?.toLowerCase().includes(query);
      if (!matchMsg && !matchUrl && !matchMetric) return false;
    }

    // Apply quick filters
    if (filterType === 'errors') {
      return evt.level === 'error' || evt.level === 'exception' || (evt.category === 'network' && evt.status >= 400);
    }
    if (filterType === 'network') {
      return evt.category === 'network';
    }
    if (filterType === 'logs') {
      return evt.category === 'console';
    }
    return true;
  });

  const triggerAIGateway = () => {
    setIsGeneratingReport(true);
    setAiReport(null);
    
    setTimeout(() => {
      setAiReport(MOCK_REPORTS[selectedSessionId] || 'No diagnostic reports generated.');
      setIsGeneratingReport(false);
    }, 1500);
  };

  const addComment = () => {
    if (!newCommentText.trim()) return;
    const currentSessionComments = comments[selectedSessionId] || [];
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      author: 'Lead Architect (You)',
      avatar: 'LA',
      text: newCommentText,
      timestamp: 'Just now'
    };

    setComments({
      ...comments,
      [selectedSessionId]: [...currentSessionComments, newComment]
    });
    setNewCommentText('');
  };

  const toggleResolutionStatus = (status: MockSession['resolutionStatus']) => {
    setSessionsList(prev => 
      prev.map(s => s.id === selectedSessionId ? { ...s, resolutionStatus: status } : s)
    );
  };

  const copyShareLink = () => {
    const shareLink = `https://debugbit.io/share/session/${selectedSessionId}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const triggerExport = (format: string) => {
    setExportSuccess(`Successfully compiled and exported report as ${format}!`);
    setTimeout(() => setExportSuccess(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-950 overflow-hidden font-sans select-none text-dark-100">
      
      {/* 1. Header Bar */}
      <header className="h-14 border-b border-dark-900 bg-dark-950/90 px-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1.5 hover:bg-dark-900 rounded-lg text-dark-400 hover:text-white transition duration-200">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-5 w-px bg-dark-900" />
          <div className="flex items-center gap-2">
            <div className="bg-brand-600/10 border border-brand-500/20 p-1.5 rounded-lg">
              <Brain className="h-4 w-4 text-brand-400" />
            </div>
            <span className="font-extrabold text-[11px] tracking-wider uppercase text-white font-display">
              DebugBit Enterprise SaaS
            </span>
          </div>
          <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            v2.0
          </span>
        </div>

        {/* Sync & Project Key Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-dark-400 font-mono bg-dark-900/60 border border-dark-800/80 px-3 py-1.5 rounded-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gateway: <span className="text-white font-semibold uppercase">Connected</span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-dark-400 font-mono bg-dark-900/60 border border-dark-800/80 px-3 py-1.5 rounded-xl">
            <Lock className="h-3 w-3 text-brand-400" />
            Project Key: <span className="text-white font-semibold">acme_frontend</span>
          </div>
        </div>
      </header>

      {/* 2. Top-level Workspace Nav Toggles */}
      <div className="h-11 border-b border-dark-900 bg-dark-950/40 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 h-11 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'overview' 
                ? 'text-brand-400 border-brand-500' 
                : 'text-dark-400 border-transparent hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Workspace Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`px-4 h-11 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'sessions' 
                ? 'text-brand-400 border-brand-500' 
                : 'text-dark-400 border-transparent hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Sessions Inspector
          </button>

          <button 
            onClick={() => setActiveTab('team')}
            className={`px-4 h-11 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'team' 
                ? 'text-brand-400 border-brand-500' 
                : 'text-dark-400 border-transparent hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Team Workspaces
          </button>

          <button 
            onClick={() => setActiveTab('billing')}
            className={`px-4 h-11 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'billing' 
                ? 'text-brand-400 border-brand-500' 
                : 'text-dark-400 border-transparent hover:text-white'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Stripe Billing
          </button>

          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-4 h-11 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'keys' 
                ? 'text-brand-400 border-brand-500' 
                : 'text-dark-400 border-transparent hover:text-white'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            Project Keys
          </button>
        </div>

        {/* Global Notifications Mock Center */}
        <div className="flex items-center gap-2 text-[10px] text-dark-500 font-mono">
          Novu Alerts: <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-1.5 py-0.2 rounded font-bold">3 Active</span>
        </div>
      </div>

      {/* 3. Tab Rendering Router */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ==================================================== */}
        {/* TAB 1: WORKSPACE OVERVIEW                            */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-950/10">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-dark-900/30 border border-dark-900 p-5 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-dark-500">Active Synced Sessions</span>
                <span className="text-3xl font-extrabold text-white">4,812</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold mt-1">
                  +12.4% <span className="text-dark-500 font-normal">vs last week</span>
                </span>
              </div>

              <div className="bg-dark-900/30 border border-dark-900 p-5 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-dark-500">Avg Root Cause Latency</span>
                <span className="text-3xl font-extrabold text-brand-300">1,840ms</span>
                <span className="text-[10px] text-brand-400 flex items-center gap-1 font-mono font-bold mt-1">
                  Gemini Flash <span className="text-dark-500 font-normal">response speed</span>
                </span>
              </div>

              <div className="bg-dark-900/30 border border-dark-900 p-5 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-dark-500">Unresolved Issues</span>
                <span className="text-3xl font-extrabold text-red-400">14</span>
                <span className="text-[10px] text-red-500 flex items-center gap-1 font-mono font-bold mt-1">
                  2 Critical <span className="text-dark-500 font-normal">failures blocking cart</span>
                </span>
              </div>

              <div className="bg-dark-900/30 border border-dark-900 p-5 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-dark-500">Stripe Ingestion Limit</span>
                <span className="text-3xl font-extrabold text-white">94%</span>
                <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono font-bold mt-1">
                  Pro Tier <span className="text-dark-500 font-normal">approaching quota limits</span>
                </span>
              </div>
            </div>

            {/* Performance Visual Telemetry & Core Web Vitals Chart */}
            <div className="grid grid-cols-3 gap-6">
              
              {/* Analytics Section */}
              <div className="bg-dark-900/20 border border-dark-900 p-5 rounded-2xl col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-400" />
                    Core Web Vitals Ingestion Rates (Last 24h)
                  </h3>
                  <span className="text-[10px] text-dark-400 font-mono">PostHog Tracking Active</span>
                </div>

                {/* SVG Mock Graphs */}
                <div className="h-44 w-full bg-dark-950/60 border border-dark-900 rounded-xl relative overflow-hidden flex items-end px-4 pb-2">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,80 Q20,30 40,65 T80,10 T100,50 L100,100 L0,100 Z" fill="url(#brandGradient)" opacity="0.15" />
                    <path d="M0,80 Q20,30 40,65 T80,10 T100,50" fill="none" stroke="#a78bfa" strokeWidth="2" />
                    <defs>
                      <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute left-4 top-4 flex items-center gap-4 text-[10px] font-mono">
                    <span className="flex items-center gap-1.5 text-brand-300">
                      <span className="h-2 w-2 rounded-full bg-brand-400" />
                      LCP Load: ~1.2s
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      FCP Load: ~640ms
                    </span>
                  </div>

                  <div className="w-full flex justify-between text-[8px] text-dark-500 font-mono mt-auto">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                </div>
              </div>

              {/* Sentry Logs Container */}
              <div className="bg-dark-900/20 border border-dark-900 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    Live Sentry Stream
                  </h3>
                  <span className="text-[10px] text-red-400 font-mono animate-pulse">Live</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[160px]">
                  <div className="bg-red-500/[0.02] border border-red-500/10 p-2.5 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-red-400 font-bold">Uncaught TypeError</span>
                      <span className="text-dark-500">2 mins ago</span>
                    </div>
                    <span className="text-[10px] font-mono text-dark-300 truncate">Cannot read properties of undefined...</span>
                  </div>

                  <div className="bg-red-500/[0.02] border border-red-500/10 p-2.5 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-red-400 font-bold">NetworkError (500)</span>
                      <span className="text-dark-500">14 mins ago</span>
                    </div>
                    <span className="text-[10px] font-mono text-dark-300 truncate">POST /payments/charge failed...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Guide */}
            <div className="bg-dark-900/10 border border-dark-900/50 p-6 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure your Chrome Extension Client</h4>
                  <p className="text-[10px] text-dark-400 max-w-xl">
                    To start receiving real-time logs inside this cloud workspace, download our Chrome Extension, open Settings, and drop your Project API Key inside!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('keys')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white rounded-xl transition duration-150"
              >
                Get API Key
              </button>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: SESSIONS TIMELINE INSPECTOR                   */}
        {/* ==================================================== */}
        {activeTab === 'sessions' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT SIDEBAR: Synced Sessions list */}
            <aside className="w-72 border-r border-dark-900 bg-dark-950 flex flex-col shrink-0">
              <div className="p-4 border-b border-dark-900 flex items-center justify-between">
                <h2 className="text-[10px] uppercase font-bold tracking-wider text-dark-400 flex items-center gap-2">
                  <LayoutDashboard className="h-3.5 w-3.5 text-brand-400" />
                  Synced Sessions
                </h2>
                <span className="text-[9px] bg-dark-900 px-2 py-0.5 border border-dark-800 rounded-full font-mono font-bold text-dark-300">
                  {sessionsList.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {sessionsList.map((sess) => {
                  const isSelected = sess.id === selectedSessionId;
                  return (
                    <button
                      key={sess.id}
                      onClick={() => {
                        setSelectedSessionId(sess.id);
                        setAiReport(null); // Reset report view for new session
                      }}
                      className={`w-full text-left p-3 rounded-xl transition duration-200 border flex flex-col gap-1.5 group ${
                        isSelected 
                          ? 'bg-brand-600/10 border-brand-500/30' 
                          : 'bg-dark-900/20 border-transparent hover:bg-dark-900/40 hover:border-dark-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-dark-400 font-semibold">
                          Session #{sess.id.slice(0, 8)}
                        </span>
                        <span className={`text-[8px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                          sess.status === 'failed' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : sess.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}>
                          {sess.status}
                        </span>
                      </div>

                      <span className="text-white text-xs font-bold truncate group-hover:text-brand-300 transition duration-150 flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-dark-400" />
                        {sess.url.replace('https://', '')}
                      </span>

                      <div className="flex items-center justify-between text-[9px] text-dark-500 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span>Tab ID: {sess.tabId}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* MIDDLE CONTAINER: Telemetry timeline logs list */}
            <section className="flex-1 border-r border-dark-900 bg-dark-950/40 flex flex-col overflow-hidden">
              
              {/* Filters Bar */}
              <div className="p-4 border-b border-dark-900 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-400" />
                    Session Telemetry Timeline
                  </h3>
                  <div className="relative max-w-[200px] w-full">
                    <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-dark-500" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-dark-900 border border-dark-800 text-[10px] pl-8 pr-3 py-2 rounded-lg text-dark-200 outline-none w-full focus:border-brand-500/50"
                    />
                  </div>
                </div>

                {/* Quick Toggle Selectors & Collaboration Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {(['all', 'errors', 'network', 'logs'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFilterType(filter)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition ${
                          filterType === filter 
                            ? 'bg-brand-600 text-white' 
                            : 'bg-dark-900 text-dark-400 border border-dark-800 hover:border-dark-700 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Resolution status selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-dark-500 font-mono font-bold">Status:</span>
                    <select 
                      value={currentSession.resolutionStatus}
                      onChange={(e) => toggleResolutionStatus(e.target.value as any)}
                      className="bg-dark-900 border border-dark-850 rounded-lg text-[10px] px-2.5 py-1.5 text-white font-bold outline-none cursor-pointer focus:border-brand-500/50"
                    >
                      <option value="unresolved">🔴 Unresolved</option>
                      <option value="investigating">🟡 Investigating</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="archived">⚪ Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Core Logs Viewer */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredEvents.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center p-12">
                    <ShieldAlert className="h-10 w-10 text-dark-600 mb-3" />
                    <h4 className="font-bold text-sm text-dark-200">No telemetry logs found</h4>
                    <p className="text-[10px] text-dark-500 mt-1 max-w-[200px]">
                      No events match your current filter settings or query.
                    </p>
                  </div>
                ) : (
                  filteredEvents.map((evt) => (
                    <div 
                      key={evt.id} 
                      className={`p-3 rounded-xl border flex flex-col gap-2 transition duration-150 bg-dark-900/40 border-dark-900/60 ${
                        evt.level === 'error' || evt.level === 'exception' || (evt.status && evt.status >= 400)
                          ? 'border-red-500/20 hover:border-red-500/30 bg-red-500/[0.01]' 
                          : 'hover:border-dark-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            evt.category === 'console'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : evt.category === 'network'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {evt.category}
                          </span>
                          <span className="text-[10px] font-mono text-dark-400">{evt.timestamp}</span>
                        </div>

                        {/* Level / Status specific indicators */}
                        {evt.category === 'console' && evt.level && (
                          <span className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded font-mono ${
                            evt.level === 'error' || evt.level === 'exception'
                              ? 'text-red-400'
                              : evt.level === 'warn'
                                ? 'text-amber-400'
                                : 'text-dark-400'
                          }`}>
                            {evt.level}
                          </span>
                        )}

                        {evt.category === 'network' && evt.status !== undefined && (
                          <span className={`text-[9px] font-mono font-bold ${
                            evt.status >= 400 ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            HTTP {evt.status}
                          </span>
                        )}
                      </div>

                      {/* Core Event Message Payload */}
                      {evt.category === 'console' && (
                        <div className="text-[11px] font-mono text-dark-100 break-all leading-relaxed whitespace-pre-wrap">
                          {evt.message}
                        </div>
                      )}

                      {evt.category === 'network' && (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[11px] font-mono text-white font-bold break-all">
                              <span className="text-brand-400 font-extrabold mr-1.5">{evt.method}</span>
                              {evt.url}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-dark-400 whitespace-nowrap">{evt.duration}ms</span>
                        </div>
                      )}

                      {evt.category === 'performance' && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-dark-200">{evt.metricName}</span>
                          <span className="text-[11px] font-mono font-extrabold text-brand-300">{evt.value}ms</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* RIGHT COLUMN: AI Diagnostic & Teammate comments */}
            <aside className="w-[420px] bg-dark-950 flex flex-col shrink-0 overflow-hidden">
              
              {/* Header Panel */}
              <div className="p-4 border-b border-dark-900 flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] uppercase font-bold tracking-wider text-dark-400 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
                    Secure AI Diagnostic Engine
                  </h2>
                  
                  {/* Share button */}
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="p-1.5 hover:bg-dark-900 border border-dark-850 rounded-lg text-dark-400 hover:text-white transition"
                    title="Share Session"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Provider Select Cards */}
                <div className="grid grid-cols-3 gap-2">
                  {(['gemini', 'openai', 'anthropic'] as const).map((prov) => {
                    const isSelected = prov === selectedProvider;
                    return (
                      <button
                        key={prov}
                        onClick={() => setSelectedProvider(prov)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition duration-150 ${
                          isSelected
                            ? 'bg-brand-600/10 border-brand-500/50 text-white'
                            : 'bg-dark-900 border-dark-850 text-dark-400 hover:border-dark-800 hover:text-dark-200'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                          {prov === 'gemini' ? 'Gemini' : prov === 'openai' ? 'OpenAI' : 'Claude'}
                        </span>
                        <span className="text-[8px] text-dark-500">
                          {prov === 'gemini' ? '2.5 Flash' : prov === 'openai' ? 'gpt-4o' : '3.5 Sonnet'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Generate Trigger Action */}
                <div className="flex gap-2">
                  <button
                    onClick={triggerAIGateway}
                    disabled={isGeneratingReport}
                    className={`flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-900 disabled:text-dark-600 text-xs font-bold text-white rounded-xl transition duration-200 flex items-center justify-center gap-2 glow-btn ${
                      isGeneratingReport ? 'animate-pulse cursor-not-allowed' : ''
                    }`}
                  >
                    <Brain className={`h-3.5 w-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                    {isGeneratingReport ? 'Executing Cloud Handshake...' : 'Analyze Active Session'}
                  </button>

                  {/* Export dropdown mock */}
                  {aiReport && (
                    <div className="relative group">
                      <button 
                        className="py-2.5 px-3 bg-dark-900 border border-dark-850 hover:border-dark-700 text-dark-300 rounded-xl transition flex items-center justify-center"
                        title="Export Report"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 bottom-full mb-2 w-36 bg-dark-900 border border-dark-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-40">
                        <button onClick={() => triggerExport('Markdown')} className="w-full text-left text-[10px] font-bold p-2 hover:bg-dark-800 rounded-lg text-white">Export Markdown</button>
                        <button onClick={() => triggerExport('PDF')} className="w-full text-left text-[10px] font-bold p-2 hover:bg-dark-800 rounded-lg text-white">Export PDF</button>
                        <button onClick={() => triggerExport('Jira')} className="w-full text-left text-[10px] font-bold p-2 hover:bg-dark-800 rounded-lg text-white">Push to Jira</button>
                        <button onClick={() => triggerExport('Linear')} className="w-full text-left text-[10px] font-bold p-2 hover:bg-dark-800 rounded-lg text-white">Push to Linear</button>
                      </div>
                    </div>
                  )}
                </div>

                {exportSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] p-2 rounded-lg text-center font-mono">
                    {exportSuccess}
                  </div>
                )}
              </div>

              {/* Diagnosis Report Output Scroll Frame & Comments Toggle */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 bg-dark-950 border-b border-dark-900">
                  {aiReport ? (
                    <div className="prose prose-invert text-xs text-dark-200 leading-relaxed font-sans max-w-none space-y-4">
                      {/* Custom render markdown nodes */}
                      {aiReport.split('\n').map((line, idx) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={idx} className="text-base font-extrabold text-white pt-2 border-b border-dark-900 pb-2">{line.replace('# ', '')}</h1>;
                        }
                        if (line.startsWith('## ')) {
                          return <h2 key={idx} className="text-xs font-bold text-brand-400 uppercase tracking-wider pt-3">{line.replace('## ', '')}</h2>;
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={idx} className="text-xs font-semibold text-white pt-2">{line.replace('### ', '')}</h3>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={idx} className="ml-4 list-disc pl-1 text-dark-300">{line.replace('- ', '')}</li>;
                        }
                        if (line.startsWith('```javascript') || line.startsWith('```diff') || line.startsWith('```')) {
                          return null;
                        }
                        if (line.startsWith('+ ') && !line.includes('response')) {
                          return <div key={idx} className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-mono rounded text-[10px]">{line}</div>;
                        }
                        if (line.startsWith('- ') && !line.includes('Checkout')) {
                          return <div key={idx} className="bg-red-500/10 text-red-400 px-2 py-0.5 font-mono rounded text-[10px]">{line}</div>;
                        }
                        if (line.trim() === '---') {
                          return <hr key={idx} className="border-dark-900 my-4" />;
                        }
                        return <p key={idx} className="text-dark-300 leading-relaxed text-[11px]">{line}</p>;
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center p-8 text-dark-500">
                      <Brain className="h-10 w-10 text-dark-800 mb-3" />
                      <h4 className="font-bold text-xs text-dark-400 uppercase tracking-widest">Awaiting Analysis</h4>
                      <p className="text-[10px] text-dark-500 mt-2 max-w-[220px] leading-relaxed">
                        Choose your secure cloud model and click "Analyze Active Session" above to compile a root-cause diagnostic report.
                      </p>
                    </div>
                  )}
                </div>

                {/* Collaboration Commenting Panel */}
                <div className="h-60 flex flex-col bg-dark-950/80">
                  <div className="p-3 border-b border-dark-900 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-brand-400" />
                      Teammate Comments
                    </span>
                    <span className="text-[9px] bg-dark-900 border border-dark-850 px-2 py-0.5 rounded-full text-dark-400">
                      {(comments[selectedSessionId] || []).length} threads
                    </span>
                  </div>

                  {/* Comments list */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {(comments[selectedSessionId] || []).length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center text-[10px] text-dark-600">
                        No comments yet. Leave a note below to align with your team.
                      </div>
                    ) : (
                      (comments[selectedSessionId] || []).map((com) => (
                        <div key={com.id} className="flex gap-2.5 items-start">
                          <div className="h-6 w-6 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center text-[9px] font-extrabold shrink-0">
                            {com.avatar}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-white">{com.author}</span>
                              <span className="text-[8px] text-dark-500 font-mono">{com.timestamp}</span>
                            </div>
                            <p className="text-[10px] text-dark-300 break-words leading-normal bg-dark-900/40 p-2 border border-dark-900 rounded-xl mt-1">{com.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="p-2 border-t border-dark-900 flex gap-2">
                    <input 
                      type="text"
                      placeholder="Ask Alex or ping Sarah..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addComment()}
                      className="flex-1 bg-dark-900 border border-dark-850 rounded-xl text-[10px] px-3 py-2 text-dark-200 outline-none focus:border-brand-500/50"
                    />
                    <button 
                      onClick={addComment}
                      className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition flex items-center justify-center"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </aside>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: TEAM WORKSPACES                               */}
        {/* ==================================================== */}
        {activeTab === 'team' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-dark-900 pb-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-400" />
                  Teammates & Role Delegations
                </h3>
                <p className="text-xs text-dark-400">Configure role clearances, issue assignments, and invite developers to collaborate.</p>
              </div>

              <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                Invite Developer
              </button>
            </div>

            {/* Teammates List */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900/30 border border-dark-900 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-extrabold">
                    LA
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Lead Architect (You)</span>
                    <span className="text-[10px] text-dark-500">owner@acme.com</span>
                  </div>
                </div>
                <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Owner
                </span>
              </div>

              <div className="bg-dark-900/30 border border-dark-900 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-extrabold">
                    SC
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Sarah Chen</span>
                    <span className="text-[10px] text-dark-500">sarah@acme.com</span>
                  </div>
                </div>
                <span className="bg-dark-900 border border-dark-800 text-dark-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>

              <div className="bg-dark-900/30 border border-dark-900 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-extrabold">
                    AR
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Alex Rivera</span>
                    <span className="text-[10px] text-dark-500">alex@acme.com</span>
                  </div>
                </div>
                <span className="bg-dark-900 border border-dark-800 text-dark-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Developer
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: STRIPE BILLING                                */}
        {/* ==================================================== */}
        {activeTab === 'billing' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-dark-900 pb-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-400" />
                  Stripe Subscription Management
                </h3>
                <p className="text-xs text-dark-400">Scale your cloud capacity, billing cycles, and secure credit cards.</p>
              </div>
              <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-3 py-1 rounded-xl">
                Active Tier: Pro Monthly
              </span>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-dark-900/20 border border-dark-900 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-dark-400">Community</span>
                  <span className="text-2xl font-extrabold text-white">Free</span>
                </div>
                <ul className="text-[10px] text-dark-400 space-y-2 flex-1">
                  <li>• Local-first core debugger</li>
                  <li>• Bring-Your-Own-API-Keys (BYOK)</li>
                  <li>• Max 3 days log retention</li>
                </ul>
                <button className="w-full py-2 bg-dark-900 border border-dark-800 text-dark-400 text-xs font-bold rounded-xl cursor-not-allowed">Downgrade</button>
              </div>

              <div className="bg-brand-600/[0.04] border-2 border-brand-500/40 p-5 rounded-2xl flex flex-col gap-4 relative">
                <span className="absolute -top-3 right-4 bg-brand-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-brand-400">Pro Developer</span>
                  <span className="text-2xl font-extrabold text-white">$19<span className="text-xs font-normal text-dark-400">/mo</span></span>
                </div>
                <ul className="text-[10px] text-dark-300 space-y-2 flex-1">
                  <li>• Unlimited cloud sync sessions</li>
                  <li>• Extended 30 days log retention</li>
                  <li>• 100 free AI diagnostic credits /mo</li>
                </ul>
                <button className="w-full py-2 bg-brand-600/10 border border-brand-500/20 text-brand-400 text-xs font-bold rounded-xl hover:bg-brand-600/20 transition">Manage Subscription</button>
              </div>

              <div className="bg-dark-900/20 border border-dark-900 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-dark-400">Engineering Team</span>
                  <span className="text-2xl font-extrabold text-white">$79<span className="text-xs font-normal text-dark-400">/mo</span></span>
                </div>
                <ul className="text-[10px] text-dark-400 space-y-2 flex-1">
                  <li>• Everything in Pro, for up to 15 seats</li>
                  <li>• Shared team comment threads</li>
                  <li>• One-click export to Jira/Linear/GitHub</li>
                </ul>
                <button className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition">Upgrade Team</button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: PROJECT API KEYS                              */}
        {/* ==================================================== */}
        {activeTab === 'keys' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-dark-900 pb-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-brand-400" />
                  Project API Key Tokens
                </h3>
                <p className="text-xs text-dark-400">Authenticate client-side Chrome Extensions pushing synchronized telemetry records.</p>
              </div>
            </div>

            <div className="bg-dark-900/30 border border-dark-900 p-5 rounded-2xl flex flex-col gap-4 max-w-2xl">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-dark-400">Acme Production Client API Key</span>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 bg-dark-950 px-4 py-3 border border-dark-850 rounded-xl font-mono text-xs text-brand-300 select-all truncate">
                    db_live_aq817ndbA9n2mWWELo71MdD99XxKp2OQTHqAY_Kajq2gzKCgczZQ
                  </div>
                  <button className="px-4 py-3 bg-dark-900 hover:bg-dark-800 border border-dark-800 hover:border-dark-700 text-xs font-bold text-white rounded-xl transition">
                    Rotate Key
                  </button>
                </div>
              </div>

              <div className="p-4 bg-red-500/[0.01] border border-red-500/10 rounded-xl flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Zero-Trust Key Warning</span>
                  <p className="text-[9px] text-dark-400 leading-normal">
                    This key grants write-only ingestion privileges to insert sessions, logs, and Web Vitals into your database. Never expose your Supabase secret service keys inside client scripts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Public Sharing Link Builder Modal Frame */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 w-full max-w-md p-5 rounded-2xl flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="h-4 w-4 text-brand-400" />
                Generate Public Share Link
              </h4>
              <button onClick={() => setShowShareModal(false)} className="text-dark-500 hover:text-white font-bold transition">×</button>
            </div>
            
            <p className="text-[10px] text-dark-400 leading-normal">
              Public share links bypass active authentication checks, letting you send diagnostic results directly to clients, QA engineers, or freelance contract builders.
            </p>

            <div className="flex gap-2">
              <div className="flex-1 bg-dark-950 p-2.5 border border-dark-850 rounded-xl font-mono text-[10px] text-dark-300 truncate">
                https://debugbit.io/share/session/{selectedSessionId}
              </div>
              <button 
                onClick={copyShareLink}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white rounded-xl transition flex items-center justify-center min-w-[80px]"
              >
                {isCopied ? <Check className="h-4 w-4" /> : 'Copy'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-dark-500 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Auto-redacting: Cookies, Authorization details, and password headers.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
