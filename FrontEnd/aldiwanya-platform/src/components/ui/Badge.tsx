import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'neutral'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  children,
  ...props
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-sm shadow-cyan-500/10',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-sm shadow-purple-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/10',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
