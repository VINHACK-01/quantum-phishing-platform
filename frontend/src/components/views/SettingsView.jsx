export default function SettingsView({ connectionStatus }) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-white tracking-wide">Frontend Platform Settings</h2>
        <p className="text-xs font-sans text-neutral-400 mt-0.5">System configuration and API endpoint diagnostics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Diagnostics */}
        <div className="nexus-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-950 text-red-400 rounded-lg border border-red-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-display text-white tracking-wide">API Connection Endpoint</h3>
              <p className="text-xs font-sans text-neutral-400">Configured backend service host</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs pt-2">
            <div className="bg-[#050505] p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400">VITE_API_BASE_URL</span>
              <span className="text-red-400 font-bold">{apiBase}</span>
            </div>

            <div className="bg-[#050505] p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400">Connection Status</span>
              <span className={`font-bold ${connectionStatus === 'Connected' ? 'text-emerald-400' : 'text-red-400'}`}>
                {connectionStatus}
              </span>
            </div>

            <div className="bg-[#050505] p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400">Swagger API Docs</span>
              <a href={`${apiBase}/docs`} target="_blank" rel="noreferrer" className="text-red-400 hover:underline">
                {apiBase}/docs
              </a>
            </div>
          </div>
        </div>

        {/* System Tokens */}
        <div className="nexus-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-neutral-900 text-neutral-200 rounded-lg border border-neutral-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-23" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Cyber Security Theme Tokens</h3>
              <p className="text-xs text-neutral-400">SOC color system specs</p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050505] border border-neutral-800">
              <span className="text-neutral-400">Primary Accent</span>
              <span className="flex items-center gap-2 font-mono text-red-500">
                <span className="w-3 h-3 rounded-full bg-red-600"></span> #ef4444 (Cyber Red)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050505] border border-neutral-800">
              <span className="text-neutral-400">Obsidian Surface</span>
              <span className="flex items-center gap-2 font-mono text-neutral-300">
                <span className="w-3 h-3 rounded-full bg-[#050505]"></span> #050505 (Near Black)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050505] border border-neutral-800">
              <span className="text-neutral-400">Charcoal Card</span>
              <span className="flex items-center gap-2 font-mono text-neutral-300">
                <span className="w-3 h-3 rounded-full bg-[#121212]"></span> #121212 (Dark Charcoal)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
