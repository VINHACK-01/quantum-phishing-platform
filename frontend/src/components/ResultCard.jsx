export default function ResultCard({ result, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="nexus-card p-6 flex flex-col items-center justify-center min-h-[260px] text-center">
        <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-3"></div>
        <p className="text-white font-bold text-sm">Evaluating Threat Vectors...</p>
        <p className="text-neutral-500 text-xs mt-1">Inspecting domain structure, entropy metrics, and model probabilities</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nexus-card p-6 border-red-900/50 bg-red-950/20 min-h-[260px] flex flex-col justify-center">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-sm font-bold text-red-300">Analysis Error</h3>
            <p className="text-xs text-red-400/90 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="nexus-card p-6 flex flex-col items-center justify-center min-h-[260px] text-center">
        <div className="p-3 bg-neutral-900 rounded-full text-neutral-500 mb-3 border border-neutral-800">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-white font-bold text-sm">Ready for Threat Inspection</h3>
        <p className="text-neutral-500 text-xs mt-1 max-w-xs">
          Enter a URL above to inspect phishing probability, threat indicators, and risk classification.
        </p>
      </div>
    );
  }

  const { url, phishing_probability, risk_level, reasons } = result;
  const rawProb = typeof phishing_probability === 'number' ? phishing_probability : 0;
  const probPercent = Math.round(rawProb * 100);

  let badgeClass = 'risk-badge-low';
  let cardBorderBg = 'border-neutral-800 bg-neutral-950/60';
  let gaugeColor = 'bg-neutral-500';
  let textColor = 'text-white';

  if (risk_level === 'HIGH' || probPercent >= 70) {
    badgeClass = 'risk-badge-high';
    cardBorderBg = 'border-red-900/50 bg-red-950/20';
    gaugeColor = 'bg-red-500';
    textColor = 'text-red-500';
  } else if (risk_level === 'MEDIUM' || probPercent >= 30) {
    badgeClass = 'risk-badge-medium';
    cardBorderBg = 'border-amber-900/50 bg-amber-950/20';
    gaugeColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  return (
    <div className="nexus-card p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-800/80 pb-3.5">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Scanned Target</span>
          <p className="text-xs font-mono text-white truncate mt-0.5" title={url}>
            {url}
          </p>
        </div>
        <div className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${badgeClass}`}>
          {risk_level || 'UNKNOWN'} RISK
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${cardBorderBg} flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner`}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">Phishing Threat Probability</span>
          <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
            Backend Metric: <code className="text-neutral-300">phishing_probability = {rawProb}</code>
          </span>
        </div>
        <div className="text-right flex flex-col items-end shrink-0">
          <span className={`text-5xl sm:text-6xl font-display tracking-wide ${textColor}`}>
            {probPercent}%
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden p-0.5 border border-neutral-800">
          <div
            className={`h-full rounded-full ${gaugeColor} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, Math.max(2, probPercent))}%` }}
          ></div>
        </div>
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Assessment Reasons ({reasons?.length || 0})
        </h4>
        {reasons && reasons.length > 0 ? (
          <ul className="space-y-2">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs text-neutral-200 bg-[#070707] p-3 rounded-xl border border-neutral-800/90">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-neutral-300 bg-neutral-900/40 p-3 rounded-xl border border-neutral-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>No malicious flags or spoofing indicators detected for this domain.</span>
          </div>
        )}
      </div>
    </div>
  );
}
