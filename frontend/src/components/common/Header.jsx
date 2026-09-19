import React, { useState } from 'react';
import { TextRoll } from '@/components/ui/text-roll';
import { Volume2, VolumeX, RefreshCw, Shield, Cpu, Wifi, Radio } from 'lucide-react';
import { toggleSound, isSoundEnabled, playClick } from '@/lib/soundFx';

export default function Header({ connectionStatus, onRefreshAll }) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const status = connectionStatus || 'Connecting';
  let statusDot = 'bg-red-500 animate-pulse';
  let statusText = 'Connecting...';
  let statusTextColor = 'text-red-400';

  if (status === 'Connected') {
    statusDot = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
    statusText = 'DEFENSE GRID ONLINE';
    statusTextColor = 'text-red-400';
  } else if (status === 'Offline') {
    statusDot = 'bg-neutral-600';
    statusText = 'OFFLINE (STANDALONE)';
    statusTextColor = 'text-neutral-500';
  }

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playClick();
  };

  const handleRefresh = async () => {
    playClick();
    setIsRefreshing(true);
    if (onRefreshAll) onRefreshAll();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="border-b border-neutral-800 bg-[#050505]/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo with Quantum Glow */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-800 to-neutral-900 p-[1.5px] shadow-[0_0_20px_rgba(239,68,68,0.25)] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#050505] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
            </div>
            {/* Pulsing Qubit Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-[#050505] rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                <TextRoll duration={0.4} className="text-white">
                  SENTINEL
                </TextRoll>
                <span className="text-red-500">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-900/60 font-bold uppercase tracking-wider">
                QUANTUM VQC v2.4
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-red-500" />
              <span>PennyLane Quantum State Vector Engine & PCAP Telemetry</span>
            </p>
          </div>
        </div>

        {/* Right HUD Controls: Audio Synthesizer, Status, and Sync */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sound FX Synthesizer Button */}
          <button
            onClick={handleSoundToggle}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
              soundOn
                ? 'bg-red-950/60 border-red-900/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={soundOn ? 'Futuristic Cyber Sound Effects: ON' : 'Sound Effects: MUTED'}
          >
            {soundOn ? (
              <>
                <Volume2 className="w-4 h-4 text-red-500" />
                <span className="hidden md:inline-flex items-center gap-0.5">
                  <span className="w-1 h-2.5 bg-red-500 animate-pulse rounded-full" />
                  <span className="w-1 h-4 bg-red-500 animate-pulse rounded-full delay-75" />
                  <span className="w-1 h-1.5 bg-red-500 animate-pulse rounded-full delay-150" />
                </span>
                <span className="hidden sm:inline">SFX ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            )}
          </button>

          {/* Real-Time Grid Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span className="text-neutral-400 hidden lg:inline">Status:</span>
            <span className={`font-bold ${statusTextColor}`}>{statusText}</span>
          </div>

          {/* Sync All Feeds Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-red-900/50 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50"
            title="Synchronize All Feeds & Quantum States"
          >
            <RefreshCw className={`w-4 h-4 text-red-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
