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
    // Simple URL structure sanity check (must contain at least a domain name or IP)
    if (!value.includes('.') && !value.includes('localhost')) {
      return 'Please enter a valid URL or domain (e.g. example.com).';
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
    // Populate input field only, do NOT auto-trigger analysis per project rules
    setInputUrl(url);
    setValidationError('');
  };

  const handleInputChange = (e) => {
    setInputUrl(e.target.value);
    if (validationError) setValidationError('');
  };

  return (
    <div className="glass-panel p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            URL Threat Inspection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit a URL to analyze domain structure, brand spoofing keywords, and model indicators.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={handleInputChange}
              placeholder="Enter URL (e.g., https://secure-login-paypal.com.account-verify.xyz/auth)"
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-slate-950 border ${
                validationError ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-cyan-500'
              } rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono`}
            />
            {inputUrl && (
              <button
                type="button"
                onClick={() => {
                  setInputUrl('');
                  setValidationError('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputUrl.trim() || isLoading}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow border border-cyan-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-cyan-200" fill="none" viewBox="0 0 24 24">
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
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            {validationError}
          </p>
        )}
      </form>

      {/* Preset Sample Selector (Populates Input Only) */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
        <span className="text-[11px] text-slate-500 font-medium">Sample Test Targets:</span>
        {SAMPLE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset.url)}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
