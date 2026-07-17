import Link from 'next/link';
import { Brain, Shield, Terminal, ArrowRight, Zap, Database, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-dark-950 px-4 py-16 relative overflow-hidden">
      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center">
        {/* Logo Icon Badge */}
        <div className="mb-6 bg-brand-500/10 border border-brand-500/30 p-3.5 rounded-2xl flex items-center justify-center animate-pulse">
          <Brain className="h-10 w-10 text-brand-400" />
        </div>

        {/* Hero Headers */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display mb-4 text-white leading-tight">
          Welcome to the{' '}
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-purple-400 bg-clip-text text-transparent">
            DebugBit SaaS
          </span>{' '}
          Cloud
        </h1>
        <p className="text-sm sm:text-base text-dark-300 max-w-lg mb-8 leading-relaxed">
          The next-generation AI Developer Intelligence Platform. Correlate browser telemetry, audit performance bottlenecks, and perform zero-trust serverless diagnostic analysis.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left mb-10">
          <div className="bg-dark-900/60 border border-dark-800/80 p-5 rounded-2xl neon-border-glow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-brand-500/10 rounded-lg">
                <Zap className="h-4 w-4 text-brand-400" />
              </div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">Cloud Synchronization</h3>
            </div>
            <p className="text-[11px] text-dark-400 leading-relaxed">
              Sync telemetry recordings automatically from your browser workspace directly into centralized secure SQL storage.
            </p>
          </div>

          <div className="bg-dark-900/60 border border-dark-800/80 p-5 rounded-2xl neon-border-glow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-brand-500/10 rounded-lg">
                <Shield className="h-4 w-4 text-brand-400" />
              </div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">Local Scrubbing</h3>
            </div>
            <p className="text-[11px] text-dark-400 leading-relaxed">
              Proprietary local-first security engines scrub raw tokens, access cookies, and credential formats inside your sandbox.
            </p>
          </div>
        </div>

        {/* Core CTA Action Handlers */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white rounded-xl transition duration-300 glow-btn"
          >
            Launch Cloud Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <a
            href="https://github.com/AminaiTech/debugbit"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-dark-900 hover:bg-dark-800 border border-dark-800 hover:border-dark-700 text-xs font-bold text-dark-200 rounded-xl transition duration-300"
          >
            <Terminal className="h-3.5 w-3.5" />
            Repository Documentation
          </a>
        </div>

        {/* Footer Sub-badges */}
        <div className="mt-12 flex items-center gap-6 text-[10px] uppercase tracking-wider font-semibold text-dark-500">
          <span className="flex items-center gap-1.5">
            <Database className="h-3 w-3" />
            Supabase DB Protected
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Zero-Trust Gateway
          </span>
        </div>
      </div>
    </div>
  );
}
