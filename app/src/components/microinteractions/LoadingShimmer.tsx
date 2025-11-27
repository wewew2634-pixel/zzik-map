'use client';

import { motion } from 'framer-motion';

/**
 * V7 Motion Economics: Loading Shimmer
 * Duration: 1500ms (continuous, background element)
 * Easing: linear (steady, predictable loading state)
 * ROI: (5 cognitive + 4 engagement) / (1 performance + 0.5 memory) = 6.0 MEDIUM
 *
 * Psychology: Placeholder gratification, prevents blank space anxiety
 * Used when: Loading photos, generating recommendations, fetching data
 *
 * Note: Shimmer effect uses GPU-accelerated gradient animation (backgroundPosition)
 * Accessibility: prefers-reduced-motion removes animation, shows subtle grid instead
 */

interface LoadingShimmerProps {
  count?: number;
  variant?: 'card' | 'line' | 'circle';
  className?: string;
  reduceMotion?: boolean;
}

export function LoadingShimmer({
  count = 3,
  variant = 'card',
  className = '',
  reduceMotion = false,
}: LoadingShimmerProps) {
  const shimmerVariants = !reduceMotion ? {
    animate: {
      x: ['-200%', '200%'],
    },
    transition: {
      duration: 1.5,
      ease: 'linear' as const,
      repeat: Infinity,
    },
  } : {
    animate: {},
    transition: {},
  };

  const skeletonBase = 'bg-gradient-to-r from-white/10 via-white/20 to-white/10 overflow-hidden';

  const variantStyles = {
    card: 'rounded-lg h-64 w-full mb-4',
    line: 'rounded h-4 w-full mb-3',
    circle: 'rounded-full h-12 w-12',
  };

  const itemStyle = variantStyles[variant];

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`shimmer-${index}`}
          className={`${skeletonBase} ${itemStyle} will-change-transform`}
          aria-busy="true"
          aria-label={`Loading ${variant} ${index + 1}`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent will-change-transform"
            animate={shimmerVariants.animate}
            transition={shimmerVariants.transition}
            style={{
              width: '100%',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Photo Grid Skeleton Loader
 * Used specifically for photo feed/grid loading
 */
interface PhotoGridSkeletonProps {
  count?: number;
  columns?: number;
}

export function PhotoGridSkeleton({
  count = 6,
  columns = 3,
}: PhotoGridSkeletonProps) {
  const shimmerVariants = {
    animate: {
      x: ['-200%', '200%'],
    },
    transition: {
      duration: 1.5,
      ease: 'linear' as const,
      repeat: Infinity,
    },
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`photo-skeleton-${index}`}
          className="bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-lg aspect-square overflow-hidden relative"
          aria-busy="true"
          aria-label={`Loading photo ${index + 1}`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={shimmerVariants.animate}
            transition={shimmerVariants.transition}
            style={{
              width: '100%',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Inline Loading Spinner
 * Lightweight alternative for button states or small elements
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
        }}
        className={`${sizeClasses[size]} border-2 border-white/20 border-t-[var(--zzik-coral)] rounded-full`}
        aria-busy="true"
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className="text-sm text-zinc-400">{text}</span>
      )}
    </div>
  );
}
