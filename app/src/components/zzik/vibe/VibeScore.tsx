'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface VibeScoreProps extends React.HTMLAttributes<HTMLSpanElement> {
  score: number;
  variant?: 'text' | 'badge' | 'ring';
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
  label?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

const getScoreLevel = (score: number) => {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};

export const VibeScore = forwardRef<HTMLSpanElement, VibeScoreProps>(
  (
    {
      className,
      score,
      variant = 'text',
      size = 'md',
      showPercent = true,
      label,
      ...props
    },
    ref
  ) => {
    const level = getScoreLevel(score);

    if (variant === 'badge') {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-full',
            level === 'high' && 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]',
            level === 'medium' && 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]',
            level === 'low' && 'bg-[var(--interactive-ghost-hover)] text-[var(--text-tertiary)]',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          {label && <span className="text-xs opacity-70">{label}</span>}
          <span className="font-bold">
            {score}
            {showPercent && '%'}
          </span>
        </span>
      );
    }

    if (variant === 'ring') {
      const circumference = 2 * Math.PI * 45;
      const strokeDashoffset = circumference - (score / 100) * circumference;

      return (
        <div
          className={cn(
            'relative inline-flex items-center justify-center',
            size === 'sm' && 'w-12 h-12',
            size === 'md' && 'w-16 h-16',
            size === 'lg' && 'w-24 h-24',
            className
          )}
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={
                level === 'high'
                  ? 'var(--color-success-500)'
                  : level === 'medium'
                  ? 'var(--color-warning-500)'
                  : 'var(--text-tertiary)'
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span
            ref={ref}
            className={cn(
              'absolute font-bold',
              `vibe-score-${level}`,
              sizeStyles[size]
            )}
            {...props}
          >
            {score}
            {showPercent && <span className="text-xs">%</span>}
          </span>
        </div>
      );
    }

    // Default text variant
    return (
      <span
        ref={ref}
        className={cn(
          'vibe-score',
          `vibe-score-${level}`,
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {label && <span className="text-xs opacity-70 mr-1">{label}</span>}
        {score}
        {showPercent && '%'}
      </span>
    );
  }
);

VibeScore.displayName = 'VibeScore';
