import React, { useState } from 'react';
import { useTelemetryStore, type UnifiedTelemetryEvent, type FilterType } from '../store/useTelemetryStore';
import { 
  Terminal, 
  Globe, 
  AlertTriangle, 
  Search, 
  Info, 
  XCircle,
  Clock
} from 'lucide-react';

const formatTime = (ms: number) => {
  const date = new Date(ms);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const msStr = String(ms % 1000).padStart(3, '0');
  return `${timeStr}.${msStr}`;
};

export const Timeline: React.FC = () => {
  const { 
    unifiedEvents, 
    selectedLog, 
    setSelectedLog, 
    filterType, 
    setFilterType 
  } = useTelemetryStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredEvents = unifiedEvents.filter((event) => {
    // 1. Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (event.category === 'network') {
        const net = event.data;
        if (!net.url.toLowerCase().includes(query) && !net.method.toLowerCase().includes(query)) {
          return false;
        }
      } else {
        const cons = event.data;
        if (!cons.message.toLowerCase().includes(query) && !cons.type.toLowerCase().includes(query)) {
          return false;
        }
      }
    }

    // 2. Category filters
    if (filterType === 'all') return true;
    if (filterType === 'network') return event.category === 'network';
    if (filterType === 'logs') {
      return event.category === 'console' && event.data.type !== 'error' && event.data.type !== 'exception';
    }
    if (filterType === 'errors') {
      if (event.category === 'network') {
        return event.data.status >= 400 || event.data.status === 0;
      } else {
        return event.data.type === 'error' || event.data.type === 'exception';
      }
    }
    return true;
  });

  const getEventStyles = (event: UnifiedTelemetryEvent) => {
    const isSelected = selectedLog?.id === event.id;
    const base = `group relative flex items-start gap-3 p-3 text-xs border-b border-dark-900/60 cursor-pointer transition-all duration-150 select-none`;
    const selection = isSelected 
      ? 'bg-brand-500/10 border-l-2 border-l-brand-500' 
      : 'hover:bg-dark-900/40 border-l-2 border-l-transparent';
    return `${base} ${selection}`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-dark-950 text-dark-100 border-r border-dark-900">
      {/* Search Header */}
      <div className="p-3 border-b border-dark-900 bg-dark-950/80 backdrop-blur-md sticky top-0 z-10 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-500" />
          <input
            type="text"
            placeholder="Filter logs or URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(eventTargetValue(e))}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-dark-900 border border-dark-800 rounded-lg text-dark-100 placeholder-dark-500 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all duration-150"
          />
        </div>

        {/* Filter Navigation */}
        <div className="flex gap-1.5 bg-dark-900/50 p-1 rounded-lg">
          {(['all', 'errors', 'network', 'logs'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-1 text-[10px] font-semibold rounded-md capitalize transition-all duration-150 ${
                filterType === type
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Timeline Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-500 gap-2 p-4">
            <Clock className="h-8 w-8 opacity-40 text-dark-400" />
            <span className="text-xs">No telemetry matches found</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredEvents.map((event) => {
              const isNetwork = event.category === 'network';

              if (isNetwork) {
                const net = event.data;
                const isError = net.status >= 400 || net.status === 0;
                
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedLog(event)}
                    className={getEventStyles(event)}
                  >
                    <Globe className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isError ? 'text-red-400' : 'text-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-dark-300">
                          {net.method}
                        </span>
                        <span className="text-[10px] text-dark-500 font-mono">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <div className="font-mono text-dark-200 break-all text-[11px] truncate pr-4">
                        {net.url}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px]">
                        <span className={`font-semibold ${isError ? 'text-red-400' : 'text-green-400'}`}>
                          {net.status === 0 ? 'FAIL' : net.status}
                        </span>
                        <span className="text-dark-500">
                          {Math.round(net.duration)}ms
                        </span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const cons = event.data;
                const isError = cons.type === 'error' || cons.type === 'exception';
                const isWarning = cons.type === 'warn';

                let LogIcon = Terminal;
                let colorClass = 'text-dark-400';
                if (isError) {
                  LogIcon = XCircle;
                  colorClass = 'text-red-400';
                } else if (isWarning) {
                  LogIcon = AlertTriangle;
                  colorClass = 'text-yellow-400';
                } else if (cons.type === 'info') {
                  LogIcon = Info;
                  colorClass = 'text-indigo-400';
                }

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedLog(event)}
                    className={getEventStyles(event)}
                  >
                    <LogIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className={`font-semibold uppercase text-[9px] px-1.5 py-0.5 rounded ${
                          isError 
                            ? 'bg-red-500/10 text-red-400' 
                            : isWarning 
                            ? 'bg-yellow-500/10 text-yellow-400' 
                            : 'bg-dark-900 text-dark-400'
                        }`}>
                          {cons.type}
                        </span>
                        <span className="text-[10px] text-dark-500 font-mono">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <p className={`font-mono leading-relaxed text-[11px] whitespace-pre-wrap break-words ${
                        isError ? 'text-red-200/90' : isWarning ? 'text-yellow-200/90' : 'text-dark-200'
                      }`}>
                        {cons.message}
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Safe wrapper to prevent typing issues on input events
function eventTargetValue(e: React.ChangeEvent<HTMLInputElement>): string {
  return e.target.value;
}
