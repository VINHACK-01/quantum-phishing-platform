import React, { useState } from 'react';
import { TextRoll } from '@/components/ui/text-roll';
import { Volume2, VolumeX, RefreshCw, Shield, Cpu, Wifi, Radio } from 'lucide-react';
import { toggleSound, isSoundEnabled, playClick } from '@/lib/soundFx';

export default function Header({ connectionStatus, onRefreshAll }) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const status = connectionStatus || 'Connecting';
  let statusDot = 'bg-amber-400 animate-pulse';
  let statusText = 'Connecting...';
  let statusTextColor = 'text-amber-400';

  if (status === 'Connected') {
    statusDot = 'bg-emerald-400 shadow-[0_0_8px_#10b981]';
    statusText = 'DEFENSE GRID ONLINE';
    statusTextColor = 'text-emerald-400';
  } else if (status === 'Offline') {
    statusDot = 'bg-rose-500';
    statusText = 'OFFLINE (STANDALONE)';
    statusTextColor = 'text-rose-400';
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
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo with Quantum Glow */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            {/* Pulsing Qubit Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-purple-500 border-2 border-slate-950 rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                <TextRoll duration={0.4} className="text-white">
                  SENTINEL
                </TextRoll>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold uppercase tracking-wider">
                QUANTUM VQC v2.4
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-purple-400" />
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
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundOn ? 'Futuristic Cyber Sound Effects: ON' : 'Sound Effects: MUTED'}
          >
            {soundOn ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden md:inline-flex items-center gap-0.5">
                  <span className="w-1 h-2.5 bg-cyan-400 animate-pulse rounded-full" />
                  <span className="w-1 h-4 bg-cyan-400 animate-pulse rounded-full delay-75" />
                  <span className="w-1 h-1.5 bg-cyan-400 animate-pulse rounded-full delay-150" />
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/90 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span className="text-slate-400 hidden lg:inline">Status:</span>
            <span className={`font-bold ${statusTextColor}`}>{statusText}</span>
          </div>

          {/* Sync All Feeds Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50"
            title="Synchronize All Feeds & Quantum States"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
