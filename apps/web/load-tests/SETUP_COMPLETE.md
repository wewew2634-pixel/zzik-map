# Load Testing Setup Complete

## Files Created

### Test Scripts

1. **`k6.config.js`** - Central configuration for all tests
   - Base URL and environment variables
   - Common thresholds and stages
   - Helper functions for auth and GPS data

2. **`baseline.js`** - Basic API performance test
   - Tests health, metrics, and user endpoints
   - 50 concurrent users, 4 minutes
   - Targets: p95 < 500ms, < 1% errors

3. **`mission-flow.js`** - Mission lifecycle simulation
   - Realistic user flow: Start → GPS → QR
   - 100 concurrent users, 8 minutes
   - Targets: Complete flows with < 1s response time

4. **`stress.js`** - System breaking point test
   - Gradual load increase to 500 users
   - 13 minutes duration
   - Identifies system limits and degradation

### Helper Utilities

5. **`helpers/jwt-helper.js`** - JWT token generation
   - Mock JWT generation (reference only)
   - Test authentication headers
   - User pool creation

6. **`helpers/utils.js`** - Common utilities
   - Random data generation
   - GPS coordinate helpers
   - Retry logic and error handling

### Documentation

7. **`README.md`** - Complete load testing guide
   - Installation instructions
   - How to run tests
   - Interpreting results
   - Troubleshooting guide

8. **`QUICK_START.md`** - Fast getting started guide
   - Installation one-liners
   - Quick test commands
   - Basic troubleshooting

9. **`PERFORMANCE_REPORT_TEMPLATE.md`** - Reporting template
   - Executive summary
   - Detailed metrics
   - Bottleneck analysis
   - Recommendations

### CI/CD Integration

10. **`.github/workflows/load-test.yml`** - GitHub Actions workflow
    - Manual and scheduled runs
    - Deployment-triggered tests
    - Result artifacts and comparisons

### Scripts

11. **`run-tests.sh`** - Convenience test runner
    - Interactive menu
    - Automated test execution
    - Result management

### Configuration

12. **`.gitignore`** - Ignore test results
13. **`results/.gitkeep`** - Results directory placeholder

### Main Documentation Updates

14. **Updated `README.md`** - Added load testing section to main README

## Quick Start

1. **Install k6:**
   ```bash
   brew install k6  # macOS
   ```

2. **Start server:**
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   # Interactive menu
   ./load-tests/run-tests.sh

   # Or run directly
   k6 run load-tests/baseline.js
   ```

## File Structure

```
apps/web/
├── load-tests/
│   ├── k6.config.js              # Central configuration
│   ├── baseline.js               # Baseline test
│   ├── mission-flow.js           # Mission flow test
│   ├── stress.js                 # Stress test
│   ├── run-tests.sh              # Test runner script
│   ├── helpers/
│   │   ├── jwt-helper.js         # JWT utilities
│   │   └── utils.js              # Common utilities
│   ├── results/                  # Test results (gitignored)
│   │   └── .gitkeep
│   ├── .gitignore
│   ├── README.md                 # Full documentation
│   ├── QUICK_START.md            # Quick guide
│   ├── PERFORMANCE_REPORT_TEMPLATE.md
│   └── SETUP_COMPLETE.md         # This file
├── .github/
│   └── workflows/
│       └── load-test.yml         # CI integration
└── README.md                     # Updated with load testing section
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Response Time (p95) | < 500ms |
| Response Time (p99) | < 1000ms |
| Error Rate | < 1% |
| Concurrent Users | 100+ |
| Throughput | 10+ req/s |

## Next Steps

1. **Run baseline test** to establish current performance
2. **Review results** and identify any issues
3. **Run mission flow test** to verify user journey
4. **Run stress test** to find system limits
5. **Document findings** using performance report template
6. **Set up CI integration** for automated testing
7. **Create Grafana dashboards** for monitoring

## Useful Commands

```bash
# Run specific test
k6 run load-tests/baseline.js

# Run with custom URL
BASE_URL=https://staging.example.com k6 run load-tests/baseline.js

# Run with output to file
k6 run --out json=results.json load-tests/baseline.js

# Run with custom duration
k6 run --duration 30s load-tests/baseline.js

# Run with custom VUs
k6 run --vus 100 load-tests/baseline.js

# View results summary
cat load-tests/results/*-summary.json | jq
```

## Grafana Dashboard Metrics

Recommended metrics to track:

1. **HTTP Performance:**
   - http_req_duration (p50, p95, p99)
   - http_req_failed
   - http_reqs

2. **Mission Metrics:**
   - mission_start_duration
   - gps_verify_duration
   - qr_verify_duration
   - complete_mission_flows

3. **System Health:**
   - CPU usage
   - Memory usage
   - Database connections
   - Error rates

## Support

- Load testing docs: `load-tests/README.md`
- k6 documentation: https://k6.io/docs/
- Performance report template: `load-tests/PERFORMANCE_REPORT_TEMPLATE.md`

## Notes

- All test scripts use the `x-zzik-user-id` header for authentication (dev/test mode)
- For production testing, implement real JWT token generation
- Test data is automatically cleaned up (no persistent test data)
- Results are stored locally in `load-tests/results/` (gitignored)
- CI workflow can be triggered manually via GitHub Actions

---

**Setup completed successfully!** You're ready to start load testing.
