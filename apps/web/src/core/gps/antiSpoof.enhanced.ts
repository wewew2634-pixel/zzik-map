// ZZIK LIVE v4 - Enhanced GPS Anti-Spoofing

import { prisma } from "@/lib/prisma";
import type { GpsAntiSpoofAdapter, GpsAntiSpoofInput, GpsAntiSpoofResult } from "./antiSpoof";

/**
 * Enhanced GPS Anti-Spoofing Implementation
 *
 * Detects GPS spoofing through:
 * 1. Provider validation (reject "mock" provider)
 * 2. Velocity check (detect teleportation)
 * 3. Accuracy anomaly detection
 */
export class EnhancedGpsAntiSpoofAdapter implements GpsAntiSpoofAdapter {
  private readonly MAX_VELOCITY_MS = 200; // 200 m/s = 720 km/h (airplane speed)
  private readonly SUSPICIOUS_ACCURACY_THRESHOLD = 5; // < 5m is suspicious for mobile GPS

  async check(input: GpsAntiSpoofInput): Promise<GpsAntiSpoofResult> {
    // 1. Check provider
    if (input.provider === "mock") {
      return {
        ok: false,
        reason: "Mock location provider detected",
        score: 0,
      };
    }

    // 2. Check client-provided mocked flag
    if (input.mocked === true) {
      return {
        ok: false,
        reason: "Client reported mocked location",
        score: 0,
      };
    }

    // 3. Velocity check (requires deviceId)
    if (input.deviceId) {
      const velocityCheck = await this.checkVelocity(input);
      if (!velocityCheck.ok) {
        return velocityCheck;
      }
    }

    // 4. Accuracy anomaly detection
    if (input.accuracy < this.SUSPICIOUS_ACCURACY_THRESHOLD) {
      // Log as suspicious but don't reject (some devices have very good GPS)
      // In production, this could be combined with other signals
      return {
        ok: true,
        reason: "Suspiciously accurate GPS (< 5m), but allowed",
        score: 0.7,
      };
    }

    return {
      ok: true,
      score: 1.0,
    };
  }

  /**
   * Check if velocity between last GPS and current GPS is realistic
   *
   * TODO: Implement proper GPS history tracking
   * Currently this is a placeholder that will be enhanced when we add:
   * 1. GpsHistory table to store each GPS verification
   * 2. Proper deviceId → userId mapping
   * 3. IP geolocation cross-validation
   */
  private async checkVelocity(input: GpsAntiSpoofInput): Promise<GpsAntiSpoofResult> {
    // Velocity check disabled for now
    // Requires GPS history table which will be added in future iteration
    // See CRITICAL_SECURITY_AUDIT.md #2 for full implementation plan
    return { ok: true, score: 1.0 };
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in meters
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}
