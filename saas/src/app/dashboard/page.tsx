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
  LayoutDashboard
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

// --- High Fidelity Mock Telemetry Data ---

const MOCK_SESSIONS: MockSession[] = [
  {
    id: 'f87a329c-8b21-4cf1-97ba-a09e13d964f1',
    url: 'https://checkout.acmefootwear.io/payment',
    startTime: '2026-07-17T20:45:10Z',
    status: 'failed',
    tabId: 104,
    project: 'Acme Production Frontend'
  },
  {
    id: 'b11d9a24-7cc9-411a-8bde-d510287ffab2',
    url: 'https://admin.acmefootwear.io/analytics',
    startTime: '2026-07-17T20:30:15Z',
    status: 'completed',
    tabId: 104,
    project: 'Acme Production Frontend'
  },
  {
    id: 'a059bc1a-61f2-49da-bf32-e09211aa128d',
    url: 'https://checkout.acmefootwear.io/cart',
    startTime: '2026-07-17T20:15:00Z',
    status: 'active',
    tabId: 104,
    project: 'Acme Production Frontend'
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
3. **Improper Error Handing**: The client-side controller (\`Checkout.onSuccess\`) assumed a successful response payload layout. It attempted to unpack \`response.data.charge_id\` without checking the underlying HTTP code or structure.
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

export default function Dashboard() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(MOCK_SESSIONS[0].id);
  const [filterType, setFilterType] = useState<'all' | 'errors' | 'network' | 'logs'>('all');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentSession = MOCK_SESSIONS.find(s => s.id === selectedSessionId) || MOCK_SESSIONS[0];
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

  return (
    <div className="flex-1 flex flex-col bg-dark-950 overflow-hidden font-sans select-none">
      {/* 1. Header Bar */}
      <header className="h-14 border-b border-dark-900 bg-dark-950/90 px-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
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
            Cloud
          </span>
        </div>

        {/* Sync & Project Key Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-dark-400 font-mono bg-dark-900/60 border border-dark-800/80 px-3 py-1.5 rounded-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gateway Status: <span className="text-white font-semibold uppercase">Online</span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-dark-400 font-mono bg-dark-900/60 border border-dark-800/80 px-3 py-1.5 rounded-xl">
            <Lock className="h-3 w-3 text-brand-400" />
            Project ID: <span className="text-white font-semibold">acme_frontend</span>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Sync Sessions list */}
        <aside className="w-72 border-r border-dark-900 bg-dark-950 flex flex-col shrink-0">
          <div className="p-4 border-b border-dark-900 flex items-center justify-between">
            <h2 className="text-[10px] uppercase font-bold tracking-wider text-dark-400 flex items-center gap-2">
              <LayoutDashboard className="h-3.5 w-3.5 text-brand-400" />
              Synced Sessions
            </h2>
            <span className="text-[9px] bg-dark-900 px-2 py-0.5 border border-dark-800 rounded-full font-mono font-bold text-dark-300">
              {MOCK_SESSIONS.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {MOCK_SESSIONS.map((sess) => {
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

        {/* MIDDLE COLUMN: Telemetry timeline logs list */}
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

            {/* Quick Toggle Selectors */}
            <div className="flex items-center gap-2">
              {(['all', 'errors', 'network', 'logs'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition ${
                    filterType === filter 
                      ? 'bg-brand-600 text-white' 
                      : 'bg-dark-900 text-dark-400 border border-dark-800 hover:border-dark-700 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
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

        {/* RIGHT COLUMN: AI Diagnostic analysis engine */}
        <aside className="w-[420px] bg-dark-950 flex flex-col shrink-0 overflow-hidden">
          
          {/* Header Panel */}
          <div className="p-4 border-b border-dark-900 flex flex-col gap-4 shrink-0">
            <h2 className="text-[10px] uppercase font-bold tracking-wider text-dark-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
              Secure AI Diagnostic Engine
            </h2>

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
            <button
              onClick={triggerAIGateway}
              disabled={isGeneratingReport}
              className={`w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-900 disabled:text-dark-600 text-xs font-bold text-white rounded-xl transition duration-200 flex items-center justify-center gap-2 glow-btn ${
                isGeneratingReport ? 'animate-pulse cursor-not-allowed' : ''
              }`}
            >
              <Brain className={`h-3.5 w-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
              {isGeneratingReport ? 'Executing Cloud Handshake...' : 'Analyze Active Session'}
            </button>
          </div>

          {/* Diagnosis Report Output Scroll Frame */}
          <div className="flex-1 overflow-y-auto p-4 bg-dark-950">
            {aiReport ? (
              <div className="prose prose-invert text-xs text-dark-200 leading-relaxed font-sans max-w-none space-y-4">
                {/* Custom render markdown nodes to avoid external library dependency */}
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
                    return null; // block delimiters handled by content matching
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
        </aside>

      </div>
    </div>
  );
}
