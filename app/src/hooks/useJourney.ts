'use client';

/**
 * ZZIK MAP - Journey Hook V4
 * Real implementation with EXIF extraction and API integration
 */

import { useState, useCallback, useMemo } from 'react';
import { extractGPSFromExif, type GPSResult } from '@/lib/gps';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  source: 'exif' | 'gemini' | 'manual' | 'unknown';
}

export interface JourneyPhoto {
  id: string;
  file: File | null;
  previewUrl: string;
  location: GeoLocation | null;
  timestamp: Date | null;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  extractionStatus: 'pending' | 'extracting' | 'success' | 'fallback' | 'manual';
  metadata?: {
    make?: string;
    model?: string;
    dateTime?: string;
  };
  errorMessage?: string;
}

export interface JourneyRecommendation {
  id: string;
  placeName: string;
  placeNameKo?: string;
  location: GeoLocation;
  matchScore: number;
  travelerCount: number;
  travelerNationality?: string;
  vibeCategory?: string;
  thumbnailUrl?: string;
  distance?: number;
  rank: number;
}

export interface JourneyState {
  photos: JourneyPhoto[];
  recommendations: JourneyRecommendation[];
  currentLocationId: string | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  step: 'upload' | 'analyzing' | 'results';
}

export interface UseJourneyOptions {
  maxPhotos?: number;
  autoAnalyze?: boolean;
  onPhotoAdded?: (photo: JourneyPhoto) => void;
  onAnalysisComplete?: (recommendations: JourneyRecommendation[]) => void;
  onError?: (error: string) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_MAX_PHOTOS = 10;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format. Please use: JPEG, PNG, WebP, or HEIC`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Convert GPSResult to GeoLocation
 */
function gpsResultToLocation(result: GPSResult): GeoLocation | null {
  if (!result.latitude || !result.longitude) return null;

  return {
    lat: result.latitude,
    lng: result.longitude,
    accuracy: result.confidence,
    source: result.source === 'none' ? 'unknown' : result.source,
  };
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

interface ApiJourneyResponse {
  success: boolean;
  data: {
    from: {
      name: string;
      name_ko: string;
      category: string;
    };
    totalTravelers: number;
    recommendations: Array<{
      locationId: string;
      name: string;
      nameKo: string;
      category: string;
      travelerCount: number;
      percentage: number;
    }>;
  };
}

async function fetchJourneyRecommendations(locationId: string): Promise<JourneyRecommendation[]> {
  const response = await fetch(`/api/journeys?from=${locationId}&limit=5`);

  if (!response.ok) {
    throw new Error('Failed to fetch journey recommendations');
  }

  const data: ApiJourneyResponse = await response.json();

  if (!data.success) {
    throw new Error('API returned error');
  }

  return data.data.recommendations.map((rec, idx) => ({
    id: rec.locationId,
    placeName: rec.name,
    placeNameKo: rec.nameKo,
    location: { lat: 0, lng: 0, source: 'unknown' as const },
    matchScore: rec.percentage,
    travelerCount: rec.travelerCount,
    vibeCategory: rec.category,
    rank: idx + 1,
  }));
}

interface ApiLocationsResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    name_ko: string;
    latitude: number;
    longitude: number;
    category: string;
  }>;
}

async function findNearestLocation(lat: number, lng: number): Promise<string | null> {
  const response = await fetch('/api/locations?limit=50');

  if (!response.ok) return null;

  const data: ApiLocationsResponse = await response.json();

  if (!data.success || !data.data.length) return null;

  // Find nearest location using Haversine
  let nearest: { id: string; distance: number } | null = null;
  const R = 6371;

  for (const loc of data.data) {
    const dLat = (loc.latitude - lat) * (Math.PI / 180);
    const dLng = (loc.longitude - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(loc.latitude * (Math.PI / 180)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (!nearest || distance < nearest.distance) {
      nearest = { id: loc.id, distance };
    }
  }

  // Return if within 5km
  return nearest && nearest.distance <= 5 ? nearest.id : null;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useJourney(options: UseJourneyOptions = {}) {
  const {
    maxPhotos = DEFAULT_MAX_PHOTOS,
    autoAnalyze = false,
    onPhotoAdded,
    onAnalysisComplete,
    onError,
  } = options;

  const [state, setState] = useState<JourneyState>({
    photos: [],
    recommendations: [],
    currentLocationId: null,
    isLoading: false,
    isAnalyzing: false,
    error: null,
    step: 'upload',
  });

  // Add photo to journey
  const addPhoto = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        const errorMsg = validation.error || 'Invalid file';
        setState((prev) => ({ ...prev, error: errorMsg }));
        onError?.(errorMsg);
        return null;
      }

      if (state.photos.length >= maxPhotos) {
        const errorMsg = `Maximum ${maxPhotos} photos allowed`;
        setState((prev) => ({ ...prev, error: errorMsg }));
        onError?.(errorMsg);
        return null;
      }

      const photo: JourneyPhoto = {
        id: generatePhotoId(),
        file,
        previewUrl: URL.createObjectURL(file),
        location: null,
        timestamp: null,
        uploadStatus: 'pending',
        extractionStatus: 'pending',
      };

      setState((prev) => ({
        ...prev,
        photos: [...prev.photos, photo],
        error: null,
      }));

      onPhotoAdded?.(photo);

      // Start location extraction
      extractLocation(photo.id, file);

      return photo;
    },
    // extractLocation은 이 훅 내부에서 정의되어 안정적이며,
    // 의존성에 포함하면 순환 참조 발생: addPhoto → extractLocation → state
    [state.photos.length, maxPhotos, onPhotoAdded, onError] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Extract location from photo using real EXIF extraction
  const extractLocation = useCallback(
    async (photoId: string, file: File) => {
      setState((prev) => ({
        ...prev,
        photos: prev.photos.map((p) =>
          p.id === photoId ? { ...p, extractionStatus: 'extracting' as const } : p
        ),
      }));

      try {
        // Step 1: Real EXIF extraction using exifr library
        const gpsResult = await extractGPSFromExif(file);
        const location = gpsResultToLocation(gpsResult);

        if (location) {
          // Found GPS in EXIF - find nearest location
          const nearestId = await findNearestLocation(location.lat, location.lng);

          setState((prev) => ({
            ...prev,
            currentLocationId: nearestId,
            photos: prev.photos.map((p) =>
              p.id === photoId
                ? {
                    ...p,
                    location,
                    metadata: gpsResult.metadata,
                    extractionStatus: 'success' as const,
                  }
                : p
            ),
          }));

          // Auto-analyze if enabled
          if (autoAnalyze && nearestId) {
            analyzeJourneyById(nearestId);
          }
        } else {
          // No GPS found - mark for manual selection
          setState((prev) => ({
            ...prev,
            photos: prev.photos.map((p) =>
              p.id === photoId
                ? {
                    ...p,
                    metadata: gpsResult.metadata,
                    extractionStatus: 'manual' as const,
                  }
                : p
            ),
          }));
        }
      } catch (error) {
        logger.error('Location extraction failed', { photoId }, error instanceof Error ? error : undefined);
        setState((prev) => ({
          ...prev,
          photos: prev.photos.map((p) =>
            p.id === photoId
              ? { ...p, extractionStatus: 'manual' as const }
              : p
          ),
        }));
      }
    },
    // analyzeJourneyById는 이 훅 내부에서 정의되어 안정적이며,
    // 의존성에 포함하면 순환 참조 발생: extractLocation → analyzeJourneyById → state
    [autoAnalyze] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Analyze journey by location ID (main API call)
  const analyzeJourneyById = useCallback(
    async (locationId: string) => {
      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        step: 'analyzing',
        error: null,
        currentLocationId: locationId,
      }));

      try {
        const recommendations = await fetchJourneyRecommendations(locationId);

        setState((prev) => ({
          ...prev,
          recommendations,
          isAnalyzing: false,
          step: 'results',
        }));

        onAnalysisComplete?.(recommendations);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Analysis failed';
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: errorMsg,
          step: 'upload',
        }));
        onError?.(errorMsg);
      }
    },
    [onAnalysisComplete, onError]
  );

  // Analyze journey using photos with location
  const analyzeJourney = useCallback(async () => {
    const photosWithLocation = state.photos.filter((p) => p.location);

    if (photosWithLocation.length === 0) {
      const errorMsg = 'No photos with location data. Please add locations.';
      setState((prev) => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    // Use first photo's location to find nearest known location
    const firstPhoto = photosWithLocation[0];
    if (firstPhoto.location) {
      const nearestId = await findNearestLocation(
        firstPhoto.location.lat,
        firstPhoto.location.lng
      );

      if (nearestId) {
        analyzeJourneyById(nearestId);
      } else {
        const errorMsg = 'Could not find a matching location. Please select manually.';
        setState((prev) => ({ ...prev, error: errorMsg }));
        onError?.(errorMsg);
      }
    }
  }, [state.photos, analyzeJourneyById, onError]);

  // Set manual location for a photo
  const setManualLocation = useCallback(
    (photoId: string, location: Omit<GeoLocation, 'source'>) => {
      setState((prev) => ({
        ...prev,
        photos: prev.photos.map((p) =>
          p.id === photoId
            ? {
                ...p,
                location: { ...location, source: 'manual' as const },
                extractionStatus: 'success' as const,
              }
            : p
        ),
      }));
    },
    []
  );

  // Select location directly (without photo)
  const selectLocation = useCallback(
    (locationId: string) => {
      analyzeJourneyById(locationId);
    },
    [analyzeJourneyById]
  );

  // Remove photo
  const removePhoto = useCallback((photoId: string) => {
    setState((prev) => {
      const photo = prev.photos.find((p) => p.id === photoId);
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return {
        ...prev,
        photos: prev.photos.filter((p) => p.id !== photoId),
      };
    });
  }, []);

  // Clear all
  const clearPhotos = useCallback(() => {
    setState((prev) => {
      prev.photos.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
      return {
        ...prev,
        photos: [],
        recommendations: [],
        currentLocationId: null,
        step: 'upload',
      };
    });
  }, []);

  // Reset to upload step
  const reset = useCallback(() => {
    clearPhotos();
    setState((prev) => ({
      ...prev,
      error: null,
      isLoading: false,
      isAnalyzing: false,
    }));
  }, [clearPhotos]);

  // Computed values
  const photosWithLocation = useMemo(
    () => state.photos.filter((p) => p.location),
    [state.photos]
  );

  const photosPendingLocation = useMemo(
    () => state.photos.filter((p) => p.extractionStatus === 'manual'),
    [state.photos]
  );

  const canAnalyze = useMemo(
    () => photosWithLocation.length > 0 && !state.isAnalyzing,
    [photosWithLocation.length, state.isAnalyzing]
  );

  const extractionProgress = useMemo(() => {
    if (state.photos.length === 0) return 0;
    const completed = state.photos.filter(
      (p) => p.extractionStatus === 'success' || p.extractionStatus === 'manual'
    ).length;
    return Math.round((completed / state.photos.length) * 100);
  }, [state.photos]);

  return {
    // State
    ...state,

    // Computed
    photosWithLocation,
    photosPendingLocation,
    canAnalyze,
    extractionProgress,

    // Actions
    addPhoto,
    removePhoto,
    clearPhotos,
    setManualLocation,
    selectLocation,
    analyzeJourney,
    analyzeJourneyById,
    extractLocation,
    reset,
  };
}

export type UseJourneyReturn = ReturnType<typeof useJourney>;
