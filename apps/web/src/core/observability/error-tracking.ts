// ZZIK LIVE v4 - Error Tracking Utilities

import * as Sentry from "@sentry/nextjs";

/**
 * Capture an exception with optional context
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with severity level
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info"
) {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(userId: string, userData?: Record<string, unknown>) {
  Sentry.setUser({
    id: userId,
    ...userData,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Set tags for filtering errors
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Set multiple tags at once
 */
export function setTags(tags: Record<string, string>) {
  Sentry.setTags(tags);
}

/**
 * Set context for additional error information
 */
export function setContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context);
}

/**
 * Start a new span for performance monitoring
 * @deprecated Use Sentry.startSpan instead for better performance tracking
 */
export function startSpan<T>(
  context: { name: string; op: string },
  callback: () => T
): T {
  return Sentry.startSpan(context, callback);
}

/**
 * Capture error with mission context
 */
export function captureMissionError(
  error: Error,
  missionId: string,
  userId?: string,
  additionalContext?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setTag("missionId", missionId);
    if (userId) {
      scope.setTag("userId", userId);
    }
    scope.setContext("mission", {
      missionId,
      userId,
      ...additionalContext,
    });
    Sentry.captureException(error);
  });
}

/**
 * Capture error with mission run context
 */
export function captureMissionRunError(
  error: Error,
  missionRunId: string,
  missionId: string,
  userId?: string,
  additionalContext?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setTag("missionRunId", missionRunId);
    scope.setTag("missionId", missionId);
    if (userId) {
      scope.setTag("userId", userId);
    }
    scope.setContext("missionRun", {
      missionRunId,
      missionId,
      userId,
      ...additionalContext,
    });
    Sentry.captureException(error);
  });
}

/**
 * Track mission run state change with breadcrumb
 */
export function trackMissionRunStateChange(
  missionRunId: string,
  fromStatus: string,
  toStatus: string,
  metadata?: Record<string, unknown>
) {
  addBreadcrumb(
    `Mission run ${missionRunId} state changed: ${fromStatus} -> ${toStatus}`,
    "mission.state_change",
    {
      missionRunId,
      fromStatus,
      toStatus,
      ...metadata,
    }
  );
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  errorContext?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, errorContext);
      }
      throw error;
    }
  }) as T;
}
