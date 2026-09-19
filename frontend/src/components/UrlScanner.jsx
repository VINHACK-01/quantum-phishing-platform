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
    playClick();
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
    <div className="relative rounded-2xl border border-red-900/40 bg-[#080808] p-6 shadow-2xl space-y-5">
      {/* Top Accent Light Beam */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      {/* Header with Cyber Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/40 text-red-500 border border-red-900/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-display text-white tracking-wide flex items-center gap-2">
              <span>Deep URL Threat Inspection Deck</span>
              <Badge variant="quantum" className="text-[10px]">
                Q-VQC Core
              </Badge>
            </h2>
            <p className="text-xs text-neutral-400">
              Zero-latency lexical decomposition, punycode triage, and quantum superposition classification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400">
          <Terminal className="w-3.5 h-3.5 text-red-500" />
          <span>PROMPT: /DISASSEMBLE-TARGET</span>
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 group-focus-within:text-red-500 transition-colors">
              <Globe className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Enter suspicious domain or URL (e.g., https://secure-login-paypal.com.account-verify.xyz/auth)"
              disabled={isLoading}
              className={`w-full pl-10 pr-24 py-3.5 bg-neutral-950 border ${
                validationError
                  ? 'border-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-neutral-800 focus:border-red-600 focus:ring-2 focus:ring-red-600/20'
              } rounded-xl text-neutral-100 text-sm font-mono placeholder-neutral-600 focus:outline-none transition-all shadow-inner`}
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
                  className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition-colors cursor-pointer"
                  title="Clear Input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[11px] font-mono text-neutral-400 hover:text-white border border-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Paste from clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-red-500" /> : <Clipboard className="w-3 h-3" />}
                  <span>{copied ? 'Pasted' : 'Paste'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit Trigger Button */}
          <button
            type="submit"
            disabled={!inputUrl.trim() || isLoading}
            className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold font-mono tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.3)] border border-red-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-98"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>INSPECTING...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-white" />
                <span>INSPECT TARGET</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </>
            )}
          </button>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-900/80 text-xs font-mono text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Live Telemetry Progress Bar during Scan */}
        {isLoading && (
          <div className="p-3 rounded-xl bg-neutral-950 border border-red-900/40 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-red-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {SCAN_STEPS[scanStepIndex]}
              </span>
              <span className="text-neutral-400">Step {scanStepIndex + 1}/4</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-neutral-400 transition-all duration-300"
                style={{ width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </form>

      {/* Target Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-800">
        <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>Test Vector Presets:</span>
        </span>

        {SAMPLE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset.url)}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-red-900/50 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                preset.tag === 'CRITICAL'
                  ? 'bg-red-500'
                  : preset.tag === 'SUSPICIOUS'
                  ? 'bg-red-400'
                  : 'bg-neutral-400'
              }`}
            />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
