'use client';

import React from 'react';
import { 
  CreditCard, 
  Settings, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';

interface BillingViewProps {
  onCheckout?: (plan: string) => void;
  onPortal?: () => void;
}

export default function BillingView({
  onCheckout,
  onPortal
}: BillingViewProps) {
  // Mock usage statistics for visual gauges
  const telemetryUsagePercent = 42;
  const storageUsagePercent = 18;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Visual Subscription Status Board */}
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center shadow-lg shadow-[#7c3aed]/10 shrink-0 border border-[#a78bfa]/20">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">Developer Pro Plan</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">Active</span>
            </div>
            <span className="text-xs text-gray-500 font-sans mt-0.5">Your next renewal invoice is on August 17, 2026.</span>
          </div>
        </div>

        <button
          onClick={onPortal}
          className="w-full md:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-[#111827] text-white border border-[#1f2937] hover:bg-[#1f2937] transition-all flex items-center justify-center gap-2"
        >
          <span>Manage in Stripe</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Visual Progress Utilization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telemetry Stream Volume Meter */}
        <div className="bg-[#0b0f19] border border-[#1f2937] p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Telemetry API Quota</span>
              <span className="text-xs font-mono text-gray-300">42,500 / 100,000 monthly</span>
            </div>
            
            {/* Visual Gauge Progress Bar */}
            <div className="w-full bg-[#030712] rounded-full h-3 overflow-hidden border border-[#1f2937]">
              <div 
                className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] h-full rounded-full transition-all duration-500"
                style={{ width: `${telemetryUsagePercent}%` }}
              />
            </div>
          </div>
          
          <p className="text-[11px] text-gray-500 mt-4 leading-normal">
            Your current stream cap resets in 28 days. Once cap is reached, telemetry logging automatically implements strict client sampling rates.
          </p>
        </div>

        {/* Database Hot Storage Volume Meter */}
        <div className="bg-[#0b0f19] border border-[#1f2937] p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hot Log Retention Storage</span>
              <span className="text-xs font-mono text-gray-300">1.8 GB / 10 GB limit</span>
            </div>

            {/* Visual Gauge Progress Bar */}
            <div className="w-full bg-[#030712] rounded-full h-3 overflow-hidden border border-[#1f2937]">
              <div 
                className="bg-gradient-to-r from-[#10b981] to-[#34d399] h-full rounded-full transition-all duration-500"
                style={{ width: `${storageUsagePercent}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-500 mt-4 leading-normal">
            Logs older than 30 days are automatically archived to cold storage to ensure high querying performance on current debug workloads.
          </p>
        </div>
      </div>
    </div>
  );
}
