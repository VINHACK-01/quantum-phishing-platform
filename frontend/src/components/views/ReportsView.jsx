import QuantumComparison from '../QuantumComparison';

export default function ReportsView({ historyData, scanResult }) {
  const scans = historyData?.scans || [];
  const highRisk = scans.filter((s) => s.risk_level === 'HIGH').length;
  const mediumRisk = scans.filter((s) => s.risk_level === 'MEDIUM').length;
  const lowRisk = scans.filter((s) => s.risk_level === 'LOW').length;
  const total = scans.length || 1;

  const highPercent = Math.round((highRisk / total) * 100);
  const mediumPercent = Math.round((mediumRisk / total) * 100);
  const lowPercent = Math.round((lowRisk / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-white tracking-wide">Threat Analytics & Benchmark Reports</h2>
        <p className="text-xs font-sans text-neutral-400 mt-0.5">Aggregated risk metrics and quantum classifier evaluation statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="nexus-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-950 text-red-400 rounded-lg border border-red-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-display text-white tracking-wide">Threat Risk Breakdown</h3>
              <p className="text-xs font-sans text-neutral-400">Distribution of evaluated scan results</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* High */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-red-500 font-semibold">HIGH RISK</span>
                <span className="text-white font-bold">{highRisk} ({highPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-neutral-800">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${highPercent}%` }}></div>
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-semibold">MEDIUM RISK</span>
                <span className="text-white font-bold">{mediumRisk} ({mediumPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-neutral-800">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mediumPercent}%` }}></div>
              </div>
            </div>

            {/* Low */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-300 font-semibold">LOW RISK</span>
                <span className="text-white font-bold">{lowRisk} ({lowPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-neutral-800">
                <div className="h-full bg-neutral-400 rounded-full" style={{ width: `${lowPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quantum Comparison Panel */}
        <QuantumComparison comparisonData={scanResult?.quantum_comparison} />
      </div>
    </div>
  );
}
