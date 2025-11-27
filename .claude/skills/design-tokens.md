# Design Tokens Skill V3
## Systematic Token Architecture & Auto-Generation

## When to Use
Invoke this skill when:
- Setting up design token system
- Generating CSS variables from tokens
- Ensuring token consistency
- Building theme switcher
- Creating dark/light mode support

---

## Token Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: COMPONENT TOKENS                                       │
│ --btn-primary-bg, --card-radius, --input-border                 │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: SEMANTIC TOKENS                                        │
│ --surface-base, --text-primary, --border-default                │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: ALIAS TOKENS                                           │
│ --color-brand, --color-accent, --color-neutral                  │
├─────────────────────────────────────────────────────────────────┤
│ Layer 1: PRIMITIVE TOKENS                                       │
│ --color-zzik-coral-500, --spacing-4, --radius-lg                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Primitive Tokens

### Colors
```typescript
// tokens/primitives/colors.ts
export const colors = {
  // Brand Colors
  zzikCoral: {
    50: '#FFF5F5',
    100: '#FFE5E5',
    200: '#FFCCCD',
    300: '#FFA3A5',
    400: '#FF7A7D',
    500: '#FF5A5F', // Primary
    600: '#E6494E',
    700: '#CC3A3E',
    800: '#992B2F',
    900: '#661D1F',
  },

  electricCyan: {
    50: '#E6FCFF',
    100: '#B3F5FF',
    200: '#80EEFF',
    300: '#4DE7FF',
    400: '#1AE0FF',
    500: '#00D9FF', // Primary
    600: '#00B3D4',
    700: '#008DAA',
    800: '#006680',
    900: '#004055',
  },

  deepSpace: {
    50: '#E8EBF0',
    100: '#C5CCD9',
    200: '#9FADBF',
    300: '#788EA6',
    400: '#516F8C',
    500: '#2B5173',
    600: '#1E3A52',
    700: '#142840',
    800: '#0A1628', // Primary
    900: '#050B14',
  },

  // Neutral (Zinc)
  zinc: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },

  // Status
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};
```

### Spacing
```typescript
// tokens/primitives/spacing.ts
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px (touch target)
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
};
```

### Typography
```typescript
// tokens/primitives/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};
```

### Effects
```typescript
// tokens/primitives/effects.ts
export const effects = {
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 40px rgba(255, 90, 95, 0.3)',
    glowCyan: '0 0 40px rgba(0, 217, 255, 0.3)',
  },

  blur: {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
};
```

---

## Layer 2: Alias Tokens

```typescript
// tokens/alias.ts
import { colors } from './primitives/colors';

export const aliasTokens = {
  // Brand
  brand: {
    primary: colors.zzikCoral[500],
    primaryHover: colors.zzikCoral[600],
    primaryActive: colors.zzikCoral[700],
  },

  accent: {
    primary: colors.electricCyan[500],
    primaryHover: colors.electricCyan[600],
    primaryActive: colors.electricCyan[700],
  },

  // Backgrounds
  background: {
    base: colors.deepSpace[800],
    elevated: colors.deepSpace[700],
    overlay: colors.deepSpace[600],
  },

  // Neutrals
  neutral: {
    50: colors.zinc[50],
    100: colors.zinc[100],
    200: colors.zinc[200],
    300: colors.zinc[300],
    400: colors.zinc[400],
    500: colors.zinc[500],
    600: colors.zinc[600],
    700: colors.zinc[700],
    800: colors.zinc[800],
    900: colors.zinc[900],
  },
};
```

---

## Layer 3: Semantic Tokens

```typescript
// tokens/semantic.ts
import { aliasTokens } from './alias';

export const semanticTokens = {
  // Surfaces
  surface: {
    base: aliasTokens.background.base,
    raised: aliasTokens.background.elevated,
    overlay: aliasTokens.background.overlay,
    inverse: aliasTokens.neutral[50],
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: aliasTokens.neutral[400], // 5.7:1 contrast
    tertiary: aliasTokens.neutral[500],  // 4.3:1 contrast
    muted: aliasTokens.neutral[600],     // Use sparingly
    inverse: aliasTokens.neutral[900],
    brand: aliasTokens.brand.primary,
    accent: aliasTokens.accent.primary,
  },

  // Interactive
  interactive: {
    primary: aliasTokens.brand.primary,
    primaryHover: aliasTokens.brand.primaryHover,
    primaryActive: aliasTokens.brand.primaryActive,
    secondary: aliasTokens.accent.primary,
    secondaryHover: aliasTokens.accent.primaryHover,
  },

  // Borders
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    subtle: 'rgba(255, 255, 255, 0.05)',
    strong: 'rgba(255, 255, 255, 0.2)',
    focus: aliasTokens.accent.primary,
  },

  // Status
  status: {
    success: '#22C55E',
    successBg: 'rgba(34, 197, 94, 0.1)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.1)',
  },
};
```

---

## Layer 4: Component Tokens

