// ZZIK LIVE v4 - Sentry Test Endpoint
// Test endpoint to verify Sentry integration

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  captureError,
  captureMessage,
  addBreadcrumb,
  setTag,
} from "@/core/observability/error-tracking";

/**
 * Test Sentry integration
 *
 * GET /api/sentry-test?type=error|message|breadcrumb
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "message";

  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Sentry test endpoint is disabled in production" },
      { status: 403 }
    );
  }

  try {
    switch (type) {
      case "error":
        // Test error capture
        const testError = new Error("Test error from Sentry test endpoint");
        setTag("test", "true");
        captureError(testError, {
          testType: "manual-error-test",
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({
          success: true,
          message: "Test error sent to Sentry",
        });

      case "message":
        // Test message capture
        captureMessage("Test message from Sentry test endpoint", "info");
        return NextResponse.json({
          success: true,
          message: "Test message sent to Sentry",
        });

      case "breadcrumb":
        // Test breadcrumb
        addBreadcrumb("Test breadcrumb", "test", {
          testData: "This is a test breadcrumb",
        });
        // Then throw an error to see breadcrumb in context
        throw new Error("Error after breadcrumb test");

      case "throw":
        // Test unhandled error
        throw new Error("Unhandled test error");

      default:
        return NextResponse.json({
          success: false,
          message: "Invalid test type. Use: error, message, breadcrumb, or throw",
        });
    }
  } catch (error) {
    // This will be caught by the global error handler and sent to Sentry
    throw error;
  }
}
