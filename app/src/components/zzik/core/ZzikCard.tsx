'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ZzikCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  isSelected?: boolean;
  href?: string;
}

const variantStyles = {
  default: 'card',
  elevated: 'card-elevated',
  outlined: 'card-outlined',
  ghost: 'card-ghost',
  interactive: 'card-interactive',
};

const paddingStyles = {
  none: 'card-p-none',
  sm: 'card-p-sm',
  md: 'card-p-md',
  lg: 'card-p-lg',
  xl: 'card-p-xl',
};

export const ZzikCard = forwardRef<HTMLDivElement, ZzikCardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      isSelected = false,
      href,
      children,
      ...props
    },
    ref
  ) => {
    const cardClasses = cn(
      variantStyles[variant],
      paddingStyles[padding],
      isSelected && 'card-selected',
      className
    );

    if (href) {
      return (
        <Link href={href} className={cn(cardClasses, 'block')}>
          {children}
        </Link>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

ZzikCard.displayName = 'ZzikCard';
