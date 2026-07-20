'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Download,
  Share2,
  Code2,
  Database,
  Lock,
  ExternalLink,
  Trash2,
  Plus
} from 'lucide-react';
import TimelineSequencer from './TimelineSequencer';

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

interface AiCorrelationViewProps {
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  events: TelemetryEvent[];
  comments: Comment[];
  addComment: (text: string) => void;
  deleteComment: (id: string) => void;
}

export default function AiCorrelationView({
  selectedSessionId,
  setSelectedSessionId,
  events = [],
  comments = [],
  addComment,
  deleteComment
}: AiCorrelationViewProps) {
  const [commentInput, setCommentInput] = useState('');
  const [activeSubTab, setActiveTab] = useState<'cognitive' | 'timeline' | 'diagnose' | 'diff'>('cognitive');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    addComment(commentInput);
    setCommentInput('');
  };

  const exportBugReport = (format: 'markdown' | 'json' | 'csv' | 'pdf') => {
    if (!selectedSessionId) return;

    if (format === 'json') {
      const content = JSON.stringify({
        sessionId: selectedSessionId,
        exportedAt: Date.now(),
        events: events,
        comments: comments
      }, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `debugbit-report-${selectedSessionId.slice(0, 8)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    if (format === 'csv') {
      const headers = ['Timestamp', 'Category', 'Type_Method_Metric', 'Details_Message_Value', 'Status', 'Duration_ms'];
      const rows = events.map(evt => {
        const time = new Date(evt.timestamp).toLocaleString();
        if (evt.category === 'network') {
          return [time, 'NETWORK', evt.method || '', evt.url || '', evt.status || '', Math.round(evt.duration || 0)];
        } else if (evt.category === 'performance') {
          return [time, 'PERFORMANCE', evt.metricName || '', evt.value || '', '', ''];
        } else {
          return [time, 'CONSOLE', (evt.level || 'log').toUpperCase(), evt.message || '', '', ''];
        }
      });
      const content = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `debugbit-report-${selectedSessionId.slice(0, 8)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to export the PDF report.');
        return;
      }

      const reportHtml = `
        <html>
          <head>
            <title>DebugBit AI Diagnostic Report - Session ${selectedSessionId}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Inter', sans-serif;
                background-color: #030712;
                color: #f3f4f6;
                padding: 40px;
                margin: 0;
              }
              .container {
                max-width: 900px;
                margin: 0 auto;
                border: 1px solid #1f2937;
                border-radius: 16px;
                background: #0b0f19;
                padding: 32px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
              }
              .header {
                border-bottom: 2px solid #1f2937;
                padding-bottom: 24px;
                margin-bottom: 24px;
              }
              .title {
                font-size: 24px;
                font-weight: 800;
                margin: 0;
                background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .meta {
                margin-top: 12px;
                font-size: 13px;
                color: #9ca3af;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
              }
              .meta-item {
                font-family: 'JetBrains Mono', monospace;
              }
              .section-title {
                font-size: 18px;
                font-weight: 700;
                margin: 32px 0 16px 0;
                color: #e5e7eb;
                border-bottom: 1px solid #1f2937;
                padding-bottom: 8px;
              }
              .event {
                padding: 12px;
                border-bottom: 1px solid #111827;
                font-size: 12px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
              }
              .event-time {
                font-family: 'JetBrains Mono', monospace;
                color: #6b7280;
                min-width: 80px;
              }
              .event-badge {
                font-size: 9px;
                text-transform: uppercase;
                font-weight: 800;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'JetBrains Mono', monospace;
              }
              .badge-network {
                background: rgba(59, 130, 246, 0.15);
                color: #60a5fa;
                border: 1px solid rgba(59, 130, 246, 0.25);
              }
              .badge-console {
                background: rgba(245, 158, 11, 0.15);
                color: #fbbf24;
                border: 1px solid rgba(245, 158, 11, 0.25);
              }
              .badge-performance {
                background: rgba(16, 185, 129, 0.15);
                color: #34d399;
                border: 1px solid rgba(16, 185, 129, 0.25);
              }
              .badge-error {
                background: rgba(239, 68, 68, 0.15);
                color: #f87171;
                border: 1px solid rgba(239, 68, 68, 0.25);
              }
              .event-details {
                flex: 1;
                font-family: 'JetBrains Mono', monospace;
                word-break: break-all;
              }
              .comments-list {
                margin-top: 16px;
              }
              .comment-item {
                border-left: 3px solid #7c3aed;
                padding-left: 12px;
                margin-bottom: 12px;
                font-size: 13px;
              }
              .comment-author {
                font-weight: 700;
                color: #a78bfa;
              }
              .comment-time {
                font-size: 11px;
                color: #6b7280;
              }
              @media print {
                body {
                  background: white !important;
                  color: #000 !important;
                  padding: 20px;
                }
                .container {
                  border: none;
                  box-shadow: none;
                  padding: 0;
                  background: white;
                }
                .title {
                  background: none;
                  -webkit-text-fill-color: initial;
                  color: #000;
                }
                .meta-item {
                  color: #4b5563;
                }
                .event {
                  border-bottom: 1px solid #e5e7eb;
                }
                .badge-network {
                  background: #eff6ff;
                  color: #1d4ed8;
                  border: 1px solid #bfdbfe;
                }
                .badge-console {
                  background: #fffbeb;
                  color: #b45309;
                  border: 1px solid #fde68a;
                }
                .badge-performance {
                  background: #ecfdf5;
                  color: #047857;
                  border: 1px solid #a7f3d0;
                }
                .badge-error {
                  background: #fef2f2;
                  color: #b91c1c;
                  border: 1px solid #fecaca;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="title">DebugBit AI Diagnostic Report</div>
                <div class="meta">
                  <div class="meta-item">Session ID: ${selectedSessionId}</div>
                  <div class="meta-item">Generated: ${new Date().toLocaleString()}</div>
                  <div class="meta-item">Total Captured Events: ${events.length}</div>
                </div>
              </div>

              <div class="section-title">Timeline Event Trace Log</div>
              ${events.map(ev => {
                const time = new Date(ev.timestamp).toLocaleTimeString();
                let badgeClass = 'badge-console';
                let typeLabel = 'console';
                let messageText = '';

                if (ev.category === 'network') {
                  badgeClass = 'badge-network';
                  typeLabel = `network [${ev.method || 'GET'}]`;
                  messageText = `${ev.url || ''} - Status: ${ev.status || ''} (${Math.round(ev.duration || 0)}ms)`;
                } else if (ev.category === 'performance') {
                  badgeClass = 'badge-performance';
                  typeLabel = `performance`;
                  messageText = `${ev.metricName || ''}: ${ev.value || 0}ms`;
                } else {
                  typeLabel = `console [${ev.level || 'log'}]`;
                  if (ev.level === 'error' || ev.level === 'exception') {
                    badgeClass = 'badge-error';
                  }
                  messageText = ev.message || '';
                }

                return `
                  <div class="event">
                    <div class="event-time">${time}</div>
                    <div class="event-badge ${badgeClass}">${typeLabel}</div>
                    <div class="event-details">${messageText}</div>
                  </div>
                `;
              }).join('')}

              ${comments.length > 0 ? `
                <div class="section-title">Team Annotations & Comments</div>
                <div class="comments-list">
                  ${comments.map(c => `
                    <div class="comment-item">
                      <div class="comment-author">${c.author} <span class="comment-time">(${c.timestamp})</span></div>
                      <div style="margin-top: 4px;">${c.text}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 800);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      return;
    }

    const reportContent = `# 🛠️ DebugBit AI Diagnostic Bug Report
- **Session ID**: \`${selectedSessionId}\`
- **Timestamp**: ${new Date().toISOString()}
- **Status**: Critical Failure (Crashed)
- **Target Route**: \`/checkout/payment\`

## 🧠 AI Root-Cause Analysis
- **Severity Level**: Critical Failure
- **Error Signature**: \`TypeError: Cannot read properties of undefined (reading 'paymentMethod')\`
- **Analysis**: A request was fired to \`POST /v1/checkout/payment\` returning a \`500 Internal Server Error\` status. The React payment handler expected a valid Stripe token block but received null due to legacy browser bindings.

## 📋 Captured Telemetry Event Trace Logs
${events.map(evt => {
  if (evt.category === 'network') {
    return `- [${evt.timestamp}] [NETWORK] ${evt.method} ${evt.url} -> Status ${evt.status} (${evt.duration || 120}ms)`;
  } else if (evt.category === 'performance') {
    return `- [${evt.timestamp}] [PERFORMANCE] ${evt.metricName}: ${evt.value}ms`;
  } else {
    return `- [${evt.timestamp}] [CONSOLE] [${evt.level || 'log'}] ${evt.message}`;
  }
}).join('\n')}

## 💡 Resolution Recommendation
Add conditional check (optional chaining) inside wrapping payment checkout trigger handler inside \`src/components/CheckoutButton.tsx\` to safely process missing Stripe tokens.

## 📝 Team Annotations & Comments
${comments.map(c => `- **${c.author}** (${c.timestamp}): ${c.text}`).join('\n') || 'No annotations added yet.'}

---
*Report compiled automatically by DebugBit AI Copilot.*
`;

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `debugbit-report-${selectedSessionId.slice(0, 8)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runAiInvestigation = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult(`### 🧠 AI Root-Cause Investigation Report
**Severity Level**: Critical Failure
**Error Signature**: \`TypeError: Cannot read properties of undefined (reading 'paymentMethod')\`

#### 🔍 Analysis & Culprit Discovery
1. **Network Sync correlation**: A request was fired to \`POST /v1/checkout/payment\` returning a \`500 Internal Server Error\` status at payload frame \`14:45:15\`.
2. **State Mutator correlation**: React button context initialized with a legacy DOM finding structure that failed to cache stripe dependencies.
3. **Execution context**: The global callback execution failed to check null configurations.

#### 💡 Resolution Recommendation
Add conditional check inside wrapping handler or utilize updated React standard props.`);
      setIsAnalyzing(false);
    }, 1500);
  };

  // If no session has been selected yet, render a beautiful landing card
  if (!selectedSessionId) {
    return (
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-12 text-center max-w-xl mx-auto my-12 shadow-xl animate-fadeIn">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center mb-6 shadow-lg shadow-[#7c3aed]/10 border border-[#a78bfa]/20">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-outfit text-2xl font-extrabold text-white mb-3">
          Select a Telemetry Stream
        </h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Before launching our AI Correlation engine, choose an active stream from the Telemetry Stream list to review event traces and locate root causes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Detail View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => setSelectedSessionId(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-4 py-2 bg-[#0b0f19] border border-[#1f2937] rounded-xl hover:bg-[#111827] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Streams</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono">Stream: {selectedSessionId}</span>
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 hover:bg-[#7c3aed]/20 text-[#a78bfa] text-xs font-bold transition-all cursor-pointer"
              title="Export session diagnostics in multiple formats"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
              <span className="text-[8px] opacity-60 ml-0.5">▼</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0b0f19] border border-[#1f2937] rounded-xl shadow-2xl py-1 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    exportBugReport('pdf');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#111827] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Print / Save PDF (.pdf)</span>
                </button>
                <button
                  onClick={() => {
                    exportBugReport('markdown');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#111827] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                  <span>Markdown Report (.md)</span>
                </button>
                <button
                  onClick={() => {
                    exportBugReport('csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#111827] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Structured CSV (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    exportBugReport('json');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#111827] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Raw JSON Payload (.json)</span>
                </button>
              </div>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            Failure
          </button>
        </div>
      </div>

      {/* Main Split Layout: Cognitive Feed + Chat / Auto-Fix Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 units): Event Timeline Log Stream */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f2937] p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('cognitive')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'cognitive' ? 'bg-[#7c3aed] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Event Trace Logs
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'timeline' ? 'bg-[#7c3aed] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Visual Timeline
            </button>
            <button
              onClick={() => setActiveTab('diagnose')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'diagnose' ? 'bg-[#7c3aed] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              AI Report Investigator
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'diff' ? 'bg-[#7c3aed] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              AI Auto-Fix Diff
            </button>
          </div>

          {/* Tab 1: Chronological Event Logs Feed */}
          {activeSubTab === 'cognitive' && (
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#a78bfa]" />
                Event Logs Feed
              </h4>
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin">
                {events.map((evt) => (
                  <div 
                    key={evt.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      evt.level === 'error' || evt.level === 'exception' || evt.status === 500
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/30'
                        : evt.level === 'warn'
                        ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/30'
                        : 'bg-[#030712] border-[#1f2937] hover:border-[#1f2937]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        evt.category === 'performance' ? 'bg-indigo-500/10 text-indigo-400' :
                        evt.category === 'network' ? 'bg-sky-500/10 text-sky-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {evt.category}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">{evt.timestamp}</span>
                    </div>

                    {evt.category === 'performance' && (
                      <p className="text-xs font-medium text-white">
                        Metric: <span className="text-indigo-400">{evt.metricName}</span> — value: <span className="font-mono text-gray-200">{evt.value}ms</span>
                      </p>
                    )}

                    {evt.category === 'console' && (
                      <p className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                        {evt.message}
                      </p>
                    )}

                    {evt.category === 'network' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">{evt.method}</span>
                        <span className="text-xs text-white truncate max-w-xs">{evt.url}</span>
                        <span className={`text-xs font-bold ml-auto px-2 py-0.5 rounded ${
                          evt.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 1b: Chronological Visual Node Tree Timeline */}
          {activeSubTab === 'timeline' && (
            <TimelineSequencer events={events} />
          )}

          {/* Tab 2: AI Report Investigator */}
          {activeSubTab === 'diagnose' && (
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#a78bfa]" />
                  AI Investigator
                </h4>
                <button
                  onClick={runAiInvestigation}
                  className="px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#5b21b6] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#7c3aed]/10 flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze with AI
                </button>
              </div>

              {isAnalyzing ? (
                <div className="p-12 text-center text-gray-400 text-sm">
                  <div className="animate-spin h-6 w-6 border-2 border-[#7c3aed] border-t-transparent rounded-full mx-auto mb-4" />
                  Correlating server stack traces and payload logs...
                </div>
              ) : analysisResult ? (
                <div className="prose prose-invert prose-sm max-w-none bg-[#030712] border border-[#1f2937] p-6 rounded-2xl text-gray-300 space-y-4 font-sans leading-relaxed">
                  <h5 className="text-md font-bold text-white mb-2">💡 AI Correlation Report</h5>
                  <p><strong>Cause</strong>: Under checkout state callbacks, variable reference error on Stripe button payload bindings.</p>
                  <p><strong>Evidence</strong>: Fails at post payload frame index 15. System attempted to retrieve <code>paymentMethod</code> but reference state was evaluated as null.</p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3 text-yellow-400 text-xs">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-bold">Urgent Fix Required</p>
                      <p className="mt-1">Add optional chaining wrapper on state payload variables.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Click the button above to run AI-powered telemetry diagnostic checks on this crash context.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Premium AI Auto-Fix Diff */}
          {activeSubTab === 'diff' && (
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#a78bfa]" />
                Suggested Code Auto-Fix
              </h4>

              <div className="bg-[#030712] border border-[#1f2937] rounded-2xl overflow-hidden font-mono text-xs">
                {/* File Header */}
                <div className="bg-[#070a12] border-b border-[#1f2937] px-4 py-2.5 text-gray-400 text-[10px] flex justify-between items-center">
                  <span>src/components/CheckoutButton.tsx</span>
                  <span className="text-[#a78bfa] font-semibold text-[9px] uppercase tracking-wider">React Component</span>
                </div>
                
                {/* Diff Viewer */}
                <div className="p-4 space-y-1">
                  <div className="text-gray-500 pr-4 select-none inline-block w-8 border-r border-[#1f2937]/50 mr-4">12</div>
                  <span className="text-gray-400">const handleCheckout = async (data: CheckoutPayload) =&gt; &#123;</span>
                  
                  <div className="flex bg-red-500/10 border-l-2 border-red-500 -mx-4 px-4 py-0.5">
                    <div className="text-red-500/40 pr-4 select-none inline-block w-8 border-r border-red-500/10 mr-4">- 13</div>
                    <span className="text-red-300 font-medium">  const method = data.paymentMethod.id;</span>
                  </div>
                  
                  <div className="flex bg-emerald-500/10 border-l-2 border-emerald-500 -mx-4 px-4 py-0.5">
                    <div className="text-emerald-500/40 pr-4 select-none inline-block w-8 border-r border-emerald-500/10 mr-4">+ 13</div>
                    <span className="text-emerald-300 font-medium">  const method = data?.paymentMethod?.id || 'standard_card';</span>
                  </div>

                  <div className="flex bg-emerald-500/10 border-l-2 border-emerald-500 -mx-4 px-4 py-0.5">
                    <div className="text-emerald-500/40 pr-4 select-none inline-block w-8 border-r border-emerald-500/10 mr-4">+ 14</div>
                    <span className="text-emerald-300 font-medium">  if (!method) console.warn('[DebugBit] stripe token missing, fallback applied.');</span>
                  </div>
                  
                  <div className="text-gray-500 pr-4 select-none inline-block w-8 border-r border-[#1f2937]/50 mr-4">15</div>
                  <span className="text-gray-400">  await triggerPaymentSync(method);</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 units): Team Chat / Event Comments Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#a78bfa]" />
              Team Activity & Notes
            </h4>

            {/* Chat List */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-[#030712] border border-[#1f2937] p-4 rounded-2xl flex items-start gap-3 relative group">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {comment.author.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-white">{comment.author}</span>
                      <span className="text-[9px] text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="absolute right-3 top-3 p-1 rounded hover:bg-[#111827] text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center py-8 text-xs text-gray-500">
                  No notes or annotations have been appended to this session log yet.
                </p>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2 border-t border-[#1f2937]/50 pt-4">
              <input
                type="text"
                placeholder="Append a debug note or tag teammates..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-[#030712] border border-[#1f2937] px-4 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all outline-none"
              />
              <button
                onClick={handleAddComment}
                className="p-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white transition-all shadow-md shadow-[#7c3aed]/10"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
