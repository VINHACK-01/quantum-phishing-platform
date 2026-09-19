import { useState } from 'react';
import HistoryTable from '../HistoryTable';

export default function HistoryView({ historyData, onSelectScan, isLoadingHistory }) {
  const [searchTerm, setSearchTerm] = useState('');

  const scans = historyData?.scans || [];

  const filteredScans = scans.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.url?.toLowerCase().includes(term) ||
      s.risk_level?.toLowerCase().includes(term) ||
      s.id?.toLowerCase().includes(term)
    );
  });

  const filteredData = { scans: filteredScans };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-3">
        <div>
          <h2 className="text-3xl font-display text-white tracking-wide">Scan Audit History</h2>
          <p className="text-xs font-sans text-neutral-400 mt-0.5">FIFO memory queue of previous URL threat assessments</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search domain, risk, or scan ID..."
            className="w-full px-3.5 py-2 bg-[#050505] border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 font-mono placeholder-neutral-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs font-sans"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <HistoryTable
        historyData={filteredData}
        onSelectScan={onSelectScan}
        isLoading={isLoadingHistory}
      />
    </div>
  );
}
