import Link from 'next/link';
import { 
  Brain, 
  Shield, 
  Terminal, 
  ArrowRight, 
  Zap, 
  Database, 
  Lock, 
  Cpu, 
  Download, 
  Code, 
  CheckCircle2, 
  Server, 
  Layers, 
  Check,
  ChevronRight,
  Eye,
  Sparkles,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 bg-[#030712] text-gray-100 flex flex-col min-h-screen relative overflow-x-hidden selection:bg-[#7c3aed] selection:text-white">
      {/* Background Radial Neon Accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#7c3aed]/10 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-[#3b82f6]/5 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Corporate Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800/60 bg-[#030712]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#7c3aed]/15 border border-[#7c3aed]/30 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-[#7c3aed]/10">
              <Brain className="h-5 w-5 text-[#a78bfa]" />
            </div>
            <div>
              <span className="font-outfit font-extrabold text-lg text-white tracking-tight">
                Debug<span className="text-[#a78bfa]">Bit</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[9px] bg-gray-800 border border-gray-700 text-gray-400 font-bold tracking-wider uppercase rounded-full">v2.0</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-300">
            <a href="#features" className="hover:text-white transition duration-200">Features</a>
            <a href="#workflow" className="hover:text-white transition duration-200">Architecture</a>
            <a href="#guide" className="hover:text-white transition duration-200">How to Use</a>
            <a href="#pricing" className="hover:text-white transition duration-200">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-gray-300 hover:text-white transition duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-bold text-white rounded-xl transition duration-300 shadow-md shadow-[#7c3aed]/25 hover:scale-[1.02] transform"
            >
              Get Started Free
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Release Announcement Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-xs font-medium text-gray-300 mb-8 shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-[#a78bfa] animate-ping" />
          <span className="text-gray-400">Enterprise AI Upgrade:</span>
          <span className="text-[#a78bfa] font-bold">DebugBit v2.0 is Live</span>
          <ChevronRight className="h-3 w-3 text-gray-500" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-outfit mb-6 text-white max-w-4xl leading-tight">
          Turn Browser Failures Into{' '}
          <span className="bg-gradient-to-r from-[#a78bfa] via-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent">
            Actionable Engineering Intelligence
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed font-sans font-normal">
          An enterprise developer intelligence platform. Automatically capture, scrub, and compress browser telemetry. Stream traces asynchronously into a centralized secure relational dashboard with automated serverless AI root-cause diagnostic reports.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-bold text-white rounded-xl transition duration-300 shadow-lg shadow-[#7c3aed]/20 hover:scale-[1.02] transform"
          >
            Launch Collaborative Cockpit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/AminaiTech/debugbit"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-200 rounded-xl transition duration-300"
          >
            <Terminal className="h-4 w-4" />
            Repository Documentation
          </a>
        </div>

        {/* Premium Mockup / Interactive Telemetry Display */}
        <div className="w-full max-w-5xl rounded-2xl border border-gray-800/80 bg-[#090d16]/80 p-1 backdrop-blur shadow-2xl relative z-10 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed]/5 to-transparent pointer-events-none" />
          
          {/* Mockup Header bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d1222] border-b border-gray-800/80 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-4 text-[10px] font-semibold text-gray-500 font-mono select-none uppercase tracking-widest">SaaS Cloud Session Inspector</span>
            </div>
            <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded text-[10px] font-mono text-gray-400 select-none">
              SESSION ID: db_90a417fd2
            </div>
          </div>

          {/* Interactive Window Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 text-left bg-[#050811] rounded-b-xl min-h-[360px]">
            {/* Session Summary info panel */}
            <div className="border-r border-gray-800/80 p-5 space-y-6 md:col-span-1">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Diagnostic Meta</h3>
                <div className="space-y-2 font-mono text-[10px] text-gray-300">
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">TARGET URL</span>
                    <span className="text-[#a78bfa] truncate max-w-[140px]">auth.myapp.com/login</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">ENVIRONMENT</span>
                    <span>Chrome 139 / Win11</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">LATENCY RANGE</span>
                    <span className="text-yellow-400">429 ms (Slow)</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">SYNC STATE</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> GZIP COMPRESSED
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/40 border border-gray-800/80 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-[#a78bfa] font-semibold text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Root-Cause</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                  The API server returned a <code className="text-red-400 bg-red-950/40 px-1 py-0.5 rounded font-mono">500 Internal Server Error</code> after receiving the login dispatch. This is highly correlated with a database connection failure.
                </p>
              </div>
            </div>

            {/* Trace Sequence timeline */}
            <div className="md:col-span-2 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-4">Event Correlation Sequence</h3>
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex items-start gap-3 border-l-2 border-green-500/30 pl-4 relative pb-1">
                    <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-gray-500 text-[10px]">11:34:02.12</span>
                    <span className="text-green-400 font-semibold">PAGE_LOADED</span>
                    <span className="text-gray-400 truncate max-w-[280px]">auth.myapp.com/login (Vitals: LCP 1.1s)</span>
                  </div>

                  <div className="flex items-start gap-3 border-l-2 border-blue-500/30 pl-4 relative pb-1">
                    <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-gray-500 text-[10px]">11:34:10.50</span>
                    <span className="text-blue-400 font-semibold">USER_ACTION</span>
                    <span className="text-gray-400">Click Element (button#btn-login)</span>
                  </div>

                  <div className="flex items-start gap-3 border-l-2 border-yellow-500/30 pl-4 relative pb-1">
                    <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-gray-500 text-[10px]">11:34:10.55</span>
                    <span className="text-yellow-400 font-semibold">NET_DISPATCH</span>
                    <span className="text-gray-300">POST /api/auth/login</span>
                  </div>

                  <div className="flex items-start gap-3 border-l-2 border-red-500/30 pl-4 relative pb-1">
                    <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-gray-500 text-[10px]">11:34:10.98</span>
                    <span className="text-red-400 font-semibold">500_ERROR</span>
                    <span className="text-red-300 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded text-[10px]">Database Handshake Interrupted</span>
                  </div>
                </div>
              </div>

              {/* Console logs tab panel snippet */}
              <div className="border-t border-gray-800/80 pt-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold rounded uppercase">Uncaught Exception</div>
                  <span className="text-[10px] text-gray-500 font-mono">11:34:10.99</span>
                </div>
                <code className="block text-[10px] font-mono text-gray-400 bg-gray-950 p-2.5 rounded-lg border border-gray-900 max-w-full overflow-x-auto">
                  TypeError: Cannot read properties of undefined (reading 'token') at Login.tsx:42
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10 border-t border-gray-800/40">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white mb-4">Enterprise Infrastructure Components</h2>
          <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">
            A comprehensive developer intelligence pipeline built with absolute performance, stability, and data compliance at its core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#090d16]/60 border border-gray-800/70 p-6 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition duration-300 group">
            <div>
              <div className="mb-4 bg-[#7c3aed]/10 border border-[#7c3aed]/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#a78bfa]" />
              </div>
              <h3 className="font-outfit font-bold text-base text-white mb-2 group-hover:text-[#a78bfa] transition">Client-Side Sanitization</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Zero-Trust local-first PII scrubbers run inside your sandbox, securely masking authentication header variables, sensitive database cookies, and passwords before syncing metadata online.
              </p>
            </div>
            <div className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1 select-none">
              <Check className="h-3.5 w-3.5 text-green-500" /> SECURE HANDSHAKES
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#090d16]/60 border border-gray-800/70 p-6 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition duration-300 group">
            <div>
              <div className="mb-4 bg-[#7c3aed]/10 border border-[#7c3aed]/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#a78bfa]" />
              </div>
              <h3 className="font-outfit font-bold text-base text-white mb-2 group-hover:text-[#a78bfa] transition">Gzip Ingestion API</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                The collector utilizes native CompressionStream to pack telemetry data into tight Gzip blobs. The Next.js REST sync endpoint automatically decompresses buffers using Node's standard zlib API.
              </p>
            </div>
            <div className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1 select-none">
              <Check className="h-3.5 w-3.5 text-green-500" /> up to 85% bandwidth save
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#090d16]/60 border border-gray-800/70 p-6 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition duration-300 group">
            <div>
              <div className="mb-4 bg-[#7c3aed]/10 border border-[#7c3aed]/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#a78bfa]" />
              </div>
              <h3 className="font-outfit font-bold text-base text-white mb-2 group-hover:text-[#a78bfa] transition">Serverless AI Pipeline</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Trigger.dev background queues capture synced payloads, delegating analysis processes to non-blocking Gemini LLM prompts. View confidence scores, root cause metrics, and recommend check lines instantly.
              </p>
            </div>
            <div className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1 select-none">
              <Check className="h-3.5 w-3.5 text-green-500" /> NON-BLOCKING TRIGGER QUEUES
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Tech Stack Section */}
      <section id="workflow" className="py-16 bg-[#060a12]/80 border-y border-gray-800/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-full text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider mb-4">
              <Server className="h-3 w-3" /> Architecture Overview
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white mb-6 leading-tight">The Modern Developer Observability Platform</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              DebugBit is fully integrated with a production-ready cloud system, enabling robust multi-tenant collaboration, team project segmentation, signature-verified Stripe webhooks, and transactional emails.
            </p>

            <div className="space-y-4 text-xs font-semibold text-gray-300">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-500/10 rounded border border-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>@clerk/nextjs multi-tenant sign-in, sign-up, and RBAC layout switches.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-500/10 rounded border border-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>Supabase DDL relational schema migrations protecting developer organizations.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-500/10 rounded border border-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>Stripe Billing Portal checkout integration parsing premium team quota tiers.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-500/10 rounded border border-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>Resend SDK & Novu in-app system delivering gorgeous transactional reports.</span>
              </div>
            </div>
          </div>

          {/* Interactive Stack Visualization Cards */}
          <div className="bg-[#090d16]/80 border border-gray-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7c3aed]/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-outfit font-bold text-sm text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#a78bfa]" /> Workspace Tech Stack
            </h3>
            <div className="space-y-4 font-mono text-[11px]">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-900 flex justify-between items-center">
                <span className="text-gray-500 uppercase">Framework</span>
                <span className="text-gray-200">Next.js 14 App Router</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-900 flex justify-between items-center">
                <span className="text-gray-500 uppercase">Data Access</span>
                <span className="text-gray-200">@supabase/supabase-js & @supabase/ssr</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-900 flex justify-between items-center">
                <span className="text-gray-500 uppercase">Local Storage</span>
                <span className="text-gray-200">Dexie.js / IndexedDB</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-900 flex justify-between items-center">
                <span className="text-gray-500 uppercase">Asynchronous Queues</span>
                <span className="text-gray-200">Trigger.dev Serverless Jobs</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-900 flex justify-between items-center">
                <span className="text-gray-500 uppercase">Identity / Webhooks</span>
                <span className="text-[#a78bfa]">Clerk Security Guard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Usage Guide (interactive view) */}
      <section id="guide" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10 border-b border-gray-800/40">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-4">
            <Download className="h-3 w-3" /> Quickstart Playbook
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white mb-4">How to Use DebugBit v2.0</h2>
          <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">
            Get your developer telemetry streams up and running locally inside 5 minutes.
          </p>
        </div>

        {/* Vertical Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start relative">
          
          {/* Step 1 */}
          <div className="md:col-span-1 text-left relative bg-gray-900/15 border border-gray-800/50 p-5 rounded-2xl">
            <div className="absolute -top-4 left-5 w-8 h-8 rounded-full bg-[#7c3aed] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 select-none">
              01
            </div>
            <h3 className="font-outfit font-bold text-sm text-white mb-2 pt-1.5 uppercase">Compile & Install</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
              Compile the collector client dependencies locally to package the unpacked distribution:
            </p>
            <code className="block text-[9px] font-mono text-gray-300 bg-black p-2 rounded-lg border border-gray-900 select-all overflow-x-auto">
              npm run build
            </code>
          </div>

          {/* Step 2 */}
          <div className="md:col-span-1 text-left relative bg-gray-900/15 border border-gray-800/50 p-5 rounded-2xl">
            <div className="absolute -top-4 left-5 w-8 h-8 rounded-full bg-[#7c3aed] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 select-none">
              02
            </div>
            <h3 className="font-outfit font-bold text-sm text-white mb-2 pt-1.5 uppercase">Load Extension</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Navigate to <code className="text-blue-400 font-mono text-[10px]">chrome://extensions</code> inside your browser. Enable Developer mode, click <strong>Load unpacked</strong>, and select the compiled <strong>`dist/`</strong> folder.
            </p>
          </div>

          {/* Step 3 */}
          <div className="md:col-span-1 text-left relative bg-gray-900/15 border border-gray-800/50 p-5 rounded-2xl">
            <div className="absolute -top-4 left-5 w-8 h-8 rounded-full bg-[#7c3aed] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 select-none">
              03
            </div>
            <h3 className="font-outfit font-bold text-sm text-white mb-2 pt-1.5 uppercase">Generate Project API Key</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Log into the <Link href="/dashboard" className="text-[#a78bfa] hover:underline">SaaS Dashboard</Link>, navigate to Projects, and generate an API key. Insert this key inside your loaded extension settings panel to bind your browser session.
            </p>
          </div>

          {/* Step 4 */}
          <div className="md:col-span-1 text-left relative bg-gray-900/15 border border-gray-800/50 p-5 rounded-2xl">
            <div className="absolute -top-4 left-5 w-8 h-8 rounded-full bg-[#7c3aed] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 select-none">
              04
            </div>
            <h3 className="font-outfit font-bold text-sm text-white mb-2 pt-1.5 uppercase">Capture Telemetry</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Open developer tools while browsing. Live console streams, payload errors, and slow network cycles will be buffered inside IndexedDB, compressed via Gzip, and dispatched.
            </p>
          </div>

          {/* Step 5 */}
          <div className="md:col-span-1 text-left relative bg-gray-900/15 border border-gray-800/50 p-5 rounded-2xl">
            <div className="absolute -top-4 left-5 w-8 h-8 rounded-full bg-[#7c3aed] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 select-none">
              05
            </div>
            <h3 className="font-outfit font-bold text-sm text-white mb-2 pt-1.5 uppercase">AI Report Diagnostic</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              As soon as a session concludes, view your AI diagnostic report cached inside the DB, collaborate on traces, or get transactional report notifications instantly.
            </p>
          </div>

        </div>
      </section>

      {/* Corporate Pricing Catalog */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white mb-4">Scalable Developer Pricing Plans</h2>
          <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">
            Choose a plan that fits your engineering team size. Features are gated dynamically using Stripe billing portal integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="bg-[#090d16]/40 border border-gray-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Community</span>
              <div className="mt-4 mb-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-outfit">$0</span>
                <span className="text-xs text-gray-400">/ user / mo</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">Perfect for individual developers and small personal debug sessions.</p>
              
              <hr className="border-gray-800/80 my-4" />
              
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#a78bfa]" /> up to 5 synced sessions / day
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#a78bfa]" /> basic console, network captures
                </li>
                <li className="flex items-center gap-2 text-gray-500 line-through">
                  Trigger.dev Background AI Diagnostics
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 w-full block text-center px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-gray-200 rounded-xl transition"
            >
              Get Started
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="bg-[#090d16]/80 border-2 border-[#7c3aed] p-8 rounded-2xl flex flex-col justify-between shadow-xl shadow-[#7c3aed]/5 relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-0.5 bg-[#7c3aed] text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-md">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#a78bfa]">Developer Pro</span>
              <div className="mt-4 mb-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-outfit">$19</span>
                <span className="text-xs text-gray-400">/ user / mo</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">Unlocks non-blocking AI reports and priority serverless processing.</p>
              
              <hr className="border-gray-800/80 my-4" />
              
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-500" /> UNLIMITED synced sessions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-500" /> Trigger.dev Background AI reports
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-500" /> Client-side Gzip payload compression
                </li>
                <li className="flex items-center gap-2 text-gray-500 line-through">
                  Multi-tenant RBAC invite widgets
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 w-full block text-center px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-bold text-white rounded-xl transition shadow-md shadow-[#7c3aed]/10"
            >
              Go Pro Now
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="bg-[#090d16]/40 border border-gray-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-gray-700 transition">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Engineering Team</span>
              <div className="mt-4 mb-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-outfit">$49</span>
                <span className="text-xs text-gray-400">/ user / mo</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">Complete organization telemetry sharing, comments, and audit metrics.</p>
              
              <hr className="border-gray-800/80 my-4" />
              
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#a78bfa]" /> Everything in Developer Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#a78bfa]" /> RBAC Teammate Invitations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#a78bfa]" /> Shared thread comment widgets
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#a78bfa]" /> Custom Novu notification alerts
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 w-full block text-center px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-gray-200 rounded-xl transition"
            >
              Get Team License
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Badges / Compliance Footer */}
      <footer className="mt-auto border-t border-gray-800/60 bg-[#02050c] px-6 py-12 relative z-10 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#a78bfa]" />
            <span className="font-outfit font-extrabold text-sm text-white select-none">
              Debug<span className="text-[#a78bfa]">Bit</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-[10px] uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Database className="h-3 w-3 text-gray-500" />
              Supabase DB Protected
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Lock className="h-3 w-3 text-gray-500" />
              Zero-Trust Ingest Guard
            </span>
            <span className="flex items-center gap-1.5 text-gray-400 text-green-500">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              COMPRESSED GZIP WIRE ENCODED
            </span>
          </div>

          <p className="text-[11px] font-sans">
            &copy; {new Date().getFullYear()} Aminai Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
