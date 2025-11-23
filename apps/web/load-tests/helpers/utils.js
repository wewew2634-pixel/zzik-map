// ZZIK LIVE v4 - Load Test Utilities
// Common helper functions for k6 load tests

/**
 * Generate a random string of specified length
 */
export function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random item from an array
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random GPS coordinates near a location
 * @param {number} lat - Base latitude
 * @param {number} lng - Base longitude
 * @param {number} radiusKm - Radius in kilometers
 */
export function randomGpsNear(lat, lng, radiusKm = 1) {
  // Approximately 1 degree = 111km
  const offset = radiusKm / 111;
  return {
    lat: lat + (Math.random() - 0.5) * offset * 2,
    lng: lng + (Math.random() - 0.5) * offset * 2,
  };
}

/**
 * Sleep for a random duration between min and max seconds
 */
export function randomSleep(minSeconds, maxSeconds) {
  const duration = minSeconds + Math.random() * (maxSeconds - minSeconds);
  return duration;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Calculate percentile from an array of values
 */
export function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[index];
}

/**
 * Simple retry wrapper for HTTP requests
 */
export function withRetry(fn, maxRetries = 3, delayMs = 100) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Simple sleep implementation (k6 doesn't have async/await)
        const start = Date.now();
        while (Date.now() - start < delayMs) {
          // Busy wait (not ideal but works in k6)
        }
      }
    }
  }
  throw lastError;
}

/**
 * Generate a UUID v4
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate response JSON structure
 */
export function isValidJson(response) {
  try {
    JSON.parse(response.body);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Extract error message from response
 */
export function getErrorMessage(response) {
  try {
    const body = JSON.parse(response.body);
    return body.error || body.message || `HTTP ${response.status}`;
  } catch (e) {
    return `HTTP ${response.status}`;
  }
}

/**
 * Create a weighted random selector
 * Example: weightedRandom([{weight: 70, value: 'A'}, {weight: 30, value: 'B'}])
 */
export function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    if (random < item.weight) {
      return item.value;
    }
    random -= item.weight;
  }

  return items[items.length - 1].value;
}

/**
 * Think time - simulate user reading/thinking
 * Uses a normal distribution to be more realistic
 */
export function thinkTime(meanSeconds = 5, stdDevSeconds = 2) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const time = meanSeconds + z * stdDevSeconds;
  return Math.max(0.1, time); // At least 0.1s
}

export default {
  randomString,
  randomInt,
  randomItem,
  randomGpsNear,
  randomSleep,
  formatBytes,
  formatDuration,
  percentile,
  withRetry,
  uuid,
  isValidJson,
  getErrorMessage,
  weightedRandom,
  thinkTime,
};
