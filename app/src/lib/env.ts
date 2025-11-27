/**
 * ZZIK MAP - Environment Variable Validation
 * V3: Runtime validation with clear error messages + production helpers
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Gemini AI (optional for demo mode)
  GEMINI_API_KEY?: string;

  // Maps (optional)
  KAKAO_API_KEY?: string;
  NEXT_PUBLIC_MAPBOX_TOKEN?: string;

  // Runtime
  NODE_ENV: 'development' | 'production' | 'test';
}

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please add it to your .env.local file.`
    );
  }

  return value || '';
}

function validateEnv(): EnvConfig {
  return {
    NEXT_PUBLIC_SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', false),
    GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', false),
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  };
}

// Validate on module load (server-side only)
let env: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!env) {
    env = validateEnv();
  }
  return env;
}

// Client-safe config (only public vars)
export function getPublicEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

// Check if Gemini API is available
export function hasGeminiApi(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

// Check if running in demo mode
export function isDemoMode(): boolean {
  return !hasGeminiApi();
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Check if running in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Check if Kakao Maps API is available
export function hasKakaoApi(): boolean {
  return !!process.env.KAKAO_API_KEY;
}

// Check if Mapbox is available
export function hasMapbox(): boolean {
  return !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

// Get app version from package.json
export function getAppVersion(): string {
  return process.env.npm_package_version || '3.0.0';
}
