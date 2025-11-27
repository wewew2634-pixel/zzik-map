/**
 * ZZIK Design Tokens - TypeScript Export
 *
 * This file provides programmatic access to design tokens for:
 * - Dynamic styling
 * - Theme switching
 * - Component configuration
 * - Storybook/testing
 */

// =============================================================================
// COLOR TOKENS
// =============================================================================

export const colors = {
  // Brand Colors
  brand: {
    coral: {
      50: '#FFF5F5',
      100: '#FFE5E6',
      200: '#FFCCCE',
      300: '#FFB3B6',
      400: '#FF8589',
      500: '#FF5A5F', // Primary
      600: '#E5484D',
      700: '#CC3E42',
      800: '#B33337',
      900: '#99292C',
    },
    cyan: {
      50: '#F0FDFF',
      100: '#E0FAFF',
      200: '#B8F4FF',
      300: '#8EEDFF',
      400: '#47E3FF',
      500: '#00D9FF', // Accent
      600: '#00B8D9',
      700: '#0097B3',
      800: '#00788C',
      900: '#005966',
    },
    deepSpace: {
      50: '#E8EBF0',
      100: '#C4CCD8',
      200: '#9EADC0',
      300: '#788EA8',
      400: '#5A7490',
      500: '#3D5A78',
      600: '#2A4360',
      700: '#1A2E48',
      800: '#0F1C30',
      900: '#0A1628', // Background
    },
  },

  // Status Colors
  status: {
    success: {
      light: '#D1FAE5',
      main: '#10B981',
      dark: '#047857',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#B45309',
    },
    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#B91C1C',
    },
    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#1D4ED8',
    },
  },

  // Neutral Colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
} as const;

// =============================================================================
// SPACING TOKENS
// =============================================================================

export const spacing = {
  // Primitive (4px base)
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',

  // Semantic
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: 'var(--font-geist-sans), var(--font-pretendard), -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace',
    display: 'var(--font-pretendard), -apple-system, BlinkMacSystemFont, sans-serif',
    ko: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
    ja: '"Noto Sans JP", "Hiragino Kaku Gothic Pro", sans-serif',
    zhCN: '"Noto Sans SC", "PingFang SC", sans-serif',
    zhTW: '"Noto Sans TC", "PingFang TC", sans-serif',
    th: '"Noto Sans Thai", "Sarabun", sans-serif',
  },

  // Font Sizes (Fluid scale)
  fontSize: {
    xs: 'clamp(0.6875rem, 0.65rem + 0.1875vw, 0.75rem)', // 11-12px
    sm: 'clamp(0.8125rem, 0.775rem + 0.1875vw, 0.875rem)', // 13-14px
    base: 'clamp(0.9375rem, 0.9rem + 0.1875vw, 1rem)', // 15-16px
    lg: 'clamp(1.0625rem, 1rem + 0.3125vw, 1.125rem)', // 17-18px
    xl: 'clamp(1.1875rem, 1.1rem + 0.4375vw, 1.25rem)', // 19-20px
    '2xl': 'clamp(1.375rem, 1.25rem + 0.625vw, 1.5rem)', // 22-24px
    '3xl': 'clamp(1.625rem, 1.5rem + 0.625vw, 1.875rem)', // 26-30px
    '4xl': 'clamp(2rem, 1.8rem + 1vw, 2.25rem)', // 32-36px
    '5xl': 'clamp(2.5rem, 2.2rem + 1.5vw, 3rem)', // 40-48px
    '6xl': 'clamp(3rem, 2.6rem + 2vw, 3.75rem)', // 48-60px
  },

  // Font Weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// MOTION TOKENS
// =============================================================================

export const motion = {
  // Duration
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
    glacial: '1000ms',
  },

  // Easing
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring: 'cubic-bezier(0.5, 1.25, 0.75, 1.25)',
  },
} as const;

// =============================================================================
// RADIUS TOKENS
// =============================================================================

export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

// =============================================================================
// SHADOW TOKENS
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // Colored shadows (dark theme)
  coral: '0 4px 14px -3px rgba(255, 90, 95, 0.25)',
  cyan: '0 4px 14px -3px rgba(0, 217, 255, 0.25)',
  glow: {
    coral: '0 0 20px rgba(255, 90, 95, 0.5)',
    cyan: '0 0 20px rgba(0, 217, 255, 0.5)',
  },
} as const;

// =============================================================================
// BREAKPOINT TOKENS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX TOKENS
// =============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// =============================================================================
// EXPORT ALL
// =============================================================================

export const designTokens = {
  colors,
  spacing,
  typography,
  motion,
  radius,
  shadows,
  breakpoints,
  zIndex,
} as const;

export type DesignTokens = typeof designTokens;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Motion = typeof motion;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
