# k6 Load Testing - Quick Start Guide

## Installation (One-time setup)

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

Verify: `k6 version`

## Running Tests

### 1. Start Your Server

```bash
cd apps/web
npm run dev
```

Server should be running on `http://localhost:3000`

### 2. Run Tests

**Baseline Test** (4 minutes, 50 users):
```bash
k6 run load-tests/baseline.js
```

**Mission Flow Test** (8 minutes, 100 users):
```bash
k6 run load-tests/mission-flow.js
```

**Stress Test** (13 minutes, up to 500 users):
```bash
k6 run load-tests/stress.js
```

## Understanding Results

### Look for these key indicators:

```
✓ http_req_duration.......: p(95)=245ms    # 95% of requests under 245ms
✓ http_req_failed.........: 0.12%          # 0.12% error rate
✓ http_reqs...............: 2450           # Total requests
```

### Pass/Fail:

- ✓ = Test passed
- ✗ = Test failed

### What to check:

1. **Response Time (p95):** Should be < 500ms for most endpoints
2. **Error Rate:** Should be < 1%
3. **All Thresholds:** Should show ✓

## Quick Troubleshooting

**"Server not ready"**
- Make sure `npm run dev` is running
- Check `http://localhost:3000/api/health`

**High error rate**
- Reduce concurrent users
- Check server logs
- Verify database is running

**Slow responses**
- Check database performance
- Monitor server resources
- Review slow queries

## Next Steps

For detailed documentation, see:
- [Full Documentation](README.md)
- [Performance Report Template](PERFORMANCE_REPORT_TEMPLATE.md)
- [k6 Documentation](https://k6.io/docs/)
