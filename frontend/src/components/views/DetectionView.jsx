import { useState } from 'react';
import UrlScanner from '../UrlScanner';
import ResultCard from '../ResultCard';
import MicroTraining from '../MicroTraining';
import QuantumComparison from '../QuantumComparison';

export default function DetectionView({ scanResult, isLoadingScan, scanError, onAnalyze }) {
  const [activeMode, setActiveMode] = useState('url'); // 'url' | 'email'
  const [emailText, setEmailText] = useState('');

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h2 className="text-3xl font-display text-white tracking-wide">Threat Detection Workspace</h2>
          <p className="text-xs font-sans text-neutral-400 mt-0.5">Inspect links and messages for phishing vectors using backend models</p>
        </div>

        <div className="flex bg-[#0d0d0d] p-1 rounded-full border border-neutral-800 text-xs font-sans">
          <button
            onClick={() => setActiveMode('url')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer font-semibold ${
              activeMode === 'url' ? 'bg-red-600 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            URL Inspection
          </button>
          <button
            onClick={() => setActiveMode('email')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer font-semibold ${
              activeMode === 'email' ? 'bg-neutral-800 text-white font-bold border border-neutral-700' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Email / SMS Inspector (Demo)
          </button>
        </div>
      </div>

      {activeMode === 'url' ? (
        /* Real URL Analysis Flow */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            <UrlScanner onAnalyze={onAnalyze} isLoading={isLoadingScan} />
            <MicroTraining trainingData={scanResult?.micro_training} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <ResultCard result={scanResult} isLoading={isLoadingScan} error={scanError} />
            <QuantumComparison comparisonData={scanResult?.quantum_comparison} />
          </div>
        </div>
      ) : (
        /* Frontend-Only Email/Message Analysis Placeholder */
        <div className="nexus-card p-6 border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-neutral-900 text-red-500 rounded-lg border border-neutral-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-display text-white tracking-wide flex items-center gap-2">
                  Email & SMS Phishing Inspector
                  <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                    Frontend Demo Feature
                  </span>
                </h3>
                <p className="text-xs font-sans text-neutral-400">Paste email headers or SMS body text for NLP sentiment parsing</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste raw email header or message body here (e.g. 'URGENT: Your account has been suspended. Click here to verify credentials now.')"
              rows={5}
              className="w-full p-3.5 bg-[#050505] border border-neutral-800 rounded-xl text-neutral-200 text-xs font-mono focus:outline-none focus:border-red-500 transition-all placeholder-neutral-600"
            />

            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
              <span>Note: Message body sentiment & NLP parsing endpoints are scheduled for Phase 2 backend integration.</span>
              <button
                disabled
                className="px-4 py-2 bg-neutral-900 text-neutral-500 rounded-lg font-semibold text-xs cursor-not-allowed border border-neutral-800"
              >
                Parse Message (Demo Only)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
