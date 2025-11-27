'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'coral' | 'cyan';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const variantStyles = {
  light: 'glass',
  dark: 'glass-dark',
  coral: 'glass-coral',
  cyan: 'glass-cyan',
};

const blurStyles = {
  sm: 'glass-blur-sm',
  md: 'glass-blur-md',
  lg: 'glass-blur-lg',
  xl: 'glass-blur-xl',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

const radiusStyles = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-3xl',
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      className,
      variant = 'light',
      blur = 'md',
      bordered = true,
      padding = 'md',
      radius = 'xl',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          blurStyles[blur],
          paddingStyles[padding],
          radiusStyles[radius],
          !bordered && 'border-transparent',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
