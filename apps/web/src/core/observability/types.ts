// ZZIK LIVE v4 - Observability Types

export type LogContext = {
  traceId?: string;
  userId?: string;
  missionId?: string;
  missionRunId?: string;
  walletId?: string;
  [key: string]: unknown;
};

export type LogLevel = "debug" | "info" | "warn" | "error";
