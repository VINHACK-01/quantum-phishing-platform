import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Sparkles, Zap, Terminal, Clipboard, X, Check, Globe, Lock, ArrowRight } from 'lucide-react';
import { playScanStart, playClick } from '@/lib/soundFx';
import { Badge } from '@/components/ui/badge';

const SAMPLE_PRESETS = [
  {
    label: 'PayPal Phish Clone',
    tag: 'CRITICAL',
    url: 'https://secure-login-paypal.com.account-verify.xyz/auth',
  },
  {
    label: 'Suspicious IP Auth',
    tag: 'SUSPICIOUS',
    url: 'http://192.168.1.100/auth/login.php',
  },
  {
    label: 'Legit Google Portal',
    tag: 'SAFE',
    url: 'https://google.com',
  },
];

const SCAN_STEPS = [
  'Extracting domain lexical features & Shannon entropy...',
  'Inspecting Unicode homoglyphs & punycode cloaking...',
  'Mapping features onto 4-qubit Hilbert state space...',
  'Evaluating Variational Quantum Classifier (VQC) cost function...',
];

export default function UrlScanner({ onAnalyze, isLoading, externalUrl }) {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Allow parent/preset to update input
  useEffect(() => {
    if (externalUrl) {
      setInputUrl(externalUrl);
      setValidationError('');
    }
  }, [externalUrl]);

  // Telemetry step progress loop while scanning
  useEffect(() => {
    let interval;
    if (isLoading) {
      setScanStepIndex(0);
      interval = setInterval(() => {
        setScanStepIndex((prev) => (prev + 1) % SCAN_STEPS.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const validateUrl = (value) => {
    if (!value.trim()) {
      return 'Please enter a target URL to evaluate.';
    }
    if (!value.includes('.') && !value.includes('localhost')) {
      return 'Please enter a valid URL or host (e.g., login-secure-bank.xyz).';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateUrl(inputUrl);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    playScanStart();
    onAnalyze(inputUrl.trim());
  };

  const handleSelectPreset = (url) => {
<<<<<<< HEAD
=======
    playClick();
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
    setInputUrl(url);
    setValidationError('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        setValidationError('');
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch {
      // Clipboard read fallback
    }
  };

  return (
<<<<<<< HEAD
    <div className="nexus-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display text-white tracking-wide flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            URL Threat Inspector
          </h2>
          <p className="text-xs font-sans text-neutral-400 mt-0.5">
            Analyze domain structure, lexical entropy, and brand spoofing indicators.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
=======
    <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 shadow-2xl space-y-5">
      {/* Top Accent Light Beam */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

      {/* Header with Cyber Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Deep URL Threat Inspection Deck</span>
              <Badge variant="quantum" className="text-[10px]">
                Q-VQC Core
              </Badge>
            </h2>
            <p className="text-xs text-slate-400">
              Zero-latency lexical decomposition, punycode triage, and quantum superposition classification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>PROMPT: /DISASSEMBLE-TARGET</span>
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <Globe className="w-4 h-4" />
            </div>

>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Enter suspicious domain or URL (e.g., https://secure-login-paypal.com.account-verify.xyz/auth)"
              disabled={isLoading}
<<<<<<< HEAD
              className={`w-full px-4 py-3.5 pr-16 bg-[#050505] border ${
                validationError ? 'border-red-500/80 focus:border-red-500' : 'border-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
              } rounded-xl text-white text-xs placeholder-neutral-500 focus:outline-none transition-all font-mono`}
            />
            {!inputUrl && (
              <span className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800 pointer-events-none">
                Enter ↵
              </span>
            )}
            {inputUrl && (
              <button
                type="button"
                onClick={() => {
                  setInputUrl('');
                  setValidationError('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs font-sans"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputUrl.trim() || isLoading}
            className="px-6 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:border-neutral-800 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 border border-red-500/30"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-red-200" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Analyzing...</span>
=======
              className={`w-full pl-10 pr-24 py-3.5 bg-slate-950/90 border ${
                validationError
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
              } rounded-xl text-slate-100 text-sm font-mono placeholder-slate-600 focus:outline-none transition-all shadow-inner`}
            />

            {/* In-input Action Buttons: Paste / Clear */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {inputUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('');
                    setValidationError('');
                  }}
                  className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Clear Input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Paste from clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                  <span>{copied ? 'Pasted' : 'Paste'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit Trigger Button */}
          <button
            type="submit"
            disabled={!inputUrl.trim() || isLoading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold font-mono tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.35)] border border-cyan-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-98"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>INSPECTING...</span>
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>INSPECT TARGET</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </>
            )}
          </button>
        </div>

<<<<<<< HEAD
        {validationError && (
          <p className="text-xs text-red-400 flex items-center gap-1 font-sans">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            {validationError}
          </p>
        )}
      </form>

      {/* Preset Target Selector */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-800/80">
        <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">Presets:</span>
=======
        {/* Validation Error Message */}
        {validationError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs font-mono text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Live Telemetry Progress Bar during Scan */}
        {isLoading && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {SCAN_STEPS[scanStepIndex]}
              </span>
              <span className="text-slate-400">Step {scanStepIndex + 1}/4</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </form>

      {/* Target Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
        <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Test Vector Presets:</span>
        </span>

>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
        {SAMPLE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset.url)}
            disabled={isLoading}
<<<<<<< HEAD
            className="px-3 py-1 text-xs rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer font-medium"
=======
            className="px-3 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/50 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                preset.tag === 'CRITICAL'
                  ? 'bg-rose-400'
                  : preset.tag === 'SUSPICIOUS'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
