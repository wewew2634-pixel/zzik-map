'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type VibeCategory =
  | 'cozy'
  | 'modern'
  | 'vintage'
  | 'minimal'
  | 'romantic'
  | 'industrial'
  | 'nature'
  | 'luxury';

export interface ZzikBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  vibe?: VibeCategory;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
}

const colorStyles = {
  default: 'badge-neutral',
  primary: 'badge-zzik-coral',
  secondary: 'badge-electric-cyan',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

const vibeStyles: Record<VibeCategory, string> = {
  cozy: 'badge-vibe-cozy',
  modern: 'badge-vibe-modern',
  vintage: 'badge-vibe-vintage',
  minimal: 'badge-vibe-minimal',
  romantic: 'badge-vibe-romantic',
  industrial: 'badge-vibe-industrial',
  nature: 'badge-vibe-nature',
  luxury: 'badge-vibe-luxury',
};

const sizeStyles = {
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
};

export const ZzikBadge = forwardRef<HTMLSpanElement, ZzikBadgeProps>(
  (
    {
      className,
      variant = 'solid',
      color = 'default',
      vibe,
      size = 'md',
      dot = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const badgeClass = vibe ? vibeStyles[vibe] : colorStyles[color];

    return (
      <span
        ref={ref}
        className={cn(
          'badge',
          badgeClass,
          sizeStyles[size],
          variant === 'outline' && 'badge-outline',
          dot && 'badge-dot',
          className
        )}
        {...props}
      >
        {icon && <span data-slot="icon">{icon}</span>}
        {children}
      </span>
    );
  }
);

ZzikBadge.displayName = 'ZzikBadge';
