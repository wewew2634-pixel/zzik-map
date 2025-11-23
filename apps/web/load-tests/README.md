# ZZIK LIVE v4 - Load Testing with k6

Comprehensive load testing suite for the ZZIK LIVE application using [Grafana k6](https://k6.io/).

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Interpreting Results](#interpreting-results)
- [Performance Targets](#performance-targets)
- [CI Integration](#ci-integration)
- [Troubleshooting](#troubleshooting)

## Installation

### Option 1: Install k6 via Package Manager (Recommended)

**macOS (Homebrew):**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows (Chocolatey):**
```bash
choco install k6
```

### Option 2: Install via Binary

Download the latest release from [k6 releases](https://github.com/grafana/k6/releases).

### Verify Installation

```bash
k6 version
```

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Run the baseline test:**
   ```bash
   k6 run load-tests/baseline.js
   ```

3. **View the results in the terminal output**

## Test Suites

### 1. Baseline Test (`baseline.js`)

Tests basic API endpoints to establish performance baseline.

- **Duration:** ~4 minutes
- **Max Users:** 50 concurrent
- **Endpoints Tested:**
  - `/api/health` (health check)
  - `/api/metrics` (Prometheus metrics)
  - `/api/users/me` (authenticated endpoint)

**Performance Targets:**
- 95% of requests < 500ms
- 99% of requests < 1s
- < 1% error rate

**Run:**
```bash
k6 run load-tests/baseline.js
```

### 2. Mission Flow Test (`mission-flow.js`)

Simulates realistic user journey through mission lifecycle.

- **Duration:** ~8 minutes
- **Max Users:** 100 concurrent
- **User Flow:**
  1. Start mission
  2. GPS verification
  3. QR code verification

**Performance Targets:**
- Mission start: 95% < 800ms
- GPS verify: 95% < 600ms
- QR verify: 95% < 600ms
- < 1% error rate

**Run:**
```bash
k6 run load-tests/mission-flow.js
```

### 3. Stress Test (`stress.js`)

Finds the breaking point by gradually increasing load to 500 users.

- **Duration:** ~13 minutes
- **Max Users:** 500 concurrent
- **Goal:** Identify system limits and degradation patterns

**Performance Targets:**
- Graceful degradation under load
- < 10% error rate at peak
- System recovery after load reduction

**Run:**
```bash
k6 run load-tests/stress.js
```

## Running Tests

### Basic Usage

```bash
# Run a specific test
k6 run load-tests/baseline.js

# Run with custom environment variables
k6 run --env BASE_URL=http://localhost:3000 load-tests/baseline.js

# Run with different VU count
k6 run --vus 100 --duration 30s load-tests/baseline.js
```

### Advanced Options

```bash
# Output results to JSON for analysis
k6 run --out json=results.json load-tests/baseline.js

# Run with CSV output
k6 run --out csv=results.csv load-tests/baseline.js

# Run with summary export
k6 run --summary-export=summary.json load-tests/baseline.js

# Run with custom tags
k6 run --tag env=staging --tag version=v1.0 load-tests/baseline.js
```

### Environment Variables

Configure tests using environment variables:

```bash
# Custom base URL
export BASE_URL=https://staging.zzik.live
k6 run load-tests/baseline.js

# Custom test mission ID
export TEST_MISSION_ID=your-mission-id
k6 run load-tests/mission-flow.js

# Custom user ID for testing
export TEST_USER_ID=your-test-user-id
k6 run load-tests/baseline.js
```

### Docker (Optional)

Run tests in Docker for consistent environment:

```bash
docker run --rm -i --network=host \
  -v $(pwd)/load-tests:/load-tests \
  grafana/k6 run /load-tests/baseline.js
```

## Interpreting Results

### Key Metrics

#### HTTP Metrics

- **http_req_duration**: Total request time
  - `p(95)`: 95th percentile (95% of requests faster than this)
  - `p(99)`: 99th percentile
  - `max`: Slowest request
- **http_req_failed**: Failed request rate (should be < 1%)
- **http_req_waiting**: Server processing time (excludes network)
- **http_reqs**: Total number of requests

#### Custom Metrics

- **mission_start_duration**: Time to start a mission
- **gps_verify_duration**: GPS verification time
- **qr_verify_duration**: QR verification time
- **complete_mission_flows**: Number of successfully completed flows

### Understanding Thresholds

Thresholds define pass/fail criteria:

```
✓ http_req_duration.......: p(95)<500    PASS
✗ http_req_failed.........: rate<0.01    FAIL (1.5%)
```

- ✓ = Threshold passed
- ✗ = Threshold failed

### Sample Output

```
scenarios: (100.00%) 1 scenario, 50 max VUs, 4m30s max duration
          ✓ http_req_duration.......: p(95)=245ms p(99)=380ms
          ✓ http_req_failed.........: 0.12% (3 of 2450)
          ✓ http_reqs...............: 2450 (10.2/s)

Overall: PASSED ✓
```

This means:
- 95% of requests completed in < 245ms (well under 500ms target)
- Only 0.12% failed (under 1% target)
- System handled ~10 requests/second
- All thresholds passed

## Performance Targets

### Response Time Targets

| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| Health Check | < 100ms | < 300ms | < 500ms |
| Mission Start | < 300ms | < 800ms | < 1000ms |
| GPS Verify | < 200ms | < 600ms | < 800ms |
| QR Verify | < 200ms | < 600ms | < 800ms |
| Metrics | < 150ms | < 400ms | < 600ms |

### Throughput Targets

- **Normal Load:** 50 concurrent users, 10-15 req/s
- **High Load:** 100 concurrent users, 20-30 req/s
- **Peak Load:** 200 concurrent users, 40-50 req/s

### Error Rate Targets

- **Normal Operation:** < 0.1% error rate
- **High Load:** < 1% error rate
- **Stress Test:** < 10% error rate

### Resource Limits

Expected behavior under load:
- **Database Connections:** < 20 concurrent (connection pooling)
- **Memory Usage:** Stable, no memory leaks
- **CPU Usage:** < 70% under normal load
- **Network:** < 1MB/s per user

## CI Integration

### GitHub Actions Workflow

See `.github/workflows/load-test.yml` for automated load testing on:
- Manual trigger
- Staging deployments
- Production deployments (with approval)

### Running in CI

```yaml
- name: Run Load Tests
  run: |
    k6 run --quiet --summary-export=summary.json load-tests/baseline.js
  env:
    BASE_URL: ${{ secrets.STAGING_URL }}
```

### Storing Results

Results are automatically stored as artifacts:
- JSON summary
- HTML reports (if configured)
- Performance trends over time

## Troubleshooting

### Server Not Ready

```
Error: Server not ready: 503
```

**Solution:**
1. Ensure dev server is running: `npm run dev`
2. Check server health: `curl http://localhost:3000/api/health`
3. Verify database is running

### High Error Rate

```
✗ http_req_failed: rate>0.01 (5.2%)
```

**Possible Causes:**
1. Server overloaded - reduce VU count
2. Database connection issues - check connection pool
3. Rate limiting - adjust request timing
4. Invalid test data - verify test configuration

**Debug:**
```bash
# Run with verbose output
k6 run --verbose load-tests/baseline.js

# Check server logs
npm run dev  # Watch for errors

# Test individual endpoint
curl -v http://localhost:3000/api/health
```

### Slow Response Times

```
✗ http_req_duration: p(95)>500 (850ms)
```

**Investigation Steps:**
1. Check database performance (connection pool, query time)
2. Review server logs for slow operations
3. Monitor system resources (CPU, memory)
4. Check network latency
5. Profile application code

### Connection Refused

```
Error: dial tcp 127.0.0.1:3000: connect: connection refused
```

**Solution:**
1. Start the server: `npm run dev`
2. Verify port: Server should be on `0.0.0.0:3000`
3. Check firewall settings
4. Use correct BASE_URL

### Test Mission Not Found

```
Status: 404 - Mission not found
```

**Solution:**
1. Create test mission in database
2. Set TEST_MISSION_ID environment variable:
   ```bash
   export TEST_MISSION_ID=your-actual-mission-id
   k6 run load-tests/mission-flow.js
   ```
3. Or modify `k6.config.js` with valid mission ID

## Advanced Topics

### Custom Scenarios

Create custom test scenarios in `load-tests/custom/`:

```javascript
import http from 'k6/http';
import { check } from 'k6';
import { config, getAuthHeaders } from '../k6.config.js';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  // Your custom test logic
}
```

### Monitoring with Grafana

k6 can export metrics to Grafana for real-time monitoring:

```bash
# Output to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 load-tests/baseline.js

# Output to Prometheus
k6 run --out experimental-prometheus-rw load-tests/baseline.js
```

### Performance Profiling

Enable detailed profiling:

```bash
# HTTP tracing
k6 run --http-debug="full" load-tests/baseline.js

# Execution trace
k6 run --trace --trace-output=trace.json load-tests/baseline.js
```

## Best Practices

1. **Start Small:** Run baseline test before complex flows
2. **Gradual Load:** Use stages to ramp up gradually
3. **Realistic Data:** Use production-like test data
4. **Monitor Server:** Watch server metrics during tests
5. **Clean Data:** Clean up test data after runs
6. **Version Control:** Track performance over time
7. **Document Changes:** Note what changed if performance degrades

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Cloud](https://k6.io/cloud/) (for advanced analytics)
- [Grafana Dashboard](https://grafana.com/grafana/dashboards/2587) (k6 metrics)

## Support

For issues or questions:
1. Check this README
2. Review k6 documentation
3. Check application logs
4. Contact the development team
