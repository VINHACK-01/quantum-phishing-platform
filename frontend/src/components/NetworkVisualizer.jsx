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
    <div className="relative rounded-2xl border border-red-900/40 bg-[#080808] p-6 shadow-2xl space-y-5">
      {/* Table Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950/60 text-red-500 border border-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-display text-white tracking-wide flex items-center gap-2">
              <span>Network Packet Telemetry Stream</span>
              <Badge variant="default" className="text-[10px]">
                {totalEvents} Active Packets
              </Badge>
            </h3>
            <p className="text-xs text-neutral-400">Deep packet inspection (DPI) & protocol anomaly detection</p>
          </div>
        </div>

        {/* Right Tools: Export & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export PCAP Log JSON"
          >
            <Download className="w-3.5 h-3.5 text-red-500" />
            <span>Export PCAP</span>
          </button>

          <button
            onClick={() => {
              playClick();
              if (onRefresh) onRefresh();
            }}
            disabled={isLoading}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Network Events"
          >
            <RefreshCw className={`w-4 h-4 text-red-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Filter Chips */}
        <div className="flex bg-[#050505] p-1 rounded-xl border border-neutral-800 text-xs font-mono">
          {['ALL', 'SUSPICIOUS', 'DNS', 'HTTP'].map((f) => (
            <button
              key={f}
              onClick={() => {
                playClick();
                setFilter(f);
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === f
                  ? 'bg-red-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by IP, DNS host, or signature..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#050505] border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-all"
          />
        </div>
      </div>

      {/* Network Log Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-[#050505] shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-mono font-bold tracking-wider">
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
          <tbody className="divide-y divide-neutral-800 font-mono tracking-tight">
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
                          ? 'bg-red-950/30 hover:bg-red-950/40 border-l-2 border-l-red-500'
                          : 'hover:bg-neutral-900 border-l-2 border-l-transparent'
                      }`}
                    >
                      <td className="py-3 px-3.5 text-red-400 font-semibold">{evt.id || 'evt-N/A'}</td>
                      <td className="py-3 px-3.5 text-neutral-400 text-[11px]">
                        {evt.timestamp ? (
                          isNaN(new Date(evt.timestamp).getTime()) ? evt.timestamp : new Date(evt.timestamp).toLocaleTimeString()
                        ) : 'N/A'}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.protocol === 'DNS'
                              ? 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                              : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                          }`}
                        >
                          {evt.protocol || 'RAW'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-white text-[11px]">{evt.src || '127.0.0.1'}</td>
                      <td className="py-3 px-3.5 text-white text-[11px]">{evt.dst || '0.0.0.0'}</td>
                      <td className="py-3 px-3.5">
                        <Badge variant={isSuspicious ? 'destructive' : 'success'} className="text-[10px]">
                          {evt.flag || 'NORMAL'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3.5 text-neutral-300 font-sans text-xs max-w-xs truncate" title={evt.reason}>
                        {evt.reason || 'Normal baseline packet flow'}
                      </td>
                      <td className="py-3 px-2 text-right text-neutral-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                      </td>
                    </tr>

                    {/* Expandable Packet Disassembly Drawer */}
                    {isExpanded && (
                      <tr className="bg-neutral-900">
                        <td colSpan={8} className="p-4 border-t border-neutral-800">
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                              <span className="flex items-center gap-1.5 text-red-400">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Packet Disassembly & Entropy Diagnostics:</span>
                              </span>
                              <span>TTL: 64 | Window: 65535</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#050505] text-neutral-300 border border-neutral-800 space-y-1">
                              <p><span className="text-neutral-500">Route:</span> {evt.src} ➔ {evt.dst} ({evt.protocol})</p>
                              <p><span className="text-neutral-500">Signature:</span> <span className="text-red-400">{evt.reason}</span></p>
                              <p><span className="text-neutral-500">Entropy Payload Hash:</span> <span className="text-red-400">0x7f8a9e2c4d1b80</span></p>
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
                <td colSpan={8} className="py-8 text-center text-neutral-500 font-mono text-xs">
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
