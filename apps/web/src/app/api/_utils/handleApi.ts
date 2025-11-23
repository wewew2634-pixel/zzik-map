// ZZIK LIVE v4 - API Handler Wrapper

import { NextResponse } from "next/server";
import { AppError, toAppError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";
import { captureError } from "@/core/observability/error-tracking";
import type { ApiResponse } from "@/core/errors/api-response";

type Handler<T> = () => Promise<T>;

export type ApiHandlerOptions = {
  headers?: Headers;
};

export async function handleApi<T>(
  handler: Handler<T>,
  options?: ApiHandlerOptions,
): Promise<NextResponse<ApiResponse<T>>> {
  const traceId = crypto.randomUUID();

  try {
    const data = await handler();
    return NextResponse.json(
      {
        ok: true,
        data,
      },
      { headers: options?.headers },
    );
  } catch (err) {
    const appError: AppError = toAppError(err);

    // Log to application logger
    logger.error(
      { traceId, code: appError.code },
      "API error",
      { error: err },
    );

    // Capture error in Sentry (only for server errors, not client errors)
    if (appError.httpStatus >= 500 && err instanceof Error) {
      captureError(err, {
        traceId,
        errorCode: appError.code,
        httpStatus: appError.httpStatus,
        details: appError.details,
      });
    }

    // Add Retry-After header for rate limit errors
    const headers = options?.headers || new Headers();
    if (appError.code === "RATE_LIMIT_EXCEEDED" && appError.details) {
      const details = appError.details as { retryAfter?: number };
      if (details.retryAfter) {
        headers.set("Retry-After", details.retryAfter.toString());
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: appError.code,
          message: appError.message,
          traceId,
          ...(process.env.NODE_ENV === "development" && { details: appError.details }),
        },
      },
      { status: appError.httpStatus, headers },
    );
  }
}
