/**
 * useTheme Hook
 *
 * Re-export from ThemeProvider for convenience.
 * Use this hook to access and control the current theme.
 *
 * @example
 * ```tsx
 * import { useTheme } from '@/hooks/useTheme';
 *
 * function ThemeToggle() {
 *   const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current: {resolvedTheme}
 *     </button>
 *   );
 * }
 * ```
 */

export { useTheme } from '@/components/providers/ThemeProvider';
export type { Theme, ResolvedTheme } from '@/components/providers/ThemeProvider';
