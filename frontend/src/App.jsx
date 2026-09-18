import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import HomeView from './components/views/HomeView';
import DashboardView from './components/views/DashboardView';
import DetectionView from './components/views/DetectionView';
import AwarenessView from './components/views/AwarenessView';
import HistoryView from './components/views/HistoryView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
import { analyzeUrl, getNetworkEvents, getHistory, getHealth } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'home' | 'dashboard' | 'detection' | 'awareness' | 'history' | 'reports' | 'settings'

  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanError, setScanError] = useState(null);

  const [networkData, setNetworkData] = useState(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState('Connecting'); // 'Connected' | 'Connecting' | 'Offline'

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

  // Main URL Analysis Handler
  const handleAnalyze = async (url) => {
    setLoadingScan(true);
    setScanError(null);
    try {
      const result = await analyzeUrl(url);
      setScanResult(result);
      setConnectionStatus('Connected');
      // Automatically refresh history to reflect new scan in queue
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
      </footer>
    </div>
  );
}
