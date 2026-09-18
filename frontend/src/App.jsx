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

  // Fetch Network Events (supports silent background polling to prevent UI flashing)
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

    // Initial load
    async function initDashboard() {
      const isHealthy = await checkHealth();
      if (isMounted) {
        if (isHealthy) setConnectionStatus('Connected');
        else setConnectionStatus('Offline');
      }
      fetchNetworkEvents(false);
      fetchHistory(false);
    }

    initDashboard();

    // 5-second non-blocking background polling for Network Threat Events
    const networkPollInterval = setInterval(() => {
      if (isMounted) {
        fetchNetworkEvents(true);
      }
    }, 5000);

    // 15-second health check polling
    const healthCheckInterval = setInterval(() => {
      if (isMounted) {
        checkHealth();
      }
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
    try {
      const result = await analyzeUrl(url);
      setScanResult(result);
      setConnectionStatus('Connected');
      // Immediately refresh scan history queue without full page reload
      fetchHistory(true);
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
        
        {/* URL THREAT ANALYSIS & ANALYSIS RESULTS */}
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
                onRefresh={() => fetchNetworkEvents(false)}
                isLoading={loadingNetwork}
              />
            ) : (
              <HistoryTable
                historyData={historyData}
                onSelectScan={(scan) => scan?.url && handleAnalyze(scan.url)}
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
