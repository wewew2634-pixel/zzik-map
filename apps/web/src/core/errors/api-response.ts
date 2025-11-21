// ZZIK LIVE v4 - API Response Envelope

import type { AppErrorCode } from "./app-error";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    code: AppErrorCode;
    message: string;
    traceId?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
