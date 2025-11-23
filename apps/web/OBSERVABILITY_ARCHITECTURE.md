# ZZIK LIVE - Observability Architecture

## Overview

This document describes the production observability implementation for ZZIK LIVE, including metrics, logging, and distributed tracing.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        ZZIK LIVE Application                      │
│                                                                   │
│  ┌─────────────────┐      ┌──────────────────┐                  │
│  │  Business Logic │      │  API Endpoints   │                  │
│  │  (Services)     │──────│  /api/*          │                  │
│  └────────┬────────┘      └─────────┬────────┘                  │
│           │                          │                           │
│           │  ┌───────────────────────▼────────────────────┐     │
│           │  │      Observability Layer                   │     │
│           │  │  ┌──────────┐  ┌────────┐  ┌──────────┐  │     │
│           └──┤  │ Metrics  │  │ Logger │  │ Tracing  │  │     │
│              │  └────┬─────┘  └───┬────┘  └────┬─────┘  │     │
│              └───────┼────────────┼────────────┼────────┘     │
│                      │            │            │               │
└──────────────────────┼────────────┼────────────┼───────────────┘
                       │            │            │
                       │            │            │
           ┌───────────▼────┐  ┌───▼────┐  ┌────▼─────┐
           │  OpenTelemetry │  │ JSON   │  │  Trace   │
           │  Metrics SDK   │  │ Logs   │  │  Context │
           └───────┬────────┘  └───┬────┘  └────┬─────┘
                   │               │            │
       ┌───────────▼───────────────▼────────────▼──────────┐
       │         OpenTelemetry SDK (instrumentation.ts)    │
       │  - Auto-instrumentation (HTTP, Prisma)            │
       │  - Service identification                          │
       │  - Trace correlation                               │
       └───────┬──────────────────┬──────────────┬─────────┘
               │                  │              │
               │                  │              │
    ┌──────────▼──────┐   ┌──────▼──────┐   ┌──▼─────────┐
    │  Prometheus     │   │   Console   │   │  Jaeger/   │
    │  Exporter       │   │   Output    │   │  Tempo     │
    │  :9464/metrics  │   │   (stdout)  │   │  (Future)  │
    └──────────┬──────┘   └─────────────┘   └────────────┘
               │
               │
    ┌──────────▼──────────┐
    │  GET /api/metrics   │
    │  (Public endpoint)  │
    └─────────────────────┘
               │
               │ HTTP GET (scrape)
               │
    ┌──────────▼──────────┐
    │    Prometheus       │
    │    Server           │
    └─────────────────────┘
               │
               │
    ┌──────────▼──────────┐
    │     Grafana         │
    │  (Visualization)    │
    └─────────────────────┘
```

## Components

### 1. Metrics (`src/core/observability/metrics.ts`)

**Purpose**: Track application performance and business metrics

**Implementation**:
- Uses OpenTelemetry Metrics API
- Prometheus-compatible exposition format
- Non-blocking, async collection

**Available Metrics**:

#### Mission Run Metrics
```typescript
// Counter: Total mission runs started
mission_run_started_total{status="pending_gps"} 42

// Counter: Mission runs completed by status
mission_run_completed_total{status="approved"} 35
mission_run_completed_total{status="rejected"} 5
mission_run_completed_total{status="expired"} 2

// Histogram: Mission run duration
mission_run_duration_seconds_bucket{le="1"} 10
mission_run_duration_seconds_bucket{le="5"} 25
mission_run_duration_seconds_bucket{le="10"} 32
mission_run_duration_seconds_count 35
mission_run_duration_seconds_sum 156.7
```

#### Wallet Metrics
```typescript
// Counter: Wallet transactions by type
wallet_transactions_total{type="mission_reward"} 50
wallet_transactions_total{type="withdrawal"} 10

// Gauge: Current wallet balance
wallet_balance{user_id="user123"} 1500
```

#### API Metrics
```typescript
// Histogram: HTTP request duration
http_request_duration_seconds{path="/api/missions",method="GET",status_code="200"} 0.150
```

**Usage Example**:
```typescript
import { metrics } from "@/core/observability/metrics";

// In your service code
metrics.incMissionRunStarted();

const startTime = Date.now();
// ... process mission run ...
const duration = Date.now() - startTime;
metrics.observeMissionRunDuration(duration);
```

### 2. Logger (`src/core/observability/logger.ts`)

**Purpose**: Structured JSON logging with trace correlation

**Features**:
- Automatic trace_id injection from OpenTelemetry context
- Structured JSON output for log aggregation
- Configurable log levels (debug, info, warn, error)
- Contextual metadata support

**Log Format**:
```json
{
  "timestamp": "2025-11-22T10:30:45.123Z",
  "level": "info",
  "message": "mission_run.approve.success",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "userId": "user123",
  "missionId": "mission456",
  "durationMs": 1234,
  "meta": {
    "rewardAmount": 100
  }
}
```

**Usage Example**:
```typescript
import { logger } from "@/core/observability/logger";

logger.info(
  { userId: "123", missionId: "456" },
  "mission_run.start.success"
);

logger.error(
  { userId: "123" },
  "database_query_failed",
  { error: err.message }
);
```

**Environment Variables**:
```bash
LOG_LEVEL=debug  # Options: debug, info, warn, error (default: info)
```

### 3. Tracing (`src/instrumentation.ts`)

**Purpose**: Distributed tracing for request flow analysis

**Features**:
- Auto-instrumentation for HTTP, Prisma, Next.js routes
- Trace context propagation across services
- Custom span creation support
- Integration with Jaeger/Tempo (future)

**Auto-Instrumented Components**:
- HTTP/HTTPS requests and responses
- Prisma database queries
- Next.js API routes
- DNS lookups

**Custom Span Example**:
```typescript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("my-service");

async function processPayment() {
  return tracer.startActiveSpan("processPayment", async (span) => {
    try {
      span.setAttribute("payment.amount", 100);
      span.setAttribute("payment.currency", "USD");

      // Your code here
      const result = await chargeCard();

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### 4. Metrics Endpoint (`src/app/api/metrics/route.ts`)

**Purpose**: Expose metrics for Prometheus scraping

**Endpoint**: `GET /api/metrics`

**Response Format**: Prometheus exposition format (text/plain)

**Sample Output**:
```
# HELP mission_run_started_total Total number of mission runs started
# TYPE mission_run_started_total counter
mission_run_started_total{status="pending_gps"} 42

# HELP mission_run_duration_seconds Duration of mission runs in seconds
# TYPE mission_run_duration_seconds histogram
mission_run_duration_seconds_bucket{le="0.1"} 0
mission_run_duration_seconds_bucket{le="1"} 10
mission_run_duration_seconds_bucket{le="5"} 25
mission_run_duration_seconds_sum 156.7
mission_run_duration_seconds_count 35

# HELP nodejs_heap_size_total_bytes Total heap size
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes 45678912

# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds counter
nodejs_process_uptime_seconds 3600
```

**Prometheus Scrape Configuration**:
```yaml
scrape_configs:
  - job_name: 'zzik-live-web'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

## Integration Points

### Mission Service Integration

The mission service automatically tracks metrics at key points:

**1. Mission Run Started**:
```typescript
// In startMissionRun()
metrics.incMissionRunStarted();
```

**2. Mission Run Approved**:
```typescript
// In approveMissionRunAndReward()
const duration = Date.now() - run.createdAt.getTime();
metrics.incMissionRunApproved();
metrics.observeMissionRunDuration(duration);
metrics.incWalletTransaction("mission_reward");
```

### Trace Correlation

All logs automatically include `trace_id` from the active OpenTelemetry span:

```typescript
// No manual trace management needed - automatic!
logger.info({ userId }, "mission_started");
// Output: {"timestamp":"...","trace_id":"4bf92f...","userId":"123",...}
```

This enables:
- Correlating logs with distributed traces
- Following request flow across services
- Debugging production issues

## Production Deployment

### 1. Environment Setup

```bash
# Set log level
LOG_LEVEL=info

# Optional: Configure OTLP exporter for Jaeger/Tempo
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318
```

### 2. Prometheus Setup

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'zzik-live-web'
    static_configs:
      - targets: ['web-app:3000']
    metrics_path: '/api/metrics'
```

### 3. Grafana Dashboards

**Recommended Panels**:
- Mission run success rate
- Mission run duration (p50, p95, p99)
- Wallet transaction volume
- API response times
- Process memory/CPU usage

**Sample Queries**:
```promql
# Mission run success rate
rate(mission_run_completed_total{status="approved"}[5m])
/
rate(mission_run_started_total[5m])

# 95th percentile mission duration
histogram_quantile(0.95, mission_run_duration_seconds_bucket)

# Wallet transaction rate
rate(wallet_transactions_total[5m])
```

### 4. Alerting Rules

```yaml
# alerts.yml
groups:
  - name: zzik_live_alerts
    rules:
      - alert: HighMissionFailureRate
        expr: |
          rate(mission_run_completed_total{status="rejected"}[5m])
          /
          rate(mission_run_started_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High mission run failure rate"

      - alert: SlowMissionProcessing
        expr: |
          histogram_quantile(0.95, mission_run_duration_seconds_bucket) > 10
        for: 5m
        annotations:
          summary: "Mission runs taking too long"
```

## Monitoring Best Practices

1. **Metrics Collection**:
   - Always use non-blocking metric recording
   - Avoid high-cardinality labels (e.g., user IDs in labels)
   - Use consistent naming conventions

2. **Logging**:
   - Log at appropriate levels (error for actual errors, info for normal flow)
   - Include contextual information (userId, missionId, etc.)
   - Use structured logging (JSON) for parsing

3. **Tracing**:
   - Add custom spans for critical business operations
   - Include relevant attributes for debugging
   - Keep span names concise and consistent

4. **Performance**:
   - Metrics are async and non-blocking
   - Logging overhead is minimal with proper log levels
   - Tracing adds <1ms overhead per span

## Future Enhancements

1. **Jaeger/Tempo Integration**:
   - Distributed trace visualization
   - Long-term trace storage
   - Service dependency mapping

2. **Custom Metrics**:
   - Business KPIs (DAU, revenue)
   - Feature usage tracking
   - Error rate by endpoint

3. **Advanced Alerting**:
   - Anomaly detection
   - SLO-based alerting
   - On-call integration (PagerDuty, etc.)

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Exposition Format](https://prometheus.io/docs/instrumenting/exposition_formats/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