```typescript
// tokens/components.ts
import { semanticTokens } from './semantic';
import { effects, spacing } from './primitives';

export const componentTokens = {
  // Button
  button: {
    primary: {
      bg: semanticTokens.interactive.primary,
      bgHover: semanticTokens.interactive.primaryHover,
      bgActive: semanticTokens.interactive.primaryActive,
      text: '#FFFFFF',
      border: 'transparent',
    },
    secondary: {
      bg: 'transparent',
      bgHover: 'rgba(255, 255, 255, 0.05)',
      text: semanticTokens.text.primary,
      border: semanticTokens.border.default,
    },
    size: {
      sm: { height: '32px', padding: spacing[3], fontSize: '14px' },
      md: { height: '40px', padding: spacing[4], fontSize: '16px' },
      lg: { height: '48px', padding: spacing[5], fontSize: '18px' },
    },
    radius: effects.borderRadius.xl,
  },

  // Card
  card: {
    bg: semanticTokens.surface.raised,
    border: semanticTokens.border.default,
    radius: effects.borderRadius['2xl'],
    shadow: effects.shadow.lg,
    padding: spacing[6],
  },

  // Input
  input: {
    bg: 'rgba(255, 255, 255, 0.05)',
    bgFocus: 'rgba(255, 255, 255, 0.1)',
    border: semanticTokens.border.default,
    borderFocus: semanticTokens.border.focus,
    text: semanticTokens.text.primary,
    placeholder: semanticTokens.text.tertiary,
    radius: effects.borderRadius.lg,
    height: '44px',
  },

  // Badge
  badge: {
    radius: effects.borderRadius.full,
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: '12px',
    vibes: {
      cozy: { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
      modern: { bg: 'rgba(168, 85, 247, 0.2)', text: '#A855F7' },
      vintage: { bg: 'rgba(180, 83, 9, 0.2)', text: '#D97706' },
      minimal: { bg: 'rgba(113, 113, 122, 0.2)', text: '#A1A1AA' },
      romantic: { bg: 'rgba(236, 72, 153, 0.2)', text: '#EC4899' },
      industrial: { bg: 'rgba(82, 82, 91, 0.2)', text: '#71717A' },
      nature: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E' },
      luxury: { bg: 'rgba(234, 179, 8, 0.2)', text: '#EAB308' },
    },
  },

  // Navigation
  nav: {
    height: '64px',
    bg: 'rgba(10, 22, 40, 0.8)',
    blur: effects.blur.lg,
    border: semanticTokens.border.subtle,
  },
};
```

---

## CSS Generation

### Generate CSS Variables
```typescript
// scripts/generate-tokens.ts
import { writeFileSync } from 'fs';
import * as tokens from '../tokens';

function flattenTokens(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTokens(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

function generateCSS(tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(
    ([key, value]) => `  --${key}: ${value};`
  );

  return `:root {\n${lines.join('\n')}\n}`;
}

// Generate
const flattened = flattenTokens(tokens);
const css = generateCSS(flattened);
writeFileSync('src/styles/tokens.css', css);
```

### Output: tokens.css
```css
:root {
  /* Primitives */
  --color-zzik-coral-500: #FF5A5F;
  --color-electric-cyan-500: #00D9FF;
  --color-deep-space-800: #0A1628;

  /* Semantic */
  --surface-base: #0A1628;
  --surface-raised: #142840;
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --border-default: rgba(255, 255, 255, 0.1);

  /* Components */
  --btn-primary-bg: #FF5A5F;
  --btn-primary-bg-hover: #E6494E;
  --card-radius: 1rem;
  --input-height: 44px;
}
```

---

## Tailwind Integration

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss';
import { colors, spacing, effects, typography } from './tokens/primitives';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'zzik-coral': colors.zzikCoral,
        'electric-cyan': colors.electricCyan,
        'deep-space': colors.deepSpace,
      },
      spacing,
      borderRadius: effects.borderRadius,
      boxShadow: effects.shadow,
      blur: effects.blur,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
    },
  },
  plugins: [],
} satisfies Config;
```

---

## Theme Switching

### Theme Context
```typescript
// lib/theme.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      root.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme);
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### Theme-Aware CSS
```css
:root,
[data-theme='dark'] {
  --surface-base: #0A1628;
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
}

[data-theme='light'] {
  --surface-base: #FFFFFF;
  --text-primary: #18181B;
  --text-secondary: #71717A;
}
```

---

## Token Validation

### Validate Contrast
```typescript
function validateContrastTokens(tokens: SemanticTokens): ValidationResult[] {
  const issues: ValidationResult[] = [];

  const textColors = [
    { name: 'text-primary', color: tokens.text.primary },
    { name: 'text-secondary', color: tokens.text.secondary },
    { name: 'text-tertiary', color: tokens.text.tertiary },
  ];

  for (const { name, color } of textColors) {
    const ratio = getContrastRatio(color, tokens.surface.base);

    if (ratio < 4.5) {
      issues.push({
        token: name,
        issue: `Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA`,
        severity: ratio < 3 ? 'error' : 'warning',
      });
    }
  }

  return issues;
}
```

---

## Quick Reference

### Token Naming Convention
```
--{category}-{property}-{variant}

Examples:
--color-brand-primary
--spacing-card-padding
--text-heading-1
--border-input-focus
```

### Usage in Components
```tsx
// Use CSS variables
<div style={{ backgroundColor: 'var(--surface-base)' }} />

// Or Tailwind classes mapped to tokens
<div className="bg-deep-space-800 text-white" />

// Or semantic classes
<div className="surface-base text-primary" />
```

---

*Design Tokens Skill V3.0*
*Systematic Token Architecture & Auto-Generation*
