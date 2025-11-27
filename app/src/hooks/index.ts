/**
 * ZZIK Custom Hooks
 *
 * Central export for all custom React hooks.
 */

// Accessibility
export { useReducedMotion } from './useReducedMotion';
export { useDarkMode } from './useDarkMode';
export type { Theme, ResolvedTheme, UseDarkModeReturn } from './useDarkMode';

// Theme
export { useTheme } from './useTheme';
export type { Theme as LegacyTheme, ResolvedTheme as LegacyResolvedTheme } from './useTheme';

// Journey Intelligence
export { useJourney } from './useJourney';
export type {
  GeoLocation,
  JourneyPhoto,
  JourneyRecommendation,
  JourneyState,
  UseJourneyOptions,
  UseJourneyReturn,
} from './useJourney';

// Vibe Matching
export { useVibe } from './useVibe';
export type {
  VibeMatch,
  VibeAnalysisResult,
  VibeState,
  UseVibeOptions,
  UseVibeReturn,
} from './useVibe';
