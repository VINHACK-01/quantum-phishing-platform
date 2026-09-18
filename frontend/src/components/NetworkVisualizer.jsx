import { useState } from 'react';

export default function NetworkVisualizer({ networkData, onRefresh, isLoading }) {
  const [filter, setFilter] = useState('ALL');

  const events = networkData?.events || [];
  const totalEvents = networkData?.total_events ?? events.length;

  const filteredEvents = events.filter((evt) => {
    if (filter === 'SUSPICIOUS') return evt.flag?.toLowerCase() === 'suspicious';
    if (filter === 'DNS') return evt.protocol?.toUpperCase() === 'DNS';
    if (filter === 'HTTP') return evt.protocol?.toUpperCase() === 'HTTP';
    return true;
  });

  return (
    <div className="glass-panel p-6 shadow-xl border border-slate-800 space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-cyan-950 text-cyan-400 rounded border border-cyan-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Network Threat Events Log
              <span className="text-xs font-mono font-normal text-slate-400">({totalEvents} Total)</span>
            </h3>
            <p className="text-xs text-slate-400">Real-time PCAP traffic analysis feed</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'SUSPICIOUS', 'DNS', 'HTTP'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-cyan-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Network Feed"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Network Log Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-2.5 px-3">Event ID</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Protocol</th>
              <th className="py-2.5 px-3">Source IP</th>
              <th className="py-2.5 px-3">Destination IP</th>
              <th className="py-2.5 px-3">Flag</th>
              <th className="py-2.5 px-3">Detected Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => {
                const isSuspicious = evt.flag?.toLowerCase() === 'suspicious';
                return (
                  <tr key={evt.id || evt.timestamp} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{evt.id || 'evt-N/A'}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {evt.timestamp ? (
                        isNaN(new Date(evt.timestamp).getTime()) ? evt.timestamp : new Date(evt.timestamp).toLocaleTimeString()
                      ) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.protocol === 'DNS' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-purple-950 text-purple-400 border border-purple-800'
                      }`}>
                        {evt.protocol || 'RAW'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">{evt.src || '127.0.0.1'}</td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">{evt.dst || '0.0.0.0'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isSuspicious ? 'risk-badge-high' : 'risk-badge-low'
                      }`}>
                        {evt.flag || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-xs max-w-xs truncate" title={evt.reason}>
                      {evt.reason || 'No detailed reason provided'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans text-xs">
                  {isLoading ? 'Fetching network events feed...' : 'No network events found matching filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
