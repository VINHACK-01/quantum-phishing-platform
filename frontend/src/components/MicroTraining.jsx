export default function MicroTraining({ trainingData }) {
  if (!trainingData) {
    return (
      <div className="nexus-card p-5 border-l-4 border-l-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-neutral-900 text-red-500 rounded-lg border border-neutral-800">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-white">Security Awareness Training</h3>
        </div>
        <p className="text-xs text-neutral-500">
          Contextual micro-training tips will appear here automatically when threat vectors are detected during URL analysis.
        </p>
      </div>
    );
  }

  const { title, explanation, action_tip } = trainingData;

  return (
    <div className="nexus-card p-5 border-l-4 border-l-red-600 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-red-950 text-red-400 rounded-lg border border-red-900/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <h3 className="text-lg font-display text-white tracking-wide">Security Awareness Micro-Module</h3>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-900 uppercase font-bold">
          Contextual Defense
        </span>
      </div>

      <div className="bg-[#070707] p-4 rounded-xl border border-neutral-900 space-y-3">
        {title && (
          <div>
            <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-red-400 block">Identified Threat Vector</span>
            <h4 className="text-base font-display text-white tracking-wide mt-0.5">{title}</h4>
          </div>
        )}

        {explanation && (
          <p className="text-xs text-neutral-300 leading-relaxed">
            {explanation}
          </p>
        )}

        {action_tip && (
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-neutral-200">
              <strong className="text-red-400 block mb-0.5 uppercase text-[10px] tracking-wider font-bold">Actionable Security Tip</strong>
              {action_tip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
