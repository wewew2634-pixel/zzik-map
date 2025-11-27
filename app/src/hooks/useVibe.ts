'use client';

/**
 * ZZIK MAP - Vibe Matching Hook V4
 * Real implementation with Gemini Vision API and pgvector search
 */

import { useState, useCallback, useMemo } from 'react';
import type { VibeCategory } from '@/lib/vibe-utils';
import { logger } from '@/lib/logger';
import {
  getVibeScoreLevel,
  getVibeInfo,
  calculateVibeSimilarity,
  getTopVibes,
} from '@/lib/vibe-utils';

// =============================================================================
// TYPES
// =============================================================================

export interface VibeMatch {
  id: string;
  placeName: string;
  placeNameKo?: string;
  matchScore: number;
  primaryVibe: VibeCategory;
  vibeScores: Partial<Record<VibeCategory, number>>;
  thumbnailUrl?: string;
  address?: string;
  distance?: number;
}

export interface VibeAnalysisResult {
  primaryVibe: VibeCategory;
  confidence: number;
  vibeScores: Partial<Record<VibeCategory, number>>;
  embedding?: number[];
  description?: string;
  tags?: string[];
}

export interface VibeState {
  analyzedImage: string | null;
  analysisResult: VibeAnalysisResult | null;
  matches: VibeMatch[];
  isAnalyzing: boolean;
  isSearching: boolean;
  error: string | null;
  isDemo: boolean;
}

export interface UseVibeOptions {
  autoSearch?: boolean;
  maxResults?: number;
  minScore?: number;
  onAnalysisComplete?: (result: VibeAnalysisResult) => void;
  onMatchesFound?: (matches: VibeMatch[]) => void;
  onError?: (error: string) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_MAX_RESULTS = 10;
const DEFAULT_MIN_SCORE = 50;
const API_TIMEOUT = 30000;

// =============================================================================
// API FUNCTIONS
// =============================================================================

interface VibeAnalyzeResponse {
  success: boolean;
  data: {
    primaryVibe: string;
    secondaryVibes: string[];
    vibeScores: Record<string, number>;
    description: string;
    tags: string[];
    confidence: number;
    embedding?: number[];
  };
  demo?: boolean;
  error?: string;
}

interface VibeSearchResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    name_ko: string;
    match_score: number;
    primary_vibe: string;
    vibe_scores: Record<string, number>;
    thumbnail_url?: string;
    address?: string;
    distance?: number;
  }>;
  error?: string;
}

/**
 * Analyze image vibe using API endpoint (Gemini Vision)
 */
async function analyzeImageVibe(imageFile: File): Promise<VibeAnalysisResult & { isDemo: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    // Create form data with image
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/vibe/analyze', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Fallback to demo mode if API fails
      logger.warn('Vibe API unavailable, using demo mode', { status: response.status });
      return getDemoAnalysis();
    }

    const data: VibeAnalyzeResponse = await response.json();

    if (!data.success) {
      // API returned error, use demo mode
      logger.warn('Vibe API returned error', { error: data.error });
      return getDemoAnalysis();
    }

    return {
      primaryVibe: data.data.primaryVibe as VibeCategory,
      confidence: data.data.confidence,
      vibeScores: data.data.vibeScores as Partial<Record<VibeCategory, number>>,
      embedding: data.data.embedding,
      description: data.data.description,
      tags: data.data.tags,
      isDemo: data.demo ?? false,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn('Vibe analysis timeout, using demo mode', {});
    } else {
      logger.warn('Vibe analysis error, using demo mode', { error: error instanceof Error ? error.message : 'Unknown' });
    }

    return getDemoAnalysis();
  }
}

/**
 * Demo analysis result when API is unavailable
 */
