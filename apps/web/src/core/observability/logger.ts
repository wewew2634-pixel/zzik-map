// ZZIK LIVE v4 - Logger Implementation
// Structured JSON logging with OpenTelemetry trace correlation

import type { LogContext, LogLevel } from "./types";
import { trace, context } from "@opentelemetry/api";

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) ?? "info";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get current trace ID from OpenTelemetry context
 * This allows correlating logs with distributed traces
 */
function getCurrentTraceId(): string | undefined {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    return spanContext.traceId;
  }
  return undefined;
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

/**
 * Format log entry as structured JSON
 * Automatically adds trace_id from OpenTelemetry context if available
 *
 * Example output:
 * {
 *   "timestamp": "2025-11-22T10:30:45.123Z",
 *   "level": "info",
 *   "message": "mission_run.start.success",
 *   "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
 *   "span_id": "00f067aa0ba902b7",
 *   "userId": "user123",
 *   "missionId": "mission456",
 *   "meta": { ... }
 * }
 */
function formatLog(level: LogLevel, ctx: LogContext, msg: string, meta?: unknown) {
  const timestamp = new Date().toISOString();

  // Get trace information from OpenTelemetry
  const traceId = getCurrentTraceId();
  const activeSpan = trace.getActiveSpan();
  const spanId = activeSpan?.spanContext().spanId;

  const logData: Record<string, unknown> = {
    timestamp,
    level,
    message: msg,
    // Add trace_id from OpenTelemetry context (takes precedence over manual trace_id)
    ...(traceId && { trace_id: traceId }),
    ...(spanId && { span_id: spanId }),
    // Add all context fields
    ...ctx,
  };

  // Add meta object if provided
  if (meta !== undefined) {
    logData.meta = meta;
  }

  return JSON.stringify(logData);
}

/**
 * Structured logger with trace correlation
 *
 * All logs are output as JSON for easy parsing by log aggregation systems.
 * Trace IDs are automatically added from OpenTelemetry context.
 *
 * Example usage:
 *   logger.info({ userId: "123", missionId: "456" }, "Mission started");
 *   // Output: {"timestamp":"...","level":"info","message":"Mission started","trace_id":"...","userId":"123","missionId":"456"}
 *
 *   logger.error({ userId: "123" }, "Database error", { error: err.message });
 *   // Output: {"timestamp":"...","level":"error","message":"Database error","trace_id":"...","userId":"123","meta":{"error":"..."}}
 */
export const logger = {
  /**
   * Debug level logging
   * Use for detailed diagnostic information
   */
  debug(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("debug")) return;
    console.debug(formatLog("debug", ctx, msg, meta));
  },

  /**
   * Info level logging
   * Use for general informational messages
   */
  info(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("info")) return;
    console.info(formatLog("info", ctx, msg, meta));
  },

  /**
   * Warning level logging
   * Use for potentially harmful situations
   */
  warn(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("warn")) return;
    console.warn(formatLog("warn", ctx, msg, meta));
  },

  /**
   * Error level logging
   * Use for error events
   */
  error(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("error")) return;
    console.error(formatLog("error", ctx, msg, meta));
  },
};
