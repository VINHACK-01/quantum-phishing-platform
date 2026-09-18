export default function StatCard({ title, value, subtext, icon, accent = 'red' }) {
  let accentBorder = 'border-neutral-800 hover:border-neutral-700';
  let iconBg = 'bg-neutral-900 text-neutral-300 border border-neutral-800';

  if (accent === 'red') {
    accentBorder = 'border-red-900/40 hover:border-red-800/60';
    iconBg = 'bg-red-950/80 text-red-400 border border-red-900/60';
  } else if (accent === 'emerald') {
    accentBorder = 'border-emerald-900/40 hover:border-emerald-800/60';
    iconBg = 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/60';
  } else if (accent === 'amber') {
    accentBorder = 'border-amber-900/40 hover:border-amber-800/60';
    iconBg = 'bg-amber-950/80 text-amber-400 border border-amber-900/60';
  }

  return (
    <div className={`nexus-card p-5 border ${accentBorder} flex items-start justify-between gap-4`}>
      <div className="space-y-1">
        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-400 block">{title}</span>
        <div className="text-3xl sm:text-4xl font-display tracking-wide text-white">{value}</div>
        {subtext && <p className="text-[11px] font-sans text-neutral-500 font-medium">{subtext}</p>}
      </div>
      {icon && (
        <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
