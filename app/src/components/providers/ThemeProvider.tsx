'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const THEME_STORAGE_KEY = 'zzik-theme';
const DEFAULT_THEME: Theme = 'dark'; // ZZIK uses dark theme by default

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage not available
  }
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove('light', 'dark');

  // Add new theme class
  root.classList.add(resolvedTheme);

  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', resolvedTheme);

  // Update color-scheme for native elements
  root.style.colorScheme = resolvedTheme;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // SSR: return default, will be updated on client
    if (typeof window === 'undefined') return defaultTheme;
    return getStoredTheme() || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme)
  );

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    storeTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const resolved = resolveTheme('system');
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem]);

  // Prevent flash on initial load
  useEffect(() => {
    // Remove any no-js class that might be hiding content
    document.documentElement.classList.remove('no-js');
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      if (current === 'dark') return 'light';
      if (current === 'light') return 'dark';
      // If system, toggle to opposite of current resolved
      return resolveTheme('system') === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// =============================================================================
// THEME SCRIPT (prevents flash)
// =============================================================================

/**
 * Inline script to prevent theme flash on page load.
 * Add this to your root layout's <head> tag.
 *
 * Usage:
 * ```tsx
 * <head>
 *   <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 * </head>
 * ```
 */
export const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('${THEME_STORAGE_KEY}') || '${DEFAULT_THEME}';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

// =============================================================================
// EXPORTS
// =============================================================================

export { ThemeContext };
