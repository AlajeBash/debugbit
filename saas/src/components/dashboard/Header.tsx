'use client';

import React from 'react';
import { 
  Compass, 
  Globe, 
  Users, 
  Settings, 
  MessageSquare,
  Activity
} from 'lucide-react';

interface HeaderProps {
  currentProject: string;
  setProjectFilter?: (project: string) => void;
  isSimulating: boolean;
  setIsSimulating?: (simulating: boolean) => void;
}

export default function Header({
  currentProject,
  setProjectFilter,
  isSimulating,
  setIsSimulating
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#1f2937] bg-[#070a12]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Left side: Project Context Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] px-4 py-2 rounded-xl text-sm font-semibold text-white">
          <Globe className="h-4 w-4 text-[#a78bfa]" />
          <span>{currentProject}</span>
        </div>
        
        {/* Live Sync Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
          <span>Telemetry Active</span>
        </div>
      </div>

      {/* Right side: Simulation Switches and Actions */}
      <div className="flex items-center gap-4">
        {/* Live Simulation Stream Switcher */}
        {setIsSimulating && (
          <div className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] px-4 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-gray-400">Stream Simulator:</span>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSimulating ? 'bg-[#7c3aed]' : 'bg-[#1f2937]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isSimulating ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Quick Links & Info */}
        <div className="flex items-center gap-2 border-l border-[#1f2937] pl-4">
          <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#111827] transition-all" title="Team members">
            <Users className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#111827] transition-all" title="System Status">
            <Activity className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
