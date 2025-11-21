// ZZIK LIVE v4 - usePlaces Hook
// Fetches places from API and transforms to PlaceSummary format

"use client";

import { useEffect, useState } from "react";
import type { PlaceSummary, TrafficSignal } from "@/types/place";
import type { ApiResponse } from "@/core/errors/api-response";

type PlaceFromApi = {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  trafficSignal: "GREEN" | "YELLOW" | "RED";
  isGold: boolean;
  successRate: number;
  missionsCount: number;
  missions?: Array<{
    id: string;
    title: string;
    rewardAmount: number;
  }>;
};

function transformPlace(place: PlaceFromApi): PlaceSummary {
  // Transform TrafficSignal enum from uppercase to lowercase
  const trafficSignal: TrafficSignal = place.trafficSignal.toLowerCase() as TrafficSignal;

  // Calculate distance (placeholder - would need user's current location)
  const distanceMeters = 0; // TODO: Calculate based on user's geolocation

  // Transform benefitLabel/benefitValue from missions
  const firstMission = place.missions?.[0];
  const benefitLabel = firstMission ? "미션 참여" : undefined;
  const benefitValue = firstMission
    ? `최대 ${firstMission.rewardAmount.toLocaleString()}원`
    : undefined;

  return {
    id: place.id,
    name: place.name,
    category: place.category,
    lng: place.longitude,
    lat: place.latitude,
    distanceMeters,
    trafficSignal,
    isGold: place.isGold,
    benefitLabel,
    benefitValue,
    metrics: {
      missions: place.missionsCount,
      successRate: place.successRate,
      likes: 0, // TODO: Add likes to Place model
    },
  };
}

export function usePlaces() {
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/places");
        const data: ApiResponse<{ places: PlaceFromApi[] }> = await res.json();

        if (!data.ok) {
          throw new Error(data.error.message);
        }

        const transformed = data.data.places.map(transformPlace);
        setPlaces(transformed);
      } catch (err) {
        console.error("Failed to fetch places:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch places");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, []);

  return { places, loading, error };
}
