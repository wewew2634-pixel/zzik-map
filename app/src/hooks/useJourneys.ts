/**
 * ZZIK MAP - Journey Hooks with SWR
 * V2: Type-safe journey data fetching
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// Types
interface JourneyRecommendation {
  locationId: string;
  name: string;
  nameKo: string;
  category: string;
  travelerCount: number;
  percentage: number;
}

interface JourneyResult {
  from: {
    name: string;
    name_ko: string;
    category: string;
  };
  totalTravelers: number;
  recommendations: JourneyRecommendation[];
}

interface JourneyResponse {
  success: boolean;
  data: JourneyResult;
}

interface JourneyPattern {
  id: string;
  from_location_id: string;
  to_location_id: string;
  journey_count: number;
  created_at: string;
}

// Fetcher
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('Failed to fetch journey data');
    throw error;
  }

  return res.json();
};

// Mutation fetcher for POST
const postJourney = async (
  url: string,
  { arg }: { arg: { fromLocationId: string; toLocationId: string } }
) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const error = new Error('Failed to record journey');
    throw error;
  }

  return res.json();
};

// Configuration
const SWR_CONFIG = {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minute - journey data changes less frequently
  errorRetryCount: 2,
};

/**
 * Hook: Fetch journey recommendations from a location
 */
export function useJourneyRecommendations(fromLocationId: string | null, limit = 5) {
  const params = new URLSearchParams();
  if (fromLocationId) params.set('from', fromLocationId);
  params.set('limit', String(limit));

  const url = fromLocationId ? `/api/journeys?${params.toString()}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<JourneyResponse>(
    url,
    fetcher,
    SWR_CONFIG
  );

  return {
    journey: data?.data,
    recommendations: data?.data?.recommendations || [],
    totalTravelers: data?.data?.totalTravelers || 0,
    from: data?.data?.from,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Hook: Record a new journey pattern
 */
export function useRecordJourney() {
  const { trigger, isMutating, error, data } = useSWRMutation<
    { success: boolean; data: JourneyPattern },
    Error,
    string,
    { fromLocationId: string; toLocationId: string }
  >('/api/journeys', postJourney);

  return {
    recordJourney: trigger,
    isRecording: isMutating,
    error,
    data: data?.data,
  };
}

/**
 * Hook: Journey state management for the upload flow
 */
export function useJourneyFlow() {
  // This can be extended with zustand for complex state
  // For now, using React state through the page component
  return {
    steps: ['upload', 'location', 'results'] as const,
  };
}

export type { JourneyRecommendation, JourneyResult, JourneyResponse };
