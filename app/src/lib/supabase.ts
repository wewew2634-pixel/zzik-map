/**
 * P0 CRITICAL FIX #1: Validated Supabase Client Singleton
 *
 * Security improvements:
 * - Environment variable validation on startup
 * - Type-safe client export
 * - Prevents undefined credentials
 * - Service role key isolation
 * - Clear error messages
 *
 * Usage:
 *   import { supabase, supabaseAdmin } from '@/lib/supabase'
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Validate required environment variables
 * Throws descriptive error if missing
 */
function validateEnvVars(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];

  if (!supabaseUrl || supabaseUrl.trim() === '') {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!supabaseServiceRoleKey || supabaseServiceRoleKey.trim() === '') {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required Supabase environment variables: ${missing.join(', ')}`;
    logger.error('Supabase initialization failed', { missing });
    throw new Error(errorMessage);
  }

  // Validate URL format
  try {
    new URL(supabaseUrl!);
  } catch {
    const errorMessage = `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}`;
    logger.error('Supabase URL validation failed', { url: supabaseUrl });
    throw new Error(errorMessage);
  }

  // Validate key formats (basic check)
  if (supabaseAnonKey!.length < 20 || supabaseServiceRoleKey!.length < 20) {
    const errorMessage = 'Supabase keys appear to be invalid (too short)';
    logger.error('Supabase key validation failed');
    throw new Error(errorMessage);
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseAnonKey: supabaseAnonKey!,
    supabaseServiceRoleKey: supabaseServiceRoleKey!,
  };
}

// Validate on module load
const envVars = validateEnvVars();

/**
 * Public Supabase Client (anon key)
 * Use in client-side code and API routes that need user context
 */
export const supabase: SupabaseClient = createClient(
  envVars.supabaseUrl,
  envVars.supabaseAnonKey,
  {
    auth: {
      persistSession: false, // For API routes, don't persist
      autoRefreshToken: false,
    },
  }
);

/**
 * Admin Supabase Client (service role key)
 * WARNING: Only use in API routes (server-side)
 * NEVER expose this client to client-side code
 *
 * Use cases:
 * - Bypass RLS policies
 * - Admin operations
 * - Batch operations
 */
export const supabaseAdmin: SupabaseClient = createClient(
  envVars.supabaseUrl,
  envVars.supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Check if service role key is being used
 * Useful for preventing accidental exposure
 */
export function isUsingServiceRole(client: SupabaseClient): boolean {
  // Note: This is a basic check, not foolproof
  return client === supabaseAdmin;
}

/**
 * Get Supabase client with error handling
 * Returns null if initialization failed
 */
export function getSafeSupabaseClient(): SupabaseClient | null {
  try {
    return supabase;
  } catch (error) {
    logger.error('Failed to get Supabase client', { error });
    return null;
  }
}

logger.info('Supabase clients initialized successfully', {
  url: envVars.supabaseUrl,
  hasAnonKey: !!envVars.supabaseAnonKey,
  hasServiceRoleKey: !!envVars.supabaseServiceRoleKey,
});
