'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  Globe, 
  Activity, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CornerDownRight,
  Database,
  ArrowRight
} from 'lucide-react';

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

interface TimelineSequencerProps {
  events: TelemetryEvent[];
}

export default function TimelineSequencer({ events = [] }: TimelineSequencerProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center bg-[#0b0f19] border border-[#1f2937] rounded-3xl">
        <Clock className="h-8 w-8 mx-auto text-gray-500 mb-3 animate-pulse" />
        <p className="text-gray-400 text-sm">No sequence actions captured in this telemetry buffer.</p>
      </div>
    );
  }

  // Ensure chronological sorting by timestamp (assuming HH:MM:SS format)
  const sortedEvents = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return (
    <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#a78bfa] animate-pulse" />
            Chronological Timeline Sequencer
          </h4>
          <p className="text-gray-500 text-[11px] mt-1">Inter-correlated visual execution path of captured client & network events.</p>
        </div>
        <span className="text-[10px] bg-[#111827] border border-[#1f2937] text-[#a78bfa] font-mono px-2 py-1 rounded-lg">
          {events.length} Nodes
        </span>
      </div>

      <div className="relative pl-8 space-y-6">
        {/* Continuous Vertical Dotted Connector Line */}
        <div className="absolute left-[17px] top-3 bottom-3 w-0.5 border-l-2 border-dashed border-[#1f2937] z-0" />

        {sortedEvents.map((evt, index) => {
          const isExpanded = expandedEventId === evt.id;
          
          // Determine Category Style Token configurations
          let nodeIcon = <Terminal className="h-3.5 w-3.5" />;
          let nodeBgClass = "bg-gray-500/10 text-gray-400 border-gray-500/20";
          let nodeAccentColor = "border-gray-500/10";
          let badgeLabel = "Console";
          
          if (evt.category === 'network') {
            const isSuccess = evt.status === 200 || evt.status === 201;
            nodeIcon = <Globe className="h-3.5 w-3.5" />;
            badgeLabel = "Network";
            if (isSuccess) {
              nodeBgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/5";
              nodeAccentColor = "border-emerald-500/20";
            } else {
              nodeBgClass = "bg-red-500/10 text-red-400 border-red-500/30 shadow-md shadow-red-500/5 animate-pulse";
              nodeAccentColor = "border-red-500/20";
              nodeIcon = <AlertTriangle className="h-3.5 w-3.5" />;
            }
          } else if (evt.category === 'performance') {
            nodeIcon = <Cpu className="h-3.5 w-3.5" />;
            badgeLabel = "Performance";
            const isSlow = (evt.value || 0) > 1000;
            if (isSlow) {
              nodeBgClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-md shadow-yellow-500/5";
              nodeAccentColor = "border-yellow-500/20";
              nodeIcon = <AlertTriangle className="h-3.5 w-3.5" />;
            } else {
              nodeBgClass = "bg-[#7c3aed]/10 text-[#a78bfa] border-[#7c3aed]/30 shadow-md shadow-[#7c3aed]/5";
              nodeAccentColor = "border-[#7c3aed]/20";
            }
          } else if (evt.category === 'console' && (evt.level === 'error' || evt.level === 'exception')) {
            nodeBgClass = "bg-red-500/10 text-red-400 border-red-500/30 shadow-md shadow-red-500/5";
            nodeAccentColor = "border-red-500/20";
            nodeIcon = <AlertTriangle className="h-3.5 w-3.5" />;
            badgeLabel = "Exception";
          }

          return (
            <div 
              key={evt.id} 
              className={`relative z-10 transition-all duration-200 group rounded-2xl bg-[#030712]/40 hover:bg-[#030712] border border-transparent hover:border-[#1f2937] p-3 -ml-3 ${
                isExpanded ? 'bg-[#030712] border-[#1f2937]' : ''
              }`}
            >
              {/* Node Icon Trigger Indicator */}
              <div 
                onClick={() => toggleExpand(evt.id)}
                className={`absolute -left-[27px] top-[14px] h-9 w-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-10 ${nodeBgClass}`}
              >
                {nodeIcon}
              </div>

              {/* Node Brief Content Header */}
              <div 
                className="flex items-center justify-between cursor-pointer pl-9"
                onClick={() => toggleExpand(evt.id)}
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {evt.timestamp}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-700" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{badgeLabel}</span>
                  </div>

                  {evt.category === 'network' && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-gray-300 font-mono text-[10px] uppercase">{evt.method}</span>
                      <span className="text-xs text-white truncate font-medium">{evt.url}</span>
                    </div>
                  )}

                  {evt.category === 'console' && (
                    <p className="text-xs font-mono text-gray-300 truncate">
                      {evt.message}
                    </p>
                  )}

                  {evt.category === 'performance' && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                      <span>{evt.metricName}</span>
                      <ArrowRight className="h-3 w-3 text-gray-500" />
                      <span className="font-mono text-[#a78bfa] font-bold">{evt.value}ms</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {evt.category === 'network' && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      evt.status === 200 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {evt.status}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 hover:text-white transition-colors" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 hover:text-white transition-colors" />
                  )}
                </div>
              </div>

              {/* Node Detailed Expansion Frame */}
              {isExpanded && (
                <div className="mt-4 pl-9 pt-4 border-t border-[#1f2937]/50 text-xs text-gray-400 space-y-3 animate-slideDown">
                  {evt.category === 'network' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#030712] border border-[#1f2937]/50 rounded-xl p-4">
                      <div>
                        <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Response Time</span>
                        <div className="flex items-baseline gap-1.5 text-white">
                          <span className="text-lg font-outfit font-black text-[#a78bfa]">{evt.duration || 124}</span>
                          <span className="text-[10px] text-gray-400">ms</span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Payload Size</span>
                        <div className="flex items-baseline gap-1.5 text-white">
                          <span className="text-lg font-outfit font-black text-emerald-400">1.82</span>
                          <span className="text-[10px] text-gray-400">kb</span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Headers Sent</span>
                        <pre className="bg-[#070a12] p-2.5 rounded-lg text-[10px] font-mono text-gray-300 overflow-x-auto border border-[#1f2937]/30">
                          {JSON.stringify({
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                            "X-DebugBit-Client-Token": "db_sync_live_f3972a91b2c8c4de82e0"
                          }, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {evt.category === 'console' && (
                    <div className="bg-[#030712] border border-[#1f2937]/50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Diagnostic Details</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          evt.level === 'error' || evt.level === 'exception' ? 'bg-red-500/10 text-red-400' :
                          evt.level === 'warn' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {evt.level || 'log'}
                        </span>
                      </div>
                      <p className="font-mono text-gray-200 bg-[#070a12] p-3 rounded-lg border border-[#1f2937]/30 whitespace-pre-wrap leading-relaxed text-[11px]">
                        {evt.message}
                      </p>
                    </div>
                  )}

                  {evt.category === 'performance' && (
                    <div className="bg-[#030712] border border-[#1f2937]/50 rounded-xl p-4 space-y-3">
                      <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">WebVitals Metric Assessment</span>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center font-outfit text-white font-extrabold shadow-md">
                          {(evt.value || 0) > 1000 ? '⚠️' : '✓'}
                        </div>
                        <div>
                          <p className="text-white font-bold text-xs">{evt.metricName}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {(evt.value || 0) > 1000 
                              ? 'This metric exceeds the recommended WebVitals load standard (1.0s).' 
                              : 'Optimal duration. Passes standard Google Chrome loading performance audits.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
