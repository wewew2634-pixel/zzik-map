// apps/web/src/types/place.ts
export type TrafficSignal = 'green' | 'yellow' | 'red';

export type PlaceMetrics = {
  missions: number;
  successRate: number; // 0~100 (%)
  likes: number;
};

/**
 * 60일 롤링 윈도우 데이터 (Phase 3에서 백엔드 구현)
 */
export type Place60DaysWindow = {
  from: string; // ISO date
  to: string;   // ISO date
  visits: number;       // 검증된 방문 수
  revisits: number;     // 재방문 수
  rewards: number;      // 리워드 사용 수
  rewardIssued: number; // 리워드 발급 수
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

  // === Phase 2: 단골지수 & 이득 점수 ===
  loyaltyScore?: number;      // 단골지수 0-100
  benefitScore?: number;      // 이득 점수 0-100
  revisitRate?: number;       // 재방문율 0-1 (UI에서 %로 변환)
  verifiedVisits?: number;    // 검증된 방문 수
  last60DaysWindow?: Place60DaysWindow;
};
