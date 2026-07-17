import { createRoot } from 'react-dom/client';

const SidePanel = () => {
  return (
    <div className="w-full h-screen bg-dark-950 text-dark-50 flex flex-col p-6 overflow-hidden">
      <header className="border-b border-dark-800 pb-4 mb-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-purple-500 bg-clip-text text-transparent">
          AI Debugging Copilot
        </h1>
        <p className="text-dark-400 text-xs mt-1">Side Panel Observer Mode</p>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center border border-dashed border-dark-800 rounded-xl p-8 bg-dark-900/40">
        <p className="text-dark-400 text-sm text-center max-w-xs leading-relaxed">
          The Side Panel Observer will display real-time events, network tracking, and diagnostic outputs synchronized across active tabs.
        </p>
      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<SidePanel />);
}
