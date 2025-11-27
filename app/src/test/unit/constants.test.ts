/**
 * ZZIK MAP - Constants Unit Tests
 * V6: Testing centralized constants and helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  UPLOAD,
  PAGINATION,
  GPS,
  VIBE,
  RATE_LIMIT,
  LOCATION_CATEGORIES,
  isSupportedImageType,
  isFileSizeValid,
  validateUploadFile,
  getAcceptedTypesString,
} from '@/lib/constants';

describe('Constants', () => {
  describe('UPLOAD', () => {
    it('should have correct max size values', () => {
      expect(UPLOAD.MAX_SIZE_MB).toBe(10);
      expect(UPLOAD.MAX_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });

    it('should include all supported image types', () => {
      expect(UPLOAD.ACCEPTED_TYPES).toContain('image/jpeg');
      expect(UPLOAD.ACCEPTED_TYPES).toContain('image/png');
      expect(UPLOAD.ACCEPTED_TYPES).toContain('image/webp');
      expect(UPLOAD.ACCEPTED_TYPES).toContain('image/heic');
    });
  });

  describe('PAGINATION', () => {
    it('should have sensible default limits', () => {
      expect(PAGINATION.DEFAULT_LIMIT).toBe(20);
      expect(PAGINATION.MAX_LIMIT).toBe(100);
      expect(PAGINATION.DEFAULT_LIMIT).toBeLessThanOrEqual(PAGINATION.MAX_LIMIT);
    });
  });

  describe('GPS', () => {
    it('should have valid Korea bounds', () => {
      const { KOREA_BOUNDS } = GPS;
      expect(KOREA_BOUNDS.minLat).toBeLessThan(KOREA_BOUNDS.maxLat);
      expect(KOREA_BOUNDS.minLng).toBeLessThan(KOREA_BOUNDS.maxLng);
      // Seoul is approximately 37.5N, 127E
      expect(KOREA_BOUNDS.minLat).toBeLessThan(37.5);
      expect(KOREA_BOUNDS.maxLat).toBeGreaterThan(37.5);
      expect(KOREA_BOUNDS.minLng).toBeLessThan(127);
      expect(KOREA_BOUNDS.maxLng).toBeGreaterThan(127);
    });
  });

  describe('VIBE', () => {
    it('should have valid embedding dimensions', () => {
      expect(VIBE.EMBEDDING_DIMENSIONS).toBe(128);
      expect(VIBE.EMBEDDING_DIMENSIONS).toBeGreaterThan(0);
    });

    it('should have valid threshold values', () => {
      expect(VIBE.HIGH_MATCH_THRESHOLD).toBeGreaterThan(VIBE.MEDIUM_MATCH_THRESHOLD);
      expect(VIBE.MEDIUM_MATCH_THRESHOLD).toBeGreaterThan(VIBE.MIN_CONFIDENCE);
    });
  });

  describe('RATE_LIMIT', () => {
    it('should have reasonable rate limit values', () => {
      expect(RATE_LIMIT.WINDOW_MS).toBe(60 * 1000);
      expect(RATE_LIMIT.ANALYZE_REQUESTS_PER_MINUTE).toBeGreaterThan(0);
      expect(RATE_LIMIT.MAX_MAP_SIZE).toBeGreaterThan(0);
    });
  });

  describe('LOCATION_CATEGORIES', () => {
    it('should contain expected categories', () => {
      expect(LOCATION_CATEGORIES).toContain('landmark');
      expect(LOCATION_CATEGORIES).toContain('cafe');
      expect(LOCATION_CATEGORIES).toContain('nature');
      expect(LOCATION_CATEGORIES).toContain('other');
    });

    it('should not have duplicates', () => {
      const unique = new Set(LOCATION_CATEGORIES);
      expect(unique.size).toBe(LOCATION_CATEGORIES.length);
    });
  });
});

describe('Helper Functions', () => {
  describe('isSupportedImageType', () => {
    it('should return true for supported types', () => {
      expect(isSupportedImageType('image/jpeg')).toBe(true);
      expect(isSupportedImageType('image/png')).toBe(true);
      expect(isSupportedImageType('image/webp')).toBe(true);
      expect(isSupportedImageType('image/heic')).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(isSupportedImageType('image/gif')).toBe(false);
      expect(isSupportedImageType('image/bmp')).toBe(false);
      expect(isSupportedImageType('application/pdf')).toBe(false);
      expect(isSupportedImageType('text/plain')).toBe(false);
      expect(isSupportedImageType('')).toBe(false);
    });
  });

  describe('isFileSizeValid', () => {
    it('should return true for files under limit', () => {
      expect(isFileSizeValid(0)).toBe(true);
      expect(isFileSizeValid(1024)).toBe(true);
      expect(isFileSizeValid(5 * 1024 * 1024)).toBe(true);
      expect(isFileSizeValid(UPLOAD.MAX_SIZE_BYTES)).toBe(true);
    });

    it('should return false for files over limit', () => {
      expect(isFileSizeValid(UPLOAD.MAX_SIZE_BYTES + 1)).toBe(false);
      expect(isFileSizeValid(20 * 1024 * 1024)).toBe(false);
    });
  });

  describe('validateUploadFile', () => {
    it('should validate correct files', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateUploadFile(validFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject unsupported file types', () => {
      const invalidFile = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = validateUploadFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });

    it('should reject files that are too large', () => {
      // Create a file that's larger than the limit
      const largeContent = new Array(UPLOAD.MAX_SIZE_BYTES + 1000).fill('x').join('');
      const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateUploadFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });
  });

  describe('getAcceptedTypesString', () => {
    it('should return comma-separated string', () => {
      const result = getAcceptedTypesString();
      expect(result).toContain('image/jpeg');
      expect(result).toContain(',');
      expect(result.split(',')).toHaveLength(UPLOAD.ACCEPTED_TYPES.length);
    });
  });
});
