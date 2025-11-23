/**
 * GPS test data utilities for E2E tests
 */

export type GpsCoordinates = {
  lat: number;
  lng: number;
  accuracy?: number;
  provider?: string;
  mocked?: boolean;
};

/**
 * Generate valid GPS coordinates
 * Default coordinates are Seoul, South Korea
 */
export function mockGpsData(overrides?: Partial<GpsCoordinates>): GpsCoordinates {
  return {
    lat: 37.5665,
    lng: 126.9780,
    accuracy: 10,
    provider: 'gps',
    mocked: false,
    ...overrides,
  };
}

/**
 * Generate GPS coordinates near a specific location
 * @param lat Base latitude
 * @param lng Base longitude
 * @param radiusMeters Random offset radius in meters (default: 50m)
 */
export function mockGpsNearby(
  lat: number,
  lng: number,
  radiusMeters: number = 50
): GpsCoordinates {
  // Approximate: 1 degree = 111km
  const latOffset = (Math.random() - 0.5) * 2 * (radiusMeters / 111000);
  const lngOffset = (Math.random() - 0.5) * 2 * (radiusMeters / (111000 * Math.cos(lat * Math.PI / 180)));

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
    accuracy: 5 + Math.random() * 10,
    provider: 'gps',
    mocked: false,
  };
}

/**
 * Generate GPS coordinates far from a location
 * @param lat Base latitude
 * @param lng Base longitude
 * @param distanceKm Distance in kilometers (default: 10km)
 */
export function mockGpsFarFrom(
  lat: number,
  lng: number,
  distanceKm: number = 10
): GpsCoordinates {
  const distanceMeters = distanceKm * 1000;
  const latOffset = (Math.random() - 0.5) * 2 * (distanceMeters / 111000);
  const lngOffset = (Math.random() - 0.5) * 2 * (distanceMeters / (111000 * Math.cos(lat * Math.PI / 180)));

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
    accuracy: 5 + Math.random() * 10,
    provider: 'gps',
    mocked: false,
  };
}

/**
 * Generate mocked GPS coordinates (should be rejected by anti-spoof)
 */
export function mockGpsWithMockedFlag(): GpsCoordinates {
  return {
    lat: 37.5665,
    lng: 126.9780,
    accuracy: 10,
    provider: 'mock',
    mocked: true,
  };
}

/**
 * Test locations
 */
export const TEST_LOCATIONS = {
  SEOUL: { lat: 37.5665, lng: 126.9780 },
  GANGNAM: { lat: 37.4979, lng: 127.0276 },
  BUSAN: { lat: 35.1796, lng: 129.0756 },
  JEJU: { lat: 33.4996, lng: 126.5312 },
};
