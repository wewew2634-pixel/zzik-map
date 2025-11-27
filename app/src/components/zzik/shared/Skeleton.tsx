'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'avatar' | 'card' | 'image';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      lines = 1,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (variant === 'avatar') {
      return (
        <div
          ref={ref}
          className={cn('skeleton-avatar animate-pulse', className)}
          style={baseStyles}
          aria-label="Loading"
          {...props}
        />
      );
    }

    if (variant === 'card') {
      return (
        <div
          ref={ref}
          className={cn('skeleton-card', className)}
          aria-label="Loading"
          {...props}
        >
          <div className="skeleton aspect-photo mb-4" />
          <div className="space-y-2">
            <div className="skeleton-text w-3/4 animate-pulse" />
            <div className="skeleton-text w-1/2 animate-pulse" />
          </div>
        </div>
      );
    }

    if (variant === 'image') {
      return (
        <div
          ref={ref}
          className={cn('skeleton animate-pulse', className)}
          style={{ aspectRatio: '4/3', ...baseStyles }}
          aria-label="Loading"
          {...props}
        />
      );
    }

    // Text variant with multiple lines
    if (lines > 1) {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          aria-label="Loading"
          {...props}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'skeleton-text animate-pulse',
                index === lines - 1 ? 'w-2/3' : 'w-full'
              )}
              style={index === 0 ? baseStyles : undefined}
            />
          ))}
        </div>
      );
    }

    // Single text line
    return (
      <div
        ref={ref}
        className={cn('skeleton-text animate-pulse', className)}
        style={baseStyles}
        aria-label="Loading"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Convenience components
export const SkeletonCard = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'>
>((props, ref) => <Skeleton ref={ref} variant="card" {...props} />);

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonAvatar = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'>
>((props, ref) => <Skeleton ref={ref} variant="avatar" {...props} />);

SkeletonAvatar.displayName = 'SkeletonAvatar';

export const SkeletonText = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'>
>((props, ref) => <Skeleton ref={ref} variant="text" {...props} />);

SkeletonText.displayName = 'SkeletonText';
