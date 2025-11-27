'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ZzikCard } from '../core/ZzikCard';
import { VibeScore } from './VibeScore';
import { VibeBadge } from './VibeBadge';
import type { VibeCategory } from '../core/ZzikBadge';

export interface VibeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  score: number;
  vibes: VibeCategory[];
  description?: string;
  showRing?: boolean;
}

export const VibeCard = forwardRef<HTMLDivElement, VibeCardProps>(
  (
    {
      className,
      title = 'Vibe Match',
      score,
      vibes,
      description,
      showRing = false,
      ...props
    },
    ref
  ) => {
    return (
      <ZzikCard
        ref={ref}
        variant="default"
        padding="md"
        className={cn('', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-[var(--text-primary)]">{title}</h4>

          {showRing ? (
            <VibeScore score={score} variant="ring" size="sm" />
          ) : (
            <VibeScore score={score} variant="text" size="md" />
          )}
        </div>

        {/* Vibe Tags */}
        <div className="flex flex-wrap gap-2">
          {vibes.map((vibe) => (
            <VibeBadge key={vibe} vibe={vibe} size="sm" />
          ))}
        </div>

        {/* Description */}
        {description && (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </ZzikCard>
    );
  }
);

VibeCard.displayName = 'VibeCard';
