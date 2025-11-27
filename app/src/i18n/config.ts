/**
 * ZZIK MAP - i18n Configuration
 * V3: 6-language support foundation
 */

export const locales = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ko';

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  th: 'ไทย',
};

export const localeFlags: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇹🇼',
  th: '🇹🇭',
};

// RTL languages (none in our current set)
export const rtlLocales: Locale[] = [];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
