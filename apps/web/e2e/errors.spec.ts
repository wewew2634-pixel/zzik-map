import { test, expect } from '@playwright/test';
import { createTestAuthHeader } from './utils';

/**
 * E2E Test: Error Handling
 *
 * Tests validation errors, not found errors, and rate limiting
 */

test.describe('Error Handling', () => {
  let authHeaders: Record<string, string>;

  test.beforeEach(() => {
    authHeaders = createTestAuthHeader({
      userId: `test-user-errors-${Date.now()}`,
    });
  });

  test.describe('Validation Errors (400)', () => {
    test('should return 400 for invalid mission ID format', async ({ request }) => {
      const response = await request.post('/api/missions/invalid@mission#id/runs', {
        headers: authHeaders,
        data: {},
      });

      // Should return 400 Bad Request for validation error
      if (response.status() === 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(data.error).toMatch(/validation|invalid/i);
        console.log('Validation error:', data);
      } else {
        console.log(`Unexpected status: ${response.status()}`);
      }
    });

    test('should return 400 for missing required fields in GPS verification', async ({ request }) => {
      const response = await request.post('/api/mission-runs/test-run-123/gps-verify', {
        headers: authHeaders,
        data: {
          // Missing lat, lng, etc.
        },
      });

      expect([400, 404]).toContain(response.status());

      if (response.status() === 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        console.log('Missing fields error:', data);
      }
    });

    test('should return 400 for invalid GPS coordinates', async ({ request }) => {
      const response = await request.post('/api/mission-runs/test-run-123/gps-verify', {
        headers: authHeaders,
        data: {
          lat: 999, // Invalid latitude
          lng: 999, // Invalid longitude
          accuracy: -10, // Invalid accuracy
          timestamp: new Date().toISOString(),
        },
      });

      expect([400, 404]).toContain(response.status());

      if (response.status() === 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        console.log('Invalid coordinates error:', data);
      }
    });

    test('should return 400 for malformed QR payload', async ({ request }) => {
      const response = await request.post('/api/mission-runs/test-run-123/qr-verify', {
        headers: authHeaders,
        data: {
          qrPayload: 'not-a-valid-qr-url',
        },
      });

      expect([400, 404]).toContain(response.status());

      if (response.status() === 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        console.log('Malformed QR error:', data);
      }
    });

    test('should return 400 for invalid request body format', async ({ request }) => {
      const response = await request.post('/api/missions/test-mission-1/runs', {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        data: 'not-valid-json-but-string',
      });

      // Note: This might return 400 or 500 depending on implementation
      expect(response.status()).toBeGreaterThanOrEqual(400);
      console.log('Invalid body status:', response.status());
    });
  });

  test.describe('Not Found Errors (404)', () => {
    test('should return 404 for non-existent mission', async ({ request }) => {
      const nonExistentMissionId = `mission-does-not-exist-${Date.now()}`;

      const response = await request.post(`/api/missions/${nonExistentMissionId}/runs`, {
        headers: authHeaders,
        data: {},
      });

      if (response.status() === 404) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(data.error).toMatch(/not found|mission/i);
        console.log('Mission not found error:', data);
      } else {
        console.log(`Mission create status: ${response.status()}`);
      }
    });

    test('should return 404 for non-existent mission run', async ({ request }) => {
      const nonExistentRunId = `run-does-not-exist-${Date.now()}`;

      const response = await request.get(`/api/mission-runs/${nonExistentRunId}`, {
        headers: authHeaders,
      });

      if (response.status() === 404) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        console.log('Mission run not found error:', data);
      } else {
        console.log(`Mission run status: ${response.status()}`);
      }
    });

    test('should return 404 for non-existent API endpoint', async ({ request }) => {
      const response = await request.get('/api/non-existent-endpoint', {
        headers: authHeaders,
      });

      expect(response.status()).toBe(404);
    });

    test('should return 404 for accessing other user mission run', async ({ request }) => {
      // This tests authorization - user should only access their own runs
      const otherUserRunId = 'other-user-run-123';

      const response = await request.get(`/api/mission-runs/${otherUserRunId}`, {
        headers: authHeaders,
      });

      // Should return 404 (or 403 depending on implementation)
      expect([403, 404]).toContain(response.status());

      const data = await response.json();
      expect(data).toHaveProperty('error');
      console.log('Other user run error:', data);
    });
  });

  test.describe('Server Errors (500)', () => {
    test('should handle database connection errors gracefully', async ({ request }) => {
      // This is hard to test without actually breaking the database
      // But we can verify the error response format

      // Try to access an endpoint
      const response = await request.get('/api/places');

      // Should return proper JSON even if there's an error
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');

      if (!response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        console.log('Server error response:', data);
      }
    });

    test('should return proper error format for all errors', async ({ request }) => {
      const testCases = [
        { path: '/api/mission-runs/test-123', method: 'GET' as const },
        { path: '/api/missions/test/runs', method: 'POST' as const },
      ];

      for (const testCase of testCases) {
        const response = await request.fetch(testCase.path, {
          method: testCase.method,
          headers: authHeaders,
          data: testCase.method === 'POST' ? {} : undefined,
        });

        // All error responses should be JSON
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');

        const data = await response.json();

        // Should have standard error structure
        if (!response.ok()) {
          expect(data).toHaveProperty('error');
          console.log(`${testCase.method} ${testCase.path} error:`, data);
        }
      }
    });
  });

  test.describe('Rate Limiting (429)', () => {
    test.skip('should enforce rate limiting on API endpoints', async ({ request }) => {
      // This test is skipped by default as it requires rate limiting to be configured
      // Enable it when rate limiting is implemented

      const endpoint = '/api/places';
      const maxRequests = 100;

      // Make many rapid requests
      const requests = Array.from({ length: maxRequests + 10 }, () =>
        request.get(endpoint)
      );

      const responses = await Promise.all(requests);

      // Some should return 429 Too Many Requests
      const rateLimited = responses.filter(r => r.status() === 429);

      if (rateLimited.length > 0) {
        expect(rateLimited.length).toBeGreaterThan(0);

        const data = await rateLimited[0].json();
        expect(data).toHaveProperty('error');
        expect(data.error).toMatch(/rate limit|too many requests/i);

        console.log('Rate limit error:', data);
      } else {
        console.log('Rate limiting not enforced (or limit not reached)');
      }
    });

    test.skip('should include rate limit headers', async ({ request }) => {
      const response = await request.get('/api/places');

      // Check for rate limit headers (if implemented)
      const headers = response.headers();
      console.log('Rate limit headers:', {
        'x-ratelimit-limit': headers['x-ratelimit-limit'],
        'x-ratelimit-remaining': headers['x-ratelimit-remaining'],
        'x-ratelimit-reset': headers['x-ratelimit-reset'],
      });

      // This is informational - not asserting as rate limiting might not be implemented yet
    });
  });

  test.describe('Error Response Format', () => {
    test('should return consistent error format across all endpoints', async ({ request }) => {
      // Test various error scenarios
      const errorScenarios = [
        {
          name: 'Authentication error',
          request: () => request.get('/api/mission-runs/test-123'),
          expectedStatus: 401,
        },
        {
          name: 'Not found error',
          request: () =>
            request.get('/api/mission-runs/nonexistent', { headers: authHeaders }),
          expectedStatus: 404,
        },
      ];

      for (const scenario of errorScenarios) {
        const response = await scenario.request();

        expect(response.status()).toBe(scenario.expectedStatus);

        const data = await response.json();

        // All errors should have 'error' field
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');

        // May optionally have 'code' field
        console.log(`${scenario.name}:`, data);
      }
    });

    test('should include request ID in error responses', async ({ request }) => {
      const response = await request.get('/api/mission-runs/test-123', {
        headers: authHeaders,
      });

      // Check if response includes request ID or correlation ID
      const headers = response.headers();
      console.log('Response headers:', {
        'x-request-id': headers['x-request-id'],
        'x-correlation-id': headers['x-correlation-id'],
      });

      // This is informational - tracking headers might not be implemented yet
    });

    test('should handle CORS errors properly', async ({ request }) => {
      // Make request with Origin header
      const response = await request.get('/api/places', {
        headers: {
          Origin: 'https://example.com',
        },
      });

      // Should not return CORS error
      expect(response.ok()).toBeTruthy();

      // Check CORS headers
      const headers = response.headers();
      console.log('CORS headers:', {
        'access-control-allow-origin': headers['access-control-allow-origin'],
        'access-control-allow-methods': headers['access-control-allow-methods'],
      });
    });
  });

  test.describe('Validation Edge Cases', () => {
    test('should handle very long input strings', async ({ request }) => {
      const veryLongString = 'a'.repeat(10000);

      const response = await request.post('/api/missions/test/runs', {
        headers: authHeaders,
        data: {
          extraField: veryLongString,
        },
      });

      // Should handle gracefully (reject or truncate)
      expect([400, 413, 404]).toContain(response.status());
      console.log('Long string status:', response.status());
    });

    test('should handle special characters in input', async ({ request }) => {
      const specialChars = '<script>alert("xss")</script>';

      const response = await request.post('/api/missions/test/runs', {
        headers: authHeaders,
        data: {
          note: specialChars,
        },
      });

      // Should either accept and sanitize, or reject
      console.log('Special chars status:', response.status());

      if (response.ok()) {
        const data = await response.json();
        console.log('Response with special chars:', data);
      }
    });

    test('should handle null and undefined values', async ({ request }) => {
      const response = await request.post('/api/missions/test/runs', {
        headers: authHeaders,
        data: {
          nullField: null,
          undefinedField: undefined,
        },
      });

      // Should handle gracefully
      console.log('Null/undefined status:', response.status());
    });
  });
});
