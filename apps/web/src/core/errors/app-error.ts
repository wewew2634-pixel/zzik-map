// ZZIK LIVE v4 - Application Error Model

export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "PLACE_NOT_FOUND"
  | "MISSION_NOT_FOUND"
  | "MISSION_INACTIVE"
  | "MISSION_LIMIT_REACHED"
  | "MISSION_RUN_NOT_FOUND"
  | "MISSION_RUN_INVALID_STATE"
  | "MISSION_RUN_ALREADY_COMPLETED"
  | "USER_NOT_FOUND"
  | "WALLET_NOT_FOUND"
  | "WALLET_INSUFFICIENT_FUNDS"
  | "WALLET_CONFLICT"
  | "WALLET_VERSION_CONFLICT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  code: AppErrorCode;
  httpStatus: number;
  details?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    httpStatus: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

// Helper functions for common errors

export function validationError(message: string, details?: unknown) {
  return new AppError("VALIDATION_ERROR", message, 400, details);
}

export function authRequired(message: string = "Authentication required") {
  return new AppError("AUTH_REQUIRED", message, 401);
}

export function permissionDenied(message: string = "Permission denied") {
  return new AppError("PERMISSION_DENIED", message, 403);
}

export function notFound(message: string) {
  return new AppError("MISSION_NOT_FOUND", message, 404);
}

export function conflictError(code: AppErrorCode, message: string) {
  return new AppError(code, message, 409);
}

export function internalError(err: unknown) {
  return new AppError(
    "INTERNAL_ERROR",
    "Unexpected server error",
    500,
    err,
  );
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  // Prisma unique constraint violation
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "P2002"
  ) {
    return new AppError(
      "VALIDATION_ERROR",
      "Unique constraint violation",
      400,
      err,
    );
  }

  // Prisma record not found
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "P2025"
  ) {
    return new AppError(
      "MISSION_NOT_FOUND",
      "Record not found",
      404,
      err,
    );
  }

  return internalError(err);
}
