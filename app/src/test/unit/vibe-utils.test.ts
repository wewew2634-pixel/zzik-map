/**
 * ZZIK MAP - Vibe Utils Tests (Phase 2.2)
 */

import { describe, it, expect } from 'vitest';
import {
  getVibeScoreLevel,
  getVibeScoreLabel,
  getVibeScoreLabelKo,
  calculateVibeSimilarity,
  getTopVibes,
  getPrimaryVibe,
  isValidVibe,
  parseVibe,
  getAllVibes,
  getVibeInfo,
  VIBE_CATEGORIES,
  type VibeCategory,
} from '@/lib/vibe-utils';

describe('vibe-utils', () => {
  // ==========================================================================
  // Score Level Tests
  // ==========================================================================
  describe('getVibeScoreLevel', () => {
    it('should return "perfect" for scores >= 90', () => {
      expect(getVibeScoreLevel(90)).toBe('perfect');
      expect(getVibeScoreLevel(95)).toBe('perfect');
      expect(getVibeScoreLevel(100)).toBe('perfect');
    });

    it('should return "high" for scores >= 75 and < 90', () => {
      expect(getVibeScoreLevel(75)).toBe('high');
      expect(getVibeScoreLevel(85)).toBe('high');
      expect(getVibeScoreLevel(89)).toBe('high');
    });

    it('should return "medium" for scores >= 50 and < 75', () => {
      expect(getVibeScoreLevel(50)).toBe('medium');
      expect(getVibeScoreLevel(60)).toBe('medium');
      expect(getVibeScoreLevel(74)).toBe('medium');
    });

    it('should return "low" for scores < 50', () => {
      expect(getVibeScoreLevel(0)).toBe('low');
      expect(getVibeScoreLevel(25)).toBe('low');
      expect(getVibeScoreLevel(49)).toBe('low');
    });
  });

  describe('getVibeScoreLabel', () => {
    it('should return correct English labels', () => {
      expect(getVibeScoreLabel(95)).toBe('Perfect Match');
      expect(getVibeScoreLabel(80)).toBe('Great Match');
      expect(getVibeScoreLabel(60)).toBe('Good Match');
      expect(getVibeScoreLabel(30)).toBe('Low Match');
    });
  });

  describe('getVibeScoreLabelKo', () => {
    it('should return correct Korean labels', () => {
      expect(getVibeScoreLabelKo(95)).toBe('완벽 매칭');
      expect(getVibeScoreLabelKo(80)).toBe('높은 매칭');
      expect(getVibeScoreLabelKo(60)).toBe('적당한 매칭');
      expect(getVibeScoreLabelKo(30)).toBe('낮은 매칭');
    });
  });

  // ==========================================================================
  // Similarity Calculation Tests
  // ==========================================================================
  describe('calculateVibeSimilarity', () => {
    it('should return 100 for identical vectors', () => {
      const vectorA = [1, 0, 0, 1];
      const result = calculateVibeSimilarity(vectorA, vectorA);
      expect(result).toBe(100);
    });

    it('should return 50 for orthogonal vectors', () => {
      const vectorA = [1, 0];
      const vectorB = [0, 1];
      const result = calculateVibeSimilarity(vectorA, vectorB);
      expect(result).toBe(50);
    });

    it('should return 0 for opposite vectors', () => {
      const vectorA = [1, 0];
      const vectorB = [-1, 0];
      const result = calculateVibeSimilarity(vectorA, vectorB);
      expect(result).toBe(0);
    });

    it('should handle zero vectors', () => {
      const vectorA = [0, 0, 0];
      const vectorB = [1, 2, 3];
      const result = calculateVibeSimilarity(vectorA, vectorB);
      expect(result).toBe(0);
    });

    it('should throw error for different length vectors', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [1, 2];
      expect(() => calculateVibeSimilarity(vectorA, vectorB)).toThrow(
        'Vectors must have the same length'
      );
    });
  });

  // ==========================================================================
  // Top Vibes Tests
  // ==========================================================================
  describe('getTopVibes', () => {
    const scores: Partial<Record<VibeCategory, number>> = {
      modern: 85,
      minimal: 72,
      cozy: 45,
      vintage: 30,
    };

    it('should return top vibes sorted by score', () => {
      const result = getTopVibes(scores, 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ vibe: 'modern', score: 85 });
      expect(result[1]).toEqual({ vibe: 'minimal', score: 72 });
    });

    it('should respect the limit parameter', () => {
      const result = getTopVibes(scores, 1);
      expect(result).toHaveLength(1);
      expect(result[0].vibe).toBe('modern');
    });

    it('should default to 3 results', () => {
      const result = getTopVibes(scores);
      expect(result).toHaveLength(3);
    });

    it('should handle empty scores', () => {
      const result = getTopVibes({}, 3);
      expect(result).toHaveLength(0);
    });
  });

  describe('getPrimaryVibe', () => {
    it('should return the highest scoring vibe', () => {
      const scores: Partial<Record<VibeCategory, number>> = {
        modern: 85,
        minimal: 72,
        cozy: 45,
      };
      expect(getPrimaryVibe(scores)).toBe('modern');
    });

    it('should return null for empty scores', () => {
      expect(getPrimaryVibe({})).toBeNull();
    });
  });

  // ==========================================================================
  // Validation Tests
  // ==========================================================================
  describe('isValidVibe', () => {
    it('should return true for valid vibes', () => {
      expect(isValidVibe('modern')).toBe(true);
      expect(isValidVibe('cozy')).toBe(true);
      expect(isValidVibe('vintage')).toBe(true);
      expect(isValidVibe('luxury')).toBe(true);
    });

    it('should return false for invalid vibes', () => {
      expect(isValidVibe('invalid')).toBe(false);
      expect(isValidVibe('')).toBe(false);
      expect(isValidVibe('MODERN')).toBe(false); // case sensitive
    });
  });

  describe('parseVibe', () => {
    it('should parse valid vibes', () => {
      expect(parseVibe('modern')).toBe('modern');
      expect(parseVibe('Modern')).toBe('modern'); // should normalize case
      expect(parseVibe('COZY')).toBe('cozy');
    });

    it('should return null for invalid vibes', () => {
      expect(parseVibe('invalid')).toBeNull();
      expect(parseVibe('')).toBeNull();
    });

    it('should trim whitespace', () => {
      expect(parseVibe('  modern  ')).toBe('modern');
    });
  });

  // ==========================================================================
  // Category Tests
  // ==========================================================================
  describe('getAllVibes', () => {
    it('should return all 8 vibe categories', () => {
      const vibes = getAllVibes();
      expect(vibes).toHaveLength(8);
      expect(vibes).toContain('cozy');
      expect(vibes).toContain('modern');
      expect(vibes).toContain('vintage');
      expect(vibes).toContain('minimal');
      expect(vibes).toContain('romantic');
      expect(vibes).toContain('industrial');
      expect(vibes).toContain('nature');
      expect(vibes).toContain('luxury');
    });
  });

  describe('getVibeInfo', () => {
    it('should return correct info for each vibe', () => {
      const modernInfo = getVibeInfo('modern');
      expect(modernInfo.id).toBe('modern');
      expect(modernInfo.label).toBe('Modern');
      expect(modernInfo.labelKo).toBe('모던한');
    });

    it('should return all required properties', () => {
      const info = getVibeInfo('cozy');
      expect(info).toHaveProperty('id');
      expect(info).toHaveProperty('label');
      expect(info).toHaveProperty('labelKo');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('icon');
      expect(info).toHaveProperty('color');
      expect(info).toHaveProperty('bgColor');
      expect(info).toHaveProperty('borderColor');
    });
  });

  describe('VIBE_CATEGORIES', () => {
    it('should have 8 categories', () => {
      expect(Object.keys(VIBE_CATEGORIES)).toHaveLength(8);
    });

    it('should have consistent icons', () => {
      Object.values(VIBE_CATEGORIES).forEach((info) => {
        expect(info.icon).toMatch(/^vibe-/);
      });
    });
  });
});
