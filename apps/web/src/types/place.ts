// apps/web/src/types/place.ts
export type TrafficSignal = 'green' | 'yellow' | 'red';

export type PlaceMetrics = {
  missions: number;
  successRate: number; // 0~100 (%)
  likes: number;
};

export type PlaceSummary = {
  id: string;
  name: string;
  category: string;
  // Mapbox 좌표: [lng, lat]
  lng: number;
  lat: number;
  distanceMeters: number;
  trafficSignal: TrafficSignal;
  isGold: boolean;
  benefitLabel?: string;
  benefitValue?: string;
  metrics?: PlaceMetrics;
};
