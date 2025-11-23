// ZZIK LIVE v4 - OpenTelemetry Instrumentation
// This file is automatically loaded by Next.js when the app starts
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";

/**
 * OpenTelemetry SDK Configuration
 *
 * This sets up:
 * 1. Auto-instrumentation for HTTP, Prisma, and other Node.js libraries
 * 2. Prometheus metrics exporter (available at /api/metrics)
 * 3. Console exporter for development/debugging
 *
 * In production, you can replace the console exporter with:
 * - Jaeger for distributed tracing
 * - Tempo for long-term trace storage
 * - OTLP exporter for sending to any OpenTelemetry collector
 */

// Prometheus exporter configuration
// This makes metrics available for scraping
const prometheusExporter = new PrometheusExporter(
  {
    port: 9464, // Internal port for metrics collection
    endpoint: "/metrics",
  },
  () => {
    console.log(
      `[OpenTelemetry] Prometheus metrics available internally on port 9464`
    );
  }
);

// Create OpenTelemetry SDK instance
const sdk = new NodeSDK({
  // Service identification
  serviceName: "zzik-live-web",

  // Metrics configuration
  metricReader: prometheusExporter,

  // Auto-instrumentation configuration
  // This automatically adds tracing to:
  // - HTTP/HTTPS requests and responses
  // - Prisma database queries
  // - Express/Next.js routes
  // - DNS lookups
  // - Net/Socket operations
  instrumentations: [
    getNodeAutoInstrumentations({
      // HTTP instrumentation
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },

      // File system instrumentation (useful for debugging)
      "@opentelemetry/instrumentation-fs": {
        enabled: process.env.NODE_ENV === "development",
      },

      // Disable instrumentation for certain libraries if needed
      "@opentelemetry/instrumentation-net": {
        enabled: false, // Can be noisy
      },
    }),
  ],
});

// Register function called by Next.js on startup
export async function register() {
  // Only initialize once
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      sdk.start();
      console.log("[OpenTelemetry] SDK started successfully");

      // Graceful shutdown on process termination
      process.on("SIGTERM", async () => {
        try {
          await sdk.shutdown();
          console.log("[OpenTelemetry] SDK shut down successfully");
        } catch (error) {
          console.error("[OpenTelemetry] Error shutting down SDK", error);
        }
      });
    } catch (error) {
      console.error("[OpenTelemetry] Failed to start SDK", error);
    }
  }
}

/**
 * Example: Adding custom spans in your code
 *
 * import { trace } from "@opentelemetry/api";
 *
 * const tracer = trace.getTracer("my-service");
 *
 * async function myFunction() {
 *   const span = tracer.startSpan("myFunction");
 *   try {
 *     // Your code here
 *     span.setAttribute("custom.attribute", "value");
 *   } finally {
 *     span.end();
 *   }
 * }
 *
 * // Or use the convenient wrapper:
 * async function myFunction() {
 *   return tracer.startActiveSpan("myFunction", async (span) => {
 *     try {
 *       // Your code here
 *       return result;
 *     } finally {
 *       span.end();
 *     }
 *   });
 * }
 */
