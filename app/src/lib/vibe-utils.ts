/**
 * ZZIK Vibe Utilities
 *
 * Utilities for working with ZZIK's 8 Vibe Categories:
 * - cozy, modern, vintage, minimal, romantic, industrial, nature, luxury
 */

// =============================================================================
// TYPES
// =============================================================================

export type VibeCategory =
  | 'cozy'
  | 'modern'
  | 'vintage'
  | 'minimal'
  | 'romantic'
  | 'industrial'
  | 'nature'
  | 'luxury';

export type VibeScoreLevel = 'low' | 'medium' | 'high' | 'perfect';

import type { IconName } from '@/components/icons';

export interface VibeInfo {
  id: VibeCategory;
  label: string;
  labelKo: string;
  description: string;
  icon: IconName;
  color: string;
  bgColor: string;
  borderColor: string;
}

// =============================================================================
// VIBE DEFINITIONS
// =============================================================================

/* CRITICAL FIX: Replaced emoji with proper SVG icon names from Icon system */
export const VIBE_CATEGORIES: Record<VibeCategory, VibeInfo> = {
  cozy: {
    id: 'cozy',
    label: 'Cozy',
    labelKo: '아늑한',
    description: 'Warm and comfortable spaces',
    icon: 'vibe-cozy',
    color: 'var(--vibe-cozy)',
    bgColor: 'var(--vibe-cozy-bg)',
    borderColor: 'var(--vibe-cozy-border)',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    labelKo: '모던한',
    description: 'Contemporary and sleek design',
    icon: 'vibe-modern',
    color: 'var(--vibe-modern)',
    bgColor: 'var(--vibe-modern-bg)',
    borderColor: 'var(--vibe-modern-border)',
  },
  vintage: {
    id: 'vintage',
    label: 'Vintage',
    labelKo: '빈티지',
    description: 'Retro and nostalgic atmosphere',
    icon: 'vibe-vintage',
    color: 'var(--vibe-vintage)',
    bgColor: 'var(--vibe-vintage-bg)',
    borderColor: 'var(--vibe-vintage-border)',
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    labelKo: '미니멀',
    description: 'Clean and simple aesthetics',
    icon: 'vibe-minimal',
    color: 'var(--vibe-minimal)',
    bgColor: 'var(--vibe-minimal-bg)',
    borderColor: 'var(--vibe-minimal-border)',
  },
  romantic: {
    id: 'romantic',
    label: 'Romantic',
    labelKo: '로맨틱',
    description: 'Dreamy and intimate vibes',
    icon: 'vibe-romantic',
    color: 'var(--vibe-romantic)',
    bgColor: 'var(--vibe-romantic-bg)',
    borderColor: 'var(--vibe-romantic-border)',
  },
  industrial: {
    id: 'industrial',
    label: 'Industrial',
    labelKo: '인더스트리얼',
    description: 'Raw and urban character',
    icon: 'vibe-industrial',
    color: 'var(--vibe-industrial)',
    bgColor: 'var(--vibe-industrial-bg)',
    borderColor: 'var(--vibe-industrial-border)',
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    labelKo: '자연',
    description: 'Green and organic feel',
    icon: 'vibe-nature',
    color: 'var(--vibe-nature)',
    bgColor: 'var(--vibe-nature-bg)',
    borderColor: 'var(--vibe-nature-border)',
  },
  luxury: {
    id: 'luxury',
    label: 'Luxury',
    labelKo: '럭셔리',
    description: 'Premium and sophisticated',
    icon: 'vibe-luxury',
    color: 'var(--vibe-luxury)',
    bgColor: 'var(--vibe-luxury-bg)',
    borderColor: 'var(--vibe-luxury-border)',
  },
};

// =============================================================================
// VIBE COLOR UTILITIES
// =============================================================================

/**
 * Get vibe color value
 */
export function getVibeColor(vibe: VibeCategory): string {
  return VIBE_CATEGORIES[vibe].color;
}

/**
 * Get vibe background color
 */
export function getVibeBgColor(vibe: VibeCategory): string {
  return VIBE_CATEGORIES[vibe].bgColor;
}

/**
 * Get vibe border color
 */
export function getVibeBorderColor(vibe: VibeCategory): string {
  return VIBE_CATEGORIES[vibe].borderColor;
}

/**
 * Get vibe CSS class name
 */
export function getVibeClassName(vibe: VibeCategory): string {
  return `vibe-${vibe}`;
}

/**
 * Get vibe info
 */
export function getVibeInfo(vibe: VibeCategory): VibeInfo {
  return VIBE_CATEGORIES[vibe];
}

// =============================================================================
// VIBE SCORE UTILITIES
// =============================================================================

/**
 * Score thresholds for vibe matching
 */
