/**
 * ZZIK Library Exports
 *
 * Central export point for all ZZIK utilities
 */

// Design Tokens
export {
  colors,
  spacing,
  typography,
  motion,
  radius,
  shadows,
  breakpoints,
  zIndex,
  designTokens,
  type DesignTokens,
  type Colors,
  type Spacing,
  type Typography,
  type Motion,
  type Radius,
  type Shadows,
  type Breakpoints,
  type ZIndex,
} from './design-tokens';

// Vibe Utilities
export {
  VIBE_CATEGORIES,
  VIBE_SCORE_THRESHOLDS,
  getVibeColor,
  getVibeBgColor,
  getVibeBorderColor,
  getVibeClassName,
  getVibeInfo,
  getVibeScoreLevel,
  getVibeScoreColor,
  getVibeScoreLabel,
  getVibeScoreLabelKo,
  getAllVibes,
  getVibeOptions,
  getVibeOptionsWithIcons,
  calculateVibeSimilarity,
  getTopVibes,
  getPrimaryVibe,
  getVibeStyles,
  getVibeBadgeStyles,
  isValidVibe,
  parseVibe,
  type VibeCategory,
  type VibeScoreLevel,
  type VibeInfo,
} from './vibe-utils';

// Utility functions
export { cn } from './utils';
