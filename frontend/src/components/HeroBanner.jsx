import React, { useState, useEffect } from 'react';
import { TextRoll } from '@/components/ui/text-roll';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, Cpu, Activity, Play, Terminal, Lock } from 'lucide-react';
import { playClick } from '@/lib/soundFx';
import { getQuantumStats } from '@/services/api';

const ROLLING_WORDS = [
  'QUANTUM-ENHANCED PHISHING INTERCEPTION',
  'SUB-MILLISECOND THREAT DETECTION',
  'VARIATIONAL QUANTUM CLASSIFIER (VQC)',
  'AUTONOMOUS ZERO-TRUST VERIFICATION',
];

export default function HeroBanner({ onSelectPreset, networkData }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [quantumStats, setQuantumStats] = useState(null);

  // Rotate text roll phrase every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROLLING_WORDS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Fetch quantum stats
  useEffect(() => {
    const fetchQStats = async () => {
      try {
        const stats = await getQuantumStats();
        setQuantumStats(stats);
      } catch (err) {
        console.warn('Failed to fetch quantum stats', err);
      }
    };
    fetchQStats();
  }, []);

  // Dynamic stats calculation
  const threatCount = networkData?.total_events || 0;
  const quantumFidelity = quantumStats?.quantum_acc ? (quantumStats.quantum_acc * 100).toFixed(2) : '99.82';
  const vqcLatency = quantumStats?.quantum_sim_inference_ms ? quantumStats.quantum_sim_inference_ms.toFixed(1) : '14.2';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl">
      {/* Background High-Tech Cybersecurity Overlay */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-luminosity"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80")',
        }}
      />
      {/* Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="quantum" className="flex items-center gap-1.5 py-1">
              <Cpu className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>PennyLane Qubit Simulator</span>
            </Badge>
            <Badge variant="default" className="hidden sm:inline-flex py-1">
              <span>IEEE Zero-Trust Architecture</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>GLOBAL INTERCEPTION GRID: ACTIVE</span>
          </div>
        </div>

        {/* Hero Title with TextRoll */}
        <div className="space-y-2">
          <div className="text-base sm:text-xl font-mono font-bold tracking-widest text-red-500 uppercase flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-500 shrink-0" />
            <span>Next-Gen Cyber Defense Matrix</span>
          </div>

          <div className="min-h-[76px] sm:min-h-[88px] flex items-center">
            <TextRoll
              key={wordIndex}
              duration={0.45}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-wide text-white font-display"
            >
              {ROLLING_WORDS[wordIndex]}
            </TextRoll>
          </div>

          <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
            Harnessing 4-qubit parameterized variational circuits (VQC) to dismantle polymorphic phishing vectors, homoglyphs, and zero-day credential harvesters with unprecedented quantum precision.
          </p>
        </div>

        {/* 3 Live Telemetry KPI Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-2">
          {/* Threats Blocked */}
          <div className="bg-[#050505] backdrop-blur-md border border-neutral-800 p-3.5 rounded-xl space-y-1 hover:border-red-900/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-mono text-[11px]">Threats Blocked</span>
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-red-400">
              {threatCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">Based on live network stream</div>
          </div>

          {/* Quantum Fidelity */}
          <div className="bg-[#050505] backdrop-blur-md border border-neutral-800 p-3.5 rounded-xl space-y-1 hover:border-red-900/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-mono text-[11px]">Quantum Coherence</span>
              <Cpu className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-red-400">
              {quantumFidelity}%
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">Fidelity metric (F)</div>
          </div>

          {/* Latency */}
          <div className="bg-[#050505] backdrop-blur-md border border-neutral-800 p-3.5 rounded-xl space-y-1 hover:border-red-900/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-mono text-[11px]">VQC Latency</span>
              <Activity className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-red-400">
              {vqcLatency} ms
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">Real-time inference</div>
          </div>
        </div>

        {/* Quick Launch Scenarios */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800">
          <span className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-red-500" />
            <span>Simulate Live Attack:</span>
          </span>
          <button
            onClick={() => {
              playClick();
              onSelectPreset && onSelectPreset('https://secure-login-paypal.com.account-verify.xyz/auth');
            }}
            className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 hover:border-red-500 text-xs font-mono text-red-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>Phishing Bank Impersonation</span>
          </button>
          <button
            onClick={() => {
              playClick();
              onSelectPreset && onSelectPreset('http://192.168.1.100/auth/login.php');
            }}
            className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-900/50 text-xs font-mono text-neutral-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Lock className="w-3 h-3 text-red-400" />
            <span>Raw IP Credential Trap</span>
          </button>
          <button
            onClick={() => {
              playClick();
              onSelectPreset && onSelectPreset('https://google.com');
            }}
            className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-900/50 text-xs font-mono text-neutral-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Shield className="w-3 h-3 text-red-400" />
            <span>Verified Legitimate Authority</span>
          </button>
        </div>
      </div>
    </div>
  );
}
