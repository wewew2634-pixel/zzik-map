/**
 * RTL (Right-to-Left) Language Configuration (Phase 5)
 *
 * Centralized RTL language detection and configuration
 * Used with next-intl for automatic direction handling
 *
 * RTL Languages Supported:
 * - ar: Arabic (Modern Standard Arabic - MSA)
 * - ar-AE: Arabic (Gulf/UAE dialect)
 * - ar-SA: Arabic (Saudi Arabia)
 * - he: Hebrew
 * - ur: Urdu
 * - fa: Persian/Farsi
 *
 * WCAG 2.1: Supports linguistic accessibility
 */

export const RTL_LANGUAGES = new Set([
  'ar',      // Arabic
  'ar-AE',   // Arabic (UAE)
  'ar-SA',   // Arabic (Saudi Arabia)
  'ar-EG',   // Arabic (Egypt)
  'ar-JO',   // Arabic (Jordan)
  'ar-KW',   // Arabic (Kuwait)
  'ar-LB',   // Arabic (Lebanon)
  'ar-MA',   // Arabic (Morocco)
  'ar-QA',   // Arabic (Qatar)
  'ar-TN',   // Arabic (Tunisia)
  'he',      // Hebrew
  'iw',      // Hebrew (alternate code)
  'ur',      // Urdu
  'fa',      // Persian
  'ps',      // Pashto
  'yi',      // Yiddish
  'ji',      // Yiddish (alternate)
]);

export const LTR_LANGUAGES = new Set([
  'en',      // English
  'ko',      // Korean
  'ja',      // Japanese
  'zh',      // Chinese (Simplified)
  'zh-CN',   // Chinese (Simplified)
  'zh-TW',   // Chinese (Traditional)
  'th',      // Thai
  'es',      // Spanish
  'fr',      // French
  'de',      // German
  'it',      // Italian
  'pt',      // Portuguese
  'ru',      // Russian
  'vi',      // Vietnamese
]);

/**
 * Determine if a language is RTL
 * @param locale Language code (e.g., 'ar', 'ar-SA', 'en')
 * @returns true if RTL, false if LTR
 */
export function isRTL(locale: string): boolean {
  // Check exact match first
  if (RTL_LANGUAGES.has(locale)) {
    return true;
  }

  // Check base language (e.g., 'ar' from 'ar-SA')
  const baseLanguage = locale.split('-')[0];
  return RTL_LANGUAGES.has(baseLanguage);
}

/**
 * Get document direction attribute
 * @param locale Language code
 * @returns 'rtl' or 'ltr'
 */
export function getDirection(locale: string): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Locale configuration with RTL support
 */
export const LOCALE_CONFIG = {
  // English
  en: { name: 'English', direction: 'ltr' as const, flag: '🇺🇸' },

  // Korean (Primary Market)
  ko: { name: '한국어', direction: 'ltr' as const, flag: '🇰🇷' },

  // Asian Languages
  ja: { name: '日本語', direction: 'ltr' as const, flag: '🇯🇵' },
  'zh-CN': { name: '中文 (简体)', direction: 'ltr' as const, flag: '🇨🇳' },
  'zh-TW': { name: '中文 (繁體)', direction: 'ltr' as const, flag: '🇹🇼' },
  th: { name: 'ไทย', direction: 'ltr' as const, flag: '🇹🇭' },

  // Arabic (RTL)
  ar: { name: 'العربية', direction: 'rtl' as const, flag: '🇸🇦' },
  'ar-AE': { name: 'العربية (الإمارات)', direction: 'rtl' as const, flag: '🇦🇪' },
  'ar-SA': { name: 'العربية (السعودية)', direction: 'rtl' as const, flag: '🇸🇦' },
  'ar-EG': { name: 'العربية (مصر)', direction: 'rtl' as const, flag: '🇪🇬' },

  // Hebrew (RTL)
  he: { name: 'עברית', direction: 'rtl' as const, flag: '🇮🇱' },

  // Urdu (RTL)
  ur: { name: 'اردو', direction: 'rtl' as const, flag: '🇵🇰' },

  // Persian (RTL)
  fa: { name: 'فارسی', direction: 'rtl' as const, flag: '🇮🇷' },
} as const;

/**
 * Get all supported locales
 */
export function getSupportedLocales(): (keyof typeof LOCALE_CONFIG)[] {
  return Object.keys(LOCALE_CONFIG) as (keyof typeof LOCALE_CONFIG)[];
}

/**
 * Get RTL locales only
 */
export function getRTLLocales(): (keyof typeof LOCALE_CONFIG)[] {
  return getSupportedLocales().filter(
    (locale) => LOCALE_CONFIG[locale].direction === 'rtl'
  );
}

/**
 * Get LTR locales only
 */
export function getLTRLocales(): (keyof typeof LOCALE_CONFIG)[] {
  return getSupportedLocales().filter(
    (locale) => LOCALE_CONFIG[locale].direction === 'ltr'
  );
}
