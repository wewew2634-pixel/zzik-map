/**
 * ZZIK MAP - Environment Validation Tests (Phase 2.2)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  hasGeminiApi,
  isDemoMode,
  isProduction,
  isDevelopment,
  isTest,
  hasKakaoApi,
  hasMapbox,
  getAppVersion,
} from '@/lib/env';

describe('env utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ==========================================================================
  // API Availability Tests
  // ==========================================================================
  describe('hasGeminiApi', () => {
    it('should return true when GEMINI_API_KEY is set', () => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      expect(hasGeminiApi()).toBe(true);
    });

    it('should return false when GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;
      expect(hasGeminiApi()).toBe(false);
    });

    it('should return false when GEMINI_API_KEY is empty', () => {
      process.env.GEMINI_API_KEY = '';
      expect(hasGeminiApi()).toBe(false);
    });
  });

  describe('isDemoMode', () => {
    it('should return true when Gemini API is not available', () => {
      delete process.env.GEMINI_API_KEY;
      expect(isDemoMode()).toBe(true);
    });

    it('should return false when Gemini API is available', () => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      expect(isDemoMode()).toBe(false);
    });
  });

  // ==========================================================================
  // Environment Detection Tests
  // ==========================================================================
  describe('isProduction', () => {
    it('should return true in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    it('should return true in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isTest', () => {
    it('should return true in test environment', () => {
      process.env.NODE_ENV = 'test';
      expect(isTest()).toBe(true);
    });

    it('should return false in other environments', () => {
      process.env.NODE_ENV = 'development';
      expect(isTest()).toBe(false);
    });
  });

  // ==========================================================================
  // Map API Tests
  // ==========================================================================
  describe('hasKakaoApi', () => {
    it('should return true when NEXT_PUBLIC_KAKAO_MAP_KEY is set', () => {
      process.env.NEXT_PUBLIC_KAKAO_MAP_KEY = 'test-kakao-key';
      expect(hasKakaoApi()).toBe(true);
    });

    it('should return false when NEXT_PUBLIC_KAKAO_MAP_KEY is not set', () => {
      delete process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
      expect(hasKakaoApi()).toBe(false);
    });
  });

  describe('hasMapbox', () => {
    it('should return true when NEXT_PUBLIC_MAPBOX_TOKEN is set', () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-mapbox-token';
      expect(hasMapbox()).toBe(true);
    });

    it('should return false when NEXT_PUBLIC_MAPBOX_TOKEN is not set', () => {
      delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      expect(hasMapbox()).toBe(false);
    });
  });

  // ==========================================================================
  // Version Tests
  // ==========================================================================
  describe('getAppVersion', () => {
    it('should return npm_package_version when set', () => {
      process.env.npm_package_version = '1.2.3';
      expect(getAppVersion()).toBe('1.2.3');
    });

    it('should return default version when not set', () => {
      delete process.env.npm_package_version;
      expect(getAppVersion()).toBe('3.0.0');
    });
  });
});
