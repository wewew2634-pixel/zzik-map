/**
 * P0 CRITICAL FIX #3: Content Sanitization (XSS Protection)
 *
 * Security improvements:
 * - XSS protection via DOMPurify
 * - Safe error message display
 * - File name sanitization
 * - HTML entity encoding
 * - SQL injection prevention helpers
 *
 * Usage:
 *   import { sanitizeUserInput, sanitizeErrorMessage } from '@/lib/sanitize'
 *   const safe = sanitizeUserInput(userInput)
 *   const safeError = sanitizeErrorMessage(error.message)
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization configuration
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [] as string[], // No HTML tags allowed
  ALLOWED_ATTR: [] as string[], // No attributes allowed
  KEEP_CONTENT: true, // Keep text content, remove tags
} as const;

/**
 * Strict sanitization - removes all HTML
 * Use for user-generated text content
 */
export function sanitizeUserInput(input: string | null | undefined): string {
  if (!input) return '';

  // First pass: DOMPurify to remove XSS
  const purified = DOMPurify.sanitize(input, SANITIZE_CONFIG);

  // Second pass: Remove potential script content
  const cleaned = purified
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return cleaned.trim();
}

/**
 * Sanitize error messages for display
 * Removes sensitive information like file paths, stack traces
 */
export function sanitizeErrorMessage(error: string | Error | unknown): string {
  let message = '';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'An error occurred';
  }

  // Remove file paths (Windows and Unix)
  message = message.replace(/[A-Za-z]:\\[\w\s\\\-\.]+/g, '[PATH]');
  message = message.replace(/\/[\w\s\/\-\.]+/g, '[PATH]');

  // Remove stack traces
  message = message.replace(/at\s+[\w\s\.]+\s+\(.*?\)/g, '');
  message = message.replace(/^\s*at\s+.*$/gm, '');

  // Remove line and column numbers
  message = message.replace(/:\d+:\d+/g, '');

  // Sanitize remaining content
  const sanitized = sanitizeUserInput(message);

  // Limit length
  const maxLength = 500;
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength) + '...';
  }

  return sanitized;
}

/**
 * Sanitize file names
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFileName(fileName: string | null | undefined): string {
  if (!fileName) return 'untitled';

  // Remove path components
  let safe = fileName.replace(/^.*[\\\/]/, '');

  // Remove path traversal attempts
  safe = safe.replace(/\.\./g, '');

  // Remove null bytes
  safe = safe.replace(/\0/g, '');

  // Remove control characters
  safe = safe.replace(/[\x00-\x1F\x7F]/g, '');

  // Remove dangerous characters
  safe = safe.replace(/[<>:"|?*]/g, '_');

  // Limit length
  const maxLength = 255;
  if (safe.length > maxLength) {
    const ext = safe.split('.').pop();
    const name = safe.substring(0, maxLength - (ext ? ext.length + 1 : 0));
    safe = ext ? `${name}.${ext}` : name;
  }

  // Ensure not empty
  return safe.trim() || 'untitled';
}

/**
 * HTML entity encoding
 * Use when displaying user content in HTML context
 */
export function encodeHtmlEntities(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Decode HTML entities
 */
export function decodeHtmlEntities(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  return text.replace(/&[#\w]+;/g, (entity) => htmlEntities[entity] || entity);
}

/**
 * Sanitize JSON for logging
 * Removes sensitive fields like passwords, tokens, keys
 */
export function sanitizeForLogging(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'apiKey',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
    'session',
    'ssn',
    'creditCard',
  ];

  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key] as Record<string, unknown>);
    }
  }

  return sanitized;
}

/**
 * SQL injection prevention helper
 * Use parameterized queries instead, but this provides additional safety
 */
export function escapeSqlLikePattern(pattern: string): string {
  return pattern
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Sanitize URL for display
 * Removes credentials and sensitive query params
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Remove credentials
    parsed.username = '';
    parsed.password = '';

    // Remove sensitive query params
    const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];
    sensitiveParams.forEach(param => {
      parsed.searchParams.delete(param);
    });

    return parsed.toString();
  } catch {
    // If URL parsing fails, sanitize as text
    return sanitizeUserInput(url);
  }
}

/**
 * Validate and sanitize email
 * Basic validation and normalization
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  const sanitized = sanitizeUserInput(email).toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize user-facing display name
 * Allows basic unicode but prevents XSS
 */
export function sanitizeDisplayName(name: string | null | undefined): string {
  if (!name) return 'Anonymous';

  const sanitized = sanitizeUserInput(name);

  // Limit length
  const maxLength = 50;
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength) + '...';
  }

  return sanitized || 'Anonymous';
}

/**
 * Comprehensive sanitization for analytics metadata
 * Deeply sanitizes nested objects
 */
export function sanitizeMetadata(
  metadata: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object') return {};

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const sanitizedKey = sanitizeUserInput(key);

    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeUserInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map(item =>
        typeof item === 'string' ? sanitizeUserInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeMetadata(value as Record<string, unknown>);
    }
  }

  return sanitized;
}

/**
 * Check if string contains potential XSS
 * Returns true if suspicious content detected
 */
export function containsPotentialXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Safe JSON parse with error handling
 * Returns null if parsing fails or contains XSS
 */
export function safeJsonParse<T = unknown>(json: string): T | null {
  try {
    if (containsPotentialXSS(json)) {
      return null;
    }

    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return null;
  }
}
