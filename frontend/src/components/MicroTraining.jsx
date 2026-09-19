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
      <div className="relative rounded-2xl border border-neutral-800 bg-[#050505] p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-900/60">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-display text-white tracking-wide flex items-center gap-2">
              <span>Security Awareness Micro-Module</span>
              <Badge variant="secondary" className="text-[10px]">Contextual Defense</Badge>
            </h3>
            <p className="text-xs text-neutral-400">Live attack breakdown & tactical mitigation advice</p>
          </div>
        </div>
        <p className="text-xs text-neutral-500 font-mono">
          Contextual security briefings trigger automatically whenever active threat vectors or brand impersonation attempts are detected.
        </p>
      </div>
    );
  }

  const { title, explanation, action_tip } = trainingData;

  return (
    <div className="relative rounded-2xl border border-red-900/40 bg-[#080808] p-6 shadow-2xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-display text-white tracking-wide flex items-center gap-2">
              <span>Security Intelligence Briefing</span>
              <Badge variant="quantum" className="text-[10px] bg-red-950/60 text-red-300 border-red-900/60">
                Tactical XP
              </Badge>
            </h3>
            <p className="text-xs text-neutral-400">Interactive threat recognition & mitigation guide</p>
          </div>
        </div>

        {/* Claim XP Gamification Badge */}
        <button
          onClick={handleClaimXp}
          disabled={claimed}
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow ${
            claimed
              ? 'bg-red-950/80 text-red-300 border border-red-900'
              : 'bg-red-600 hover:bg-red-700 text-white border border-red-500/50 active:scale-95'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-white" />
          <span>{claimed ? '+100 XP Earned!' : 'Claim +100 XP'}</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="bg-[#050505] p-4 rounded-xl border border-neutral-900 space-y-3.5">
        {title && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-red-400">
              Identified Threat Vector Pattern
            </span>
            <h4 className="text-xl font-display text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{title}</span>
            </h4>
          </div>
        )}

        {explanation && (
          <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900 p-3 rounded-lg border border-neutral-800">
            {explanation}
          </p>
        )}

        {action_tip && (
          <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-200 leading-relaxed">
              <strong className="text-red-400 block mb-0.5 font-mono uppercase text-[10px] tracking-wider">
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
