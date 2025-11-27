/**
 * ZZIK MAP - Application Constants
 * V2: Centralized configuration values
 */

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  LOCATIONS_LIMIT: 50,
  JOURNEY_RECOMMENDATIONS: 5,
} as const;

// File Upload
export const UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  THUMBNAIL_SIZE: 400,
  COMPRESSION_QUALITY: 0.8,
} as const;

// SWR Cache
export const SWR_CONFIG = {
  REVALIDATE_ON_FOCUS: false,
  DEDUPING_INTERVAL: 30000, // 30 seconds
  JOURNEY_DEDUPING_INTERVAL: 60000, // 1 minute
  ERROR_RETRY_COUNT: 3,
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  ANALYZE_REQUESTS_PER_MINUTE: 10,
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_MAP_SIZE: 1000, // Clean up after this many entries
} as const;

// GPS
export const GPS = {
  MAX_DISTANCE_KM: 5, // Max distance for auto-matching location
  KOREA_BOUNDS: {
    minLat: 33.0,
    maxLat: 38.5,
    minLng: 124.0,
    maxLng: 132.0,
  },
} as const;

// Vibe Analysis
export const VIBE = {
  EMBEDDING_DIMENSIONS: 128,
  MIN_CONFIDENCE: 0.5,
  HIGH_MATCH_THRESHOLD: 0.8,
  MEDIUM_MATCH_THRESHOLD: 0.6,
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 400,
} as const;

// Categories
export const LOCATION_CATEGORIES = [
  'landmark',
  'cafe',
  'shopping',
  'entertainment',
  'nature',
  'other',
] as const;

export type LocationCategory = (typeof LOCATION_CATEGORIES)[number];

// Photo Status
export const PHOTO_STATUS = [
  'pending',
  'processing',
  'analyzed',
  'failed',
] as const;

export type PhotoStatus = (typeof PHOTO_STATUS)[number];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a MIME type is a supported image type
 */
export function isSupportedImageType(mimeType: string): boolean {
  return UPLOAD.ACCEPTED_TYPES.includes(mimeType as typeof UPLOAD.ACCEPTED_TYPES[number]);
}

/**
 * Check if a file size is within limits
 */
export function isFileSizeValid(sizeInBytes: number): boolean {
  return sizeInBytes <= UPLOAD.MAX_SIZE_BYTES;
}

/**
 * Validate file for upload
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!isSupportedImageType(file.type)) {
    return {
      valid: false,
      error: 'Unsupported format. Supported: JPEG, PNG, WebP, HEIC',
    };
  }

  if (!isFileSizeValid(file.size)) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${UPLOAD.MAX_SIZE_MB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Get accepted file types as comma-separated string (for HTML accept attribute)
 */
export function getAcceptedTypesString(): string {
  return UPLOAD.ACCEPTED_TYPES.join(',');
}
