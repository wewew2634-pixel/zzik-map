/**
 * ZZIK MAP - API Helpers Unit Tests
 * V7: Testing API response helpers
 */

import { describe, it, expect } from 'vitest';
import {
  success,
  error,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  rateLimited,
  internalError,
  paginationMeta,
  ErrorCode,
} from '@/lib/api/response';

describe('API Response Helpers', () => {
  describe('success', () => {
    it('should wrap data in success structure', async () => {
      const data = { items: [1, 2, 3] };
      const response = success(data);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
    });

    it('should return 200 status by default', () => {
      const response = success({ test: true });
      expect(response.status).toBe(200);
    });

    it('should handle empty data', async () => {
      const response = success({});
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual({});
    });

    it('should handle array data', async () => {
      const response = success([1, 2, 3]);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual([1, 2, 3]);
    });

    it('should include meta when provided', async () => {
      const response = success({ test: true }, { limit: 20, offset: 0, total: 100 });
      const json = await response.json();
      expect(json.meta).toBeDefined();
      expect(json.meta.limit).toBe(20);
      expect(json.meta.total).toBe(100);
    });
  });

  describe('error', () => {
    it('should create error response with message', async () => {
      const response = error(ErrorCode.INTERNAL_ERROR, 'Something went wrong', 500);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe('Something went wrong');
    });

    it('should use correct status code', () => {
      expect(error(ErrorCode.VALIDATION_ERROR, 'Error', 400).status).toBe(400);
      expect(error(ErrorCode.UNAUTHORIZED, 'Error', 401).status).toBe(401);
      expect(error(ErrorCode.INTERNAL_ERROR, 'Error', 500).status).toBe(500);
    });

    it('should include error code', async () => {
      const response = error(ErrorCode.NOT_FOUND, 'Not found', 404);
      const json = await response.json();
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  describe('notFound', () => {
    it('should return 404 status', () => {
      const response = notFound('Item');
      expect(response.status).toBe(404);
    });

    it('should include resource in error message', async () => {
      const response = notFound('User');
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toContain('User');
      expect(json.error.message).toContain('not found');
    });
  });

  describe('badRequest', () => {
    it('should return 400 status', () => {
      const response = badRequest('Invalid input');
      expect(response.status).toBe(400);
    });

    it('should include error message', async () => {
      const response = badRequest('Missing required field');
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe('Missing required field');
    });
  });

  describe('unauthorized', () => {
    it('should return 401 status', () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
    });

    it('should have UNAUTHORIZED error code', async () => {
      const response = unauthorized();
      const json = await response.json();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('forbidden', () => {
    it('should return 403 status', () => {
      const response = forbidden();
      expect(response.status).toBe(403);
    });

    it('should have FORBIDDEN error code', async () => {
      const response = forbidden();
      const json = await response.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });
  });

  describe('rateLimited', () => {
    it('should return 429 status', () => {
      const response = rateLimited();
      expect(response.status).toBe(429);
    });

    it('should have RATE_LIMITED error code', async () => {
      const response = rateLimited();
      const json = await response.json();
      expect(json.error.code).toBe('RATE_LIMITED');
    });
  });

  describe('internalError', () => {
    it('should return 500 status', () => {
      const response = internalError();
      expect(response.status).toBe(500);
    });

    it('should have INTERNAL_ERROR code', async () => {
      const response = internalError();
      const json = await response.json();
      expect(json.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('paginationMeta', () => {
    it('should calculate hasMore correctly', () => {
      expect(paginationMeta(20, 0, 100)?.hasMore).toBe(true);
      expect(paginationMeta(20, 80, 100)?.hasMore).toBe(false);
      expect(paginationMeta(20, 90, 100)?.hasMore).toBe(false);
    });

    it('should include all pagination fields', () => {
      const meta = paginationMeta(20, 40, 100);
      expect(meta?.limit).toBe(20);
      expect(meta?.offset).toBe(40);
      expect(meta?.total).toBe(100);
      expect(meta?.hasMore).toBeDefined();
    });
  });

  describe('ErrorCode', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.RATE_LIMITED).toBe('RATE_LIMITED');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });
  });

  describe('Response consistency', () => {
    it('should always have success field', async () => {
      const successRes = await success({}).json();
      const errorRes = await error(ErrorCode.INTERNAL_ERROR, 'Error', 500).json();
      const notFoundRes = await notFound('Resource').json();
      const badReqRes = await badRequest('Invalid').json();

      expect(successRes).toHaveProperty('success');
      expect(errorRes).toHaveProperty('success');
      expect(notFoundRes).toHaveProperty('success');
      expect(badReqRes).toHaveProperty('success');
    });

    it('should have data field only on success', async () => {
      const successRes = await success({ test: true }).json();
      const errorRes = await error(ErrorCode.INTERNAL_ERROR, 'Error', 500).json();

      expect(successRes).toHaveProperty('data');
      expect(errorRes).not.toHaveProperty('data');
    });

    it('should have error field only on failure', async () => {
      const successRes = await success({}).json();
      const errorRes = await error(ErrorCode.INTERNAL_ERROR, 'Error', 500).json();

      expect(successRes).not.toHaveProperty('error');
      expect(errorRes).toHaveProperty('error');
    });
  });
});
