/**
 * ZZIK MAP - Production Logger
 * V2: Structured logging with context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  route?: string;
  method?: string;
  userId?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDev = process.env.NODE_ENV === 'development';

function formatLog(entry: LogEntry): string {
  if (isDev) {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[entry.level];

    let output = `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`;

    if (entry.context) {
      output += ` | ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      output += `\n   Error: ${entry.error.message}`;
      if (entry.error.stack && entry.level === 'error') {
        output += `\n   ${entry.error.stack}`;
      }
    }

    return output;
  }

  // Production: JSON format for log aggregation
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: isDev ? error.stack : undefined,
    };
  }

  const formatted = formatLog(entry);

  switch (level) {
    case 'debug':
      if (isDev) console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext, error?: Error) => log('warn', message, context, error),
  error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),

  // API route helper
  api: (route: string, method: string) => ({
    debug: (message: string, ctx?: Omit<LogContext, 'route' | 'method'>) =>
      log('debug', message, { route, method, ...ctx }),
    info: (message: string, ctx?: Omit<LogContext, 'route' | 'method'>) =>
      log('info', message, { route, method, ...ctx }),
    warn: (message: string, ctx?: Omit<LogContext, 'route' | 'method'>, error?: Error) =>
      log('warn', message, { route, method, ...ctx }, error),
    error: (message: string, ctx?: Omit<LogContext, 'route' | 'method'>, error?: Error) =>
      log('error', message, { route, method, ...ctx }, error),
  }),

  // Performance timing helper
  time: (label: string) => {
    const start = performance.now();
    return {
      end: (context?: LogContext) => {
        const duration = Math.round(performance.now() - start);
        log('info', `${label} completed`, { ...context, duration });
        return duration;
      },
    };
  },
};

export type Logger = typeof logger;
