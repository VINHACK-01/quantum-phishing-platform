import { useState, useEffect, useCallback } from 'react';
import Header from './components/common/Header';
import UrlScanner from './components/UrlScanner';
import ResultCard from './components/ResultCard';
import MicroTraining from './components/MicroTraining';
import QuantumComparison from './components/QuantumComparison';
import NetworkVisualizer from './components/NetworkVisualizer';
import HistoryTable from './components/HistoryTable';
import { analyzeUrl, getNetworkEvents, getHistory, getHealth } from './services/api';

export default function App() {
  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanError, setScanError] = useState(null);

  const [networkData, setNetworkData] = useState(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState('Connecting'); // 'Connected' | 'Connecting' | 'Offline'
  const [activeTab, setActiveTab] = useState('network'); // 'network' | 'history'

  // Backend Health Status Check
  const checkHealth = useCallback(async () => {
    try {
      const isOk = await getHealth();
      setConnectionStatus(isOk ? 'Connected' : 'Offline');
    } catch {
      setConnectionStatus('Offline');
    }
  }, []);

  // Network Events Fetcher
  const fetchNetworkEvents = useCallback(async () => {
    setLoadingNetwork(true);
    try {
      const data = await getNetworkEvents();
      setNetworkData(data);
    } catch (err) {
      console.warn('Network events fetch warning:', err.message);
    } finally {
      setLoadingNetwork(false);
    }
  }, []);

  // History Fetcher
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory();
      setHistoryData(data);
    } catch (err) {
      console.warn('Scan history fetch warning:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Manual Sync Button Handler
  const handleRefreshAll = () => {
    checkHealth();
    fetchNetworkEvents();
    fetchHistory();
  };

  // Initial Data Sync on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const isOk = await getHealth();
        if (isMounted) setConnectionStatus(isOk ? 'Connected' : 'Offline');
      } catch {
        if (isMounted) setConnectionStatus('Offline');
      }

      setLoadingNetwork(true);
      setLoadingHistory(true);

      try {
        const netData = await getNetworkEvents();
        if (isMounted) setNetworkData(netData);
      } catch (err) {
        console.warn('Network events fetch warning:', err.message);
      } finally {
        if (isMounted) setLoadingNetwork(false);
      }

      try {
        const histData = await getHistory();
        if (isMounted) setHistoryData(histData);
      } catch (err) {
        console.warn('Scan history fetch warning:', err.message);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Main URL Analysis Handler
  const handleAnalyze = async (url) => {
    setLoadingScan(true);
    setScanError(null);
    try {
      const result = await analyzeUrl(url);
      setScanResult(result);
      // Automatically refresh history to reflect new scan in queue
      fetchHistory();
    } catch (err) {
      setScanError(err.message || 'Unable to perform URL threat analysis.');
      setScanResult(null);
    } finally {
      setLoadingScan(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* HEADER */}
      <Header connectionStatus={connectionStatus} onRefreshAll={handleRefreshAll} />

      {/* DASHBOARD PAGE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* URL THREAT ANALYSIS & ANALYSIS RESULTS (Side-by-side on desktop, stacked on mobile) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            <UrlScanner onAnalyze={handleAnalyze} isLoading={loadingScan} />
            <MicroTraining trainingData={scanResult?.micro_training} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <ResultCard result={scanResult} isLoading={loadingScan} error={scanError} />
            <QuantumComparison comparisonData={scanResult?.quantum_comparison} />
          </div>
        </section>

        {/* NETWORK THREAT INTELLIGENCE & SCAN HISTORY TABBED PANELS */}
        <section className="space-y-4">
          <div className="flex border-b border-slate-900">
            <button
              onClick={() => setActiveTab('network')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'network'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Network Threat Intelligence
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Scan History
            </button>
          </div>

          <div>
            {activeTab === 'network' ? (
              <NetworkVisualizer
                networkData={networkData}
                onRefresh={fetchNetworkEvents}
                isLoading={loadingNetwork}
              />
            ) : (
              <HistoryTable
                historyData={historyData}
                isLoading={loadingHistory}
              />
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        SentinelAI — Quantum-Enhanced Phishing Detection & Network Threat Intelligence Platform
      </footer>
    </div>
  );
}
