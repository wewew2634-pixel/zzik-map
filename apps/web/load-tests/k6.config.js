// ZZIK LIVE v4 - k6 Load Test Configuration
// Central configuration for all k6 load tests

export const config = {
  // Base URL for API endpoints
  BASE_URL: __ENV.BASE_URL || 'http://localhost:3000',

  // Authentication
  JWT_SECRET: __ENV.JWT_SECRET || 'test-secret-key-for-load-testing',
  TEST_USER_ID: __ENV.TEST_USER_ID || 'test-user-123',

  // Test data
  TEST_MISSION_ID: __ENV.TEST_MISSION_ID || 'mission-001',

  // Performance thresholds (common across tests)
  thresholds: {
    // HTTP metrics
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'], // Less than 1% errors
    http_req_waiting: ['p(95)<400'], // Server processing time

    // Custom metrics thresholds
    mission_start_duration: ['p(95)<800'],
    gps_verify_duration: ['p(95)<600'],
    qr_verify_duration: ['p(95)<600'],
  },

  // Common test stages
  stages: {
    warmup: { duration: '30s', target: 10 },
    rampUp: { duration: '1m', target: 50 },
    steady: { duration: '2m', target: 50 },
    peak: { duration: '1m', target: 100 },
    rampDown: { duration: '30s', target: 0 },
  },

  // Test configuration
  options: {
    // Disable SSL verification for local testing
    insecureSkipTLSVerify: true,

    // Batch requests to reduce overhead
    batch: 10,
    batchPerHost: 5,

    // Connection pooling
    maxRedirects: 4,

    // Timeouts
    timeout: '60s',
  },
};

// GPS coordinates for testing (approximate location)
export const testLocations = {
  valid: {
    lat: 37.5665,
    lng: 126.9780,
    accuracy: 10,
  },
  invalid: {
    lat: 35.1796,
    lng: 129.0756,
    accuracy: 10,
  },
};

// Helper to get authorization headers
export function getAuthHeaders(userId = null) {
  return {
    'Content-Type': 'application/json',
    'x-zzik-user-id': userId || config.TEST_USER_ID,
  };
}

// Helper to get random user ID for distributed testing
export function getRandomUserId(vuId) {
  return `load-test-user-${vuId}-${Date.now()}`;
}

// Helper to generate GPS data
export function generateGpsData(location = testLocations.valid) {
  return {
    lat: location.lat + (Math.random() - 0.5) * 0.001, // Small random offset
    lng: location.lng + (Math.random() - 0.5) * 0.001,
    accuracy: location.accuracy + Math.random() * 5,
    provider: 'gps',
    mocked: false,
    deviceId: 'load-test-device',
    timestamp: new Date().toISOString(),
  };
}

// Export for use in tests
export default config;
