/**
 * ZZIK MAP - Location Hooks with SWR
 * V2: Type-safe data fetching with caching
 */

import useSWR from 'swr';
import { useCallback, useMemo } from 'react';

// Types
interface Location {
  id: string;
  name: string;
  name_ko: string;
  name_en?: string;
  category: string;
  subcategory?: string;
  latitude: number;
  longitude: number;
  photo_count: number;
  visit_count: number;
  avg_rating?: number;
  created_at: string;
}

interface LocationsResponse {
  success: boolean;
  data: Location[];
  meta: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

interface LocationDetailResponse {
  success: boolean;
  data: Location & {
    nextDestinations: Array<{
      location_id: string;
      name: string;
      name_ko: string;
      category: string;
      journey_count: number;
      percentage: number;
    }>;
  };
}

// Fetcher with error handling
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching data');
    const data = await res.json().catch(() => ({}));
    (error as Error & { info?: unknown; status?: number }).info = data;
    (error as Error & { info?: unknown; status?: number }).status = res.status;
    throw error;
  }

  const json = await res.json();
  return json;
};

// Configuration
const SWR_CONFIG = {
  revalidateOnFocus: false,
  dedupingInterval: 30000, // 30 seconds
  errorRetryCount: 3,
};

/**
 * Hook: Fetch all locations with filtering
 */
export function useLocations(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const { category, limit = 50, offset = 0 } = options || {};

  const params = new URLSearchParams();
  if (category) params.set('category', category);
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  const url = `/api/locations?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<LocationsResponse>(
    url,
    fetcher,
    SWR_CONFIG
  );

  return {
    locations: data?.data || [],
    meta: data?.meta,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Hook: Fetch single location by ID
 */
export function useLocation(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<LocationDetailResponse>(
    id ? `/api/locations/${id}` : null,
    fetcher,
    SWR_CONFIG
  );

  return {
    location: data?.data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook: Filtered locations with memoization
 */
export function useFilteredLocations(
  locations: Location[],
  filters: {
    category?: string;
    searchQuery?: string;
  }
) {
  const { category, searchQuery } = filters;

  const filtered = useMemo(() => {
    let result = [...locations];

    // Category filter
    if (category && category !== 'all') {
      result = result.filter(loc => loc.category === category);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        loc =>
          loc.name.toLowerCase().includes(query) ||
          loc.name_ko.includes(query)
      );
    }

    return result;
  }, [locations, category, searchQuery]);

  return filtered;
}

/**
 * Hook: Find nearest location to coordinates
 */
export function useNearestLocation(
  locations: Location[],
  coords: { lat: number; lng: number } | null,
  maxDistanceKm = 5
) {
  const findNearest = useCallback(() => {
    if (!coords || locations.length === 0) return null;

    let nearest: Location | null = null;
    let minDist = Infinity;

    // Haversine formula for accurate distance
    const toRad = (deg: number) => deg * (Math.PI / 180);

    for (const loc of locations) {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(loc.latitude - coords.lat);
      const dLon = toRad(loc.longitude - coords.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords.lat)) *
          Math.cos(toRad(loc.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    }

    // Only return if within max distance
    return minDist <= maxDistanceKm ? { location: nearest, distance: minDist } : null;
  }, [locations, coords, maxDistanceKm]);

  return useMemo(() => findNearest(), [findNearest]);
}

export type { Location, LocationsResponse, LocationDetailResponse };
