# /zzik-i18n Command

Internationalization management for ZZIK MAP (6 languages).

---

## Usage

```
/zzik-i18n [operation] [options]
```

---

## Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `ko` | 한국어 (Korean) | Primary |
| `en` | English | Default |
| `ja` | 日本語 (Japanese) | Supported |
| `zh-CN` | 简体中文 (Simplified Chinese) | Supported |
| `zh-TW` | 繁體中文 (Traditional Chinese) | Supported |
| `th` | ภาษาไทย (Thai) | Supported |

---

## Translation Files

### Location
```
/app/src/messages/
├── en.json      # English (default)
├── ko.json      # Korean
├── ja.json      # Japanese
├── zh-CN.json   # Simplified Chinese
├── zh-TW.json   # Traditional Chinese
└── th.json      # Thai
```

### Structure Example
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "home": "Home",
    "journey": "Journey",
    "vibe": "Vibe Match",
    "mapbox": "MAP BOX"
  },
  "journey": {
    "title": "Journey Intelligence",
    "uploadPhoto": "Upload a photo",
    "recommendation": {
      "title": "Recommended for you",
      "travelers": "{count} travelers chose this"
    }
  }
}
```

---

## Add New Translation Key

### 1. Add to English (base)
```json
// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}
```

### 2. Add to All Other Languages
```bash
# Run sync script (if available)
pnpm i18n:sync

# Or manually add to each file
```

### 3. Use in Component
```tsx
import { useTranslations } from 'next-intl';

export function NewFeature() {
  const t = useTranslations('newFeature');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

---

## Check Missing Translations

### Manual Check
```bash
# Compare keys between files
node scripts/check-i18n.js

# Example script
const en = require('./messages/en.json');
const ko = require('./messages/ko.json');

function getMissingKeys(base, target, prefix = '') {
  const missing = [];
  for (const key of Object.keys(base)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof base[key] === 'object') {
      missing.push(...getMissingKeys(base[key], target?.[key] || {}, path));
    } else if (!target?.[key]) {
      missing.push(path);
    }
  }
  return missing;
}

console.log('Missing in ko:', getMissingKeys(en, ko));
```

### Automated Check (CI)
```yaml
# .github/workflows/i18n-check.yml
- name: Check translations
  run: node scripts/check-i18n.js
```

---

## Variable Interpolation

### Simple Variables
```json
// Message
{ "greeting": "Hello, {name}!" }
```
```tsx
t('greeting', { name: 'John' })
// Output: "Hello, John!"
```

### Plural Forms
```json
// English
{
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{count} items"
  }
}

// Korean (no plural forms)
{
  "items": "{count}개의 항목"
}
```
```tsx
t('items', { count: 5 })
// en: "5 items"
// ko: "5개의 항목"
```

### Rich Text
```json
{ "welcome": "Welcome to <bold>ZZIK MAP</bold>" }
```
```tsx
t.rich('welcome', {
  bold: (chunks) => <strong>{chunks}</strong>
})
```

---

## Language Switcher

### Component
```tsx
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/client';

const locales = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'th', label: 'ภาษาไทย' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
    >
      {locales.map((loc) => (
        <option key={loc.code} value={loc.code}>
          {loc.label}
        </option>
      ))}
    </select>
  );
}
```

---

## Date & Number Formatting

### Numbers
```tsx
import { useFormatter } from 'next-intl';

function Stats() {
  const format = useFormatter();

  return (
    <span>
      {format.number(1234567)}
      {/* en: 1,234,567 */}
      {/* ko: 1,234,567 */}
    </span>
  );
}
```

### Dates
```tsx
function DateDisplay({ date }) {
  const format = useFormatter();

  return (
    <span>
      {format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
      {/* en: November 26, 2025 */}
      {/* ko: 2025년 11월 26일 */}
    </span>
  );
}
```

### Relative Time
```tsx
function TimeAgo({ date }) {
  const format = useFormatter();

  return (
    <span>
      {format.relativeTime(date)}
      {/* en: 2 hours ago */}
      {/* ko: 2시간 전 */}
    </span>
  );
}
```

---

## Testing Translations

### Unit Test
```tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

function renderWithI18n(component) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  );
}

test('shows translated text', () => {
  renderWithI18n(<JourneyTitle />);
  expect(screen.getByText('Journey Intelligence')).toBeInTheDocument();
});
```

### Visual Testing
```bash
# Run app in each language
NEXT_LOCALE=ko pnpm dev
NEXT_LOCALE=ja pnpm dev
NEXT_LOCALE=zh-CN pnpm dev
```

---

## Best Practices

### 1. Key Naming
```json
// Good: Hierarchical with dots
{
  "journey": {
    "recommendation": {
      "title": "Recommended"
    }
  }
}

// Bad: Flat with underscores
{
  "journey_recommendation_title": "Recommended"
}
```

### 2. Avoid Concatenation
```tsx
// Bad
t('hello') + ' ' + name

// Good
t('greeting', { name })
```

### 3. Context for Translators
```json
{
  "save_button": "Save",
  "save_action": "Save changes"
}
```

### 4. Test Text Length
- German text is ~30% longer than English
- Chinese/Japanese may be shorter
- Thai requires more line height

---

## Quick Reference

| Task | Command/Action |
|------|----------------|
| Add translation | Edit `messages/*.json` |
| Use in component | `useTranslations('namespace')` |
| Format number | `useFormatter().number()` |
| Format date | `useFormatter().dateTime()` |
| Switch locale | `router.replace(path, { locale })` |
| Check missing | `node scripts/check-i18n.js` |
| Test locale | `NEXT_LOCALE=ko pnpm dev` |

---

## Translation Priority

### Phase 1 (MVP)
- common.*
- navigation.*
- journey.*
- errors.*

### Phase 2
- vibe.*
- profile.*
- settings.*

### Phase 3
- mapbox.*
- admin.*
- legal.*
