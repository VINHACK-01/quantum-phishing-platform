export default function HistoryTable({ historyData, onSelectScan, isLoading }) {
  const scans = historyData?.scans || [];

  return (
    <div className="nexus-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-neutral-900 text-neutral-300 rounded-lg border border-neutral-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-display text-white tracking-wide flex items-center gap-2">
              Scan Audit History Log
              <span className="text-xs font-mono font-normal text-neutral-400">({scans.length} Scans)</span>
            </h3>
            <p className="text-xs font-sans text-neutral-400">Recent FIFO analysis queue history</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-[#050505]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-3.5">Scan ID</th>
              <th className="py-3 px-3.5">Target Domain URL</th>
              <th className="py-3 px-3.5">Risk Assessment</th>
              <th className="py-3 px-3.5">Probability</th>
              <th className="py-3 px-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono tracking-tight">
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
                    className="hover:bg-neutral-900/80 transition-colors cursor-pointer group"
                    title="Click to populate URL in scanner"
                  >
                    <td className="py-3 px-3.5 text-neutral-400 font-medium group-hover:text-red-400">
                      {scan.id || 'scan-N/A'}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-200 max-w-xs truncate" title={scan.url}>
                      {scan.url}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeClass}`}>
                        {scan.risk_level || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-white">
                      {probPercent}%
                    </td>
                    <td className="py-3 px-3.5 text-neutral-400 text-[11px]">
                      {scan.timestamp ? (
                        isNaN(new Date(scan.timestamp).getTime()) ? scan.timestamp : new Date(scan.timestamp).toLocaleTimeString()
                      ) : 'N/A'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500 font-sans text-xs">
                  {isLoading ? 'Loading scan history...' : 'No recent scans found in FIFO queue.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
