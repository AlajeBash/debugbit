'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronRight, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert,
  Activity,
  Plus,
  Play
} from 'lucide-react';

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

interface TelemetryStreamViewProps {
  sessions: MockSession[];
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function TelemetryStreamView({
  sessions,
  selectedSessionId,
  setSelectedSessionId,
  setActiveTab
}: TelemetryStreamViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<'all' | 'prod' | 'staging' | 'dev'>('all');
  const [mounted, setMounted] = useState(false);
  const [metricsTick, setMetricsTick] = useState(0);
  
  // Canvases refs for real-time live sparklines
  const epsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const latencyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bandwidthCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sparkline data buffers - initialized to static constants to prevent React server-client hydration mismatches
  const epsData = useRef<number[]>(Array(30).fill(0.35));
  const latencyData = useRef<number[]>(Array(30).fill(120));
  const bandwidthData = useRef<number[]>(Array(30).fill(15.4));

  useEffect(() => {
    setMounted(true);
    // Seed initial client-side random data safely upon mount
    epsData.current = Array(30).fill(0).map(() => Math.random() * 2);
    latencyData.current = Array(30).fill(120).map(() => 100 + Math.random() * 60);
    bandwidthData.current = Array(30).fill(15).map(() => 10 + Math.random() * 12);

    const drawSparkline = (canvas: HTMLCanvasElement | null, data: number[], color: string, fillGradient: string[]) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle retina displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      if (data.length === 0) return;

      const max = Math.max(...data) * 1.1 || 1;
      const min = Math.min(...data) * 0.9 || 0;
      const range = max - min;

      ctx.beginPath();
      data.forEach((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 8) - 4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Line properties
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw gradient fill
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, fillGradient[0]);
      grad.addColorStop(1, fillGradient[1]);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const interval = setInterval(() => {
      // Shift data and push new values
      epsData.current.shift();
      epsData.current.push(Math.random() * 3 + (Math.random() > 0.8 ? 2 : 0));

      latencyData.current.shift();
      latencyData.current.push(90 + Math.random() * 80 + (Math.random() > 0.95 ? 120 : 0));

      bandwidthData.current.shift();
      bandwidthData.current.push(8 + Math.random() * 15);

      drawSparkline(epsCanvasRef.current, epsData.current, '#f87171', ['rgba(248, 113, 113, 0.15)', 'rgba(248, 113, 113, 0)']);
      drawSparkline(latencyCanvasRef.current, latencyData.current, '#a78bfa', ['rgba(167, 139, 250, 0.15)', 'rgba(167, 139, 250, 0)']);
      drawSparkline(bandwidthCanvasRef.current, bandwidthData.current, '#34d399', ['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0)']);
      
      setMetricsTick(t => t + 1);
    }, 800);

    // Initial draw
    drawSparkline(epsCanvasRef.current, epsData.current, '#f87171', ['rgba(248, 113, 113, 0.15)', 'rgba(248, 113, 113, 0)']);
    drawSparkline(latencyCanvasRef.current, latencyData.current, '#a78bfa', ['rgba(167, 139, 250, 0.15)', 'rgba(167, 139, 250, 0)']);
    drawSparkline(bandwidthCanvasRef.current, bandwidthData.current, '#34d399', ['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0)']);

    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          session.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEnv = envFilter === 'all' ||
      (envFilter === 'prod' && session.project.toLowerCase().includes('prod')) ||
      (envFilter === 'staging' && session.project.toLowerCase().includes('staging')) ||
      (envFilter === 'dev' && session.project.toLowerCase().includes('dev'));

    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Real-time Health Metrics Sparklines Card Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Errors Per Second */}
        <div className="bg-[#0b0f19] border border-[#1f2937] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-red-500/20 transition-all">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Errors Per Second</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Live</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-outfit font-black text-white">{(epsData.current[29]).toFixed(2)}</span>
              <span className="text-xs text-red-400 font-medium">EPS</span>
            </div>
          </div>
          <div className="h-16 mt-4 w-full">
            <canvas ref={epsCanvasRef} className="w-full h-full" />
          </div>
        </div>

        {/* Metric 2: Live Latency */}
        <div className="bg-[#0b0f19] border border-[#1f2937] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#a78bfa]/20 transition-all">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Telemetry Latency</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20">Active</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-outfit font-black text-white">{(latencyData.current[29]).toFixed(0)}</span>
              <span className="text-xs text-[#a78bfa] font-medium">ms</span>
            </div>
          </div>
          <div className="h-16 mt-4 w-full">
            <canvas ref={latencyCanvasRef} className="w-full h-full" />
          </div>
        </div>

        {/* Metric 3: Payload Bandwidth */}
        <div className="bg-[#0b0f19] border border-[#1f2937] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#10b981]/20 transition-all">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payload Bandwidth</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#34d399] border border-emerald-500/20">Synced</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-outfit font-black text-white">{(bandwidthData.current[29]).toFixed(1)}</span>
              <span className="text-xs text-[#34d399] font-medium">kb/s</span>
            </div>
          </div>
          <div className="h-16 mt-4 w-full">
            <canvas ref={bandwidthCanvasRef} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl overflow-hidden shadow-xl">
        {/* Filter Controls Header */}
        <div className="p-6 border-b border-[#1f2937] bg-[#070a12]/30 flex flex-col sm:flex-row justify-between gap-4 items-center">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search session URLs or IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030712] border border-[#1f2937] pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all outline-none"
            />
          </div>

          {/* Environment Filter Matrix */}
          <div className="flex items-center gap-1.5 bg-[#030712] border border-[#1f2937] p-1 rounded-xl">
            {(['all', 'prod', 'staging', 'dev'] as const).map((env) => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  envFilter === env
                    ? 'bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {env === 'all' ? 'All Envs' : env}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions Stream Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#030712]/50 border-b border-[#1f2937] text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Stream Session</th>
                <th className="px-6 py-4">Project Context</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Resolution</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filteredSessions.map((session) => {
                const isSelected = selectedSessionId === session.id;
                return (
                  <tr
                    key={session.id}
                    className={`hover:bg-[#111827]/40 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#7c3aed]/5' : ''
                    }`}
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      setActiveTab('ai'); // Forward immediately to AI Investigator upon selection
                    }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors truncate max-w-md">
                          {session.url}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                          ID: {session.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-semibold text-gray-300">
                        {session.project}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {session.status === 'failed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                          <AlertCircle className="h-3 w-3" />
                          Failed
                        </span>
                      )}
                      {session.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      )}
                      {session.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold animate-pulse">
                          <Clock className="h-3.5 w-3.5" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        session.resolutionStatus === 'unresolved' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : session.resolutionStatus === 'investigating'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {session.resolutionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2.5 rounded-xl bg-[#111827] border border-[#1f2937] text-gray-400 group-hover:text-[#a78bfa] group-hover:border-[#7c3aed]/30 transition-all">
                        <Play className="h-4 w-4 fill-current group-hover:scale-105" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 text-sm">
                    No active telemetry sessions found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
