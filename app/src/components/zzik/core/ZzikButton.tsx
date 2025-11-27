'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ZzikButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
}

const variantStyles = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger',
};

const sizeStyles = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

export const ZzikButton = forwardRef<HTMLButtonElement, ZzikButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          variantStyles[variant],
          sizeStyles[size],
          isLoading && 'btn-loading',
          isFullWidth && 'btn-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {leftIcon && !isLoading && (
          <span className="btn-icon-left" data-slot="icon">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && !isLoading && (
          <span className="btn-icon-right" data-slot="icon">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

ZzikButton.displayName = 'ZzikButton';
