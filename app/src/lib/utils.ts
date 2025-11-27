import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with locale
 */
export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Generate a cryptographically secure random ID
 */
export function generateId(prefix?: string): string {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/**
 * Generate a short random ID (for non-critical uses)
 */
export function generateShortId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if we're on the client side
 */
export const isClient = typeof window !== 'undefined'

/**
 * Check if we're on the server side
 */
export const isServer = typeof window === 'undefined'
