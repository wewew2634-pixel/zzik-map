'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface MapMarkerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'selected' | 'cluster';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  count?: number;
  label?: string;
}

const sizeStyles = {
  sm: 'map-marker-sm',
  md: 'map-marker-md',
  lg: 'map-marker-lg',
};

export const MapMarker = forwardRef<HTMLDivElement, MapMarkerProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      pulse = false,
      count,
      label,
      ...props
    },
    ref
  ) => {
    if (variant === 'cluster') {
      return (
        <div
          ref={ref}
          className={cn(
            'map-marker-cluster',
            count && count > 50 && 'map-marker-cluster-lg',
            count && count > 20 && count <= 50 && 'map-marker-cluster-md',
            count && count <= 20 && 'map-marker-cluster-sm',
            className
          )}
          role="button"
          aria-label={`Cluster with ${count} locations`}
          {...props}
        >
          <span>{count}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'map-marker-zzik',
          sizeStyles[size],
          variant === 'selected' && 'is-selected',
          pulse && 'is-pulsing',
          className
        )}
        role="button"
        aria-label={label || 'Map marker'}
        {...props}
      >
        {label && <span className="sr-only">{label}</span>}
      </div>
    );
  }
);

MapMarker.displayName = 'MapMarker';
