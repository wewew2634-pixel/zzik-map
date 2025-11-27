import exifr from 'exifr';
import { logger } from './logger';

export interface GPSResult {
  latitude: number | null;
  longitude: number | null;
  source: 'exif' | 'gemini' | 'manual' | 'none';
  confidence: number;
  metadata?: {
    make?: string;
    model?: string;
    dateTime?: string;
    altitude?: number;
  };
}

export interface ExifData {
  latitude?: number;
  longitude?: number;
  Make?: string;
  Model?: string;
  DateTimeOriginal?: Date;
  GPSAltitude?: number;
}

/**
 * Extract GPS coordinates from image EXIF data
 */
export async function extractGPSFromExif(file: File): Promise<GPSResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const exif = await exifr.parse(buffer, {
      gps: true,
      pick: ['Make', 'Model', 'DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'GPSAltitude']
    }) as ExifData | null;

    if (!exif) {
      return { latitude: null, longitude: null, source: 'none', confidence: 0 };
    }

    const metadata = {
      make: exif.Make,
      model: exif.Model,
      dateTime: exif.DateTimeOriginal?.toISOString(),
      altitude: exif.GPSAltitude
    };

    if (exif.latitude && exif.longitude) {
      return {
        latitude: exif.latitude,
        longitude: exif.longitude,
        source: 'exif',
        confidence: 0.95,
        metadata
      };
    }

    return {
      latitude: null,
      longitude: null,
      source: 'none',
      confidence: 0,
      metadata
    };
  } catch (error) {
    logger.warn('EXIF extraction failed', { fileName: file.name, error: error instanceof Error ? error.message : 'Unknown' });
    return { latitude: null, longitude: null, source: 'none', confidence: 0 };
  }
}

/**
 * Convert File to base64 for Gemini API
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get MIME type from file
 */
export function getFileMimeType(file: File): string {
  return file.type || 'image/jpeg';
}

/**
 * Check if coordinates are within Korea bounds
 */
export function isInKorea(lat: number, lng: number): boolean {
  // Korea bounds (approximate)
  const bounds = {
    minLat: 33.0,
    maxLat: 43.0,
    minLng: 124.0,
    maxLng: 132.0
  };

  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
