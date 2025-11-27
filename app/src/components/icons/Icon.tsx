'use client';

import React, { memo } from 'react';

/**
 * ZZIK MAP V7 - Icon System
 * Centralized, accessible icon component with TypeScript support
 * Replaces 42+ scattered inline SVG definitions
 *
 * Features:
 * - Single source of truth for all icons
 * - Built-in accessibility support (aria-label, aria-hidden)
 * - Consistent sizing via tokens (xs, sm, md, lg, xl)
 * - Forced-colors mode support
 * - Memoized for performance
 */

export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'check'
  | 'close'
  | 'location'
  | 'people'
  | 'menu-open'
  | 'menu-close'
  | 'home'
  | 'error-circle'
  | 'vibe-cozy'
  | 'vibe-modern'
  | 'vibe-vintage'
  | 'vibe-minimal'
  | 'vibe-romantic'
  | 'vibe-industrial'
  | 'vibe-nature'
  | 'vibe-luxury'
  | 'category-landmark'
  | 'category-cafe'
  | 'category-shopping'
  | 'category-entertainment'
  | 'category-nature'
  | 'category-all';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: IconSize;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

// Size tokens matching design system
const SIZES: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

// Icon SVG definitions - memoized for performance
const IconMap: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'chevron-left': memo((props) => (
    <svg fill="none" viewBox="0 0 16 16" {...props}>
      <path
        d="M2.75 8H13.25M2.75 8L5.25 5.5M2.75 8L5.25 10.5"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )),

  'chevron-right': memo((props) => (
    <svg fill="none" viewBox="0 0 16 16" {...props}>
      <path
        d="M2.75 8H13.25M13.25 8L10.75 5.5M13.25 8L10.75 10.5"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )),

  'check': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )),

  'close': memo((props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )),

  'location': memo((props) => (
    <svg fill="none" viewBox="0 0 20 20" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 14a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  )),

  'people': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM16.7 12.4a6 6 0 11-9.4 0M9 13a3 3 0 00-3 3v2a1 1 0 001 1h4a1 1 0 001-1v-2a3 3 0 00-3-3zM17 13a3 3 0 00-3 3v2a1 1 0 001 1h4a1 1 0 001-1v-2a3 3 0 00-3-3z" />
    </svg>
  )),

  'menu-open': memo((props) => (
    <svg fill="none" viewBox="0 0 20 20" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a1 1 0 011-1h12a1 1 0 011 1M3 10a1 1 0 011-1h12a1 1 0 011 1M3 15a1 1 0 011-1h12a1 1 0 011 1"
      />
    </svg>
  )),

  'menu-close': memo((props) => (
    <svg fill="none" viewBox="0 0 20 20" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      />
    </svg>
  )),

  'home': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  )),

  'error-circle': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  )),

  // Vibe category icons
  'vibe-cozy': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  )),

  'vibe-modern': memo((props) => (
    <svg fill="none" viewBox="0 0 20 20" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2H3V4zm0 3h14v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z"
      />
    </svg>
  )),

  'vibe-vintage': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  )),

  'vibe-minimal': memo((props) => (
    <svg fill="none" viewBox="0 0 20 20" strokeWidth={1.5} {...props}>
      <rect x="4" y="4" width="12" height="12" rx="1" />
    </svg>
  )),

  'vibe-romantic': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  )),

  'vibe-industrial': memo((props) => (
    <svg fill="none" viewBox="0 0 20 20" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3H5a2 2 0 00-2 2v6a2 2 0 002 2h4m0-11h4a2 2 0 012 2v6a2 2 0 01-2 2h-4m0-11v10m7-7h2a2 2 0 012 2v2a2 2 0 01-2 2h-2"
      />
    </svg>
  )),

  'vibe-nature': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M2 10.5a1.5 1.5 0 113 0v-6a1.5 1.5 0 01-3 0v6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.256 10.333z" />
    </svg>
  )),

  'vibe-luxury': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )),

  // Category icons
  'category-landmark': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2h1a1 1 0 110 2h-1v3h1a1 1 0 110 2h-1v3h1a1 1 0 110 2h-1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2H2a1 1 0 110-2h1v-3H2a1 1 0 110-2h1V7H2a1 1 0 110-2h1V4zm2 2v12h8V6H5z" />
    </svg>
  )),

  'category-cafe': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M2 4a1 1 0 011-1h6a1 1 0 011 1v7a1 1 0 11-2 0V5H3a1 1 0 01-1-1zm12-1a1 1 0 00-1 1v4h2.586L11 6.414A1 1 0 0113.414 8l3 3H18a1 1 0 100-2h-2v-3a1 1 0 00-1-1h-2zm-4 9a1 1 0 100 2h6a1 1 0 100-2H10z" />
    </svg>
  )),

  'category-shopping': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.960 9.541a1 1 0 00.894.459h7.26a1 1 0 00.894-.459l2.368-5.765.017-.041L16.78 3H17a1 1 0 000-2H3zM3 14a1 1 0 100 2h14a1 1 0 100-2H3z" />
    </svg>
  )),

  'category-entertainment': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v4h8V8H6z" />
    </svg>
  )),

  'category-nature': memo((props) => (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  )),

  'category-all': memo((props) => (
    <svg fill="none" viewBox="0 0 20 20" strokeWidth={1.5} {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 3a7 7 0 110 14 7 7 0 010-14zM10 7v6m-3-3h6"
      />
    </svg>
  )),
};

/**
 * Icon Component
 *
 * Usage:
 * <Icon name="chevron-left" size="md" aria-label="Previous" />
 * <Icon name="check" aria-hidden />
 * <Icon name="close" size="sm" className="text-red-500" />
 */
export const Icon = memo(
  React.forwardRef<SVGSVGElement, IconProps>(
    ({ name, size = 'md', className = '', 'aria-hidden': ariaHidden, ...props }, ref) => {
      const IconComponent = IconMap[name];
      const sizeClass = SIZES[size];
      const ariaHiddenValue = ariaHidden === true || ariaHidden === 'true' ? true : undefined;

      return (
        <IconComponent
          ref={ref}
          className={`${sizeClass} ${className} stroke-current forced-colors:stroke-CanvasText`}
          aria-hidden={ariaHiddenValue}
          {...props}
        />
      );
    }
  )
);

Icon.displayName = 'Icon';
