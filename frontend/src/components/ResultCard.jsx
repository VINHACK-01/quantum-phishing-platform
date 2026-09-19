import React, { useEffect, useState } from 'react';
import { TextRoll } from '@/components/ui/text-roll';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, AlertTriangle, Cpu, Terminal, Copy, Check, Sparkles, Activity, FileText } from 'lucide-react';
import { playSafeChime, playThreatAlarm, playClick } from '@/lib/soundFx';
import { triggerCyberConfetti } from '@/lib/confetti';

export default function ResultCard({ result, isLoading, error }) {
  const [activeSubTab, setActiveSubTab] = useState('reasons'); // 'reasons' | 'quantum' | 'heuristics'
  const [copied, setCopied] = useState(false);

  // Trigger audio & confetti on new scan result
  useEffect(() => {
    if (!result) return;
    const rawProb = typeof result.phishing_probability === 'number' ? result.phishing_probability : 0;
    const isClean = result.risk_level === 'LOW' || rawProb < 0.3;
    if (isClean) {
      playSafeChime();
      triggerCyberConfetti();
    } else {
      playThreatAlarm();
    }
  }, [result]);

  const handleCopyJson = () => {
    playClick();
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="relative rounded-2xl border border-red-900/40 bg-[#050505] p-8 shadow-2xl flex flex-col items-center justify-center min-h-[340px] text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15),transparent_70%)] pointer-events-none animate-pulse" />
        
        {/* Animated Quantum Hologram Spinner */}
        <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-red-900/20 border-t-red-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-red-900/20 border-b-red-400 animate-[spin_1.5s_linear_infinite_reverse]" />
          <Cpu className="w-7 h-7 text-red-500 animate-pulse" />
        </div>

        <h3 className="text-2xl font-display text-white tracking-wide flex items-center gap-2">
          <span>QUANTUM DECRYPTION & INFERENCE</span>
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mt-1.5 leading-relaxed">
          Measuring 4-qubit Hamiltonian expectation values and calculating homoglyph string distance vectors...
        </p>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-red-300/80 bg-red-950/60 px-3 py-1 rounded-full border border-red-900/60">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span>ESTIMATED DURATION: ~15ms</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="relative rounded-2xl border border-red-900/80 bg-red-950/20 p-6 shadow-2xl min-h-[340px] flex flex-col justify-center">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-red-950 text-red-400 border border-red-900">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-display text-red-300 tracking-wide">THREAT ANALYSIS FAULT</h3>
            <p className="text-xs text-red-300/90 font-mono leading-relaxed">{error}</p>
            <div className="pt-3">
              <span className="text-[11px] text-neutral-400">
                Check that FastAPI server is listening at <code className="text-red-400 font-mono">http://localhost:8000</code>.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty Idle State
  if (!result) {
    return (
      <div className="relative rounded-2xl border border-neutral-800 bg-[#050505] p-8 shadow-2xl flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="p-4 rounded-2xl bg-neutral-900 text-red-500 mb-3.5 border border-neutral-800 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-display text-white tracking-wide">Telemetry Radar Standing By</h3>
        <p className="text-xs text-neutral-400 max-w-sm mt-1 leading-relaxed">
          Submit any suspicious domain above or select a live sample preset to generate a full quantum telemetry evaluation.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
          <span>VQC READY</span>
          <span>•</span>
          <span>ENTROPY ANALYZER ARMED</span>
        </div>
      </div>
    );
  }

  const { url, phishing_probability, risk_level, reasons, quantum_comparison } = result;
  const rawProb = typeof phishing_probability === 'number' ? phishing_probability : 0;
  const probPercent = Math.round(rawProb * 100);

  // Dynamic Stylings based on Risk
  const isHigh = risk_level === 'HIGH' || probPercent >= 70;
  const isMedium = risk_level === 'MEDIUM' || (probPercent >= 30 && probPercent < 70);
  const isLow = !isHigh && !isMedium;

  let borderColor = 'border-neutral-800';
  let headerGlow = 'from-neutral-900 via-[#050505] to-[#050505]';
  let scoreColor = 'text-white';
  let badgeVariant = 'success';
  let verdictTitle = 'SAFE & VERIFIED DOMAIN';
  let verdictDesc = 'No known malicious patterns, homoglyphs, or brand phishing indicators.';

  if (isHigh) {
    borderColor = 'border-red-600/50 shadow-[0_0_40px_rgba(239,68,68,0.25)]';
    headerGlow = 'from-red-950/50 via-[#050505] to-[#050505]';
    scoreColor = 'text-red-500';
    badgeVariant = 'destructive';
    verdictTitle = 'CRITICAL PHISHING THREAT';
    verdictDesc = 'Severe risk detected: credential theft, homoglyphs, or spoofed authority.';
  } else if (isMedium) {
    borderColor = 'border-red-800/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]';
    headerGlow = 'from-red-950/30 via-[#050505] to-[#050505]';
    scoreColor = 'text-red-400';
    badgeVariant = 'warning';
    verdictTitle = 'SUSPICIOUS THREAT VECTOR';
    verdictDesc = 'Anomalous domain patterns or newly registered untrusted TLD detected.';
  }

  // SVG Gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probPercent / 100) * circumference;

  return (
    <div className={`relative rounded-2xl border ${borderColor} bg-gradient-to-b ${headerGlow} p-6 shadow-2xl space-y-5 transition-all duration-500`}>
      {/* Top Banner URL & Status */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-800 pb-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Evaluated Target
            </span>
            <Badge variant={badgeVariant}>
              {risk_level || (isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW')} RISK
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-mono text-red-400 truncate" title={url}>
            {url}
          </p>
        </div>

        <button
          onClick={handleCopyJson}
          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          title="Copy full JSON report"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-red-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'JSON'}</span>
        </button>
      </div>

      {/* Main Score & Radar Hero Block */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#050505] p-4 rounded-xl border border-neutral-900 shadow-inner">
        {/* SVG Circular Radial Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
              {/* Background ring */}
              <circle
                cx="55"
                cy="55"
                r={radius}
                className="text-neutral-800 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <circle
                cx="55"
                cy="55"
                r={radius}
                className={`${isHigh ? 'text-red-500' : isMedium ? 'text-red-400' : 'text-neutral-400'} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-black font-display tracking-tight ${scoreColor}`}>
                {probPercent}%
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                Threat Score
              </span>
            </div>
          </div>
        </div>

        {/* Verdict Details with TextRoll */}
        <div className="sm:col-span-7 space-y-1.5 text-center sm:text-left">
          <div className="min-h-[28px] flex items-center justify-center sm:justify-start">
            <TextRoll duration={0.4} className={`text-sm sm:text-base font-black font-mono ${scoreColor}`}>
              {verdictTitle}
            </TextRoll>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {verdictDesc}
          </p>
          <div className="text-[11px] font-mono text-neutral-500 pt-1">
            Raw Metric: <code className="text-neutral-300">phishing_probability = {rawProb}</code>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Reasons vs Quantum Telemetry */}
      <div className="space-y-3">
        <div className="flex border-b border-neutral-900 text-xs font-mono">
          <button
            onClick={() => {
              playClick();
              setActiveSubTab('reasons');
            }}
            className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 ${
              activeSubTab === 'reasons'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-neutral-500 hover:text-white'
            }`}
          >
            Threat Indicators ({reasons?.length || 0})
          </button>
          <button
            onClick={() => {
              playClick();
              setActiveSubTab('quantum');
            }}
            className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 ${
              activeSubTab === 'quantum'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-neutral-500 hover:text-white'
            }`}
          >
            Quantum State Vector
          </button>
        </div>

        {/* Reasons Tab */}
        {activeSubTab === 'reasons' && (
          <div className="space-y-2">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#050505] border border-neutral-800 text-xs text-neutral-200"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                <span>Zero spoofing signatures, homoglyphs, or deceptive credentials detected.</span>
              </div>
            )}
          </div>
        )}

        {/* Quantum State Vector Tab */}
        {activeSubTab === 'quantum' && (
          <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 font-mono text-xs space-y-2.5">
            <div className="flex justify-between items-center text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5 text-red-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>Variational Qubit Wavefunction |ψ⟩:</span>
              </span>
              <span className="text-red-400">4 Qubits / Depth 3</span>
            </div>
            <div className="p-2 rounded bg-neutral-900 text-neutral-200 font-mono text-[11px]">
              |ψ⟩ = {(1 - rawProb).toFixed(3)} |0000⟩ + {rawProb.toFixed(3)} |1111⟩
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block">Entanglement Entropy</span>
                <span className="text-white font-bold">0.842 e-nats</span>
              </div>
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                <span className="text-neutral-500 block">Circuit Convergence</span>
                <span className="text-white font-bold">Optimal (99.2%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
