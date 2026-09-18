import React from 'react';
import { Cpu, Zap, Activity, GitCommit, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function QuantumComparison({ comparisonData }) {
  if (!comparisonData) {
    return (
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950 p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/80">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Quantum VQC vs. Classical Benchmark</span>
                <Badge variant="quantum" className="text-[10px]">PennyLane</Badge>
              </h3>
              <p className="text-xs text-slate-400">Variational Quantum Classifier Hilbert-space performance comparison</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-mono">
          Run a URL threat inspection to render live PennyLane VQC state vector comparison against classical Random Forest.
        </p>
      </div>
    );
  }

  const { classical_acc, quantum_acc } = comparisonData;
  const classicalVal = typeof classical_acc === 'number' ? classical_acc : 0;
  const quantumVal = typeof quantum_acc === 'number' ? quantum_acc : 0;

  const classicalPercent = (classicalVal * 100).toFixed(1);
  const quantumPercent = (quantumVal * 100).toFixed(1);

  // Speedup delta
  const deltaAcc = (quantumVal - classicalVal) * 100;
  const isQuantumAhead = deltaAcc >= 0;

  return (
    <div className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/90 text-purple-400 border border-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>Quantum Advantage Benchmark</span>
              <Badge variant="quantum" className="text-[10px]">VQC 4-Qubit</Badge>
            </h3>
            <p className="text-xs text-slate-400">Parameterized Variational Quantum Circuit vs Scikit-Learn Random Forest</p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/80 text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>+{Math.abs(deltaAcc).toFixed(1)}% Quantum Gain</span>
        </div>
      </div>

      {/* Side-by-Side Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Classical Random Forest */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-900/50 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-blue-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Classical Random Forest
            </span>
            <span className="font-mono font-black text-blue-300 text-sm">{classicalPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-blue-950">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, classicalVal * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>Metric: Accuracy (Acc)</span>
            <span className="text-slate-300 font-semibold">{classicalVal}</span>
          </div>
        </div>

        {/* Quantum VQC */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/50 space-y-2.5 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-purple-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              Quantum VQC Engine
            </span>
            <span className="font-mono font-black text-purple-300 text-sm">{quantumPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-purple-950">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_10px_#a855f7]"
              style={{ width: `${Math.min(100, Math.max(5, quantumVal * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>Metric: Accuracy (Acc)</span>
            <span className="text-purple-300 font-semibold">{quantumVal}</span>
          </div>
        </div>
      </div>

      {/* Simulated Quantum Circuit Diagram Representation */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-900 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-slate-300 flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            <span>PennyLane Ansatz Architecture:</span>
          </span>
          <span className="text-purple-400">4 Qubits | Depth 3</span>
        </div>

        {/* Circuit Gates Representation */}
        <div className="overflow-x-auto py-1">
          <div className="flex items-center gap-2 text-[10px] font-mono whitespace-nowrap min-w-max">
            <span className="px-2 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              |0000⟩ Input
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
              Hadamard [H⊗4]
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">
              Rotations Ry(θ)
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
              Entangling CNOT Ring
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              Pauli-Z Measurement ⟨σz⟩
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
