// ZZIK LIVE v4 - Baseline Load Test
// Tests basic API endpoints to establish performance baseline

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config, getAuthHeaders } from './k6.config.js';

// Custom metrics
const healthCheckRate = new Rate('health_check_success');
const healthCheckDuration = new Trend('health_check_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    // Overall HTTP metrics
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],

    // Custom metrics
    health_check_success: ['rate>0.99'],
    health_check_duration: ['p(95)<300'],
  },
};

// Setup function (runs once at the start)
export function setup() {
  console.log(`Starting baseline test against ${config.BASE_URL}`);

  // Verify server is reachable
  const response = http.get(`${config.BASE_URL}/api/health`);
  if (response.status !== 200) {
    throw new Error(`Server not ready: ${response.status}`);
  }

  return { startTime: new Date().toISOString() };
}

// Main test function (runs for each virtual user)
export default function (data) {
  // Test 1: Health endpoint (unauthenticated)
  const healthStart = Date.now();
  const healthRes = http.get(`${config.BASE_URL}/api/health`);
  const healthDuration = Date.now() - healthStart;

  const healthOk = check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy' || body.status === 'degraded';
      } catch (e) {
        return false;
      }
    },
    'health response time < 500ms': () => healthDuration < 500,
  });

  healthCheckRate.add(healthOk);
  healthCheckDuration.add(healthDuration);

  sleep(1);

  // Test 2: Metrics endpoint (unauthenticated)
  const metricsRes = http.get(`${config.BASE_URL}/api/metrics`, {
    headers: {
      'Accept': 'text/plain',
    },
  });

  check(metricsRes, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics contains prometheus format': (r) => r.body.includes('# TYPE'),
  });

  sleep(1);

  // Test 3: Users/me endpoint (authenticated with header)
  const usersMeRes = http.get(`${config.BASE_URL}/api/users/me`, {
    headers: getAuthHeaders(),
  });

  check(usersMeRes, {
    'users/me returns data or 404': (r) => r.status === 200 || r.status === 404,
    'users/me response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(2);
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log(`Baseline test completed. Started at: ${data.startTime}`);
}

// Handle summary data
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n';
  summary += `${indent}========================================\n`;
  summary += `${indent}  ZZIK LIVE - Baseline Load Test Results\n`;
  summary += `${indent}========================================\n\n`;

  // Test duration
  const duration = (data.state.testRunDurationMs / 1000).toFixed(2);
  summary += `${indent}Duration: ${duration}s\n`;
  summary += `${indent}Virtual Users: ${data.metrics.vus?.values?.max || 0}\n\n`;

  // HTTP metrics
  summary += `${indent}HTTP Performance:\n`;
  summary += `${indent}  Requests: ${data.metrics.http_reqs?.values?.count || 0}\n`;
  summary += `${indent}  Failed: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `${indent}  Duration (p95): ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Duration (p99): ${(data.metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n\n`;

  // Custom metrics
  summary += `${indent}Health Check:\n`;
  summary += `${indent}  Success Rate: ${((data.metrics.health_check_success?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `${indent}  Duration (p95): ${(data.metrics.health_check_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n\n`;

  // Thresholds
  summary += `${indent}Thresholds:\n`;
  let allPassed = true;
  for (const [name, threshold] of Object.entries(data.metrics)) {
    if (threshold.thresholds) {
      for (const [thresholdName, thresholdData] of Object.entries(threshold.thresholds)) {
        const status = thresholdData.ok ? 'PASS' : 'FAIL';
        if (!thresholdData.ok) allPassed = false;
        summary += `${indent}  [${status}] ${name}: ${thresholdName}\n`;
      }
    }
  }

  summary += `\n${indent}Overall: ${allPassed ? 'PASSED' : 'FAILED'}\n`;
  summary += `${indent}========================================\n`;

  return summary;
}
