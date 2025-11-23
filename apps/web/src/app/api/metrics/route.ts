// ZZIK LIVE v4 - GET /api/metrics
// @public-endpoint - Prometheus scraping endpoint
// Security: Should be protected at network/firewall level, not application level

import { metrics as otelMetrics } from "@opentelemetry/api";
import { logger } from "@/core/observability/logger";

/**
 * Metrics Endpoint
 *
 * Returns Prometheus-formatted metrics including:
 * - Mission run metrics (started, completed, duration)
 * - Wallet transaction metrics
 * - API request metrics
 * - Node.js process metrics (memory, CPU, event loop)
 *
 * This endpoint is typically scraped by Prometheus at regular intervals.
 *
 * Example response:
 * ```
 * # HELP mission_run_started_total Total number of mission runs started
 * # TYPE mission_run_started_total counter
 * mission_run_started_total{status="pending_gps"} 42
 *
 * # HELP mission_run_completed_total Total number of mission runs completed by status
 * # TYPE mission_run_completed_total counter
 * mission_run_completed_total{status="approved"} 35
 * mission_run_completed_total{status="rejected"} 5
 *
 * # HELP mission_run_duration_seconds Duration of mission runs in seconds
 * # TYPE mission_run_duration_seconds histogram
 * mission_run_duration_seconds_bucket{le="0.1"} 0
 * mission_run_duration_seconds_bucket{le="1"} 10
 * mission_run_duration_seconds_bucket{le="5"} 25
 * mission_run_duration_seconds_bucket{le="10"} 32
 * mission_run_duration_seconds_bucket{le="+Inf"} 35
 * mission_run_duration_seconds_sum 156.7
 * mission_run_duration_seconds_count 35
 *
 * # HELP nodejs_heap_size_total_bytes Total heap size
 * # TYPE nodejs_heap_size_total_bytes gauge
 * nodejs_heap_size_total_bytes 45678912
 * ```
 */

/**
 * GET /api/metrics
 *
 * Returns all collected metrics in Prometheus exposition format
 *
 * Note: The OpenTelemetry SDK already starts a Prometheus server on port 9464.
 * This endpoint proxies to that internal server, or you can directly scrape
 * http://localhost:9464/metrics in production.
 */
export async function GET() {
  try {
    // Fetch metrics from internal Prometheus server
    const response = await fetch("http://localhost:9464/metrics");

    if (!response.ok) {
      throw new Error(`Metrics server returned ${response.status}`);
    }

    const metricsText = await response.text();

    // Add process metrics (Node.js runtime information)
    const processMetrics = collectProcessMetrics();

    // Combine all metrics
    const fullMetrics = `${metricsText}\n${processMetrics}`;

    return new Response(fullMetrics, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        // Disable caching for metrics
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    logger.error({}, "Error collecting metrics", { error });

    // Fallback: return just process metrics if Prometheus server is not available
    const processMetrics = collectProcessMetrics();
    return new Response(processMetrics, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }
}

/**
 * Collect Node.js process metrics
 * These are standard metrics that Prometheus expects from Node.js apps
 */
function collectProcessMetrics(): string {
  const metrics: string[] = [];

  // Memory metrics
  const memUsage = process.memoryUsage();
  metrics.push("# HELP nodejs_heap_size_total_bytes Total heap size");
  metrics.push("# TYPE nodejs_heap_size_total_bytes gauge");
  metrics.push(`nodejs_heap_size_total_bytes ${memUsage.heapTotal}`);

  metrics.push("# HELP nodejs_heap_size_used_bytes Used heap size");
  metrics.push("# TYPE nodejs_heap_size_used_bytes gauge");
  metrics.push(`nodejs_heap_size_used_bytes ${memUsage.heapUsed}`);

  metrics.push("# HELP nodejs_external_memory_bytes External memory");
  metrics.push("# TYPE nodejs_external_memory_bytes gauge");
  metrics.push(`nodejs_external_memory_bytes ${memUsage.external}`);

  metrics.push("# HELP nodejs_heap_space_rss_bytes Resident set size");
  metrics.push("# TYPE nodejs_heap_space_rss_bytes gauge");
  metrics.push(`nodejs_heap_space_rss_bytes ${memUsage.rss}`);

  // Process uptime
  metrics.push("# HELP nodejs_process_uptime_seconds Process uptime in seconds");
  metrics.push("# TYPE nodejs_process_uptime_seconds counter");
  metrics.push(`nodejs_process_uptime_seconds ${process.uptime()}`);

  // CPU usage (if available)
  try {
    const cpuUsage = process.cpuUsage();
    metrics.push("# HELP nodejs_process_cpu_user_seconds_total User CPU time");
    metrics.push("# TYPE nodejs_process_cpu_user_seconds_total counter");
    metrics.push(`nodejs_process_cpu_user_seconds_total ${cpuUsage.user / 1000000}`);

    metrics.push("# HELP nodejs_process_cpu_system_seconds_total System CPU time");
    metrics.push("# TYPE nodejs_process_cpu_system_seconds_total counter");
    metrics.push(`nodejs_process_cpu_system_seconds_total ${cpuUsage.system / 1000000}`);
  } catch {
    // CPU usage might not be available on all platforms
  }

  // Event loop lag (approximate - based on setTimeout delay)
  metrics.push("# HELP nodejs_eventloop_lag_seconds Event loop lag");
  metrics.push("# TYPE nodejs_eventloop_lag_seconds gauge");
  const start = Date.now();
  setImmediate(() => {
    const lag = (Date.now() - start) / 1000;
    metrics.push(`nodejs_eventloop_lag_seconds ${lag}`);
  });

  return metrics.join("\n");
}

/**
 * Example Prometheus scrape configuration:
 *
 * ```yaml
 * scrape_configs:
 *   - job_name: 'zzik-live-web'
 *     scrape_interval: 15s
 *     static_configs:
 *       - targets: ['localhost:3000']
 *     metrics_path: '/api/metrics'
 * ```
 */
