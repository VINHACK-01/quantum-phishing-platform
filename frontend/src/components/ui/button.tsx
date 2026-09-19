import * as React from 'react';
import { cn } from '@/lib/utils';
import { playClick } from '@/lib/soundFx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'quantum' | 'cyber';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playClick();
      if (onClick) onClick(e);
    };

    const variantClasses = {
      default: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50 border border-red-500/30',
      destructive: 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-900/60',
      outline: 'border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white',
      secondary: 'bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-800',
      ghost: 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white',
      quantum: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/60 border border-red-500/40',
      cyber: 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] border border-red-500/50 font-bold',
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-12 rounded-lg px-8 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
