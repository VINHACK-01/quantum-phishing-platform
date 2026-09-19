import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'quantum' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-red-950/60 text-red-300 border-red-900/60 hover:bg-red-900/80',
    secondary: 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800',
    destructive: 'bg-red-950/80 text-red-400 border-red-900 hover:bg-red-900',
    outline: 'border-neutral-800 text-neutral-400',
    quantum: 'bg-red-950/60 text-red-300 border-red-900/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
    success: 'bg-neutral-900 text-neutral-300 border-neutral-800',
    warning: 'bg-red-950/40 text-red-300 border-red-900/40',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono uppercase tracking-wider transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
