import { useState } from 'react';

const SAMPLE_PRESETS = [
  {
    label: 'Phishing PayPal Demo',
    url: 'https://secure-login-paypal.com.account-verify.xyz/auth',
  },
  {
    label: 'Suspicious IP Demo',
    url: 'http://192.168.1.100/auth/login.php',
  },
  {
    label: 'Safe Google Demo',
    url: 'https://google.com',
  },
];

export default function UrlScanner({ onAnalyze, isLoading }) {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateUrl = (value) => {
    if (!value.trim()) {
      return 'Please enter a URL to analyze.';
    }
    if (!value.includes('.') && !value.includes('localhost')) {
      return 'Please enter a valid URL or domain name (e.g. example.com).';
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
    onAnalyze(inputUrl.trim());
  };

  const handleSelectPreset = (url) => {
    setInputUrl(url);
    setValidationError('');
  };

  const handleInputChange = (e) => {
    setInputUrl(e.target.value);
    if (validationError) setValidationError('');
  };

  return (
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
            <input
              type="text"
              value={inputUrl}
              onChange={handleInputChange}
              placeholder="Enter URL (e.g., https://secure-login-paypal.com.account-verify.xyz/auth)"
              disabled={isLoading}
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
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Analyze Threat</span>
              </>
            )}
          </button>
        </div>

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
        {SAMPLE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset.url)}
            disabled={isLoading}
            className="px-3 py-1 text-xs rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer font-medium"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
