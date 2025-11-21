// ZZIK LIVE v4 - API Handler Wrapper

import { NextResponse } from "next/server";
import { AppError, toAppError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";
import type { ApiResponse } from "@/core/errors/api-response";

type Handler<T> = () => Promise<T>;

export async function handleApi<T>(
  handler: Handler<T>,
): Promise<NextResponse<ApiResponse<T>>> {
  const traceId = crypto.randomUUID();

  try {
    const data = await handler();
    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (err) {
    const appError: AppError = toAppError(err);

    logger.error(
      { traceId, code: appError.code },
      "API error",
      { error: err },
    );

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
      { status: appError.httpStatus },
    );
  }
}
