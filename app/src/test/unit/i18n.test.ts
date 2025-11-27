/**
 * ZZIK MAP - i18n Unit Tests
 * V6: Testing internationalization system
 */

import { describe, it, expect } from 'vitest';
import {
  locales,
  defaultLocale,
  localeNames,
  localeFlags,
  isRTL,
  getLocaleDirection,
  messages,
  getMessages,
  interpolate,
} from '@/i18n';

describe('i18n Configuration', () => {
  describe('locales', () => {
    it('should include all supported locales', () => {
      expect(locales).toContain('ko');
      expect(locales).toContain('en');
      expect(locales).toContain('ja');
      expect(locales).toContain('zh-CN');
      expect(locales).toContain('zh-TW');
      expect(locales).toContain('th');
    });

    it('should have 6 supported locales', () => {
      expect(locales).toHaveLength(6);
    });
  });

  describe('defaultLocale', () => {
    it('should be Korean', () => {
      expect(defaultLocale).toBe('ko');
    });

    it('should be included in locales array', () => {
      expect(locales).toContain(defaultLocale);
    });
  });

  describe('localeNames', () => {
    it('should have a name for each locale', () => {
      for (const locale of locales) {
        expect(localeNames[locale]).toBeDefined();
        expect(typeof localeNames[locale]).toBe('string');
        expect(localeNames[locale].length).toBeGreaterThan(0);
      }
    });

    it('should have correct names', () => {
      expect(localeNames['ko']).toBe('한국어');
      expect(localeNames['en']).toBe('English');
      expect(localeNames['ja']).toBe('日本語');
    });
  });

  describe('localeFlags', () => {
    it('should have a flag emoji for each locale', () => {
      for (const locale of locales) {
        expect(localeFlags[locale]).toBeDefined();
        expect(typeof localeFlags[locale]).toBe('string');
      }
    });
  });

  describe('isRTL', () => {
    it('should return false for all supported locales (none are RTL)', () => {
      for (const locale of locales) {
        expect(isRTL(locale)).toBe(false);
      }
    });
  });

  describe('getLocaleDirection', () => {
    it('should return ltr for all supported locales', () => {
      for (const locale of locales) {
        expect(getLocaleDirection(locale)).toBe('ltr');
      }
    });
  });
});

describe('Messages', () => {
  describe('messages object', () => {
    it('should have messages for all locales', () => {
      for (const locale of locales) {
        expect(messages[locale]).toBeDefined();
      }
    });

    it('should have common namespace in all locales', () => {
      for (const locale of locales) {
        expect(messages[locale].common).toBeDefined();
        expect(messages[locale].common.appName).toBe('ZZIK MAP');
      }
    });
  });

  describe('Korean messages (base)', () => {
    it('should have all required namespaces', () => {
      const ko = messages['ko'];
      expect(ko.common).toBeDefined();
      expect(ko.nav).toBeDefined();
      expect(ko.landing).toBeDefined();
      expect(ko.journey).toBeDefined();
      expect(ko.explore).toBeDefined();
      expect(ko.vibe).toBeDefined();
      expect(ko.upload).toBeDefined();
      expect(ko.toast).toBeDefined();
      expect(ko.errors).toBeDefined();
      expect(ko.footer).toBeDefined();
    });

    it('should have all common keys', () => {
      const common = messages['ko'].common;
      expect(common.loading).toBeDefined();
      expect(common.error).toBeDefined();
      expect(common.retry).toBeDefined();
      expect(common.cancel).toBeDefined();
      expect(common.confirm).toBeDefined();
    });

    it('should have nested landing keys', () => {
      const landing = messages['ko'].landing;
      expect(landing).toBeDefined();
      if (landing) {
        expect(landing.badge).toBeDefined();
        expect(landing.subtitle).toBeDefined();
        expect(landing.stats).toBeDefined();
        expect(landing.howItWorks).toBeDefined();
      }
    });
  });

  describe('getMessages', () => {
    it('should return messages for valid locale', () => {
      const koMessages = getMessages('ko');
      expect(koMessages).toBeDefined();
      expect(koMessages.common).toBeDefined();
    });

    it('should return Korean messages for unknown locale', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unknownMessages = getMessages('xx' as any);
      expect(unknownMessages).toEqual(messages['ko']);
    });
  });
});

describe('interpolate', () => {
  it('should replace single placeholder', () => {
    const result = interpolate('Hello {name}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('should replace multiple placeholders', () => {
    const result = interpolate('{greeting} {name}, welcome to {place}!', {
      greeting: 'Hello',
      name: 'User',
      place: 'ZZIK MAP',
    });
    expect(result).toBe('Hello User, welcome to ZZIK MAP!');
  });

  it('should handle numeric values', () => {
    const result = interpolate('Max size: {size}MB', { size: 10 });
    expect(result).toBe('Max size: 10MB');
  });

  it('should leave unmatched placeholders as-is', () => {
    const result = interpolate('Hello {name}!', {});
    expect(result).toBe('Hello {name}!');
  });

  it('should handle empty string template', () => {
    const result = interpolate('', { name: 'test' });
    expect(result).toBe('');
  });

  it('should handle template with no placeholders', () => {
    const result = interpolate('No placeholders here', { name: 'ignored' });
    expect(result).toBe('No placeholders here');
  });

  it('should handle multiple occurrences of same placeholder', () => {
    const result = interpolate('{x} + {x} = {result}', { x: 2, result: 4 });
    expect(result).toBe('2 + 2 = 4');
  });

  it('should handle Korean text with placeholders', () => {
    const result = interpolate('총 {count}명의 여행자', { count: 847 });
    expect(result).toBe('총 847명의 여행자');
  });

  it('should handle zero values', () => {
    const result = interpolate('Count: {count}', { count: 0 });
    expect(result).toBe('Count: 0');
  });
});
