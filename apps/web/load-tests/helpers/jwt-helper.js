// ZZIK LIVE v4 - JWT Helper for Load Tests
// Generates realistic JWT tokens for authenticated load testing

/**
 * Generate a test JWT token
 *
 * Note: In production load tests, you should:
 * 1. Use real JWT tokens from your auth system
 * 2. Or implement server-side token generation endpoint for testing
 *
 * For local testing, we use the x-zzik-user-id header instead (see getUserIdFromRequestLoose)
 */

import { randomString } from './utils.js';

export function generateTestJWT(userId, expiresIn = '1h') {
  // This is a MOCK implementation for reference
  // In real scenarios, you would either:
  // 1. Call your auth API to get a real token
  // 2. Use pre-generated tokens from setup
  // 3. Use a test auth endpoint

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    sub: userId,
    email: `${userId}@loadtest.example.com`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(expiresIn),
  };

  // Note: This creates an UNSIGNED token for demonstration
  // DO NOT use this in production - it will be rejected by the server
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));

  return `${headerB64}.${payloadB64}.UNSIGNED_FOR_TESTING`;
}

/**
 * Get authentication headers for load tests
 *
 * Uses x-zzik-user-id header which is accepted by getUserIdFromRequestLoose()
 * in development/testing environments
 */
export function getTestAuthHeaders(userId) {
  return {
    'Content-Type': 'application/json',
    'x-zzik-user-id': userId,
    // For production testing with real JWTs:
    // 'Authorization': `Bearer ${generateTestJWT(userId)}`,
  };
}

/**
 * Create a pool of test users with pre-generated tokens
 */
export function createUserPool(count = 100) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: `load-test-user-${i}`,
      token: generateTestJWT(`load-test-user-${i}`),
    });
  }
  return users;
}

/**
 * Get a random user from the pool (for scenarios with user reuse)
 */
export function getRandomUser(userPool) {
  return userPool[Math.floor(Math.random() * userPool.length)];
}

// Helper functions

function base64UrlEncode(str) {
  // Simple base64url encoding (for mock purposes only)
  if (typeof btoa === 'function') {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  // Fallback for environments without btoa
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function parseExpiry(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // default 1 hour

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

export default {
  generateTestJWT,
  getTestAuthHeaders,
  createUserPool,
  getRandomUser,
};
