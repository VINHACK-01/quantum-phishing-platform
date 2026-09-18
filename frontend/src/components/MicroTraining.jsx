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
        </p>
      </div>
    );
  }

  const { title, explanation, action_tip } = trainingData;

  return (
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
          </div>
        )}

        {explanation && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            {explanation}
          </p>
        )}

        {action_tip && (
          <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-800/50 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 leading-relaxed">
              <strong className="text-emerald-400 block mb-0.5 font-mono uppercase text-[10px] tracking-wider">
                Actionable Defense Recommendation
              </strong>
              {action_tip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
