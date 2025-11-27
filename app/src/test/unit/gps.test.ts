/**
 * ZZIK MAP - GPS Utilities Unit Tests
 * V6: Testing GPS extraction and calculation functions
 */

import { describe, it, expect } from 'vitest';
import { isInKorea, calculateDistance } from '@/lib/gps';

describe('GPS Utilities', () => {
  describe('isInKorea', () => {
    it('should return true for Seoul coordinates', () => {
      // Seoul: 37.5665° N, 126.9780° E
      expect(isInKorea(37.5665, 126.978)).toBe(true);
    });

    it('should return true for Busan coordinates', () => {
      // Busan: 35.1796° N, 129.0756° E
      expect(isInKorea(35.1796, 129.0756)).toBe(true);
    });

    it('should return true for Jeju coordinates', () => {
      // Jeju: 33.4996° N, 126.5312° E
      expect(isInKorea(33.4996, 126.5312)).toBe(true);
    });

    it('should return false for Tokyo coordinates', () => {
      // Tokyo: 35.6762° N, 139.6503° E
      expect(isInKorea(35.6762, 139.6503)).toBe(false);
    });

    it('should return false for Beijing coordinates', () => {
      // Beijing: 39.9042° N, 116.4074° E
      expect(isInKorea(39.9042, 116.4074)).toBe(false);
    });

    it('should return false for New York coordinates', () => {
      // New York: 40.7128° N, -74.0060° W
      expect(isInKorea(40.7128, -74.006)).toBe(false);
    });

    it('should return false for negative latitudes (Southern Hemisphere)', () => {
      expect(isInKorea(-33.8688, 151.2093)).toBe(false); // Sydney
    });

    it('should handle boundary conditions', () => {
      // Test exact boundaries
      expect(isInKorea(33.0, 124.0)).toBe(true); // Min lat, min lng
      expect(isInKorea(43.0, 132.0)).toBe(true); // Max lat, max lng
      expect(isInKorea(32.9, 126.0)).toBe(false); // Below min lat
      expect(isInKorea(43.1, 126.0)).toBe(false); // Above max lat
      expect(isInKorea(37.0, 123.9)).toBe(false); // Below min lng
      expect(isInKorea(37.0, 132.1)).toBe(false); // Above max lng
    });
  });

  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      expect(calculateDistance(37.5665, 126.978, 37.5665, 126.978)).toBe(0);
    });

    it('should calculate distance between Seoul and Busan (~325km)', () => {
      // Seoul: 37.5665° N, 126.9780° E
      // Busan: 35.1796° N, 129.0756° E
      const distance = calculateDistance(37.5665, 126.978, 35.1796, 129.0756);
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(350);
    });

    it('should calculate distance between Seoul and Jeju (~450km)', () => {
      // Seoul: 37.5665° N, 126.9780° E
      // Jeju: 33.4996° N, 126.5312° E
      const distance = calculateDistance(37.5665, 126.978, 33.4996, 126.5312);
      expect(distance).toBeGreaterThan(400);
      expect(distance).toBeLessThan(500);
    });

    it('should calculate short distances accurately', () => {
      // Gyeongbokgung to Bukchon (about 0.5-1km)
      const distance = calculateDistance(37.5796, 126.977, 37.5826, 126.9831);
      expect(distance).toBeGreaterThan(0.3);
      expect(distance).toBeLessThan(1.5);
    });

    it('should be symmetric', () => {
      const d1 = calculateDistance(37.5665, 126.978, 35.1796, 129.0756);
      const d2 = calculateDistance(35.1796, 129.0756, 37.5665, 126.978);
      expect(d1).toBeCloseTo(d2, 5);
    });

    it('should handle international distances', () => {
      // Seoul to Tokyo (about 1,160km)
      const distance = calculateDistance(37.5665, 126.978, 35.6762, 139.6503);
      expect(distance).toBeGreaterThan(1100);
      expect(distance).toBeLessThan(1200);
    });

    it('should return reasonable values for any valid coordinates', () => {
      const distance = calculateDistance(0, 0, 90, 180);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20100); // Half of Earth's circumference
    });
  });
});
