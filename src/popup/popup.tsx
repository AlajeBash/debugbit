import { createRoot } from 'react-dom/client';

const Popup = () => {
  return (
    <div className="w-[360px] min-h-[400px] bg-dark-950 text-dark-50 p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-purple-500 bg-clip-text text-transparent mb-2">
          AI Debugging Copilot
        </h1>
        <p className="text-dark-400 text-xs leading-relaxed mb-4">
          Observe and capture browser sessions instantly. Open Chrome DevTools (press F12) or open the Side Panel for full analysis.
        </p>
      </div>
      <div className="p-4 bg-dark-900 border border-dark-800 rounded-xl">
        <span className="text-xs font-semibold text-brand-400 block mb-1">Status</span>
        <span className="text-sm font-medium text-dark-200">Recorder Ready</span>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
