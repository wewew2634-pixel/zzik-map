/**
 * ZZIK MAP - Health Check API
 * V4: Comprehensive health monitoring with standard response format
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// App version from package.json or environment
const APP_VERSION = process.env.npm_package_version || '3.0.0';
const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    environment: CheckResult;
    memory: CheckResult;
  };
}

interface CheckResult {
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  latency?: number;
}

const startTime = Date.now();

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('locations').select('id').limit(1);

    const latency = Date.now() - start;

    if (error) {
      return {
        status: 'fail',
        message: error.message,
        latency,
      };
    }

    return {
      status: latency < 500 ? 'pass' : 'warn',
      message: latency < 500 ? 'Connected' : 'Slow response',
      latency,
    };
  } catch (err) {
    return {
      status: 'fail',
      message: err instanceof Error ? err.message : 'Connection failed',
      latency: Date.now() - start,
    };
  }
}

function checkEnvironment(): CheckResult {
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return {
      status: 'fail',
      message: `Missing: ${missing.join(', ')}`,
    };
  }

  const optional = ['GEMINI_API_KEY', 'KAKAO_API_KEY'];
  const missingOptional = optional.filter((key) => !process.env[key]);

  if (missingOptional.length > 0) {
    return {
      status: 'warn',
      message: `Optional missing: ${missingOptional.join(', ')}`,
    };
  }

  return {
    status: 'pass',
    message: 'All environment variables set',
  };
}

function checkMemory(): CheckResult {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usagePercent = Math.round((usage.heapUsed / usage.heapTotal) * 100);

    return {
      status: usagePercent < 80 ? 'pass' : usagePercent < 90 ? 'warn' : 'fail',
      message: `${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent}%)`,
    };
  }

  return {
    status: 'pass',
    message: 'Memory check unavailable',
  };
}

function determineOverallStatus(checks: HealthStatus['checks']): HealthStatus['status'] {
  const results = Object.values(checks);

  if (results.some((c) => c.status === 'fail')) {
    return 'unhealthy';
  }

  if (results.some((c) => c.status === 'warn')) {
    return 'degraded';
  }

  return 'healthy';
}

export async function GET() {
  const [database, environment, memory] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkEnvironment()),
    Promise.resolve(checkMemory()),
  ]);

  const checks = { database, environment, memory };

  const health: HealthStatus = {
    status: determineOverallStatus(checks),
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    uptime: Math.round((Date.now() - startTime) / 1000),
    checks,
  };

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  // Standard API response format
  return NextResponse.json(
    {
      success: health.status !== 'unhealthy',
      data: health,
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-App-Version': APP_VERSION,
        'X-Build-Time': BUILD_TIME,
      },
    }
  );
}
