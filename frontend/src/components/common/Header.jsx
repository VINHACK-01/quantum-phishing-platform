export default function Header({ connectionStatus, onRefreshAll }) {
  // connectionStatus can be: 'Connected' | 'Connecting' | 'Offline'
  const status = connectionStatus || 'Connecting';

  let statusDotColor = 'bg-amber-400 animate-pulse';
  let statusTextColor = 'text-amber-400';
  let statusText = 'Connecting...';

  if (status === 'Connected') {
    statusDotColor = 'bg-emerald-400';
    statusTextColor = 'text-emerald-400';
    statusText = 'Connected';
  } else if (status === 'Offline') {
    statusDotColor = 'bg-slate-500';
    statusTextColor = 'text-slate-400';
    statusText = 'Offline (Fallback)';
  }

  return (
    <header className="border-b border-slate-900 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                Sentinel<span className="text-cyan-400">AI</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-900 text-slate-300 border border-slate-800">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quantum-Enhanced Phishing Detection & Real-Time Network Threat Intelligence
            </p>
          </div>
        </div>

        {/* System Connection Indicator & Refresh */}
        <div className="flex items-center gap-3">
          {/* Compact Connection Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800/80 text-xs">
            <span className={`w-2 h-2 rounded-full ${statusDotColor}`}></span>
            <span className="text-slate-400 text-[11px] font-mono">
              Backend: <strong className={statusTextColor}>{statusText}</strong>
            </span>
          </div>

          <button
            onClick={onRefreshAll}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Refresh System Feeds"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
