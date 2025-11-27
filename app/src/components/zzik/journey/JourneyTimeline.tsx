'use client';

import { forwardRef, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface JourneyStep {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  description?: string;
  status: 'completed' | 'active' | 'upcoming';
  image?: string;
}

export interface JourneyTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: JourneyStep[];
  orientation?: 'vertical' | 'horizontal';
  onStepClick?: (step: JourneyStep) => void;
}

const statusClasses = {
  completed: 'is-completed',
  active: 'is-active',
  upcoming: 'is-upcoming',
};

export const JourneyTimeline = forwardRef<HTMLDivElement, JourneyTimelineProps>(
  (
    {
      className,
      steps,
      orientation = 'vertical',
      onStepClick,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'journey-timeline',
          orientation === 'horizontal' && 'journey-timeline-horizontal',
          className
        )}
        role="list"
        aria-label="Journey timeline"
        {...props}
      >
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn('journey-node', statusClasses[step.status])}
            role="listitem"
            onClick={() => onStepClick?.(step)}
            style={{ cursor: onStepClick ? 'pointer' : 'default' }}
          >
            <div className="journey-node-marker" aria-hidden="true" />

            <div className="journey-node-content">
              {step.image && (
                <div className="relative w-12 h-12 mb-2">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect fill='%23e5e7eb' width='48' height='48'/%3E%3C/svg%3E"
                    className="rounded-lg object-cover"
                    sizes="48px"
                  />
                </div>
              )}

              <span className="journey-node-label">{step.title}</span>

              {step.subtitle && (
                <span className="journey-node-subtitle text-sm text-[var(--text-secondary)]">
                  {step.subtitle}
                </span>
              )}

              {step.time && (
                <span className="journey-node-time">{step.time}</span>
              )}

              {step.description && (
                <p className="journey-node-description">{step.description}</p>
              )}
            </div>

            {/* Accessibility */}
            <span className="sr-only">
              Step {index + 1} of {steps.length}: {step.title} - {step.status}
            </span>
          </div>
        ))}
      </div>
    );
  }
);

JourneyTimeline.displayName = 'JourneyTimeline';

// Memoized version for performance
export const MemoizedJourneyTimeline = memo(JourneyTimeline);
