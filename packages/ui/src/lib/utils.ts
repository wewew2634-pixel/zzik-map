import { type ClassValue, clsx } from 'clsx'

/**
 * Utility for merging Tailwind CSS classes
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
