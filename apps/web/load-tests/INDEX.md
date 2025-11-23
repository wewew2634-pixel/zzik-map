# Load Testing Documentation Index

Quick navigation to all load testing documentation and files.

## Getting Started

1. **[INSTALLATION.md](INSTALLATION.md)** - How to install k6
   - Platform-specific instructions
   - Docker alternative
   - Verification steps

2. **[QUICK_START.md](QUICK_START.md)** - Fast track guide
   - Installation one-liners
   - Basic commands
   - Quick troubleshooting

3. **[README.md](README.md)** - Complete documentation
   - Detailed test suite descriptions
   - Running tests
   - Interpreting results
   - Performance targets
   - Advanced usage

## Test Scripts

4. **[k6.config.js](k6.config.js)** - Central configuration
   - Environment variables
   - Common thresholds
   - Helper functions
   - Test data

5. **[baseline.js](baseline.js)** - API Baseline Test
   - Health, metrics, user endpoints
   - 50 VUs, 4 minutes
   - Target: p95 < 500ms

6. **[mission-flow.js](mission-flow.js)** - Mission Flow Test
   - Complete user journey
   - 100 VUs, 8 minutes
   - Start → GPS → QR flow

7. **[stress.js](stress.js)** - Stress Test
   - Find breaking point
   - Up to 500 VUs, 13 minutes
   - System limits analysis

## Helper Utilities

8. **[helpers/jwt-helper.js](helpers/jwt-helper.js)** - Authentication
   - JWT generation (mock)
   - Auth headers
   - User pool management

9. **[helpers/utils.js](helpers/utils.js)** - Common utilities
   - Random data generation
   - GPS helpers
   - Formatting functions

## Scripts

10. **[run-tests.sh](run-tests.sh)** - Test runner
    - Interactive menu
    - Automated execution
    - Results management
    - Make executable: `chmod +x run-tests.sh`

## Documentation

11. **[PERFORMANCE_REPORT_TEMPLATE.md](PERFORMANCE_REPORT_TEMPLATE.md)** - Report template
    - Executive summary format
    - Metrics tracking
    - Bottleneck analysis
    - Recommendations structure

12. **[SAMPLE_BASELINE_OUTPUT.md](SAMPLE_BASELINE_OUTPUT.md)** - Example output
    - What successful test looks like
    - How to read metrics
    - Understanding thresholds

13. **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Setup summary
    - All created files
    - File structure
    - Quick commands

## CI/CD

14. **[../.github/workflows/load-test.yml](../.github/workflows/load-test.yml)** - GitHub Actions
    - Automated testing
    - Manual triggers
    - Result artifacts

## Results

15. **[results/](results/)** - Test results directory
    - JSON outputs (gitignored)
    - Summary files
    - Test logs

## Quick Reference

### Run Tests

```bash
# Interactive menu
./load-tests/run-tests.sh

# Direct execution
k6 run load-tests/baseline.js
k6 run load-tests/mission-flow.js
k6 run load-tests/stress.js

# With custom URL
BASE_URL=https://staging.example.com k6 run load-tests/baseline.js
```

### View Documentation

```bash
# Installation
cat load-tests/INSTALLATION.md

# Quick start
cat load-tests/QUICK_START.md

# Full docs
cat load-tests/README.md

# Sample output
cat load-tests/SAMPLE_BASELINE_OUTPUT.md
```

### File Paths (Absolute)

All files are located under:
```
/home/ubuntu/work/zzik-live/apps/web/load-tests/
```

## File Organization

```
load-tests/
├── INDEX.md                          # This file
├── INSTALLATION.md                   # How to install k6
├── QUICK_START.md                    # Fast getting started
├── README.md                         # Complete documentation
├── SETUP_COMPLETE.md                 # Setup summary
├── SAMPLE_BASELINE_OUTPUT.md         # Example output
├── PERFORMANCE_REPORT_TEMPLATE.md    # Report template
│
├── k6.config.js                      # Central config
├── baseline.js                       # Baseline test
├── mission-flow.js                   # Mission flow test
├── stress.js                         # Stress test
├── run-tests.sh                      # Test runner script
│
├── helpers/
│   ├── jwt-helper.js                 # Auth helpers
│   └── utils.js                      # Utilities
│
├── results/                          # Test results (gitignored)
│   └── .gitkeep
│
└── .gitignore                        # Git ignore rules
```

## Performance Targets Summary

| Metric | Target |
|--------|--------|
| Response Time (p95) | < 500ms |
| Response Time (p99) | < 1000ms |
| Error Rate | < 1% |
| Concurrent Users | 100+ |
| Throughput | 10+ req/s |

## Common Commands

```bash
# Install k6 (macOS)
brew install k6

# Verify installation
k6 version

# Start dev server (required before testing)
npm run dev

# Run baseline test
k6 run load-tests/baseline.js

# Run with output to file
k6 run --out json=results.json load-tests/baseline.js

# Run with custom duration
k6 run --duration 30s load-tests/baseline.js

# Run with custom VUs
k6 run --vus 100 load-tests/baseline.js

# View results
cat load-tests/results/*-summary.json | jq
```

## Support & Resources

- **Local Docs:** Read the files in this directory
- **k6 Official Docs:** https://k6.io/docs/
- **k6 Examples:** https://k6.io/docs/examples/
- **Community Forum:** https://community.k6.io/
- **GitHub Issues:** https://github.com/grafana/k6/issues

## Next Steps

1. Install k6 (see INSTALLATION.md)
2. Read QUICK_START.md
3. Run baseline test
4. Review results
5. Run mission flow test
6. Run stress test
7. Document findings using PERFORMANCE_REPORT_TEMPLATE.md
8. Set up CI/CD with GitHub Actions
9. Create Grafana dashboards

---

**Last Updated:** 2025-11-22
**Version:** 1.0
**Status:** Setup Complete
