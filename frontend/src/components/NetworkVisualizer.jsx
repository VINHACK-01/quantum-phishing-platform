import React, { useState } from 'react';
import { Activity, ShieldAlert, Radio, Search, RefreshCw, Filter, Terminal, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { playClick } from '@/lib/soundFx';

export default function NetworkVisualizer({ networkData, onRefresh, isLoading }) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);

  const events = networkData?.events || [];
  const totalEvents = networkData?.total_events ?? events.length;

  const filteredEvents = events.filter((evt) => {
    // Category filter
    if (filter === 'SUSPICIOUS' && evt.flag?.toLowerCase() !== 'suspicious') return false;
    if (filter === 'DNS' && evt.protocol?.toUpperCase() !== 'DNS') return false;
    if (filter === 'HTTP' && evt.protocol?.toUpperCase() !== 'HTTP') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSrc = evt.src?.toLowerCase().includes(q);
      const matchDst = evt.dst?.toLowerCase().includes(q);
      const matchReason = evt.reason?.toLowerCase().includes(q);
      const matchProto = evt.protocol?.toLowerCase().includes(q);
      if (!matchSrc && !matchDst && !matchReason && !matchProto) return false;
    }

    return true;
  });

  const handleExportJson = () => {
    playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sentinel-network-events-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleExpand = (id) => {
    playClick();
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 shadow-2xl space-y-5">
      {/* Table Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <span>Network Packet Telemetry Stream</span>
              <Badge variant="default" className="text-[10px]">
                {totalEvents} Active Packets
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">Deep packet inspection (DPI) & protocol anomaly detection</p>
          </div>
        </div>

        {/* Right Tools: Export & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export PCAP Log JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export PCAP</span>
          </button>

          <button
            onClick={() => {
              playClick();
              if (onRefresh) onRefresh();
            }}
            disabled={isLoading}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Network Events"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Filter Chips */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'SUSPICIOUS', 'DNS', 'HTTP'].map((f) => (
            <button
              key={f}
              onClick={() => {
                playClick();
                setFilter(f);
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === f
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by IP, DNS host, or signature..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Network Log Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/80 shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono font-bold tracking-wider">
              <th className="py-3 px-3.5">ID</th>
              <th className="py-3 px-3.5">Timestamp</th>
              <th className="py-3 px-3.5">Protocol</th>
              <th className="py-3 px-3.5">Source IP</th>
              <th className="py-3 px-3.5">Destination IP</th>
              <th className="py-3 px-3.5">Threat Flag</th>
              <th className="py-3 px-3.5">Signatures & Vector Details</th>
              <th className="py-3 px-2 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono tracking-tight">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => {
                const isSuspicious = evt.flag?.toLowerCase() === 'suspicious';
                const isExpanded = expandedEventId === (evt.id || evt.timestamp);

                return (
                  <React.Fragment key={evt.id || evt.timestamp}>
                    <tr
                      onClick={() => toggleExpand(evt.id || evt.timestamp)}
                      className={`transition-colors cursor-pointer ${
                        isSuspicious
                          ? 'bg-rose-950/20 hover:bg-rose-950/30 border-l-2 border-l-rose-500'
                          : 'hover:bg-slate-900/50 border-l-2 border-l-transparent'
                      }`}
                    >
                      <td className="py-3 px-3.5 text-cyan-300 font-semibold">{evt.id || 'evt-N/A'}</td>
                      <td className="py-3 px-3.5 text-slate-400 text-[11px]">
                        {evt.timestamp ? (
                          isNaN(new Date(evt.timestamp).getTime()) ? evt.timestamp : new Date(evt.timestamp).toLocaleTimeString()
                        ) : 'N/A'}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.protocol === 'DNS'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {evt.protocol || 'RAW'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-200 text-[11px]">{evt.src || '127.0.0.1'}</td>
                      <td className="py-3 px-3.5 text-slate-200 text-[11px]">{evt.dst || '0.0.0.0'}</td>
                      <td className="py-3 px-3.5">
                        <Badge variant={isSuspicious ? 'destructive' : 'success'} className="text-[10px]">
                          {evt.flag || 'NORMAL'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3.5 text-slate-300 font-sans text-xs max-w-xs truncate" title={evt.reason}>
                        {evt.reason || 'Normal baseline packet flow'}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                      </td>
                    </tr>

                    {/* Expandable Packet Disassembly Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-900/80">
                        <td colSpan={8} className="p-4 border-t border-slate-800/80">
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="flex items-center gap-1.5 text-cyan-300">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Packet Disassembly & Entropy Diagnostics:</span>
                              </span>
                              <span>TTL: 64 | Window: 65535</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 space-y-1">
                              <p><span className="text-slate-500">Route:</span> {evt.src} ➔ {evt.dst} ({evt.protocol})</p>
                              <p><span className="text-slate-500">Signature:</span> <span className="text-amber-300">{evt.reason}</span></p>
                              <p><span className="text-slate-500">Entropy Payload Hash:</span> <span className="text-cyan-400">0x7f8a9e2c4d1b80</span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                  {isLoading ? 'Streaming real-time PCAP packets...' : 'No network events match the active search filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