function getDemoAnalysis(): VibeAnalysisResult & { isDemo: boolean } {
  const vibeScores: Partial<Record<VibeCategory, number>> = {
    modern: 85,
    minimal: 72,
    industrial: 45,
    cozy: 30,
    vintage: 20,
    romantic: 15,
    nature: 10,
    luxury: 25,
  };

  const topVibe = getTopVibes(vibeScores, 1)[0];

  return {
    primaryVibe: topVibe?.vibe || 'modern',
    confidence: topVibe?.score || 85,
    vibeScores,
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
    description: 'A modern space with clean lines and minimalist aesthetic',
    tags: ['modern', 'minimal', 'clean', 'urban'],
    isDemo: true,
  };
}

/**
 * Search for places matching vibe using pgvector similarity
 */
async function searchVibeMatches(
  embedding: number[],
  options: { maxResults: number; minScore: number }
): Promise<VibeMatch[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch('/api/vibe/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embedding,
        limit: options.maxResults,
        minScore: options.minScore,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.warn('Vibe search API unavailable, using demo matches', { status: response.status });
      return getDemoMatches();
    }

    const data: VibeSearchResponse = await response.json();

    if (!data.success) {
      logger.warn('Vibe search returned error', { error: data.error });
      return getDemoMatches();
    }

    return data.data.map((item) => ({
      id: item.id,
      placeName: item.name,
      placeNameKo: item.name_ko,
      matchScore: item.match_score,
      primaryVibe: item.primary_vibe as VibeCategory,
      vibeScores: item.vibe_scores as Partial<Record<VibeCategory, number>>,
      thumbnailUrl: item.thumbnail_url,
      address: item.address,
      distance: item.distance,
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    logger.warn('Vibe search failed, using demo matches', { error: error instanceof Error ? error.message : 'Unknown' });
    return getDemoMatches();
  }
}

/**
 * Demo matches when API is unavailable
 */
function getDemoMatches(): VibeMatch[] {
  return [
    {
      id: 'demo_1',
      placeName: 'Cafe Onion Seongsu',
      placeNameKo: '카페 어니언 성수',
      matchScore: 92,
      primaryVibe: 'modern',
      vibeScores: { modern: 92, industrial: 78, minimal: 65 },
      address: 'Seoul, Seongdong-gu',
      distance: 1.2,
    },
    {
      id: 'demo_2',
      placeName: 'Anthracite Coffee',
      placeNameKo: '앤트러사이트',
      matchScore: 87,
      primaryVibe: 'industrial',
      vibeScores: { industrial: 87, modern: 75, minimal: 60 },
      address: 'Seoul, Mapo-gu',
      distance: 3.5,
    },
    {
      id: 'demo_3',
      placeName: 'Nudake',
      placeNameKo: '누데이크',
      matchScore: 81,
      primaryVibe: 'modern',
      vibeScores: { modern: 81, minimal: 70, luxury: 55 },
      address: 'Seoul, Gangnam-gu',
      distance: 5.2,
    },
  ];
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useVibe(options: UseVibeOptions = {}) {
  const {
    autoSearch = true,
    maxResults = DEFAULT_MAX_RESULTS,
    minScore = DEFAULT_MIN_SCORE,
    onAnalysisComplete,
    onMatchesFound,
    onError,
  } = options;

  const [state, setState] = useState<VibeState>({
    analyzedImage: null,
    analysisResult: null,
    matches: [],
    isAnalyzing: false,
    isSearching: false,
    error: null,
    isDemo: false,
  });

  // Analyze image from File
  const analyzeFile = useCallback(
    async (file: File) => {
      const imageUrl = URL.createObjectURL(file);

      setState((prev) => ({
        ...prev,
        analyzedImage: imageUrl,
        isAnalyzing: true,
        error: null,
        isDemo: false,
      }));

      try {
        const result = await analyzeImageVibe(file);

        setState((prev) => ({
          ...prev,
          analysisResult: result,
          isAnalyzing: false,
          isDemo: result.isDemo,
        }));

        onAnalysisComplete?.(result);

        // Auto-search if enabled
        if (autoSearch && result.embedding) {
          searchMatches(result.embedding);
        }

        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Analysis failed';
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: errorMsg,
        }));
        onError?.(errorMsg);
        return null;
      }
    },
    [autoSearch, onAnalysisComplete, onError]
  );

  // Analyze image from URL (creates a blob fetch)
  const analyzeImage = useCallback(
    async (imageUrl: string) => {
      setState((prev) => ({
        ...prev,
        analyzedImage: imageUrl,
        isAnalyzing: true,
        error: null,
      }));

      try {
        // Fetch image and convert to File
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });

        return await analyzeFile(file);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load image';
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: errorMsg,
        }));
        onError?.(errorMsg);
        return null;
      }
    },
    [analyzeFile, onError]
  );

  // Search for matching places
  const searchMatches = useCallback(
    async (embedding?: number[]) => {
      const searchEmbedding = embedding || state.analysisResult?.embedding;

      if (!searchEmbedding) {
        const errorMsg = 'No embedding available. Analyze an image first.';
        setState((prev) => ({ ...prev, error: errorMsg }));
        onError?.(errorMsg);
        return;
      }

      setState((prev) => ({
        ...prev,
        isSearching: true,
        error: null,
      }));

      try {
        const matches = await searchVibeMatches(searchEmbedding, {
          maxResults,
          minScore,
        });

        setState((prev) => ({
          ...prev,
          matches,
          isSearching: false,
        }));

        onMatchesFound?.(matches);
        return matches;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Search failed';
        setState((prev) => ({
          ...prev,
          isSearching: false,
          error: errorMsg,
        }));
        onError?.(errorMsg);
        return null;
      }
    },
    [state.analysisResult?.embedding, maxResults, minScore, onMatchesFound, onError]
  );

  // Compare two images
  const compareImages = useCallback(
    async (file1: File, file2: File) => {
      try {
        const [result1, result2] = await Promise.all([
          analyzeImageVibe(file1),
          analyzeImageVibe(file2),
        ]);

        if (result1.embedding && result2.embedding) {
          const similarity = calculateVibeSimilarity(result1.embedding, result2.embedding);

          return {
            similarity,
            image1: result1,
            image2: result2,
            sharedVibes: Object.entries(result1.vibeScores)
              .filter(
                ([vibe, score]) =>
                  score && score > 50 && result2.vibeScores[vibe as VibeCategory]! > 50
              )
              .map(([vibe]) => vibe as VibeCategory),
          };
        }

        return null;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Comparison failed';
        onError?.(errorMsg);
        return null;
      }
    },
    [onError]
  );

  // Clear state
  const clearAnalysis = useCallback(() => {
    if (state.analyzedImage) {
      URL.revokeObjectURL(state.analyzedImage);
    }
    setState({
      analyzedImage: null,
      analysisResult: null,
      matches: [],
      isAnalyzing: false,
      isSearching: false,
      error: null,
      isDemo: false,
    });
  }, [state.analyzedImage]);

  // Computed values
  const primaryVibeInfo = useMemo(() => {
    if (!state.analysisResult?.primaryVibe) return null;
    return getVibeInfo(state.analysisResult.primaryVibe);
  }, [state.analysisResult?.primaryVibe]);

  const topVibes = useMemo(() => {
    if (!state.analysisResult?.vibeScores) return [];
    return getTopVibes(state.analysisResult.vibeScores, 3);
  }, [state.analysisResult?.vibeScores]);

  const scoreLevel = useMemo(() => {
    if (!state.analysisResult?.confidence) return null;
    return getVibeScoreLevel(state.analysisResult.confidence);
  }, [state.analysisResult?.confidence]);

  const isReady = useMemo(
    () => !state.isAnalyzing && !state.isSearching,
    [state.isAnalyzing, state.isSearching]
  );

  const hasMatches = useMemo(() => state.matches.length > 0, [state.matches.length]);

  return {
    // State
    ...state,

    // Computed
    primaryVibeInfo,
    topVibes,
    scoreLevel,
    isReady,
    hasMatches,

    // Actions
    analyzeImage,
    analyzeFile,
    searchMatches,
    compareImages,
    clearAnalysis,
  };
}

export type UseVibeReturn = ReturnType<typeof useVibe>;
