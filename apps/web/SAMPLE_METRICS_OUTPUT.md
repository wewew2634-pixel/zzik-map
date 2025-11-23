# Sample Metrics Output

This document shows example output from the `/api/metrics` endpoint.

## Endpoint Information

- **URL**: `GET /api/metrics`
- **Content-Type**: `text/plain; version=0.0.4; charset=utf-8`
- **Update Frequency**: Real-time (scraped by Prometheus every 15s typically)

## Sample Response

```
# HELP mission_run_started_total Total number of mission runs started
# TYPE mission_run_started_total counter
mission_run_started_total{status="pending_gps"} 42

# HELP mission_run_completed_total Total number of mission runs completed by status
# TYPE mission_run_completed_total counter
mission_run_completed_total{status="approved"} 35
mission_run_completed_total{status="rejected"} 5
mission_run_completed_total{status="expired"} 2

# HELP mission_run_duration_seconds Duration of mission runs in seconds
# TYPE mission_run_duration_seconds histogram
mission_run_duration_seconds_bucket{le="0.1"} 0
mission_run_duration_seconds_bucket{le="0.5"} 5
mission_run_duration_seconds_bucket{le="1"} 10
mission_run_duration_seconds_bucket{le="2"} 18
mission_run_duration_seconds_bucket{le="5"} 25
mission_run_duration_seconds_bucket{le="10"} 32
mission_run_duration_seconds_bucket{le="30"} 34
mission_run_duration_seconds_bucket{le="60"} 35
mission_run_duration_seconds_bucket{le="+Inf"} 35
mission_run_duration_seconds_sum 156.7
mission_run_duration_seconds_count 35

# HELP wallet_transactions_total Total number of wallet transactions by type
# TYPE wallet_transactions_total counter
wallet_transactions_total{type="mission_reward"} 50
wallet_transactions_total{type="withdrawal"} 10
wallet_transactions_total{type="deposit"} 5

# HELP wallet_balance Current wallet balance by user
# TYPE wallet_balance gauge
wallet_balance{user_id="user_001"} 1500
wallet_balance{user_id="user_002"} 2300
wallet_balance{user_id="user_003"} 450

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{path="/api/missions",method="GET",status_code="200",le="0.005"} 10
http_request_duration_seconds_bucket{path="/api/missions",method="GET",status_code="200",le="0.01"} 25
http_request_duration_seconds_bucket{path="/api/missions",method="GET",status_code="200",le="0.025"} 50
http_request_duration_seconds_bucket{path="/api/missions",method="GET",status_code="200",le="0.05"} 75
http_request_duration_seconds_bucket{path="/api/missions",method="GET",status_code="200",le="0.1"} 90
http_request_duration_seconds_bucket{path="/api/missions",method="GET",status_code="200",le="+Inf"} 100
http_request_duration_seconds_sum{path="/api/missions",method="GET",status_code="200"} 2.5
http_request_duration_seconds_count{path="/api/missions",method="GET",status_code="200"} 100

# HELP nodejs_heap_size_total_bytes Total heap size
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes 45678912

# HELP nodejs_heap_size_used_bytes Used heap size
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes 23456789

# HELP nodejs_external_memory_bytes External memory
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes 1234567

# HELP nodejs_heap_space_rss_bytes Resident set size
# TYPE nodejs_heap_space_rss_bytes gauge
nodejs_heap_space_rss_bytes 98765432

# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds counter
nodejs_process_uptime_seconds 3600.5

# HELP nodejs_process_cpu_user_seconds_total User CPU time
# TYPE nodejs_process_cpu_user_seconds_total counter
nodejs_process_cpu_user_seconds_total 45.2

# HELP nodejs_process_cpu_system_seconds_total System CPU time
# TYPE nodejs_process_cpu_system_seconds_total counter
nodejs_process_cpu_system_seconds_total 12.8

# HELP nodejs_eventloop_lag_seconds Event loop lag
# TYPE nodejs_eventloop_lag_seconds gauge
nodejs_eventloop_lag_seconds 0.001
```

## Metric Types Explained

### Counter
A cumulative metric that only increases (or resets to zero on restart).

**Examples**:
- `mission_run_started_total`: Total number of mission runs started since server start
- `wallet_transactions_total`: Total number of wallet transactions

**Usage in PromQL**:
```promql
# Rate of mission starts per second over last 5 minutes
rate(mission_run_started_total[5m])
```

### Gauge
A metric that can go up or down.

**Examples**:
- `wallet_balance`: Current wallet balance
- `nodejs_heap_size_used_bytes`: Current heap usage

