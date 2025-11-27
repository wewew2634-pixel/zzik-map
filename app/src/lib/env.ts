/**
 * ZZIK MAP - Environment Variable Validation
 * V4 (Phase 1.5): Zod 기반 강화된 검증 + 빌드 시점 검증 스크립트
 */

import { z } from 'zod';

// =============================================================================
// 환경변수 스키마 정의
// =============================================================================

/**
 * 서버 전용 환경변수 스키마
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(50, 'SUPABASE_SERVICE_ROLE_KEY must be at least 50 characters')
    .optional(),
  GEMINI_API_KEY: z
    .string()
    .min(10, 'GEMINI_API_KEY must be at least 10 characters')
    .optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * 클라이언트 환경변수 스키마 (NEXT_PUBLIC_)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .refine(
      (url) => url.includes('supabase.co') || url.includes('localhost'),
      'Must be a Supabase URL or localhost'
    ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(50, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be at least 50 characters'),
  NEXT_PUBLIC_KAKAO_MAP_KEY: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// =============================================================================
// 타입 정의
// =============================================================================

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

interface EnvConfig extends ServerEnv, ClientEnv {}

// =============================================================================
// 캐시된 환경변수
// =============================================================================

let cachedServerEnv: ServerEnv | null = null;
let cachedClientEnv: ClientEnv | null = null;

// =============================================================================
// 검증 함수
// =============================================================================

function formatZodErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
}

/**
 * 서버 환경변수 검증 (API routes, Server Components에서 사용)
 */
export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const errors = formatZodErrors(parsed.error);
    console.error('❌ Server environment validation failed:');
    console.error(errors);
    throw new Error(`[ENV] Server validation failed:\n${errors}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/**
 * 클라이언트 환경변수 검증
 */
export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_KAKAO_MAP_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    const errors = formatZodErrors(parsed.error);
    console.error('❌ Client environment validation failed:');
    console.error(errors);
    throw new Error(`[ENV] Client validation failed:\n${errors}`);
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}

/**
 * 전체 환경변수 반환 (하위 호환성)
 */
export function getEnv(): EnvConfig {
  return {
    ...getServerEnv(),
    ...getClientEnv(),
  };
}

/**
 * 클라이언트 안전 환경변수 (하위 호환성)
 */
export function getPublicEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

// =============================================================================
// 헬퍼 함수
// =============================================================================

export function hasGeminiApi(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export function isDemoMode(): boolean {
  return !hasGeminiApi();
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

export function hasKakaoApi(): boolean {
  return !!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
}

export function hasMapbox(): boolean {
  return !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

export function getAppVersion(): string {
  return process.env.npm_package_version || '3.0.0';
}

// =============================================================================
// 빌드 시점 검증 함수 (prebuild 스크립트용)
// =============================================================================

/**
 * 모든 환경변수 검증 (빌드 전 실행)
 * Usage: node -e "require('./src/lib/env').validateAllEnv()"
 */
export function validateAllEnv(): boolean {
  console.info('🔍 Validating environment variables...\n');

  let hasErrors = false;

  // 클라이언트 환경변수 검증
  try {
    getClientEnv();
    console.info('✅ Client environment variables: OK');
  } catch {
    hasErrors = true;
    console.error('❌ Client environment variables: FAILED');
  }

  // 서버 환경변수 검증 (optional이므로 경고만)
  try {
    getServerEnv();
    console.info('✅ Server environment variables: OK');
  } catch {
    console.warn('⚠️ Server environment variables: Some optional vars missing (demo mode)');
  }

  if (hasErrors) {
    console.error('\n❌ Required environment variables missing!');
    console.error('Please check .env.local against .env.example\n');
    return false;
  }

  console.info('\n✅ Environment validation passed!\n');
  return true;
}
