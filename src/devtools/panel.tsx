import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTelemetryStore, type UnifiedTelemetryEvent } from '../store/useTelemetryStore';
import { Timeline } from '../shared/components/Timeline';
import { 
  Trash2, 
  Download, 
  Database, 
  Sparkles, 
  Terminal, 
  Globe, 
  Copy,
  CheckCircle2,
  Calendar,
  Settings,
  Brain,
  Key,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

// --- Local Sub-Component: Dynamic Markdown Viewer ---
const MarkdownViewer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  const renderedElements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockContent.join('\n');
        renderedElements.push(
          <div key={`code-${i}`} className="relative my-3 group">
            <pre className="bg-dark-950 border border-dark-900 rounded-xl p-3.5 font-mono text-[11px] text-brand-200 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockContent = [];
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Process headers and formats
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1 key={i} className="text-sm font-extrabold text-white mt-6 mb-3 border-b border-dark-900 pb-1.5 flex items-center gap-2">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={i} className="text-xs font-extrabold text-brand-300 mt-5 mb-2 flex items-center gap-1.5">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={i} className="text-[11px] font-bold text-dark-200 mt-4 mb-1.5 flex items-center gap-1.5">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      renderedElements.push(
        <li key={i} className="text-[11px] text-dark-300 list-none ml-4 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:bg-brand-500 before:rounded-full mb-1.5">
          {parseInlineFormatting(line.replace('- ', ''))}
        </li>
      );
    } else if (line.trim() === '---') {
      renderedElements.push(<hr key={i} className="my-4.5 border-dark-900" />);
    } else if (line.trim()) {
      renderedElements.push(
        <p key={i} className="text-[11px] leading-relaxed text-dark-300 mb-2">
          {parseInlineFormatting(line)}
        </p>
      );
    }
  }

  return <div className="space-y-1 font-sans">{renderedElements}</div>;
};