**Usage in PromQL**:
```promql
# Average wallet balance
avg(wallet_balance)

# Total memory usage across all instances
sum(nodejs_heap_size_used_bytes)
```

### Histogram
A metric that samples observations and counts them in configurable buckets.

**Examples**:
- `mission_run_duration_seconds`: Distribution of mission run durations
- `http_request_duration_seconds`: Distribution of API response times

**Buckets**:
- `le="0.1"`: Count of observations ≤ 0.1 seconds
- `le="1"`: Count of observations ≤ 1 second
- `le="+Inf"`: Count of all observations

**Additional Metrics**:
- `_sum`: Sum of all observed values
- `_count`: Total number of observations

**Usage in PromQL**:
```promql
# 95th percentile mission duration
histogram_quantile(0.95, mission_run_duration_seconds_bucket)

# Average mission duration
rate(mission_run_duration_seconds_sum[5m]) / rate(mission_run_duration_seconds_count[5m])
```

## Common Queries

### Mission Run Metrics

**Success Rate**:
```promql
rate(mission_run_completed_total{status="approved"}[5m])
/
rate(mission_run_started_total[5m])
```

**P50, P95, P99 Duration**:
```promql
histogram_quantile(0.50, rate(mission_run_duration_seconds_bucket[5m]))
histogram_quantile(0.95, rate(mission_run_duration_seconds_bucket[5m]))
histogram_quantile(0.99, rate(mission_run_duration_seconds_bucket[5m]))
```

**Failure Rate**:
```promql
rate(mission_run_completed_total{status="rejected"}[5m])
```

### Wallet Metrics

**Transaction Volume**:
```promql
rate(wallet_transactions_total[5m])
```

**Total Balance**:
```promql
sum(wallet_balance)
```

**Average Balance**:
```promql
avg(wallet_balance)
```

### API Performance

**Request Rate**:
```promql
sum(rate(http_request_duration_seconds_count[5m])) by (path)
```

**Response Time (P95)**:
```promql
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, path)
)
```

**Error Rate**:
```promql
sum(rate(http_request_duration_seconds_count{status_code=~"5.."}[5m]))
/
sum(rate(http_request_duration_seconds_count[5m]))
```

### System Health

**Memory Usage**:
```promql
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes
```

**CPU Usage**:
```promql
rate(nodejs_process_cpu_user_seconds_total[5m]) +
rate(nodejs_process_cpu_system_seconds_total[5m])
```

**Event Loop Lag**:
```promql
nodejs_eventloop_lag_seconds > 0.1
```

## Testing Locally

### 1. Start the application
```bash
pnpm dev
```

### 2. Access metrics endpoint
```bash
curl http://localhost:3000/api/metrics
```

### 3. Trigger some metrics
```bash
# Start a mission run
curl -X POST http://localhost:3000/api/missions/[id]/runs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check metrics again
curl http://localhost:3000/api/metrics | grep mission_run
```

### 4. View formatted output
```bash
# Pretty print with grep
curl -s http://localhost:3000/api/metrics | grep -E "(HELP|TYPE|mission_run)"
```

## Integration with Grafana

### Creating a Dashboard

1. Add Prometheus as a data source in Grafana
2. Create a new dashboard
3. Add panels with PromQL queries

**Example Panel: Mission Success Rate**:
```json
{
  "title": "Mission Run Success Rate",
  "targets": [
    {
      "expr": "rate(mission_run_completed_total{status=\"approved\"}[5m]) / rate(mission_run_started_total[5m])",
      "legendFormat": "Success Rate"
    }
  ],
  "yAxis": {
    "format": "percentunit"
  }
}
```

**Example Panel: Mission Duration**:
```json
{
  "title": "Mission Run Duration (Percentiles)",
  "targets": [
    {
      "expr": "histogram_quantile(0.50, rate(mission_run_duration_seconds_bucket[5m]))",
      "legendFormat": "p50"
    },
    {
      "expr": "histogram_quantile(0.95, rate(mission_run_duration_seconds_bucket[5m]))",
      "legendFormat": "p95"
    },
    {
      "expr": "histogram_quantile(0.99, rate(mission_run_duration_seconds_bucket[5m]))",
      "legendFormat": "p99"
    }
  ],
  "yAxis": {
    "format": "s"
  }
}
```

## Notes

- All metrics reset to 0 when the application restarts
- Prometheus scraping should happen every 15-60 seconds
- Metrics are non-blocking and have minimal performance impact
- The `/api/metrics` endpoint is public - consider adding authentication in production
