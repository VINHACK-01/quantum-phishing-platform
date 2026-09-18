export default function MicroTraining({ trainingData }) {
  if (!trainingData) {
    return (
      <div className="glass-panel p-5 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-slate-900 text-indigo-400 rounded border border-slate-800">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-slate-200">Security Awareness Training</h3>
        </div>
        <p className="text-xs text-slate-500">
          Contextual micro-training tips will appear here automatically when threat vectors are detected during URL analysis.
        </p>
      </div>
    );
  }

  const { title, explanation, action_tip } = trainingData;

  return (
    <div className="glass-panel p-5 shadow-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-950 text-indigo-400 rounded border border-indigo-800/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-slate-100">Security Awareness Micro-Module</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
          Targeted Defense
        </span>
      </div>

      <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-900 space-y-2">
        {title && (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Threat Vector</span>
            <h4 className="text-xs font-semibold text-slate-200 mt-0.5">{title}</h4>
          </div>
        )}

        {explanation && (
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation}
          </p>
        )}

        {action_tip && (
          <div className="pt-2 border-t border-slate-900 flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-emerald-300">
              <span className="font-semibold text-emerald-400">Action Tip: </span>
              {action_tip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
