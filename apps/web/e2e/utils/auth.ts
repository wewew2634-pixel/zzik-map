import jwt from 'jsonwebtoken';

export type TestUser = {
  userId: string;
  email?: string;
};

/**
 * Create a test JWT token for authentication
 */
export function createTestUser(user: TestUser = { userId: 'test-user-123' }): string {
  const secret = process.env.AUTH_JWT_SECRET || 'test_jwt_secret_minimum_32_characters_long_for_testing';

  const token = jwt.sign(
    {
      sub: user.userId,
      email: user.email,
    },
    secret,
    { expiresIn: '1h' }
  );

  return token;
}

/**
 * Create authorization header with bearer token
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Create authorization header for test user
 */
export function createTestAuthHeader(user?: TestUser): Record<string, string> {
  const token = createTestUser(user);
  return createAuthHeader(token);
}
