export default function HistoryTable({ historyData, onSelectScan, isLoading }) {
  const scans = historyData?.scans || [];

  return (
    <div className="glass-panel p-6 shadow-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-slate-900 text-slate-300 rounded border border-slate-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Scan Audit History Log
              <span className="text-xs font-mono font-normal text-slate-400">({scans.length} Scans)</span>
            </h3>
            <p className="text-xs text-slate-400">Recent FIFO analysis queue history</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-2.5 px-3">Scan ID</th>
              <th className="py-2.5 px-3">Target URL</th>
              <th className="py-2.5 px-3">Risk Assessment</th>
              <th className="py-2.5 px-3">Probability</th>
              <th className="py-2.5 px-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {scans.length > 0 ? (
              scans.map((scan) => {
                const rawProb = typeof scan.phishing_probability === 'number' ? scan.phishing_probability : 0;
                const probPercent = Math.round(rawProb * 100);
                
                let badgeClass = 'risk-badge-low';
                if (scan.risk_level === 'HIGH' || probPercent >= 70) badgeClass = 'risk-badge-high';
                else if (scan.risk_level === 'MEDIUM' || probPercent >= 30) badgeClass = 'risk-badge-medium';

                return (
                  <tr
                    key={scan.id || scan.timestamp}
                    onClick={() => onSelectScan && onSelectScan(scan)}
                    className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                    title="Click to populate URL in scanner"
                  >
                    <td className="py-2.5 px-3 text-slate-400 font-medium group-hover:text-cyan-400">
                      {scan.id || 'scan-N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 max-w-xs truncate" title={scan.url}>
                      {scan.url}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}`}>
                        {scan.risk_level || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-200">
                      {probPercent}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {scan.timestamp ? (
                        isNaN(new Date(scan.timestamp).getTime()) ? scan.timestamp : new Date(scan.timestamp).toLocaleTimeString()
                      ) : 'N/A'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans text-xs">
                  {isLoading ? 'Loading scan history...' : 'No recent scans found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
