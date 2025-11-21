// ZZIK LIVE v4 - Logger Implementation

import type { LogContext, LogLevel } from "./types";

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) ?? "info";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

function formatLog(level: LogLevel, ctx: LogContext, msg: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message: msg,
    ...ctx,
    ...(meta && { meta }),
  };
  return JSON.stringify(logData);
}

export const logger = {
  debug(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("debug")) return;
    console.debug(formatLog("debug", ctx, msg, meta));
  },

  info(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("info")) return;
    console.info(formatLog("info", ctx, msg, meta));
  },

  warn(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("warn")) return;
    console.warn(formatLog("warn", ctx, msg, meta));
  },

  error(ctx: LogContext, msg: string, meta?: unknown) {
    if (!shouldLog("error")) return;
    console.error(formatLog("error", ctx, msg, meta));
  },
};
