export default function ResultCard({ result, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="glass-panel p-6 shadow-xl flex flex-col items-center justify-center min-h-[260px] text-center border border-slate-800">
        <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-200 font-semibold text-sm">Running Threat Classification...</p>
        <p className="text-slate-500 text-xs mt-1">Evaluating domain structure, lexical entropy, and backend models</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 shadow-xl border border-red-900/40 bg-red-950/10 min-h-[260px] flex flex-col justify-center">
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
      <div className="glass-panel p-6 shadow-xl flex flex-col items-center justify-center min-h-[260px] text-center border border-slate-800/80">
        <div className="p-3 bg-slate-900/80 rounded-full text-slate-500 mb-3 border border-slate-800">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-slate-300 font-bold text-sm">Ready for Scan</h3>
        <p className="text-slate-500 text-xs mt-1 max-w-xs">
          Enter a URL in the scanner above to evaluate phishing probability, threat indicators, and risk level.
        </p>
      </div>
    );
  }

  const { url, phishing_probability, risk_level, reasons } = result;
  
  // Directly consume backend phishing_probability field
  const rawProb = typeof phishing_probability === 'number' ? phishing_probability : 0;
  const probPercent = Math.round(rawProb * 100);

  // Risk Badge & Color mapping
  let badgeClass = 'risk-badge-low';
  let gaugeColor = 'bg-emerald-500';
  let textColor = 'text-emerald-400';

  if (risk_level === 'HIGH' || probPercent >= 70) {
    badgeClass = 'risk-badge-high';
    gaugeColor = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (risk_level === 'MEDIUM' || probPercent >= 30) {
    badgeClass = 'risk-badge-medium';
    gaugeColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  return (
    <div className="glass-panel p-6 shadow-xl border border-slate-800 space-y-5">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Analyzed Domain</span>
          <p className="text-xs font-mono text-slate-200 truncate mt-0.5" title={url}>
            {url}
          </p>
        </div>
        <div className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${badgeClass}`}>
          {risk_level || 'UNKNOWN'} RISK
        </div>
      </div>

      {/* Prominent Phishing Probability Readout */}
      <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-900 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block">Phishing Probability</span>
          <span className="text-[10px] text-slate-500 font-mono">phishing_probability: {rawProb}</span>
        </div>
        <div className={`text-3xl font-black font-mono tracking-tight ${textColor}`}>
          {probPercent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full ${gaugeColor} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, Math.max(2, probPercent))}%` }}
          ></div>
        </div>
      </div>

      {/* Detected Reasons */}
      <div>
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Assessment Reasons ({reasons?.length || 0})
        </h4>
        {reasons && reasons.length > 0 ? (
          <ul className="space-y-1.5">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40 flex items-center gap-2">
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
