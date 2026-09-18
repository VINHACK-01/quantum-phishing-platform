export default function QuantumComparison({ comparisonData }) {
  if (!comparisonData) {
    return (
      <div className="glass-panel p-5 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-900 text-purple-400 rounded border border-slate-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </span>
            <h3 className="text-sm font-bold text-slate-200">Quantum Benchmark Comparison</h3>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Classical Random Forest vs. Quantum VQC accuracy metrics will be visualized here upon URL analysis.
        </p>
      </div>
    );
  }

  const { classical_acc, quantum_acc } = comparisonData;

  const classicalVal = typeof classical_acc === 'number' ? classical_acc : 0;
  const quantumVal = typeof quantum_acc === 'number' ? quantum_acc : 0;

  const classicalPercent = (classicalVal * 100).toFixed(1);
  const quantumPercent = (quantumVal * 100).toFixed(1);

  return (
    <div className="glass-panel p-5 shadow-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-purple-950 text-purple-400 rounded border border-purple-800">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Quantum vs. Classical Classifier Benchmark</h3>
            <p className="text-[11px] text-slate-400">PennyLane Variational Quantum Classifier (VQC) evaluation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Classical RF Model */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-blue-900/40 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Classical Classifier (RF)
            </span>
            <span className="font-mono text-blue-300 font-bold">{classicalPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-blue-950">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(2, classicalVal * 100))}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-0.5">
            <span>Accuracy metric</span>
            <span className="text-slate-400 font-semibold">{classicalVal}</span>
          </div>
        </div>

        {/* Quantum VQC Model */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-purple-900/40 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Quantum VQC Model
            </span>
            <span className="font-mono text-purple-300 font-bold">{quantumPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-purple-950">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(2, quantumVal * 100))}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-0.5">
            <span>Accuracy metric</span>
            <span className="text-slate-400 font-semibold">{quantumVal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
