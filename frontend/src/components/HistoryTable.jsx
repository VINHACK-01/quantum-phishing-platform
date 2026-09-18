import React, { useState } from 'react';
import { History, Search, Download, ExternalLink, ShieldCheck, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { playClick } from '@/lib/soundFx';

export default function HistoryTable({ historyData, onSelectScan, isLoading }) {
  const [search, setSearch] = useState('');
  const scans = historyData?.scans || [];

  const filteredScans = scans.filter((scan) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      scan.url?.toLowerCase().includes(q) ||
      scan.id?.toLowerCase().includes(q) ||
      scan.risk_level?.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    playClick();
    if (scans.length === 0) return;
    const headers = ['id', 'url', 'risk_level', 'phishing_probability', 'timestamp'];
    const rows = scans.map((s) => [
      s.id || '',
      `"${s.url || ''}"`,
      s.risk_level || '',
      s.phishing_probability ?? '',
      `"${s.timestamp || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `sentinel-audit-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <span>Scan Audit History Log</span>
              <Badge variant="secondary" className="text-[10px]">
                {scans.length} Scans Archived
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">Chronological FIFO queue of previous quantum threat assessments</p>
          </div>
        </div>

        {/* Right Tools: Export CSV */}
        <button
          onClick={handleExportCsv}
          disabled={scans.length === 0}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit log by domain, ID, or risk..."
          className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
        />
      </div>

      {/* History Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/80 shadow-inner">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3.5">Scan ID</th>
              <th className="py-3 px-3.5">Evaluated Target Domain</th>
              <th className="py-3 px-3.5">Risk Assessment</th>
              <th className="py-3 px-3.5">Score</th>
              <th className="py-3 px-3.5">Timestamp</th>
              <th className="py-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 tracking-tight">
            {filteredScans.length > 0 ? (
              filteredScans.map((scan) => {
                const rawProb = typeof scan.phishing_probability === 'number' ? scan.phishing_probability : 0;
                const probPercent = Math.round(rawProb * 100);

                const isHigh = scan.risk_level === 'HIGH' || probPercent >= 70;
                const isMedium = scan.risk_level === 'MEDIUM' || (probPercent >= 30 && probPercent < 70);

                return (
                  <tr
                    key={scan.id || scan.timestamp}
                    onClick={() => {
                      playClick();
                      onSelectScan && onSelectScan(scan);
                    }}
                    className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                    title="Click to load into URL threat inspector"
                  >
                    <td className="py-3 px-3.5 text-cyan-400 font-semibold group-hover:underline">
                      {scan.id || 'scan-N/A'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-200 max-w-xs truncate" title={scan.url}>
                      {scan.url}
                    </td>
                    <td className="py-3 px-3.5">
                      <Badge variant={isHigh ? 'destructive' : isMedium ? 'warning' : 'success'} className="text-[10px]">
                        {scan.risk_level || (isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-200">
                      {probPercent}%
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 text-[11px]">
                      {scan.timestamp ? (
                        isNaN(new Date(scan.timestamp).getTime()) ? scan.timestamp : new Date(scan.timestamp).toLocaleTimeString()
                      ) : 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-500 group-hover:text-cyan-400">
                      <ArrowUpRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                  {isLoading ? 'Retrieving audit history...' : 'No scan history matching the active query.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
