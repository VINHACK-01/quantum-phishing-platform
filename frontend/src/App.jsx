import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/common/Header';
import HeroBanner from './components/HeroBanner';
import UrlScanner from './components/UrlScanner';
import ResultCard from './components/ResultCard';
import MicroTraining from './components/MicroTraining';
import QuantumComparison from './components/QuantumComparison';
import NetworkVisualizer from './components/NetworkVisualizer';
import HistoryTable from './components/HistoryTable';
import QuantumCanvas from './components/ui/QuantumCanvas';
import { TextRollBasic } from './components/ui/demo';
import { analyzeUrl, getNetworkEvents, getHistory, getHealth } from './services/api';
import { Radio, History, Sparkles, Terminal, Activity, Layers } from 'lucide-react';
import { playClick } from './lib/soundFx';

export default function App() {
  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [targetUrlInput, setTargetUrlInput] = useState('');

  const [networkData, setNetworkData] = useState(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState('Connecting'); // 'Connected' | 'Connecting' | 'Offline'
  const [activeTab, setActiveTab] = useState('network'); // 'network' | 'history' | 'playground' | 'motion'

  // Backend Health Check
  const checkHealth = useCallback(async () => {
    try {
      const isOk = await getHealth();
      setConnectionStatus(isOk ? 'Connected' : 'Offline');
      return isOk;
    } catch {
      setConnectionStatus('Offline');
      return false;
    }
  }, []);

  // Fetch Network Events (supports silent background polling)
  const fetchNetworkEvents = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingNetwork(true);
    try {
      const data = await getNetworkEvents();
      setNetworkData(data);
      setConnectionStatus('Connected');
    } catch (err) {
      console.warn('Network events polling warning:', err.message);
    } finally {
      if (!isSilent) setLoadingNetwork(false);
    }
  }, []);

  // Fetch Scan History
  const fetchHistory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingHistory(true);
    try {
      const data = await getHistory();
      setHistoryData(data);
    } catch (err) {
      console.warn('Scan history fetch warning:', err.message);
    } finally {
      if (!isSilent) setLoadingHistory(false);
    }
  }, []);

  // Manual Refresh Handler
  const handleRefreshAll = () => {
    checkHealth();
    fetchNetworkEvents(false);
    fetchHistory(false);
  };

  // Initial Data Sync on Mount & 5-Second Network Polling
  useEffect(() => {
    let isMounted = true;

    async function initDashboard() {
      const isHealthy = await checkHealth();
      if (isMounted) {
        setConnectionStatus(isHealthy ? 'Connected' : 'Offline');
      }
      fetchNetworkEvents(false);
      fetchHistory(false);
    }

    initDashboard();

    const networkPollInterval = setInterval(() => {
      if (isMounted) fetchNetworkEvents(true);
    }, 5000);

    const healthCheckInterval = setInterval(() => {
      if (isMounted) checkHealth();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(networkPollInterval);
      clearInterval(healthCheckInterval);
    };
  }, [checkHealth, fetchNetworkEvents, fetchHistory]);

  // Main URL Threat Analysis Handler
  const handleAnalyze = async (url) => {
    setLoadingScan(true);
    setScanError(null);
    setTargetUrlInput(url);
    try {
      const result = await analyzeUrl(url);
      setScanResult(result);
      setConnectionStatus('Connected');
      // Immediately refresh scan history queue
      fetchHistory(true);
    } catch (err) {
      setScanError(err.message || 'Unable to perform URL threat analysis.');
      setScanResult(null);
    } finally {
      setLoadingScan(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Subtle Matrix Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER */}
      <Header connectionStatus={connectionStatus} onRefreshAll={handleRefreshAll} />

      {/* DASHBOARD PAGE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 relative z-10">
        {/* HERO BANNER WITH TEXT-ROLL & TELEMETRY KPIS */}
        <HeroBanner onSelectPreset={handleAnalyze} networkData={networkData} />

        {/* BRUNO SIMON INTERACTIVE 3D QUANTUM CANVAS */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-mono text-red-500">
              <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
              <span className="font-bold uppercase tracking-wider">
                Interactive Threat Lattice
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
              WebGL / Canvas 2D • Mouse-Repulsion Physics Engine
            </span>
          </div>
          <QuantumCanvas />
        </section>

        {/* URL THREAT ANALYSIS & ANALYSIS RESULTS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            <UrlScanner
              onAnalyze={handleAnalyze}
              isLoading={loadingScan}
              externalUrl={targetUrlInput}
            />
            <MicroTraining trainingData={scanResult?.micro_training} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <ResultCard result={scanResult} isLoading={loadingScan} error={scanError} />
            <QuantumComparison comparisonData={scanResult?.quantum_comparison} />
          </div>
        </section>

        {/* NETWORK THREAT INTELLIGENCE & AUDIT HISTORY TABBED PANELS */}
        <section className="space-y-4">
          <div className="flex flex-wrap border-b border-neutral-800 gap-1 sm:gap-2">
            <button
              onClick={() => {
                playClick();
                setActiveTab('network');
              }}
              className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'network'
                  ? 'border-red-500 text-red-400 bg-neutral-900/70 shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-500" />
              <span>Network Threat Feed</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveTab('history');
              }}
              className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-red-500 text-red-400 bg-neutral-900/70 shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-red-500" />
              <span>Audit Scan History</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveTab('motion');
              }}
              className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'motion'
                  ? 'border-red-500 text-red-400 bg-neutral-900/70 shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>Motion-Primitives Demo</span>
            </button>
          </div>

          <div>
            {activeTab === 'network' && (
              <NetworkVisualizer
                networkData={networkData}
                onRefresh={() => fetchNetworkEvents(false)}
                isLoading={loadingNetwork}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTable
                historyData={historyData}
                onSelectScan={(scan) => scan?.url && handleAnalyze(scan.url)}
                isLoading={loadingHistory}
              />
            )}

            {activeTab === 'motion' && (
              <div className="relative rounded-2xl border border-red-900/40 bg-[#080808] p-8 shadow-2xl space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold">
                    Motion Primitives Component Showcase
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    Integrated Component: <code className="text-red-400 font-mono">@/components/ui/text-roll</code>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    High-performance 3D character roll transitions powered by <code className="text-red-400">motion/react</code>.
                  </p>
                </div>

                <div className="p-8 rounded-xl bg-[#050505] border border-neutral-800 flex flex-col items-center justify-center min-h-[160px] text-center space-y-4">
                  <span className="text-xs font-mono text-neutral-500">Live Render:</span>
                  <TextRollBasic />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-[#050505] py-6 text-center text-xs font-mono text-neutral-500 space-y-1">
        <div>
          SentinelAI — Quantum-Enhanced Phishing Detection & Real-Time Network Threat Intelligence Platform
        </div>
        <div className="text-[11px] text-neutral-600">
          PennyLane Quantum Machine Learning • Scikit-Learn VQC Ansätze • Fast-Inference Defense Matrix
        </div>
      </footer>
    </div>
  );
}
