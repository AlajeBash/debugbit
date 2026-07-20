'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Brain, 
  Key, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}: SidebarProps) {
  const navItems = [
    { id: 'telemetry', label: 'Telemetry Stream', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Correlation', icon: Brain },
    { id: 'keys', label: 'API Keys & Settings', icon: Key },
    { id: 'billing', label: 'Stripe Billing', icon: CreditCard },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-20 h-screen bg-[#0b0f19] border-r border-[#1f2937] transition-all duration-300 flex flex-col ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1f2937]">
        <div className="flex items-center justify-center w-full overflow-hidden">
          {isSidebarCollapsed ? (
            <div className="h-9 w-9 bg-[#7c3aed]/5 border border-[#7c3aed]/25 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="DebugBit Bug Icon" 
                className="h-full w-auto max-w-none scale-[1.9] translate-x-[-1px]" 
              />
            </div>
          ) : (
            <img 
              src="/logo.png" 
              alt="DebugBit Brand Logo" 
              className="h-12 w-auto object-contain animate-fadeIn" 
            />
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                isActive 
                  ? 'bg-gradient-to-r from-[#7c3aed]/10 to-transparent border border-[#7c3aed]/20 text-[#a78bfa] shadow-md shadow-[#7c3aed]/5' 
                  : 'text-gray-400 hover:bg-[#111827] hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-[#a78bfa]' : 'text-gray-400 group-hover:text-white'
              }`} />
              {!isSidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Block */}
      <div className="p-4 border-t border-[#1f2937] bg-[#070a12]/20">
        <SignedIn>
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 overflow-hidden">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 rounded-xl border border-[#1f2937] hover:border-[#7c3aed] transition-colors"
                  }
                }}
              />
              {!isSidebarCollapsed && (
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-bold text-white truncate">Developer Account</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Session Active</span>
                </div>
              )}
            </div>
          </div>
        </SignedIn>
        
        <SignedOut>
          <a 
            href="/sign-in"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/25 hover:bg-[#7c3aed]/20 text-white hover:text-white transition-all text-xs font-bold shadow-md shadow-[#7c3aed]/5"
          >
            <div className="h-6 w-6 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white shrink-0 text-[10px]">
              ⚡
            </div>
            {!isSidebarCollapsed && (
              <span className="truncate text-gray-300">Sign In to Sync</span>
            )}
          </a>
        </SignedOut>
      </div>

      {/* Collapse Trigger Footer */}
      <div className="p-4 border-t border-[#1f2937] bg-[#070a12]/50 flex justify-end">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 rounded-lg bg-[#111827] border border-[#1f2937] text-gray-400 hover:text-white hover:bg-[#1f2937] transition-all"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
