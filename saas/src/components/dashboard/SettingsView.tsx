'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Lock, 
  Check, 
  Settings, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  apiKey: string;
  generateNewKey: () => void;
}

export default function SettingsView({
  apiKey,
  generateNewKey
}: SettingsViewProps) {
  const [copied, setCopied] = useState(false);
  const [localRedact, setLocalRedact] = useState(true);
  const [sslValidate, setSslValidate] = useState(true);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Sync API Key Controller */}
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key className="h-4 w-4 text-[#a78bfa]" />
          Sync Credentials
        </h4>
        <p className="text-gray-400 text-xs leading-relaxed">
          Piping telemetry logs or DOM mutations from your client application requires authenticating with your unique sync credential key. Do not reveal this key publicly.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-[#030712] border border-[#1f2937] rounded-xl px-4 py-3 flex items-center justify-between font-mono text-xs select-all text-white overflow-x-auto">
            <span>{apiKey}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                copied
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-[#111827] text-white border-[#1f2937] hover:bg-[#1f2937]'
              }`}
            >
              {copied ? 'Copied' : 'Copy Key'}
            </button>
            <button
              onClick={generateNewKey}
              className="px-4 py-3 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md shadow-[#7c3aed]/10 transition-all border border-transparent"
            >
              Rotate Key
            </button>
          </div>
        </div>
      </div>

      {/* Localized Security Switch Matrix */}
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-3xl p-6 shadow-xl space-y-6">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#a78bfa]" />
          Privacy & Redaction Parameters
        </h4>

        <div className="space-y-4">
          {/* Security Switch 1 */}
          <div className="bg-[#030712] border border-[#1f2937]/60 p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white">Strict PII Redaction Filter</span>
              <span className="text-[11px] text-gray-500 leading-normal max-w-md">
                Locally sanitizes and redacts credit cards, emails, and passwords on client inputs before dispatching telemetry frames to cloud servers.
              </span>
            </div>
            <button
              onClick={() => setLocalRedact(!localRedact)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                localRedact ? 'bg-emerald-500' : 'bg-[#1f2937]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localRedact ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Security Switch 2 */}
          <div className="bg-[#030712] border border-[#1f2937]/60 p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white">Enforce Strict SSL Certificate Verification</span>
              <span className="text-[11px] text-gray-500 leading-normal max-w-md">
                Blocks incoming telemetry requests from domains with self-signed, invalid, or expired SSL certificates to prevent man-in-the-middle exploits.
              </span>
            </div>
            <button
              onClick={() => setSslValidate(!sslValidate)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                sslValidate ? 'bg-emerald-500' : 'bg-[#1f2937]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  sslValidate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
