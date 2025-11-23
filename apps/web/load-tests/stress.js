// ZZIK LIVE v4 - Stress Test
// Finds the breaking point of the system by gradually increasing load

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { config, getAuthHeaders, getRandomUserId } from './k6.config.js';

// Custom metrics to track system degradation
const errorRate = new Rate('errors');
const timeouts = new Counter('timeouts');
const serverErrors = new Counter('server_errors');
const systemHealthy = new Rate('system_healthy');

// Stress test configuration - gradually increase to 500 users
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Baseline
    { duration: '2m', target: 100 },   // Normal load
    { duration: '2m', target: 200 },   // High load
    { duration: '2m', target: 300 },   // Stress point
    { duration: '2m', target: 400 },   // Breaking point
    { duration: '2m', target: 500 },   // Maximum stress
    { duration: '2m', target: 0 },     // Recovery
  ],
  thresholds: {
    // More relaxed thresholds for stress testing
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.10'], // Allow up to 10% errors under stress
    errors: ['rate<0.15'],

    // Track when system starts failing
    server_errors: ['count<100'],
  },
};

// Setup
export function setup() {
  console.log('========================================');
  console.log('  ZZIK LIVE - Stress Test');
  console.log('========================================');
  console.log(`Target: ${config.BASE_URL}`);
  console.log('Goal: Find system breaking point');
  console.log('Max load: 500 concurrent users');
  console.log('Duration: ~13 minutes');
  console.log('========================================\n');

  // Verify baseline health
  const healthRes = http.get(`${config.BASE_URL}/api/health`);
  if (healthRes.status !== 200) {
    throw new Error(`Server not ready for stress test: ${healthRes.status}`);
  }

  return {
    startTime: Date.now(),
    baseUrl: config.BASE_URL,
  };
}

// Main stress test scenario
export default function (data) {
  const userId = getRandomUserId(__VU);
  const headers = getAuthHeaders(userId);

  // Test various endpoints under stress
  testHealthEndpoint(data.baseUrl);
  sleep(0.5);

  testMissionStart(data.baseUrl, headers);
  sleep(0.5);

  testMetricsEndpoint(data.baseUrl);
  sleep(1);
}

