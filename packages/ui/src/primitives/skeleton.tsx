import clsx from 'clsx'
import React from 'react'

type SkeletonProps = {
  variant?: 'text' | 'circular' | 'rectangular' | 'custom'
  width?: string | number
  height?: string | number
  className?: string
  children?: React.ReactNode
}

/**
 * Skeleton component for loading states
 *
 * Uses Linear-grade animation with zzik design tokens:
 * - animate-zzik-skeleton-pulse (2s pulse animation)
 * - bg-zzik-surface-base (L1 surface)
 * - Smooth transitions with duration-zzik-normal
 *
 * @example
 * // Text skeleton (single line)
 * <Skeleton variant="text" />
 *
 * @example
 * // Circular skeleton (avatar)
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * @example
 * // Rectangular skeleton (card)
 * <Skeleton variant="rectangular" width="100%" height={120} />
 *
 * @example
 * // Custom skeleton (using className)
 * <Skeleton variant="custom" className="w-full h-20 rounded-zzik-depth-md" />
 */
export function Skeleton({ variant = 'text', width, height, className, children }: SkeletonProps) {
  const baseClasses = [
    'bg-zzik-surface-base',
    'animate-zzik-skeleton-pulse',
    'transition-all duration-zzik-normal',
  ]

  const variantClasses = {
    text: ['h-4', 'w-full', 'rounded-zzik-depth-sm'],
    circular: ['rounded-full'],
    rectangular: ['rounded-zzik-depth-sm'],
    custom: [],
  }

  const styles: React.CSSProperties = {}
  if (width !== undefined) {
    styles.width = typeof width === 'number' ? `${width}px` : width
  }
  if (height !== undefined) {
    styles.height = typeof height === 'number' ? `${height}px` : height
  }

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={styles}
      aria-live="polite"
      aria-busy="true"
    >
      {children}
    </div>
  )
}

/**
 * Skeleton variants for common use cases
 */
export const SkeletonText = ({ className, ...props }: Omit<SkeletonProps, 'variant'>) => (
  <Skeleton variant="text" className={className} {...props} />
)

export const SkeletonCircle = ({ size = 40, className, ...props }: Omit<SkeletonProps, 'variant'> & { size?: number }) => (
  <Skeleton variant="circular" width={size} height={size} className={className} {...props} />
)

export const SkeletonRect = ({ className, ...props }: Omit<SkeletonProps, 'variant'>) => (
  <Skeleton variant="rectangular" className={className} {...props} />
)
