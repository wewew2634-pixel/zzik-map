/**
 * ZZIK MAP - i18n Entry Point
 * V3: Centralized i18n exports
 */

export { locales, defaultLocale, localeNames, localeFlags, isRTL, getLocaleDirection } from './config';
export type { Locale } from './config';

// Message imports
import ko from './messages/ko.json';
import en from './messages/en.json';
import ja from './messages/ja.json';
import zhCN from './messages/zh-CN.json';
import zhTW from './messages/zh-TW.json';
import th from './messages/th.json';

import type { Locale } from './config';

export type Messages = typeof ko;

// Allow partial messages for non-Korean locales (fallback to Korean for missing keys)
export const messages: Record<Locale, Partial<Messages> & Pick<Messages, 'common'>> = {
  ko,
  en: en as Partial<Messages> & Pick<Messages, 'common'>,
  ja: ja as Partial<Messages> & Pick<Messages, 'common'>,
  'zh-CN': zhCN as Partial<Messages> & Pick<Messages, 'common'>,
  'zh-TW': zhTW as Partial<Messages> & Pick<Messages, 'common'>,
  th: th as Partial<Messages> & Pick<Messages, 'common'>,
};

// Type for partial messages (non-Korean locales may not have all keys)
type PartialMessages = Partial<Messages> & Pick<Messages, 'common'>;

/**
 * Get messages for a specific locale
 * Returns partial messages - use Korean fallback for missing keys
 */
export function getMessages(locale: Locale): PartialMessages {
  return messages[locale] || messages['ko'];
}

/**
 * Type-safe translation key getter
 */
export type TranslationKey = keyof Messages;
export type NestedTranslationKey<T extends TranslationKey> = keyof Messages[T];

/**
 * Get a nested translation value
 */
export function getTranslation<T extends TranslationKey>(
  locale: Locale,
  namespace: T,
  key: NestedTranslationKey<T>
): string {
  const msg = messages[locale]?.[namespace];
  if (msg && typeof msg === 'object' && key in msg) {
    return (msg as Record<string, string>)[key as string] || '';
  }
  // Fallback to Korean
  const fallback = messages['ko']?.[namespace];
  if (fallback && typeof fallback === 'object' && key in fallback) {
    return (fallback as Record<string, string>)[key as string] || '';
  }
  return String(key);
}

/**
 * Simple template interpolation for translations
 * Example: interpolate("Max size: {size}MB", { size: 10 }) => "Max size: 10MB"
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return values[key]?.toString() ?? `{${key}}`;
  });
}