// Test health endpoint
function testHealthEndpoint(baseUrl) {
  const res = http.get(`${baseUrl}/api/health`, {
    timeout: '10s',
  });

  const healthy = check(res, {
    'health endpoint responsive': (r) => r.status !== 0,
    'health status 2xx or 5xx': (r) => r.status === 200 || r.status >= 500,
  });

  systemHealthy.add(healthy);

  if (res.status === 0) {
    timeouts.add(1);
    errorRate.add(1);
  } else if (res.status >= 500) {
    serverErrors.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
}

// Test mission start under stress
function testMissionStart(baseUrl, headers) {
  const payload = JSON.stringify({});
  const params = {
    headers: headers,
    timeout: '10s',
  };

  const res = http.post(
    `${baseUrl}/api/missions/${config.TEST_MISSION_ID}/runs`,
    payload,
    params
  );

  check(res, {
    'mission start responsive': (r) => r.status !== 0,
    'mission start not 5xx': (r) => r.status < 500,
  });

  if (res.status === 0) {
    timeouts.add(1);
    errorRate.add(1);
  } else if (res.status >= 500) {
    serverErrors.add(1);
    errorRate.add(1);
  } else if (res.status >= 400) {
    errorRate.add(0); // Client errors are acceptable under stress
  } else {
    errorRate.add(0);
  }
}

// Test metrics endpoint
function testMetricsEndpoint(baseUrl) {
  const res = http.get(`${baseUrl}/api/metrics`, {
    headers: { 'Accept': 'text/plain' },
    timeout: '10s',
  });

  check(res, {
    'metrics endpoint responsive': (r) => r.status !== 0,
  });

  if (res.status === 0) {
    timeouts.add(1);
  }
}

// Teardown and report
export function teardown(data) {
  const durationMin = ((Date.now() - data.startTime) / 1000 / 60).toFixed(2);
  console.log(`\nStress test completed in ${durationMin} minutes`);
}

// Custom summary for stress test
export function handleSummary(data) {
  const summary = generateStressSummary(data);
  console.log(summary);

  return {
    'stdout': summary,
    'load-tests/results/stress-test-summary.json': JSON.stringify(data, null, 2),
  };
}

function generateStressSummary(data) {
  let summary = '\n';
  summary += '====================================================\n';
  summary += '  ZZIK LIVE - Stress Test Results\n';
  summary += '====================================================\n\n';

  const duration = (data.state.testRunDurationMs / 1000 / 60).toFixed(2);
  const maxVUs = data.metrics.vus?.values?.max || 0;
  const totalRequests = data.metrics.http_reqs?.values?.count || 0;

  summary += `Duration: ${duration} minutes\n`;
  summary += `Max Virtual Users: ${maxVUs}\n`;
  summary += `Total Requests: ${totalRequests}\n\n`;

  // Key stress metrics
  summary += 'Stress Test Metrics:\n';
  summary += `  Total Errors: ${data.metrics.errors?.values?.count || 0}\n`;
  summary += `  Error Rate: ${((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `  Timeouts: ${data.metrics.timeouts?.values?.count || 0}\n`;
  summary += `  Server Errors (5xx): ${data.metrics.server_errors?.values?.count || 0}\n`;
  summary += `  System Healthy Rate: ${((data.metrics.system_healthy?.values?.rate || 0) * 100).toFixed(2)}%\n\n`;

  // HTTP performance under stress
  summary += 'HTTP Performance:\n';
  summary += `  Failed Requests: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `  Duration (p50): ${(data.metrics.http_req_duration?.values?.['p(50)'] || 0).toFixed(2)}ms\n`;
  summary += `  Duration (p95): ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `  Duration (p99): ${(data.metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n`;
  summary += `  Duration (max): ${(data.metrics.http_req_duration?.values?.max || 0).toFixed(2)}ms\n\n`;

  // Breaking point analysis
  const errorRate = (data.metrics.errors?.values?.rate || 0) * 100;
  const p95Duration = data.metrics.http_req_duration?.values?.['p(95)'] || 0;

  summary += 'Breaking Point Analysis:\n';

  if (errorRate < 5 && p95Duration < 1000) {
    summary += '  Status: EXCELLENT - System handled max load well\n';
    summary += `  Recommendation: Can safely handle ${maxVUs} concurrent users\n`;
  } else if (errorRate < 10 && p95Duration < 2000) {
    summary += '  Status: GOOD - System degraded gracefully under stress\n';
    summary += `  Recommendation: Target ~${Math.floor(maxVUs * 0.8)} concurrent users\n`;
  } else if (errorRate < 15 && p95Duration < 5000) {
    summary += '  Status: DEGRADED - System struggled at peak load\n';
    summary += `  Recommendation: Target ~${Math.floor(maxVUs * 0.6)} concurrent users\n`;
    summary += '  Action: Investigate performance bottlenecks\n';
  } else {
    summary += '  Status: CRITICAL - System broke under stress\n';
    summary += `  Recommendation: Maximum ${Math.floor(maxVUs * 0.4)} concurrent users\n`;
    summary += '  Action: URGENT - Optimize before production use\n';
  }

  summary += '\n';

  // Threshold results
  summary += 'Threshold Results:\n';
  let allPassed = true;
  for (const [name, metric] of Object.entries(data.metrics)) {
    if (metric.thresholds) {
      for (const [thresholdName, thresholdData] of Object.entries(metric.thresholds)) {
        const status = thresholdData.ok ? 'PASS' : 'FAIL';
        if (!thresholdData.ok) allPassed = false;
        summary += `  [${status}] ${name}: ${thresholdName}\n`;
      }
    }
  }

  summary += `\nOverall Status: ${allPassed ? 'PASSED ✓' : 'FAILED ✗'}\n`;
  summary += '====================================================\n';

  return summary;
}
