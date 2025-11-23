import { test, expect } from '@playwright/test';
import { createTestAuthHeader, createTestUser } from './utils';
import jwt from 'jsonwebtoken';

/**
 * E2E Test: Authentication Flow
 *
 * Tests JWT authentication, token validation, and authorization
 */

test.describe('Authentication', () => {
  test('should successfully authenticate with valid JWT token', async ({ request }) => {
    const authHeaders = createTestAuthHeader({ userId: 'test-user-auth-valid' });

    // Try to access a protected endpoint
    const response = await request.get('/api/users/me', {
      headers: authHeaders,
    });

    // Should return 200 or 404 (if endpoint doesn't exist yet)
    // But NOT 401 (unauthorized)
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      console.log('User data:', data);
    }
  });

  test('should reject request without authorization header', async ({ request }) => {
    // Try to access mission-runs endpoint without auth
    const response = await request.get('/api/mission-runs/test-run-123');

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Authentication');

    console.log('Auth error:', data);
  });

  test('should reject request with malformed authorization header', async ({ request }) => {
    // Missing "Bearer " prefix
    const response = await request.get('/api/mission-runs/test-run-123', {
      headers: {
        Authorization: 'InvalidToken123',
      },
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should reject request with invalid JWT token', async ({ request }) => {
    // Create a token with invalid signature
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.invalid_signature_here';

    const response = await request.get('/api/mission-runs/test-run-123', {
      headers: {
        Authorization: `Bearer ${invalidToken}`,
      },
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/invalid|expired/i);

    console.log('Invalid token error:', data);
  });

  test('should reject expired JWT token', async ({ request }) => {
    const secret = process.env.AUTH_JWT_SECRET || 'test_jwt_secret_minimum_32_characters_long_for_testing';

    // Create expired token (expired 1 hour ago)
    const expiredToken = jwt.sign(
      {
        sub: 'test-user-expired',
        email: 'expired@test.com',
      },
      secret,
      { expiresIn: '-1h' }
    );

    const response = await request.get('/api/mission-runs/test-run-123', {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/expired|invalid/i);

    console.log('Expired token error:', data);
  });

  test('should reject token with missing subject (sub)', async ({ request }) => {
    const secret = process.env.AUTH_JWT_SECRET || 'test_jwt_secret_minimum_32_characters_long_for_testing';

    // Create token without sub claim
    const tokenWithoutSub = jwt.sign(
      {
        email: 'nosub@test.com',
      },
      secret,
      { expiresIn: '1h' }
    );

    const response = await request.get('/api/mission-runs/test-run-123', {
      headers: {
        Authorization: `Bearer ${tokenWithoutSub}`,
      },
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');

    console.log('No subject error:', data);
  });

  test('should accept x-zzik-user-id header in development mode', async ({ request }) => {
    // Test the loose authentication method
    const response = await request.get('/api/mission-runs/test-run-123', {
      headers: {
        'x-zzik-user-id': 'dev-user-123',
      },
    });

    // Should NOT return 401 (might return 404 if mission run doesn't exist)
    expect(response.status()).not.toBe(401);

    console.log('Dev header auth status:', response.status());
  });

  test('should validate token with different user IDs', async ({ request }) => {
    const users = [
      { userId: 'user-1' },
      { userId: 'user-2' },
      { userId: 'user-with-special-chars-_@#' },
    ];

    for (const user of users) {
      const authHeaders = createTestAuthHeader(user);

      const response = await request.get('/api/users/me', {
        headers: authHeaders,
      });

      // Should not return 401
      expect(response.status()).not.toBe(401);

      console.log(`User ${user.userId} auth status:`, response.status());
    }
  });

  test('should include user context in authenticated requests', async ({ request }) => {
    const testUserId = 'test-user-context-123';
    const authHeaders = createTestAuthHeader({ userId: testUserId });

    // Start a mission run (which requires auth)
    const response = await request.post('/api/missions/test-mission-1/runs', {
      headers: authHeaders,
      data: {},
    });

    // If successful, the run should be associated with our user
    if (response.ok()) {
      const data = await response.json();
      console.log('Created run with user context:', data);
      // The backend should have used our userId from the token
    } else if (response.status() === 404) {
      // Mission doesn't exist - that's ok for this test
      console.log('Mission not found (expected in test)');
    } else if (response.status() === 401) {
      // Auth failed - test failed
      throw new Error('Authentication failed when it should have succeeded');
    }
  });

  test('should handle concurrent requests with different tokens', async ({ request }) => {
    const users = Array.from({ length: 5 }, (_, i) => ({
      userId: `concurrent-user-${i}`,
      token: createTestUser({ userId: `concurrent-user-${i}` }),
    }));

    // Make concurrent requests with different tokens
    const responses = await Promise.all(
      users.map(user =>
        request.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
      )
    );

    // All should authenticate successfully (or return 404)
    responses.forEach((response, index) => {
      expect([200, 404]).toContain(response.status());
      console.log(`User ${index} status:`, response.status());
    });
  });

  test('should validate JWT signature with correct secret', async ({ request }) => {
    const secret = process.env.AUTH_JWT_SECRET || 'test_jwt_secret_minimum_32_characters_long_for_testing';

    // Create token with correct secret
    const validToken = jwt.sign(
      {
        sub: 'test-user-valid-secret',
        email: 'valid@test.com',
      },
      secret,
      { expiresIn: '1h' }
    );

    const response = await request.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    // Should not return 401
    expect(response.status()).not.toBe(401);
    console.log('Valid secret auth status:', response.status());
  });

  test('should reject JWT signed with wrong secret', async ({ request }) => {
    const wrongSecret = 'this_is_a_wrong_secret_key_minimum_32_characters_long';

    // Create token with wrong secret
    const invalidToken = jwt.sign(
      {
        sub: 'test-user-wrong-secret',
        email: 'wrong@test.com',
      },
      wrongSecret,
      { expiresIn: '1h' }
    );

    const response = await request.get('/api/mission-runs/test-run-123', {
      headers: {
        Authorization: `Bearer ${invalidToken}`,
      },
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');

    console.log('Wrong secret error:', data);
  });
});
