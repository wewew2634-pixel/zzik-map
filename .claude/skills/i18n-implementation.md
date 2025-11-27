# i18n Implementation Skill

## When to Use
Invoke this skill when working on:
- Multi-language support
- Translation management
- Locale-specific formatting
- RTL support (future)

---

## Setup with next-intl

### Install
```bash
pnpm add next-intl
```

### Configuration

#### middleware.ts
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'th'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // Only show prefix for non-default
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

#### i18n.ts
```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

#### next.config.js
```javascript
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

module.exports = withNextIntl({
  // Other Next.js config
});
```

---

## Translation Files Structure

```
/app/src/messages/
├── en.json
├── ko.json
├── ja.json
├── zh-CN.json
├── zh-TW.json
└── th.json
```

### Example: en.json
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "home": "Home",
    "journey": "Journey",
    "vibe": "Vibe Match",
    "mapbox": "MAP BOX",
    "profile": "Profile"
  },
  "journey": {
    "title": "Journey Intelligence",
    "uploadPhoto": "Upload a photo",
    "getRecommendations": "Get Recommendations",
    "recommendation": {
      "title": "Recommended for you",
      "travelers": "{count} travelers chose this",
      "travelersWithNationality": "{count} {nationality} travelers chose this"
    }
  },
  "vibe": {
    "title": "Vibe Matching",
    "findSimilar": "Find similar places",
    "matchScore": "{score}% match",
    "categories": {
      "cozy": "Cozy",
      "modern": "Modern",
      "vintage": "Vintage",
      "minimal": "Minimal",
      "romantic": "Romantic",
      "industrial": "Industrial",
      "nature": "Nature",
      "luxury": "Luxury"
    }
  }
}
```

### Example: ko.json
```json
{
  "common": {
    "loading": "로딩 중...",
    "error": "문제가 발생했습니다",
    "retry": "다시 시도",
    "save": "저장",
    "cancel": "취소"
  },
  "navigation": {
    "home": "홈",
    "journey": "여정",
    "vibe": "바이브 매칭",
    "mapbox": "MAP BOX",
    "profile": "프로필"
  },
  "journey": {
    "title": "Journey Intelligence",
    "uploadPhoto": "사진 업로드",
    "getRecommendations": "추천받기",
    "recommendation": {
      "title": "당신을 위한 추천",
      "travelers": "{count}명의 여행자가 선택한 곳",
      "travelersWithNationality": "{count}명의 {nationality} 여행자가 선택한 곳"
    }
  },
  "vibe": {
    "title": "바이브 매칭",
    "findSimilar": "비슷한 장소 찾기",
    "matchScore": "{score}% 매칭",
    "categories": {
      "cozy": "아늑한",
      "modern": "모던한",
      "vintage": "빈티지",
      "minimal": "미니멀",
      "romantic": "로맨틱",
      "industrial": "인더스트리얼",
      "nature": "자연",
      "luxury": "럭셔리"
    }
  }
}
```

---

## Usage in Components

### Client Components
```typescript
'use client';

import { useTranslations } from 'next-intl';

export function VibeCard() {
  const t = useTranslations('vibe');

  return (
    <div>
      <h2>{t('title')}</h2>
      <button>{t('findSimilar')}</button>
    </div>
  );
}
```

### With Variables
```typescript
// Message: "{count} travelers chose this"
t('journey.recommendation.travelers', { count: 523 });
// Output: "523 travelers chose this"

// Message with nationality
t('journey.recommendation.travelersWithNationality', {
  count: 847,
  nationality: 'Japanese'
});
// Output: "847 Japanese travelers chose this"
```

### Server Components
```typescript
import { getTranslations } from 'next-intl/server';

export async function JourneyPage() {
  const t = await getTranslations('journey');

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

---

## Number & Date Formatting

### Number Formatting
```typescript
import { useFormatter } from 'next-intl';

function Stats() {
  const format = useFormatter();

  return (
    <span>
      {format.number(1234567, { style: 'decimal' })}
      {/* en: 1,234,567 */}
      {/* ko: 1,234,567 */}
    </span>
  );
}
```

### Date Formatting
```typescript
function DateDisplay({ date }: { date: Date }) {
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
```typescript
function TimeAgo({ date }: { date: Date }) {
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

## Language Switcher

```typescript
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

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
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

## Typography by Language

### CSS Variables
```css
:root {
  --font-ko: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  --font-ja: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', sans-serif;
  --font-zh: 'Noto Sans SC', 'PingFang SC', sans-serif;
  --font-th: 'Noto Sans Thai', 'Sarabun', sans-serif;

  --line-height-ko: 1.6;
  --line-height-ja: 1.7;
  --line-height-zh: 1.6;
  --line-height-th: 1.8;
}

[lang='ko'] {
  font-family: var(--font-ko);
  line-height: var(--line-height-ko);
}

[lang='ja'] {
  font-family: var(--font-ja);
  line-height: var(--line-height-ja);
}

[lang='th'] {
  font-family: var(--font-th);
  line-height: var(--line-height-th);
}
```

---

## Pluralization

### English (complex rules)
```json
{
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{count} items"
  }
}
```

### Korean (simpler)
```json
{
  "items": "{count}개의 항목"
}
```

### Usage
```typescript
t('items', { count: 5 });
// en: "5 items"
// ko: "5개의 항목"
```

---

## Best Practices

1. **Key Naming**: Use dot notation for hierarchy
   - Good: `journey.recommendation.title`
   - Bad: `journey_recommendation_title`

2. **Variables**: Use descriptive names
   - Good: `{count}명의 {nationality} 여행자`
   - Bad: `{0}명의 {1} 여행자`

3. **Context**: Add context for translators
   ```json
   {
     "save_button": "Save",
     "save_action": "Save changes"
   }
   ```

4. **Avoid concatenation**: Don't build strings in code
   - Bad: `t('hello') + ' ' + name`
   - Good: `t('greeting', { name })`

5. **Test all languages**: Check for text overflow
