<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import HomeView from './components/views/HomeView';
import DashboardView from './components/views/DashboardView';
import DetectionView from './components/views/DetectionView';
import AwarenessView from './components/views/AwarenessView';
import HistoryView from './components/views/HistoryView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
=======
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
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
import { analyzeUrl, getNetworkEvents, getHistory, getHealth } from './services/api';
import { Radio, History, Sparkles, Terminal, Activity, Layers } from 'lucide-react';
import { playClick } from './lib/soundFx';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'home' | 'dashboard' | 'detection' | 'awareness' | 'history' | 'reports' | 'settings'

  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [targetUrlInput, setTargetUrlInput] = useState('');

  const [networkData, setNetworkData] = useState(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState('Connecting'); // 'Connected' | 'Connecting' | 'Offline'
<<<<<<< HEAD
=======
  const [activeTab, setActiveTab] = useState('network'); // 'network' | 'history' | 'playground' | 'motion'
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)

  // Backend Health Status Check
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

  // Initial Data Sync & Background Polling
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

  // Main URL Analysis Handler
  const handleAnalyze = async (url) => {
    setLoadingScan(true);
    setScanError(null);
    setTargetUrlInput(url);
    try {
      const result = await analyzeUrl(url);
      setScanResult(result);
      setConnectionStatus('Connected');
<<<<<<< HEAD
      // Automatically refresh history to reflect new scan in queue
=======
      // Immediately refresh scan history queue
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
      fetchHistory(true);
      // Switch view to Threat Inspector workspace
      setActiveView('detection');
    } catch (err) {
      setScanError(err.message || 'Unable to perform URL threat analysis.');
      setScanResult(null);
      setActiveView('detection');
    } finally {
      setLoadingScan(false);
    }
  };

  // Select Item from History to re-scan
  const handleSelectHistoryScan = (scan) => {
    if (scan?.url) {
      handleAnalyze(scan.url);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* NEXUS STYLE FROSTED NAVIGATION */}
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        connectionStatus={connectionStatus}
        onRefreshAll={handleRefreshAll}
      />

      {/* ACTIVE VIEW CONTAINER */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'home' && (
          <HomeView onLaunchDetection={() => setActiveView('detection')} />
        )}
=======
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Subtle Matrix Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER */}
      <Header connectionStatus={connectionStatus} onRefreshAll={handleRefreshAll} />

      {/* DASHBOARD PAGE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 relative z-10">
        {/* HERO BANNER WITH TEXT-ROLL & TELEMETRY KPIS */}
        <HeroBanner onSelectPreset={handleAnalyze} />

        {/* BRUNO SIMON INTERACTIVE 3D QUANTUM CANVAS */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-bold uppercase tracking-wider">
                Quantum Superposition Physics Simulator (Bruno Simon Mode)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
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
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)

        {activeView === 'dashboard' && (
          <DashboardView
            historyData={historyData}
            networkData={networkData}
            connectionStatus={connectionStatus}
            onAnalyze={handleAnalyze}
            isLoadingScan={loadingScan}
            onRefreshNetwork={() => fetchNetworkEvents(false)}
            isLoadingNetwork={loadingNetwork}
            onSelectScan={handleSelectHistoryScan}
            isLoadingHistory={loadingHistory}
          />
        )}

<<<<<<< HEAD
        {activeView === 'detection' && (
          <DetectionView
            scanResult={scanResult}
            isLoadingScan={loadingScan}
            scanError={scanError}
            onAnalyze={handleAnalyze}
          />
        )}

        {activeView === 'awareness' && (
          <AwarenessView activeTrainingData={scanResult?.micro_training} />
        )}

        {activeView === 'history' && (
          <HistoryView
            historyData={historyData}
            onSelectScan={handleSelectHistoryScan}
            isLoadingHistory={loadingHistory}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView historyData={historyData} scanResult={scanResult} />
        )}

        {activeView === 'settings' && (
          <SettingsView connectionStatus={connectionStatus} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        SentinelAI — Quantum-Enhanced Phishing Detection & Network Threat Intelligence Platform
=======
        {/* NETWORK THREAT INTELLIGENCE & AUDIT HISTORY TABBED PANELS */}
        <section className="space-y-4">
          <div className="flex flex-wrap border-b border-slate-800/80 gap-1 sm:gap-2">
            <button
              onClick={() => {
                playClick();
                setActiveTab('network');
              }}
              className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'network'
                  ? 'border-cyan-400 text-cyan-300 bg-slate-900/70 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Network Threat Feed</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveTab('history');
              }}
              className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-300 bg-slate-900/70 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audit Scan History</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveTab('motion');
              }}
              className={`px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'motion'
                  ? 'border-purple-400 text-purple-300 bg-slate-900/70 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
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
              <div className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 shadow-2xl space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                    Motion Primitives Component Showcase
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Integrated Component: <code className="text-cyan-300 font-mono">@/components/ui/text-roll</code>
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-performance 3D character roll transitions powered by <code className="text-purple-300">motion/react</code>.
                  </p>
                </div>

                <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[160px] text-center space-y-4">
                  <span className="text-xs font-mono text-slate-500">Live Render:</span>
                  <TextRollBasic />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/95 py-6 text-center text-xs font-mono text-slate-500 space-y-1">
        <div>
          SentinelAI — Quantum-Enhanced Phishing Detection & Real-Time Network Threat Intelligence Platform
        </div>
        <div className="text-[11px] text-slate-600">
          PennyLane Quantum Machine Learning • Scikit-Learn VQC Ansätze • Fast-Inference Defense Matrix
        </div>
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
      </footer>
    </div>
  );
}
