import StatCard from '../common/StatCard';
import NetworkVisualizer from '../NetworkVisualizer';
import HistoryTable from '../HistoryTable';
import UrlScanner from '../UrlScanner';

export default function DashboardView({
  historyData,
  networkData,
  connectionStatus,
  onAnalyze,
  isLoadingScan,
  onRefreshNetwork,
  isLoadingNetwork,
  onSelectScan,
  isLoadingHistory,
}) {
  const totalScans = historyData?.scans?.length || 0;
  const totalNetworkEvents = networkData?.total_events || 0;
  const suspiciousEvents = networkData?.events?.filter((e) => e.flag?.toLowerCase() === 'suspicious')?.length || 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scans Queue"
          value={totalScans}
          subtext="In-memory FIFO audit log"
          accent="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Network Telemetry"
          value={totalNetworkEvents}
          subtext={`${suspiciousEvents} suspicious flagged`}
          accent="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          }
        />

        <StatCard
          title="Quantum VQC Accuracy"
          value="74.2%"
          subtext="PennyLane Hilbert classifier"
          accent="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />

        <StatCard
          title="Backend Connection"
          value={connectionStatus === 'Connected' ? 'ONLINE' : 'OFFLINE'}
          subtext="FastAPI Server at :8000"
          accent={connectionStatus === 'Connected' ? 'neutral' : 'red'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          }
        />
      </section>

      {/* Quick Threat Scanner */}
      <section>
        <UrlScanner onAnalyze={onAnalyze} isLoading={isLoadingScan} />
      </section>

      {/* Real-time Feeds Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <NetworkVisualizer
          networkData={networkData}
          onRefresh={onRefreshNetwork}
          isLoading={isLoadingNetwork}
        />

        <HistoryTable
          historyData={historyData}
          onSelectScan={onSelectScan}
          isLoading={isLoadingHistory}
        />
      </section>
    </div>
  );
}
