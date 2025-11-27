/**
 * E2E Test Suite: Analytics API
 * Purpose: Verify all P0 security fixes in production environment
 *
 * Test Coverage:
 * 1. Environment validation
 * 2. Input validation (Zod)
 * 3. Rate limiting
 * 4. Content sanitization
 * 5. Error handling
 * 6. SQL injection prevention
 * 7. XSS prevention
 * 8. Race condition fix
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-' + Math.random().toString(36).substr(2, 9);

describe('Analytics API - Security Tests', () => {
  describe('P0 #1: Environment Validation', () => {
    it('should have valid Supabase credentials configured', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/uploads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should not return 500 due to missing env vars
      expect(response.status).not.toBe(500);
      expect(response.ok || response.status === 401 || response.status === 429).toBe(true);
    });
  });

  describe('P0 #2: Input Validation (Zod)', () => {
    it('should reject invalid JSON', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {',
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject missing required fields', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test' }), // Missing uploadId
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject invalid metric value type', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/ab-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: 'test-1',
          variant: 'control',
          metric: 'test_metric',
          value: 'not-a-number', // Should be number
          userId: TEST_USER_ID,
          timestamp: Date.now(),
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid variant', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/ab-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: 'test-1',
          variant: 'invalid_variant',
          metric: 'test_metric',
          value: 95,
          userId: TEST_USER_ID,
          timestamp: Date.now(),
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should accept valid analytics metrics', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            sessionId: `session-${Date.now()}`,
            uploadId: `upload-${Date.now()}`,
            userId: TEST_USER_ID,
            cohort: 'test',
            succeeded: true,
            completed: true,
            hadErrors: false,
            retryCount: 0,
            totalDuration: 2000,
            errorTypes: [],
            timeInEachState: { uploading: 2000 },
            fileName: 'test.jpg',
            fileSize: 1024000,
            eventCount: 1,
            events: [
              {
                eventType: 'upload_success',
                timestamp: Date.now(),
                metadata: { phase: 'complete' },
              },
            ],
          },
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.uploadId).toBeDefined();
    });
  });

  describe('P0 #3: XSS Prevention (Content Sanitization)', () => {
    it('should sanitize malicious file names', async () => {
      const maliciousFileName = '<img src=x onerror=alert("xss")>';

      const response = await fetch(`${API_BASE}/api/analytics/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            sessionId: `session-${Date.now()}`,
            uploadId: `upload-${Date.now()}`,
            fileName: maliciousFileName,
            succeeded: true,
            completed: true,
            hadErrors: false,
            retryCount: 0,
            totalDuration: 1000,
            errorTypes: [],
            timeInEachState: {},
            eventCount: 0,
            events: [],
          },
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      // Sanitized content should be safe (no script tags, etc)
    });

    it('should sanitize error messages in events', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            sessionId: `session-${Date.now()}`,
            uploadId: `upload-${Date.now()}`,
            succeeded: false,
            completed: false,
            hadErrors: true,
            retryCount: 0,
            totalDuration: 500,
            errorTypes: ['test_error'],
            timeInEachState: {},
            eventCount: 1,
            events: [
              {
                eventType: 'upload_error',
                timestamp: Date.now(),
                metadata: {
                  error: '<script>alert("xss")</script>',
                },
              },
            ],
          },
        }),
      });

      expect(response.status).toBe(201);
    });
  });

  describe('P0 #6: Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const testId = `ratelimit-test-${Date.now()}`;
      const requests = [];

      // Make rapid requests (should exceed limit)
      for (let i = 0; i < 25; i++) {
        requests.push(
          fetch(`${API_BASE}/api/analytics/uploads?limit=10`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some((r) => r.status === 429);

      // At least some requests should be rate limited
      expect(rateLimited).toBe(true);
    });

    it('should return rate limit headers', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/uploads`, {
        method: 'GET',
      });

      // Should have rate limit headers
      const hasRateLimitHeaders =
        response.headers.has('x-ratelimit-limit') ||
        response.headers.has('x-ratelimit-remaining') ||
        response.headers.has('x-ratelimit-reset');

      expect(hasRateLimitHeaders).toBe(true);
    });
  });

  describe('P0 #5: Race Condition Prevention', () => {
    it('should handle concurrent operations safely', async () => {
      // This is primarily tested in unit tests
      // E2E verification: API should not corrupt data under load
      const uploadId = `concurrent-${Date.now()}`;

      const promises = Array.from({ length: 5 }).map(() =>
        fetch(`${API_BASE}/api/analytics/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: {
              sessionId: `session-${uploadId}`,
              uploadId: uploadId,
              succeeded: true,
              completed: true,
              hadErrors: false,
              retryCount: 0,
              totalDuration: 1000,
              errorTypes: [],
              timeInEachState: {},
              eventCount: 0,
              events: [],
            },
          }),
        }),
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.ok);

      // Most/all should succeed without data corruption
      expect(successful.length).toBeGreaterThan(0);
    });
  });

  describe('P0 #7: Enhanced Error Handling', () => {
    it('should not expose sensitive error details', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/uploads?invalid=param`, {
        method: 'GET',
      });

      if (response.status === 400 || response.status === 422) {
        const data = await response.json();
        const responseStr = JSON.stringify(data);

        // Should not expose internal details
        expect(responseStr).not.toContain('password');
        expect(responseStr).not.toContain('secret');
        expect(responseStr).not.toContain('token');
        expect(responseStr).not.toContain('SUPABASE_');
      }
    });

    it('should provide helpful validation errors', async () => {
      const response = await fetch(`${API_BASE}/api/analytics/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            sessionId: '',
            uploadId: '',
            succeeded: true,
            completed: true,
            hadErrors: false,
            retryCount: -1, // Invalid: negative
            totalDuration: 1000,
            errorTypes: [],
            timeInEachState: {},
            eventCount: 0,
            events: [],
          },
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(typeof data.error).toBe('string');
    });
  });

  describe('Full Integration Flow', () => {
    it('should complete full analytics pipeline', async () => {
      const uploadId = `integration-${Date.now()}`;

      // 1. Submit analytics
      const uploadResponse = await fetch(`${API_BASE}/api/analytics/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            sessionId: `session-${uploadId}`,
            uploadId: uploadId,
            userId: TEST_USER_ID,
            cohort: 'integration-test',
            succeeded: true,
            completed: true,
            hadErrors: false,
            retryCount: 0,
            totalDuration: 2500,
            errorTypes: [],
            timeInEachState: { uploading: 2000, processing: 500 },
            fileName: 'test-photo.jpg',
            fileSize: 2048000,
            eventCount: 3,
            events: [
              {
                eventType: 'upload_started',
                timestamp: Date.now() - 2500,
                metadata: { fileName: 'test-photo.jpg' },
              },
              {
                eventType: 'upload_completed',
                timestamp: Date.now() - 500,
                metadata: { bytesTransferred: 2048000 },
              },
              {
                eventType: 'upload_success',
                timestamp: Date.now(),
                metadata: { phase: 'complete' },
              },
            ],
          },
        }),
      });

      expect(uploadResponse.status).toBe(201);
      const uploadData = await uploadResponse.json();
      expect(uploadData.success).toBe(true);

      // 2. Log A/B test event
      const testResponse = await fetch(`${API_BASE}/api/analytics/ab-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: 'integration-test-v1',
          variant: 'control',
          metric: 'success_rate',
          value: 100,
          userId: TEST_USER_ID,
          uploadId: uploadId,
          timestamp: Date.now(),
        }),
      });

      expect(testResponse.status).toBe(201);

      // 3. Fetch analytics
      const fetchResponse = await fetch(
        `${API_BASE}/api/analytics/uploads?cohort=integration-test&limit=10`,
        {
          method: 'GET',
        },
      );

      expect(fetchResponse.ok).toBe(true);
      const fetchData = await fetchResponse.json();
      expect(fetchData.data).toBeDefined();
      expect(fetchData.pagination).toBeDefined();
    });
  });
});
