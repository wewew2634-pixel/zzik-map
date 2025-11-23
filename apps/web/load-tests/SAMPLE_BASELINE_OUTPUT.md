# Sample k6 Baseline Test Output

This document shows what a successful baseline test output looks like.

## Command

```bash
k6 run load-tests/baseline.js
```

## Sample Output

```
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: load-tests/baseline.js
     output: -

  scenarios: (100.00%) 1 scenario, 50 max VUs, 4m30s max duration (incl. graceful stop):
           * default: Up to 50 looping VUs for 4m0s over 4 stages (gracefulRampDown: 30s, gracefulStop: 30s)

========================================
  ZZIK LIVE - Baseline Load Test Results
========================================

Duration: 240.00s
Virtual Users: 50

HTTP Performance:
  Requests: 2450
  Failed: 0.12%
  Duration (p95): 245.32ms
  Duration (p99): 380.45ms

Health Check:
  Success Rate: 99.88%
  Duration (p95): 198.23ms

Thresholds:
  [PASS] http_req_duration: p(95)<500
  [PASS] http_req_duration: p(99)<1000
  [PASS] http_req_failed: rate<0.01
  [PASS] health_check_success: rate>0.99
  [PASS] health_check_duration: p(95)<300

Overall: PASSED
========================================

     ✓ health status is 200
     ✓ health response has status field
     ✓ health response time < 500ms
     ✓ metrics status is 200
     ✓ metrics contains prometheus format
     ✓ users/me returns data or 404
     ✓ users/me response time < 300ms

     checks.........................: 100.00% ✓ 17150      ✗ 0
     data_received..................: 8.2 MB  34 kB/s
     data_sent......................: 1.1 MB  4.6 kB/s
     health_check_duration..........: avg=156.23ms min=45ms   med=142ms   max=489ms   p(95)=198.23ms p(99)=245.67ms
     health_check_success...........: 99.88%  ✓ 1223       ✗ 2
     http_req_blocked...............: avg=12.34μs  min=1μs    med=4μs     max=2.1ms   p(95)=18μs     p(99)=45μs
     http_req_connecting............: avg=8.23μs   min=0s     med=0s      max=1.8ms   p(95)=0s       p(99)=0s
     http_req_duration..............: avg=189.45ms min=34ms   med=167ms   max=892ms   p(95)=245.32ms p(99)=380.45ms
       { expected_response:true }...: avg=189.45ms min=34ms   med=167ms   max=892ms   p(95)=245.32ms p(99)=380.45ms
     http_req_failed................: 0.12%   ✓ 3          ✗ 2447
     http_req_receiving.............: avg=234.56μs min=23μs   med=189μs   max=2.3ms   p(95)=456μs    p(99)=789μs
     http_req_sending...............: avg=45.67μs  min=8μs    med=34μs    max=456μs   p(95)=89μs     p(99)=145μs
     http_req_tls_handshaking.......: avg=0s       min=0s     med=0s      max=0s      p(95)=0s       p(99)=0s
     http_req_waiting...............: avg=189.17ms min=33ms   med=166ms   max=891ms   p(95)=244.89ms p(99)=379.98ms
     http_reqs......................: 2450    10.21/s
     iteration_duration.............: avg=4.89s    min=4.02s  med=4.87s   max=6.12s   p(95)=5.23s    p(99)=5.67s
     iterations.....................: 490     2.04/s
     vus............................: 1       min=1        max=50
     vus_max........................: 50      min=50       max=50

running (4m00.0s), 00/50 VUs, 490 complete and 0 interrupted iterations
default ✓ [======================================] 00/50 VUs  4m0s
```

## Understanding the Output

### Test Configuration
```
scenarios: (100.00%) 1 scenario, 50 max VUs, 4m30s max duration
```
- Running 1 scenario
- Maximum 50 Virtual Users (VUs)
- Total duration including graceful shutdown: 4m30s

### Checks (All Passed ✓)
```
✓ health status is 200
✓ health response has status field
✓ health response time < 500ms
✓ metrics status is 200
✓ metrics contains prometheus format
✓ users/me returns data or 404
✓ users/me response time < 300ms
```

### Key Metrics Explained

**http_req_duration** - Total request time
- avg: 189.45ms (average)
- p(95): 245.32ms (95% of requests faster than this) ✓ < 500ms target
- p(99): 380.45ms (99% of requests faster than this) ✓ < 1000ms target
- max: 892ms (slowest request)

**http_req_failed** - Failed requests
- 0.12% (3 out of 2450) ✓ < 1% target

**http_reqs** - Throughput
- 2450 total requests
- 10.21 requests/second

**Custom Metrics:**
- health_check_success: 99.88% ✓
- health_check_duration (p95): 198.23ms ✓ < 300ms

### Thresholds (All Passed)
```
[PASS] http_req_duration: p(95)<500
[PASS] http_req_duration: p(99)<1000
[PASS] http_req_failed: rate<0.01
[PASS] health_check_success: rate>0.99
[PASS] health_check_duration: p(95)<300
```

### Overall Result
```
Overall: PASSED
```

All performance targets were met!

## What Good Looks Like

✅ **Green Flags:**
- All thresholds pass
- p95 response time < 500ms
- Error rate < 1%
- Health check success > 99%
- No timeouts or connection errors

⚠️ **Yellow Flags (Investigate):**
- p95 response time 500-800ms
- Error rate 1-5%
- Some failed health checks

🚫 **Red Flags (Action Required):**
- p95 response time > 1000ms
- Error rate > 5%
- Frequent timeouts
- High server errors (5xx)

## Next Steps

After a successful baseline test:

1. **Run Mission Flow Test**
   ```bash
   k6 run load-tests/mission-flow.js
   ```

2. **Run Stress Test** (to find limits)
   ```bash
   k6 run load-tests/stress.js
   ```

3. **Document Results**
   - Use `PERFORMANCE_REPORT_TEMPLATE.md`
   - Store baseline metrics for comparison
   - Track trends over time

4. **Set Up Monitoring**
   - Create Grafana dashboards
   - Set up alerts for degradation
   - Monitor in production
