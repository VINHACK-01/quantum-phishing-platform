import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Award, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { playClick, playSafeChime } from '@/lib/soundFx';
import { triggerCyberConfetti } from '@/lib/confetti';

export default function MicroTraining({ trainingData }) {
  const [claimed, setClaimed] = useState(false);

  const handleClaimXp = () => {
    playSafeChime();
    triggerCyberConfetti();
    setClaimed(true);
  };

  if (!trainingData) {
    return (
<<<<<<< HEAD
      <div className="nexus-card p-5 border-l-4 border-l-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-neutral-900 text-red-500 rounded-lg border border-neutral-800">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-white">Security Awareness Training</h3>
        </div>
        <p className="text-xs text-neutral-500">
          Contextual micro-training tips will appear here automatically when threat vectors are detected during URL analysis.
=======
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>Security Awareness Micro-Module</span>
              <Badge variant="secondary" className="text-[10px]">Contextual Defense</Badge>
            </h3>
            <p className="text-xs text-slate-400">Live attack breakdown & tactical mitigation advice</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-mono">
          Contextual security briefings trigger automatically whenever active threat vectors or brand impersonation attempts are detected.
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
        </p>
      </div>
    );
  }

  const { title, explanation, action_tip } = trainingData;

  return (
<<<<<<< HEAD
    <div className="nexus-card p-5 border-l-4 border-l-red-600 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-red-950 text-red-400 rounded-lg border border-red-900/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <h3 className="text-lg font-display text-white tracking-wide">Security Awareness Micro-Module</h3>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-900 uppercase font-bold">
          Contextual Defense
        </span>
      </div>

      <div className="bg-[#070707] p-4 rounded-xl border border-neutral-900 space-y-3">
        {title && (
          <div>
            <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-red-400 block">Identified Threat Vector</span>
            <h4 className="text-base font-display text-white tracking-wide mt-0.5">{title}</h4>
=======
    <div className="relative rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950 p-6 shadow-2xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>Security Intelligence Briefing</span>
              <Badge variant="quantum" className="text-[10px] bg-indigo-950 text-indigo-300 border-indigo-800">
                Tactical XP
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">Interactive threat recognition & mitigation guide</p>
          </div>
        </div>

        {/* Claim XP Gamification Badge */}
        <button
          onClick={handleClaimXp}
          disabled={claimed}
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow ${
            claimed
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white border border-indigo-400/50 active:scale-95'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-yellow-300" />
          <span>{claimed ? '+100 XP Earned!' : 'Claim +100 XP'}</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-900 space-y-3.5">
        {title && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-indigo-400">
              Identified Threat Vector Pattern
            </span>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{title}</span>
            </h4>
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
          </div>
        )}

        {explanation && (
<<<<<<< HEAD
          <p className="text-xs text-neutral-300 leading-relaxed">
=======
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
            {explanation}
          </p>
        )}

        {action_tip && (
<<<<<<< HEAD
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-neutral-200">
              <strong className="text-red-400 block mb-0.5 uppercase text-[10px] tracking-wider font-bold">Actionable Security Tip</strong>
=======
          <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-800/50 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 leading-relaxed">
              <strong className="text-emerald-400 block mb-0.5 font-mono uppercase text-[10px] tracking-wider">
                Actionable Defense Recommendation
              </strong>
>>>>>>> d7a6843 (Optimize ML adapter and update frontend features)
              {action_tip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