function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// --- Local Sub-Component: Glowing AI Scanning Overlay ---
const AIScanOverlay: React.FC = () => {
  return (
    <div className="h-full w-full bg-dark-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden select-none">
      {/* Pulsing radar lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[280px] h-[280px] border border-brand-500/20 rounded-full animate-ping absolute" />
        <div className="w-[160px] h-[180px] border border-purple-500/30 rounded-full absolute animate-pulse" />
      </div>

      <div className="relative z-10 space-y-4 max-w-xs">
        <div className="inline-block p-4 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-2xl shadow-xl shadow-brand-500/20 animate-bounce duration-1000">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest bg-gradient-to-r from-brand-300 to-purple-400 bg-clip-text text-transparent">
            AI Analyzer Active
          </h3>
          <p className="text-[10px] text-dark-500 font-mono mt-1 animate-pulse">
            Correlating network errors and logs...
          </p>
        </div>
        
        {/* Fake progress scroll */}
        <div className="space-y-2 mt-4">
          <div className="h-1.5 w-full bg-dark-900 rounded-full overflow-hidden relative border border-dark-800">
            <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full w-2/5 animate-pulse absolute left-1/3" />
          </div>
          <p className="text-[9px] text-dark-500">
            Parsing unhandled rejections & extracting context
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Local Sub-Component: Network Details Inspector ---
const NetworkDetails: React.FC<{ event: UnifiedTelemetryEvent }> = ({ event }) => {
  const net = event.data as any;
  const isError = net.status >= 400 || net.status === 0;
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-dark-950 text-dark-100 overflow-y-auto p-5 scrollbar-thin">
      {/* Header Info */}
      <div className="border-b border-dark-900 pb-4 mb-5">
        <div className="flex items-center gap-2 text-dark-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
          <Globe className="h-3 w-3 text-blue-400" />
          <span>Network Interception Details</span>
        </div>
        <h2 className="font-mono text-xs font-bold text-dark-50 break-all mb-2">
          <span className="text-brand-400 font-extrabold mr-2 uppercase">{net.method}</span>
          {net.url}
        </h2>
        <div className="flex gap-4 font-mono text-[10px] text-dark-400 mt-2">
          <div>
            Status: <span className={`font-bold ${isError ? 'text-red-400' : 'text-green-400'}`}>
              {net.status === 0 ? 'Blocked / Failed' : net.status}
            </span>
          </div>
          <div>Duration: <span className="font-bold text-dark-200">{Math.round(net.duration)}ms</span></div>
          <div>Time: <span className="text-dark-200">{new Date(event.timestamp).toLocaleTimeString()}</span></div>
        </div>
      </div>

      {/* Request Details Block */}
      <div className="space-y-4">
        {/* Request Headers */}
        {net.requestHeaders && Object.keys(net.requestHeaders).length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-2">Request Headers</h3>
            <div className="bg-dark-900/40 border border-dark-900 rounded-lg p-3 font-mono text-[10px] space-y-1.5 overflow-x-auto">
              {Object.entries(net.requestHeaders).map(([key, val]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-dark-900/20 pb-1 last:border-0 last:pb-0">
                  <span className="text-dark-400 font-semibold">{key}:</span>
                  <span className="text-dark-200 break-all text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Body */}
        {net.requestBody && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Request Payload</h3>
              <button 
                onClick={() => handleCopy(net.requestBody, 'reqBody')}
                className="text-dark-500 hover:text-dark-300 transition-colors duration-150 p-1 rounded hover:bg-dark-900 cursor-pointer"
              >
                {copied === 'reqBody' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <pre className="bg-dark-900/40 border border-dark-900 rounded-lg p-3 font-mono text-[10px] text-dark-200 overflow-x-auto max-h-[160px] whitespace-pre-wrap break-all leading-normal">
              {net.requestBody}
            </pre>
          </div>
        )}

        {/* Response Headers */}
        {net.responseHeaders && Object.keys(net.responseHeaders).length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-2">Response Headers</h3>
            <div className="bg-dark-900/40 border border-dark-900 rounded-lg p-3 font-mono text-[10px] space-y-1.5 overflow-x-auto">
              {Object.entries(net.responseHeaders).map(([key, val]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-dark-900/20 pb-1 last:border-0 last:pb-0">
                  <span className="text-dark-400 font-semibold">{key}:</span>
                  <span className="text-dark-200 break-all text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Body */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Response Body</h3>
            {net.responseBody && (
              <button 
                onClick={() => handleCopy(net.responseBody, 'respBody')}
                className="text-dark-500 hover:text-dark-300 transition-colors duration-150 p-1 rounded hover:bg-dark-900 cursor-pointer"
              >
                {copied === 'respBody' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </div>
          <pre className="bg-dark-900 border border-dark-900/80 rounded-lg p-3 font-mono text-[10px] text-brand-200 overflow-x-auto max-h-[260px] whitespace-pre-wrap break-all leading-relaxed">
            {net.responseBody || '[Empty Response Body]'}
          </pre>
        </div>
      </div>
    </div>
  );
};

// --- Local Sub-Component: Log / Exception Inspector ---
const LogDetails: React.FC<{ event: UnifiedTelemetryEvent }> = ({ event }) => {
  const cons = event.data as any;
  const isError = cons.type === 'error' || cons.type === 'exception';
  const isWarning = cons.type === 'warn';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cons.message + (cons.stack ? `\n\nStack:\n${cons.stack}` : ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-dark-950 text-dark-100 p-5 overflow-y-auto scrollbar-thin">
      <div className="border-b border-dark-900 pb-4 mb-5 flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
            <Terminal className={`h-3 w-3 ${isError ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-dark-400'}`} />
            <span>Console Telemetry Details</span>
          </div>
          <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isError 
              ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
              : isWarning 
              ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' 
              : 'bg-dark-900 text-dark-300'
          }`}>
            {cons.type}
          </span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-dark-500 hover:text-dark-300 transition-colors duration-150 p-1.5 rounded hover:bg-dark-900 flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Trace</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1.5">Captured Message</h3>
          <div className={`p-4 rounded-xl border font-mono text-[11px] whitespace-pre-wrap break-all leading-relaxed ${
            isError 
              ? 'bg-red-950/15 border-red-900/30 text-red-200/90' 
              : isWarning 
              ? 'bg-yellow-950/15 border-yellow-900/30 text-yellow-200/90' 
              : 'bg-dark-900 border-dark-900 text-dark-200'
          }`}>
            {cons.message}
          </div>
        </div>

        {cons.stack && (
          <div>
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1.5">Stack Trace</h3>
            <pre className="bg-dark-950 border border-dark-900 p-3 rounded-lg text-dark-300 font-mono text-[10px] overflow-x-auto leading-relaxed max-h-[360px] whitespace-pre">
              {cons.stack}
            </pre>
          </div>
        )}

        <div className="flex gap-4 font-mono text-[10px] text-dark-500 pt-2">
          <div>Time Captured: <span className="text-dark-400">{new Date(event.timestamp).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
};

// --- Main DevTools Panel Component ---
export const Panel: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    setActiveSessionId, 
    clearCurrentSession,
    unifiedEvents,
    selectedLog,
    initStore,
    
    // AI States & Actions
    geminiKey,
    setGeminiKey,
    isAnalyzing,
    aiReport,
    analyzeActiveSession,

    // Recording State & Actions
    isRecording,
    setIsRecording
  } = useTelemetryStore();

  const [rightTab, setRightTab] = useState<'inspector' | 'ai'>('inspector');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load subscriptions and initialize
  useEffect(() => {
    const unsubscribe = initStore();
    return () => unsubscribe();
  }, [initStore]);

  // Sync state API key to input
  useEffect(() => {
    if (geminiKey) {
      setApiKeyInput(geminiKey);
    }
  }, [geminiKey]);

  // Save API Key helper
  const handleSaveApiKey = async () => {
    try {
      await setGeminiKey(apiKeyInput.trim());
      setShowSettings(false);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage('Failed to save API Key.');
    }
  };

  // Run AI analysis pipeline
  const handleAIAnalyze = async () => {
    if (!geminiKey) {
      setShowSettings(true);
      setErrorMessage('Please save a valid Gemini API Key first.');
      return;
    }

    setErrorMessage(null);
    setRightTab('ai'); // Switch viewport to show progress

    try {
      await analyzeActiveSession();
    } catch (err: any) {
      setErrorMessage(err.message || 'AI Ingestion analysis failed.');
      setRightTab('inspector'); // Return to inspector tab on failure
    }
  };

  // Handle formatted file exports
  const handleExport = (format: 'markdown' | 'json') => {
    if (unifiedEvents.length === 0) return;

    let content = '';
    let mimeType = 'text/plain';
    let fileName = `ai-debugging-session-${activeSessionId}`;

    if (format === 'json') {
      content = JSON.stringify({
        sessionId: activeSessionId,
        exportedAt: Date.now(),
        events: unifiedEvents
      }, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      content = `# AI Debugging Copilot Report\n\n`;
      content += `Generated on: ${new Date().toLocaleString()}\n`;
      content += `Session Target ID: ${activeSessionId}\n`;
      content += `Total Logged Events: ${unifiedEvents.length}\n\n`;
      content += `## Timeline Log\n\n`;

      unifiedEvents.forEach((ev) => {
        const time = new Date(ev.timestamp).toLocaleTimeString();
        if (ev.category === 'network') {
          const net = ev.data;
          content += `[${time}] **NETWORK [${net.method}]** ${net.url} - Status: ${net.status} (${Math.round(net.duration)}ms)\n`;
        } else {
          const cons = ev.data;
          content += `[${time}] **CONSOLE [${cons.type.toUpperCase()}]** ${cons.message}\n`;
          if (cons.stack) {
            content += `\`\`\`text\n${cons.stack}\n\`\`\`\n`;
          }
        }
      });
      mimeType = 'text/markdown';
      fileName += '.md';
    }

    // Trigger Browser File Download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-screen bg-dark-950 text-dark-50 flex flex-col overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-12 border-b border-dark-900 bg-dark-950/80 px-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600/10 border border-brand-500/25 p-1 rounded">
            <Brain className="h-3.5 w-3.5 text-brand-400" />
          </div>
          <span className="font-extrabold text-[10px] tracking-widest bg-gradient-to-r from-brand-300 to-purple-400 bg-clip-text text-transparent">
            AI DEBUGGING COPILOT
          </span>
        </div>

        {/* Controls Panel */}
        <div className="flex items-center gap-2.5">
          {/* Active Session Dropdown */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-dark-400" />
            <select
              value={activeSessionId || ''}
              onChange={(e) => setActiveSessionId(e.target.value || null)}
              className="bg-dark-900 border border-dark-800 rounded-lg text-[10px] font-mono px-2 py-1 text-dark-200 focus:border-brand-500/50 outline-none max-w-[150px] cursor-pointer"
            >
              {sessions.length === 0 ? (
                <option value="">No sessions recorded</option>
              ) : (
                sessions.map((sess) => (
                  <option key={sess.id} value={sess.id}>
                    Session #{String(sess.id).slice(0, 8)} ({new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="h-4 w-px bg-dark-900" />

          {/* Record / Pause Toggle */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 min-w-[46px]">
              <span className={`h-1.5 w-1.5 rounded-full ${isRecording ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-dark-400">
                {isRecording ? 'Rec' : 'Paused'}
              </span>
            </span>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isRecording ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-dark-800 border-dark-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                  isRecording ? 'translate-x-4 bg-emerald-400' : 'translate-x-0 bg-dark-500'
                }`}
              />
            </button>
          </div>

          <div className="h-4 w-px bg-dark-900" />

          {/* Settings / API Key Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
              showSettings || !geminiKey
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'bg-dark-900/60 border-dark-800 text-dark-400 hover:text-dark-200'
            }`}
            title="Configure Gemini API Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {/* AI Trigger Button */}
          <button
            onClick={handleAIAnalyze}
            disabled={unifiedEvents.length === 0 || isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-lg shadow-brand-500/10 transition-all duration-150 cursor-pointer animate-pulse-subtle"
          >
            <Sparkles className="h-3 w-3" />
            <span>Analyze Session</span>
          </button>

          <div className="h-4 w-px bg-dark-900" />

          {/* Actions */}
          <button
            onClick={() => handleExport('markdown')}
            disabled={unifiedEvents.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-dark-200 hover:text-white bg-dark-900/60 border border-dark-800 hover:border-dark-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-all duration-150 cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Export Report</span>
          </button>

          <button
            onClick={clearCurrentSession}
            disabled={!activeSessionId}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-red-400 hover:text-red-300 bg-red-950/10 border border-red-900/30 hover:border-red-900/50 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-all duration-150 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </header>

      {/* Settings Overlay Block */}
      {showSettings && (
        <div className="bg-dark-900 border-b border-dark-850 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in relative z-30">
          <div className="flex items-start gap-2.5 max-w-md">
            <Key className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[11px] font-bold text-dark-100 uppercase tracking-wider">Configure Gemini API Key</h4>
              <p className="text-[10px] text-dark-500 leading-normal mt-0.5">
                Saved locally on your machine via Chrome local storage. This key queries Gemini 1.5 Flash directly from your panel context.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-dark-950 border border-dark-800 rounded-lg overflow-hidden focus-within:border-brand-500/50 transition-colors duration-150">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="pl-3 pr-8 py-1 font-mono text-[10px] text-dark-200 placeholder-dark-600 bg-transparent outline-none w-[200px]"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 text-dark-500 hover:text-dark-300 transition-colors duration-150 cursor-pointer"
              >
                {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </div>
            <button
              onClick={handleSaveApiKey}
              className="px-3 py-1 text-[10px] font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-all duration-150 cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="bg-red-950/20 border-b border-red-900/30 px-4 py-2 flex items-center justify-between gap-3 text-red-400 font-mono text-[10px] animate-fade-in relative z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-dark-400 hover:text-dark-200 font-bold px-1.5 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Panel Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Timeline Feed */}
        <div className="w-[42%] h-full flex flex-col flex-shrink-0">
          <Timeline />
        </div>

        {/* Right Side: Tabbed Log Details or AI Diagnostic Viewer */}
        <div className="flex-1 h-full bg-dark-950 flex flex-col overflow-hidden">
          {/* Right Header Tabs (shown if AI report exists or currently analyzing) */}
          {(aiReport || isAnalyzing) && (
            <div className="h-8 border-b border-dark-900 flex items-center px-4 gap-1.5 bg-dark-950/60 shrink-0">
              <button
                onClick={() => setRightTab('inspector')}
                className={`px-3 h-full text-[10px] font-semibold border-b-2 transition-all duration-150 cursor-pointer ${
                  rightTab === 'inspector'
                    ? 'border-brand-500 text-brand-400 font-bold'
                    : 'border-transparent text-dark-500 hover:text-dark-300'
                }`}
              >
                Trace Inspector
              </button>
              <button
                onClick={() => setRightTab('ai')}
                className={`px-3 h-full text-[10px] font-semibold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                  rightTab === 'ai'
                    ? 'border-brand-500 text-brand-400 font-bold'
                    : 'border-transparent text-dark-500 hover:text-dark-300'
                }`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span>AI Debugger Report</span>
              </button>
            </div>
          )}

          {/* Right Area Body Viewport */}
          <div className="flex-1 overflow-hidden">
            {isAnalyzing ? (
              <AIScanOverlay />
            ) : rightTab === 'ai' && aiReport ? (
              <div className="h-full overflow-y-auto p-5 scrollbar-thin select-text selection:bg-brand-500/30 selection:text-white bg-dark-950 text-dark-100">
                <MarkdownViewer text={aiReport} />
              </div>
            ) : selectedLog ? (
              selectedLog.category === 'network' ? (
                <NetworkDetails event={selectedLog} />
              ) : (
                <LogDetails event={selectedLog} />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-dark-500 gap-3 bg-dark-950 select-none">
                <div className="p-3 bg-dark-900/50 rounded-xl border border-dark-900">
                  <Database className="h-5 w-5 text-dark-400 opacity-60" />
                </div>
                <h3 className="text-xs font-bold text-dark-400">Inspector Panel</h3>
                <p className="text-[11px] text-dark-500 max-w-[240px] leading-relaxed">
                  Select any network transaction or console log from the timeline on the left to inspect detailed headers, request bodies, exceptions, and stack traces.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount Component to DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Panel />);
}
