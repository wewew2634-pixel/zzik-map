// ZZIK LIVE v4 - Mission Flow Load Test
// Simulates realistic user journey: Start Mission → GPS Verify → QR Verify

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { config, getAuthHeaders, generateGpsData, getRandomUserId } from './k6.config.js';

// Custom metrics
const missionStartSuccess = new Rate('mission_start_success');
const missionStartDuration = new Trend('mission_start_duration');
const gpsVerifySuccess = new Rate('gps_verify_success');
const gpsVerifyDuration = new Trend('gps_verify_duration');
const qrVerifySuccess = new Rate('qr_verify_success');
const qrVerifyDuration = new Trend('qr_verify_duration');
const completeMissionFlows = new Counter('complete_mission_flows');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Warm up
    { duration: '1m', target: 50 },    // Ramp to 50 users
    { duration: '2m', target: 100 },   // Ramp to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 50 },    // Ramp down
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    // Overall HTTP metrics
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],

    // Mission flow metrics
    mission_start_success: ['rate>0.95'],
    mission_start_duration: ['p(95)<800'],
    gps_verify_success: ['rate>0.95'],
    gps_verify_duration: ['p(95)<600'],
    qr_verify_success: ['rate>0.90'],
    qr_verify_duration: ['p(95)<600'],

    // At least some flows should complete
    complete_mission_flows: ['count>0'],
  },
};

// Setup function
export function setup() {
  console.log(`Starting mission flow test against ${config.BASE_URL}`);
  console.log('Simulating 100 concurrent users over 5 minutes');

  // Verify server is healthy
  const healthRes = http.get(`${config.BASE_URL}/api/health`);
  if (healthRes.status !== 200) {
    throw new Error(`Server not healthy: ${healthRes.status}`);
  }

  return {
    startTime: new Date().toISOString(),
    baseUrl: config.BASE_URL,
  };
}

// Main test function - simulates one user's complete mission flow
export default function (data) {
  const userId = getRandomUserId(__VU);
  const headers = getAuthHeaders(userId);
  let missionRunId = null;

  // STEP 1: Start a mission
  group('Start Mission', function () {
    const startPayload = JSON.stringify({});
    const startParams = {
      headers: headers,
    };

    const startTime = Date.now();
    const startRes = http.post(
      `${data.baseUrl}/api/missions/${config.TEST_MISSION_ID}/runs`,
      startPayload,
      startParams
    );
    const duration = Date.now() - startTime;

    const success = check(startRes, {
      'mission start status is 200': (r) => r.status === 200,
      'mission start returns run id': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (body.id) {
            missionRunId = body.id;
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      },
      'mission start response time < 1s': () => duration < 1000,
    });

    missionStartSuccess.add(success);
    missionStartDuration.add(duration);

    if (!missionRunId) {
      console.error(`Failed to start mission for user ${userId}: ${startRes.status}`);
      return; // Skip rest of flow if start failed
    }
  });

  sleep(2); // Simulate user reading mission details

  // STEP 2: GPS Verification
  group('GPS Verify', function () {
    const gpsData = generateGpsData();
    const gpsPayload = JSON.stringify(gpsData);
    const gpsParams = {
      headers: headers,
    };

    const gpsTime = Date.now();
    const gpsRes = http.post(
      `${data.baseUrl}/api/mission-runs/${missionRunId}/gps-verify`,
      gpsPayload,
      gpsParams
    );
    const duration = Date.now() - gpsTime;

    const success = check(gpsRes, {
      'gps verify status is 200 or 400': (r) => r.status === 200 || r.status === 400,
      'gps verify has response body': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id !== undefined;
        } catch (e) {
          return false;
        }
      },
      'gps verify response time < 800ms': () => duration < 800,
    });

    gpsVerifySuccess.add(success);
    gpsVerifyDuration.add(duration);
  });

  sleep(3); // Simulate user traveling to location and scanning QR

  // STEP 3: QR Verification
  group('QR Verify', function () {
    // Simulate a QR payload (in real scenario, this would be scanned)
    const qrPayload = JSON.stringify({
      rawPayload: `zzik://mission/${config.TEST_MISSION_ID}/verify?timestamp=${Date.now()}`,
    });
    const qrParams = {
      headers: headers,
    };

    const qrTime = Date.now();
    const qrRes = http.post(
      `${data.baseUrl}/api/mission-runs/${missionRunId}/qr-verify`,
      qrPayload,
      qrParams
    );
    const duration = Date.now() - qrTime;

    const success = check(qrRes, {
      'qr verify status is 200 or 400': (r) => r.status === 200 || r.status === 400,
      'qr verify has response body': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id !== undefined;
        } catch (e) {
          return false;
        }
      },
      'qr verify response time < 800ms': () => duration < 800,
    });

    qrVerifySuccess.add(success);
    qrVerifyDuration.add(duration);

    if (success) {
      completeMissionFlows.add(1);
    }
  });

  sleep(5); // Wait before starting another mission
}

// Teardown function
export function teardown(data) {
  console.log(`Mission flow test completed. Started at: ${data.startTime}`);
}

// Custom summary
export function handleSummary(data) {
  const summary = generateSummary(data);
  console.log(summary);

  return {
    'stdout': summary,
    'load-tests/results/mission-flow-summary.json': JSON.stringify(data, null, 2),
  };
}

function generateSummary(data) {
  let summary = '\n';
  summary += '================================================\n';
  summary += '  ZZIK LIVE - Mission Flow Load Test Results\n';
  summary += '================================================\n\n';

  // Test overview
  const duration = (data.state.testRunDurationMs / 1000).toFixed(2);
  const maxVUs = data.metrics.vus?.values?.max || 0;
  const totalRequests = data.metrics.http_reqs?.values?.count || 0;

  summary += `Duration: ${duration}s\n`;
  summary += `Max Virtual Users: ${maxVUs}\n`;
  summary += `Total Requests: ${totalRequests}\n`;
  summary += `Complete Flows: ${data.metrics.complete_mission_flows?.values?.count || 0}\n\n`;

  // Mission start metrics
  summary += 'Mission Start:\n';
  summary += `  Success Rate: ${((data.metrics.mission_start_success?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `  Duration (p95): ${(data.metrics.mission_start_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `  Duration (p99): ${(data.metrics.mission_start_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n\n`;

  // GPS verify metrics
  summary += 'GPS Verification:\n';
  summary += `  Success Rate: ${((data.metrics.gps_verify_success?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `  Duration (p95): ${(data.metrics.gps_verify_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `  Duration (p99): ${(data.metrics.gps_verify_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n\n`;

  // QR verify metrics
  summary += 'QR Verification:\n';
  summary += `  Success Rate: ${((data.metrics.qr_verify_success?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `  Duration (p95): ${(data.metrics.qr_verify_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `  Duration (p99): ${(data.metrics.qr_verify_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n\n`;

  // Overall HTTP performance
  summary += 'Overall HTTP Performance:\n';
  summary += `  Failed: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `  Duration (p95): ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `  Duration (p99): ${(data.metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n\n`;

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
  summary += '================================================\n';

  return summary;
}