export const VIBE_SCORE_THRESHOLDS = {
  low: 0,
  medium: 50,
  high: 75,
  perfect: 90,
} as const;

/**
 * Get score level from numeric score
 */
export function getVibeScoreLevel(score: number): VibeScoreLevel {
  if (score >= VIBE_SCORE_THRESHOLDS.perfect) return 'perfect';
  if (score >= VIBE_SCORE_THRESHOLDS.high) return 'high';
  if (score >= VIBE_SCORE_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/**
 * Get score color based on level
 */
export function getVibeScoreColor(score: number): string {
  const level = getVibeScoreLevel(score);
  switch (level) {
    case 'perfect':
      return 'var(--zzik-coral)';
    case 'high':
      return 'var(--status-success)';
    case 'medium':
      return 'var(--status-warning)';
    case 'low':
      return 'var(--text-tertiary)';
  }
}

/**
 * Get score label
 */
export function getVibeScoreLabel(score: number): string {
  const level = getVibeScoreLevel(score);
  switch (level) {
    case 'perfect':
      return 'Perfect Match';
    case 'high':
      return 'Great Match';
    case 'medium':
      return 'Good Match';
    case 'low':
      return 'Low Match';
  }
}

/**
 * Get score label in Korean
 */
export function getVibeScoreLabelKo(score: number): string {
  const level = getVibeScoreLevel(score);
  switch (level) {
    case 'perfect':
      return '완벽 매칭';
    case 'high':
      return '높은 매칭';
    case 'medium':
      return '적당한 매칭';
    case 'low':
      return '낮은 매칭';
  }
}

// =============================================================================
// VIBE LIST UTILITIES
// =============================================================================

/**
 * Get all vibe categories
 */
export function getAllVibes(): VibeCategory[] {
  return Object.keys(VIBE_CATEGORIES) as VibeCategory[];
}

/**
 * Get vibe options for select/dropdown
 */
export function getVibeOptions(): Array<{ value: VibeCategory; label: string }> {
  return getAllVibes().map((vibe) => ({
    value: vibe,
    label: VIBE_CATEGORIES[vibe].label,
  }));
}

/**
 * Get vibe options with icons
 */
export function getVibeOptionsWithIcons(): Array<{
  value: VibeCategory;
  label: string;
  icon: string;
}> {
  return getAllVibes().map((vibe) => ({
    value: vibe,
    label: VIBE_CATEGORIES[vibe].label,
    icon: VIBE_CATEGORIES[vibe].icon,
  }));
}

// =============================================================================
// VIBE MATCHING UTILITIES
// =============================================================================

/**
 * Calculate cosine similarity between two vibe vectors
 */
export function calculateVibeSimilarity(
  vectorA: number[],
  vectorB: number[]
): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  // Convert to percentage (0-100)
  return Math.round(((dotProduct / magnitude) * 100 + 100) / 2);
}

/**
 * Get top matching vibes from a score object
 */
export function getTopVibes(
  scores: Partial<Record<VibeCategory, number>>,
  limit: number = 3
): Array<{ vibe: VibeCategory; score: number }> {
  return Object.entries(scores)
    .map(([vibe, score]) => ({ vibe: vibe as VibeCategory, score: score ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get primary vibe from scores
 */
export function getPrimaryVibe(
  scores: Partial<Record<VibeCategory, number>>
): VibeCategory | null {
  const topVibes = getTopVibes(scores, 1);
  return topVibes.length > 0 ? topVibes[0].vibe : null;
}

// =============================================================================
// VIBE STYLE UTILITIES
// =============================================================================

/**
 * Get inline styles for vibe element
 */
export function getVibeStyles(vibe: VibeCategory): React.CSSProperties {
  return {
    '--vibe-color': VIBE_CATEGORIES[vibe].color,
    '--vibe-bg': VIBE_CATEGORIES[vibe].bgColor,
    '--vibe-border': VIBE_CATEGORIES[vibe].borderColor,
  } as React.CSSProperties;
}

/**
 * Get badge-specific styles for vibe
 */
export function getVibeBadgeStyles(vibe: VibeCategory): React.CSSProperties {
  return {
    backgroundColor: VIBE_CATEGORIES[vibe].bgColor,
    borderColor: VIBE_CATEGORIES[vibe].borderColor,
    color: VIBE_CATEGORIES[vibe].color,
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if a string is a valid vibe category
 */
export function isValidVibe(vibe: string): vibe is VibeCategory {
  return vibe in VIBE_CATEGORIES;
}

/**
 * Parse and validate vibe string
 */
export function parseVibe(vibe: string): VibeCategory | null {
  const normalized = vibe.toLowerCase().trim();
  return isValidVibe(normalized) ? normalized : null;
}
