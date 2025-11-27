'use client';

/**
 * ZZIK MAP - Translation Hook V4
 * Deep nested path support with interpolation
 */

import { useCallback, useMemo } from 'react';
import { useUIStore } from '@/stores/app';
import {
  messages,
  interpolate,
  type Locale,
  type Messages,
} from '@/i18n';

// Type for messages that may be partial (non-Korean locales fallback to Korean)
type PartialMessages = Partial<Messages> & Pick<Messages, 'common'>;

export interface UseTranslationReturn {
  locale: Locale;
  t: (...args: (string | Record<string, string | number>)[]) => string;
  setLocale: (locale: Locale) => void;
  messages: PartialMessages;
}

/**
 * Get nested value from object using path segments
 */
function getNestedValue(obj: unknown, paths: string[]): string | undefined {
  let current: unknown = obj;
  for (const path of paths) {
    if (current && typeof current === 'object' && path in current) {
      current = (current as Record<string, unknown>)[path];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Translation hook that integrates with Zustand UI store
 *
 * @example
 * const { t, locale, setLocale } = useTranslation();
 *
 * // Simple usage
 * t('common', 'loading') // "로딩 중..."
 *
 * // Nested paths
 * t('landing', 'stats', 'destinations') // "목적지"
 * t('landing', 'howItWorks', 'step1', 'title') // "사진 업로드"
 *
 * // With interpolation (last argument is object)
 * t('upload', 'maxSize', { size: 10 }) // "최대 파일 크기: 10MB"
 * t('landing', 'journeySection', 'description', { count: '847' })
 */
export function useTranslation(): UseTranslationReturn {
  const { language: locale, setLanguage: setLocale } = useUIStore();

  const currentMessages = useMemo(() => {
    return messages[locale] || messages['ko'];
  }, [locale]);

  const t = useCallback(
    (...args: (string | Record<string, string | number>)[]): string => {
      // Check if last argument is interpolation values
      let values: Record<string, string | number> | undefined;
      let paths: string[];

      const lastArg = args[args.length - 1];
      if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg)) {
        values = lastArg as Record<string, string | number>;
        paths = args.slice(0, -1) as string[];
      } else {
        paths = args as string[];
      }

      // Try to get from current locale
      let text = getNestedValue(currentMessages, paths);

      // Fallback to Korean if not found
      if (text === undefined) {
        text = getNestedValue(messages['ko'], paths);
      }

      // Final fallback to the last path segment
      if (text === undefined) {
        text = paths[paths.length - 1] || '';
      }

      // Apply interpolation if values provided
      if (values) {
        return interpolate(text, values);
      }

      return text;
    },
    [currentMessages]
  );

  return {
    locale,
    t,
    setLocale,
    messages: currentMessages,
  };
}

/**
 * Get a specific namespace of translations
 * Useful for components that only need one namespace
 */
export function useNamespace(namespace: string) {
  const { locale, t, setLocale } = useTranslation();

  const tns = useCallback(
    (...args: (string | Record<string, string | number>)[]) => {
      return t(namespace, ...args);
    },
    [t, namespace]
  );

  return {
    locale,
    t: tns,
    setLocale,
  };
}
