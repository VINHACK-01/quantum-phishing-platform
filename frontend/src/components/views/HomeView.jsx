export default function HomeView({ onLaunchDetection }) {
  return (
    <div className="space-y-16 py-6">
      {/* Black + Red Cybersecurity Hero Section */}
      <section className="nexus-card nexus-hero-glow p-8 sm:p-16 relative overflow-hidden text-center sm:text-left border-neutral-800">
        <div className="max-w-4xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-900/80 text-red-300 text-xs font-mono font-medium shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Quantum-Enhanced Phishing Detection & Cyber Threat Intelligence
          </div>

          <h1 className="text-5xl sm:text-7xl font-display text-white tracking-wide leading-none">
            Real-Time Threat Intelligence Powered by <span className="text-red-500">Quantum AI</span>
          </h1>

          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl font-sans">
            SentinelAI combines classical Random Forest feature extraction with PennyLane Variational Quantum Classifiers (VQC) to inspect domain entropy, detect brand spoofing, and stream PCAP threat telemetry in real-time.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4 justify-center sm:justify-start font-sans">
            <button
              onClick={onLaunchDetection}
              className="px-7 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-full shadow-xl shadow-red-950/60 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 border border-red-500/30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Launch Threat Inspector</span>
            </button>

            <a
              href="#pillars"
              className="px-7 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-sm rounded-full border border-neutral-800 transition-all hover:border-neutral-700"
            >
              Explore Architecture
            </a>
          </div>
        </div>
      </section>

      {/* Live Stat Badges Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="nexus-card p-5 text-center space-y-1">
          <span className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider block">Classical RF Accuracy</span>
          <div className="text-3xl sm:text-4xl font-display text-white tracking-wide">91.8%</div>
          <span className="text-[11px] font-sans text-neutral-500 block">High-dimensional decision tree</span>
        </div>

        <div className="nexus-card p-5 text-center space-y-1">
          <span className="text-xs font-sans font-bold text-red-400 uppercase tracking-wider block">Quantum VQC Metric</span>
          <div className="text-3xl sm:text-4xl font-display text-white tracking-wide">74.2%</div>
          <span className="text-[11px] font-sans text-neutral-500 block">PennyLane Hilbert classifier</span>
        </div>

        <div className="nexus-card p-5 text-center space-y-1">
          <span className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider block">PCAP Telemetry</span>
          <div className="text-3xl sm:text-4xl font-display text-white tracking-wide">5s Feed</div>
          <span className="text-[11px] font-sans text-neutral-500 block">Real-time packet inspection</span>
        </div>

        <div className="nexus-card p-5 text-center space-y-1">
          <span className="text-xs font-sans font-bold text-emerald-400 uppercase tracking-wider block">API Status</span>
          <div className="text-3xl sm:text-4xl font-display text-white tracking-wide">ONLINE</div>
          <span className="text-[11px] font-sans text-neutral-500 block">FastAPI Server at :8000</span>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="pillars" className="space-y-6">
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-3xl font-display text-white tracking-wide">Core Security Pillars</h2>
          <p className="text-xs font-sans text-neutral-400">Multi-layered detection pipeline built for modern security operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="nexus-card p-6 space-y-3 hover:border-red-900/60">
            <div className="p-3 bg-red-950/80 text-red-400 rounded-xl w-fit border border-red-900/60">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-white tracking-wide">Lexical & Entropy Analysis</h3>
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">
              Extracts subdomain depth, brand spoofing keywords, character entropy, and raw IP host patterns to identify zero-day phishing links.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="nexus-card p-6 space-y-3 hover:border-red-900/60">
            <div className="p-3 bg-red-950/80 text-red-400 rounded-xl w-fit border border-red-900/60">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-white tracking-wide">Quantum VQC Benchmark</h3>
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">
              Evaluates PennyLane Variational Quantum Classifier performance against classical Random Forest models in Hilbert feature space.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="nexus-card p-6 space-y-3 hover:border-red-900/60">
            <div className="p-3 bg-red-950/80 text-red-400 rounded-xl w-fit border border-red-900/60">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-white tracking-wide">PCAP Network Telemetry</h3>
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">
              Streams replayed network traffic logs, flagging high-entropy DGA DNS queries and plaintext credentials POSTed to raw external IPs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
