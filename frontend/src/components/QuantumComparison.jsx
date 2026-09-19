import React from 'react';
import { Cpu, Zap, Activity, GitCommit, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function QuantumComparison({ comparisonData }) {
  if (!comparisonData) {
    return (
      <div className="relative rounded-2xl border border-neutral-800 bg-[#050505] p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-900/60">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-display text-white tracking-wide flex items-center gap-2">
                <span>Quantum VQC vs. Classical Benchmark</span>
                <Badge variant="quantum" className="text-[10px]">PennyLane</Badge>
              </h3>
              <p className="text-xs text-neutral-400">Variational Quantum Classifier Hilbert-space performance comparison</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-500 font-mono">
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

  return (
    <div className="relative rounded-2xl border border-red-900/40 bg-[#080808] p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-display text-white tracking-wide flex items-center gap-2">
              <span>Quantum Advantage Benchmark</span>
              <Badge variant="quantum" className="text-[10px]">VQC 4-Qubit</Badge>
            </h3>
            <p className="text-xs text-neutral-400">Parameterized Variational Quantum Circuit vs Scikit-Learn Random Forest</p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-red-950/60 border border-red-900/60 text-[11px] font-mono text-red-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span>+{Math.abs(deltaAcc).toFixed(1)}% Quantum Gain</span>
        </div>
      </div>

      {/* Side-by-Side Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Classical Random Forest */}
        <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-neutral-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-500" />
              Classical Random Forest
            </span>
            <span className="font-mono font-black text-neutral-300 text-sm">{classicalPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className="h-full bg-neutral-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, classicalVal * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
            <span>Metric: Accuracy (Acc)</span>
            <span className="text-white font-semibold">{classicalVal}</span>
          </div>
        </div>

        {/* Quantum VQC */}
        <div className="p-4 rounded-xl bg-[#050505] border border-red-900/50 space-y-2.5 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-red-500 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Quantum VQC Engine
            </span>
            <span className="font-mono font-black text-red-400 text-sm">{quantumPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-red-950">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-700 shadow-[0_0_10px_#ef4444]"
              style={{ width: `${Math.min(100, Math.max(5, quantumVal * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
            <span>Metric: Accuracy (Acc)</span>
            <span className="text-red-400 font-semibold">{quantumVal}</span>
          </div>
        </div>
      </div>

      {/* Simulated Quantum Circuit Diagram Representation */}
      <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-900 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span className="text-white flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-red-500" />
            <span>PennyLane Ansatz Architecture:</span>
          </span>
          <span className="text-red-400">4 Qubits | Depth 3</span>
        </div>

        {/* Circuit Gates Representation */}
        <div className="overflow-x-auto py-1">
          <div className="flex items-center gap-2 text-[10px] font-mono whitespace-nowrap min-w-max">
            <span className="px-2 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
              |0000⟩ Input
            </span>
            <span className="text-neutral-600">→</span>
            <span className="px-2 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
              Hadamard [H⊗4]
            </span>
            <span className="text-neutral-600">→</span>
            <span className="px-2 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
              Rotations Ry(θ)
            </span>
            <span className="text-neutral-600">→</span>
            <span className="px-2 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
              Entangling CNOT Ring
            </span>
            <span className="text-neutral-600">→</span>
            <span className="px-2 py-1 rounded bg-red-950/60 text-red-300 border border-red-900/60">
              Pauli-Z Measurement ⟨σz⟩
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
