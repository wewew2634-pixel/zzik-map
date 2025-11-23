// ZZIK LIVE v4 - GET /api/health
// @public-endpoint - Health checks intentionally do not require authentication
// Security: Used by load balancers and monitoring systems

import { prisma } from "@/lib/prisma";
import { handleApi } from "../_utils/handleApi";

export async function GET() {
  return handleApi(async () => {
    // 1. Database health check
    // SECURITY: Using Prisma tagged template literal - safe from SQL injection
    // Scanner false-positive: This is parameterized via Prisma's $queryRaw template
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    // 2. Check environment variables
    const requiredEnvVars = [
      "AUTH_JWT_SECRET",
      "QR_SIGNING_SECRET",
      "DATABASE_URL",
    ];
    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    const healthy = dbLatency < 1000 && missingEnvVars.length === 0;

    return {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "unknown",
      checks: {
        database: {
          status: dbLatency < 1000 ? "ok" : "slow",
          latencyMs: dbLatency,
        },
        environment: {
          status: missingEnvVars.length === 0 ? "ok" : "missing_vars",
          missingVars: missingEnvVars,
        },
      },
    };
  });
}
