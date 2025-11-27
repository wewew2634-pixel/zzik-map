/**
 * ZZIK MAP - Validation Unit Tests
 * V11: Testing input validation schemas
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Validation schemas used across the app
const LocationQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  category: z.enum(['landmark', 'cafe', 'shopping', 'entertainment', 'nature', 'other']).optional(),
});

const VibeSearchSchema = z.object({
  embedding: z.array(z.number()).length(128),
  minScore: z.number().min(0).max(100).optional().default(70),
  limit: z.number().min(1).max(50).optional().default(10),
});

const PhotoUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  size: z.number().min(1).max(10 * 1024 * 1024),
});

describe('Validation Schemas', () => {
  describe('LocationQuerySchema', () => {
    it('should accept valid query with all parameters', () => {
      const result = LocationQuerySchema.safeParse({
        limit: 10,
        offset: 20,
        category: 'cafe',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(20);
        expect(result.data.category).toBe('cafe');
      }
    });

    it('should use defaults for missing parameters', () => {
      const result = LocationQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should coerce string numbers', () => {
      const result = LocationQuerySchema.safeParse({
        limit: '15',
        offset: '5',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(15);
        expect(result.data.offset).toBe(5);
      }
    });

    it('should reject invalid limit', () => {
      expect(LocationQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
      expect(LocationQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
      expect(LocationQuerySchema.safeParse({ limit: -1 }).success).toBe(false);
    });

    it('should reject invalid offset', () => {
      expect(LocationQuerySchema.safeParse({ offset: -1 }).success).toBe(false);
    });

    it('should reject invalid category', () => {
      expect(LocationQuerySchema.safeParse({ category: 'invalid' }).success).toBe(false);
    });

    it('should accept all valid categories', () => {
      const categories = ['landmark', 'cafe', 'shopping', 'entertainment', 'nature', 'other'];
      for (const category of categories) {
        const result = LocationQuerySchema.safeParse({ category });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('VibeSearchSchema', () => {
    it('should accept valid vibe search request', () => {
      const embedding = Array.from({ length: 128 }, () => Math.random());
      const result = VibeSearchSchema.safeParse({
        embedding,
        minScore: 80,
        limit: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should use defaults for optional fields', () => {
      const embedding = Array.from({ length: 128 }, () => 0);
      const result = VibeSearchSchema.safeParse({ embedding });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minScore).toBe(70);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject wrong embedding length', () => {
      expect(VibeSearchSchema.safeParse({ embedding: [] }).success).toBe(false);
      expect(VibeSearchSchema.safeParse({ embedding: Array(127).fill(0) }).success).toBe(false);
      expect(VibeSearchSchema.safeParse({ embedding: Array(129).fill(0) }).success).toBe(false);
    });

    it('should reject invalid minScore', () => {
      const embedding = Array.from({ length: 128 }, () => 0);
      expect(VibeSearchSchema.safeParse({ embedding, minScore: -1 }).success).toBe(false);
      expect(VibeSearchSchema.safeParse({ embedding, minScore: 101 }).success).toBe(false);
    });

    it('should reject invalid limit', () => {
      const embedding = Array.from({ length: 128 }, () => 0);
      expect(VibeSearchSchema.safeParse({ embedding, limit: 0 }).success).toBe(false);
      expect(VibeSearchSchema.safeParse({ embedding, limit: 51 }).success).toBe(false);
    });
  });

  describe('PhotoUploadSchema', () => {
    it('should accept valid photo upload', () => {
      const result = PhotoUploadSchema.safeParse({
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 1024 * 1024,
      });
      expect(result.success).toBe(true);
    });

    it('should accept all valid MIME types', () => {
      const mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      for (const mimeType of mimeTypes) {
        const result = PhotoUploadSchema.safeParse({
          filename: 'photo.jpg',
          mimeType,
          size: 1024,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid MIME types', () => {
      expect(PhotoUploadSchema.safeParse({
        filename: 'photo.gif',
        mimeType: 'image/gif',
        size: 1024,
      }).success).toBe(false);
    });

    it('should reject empty filename', () => {
      expect(PhotoUploadSchema.safeParse({
        filename: '',
        mimeType: 'image/jpeg',
        size: 1024,
      }).success).toBe(false);
    });

    it('should reject files too large', () => {
      expect(PhotoUploadSchema.safeParse({
        filename: 'large.jpg',
        mimeType: 'image/jpeg',
        size: 11 * 1024 * 1024,
      }).success).toBe(false);
    });

    it('should reject zero-size files', () => {
      expect(PhotoUploadSchema.safeParse({
        filename: 'empty.jpg',
        mimeType: 'image/jpeg',
        size: 0,
      }).success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary values for limit', () => {
      expect(LocationQuerySchema.safeParse({ limit: 1 }).success).toBe(true);
      expect(LocationQuerySchema.safeParse({ limit: 100 }).success).toBe(true);
    });

    it('should handle boundary values for offset', () => {
      expect(LocationQuerySchema.safeParse({ offset: 0 }).success).toBe(true);
      expect(LocationQuerySchema.safeParse({ offset: 1000000 }).success).toBe(true);
    });

    it('should handle boundary values for minScore', () => {
      const embedding = Array.from({ length: 128 }, () => 0);
      expect(VibeSearchSchema.safeParse({ embedding, minScore: 0 }).success).toBe(true);
      expect(VibeSearchSchema.safeParse({ embedding, minScore: 100 }).success).toBe(true);
    });

    it('should handle max file size boundary', () => {
      expect(PhotoUploadSchema.safeParse({
        filename: 'max.jpg',
        mimeType: 'image/jpeg',
        size: 10 * 1024 * 1024,
      }).success).toBe(true);
    });
  });
});
