export default function Navbar({ activeView, onViewChange, connectionStatus, onRefreshAll }) {
  const status = connectionStatus || 'Connecting';

  let statusDotColor = 'bg-neutral-500 animate-pulse';
  let statusTextColor = 'text-neutral-400';
  let statusText = 'Connecting...';

  if (status === 'Connected') {
    statusDotColor = 'bg-red-500';
    statusTextColor = 'text-red-400';
    statusText = 'Connected';
  } else if (status === 'Offline') {
    statusDotColor = 'bg-neutral-600';
    statusTextColor = 'text-neutral-500';
    statusText = 'Offline (Fallback)';
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'detection', label: 'Threat Inspector' },
    { id: 'awareness', label: 'Awareness' },
    { id: 'history', label: 'Scan Audit' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050505] border-b border-neutral-800/90 shadow-2xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo Mark */}
        <div
          onClick={() => onViewChange('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-900 border border-neutral-800 p-0.5 shadow-lg group-hover:border-red-600/60 transition-all flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-wider text-white leading-none">
                Sentinel<span className="text-red-500">AI</span>
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase">
                SOC v1.0
              </span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-neutral-400 hidden md:block mt-1">
              Quantum-Enhanced Phishing Detection & Network Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="flex items-center bg-[#0d0d0d] p-1 rounded-full border border-neutral-800/90 text-xs overflow-x-auto max-w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all font-semibold cursor-pointer whitespace-nowrap ${
                activeView === item.id
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/50'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Cluster & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d0d0d] border border-neutral-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${statusDotColor}`}></span>
            <span className="text-neutral-400 text-[11px] font-mono">
              API: <strong className={statusTextColor}>{statusText}</strong>
            </span>
          </div>

          <button
            onClick={() => onViewChange('detection')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition-all cursor-pointer border border-red-500/30"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Scan URL</span>
          </button>

          <button
            onClick={onRefreshAll}
            className="p-2 bg-[#0d0d0d] hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full border border-neutral-800 transition-colors cursor-pointer"
            title="Refresh Feeds"
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
