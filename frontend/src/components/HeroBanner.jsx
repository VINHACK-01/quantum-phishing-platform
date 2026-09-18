import React, { useState, useEffect } from 'react';
import { TextRoll } from '@/components/ui/text-roll';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, Cpu, Activity, Zap, Play, Terminal, Lock } from 'lucide-react';
import { playClick } from '@/lib/soundFx';

const ROLLING_WORDS = [
  'QUANTUM-ENHANCED PHISHING INTERCEPTION',
  'SUB-MILLISECOND THREAT DETECTION',
  'VARIATIONAL QUANTUM CLASSIFIER (VQC)',
  'AUTONOMOUS ZERO-TRUST VERIFICATION',
];

export default function HeroBanner({ onSelectPreset }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [threatCount, setThreatCount] = useState(14892);

  // Rotate text roll phrase every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROLLING_WORDS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Live pulsing counter increment
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

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
              <Cpu className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>PennyLane Qubit Simulator</span>
            </Badge>
            <Badge variant="default" className="hidden sm:inline-flex py-1">
              <span>IEEE Zero-Trust Architecture</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GLOBAL INTERCEPTION GRID: ACTIVE</span>
          </div>
        </div>

        {/* Hero Title with TextRoll */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Next-Gen Cyber Defense Matrix</span>
          </div>

          <div className="min-h-[76px] sm:min-h-[88px] flex items-center">
            <TextRoll
              key={wordIndex}
              duration={0.45}
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 font-sans"
            >
              {ROLLING_WORDS[wordIndex]}
            </TextRoll>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Harnessing 4-qubit parameterized variational circuits (VQC) and Grover quantum search acceleration to dismantle polymorphic phishing vectors, homoglyphs, and zero-day credential harvesters in sub-milliseconds.
          </p>
        </div>

        {/* 4 Live Telemetry KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Threats Blocked */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-xl space-y-1 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono text-[11px]">Threats Blocked</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
              {threatCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">+12 in past 60s</div>
          </div>

          {/* Quantum Fidelity */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-xl space-y-1 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono text-[11px]">Quantum Coherence</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-purple-300">
              99.82%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Fidelity metric (F)</div>
          </div>

          {/* Grover Speedup */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-xl space-y-1 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono text-[11px]">Grover Speedup</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-cyan-300">
              4.82×
            </div>
            <div className="text-[10px] text-slate-500 font-mono">O(√N) vs Classical O(N)</div>
          </div>

          {/* Latency */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-xl space-y-1 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono text-[11px]">VQC Latency</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-300">
              14.2 ms
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Real-time inference</div>
          </div>
        </div>

        {/* Quick Launch Scenarios */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/70">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
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
            className="px-3 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 hover:border-amber-500 text-xs font-mono text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Raw IP Credential Trap</span>
          </button>
          <button
            onClick={() => {
              playClick();
              onSelectPreset && onSelectPreset('https://google.com');
            }}
            className="px-3 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 hover:border-emerald-500 text-xs font-mono text-emerald-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Verified Legitimate Authority</span>
          </button>
        </div>
      </div>
    </div>
  );
}
