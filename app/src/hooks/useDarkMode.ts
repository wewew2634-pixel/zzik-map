'use client';

import { useEffect, useState } from 'react';

/**
 * Dark Mode Hook with Multiple Theme Variants (Phase 5)
 *
 * Supports:
 * - System preference (prefers-color-scheme)
 * - Manual toggle (light/dark/auto)
 * - OLED variant (pure black for power saving)
 *
 * WCAG 2.1: Supports visual accessibility preferences
 */

export type Theme = 'light' | 'dark' | 'dark-oled' | 'auto';
export type ResolvedTheme = 'light' | 'dark' | 'dark-oled';

export interface UseDarkModeReturn {
  theme: Theme;
  resolvedTheme: ResolvedTheme | null;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  supportsOLED: boolean;
}

export function useDarkMode(): UseDarkModeReturn {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme | null>(null);
  const [supportsOLED, setSupportsOLED] = useState(false);

  // Detect OLED support (future: via CSS.supports or media query)
  useEffect(() => {
    const oledDetected =
      typeof window !== 'undefined' &&
      window.matchMedia('(color-gamut: srgb)').matches &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    setSupportsOLED(oledDetected);
  }, []);

  // Load theme preference from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  // Resolve theme based on system preference
  useEffect(() => {
    const resolve = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolved = prefersDark ? 'dark' : 'light';
        setResolvedTheme(resolved as ResolvedTheme);
      } else {
        setResolvedTheme(theme as ResolvedTheme);
      }
    };

    resolve();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', resolve);
    return () => mediaQuery.removeEventListener('change', resolve);
  }, [theme]);

  // Apply theme to DOM
  useEffect(() => {
    if (!resolvedTheme) return;

    const html = document.documentElement;
    html.setAttribute('data-theme', resolvedTheme);

    // Also set class for TailwindCSS dark: prefix
    if (resolvedTheme === 'light') {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark' || resolvedTheme === 'dark-oled',
    supportsOLED,
  };
}
