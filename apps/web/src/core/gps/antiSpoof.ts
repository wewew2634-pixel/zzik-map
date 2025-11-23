// ZZIK LIVE v4 - GPS Anti-Spoofing Interface

export type GpsAntiSpoofInput = {
  lat: number;
  lng: number;
  accuracy: number;
  provider?: string; // "gps" / "network" / "mock" 등
  mocked?: boolean; // 클라이언트가 전달한 "mocked" 플래그
  deviceId?: string;
  timestamp: Date;
};

export type GpsAntiSpoofResult = {
  ok: boolean;
  reason?: string;
  score?: number; // 0~1 또는 0~100
};

export interface GpsAntiSpoofAdapter {
  check(input: GpsAntiSpoofInput): Promise<GpsAntiSpoofResult>;
}

// 기본 no-op 구현 (항상 통과)
class NoopGpsAntiSpoofAdapter implements GpsAntiSpoofAdapter {
  async check(input: GpsAntiSpoofInput): Promise<GpsAntiSpoofResult> {
    // 기본적으로 mocked 플래그가 true이면 거부
    if (input.mocked === true) {
      return {
        ok: false,
        reason: "Mock location detected",
        score: 0,
      };
    }
    return { ok: true, score: 1.0 };
  }
}

// Default to enhanced adapter in production
import { EnhancedGpsAntiSpoofAdapter } from "./antiSpoof.enhanced";

let adapter: GpsAntiSpoofAdapter =
  process.env.NODE_ENV === "production"
    ? new EnhancedGpsAntiSpoofAdapter()
    : new NoopGpsAntiSpoofAdapter();

export function setGpsAntiSpoofAdapter(next: GpsAntiSpoofAdapter) {
  adapter = next;
}

export function getGpsAntiSpoofAdapter(): GpsAntiSpoofAdapter {
  return adapter;
}
