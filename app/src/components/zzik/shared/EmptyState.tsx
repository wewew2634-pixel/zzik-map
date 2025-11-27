'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ZzikButton } from '../core/ZzikButton';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      primaryAction,
      secondaryAction,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('empty-state', className)}
        role="status"
        {...props}
      >
        {/* Icon */}
        {icon && <div className="empty-state-icon">{icon}</div>}

        {/* Title */}
        <h3 className="empty-state-title">{title}</h3>

        {/* Description */}
        {description && (
          <p className="empty-state-description">{description}</p>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {primaryAction && (
              <ZzikButton
                variant="primary"
                onClick={primaryAction.onClick}
                leftIcon={primaryAction.icon}
              >
                {primaryAction.label}
              </ZzikButton>
            )}

            {secondaryAction && (
              <ZzikButton variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </ZzikButton>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
