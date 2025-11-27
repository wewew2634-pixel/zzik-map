# ZZIK MAP Design System V3
## Enterprise-Grade Design Architecture

---

<div align="center">

**Version 3.0** | **Catalyst UI Kit** | **Tailwind CSS v4**

*"여행의 순간을 찍고, 다음 여정을 발견하다"*

</div>

---

## Table of Contents

1. [Design Architecture](#1-design-architecture)
2. [Token System](#2-token-system)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [Spacing & Grid](#5-spacing--grid)
6. [Elevation & Depth](#6-elevation--depth)
7. [Motion System](#7-motion-system)
8. [Component API](#8-component-api)
9. [Interaction States](#9-interaction-states)
10. [Responsive System](#10-responsive-system)
11. [Theme System](#11-theme-system)
12. [Internationalization](#12-internationalization)
13. [Accessibility](#13-accessibility)
14. [Pattern Library](#14-pattern-library)
15. [Implementation](#15-implementation)

---

## 1. Design Architecture

### 1.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ZZIK Design System V3                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │   Tokens    │ → │  Primitives │ → │  Components │ → │  Patterns   │     │
│  │   Layer     │   │   Layer     │   │   Layer     │   │   Layer     │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│        ↓                 ↓                 ↓                 ↓              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Application Layer                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │ Journey │  │  Vibe   │  │ MAP BOX │  │  Auth   │  │ Profile │   │   │
│  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Photo-Centric** | 사용자 사진이 항상 주인공 | 낮은 채도 UI, 사진 영역 최대화 |
| **Dark First** | 다크모드 기본, 사진이 돋보이는 환경 | `deep-space-800` 기본 배경 |
| **Instant Clarity** | 복잡한 정보를 즉시 이해 | 명확한 시각적 계층, 일관된 패턴 |
| **Global Ready** | 전 세계 사용자를 위한 설계 | 6개 언어, RTL 지원, 문화적 고려 |
| **Motion with Purpose** | 의미 있는 애니메이션만 사용 | 피드백, 상태 전환, 방향 안내 |

### 1.3 File Architecture

```
/home/ubuntu/zzik-map/app/src/
├── styles/
│   ├── globals.css           # Central import (modular architecture)
│   ├── tokens/
│   │   ├── colors.css        # ✅ Full color palette with @theme
│   │   ├── typography.css    # ✅ Fluid type scale, i18n fonts
│   │   ├── spacing.css       # ✅ 4px base spacing system
│   │   └── motion.css        # ✅ Animations, keyframes, easing
│   ├── themes/
│   │   ├── dark.css          # ✅ Dark theme (default)
│   │   └── light.css         # ✅ Light theme overrides
│   ├── components/
│   │   ├── buttons.css       # ✅ Button variants & sizes
│   │   ├── badges.css        # ✅ Badge & vibe category styles
│   │   └── cards.css         # ✅ Card variants & elevation
│   └── patterns/
│       ├── journey.css       # ✅ Journey timeline, photo upload
│       └── map.css           # ✅ Map markers, popups, controls
│
├── components/
│   ├── catalyst/             # Catalyst UI Kit (DO NOT MODIFY)
│   │   ├── index.ts
│   │   └── ... (27 components)
│   │
│   ├── zzik/                  # ✅ ZZIK Custom Components (15 TSX)
│   │   ├── index.ts          # Central export
│   │   ├── core/             # Core building blocks
│   │   │   ├── ZzikButton.tsx    # ✅ Implemented
│   │   │   ├── ZzikCard.tsx      # ✅ Implemented
│   │   │   └── ZzikBadge.tsx     # ✅ Implemented
│   │   ├── journey/          # Journey feature components
│   │   │   ├── PhotoUpload.tsx       # ✅ Implemented
│   │   │   ├── JourneyTimeline.tsx   # ✅ Implemented
│   │   │   └── RecommendationCard.tsx # ✅ Implemented
│   │   ├── vibe/             # Vibe feature components
│   │   │   ├── VibeScore.tsx     # ✅ Implemented
│   │   │   ├── VibeBadge.tsx     # ✅ Implemented
│   │   │   └── VibeCard.tsx      # ✅ Implemented
│   │   ├── map/              # Map components
│   │   │   ├── MapMarker.tsx     # ✅ Implemented
│   │   │   └── MapPopup.tsx      # ✅ Implemented
│   │   └── shared/           # Shared UI elements
│   │       ├── GlassPanel.tsx    # ✅ Implemented
│   │       ├── EmptyState.tsx    # ✅ Implemented
│   │       └── Skeleton.tsx      # ✅ Implemented
│   │
│   └── layouts/
│       ├── AppLayout.tsx
│       ├── AuthLayout.tsx
│       └── PublicLayout.tsx
│
└── lib/
    ├── index.ts              # ✅ Central export
    ├── utils.ts              # Utility functions (cn)
    ├── design-tokens.ts      # ✅ Full TypeScript token export
    └── vibe-utils.ts         # ✅ Vibe category utilities
```

---

## 2. Token System

### 2.1 Token Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 4: Component Tokens (가장 구체적)                                  │
│ --btn-primary-bg, --card-border-radius, --input-focus-ring              │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 3: Semantic Tokens (용도별)                                        │
│ --surface-base, --text-primary, --interactive-primary                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Alias Tokens (별칭)                                             │
│ --color-brand, --color-accent, --color-background                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Primitive Tokens (원시값, 가장 기본)                             │
│ --color-zzik-coral-500, --spacing-4, --font-size-base                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Token Naming Convention

```
--{category}-{property}-{variant}-{state}

Examples:
--color-zzik-coral-500          # Primitive
--color-brand-primary           # Alias
--surface-raised                # Semantic
--btn-primary-bg-hover          # Component + State
```

### 2.3 Token Categories

| Category | Prefix | Description |
|----------|--------|-------------|
| Color | `--color-*` | 모든 색상 값 |
| Typography | `--font-*`, `--text-*` | 폰트, 크기, 행간 |
| Spacing | `--space-*`, `--gap-*` | 여백, 간격 |
| Size | `--size-*` | 컴포넌트 크기 |
| Radius | `--radius-*` | 모서리 둥글기 |
| Shadow | `--shadow-*` | 그림자 |
| Z-Index | `--z-*` | 레이어 순서 |
| Duration | `--duration-*` | 애니메이션 시간 |
| Easing | `--ease-*` | 애니메이션 곡선 |

---

## 3. Color System

### 3.1 Brand Colors

#### ZZIK Coral (Primary)
```
Purpose: 주요 CTA, 브랜드 강조, 활성 상태
Psychology: 열정, 여행의 설렘, 한국의 따뜻함

Scale:
┌────────┬────────────┬─────────────────────────────────────────────┐
│ Token  │ Hex        │ Usage                                       │
├────────┼────────────┼─────────────────────────────────────────────┤
│ 50     │ #FFF5F5    │ Subtle bg, hover state (light)              │
│ 100    │ #FFE5E6    │ Selected state bg (light)                   │
│ 200    │ #FFCCD0    │ Border (light), disabled bg                 │
│ 300    │ #FFA3A8    │ Icon secondary, placeholder                 │
│ 400    │ #FF7A80    │ Hover state, secondary text                 │
│ 500    │ #FF5A5F    │ ★ PRIMARY - Buttons, links, active          │
│ 600    │ #E84E52    │ Pressed state, borders                      │
│ 700    │ #CC4246    │ Dark accent, visited links                  │
│ 800    │ #A3353A    │ Text on light bg                            │
│ 900    │ #7A282C    │ Heading on light bg                         │
│ 950    │ #4A1A1C    │ High contrast text                          │
└────────┴────────────┴─────────────────────────────────────────────┘
```

#### Deep Space (Background)
```
Purpose: 배경, 표면, 컨테이너
Psychology: 신뢰, 안정감, 프리미엄

Scale:
┌────────┬────────────┬─────────────────────────────────────────────┐
│ Token  │ Hex        │ Usage                                       │
├────────┼────────────┼─────────────────────────────────────────────┤
│ 50     │ #E8EBF0    │ Text on dark (muted)                        │
│ 100    │ #C5CDD9    │ Disabled text                               │
│ 200    │ #9DABC0    │ Placeholder text                            │
│ 300    │ #7589A6    │ Secondary icons                             │
│ 400    │ #506B8C    │ Tertiary text                               │
│ 500    │ #2D4A6B    │ Scrollbar, subtle elements                  │
│ 600    │ #1A3250    │ ★ ELEVATED - Cards, modals, overlays        │
│ 700    │ #122340    │ ★ RAISED - Card backgrounds                 │
│ 800    │ #0A1628    │ ★ BASE - Primary background                 │
│ 900    │ #050B14    │ SUNKEN - Inset areas, wells                 │
│ 950    │ #020408    │ Absolute black                              │
└────────┴────────────┴─────────────────────────────────────────────┘
```

#### Electric Cyan (Accent)
```
Purpose: 보조 강조, 인터랙션, 포커스
Psychology: 발견, 기술, 미래지향

Scale:
┌────────┬────────────┬─────────────────────────────────────────────┐
│ Token  │ Hex        │ Usage                                       │
├────────┼────────────┼─────────────────────────────────────────────┤
│ 50     │ #E5FCFF    │ Info bg (light)                             │
│ 100    │ #CCF9FF    │ Highlight bg                                │
│ 200    │ #99F3FF    │ Badge bg                                    │
│ 300    │ #66ECFF    │ Active state indicator                      │
│ 400    │ #33E6FF    │ Hover state                                 │
│ 500    │ #00D9FF    │ ★ ACCENT - Focus ring, links, active        │
│ 600    │ #00B8D9    │ Pressed state                               │
│ 700    │ #0097B3    │ Dark accent                                 │
│ 800    │ #00768C    │ Text on light bg                            │
│ 900    │ #005566    │ High contrast                               │
│ 950    │ #003D4D    │ Darkest                                     │
└────────┴────────────┴─────────────────────────────────────────────┘
```

### 3.2 Semantic Colors

```css
/* Surface Hierarchy */
--surface-base:     var(--color-deep-space-800);  /* Main background */
--surface-raised:   var(--color-deep-space-700);  /* Cards, panels */
--surface-overlay:  var(--color-deep-space-600);  /* Modals, popovers */
--surface-sunken:   var(--color-deep-space-900);  /* Inset areas */
--surface-inverse:  var(--color-gray-50);         /* Light mode surfaces */

/* Text Hierarchy */
--text-primary:     #FFFFFF;                      /* Main text */
--text-secondary:   var(--color-gray-400);        /* Supporting text */
--text-tertiary:    var(--color-gray-500);        /* Captions, hints */
--text-disabled:    var(--color-gray-600);        /* Disabled text */
--text-inverse:     var(--color-deep-space-900);  /* Text on light */
--text-brand:       var(--color-zzik-coral-500);  /* Brand colored text */
--text-accent:      var(--color-electric-cyan-500); /* Accent text */

/* Border Hierarchy */
--border-subtle:    rgba(255, 255, 255, 0.05);    /* Faint separation */
--border-default:   rgba(255, 255, 255, 0.10);    /* Standard borders */
--border-strong:    rgba(255, 255, 255, 0.20);    /* Emphasized borders */
--border-focus:     var(--color-electric-cyan-500); /* Focus indicators */
--border-error:     var(--color-error);           /* Error state */

/* Interactive States */
--interactive-primary:        var(--color-zzik-coral-500);
--interactive-primary-hover:  var(--color-zzik-coral-400);
--interactive-primary-active: var(--color-zzik-coral-600);

--interactive-secondary:        var(--color-electric-cyan-500);
--interactive-secondary-hover:  var(--color-electric-cyan-400);
--interactive-secondary-active: var(--color-electric-cyan-600);

--interactive-ghost:        transparent;
--interactive-ghost-hover:  rgba(255, 255, 255, 0.05);
--interactive-ghost-active: rgba(255, 255, 255, 0.10);
```

### 3.3 Status Colors

```css
/* Success */
--color-success:        #22C55E;
--color-success-subtle: rgba(34, 197, 94, 0.15);
--color-success-text:   #4ADE80;

/* Warning */
--color-warning:        #F59E0B;
--color-warning-subtle: rgba(245, 158, 11, 0.15);
--color-warning-text:   #FBBF24;

/* Error */
--color-error:          #EF4444;
--color-error-subtle:   rgba(239, 68, 68, 0.15);
--color-error-text:     #F87171;

/* Info */
--color-info:           #3B82F6;
--color-info-subtle:    rgba(59, 130, 246, 0.15);
--color-info-text:      #60A5FA;
```

### 3.4 Vibe Category Colors

```css
/* 8 Vibe Categories for Travel */
--vibe-cozy:        #F9A825;  /* Amber - 아늑한, 포근한 */
--vibe-modern:      #7C4DFF;  /* Violet - 현대적, 세련된 */
--vibe-vintage:     #8D6E63;  /* Brown - 빈티지, 복고풍 */
--vibe-minimal:     #90A4AE;  /* Blue Gray - 미니멀, 심플 */
--vibe-romantic:    #EC407A;  /* Pink - 로맨틱, 감성적 */
--vibe-industrial:  #546E7A;  /* Slate - 인더스트리얼, 도시적 */
--vibe-nature:      #66BB6A;  /* Green - 자연, 힐링 */
--vibe-luxury:      #FFD700;  /* Gold - 럭셔리, 프리미엄 */

/* Vibe Subtle Backgrounds */
--vibe-cozy-subtle:       rgba(249, 168, 37, 0.15);
--vibe-modern-subtle:     rgba(124, 77, 255, 0.15);
--vibe-vintage-subtle:    rgba(141, 110, 99, 0.15);
--vibe-minimal-subtle:    rgba(144, 164, 174, 0.15);
--vibe-romantic-subtle:   rgba(236, 64, 122, 0.15);
--vibe-industrial-subtle: rgba(84, 110, 122, 0.15);
--vibe-nature-subtle:     rgba(102, 187, 106, 0.15);
--vibe-luxury-subtle:     rgba(255, 215, 0, 0.15);
```

### 3.5 Contrast Matrix (WCAG 2.1)

```
┌─────────────────────────┬──────────────────┬──────────┬─────────┐
│ Foreground              │ Background       │ Ratio    │ Grade   │
├─────────────────────────┼──────────────────┼──────────┼─────────┤
│ #FFFFFF (White)         │ Deep Space 800   │ 15.8:1   │ AAA ✓   │
│ #FF5A5F (Coral 500)     │ Deep Space 800   │ 5.2:1    │ AA ✓    │
│ #00D9FF (Cyan 500)      │ Deep Space 800   │ 10.5:1   │ AAA ✓   │
│ #9CA3AF (Gray 400)      │ Deep Space 800   │ 5.4:1    │ AA ✓    │
│ #6B7280 (Gray 500)      │ Deep Space 800   │ 3.7:1    │ AA-lg ✓ │
│ #0A1628 (Deep Space)    │ Cyan 500         │ 10.5:1   │ AAA ✓   │
│ #0A1628 (Deep Space)    │ Coral 500        │ 5.2:1    │ AA ✓    │
│ #0A1628 (Deep Space)    │ White            │ 15.8:1   │ AAA ✓   │
└─────────────────────────┴──────────────────┴──────────┴─────────┘

Legend:
- AAA: Ratio ≥ 7:1 (Enhanced)
- AA: Ratio ≥ 4.5:1 (Normal text)
- AA-lg: Ratio ≥ 3:1 (Large text 18px+)
```

---

## 4. Typography System

### 4.1 Font Stack

```css
/* Primary Font */
--font-sans: 'Pretendard Variable', 'Inter', -apple-system,
             BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;

/* Monospace Font */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono',
             Monaco, 'Inconsolata', monospace;

/* Font Features */
--font-feature-default: 'cv11', 'ss01';
--font-feature-tabular: 'tnum';
```

### 4.2 Type Scale

```css
/* Fluid Type Scale (clamp-based) */
--text-xs:   clamp(0.6875rem, 0.65rem + 0.1vw, 0.75rem);    /* 11-12px */
--text-sm:   clamp(0.8125rem, 0.78rem + 0.1vw, 0.875rem);   /* 13-14px */
--text-base: clamp(0.9375rem, 0.9rem + 0.1vw, 1rem);        /* 15-16px */
--text-lg:   clamp(1.0625rem, 1rem + 0.15vw, 1.125rem);     /* 17-18px */
--text-xl:   clamp(1.1875rem, 1.1rem + 0.2vw, 1.25rem);     /* 19-20px */
--text-2xl:  clamp(1.375rem, 1.25rem + 0.3vw, 1.5rem);      /* 22-24px */
--text-3xl:  clamp(1.6875rem, 1.5rem + 0.4vw, 1.875rem);    /* 27-30px */
--text-4xl:  clamp(2rem, 1.75rem + 0.6vw, 2.25rem);         /* 32-36px */
--text-5xl:  clamp(2.5rem, 2rem + 1vw, 3rem);               /* 40-48px */
--text-6xl:  clamp(3rem, 2.5rem + 1.2vw, 3.75rem);          /* 48-60px */
```

### 4.3 Line Heights

```css
--leading-none:    1;
--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
--leading-loose:   2;

/* Semantic Line Heights */
--leading-heading: var(--leading-tight);
--leading-body:    var(--leading-normal);
--leading-ui:      var(--leading-snug);
```

### 4.4 Font Weights

```css
--font-normal:    400;  /* Body text */
--font-medium:    500;  /* Emphasis, labels */
--font-semibold:  600;  /* Headings, buttons */
--font-bold:      700;  /* Strong emphasis */
```

### 4.5 Letter Spacing

```css
--tracking-tighter: -0.05em;
--tracking-tight:   -0.025em;
--tracking-normal:  0;
--tracking-wide:    0.025em;
--tracking-wider:   0.05em;
--tracking-widest:  0.1em;
```

### 4.6 Typography Presets

```css
/* Display (Hero) */
.text-display {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-tight);
}

/* Heading 1 */
.text-h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

/* Heading 2 */
.text-h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

/* Heading 3 */
.text-h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

/* Heading 4 */
.text-h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

/* Body Large */
.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

/* Body */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* Body Small */
.text-body-sm {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* Caption */
.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);
}

/* Label */
.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-none);
}

/* Button */
.text-button {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-wide);
}
```

### 4.7 Multilingual Typography

```css
/* Korean (한국어) */
:lang(ko) {
  font-family: 'Pretendard Variable', 'Noto Sans KR', sans-serif;
  word-break: keep-all;
}

/* Japanese (日本語) */
:lang(ja) {
  font-family: 'Pretendard Variable', 'Noto Sans JP', sans-serif;
  word-break: normal;
}

/* Chinese Simplified (简体中文) */
:lang(zh-CN) {
  font-family: 'Pretendard Variable', 'Noto Sans SC', sans-serif;
}

/* Chinese Traditional (繁體中文) */
:lang(zh-TW) {
  font-family: 'Pretendard Variable', 'Noto Sans TC', sans-serif;
}

/* Thai (ไทย) */
:lang(th) {
  font-family: 'Pretendard Variable', 'Noto Sans Thai', sans-serif;
  line-height: 1.8; /* Thai needs more line height */
}

/* English */
:lang(en) {
  font-family: 'Pretendard Variable', 'Inter', sans-serif;
}
```

---

## 5. Spacing & Grid

### 5.1 Spacing Scale (4px Base)

```css
/* Base Unit: 4px */
--space-0:    0;
--space-px:   1px;
--space-0.5:  0.125rem;   /* 2px */
--space-1:    0.25rem;    /* 4px */
--space-1.5:  0.375rem;   /* 6px */
--space-2:    0.5rem;     /* 8px */
--space-2.5:  0.625rem;   /* 10px */
--space-3:    0.75rem;    /* 12px */
--space-3.5:  0.875rem;   /* 14px */
--space-4:    1rem;       /* 16px */
--space-5:    1.25rem;    /* 20px */
--space-6:    1.5rem;     /* 24px */
--space-7:    1.75rem;    /* 28px */
--space-8:    2rem;       /* 32px */
--space-9:    2.25rem;    /* 36px */
--space-10:   2.5rem;     /* 40px */
--space-11:   2.75rem;    /* 44px */
--space-12:   3rem;       /* 48px */
--space-14:   3.5rem;     /* 56px */
--space-16:   4rem;       /* 64px */
--space-20:   5rem;       /* 80px */
--space-24:   6rem;       /* 96px */
--space-28:   7rem;       /* 112px */
--space-32:   8rem;       /* 128px */
```

### 5.2 Semantic Spacing

```css
/* Component Internal Spacing */
--space-inset-xs:    var(--space-1);    /* 4px */
--space-inset-sm:    var(--space-2);    /* 8px */
--space-inset-md:    var(--space-4);    /* 16px */
--space-inset-lg:    var(--space-6);    /* 24px */
--space-inset-xl:    var(--space-8);    /* 32px */

/* Component Gap (between elements) */
--space-stack-xs:    var(--space-1);    /* 4px */
--space-stack-sm:    var(--space-2);    /* 8px */
--space-stack-md:    var(--space-4);    /* 16px */
--space-stack-lg:    var(--space-6);    /* 24px */
--space-stack-xl:    var(--space-8);    /* 32px */

/* Inline Spacing */
--space-inline-xs:   var(--space-1);    /* 4px */
--space-inline-sm:   var(--space-2);    /* 8px */
--space-inline-md:   var(--space-3);    /* 12px */
--space-inline-lg:   var(--space-4);    /* 16px */

/* Section Spacing */
--space-section-sm:  var(--space-8);    /* 32px */
--space-section-md:  var(--space-12);   /* 48px */
--space-section-lg:  var(--space-16);   /* 64px */
--space-section-xl:  var(--space-24);   /* 96px */
```

### 5.3 Layout Grid

```css
/* Container Widths */
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;

/* Grid Columns */
--grid-columns: 12;

/* Gutter Sizes */
--gutter-sm: var(--space-4);   /* 16px */
--gutter-md: var(--space-6);   /* 24px */
--gutter-lg: var(--space-8);   /* 32px */

/* Page Margins */
--page-margin-mobile:  var(--space-4);    /* 16px */
--page-margin-tablet:  var(--space-6);    /* 24px */
--page-margin-desktop: var(--space-8);    /* 32px */
```

### 5.4 Sidebar Dimensions

```css
/* Sidebar Layout */
--sidebar-width:           256px;   /* 16rem */
--sidebar-width-collapsed: 64px;    /* 4rem */
--navbar-height:           64px;    /* 4rem */
--navbar-height-mobile:    56px;    /* 3.5rem */
```

---

## 6. Elevation & Depth

### 6.1 Shadow Scale

```css
/* Shadow Tokens */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.25);

--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.3),
             0 1px 2px -1px rgba(0, 0, 0, 0.3);

--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3),
             0 2px 4px -2px rgba(0, 0, 0, 0.3);

--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3),
             0 4px 6px -4px rgba(0, 0, 0, 0.3);

--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3),
             0 8px 10px -6px rgba(0, 0, 0, 0.3);

--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

/* Inner Shadow */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);

/* Glow Effects */
--shadow-glow-coral: 0 0 20px rgba(255, 90, 95, 0.4);
--shadow-glow-cyan:  0 0 20px rgba(0, 217, 255, 0.4);
--shadow-glow-white: 0 0 20px rgba(255, 255, 255, 0.2);
```

### 6.2 Z-Index Scale

```css
/* Z-Index System */
--z-negative:       -1;
--z-base:           0;
--z-raised:         1;
--z-dropdown:       10;
--z-sticky:         20;
--z-fixed:          30;
--z-modal-backdrop: 40;
--z-modal:          50;
--z-popover:        60;
--z-tooltip:        70;
--z-toast:          80;
--z-max:            9999;
```

### 6.3 Elevation Levels

```css
/* Surface Elevation (combines background + shadow) */

/* Level 0: Base (no elevation) */
.elevation-0 {
  background: var(--surface-base);
  box-shadow: none;
}

/* Level 1: Raised (cards, panels) */
.elevation-1 {
  background: var(--surface-raised);
  box-shadow: var(--shadow-sm);
}

/* Level 2: Overlay (modals, popovers) */
.elevation-2 {
  background: var(--surface-overlay);
  box-shadow: var(--shadow-lg);
}

/* Level 3: Floating (tooltips, toasts) */
.elevation-3 {
  background: var(--surface-overlay);
  box-shadow: var(--shadow-xl);
}
```

---

## 7. Motion System

### 7.1 Duration Tokens

```css
/* Duration Scale */
--duration-instant:  0ms;
--duration-fast:     100ms;   /* Micro-interactions */
--duration-normal:   200ms;   /* Standard transitions */
--duration-slow:     300ms;   /* Complex transitions */
--duration-slower:   500ms;   /* Page transitions */
--duration-slowest:  700ms;   /* Dramatic reveals */

/* Semantic Durations */
--duration-hover:      var(--duration-fast);
--duration-focus:      var(--duration-fast);
--duration-active:     var(--duration-instant);
--duration-enter:      var(--duration-normal);
--duration-exit:       var(--duration-fast);
--duration-expand:     var(--duration-slow);
--duration-collapse:   var(--duration-normal);
--duration-page:       var(--duration-slower);
```

### 7.2 Easing Tokens

```css
/* Standard Easings */
--ease-linear:    linear;
--ease-in:        cubic-bezier(0.4, 0, 1, 1);
--ease-out:       cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);

/* Expressive Easings */
--ease-bounce:    cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth:    cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-snap:      cubic-bezier(0.2, 0, 0, 1);

/* Semantic Easings */
--ease-enter:     var(--ease-out);
--ease-exit:      var(--ease-in);
--ease-move:      var(--ease-in-out);
```

### 7.3 Animation Keyframes

```css
/* Fade */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Scale */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes scale-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

/* Slide */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-left {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-right {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Continuous */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* ZZIK Specific */
@keyframes pulse-glow-coral {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 90, 95, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(255, 90, 95, 0); }
}

@keyframes pulse-glow-cyan {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(0, 217, 255, 0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 7.4 Animation Presets

```css
/* Entrance Animations */
.animate-fade-in     { animation: fade-in var(--duration-normal) var(--ease-enter); }
.animate-scale-in    { animation: scale-in var(--duration-normal) var(--ease-enter); }
.animate-slide-up    { animation: slide-up var(--duration-slow) var(--ease-enter); }
.animate-slide-down  { animation: slide-down var(--duration-slow) var(--ease-enter); }
.animate-slide-left  { animation: slide-left var(--duration-slow) var(--ease-enter); }
.animate-slide-right { animation: slide-right var(--duration-slow) var(--ease-enter); }

/* Continuous Animations */
.animate-spin        { animation: spin 1s linear infinite; }
.animate-pulse       { animation: pulse 2s ease-in-out infinite; }
.animate-bounce      { animation: bounce 1s ease-in-out infinite; }
.animate-float       { animation: float 3s ease-in-out infinite; }

/* ZZIK Animations */
.animate-glow-coral  { animation: pulse-glow-coral 2s ease-in-out infinite; }
.animate-glow-cyan   { animation: pulse-glow-cyan 2s ease-in-out infinite; }
.animate-shimmer     {
  animation: shimmer 1.5s infinite;
  background: linear-gradient(90deg,
    var(--surface-raised) 25%,
    var(--surface-overlay) 50%,
    var(--surface-raised) 75%);
  background-size: 200% 100%;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.5 Transition Presets

```css
/* Common Transitions */
.transition-colors   { transition: color, background-color, border-color var(--duration-hover) var(--ease-move); }
.transition-opacity  { transition: opacity var(--duration-normal) var(--ease-move); }
.transition-transform { transition: transform var(--duration-normal) var(--ease-move); }
.transition-all      { transition: all var(--duration-normal) var(--ease-move); }

/* Interactive Transitions */
.transition-interactive {
  transition:
    color var(--duration-hover) var(--ease-move),
    background-color var(--duration-hover) var(--ease-move),
    border-color var(--duration-hover) var(--ease-move),
    box-shadow var(--duration-hover) var(--ease-move),
    transform var(--duration-hover) var(--ease-move);
}
```

---

## 8. Component API

### 8.1 Button Component

```tsx
interface ButtonProps {
  /** Visual variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';

  /** Color scheme */
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'neutral';

  /** Size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Full width */
  fullWidth?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Left icon */
  leftIcon?: React.ReactNode;

  /** Right icon */
  rightIcon?: React.ReactNode;

  /** As link */
  href?: string;

  /** Click handler */
  onClick?: () => void;

  children: React.ReactNode;
}
```

**Usage Examples:**
```tsx
// Primary solid button
<Button color="primary">Upload Photo</Button>

// Secondary with icon
<Button color="secondary" leftIcon={<SparklesIcon />}>
  Find Vibe Match
</Button>

// Ghost button
<Button variant="ghost">Cancel</Button>

// Loading state
<Button color="primary" loading>
  Processing...
</Button>

// Full width
<Button color="primary" fullWidth>
  Continue
</Button>

// As link
<Button href="/journey/new">Create Journey</Button>

// Size variants
<Button size="xs">Tiny</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### 8.2 Badge Component

```tsx
interface BadgeProps {
  /** Visual variant */
  variant?: 'solid' | 'subtle' | 'outline';

  /** Color scheme */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  /** Vibe category (special) */
  vibe?: 'cozy' | 'modern' | 'vintage' | 'minimal' | 'romantic' | 'industrial' | 'nature' | 'luxury';

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Dot indicator */
  dot?: boolean;

  /** Left icon */
  icon?: React.ReactNode;

  children: React.ReactNode;
}
```

**Usage Examples:**
```tsx
// Status badges
<Badge color="success">Verified</Badge>
<Badge color="warning">Pending</Badge>
<Badge color="error">Failed</Badge>

// Vibe badges
<Badge vibe="cozy">Cozy</Badge>
<Badge vibe="modern">Modern</Badge>
<Badge vibe="romantic">Romantic</Badge>

// With dot indicator
<Badge dot color="success">Online</Badge>

// With icon
<Badge icon={<StarIcon />} color="primary">Featured</Badge>
```

### 8.3 Card Component

```tsx
interface CardProps {
  /** Visual variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';

  /** Interactive (hover effects) */
  interactive?: boolean;

  /** As link */
  href?: string;

  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /** Border radius */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  children: React.ReactNode;
}
```

### 8.4 PhotoCard Component

```tsx
interface PhotoCardProps {
  /** Image source */
  src: string;

  /** Alt text */
  alt: string;

  /** Title */
  title: string;

  /** Location */
  location?: string;

  /** Vibe score (0-100) */
  vibeScore?: number;

  /** Vibe category */
  vibe?: VibeCategory;

  /** Aspect ratio */
  aspect?: 'photo' | 'square' | 'portrait' | 'landscape';

  /** Click handler */
  onClick?: () => void;

  /** Link destination */
  href?: string;
}
```

### 8.5 VibeScore Component

```tsx
interface VibeScoreProps {
  /** Score value (0-100) */
  score: number;

  /** Display variant */
  variant?: 'text' | 'badge' | 'ring' | 'bar';

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Show percentage sign */
  showPercent?: boolean;

  /** Label */
  label?: string;
}
```

### 8.6 JourneyTimeline Component

```tsx
interface JourneyStep {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  status: 'completed' | 'current' | 'upcoming';
  image?: string;
}

interface JourneyTimelineProps {
  /** Timeline steps */
  steps: JourneyStep[];

  /** Orientation */
  orientation?: 'vertical' | 'horizontal';

  /** Show connector line */
  showLine?: boolean;

  /** On step click */
  onStepClick?: (step: JourneyStep) => void;
}
```

### 8.7 PhotoUpload Component

```tsx
interface PhotoUploadProps {
  /** Accepted file types */
  accept?: string;

  /** Max file size (bytes) */
  maxSize?: number;

  /** Multiple files */
  multiple?: boolean;

  /** Upload handler */
  onUpload?: (files: File[]) => Promise<void>;

  /** Error handler */
  onError?: (error: Error) => void;

  /** Progress callback */
  onProgress?: (percent: number) => void;

  /** Current files */
  files?: File[];

  /** Disabled state */
  disabled?: boolean;
}
```

### 8.8 MapMarker Component

```tsx
interface MapMarkerProps {
  /** Position */
  position: { lat: number; lng: number };

  /** Variant */
  variant?: 'default' | 'selected' | 'cluster';

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Pulse animation */
  pulse?: boolean;

  /** Label */
  label?: string;

  /** Count (for clusters) */
  count?: number;

  /** Click handler */
  onClick?: () => void;
}
```

### 8.9 GlassPanel Component

```tsx
interface GlassPanelProps {
  /** Visual variant */
  variant?: 'light' | 'dark' | 'coral' | 'cyan';

  /** Blur intensity */
  blur?: 'sm' | 'md' | 'lg' | 'xl';

  /** Border visibility */
  bordered?: boolean;

  /** Padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /** Border radius */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  children: React.ReactNode;
}
```

### 8.10 EmptyState Component

```tsx
interface EmptyStateProps {
  /** Icon */
  icon?: React.ReactNode;

  /** Title */
  title: string;

  /** Description */
  description?: string;

  /** Primary action */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };

  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## 9. Interaction States

### 9.1 State Definitions

```
┌─────────────┬─────────────────────────────────────────────────────────────┐
│ State       │ Description                                                 │
├─────────────┼─────────────────────────────────────────────────────────────┤
│ Default     │ Initial state, no interaction                               │
│ Hover       │ Mouse cursor over element                                   │
│ Focus       │ Keyboard focus (Tab navigation)                             │
│ Active      │ Currently being pressed/clicked                             │
│ Selected    │ Chosen among options (checkbox, radio, tab)                 │
│ Disabled    │ Cannot be interacted with                                   │
│ Loading     │ Async operation in progress                                 │
│ Error       │ Invalid state or failed validation                          │
│ Success     │ Successfully completed action                               │
│ Dragging    │ Being dragged (drag-and-drop)                               │
│ Expanded    │ Collapsible element is open                                 │
│ Collapsed   │ Collapsible element is closed                               │
└─────────────┴─────────────────────────────────────────────────────────────┘
```

### 9.2 Button States

```css
/* Default */
.btn-primary {
  background: var(--interactive-primary);
  color: white;
}

/* Hover */
.btn-primary:hover:not(:disabled) {
  background: var(--interactive-primary-hover);
}

/* Focus */
.btn-primary:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Active */
.btn-primary:active:not(:disabled) {
  background: var(--interactive-primary-active);
  transform: scale(0.98);
}

/* Disabled */
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading */
.btn-primary[data-loading="true"] {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.btn-primary[data-loading="true"]::after {
  content: '';
  position: absolute;
  /* Spinner styles */
}
```

### 9.3 Input States

```css
/* Default */
.input {
  background: var(--input-bg);
  border: 1px solid var(--border-default);
}

/* Hover */
.input:hover:not(:disabled):not(:focus) {
  border-color: var(--border-strong);
}

/* Focus */
.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.15);
}

/* Error */
.input[data-error="true"] {
  border-color: var(--color-error);
}

.input[data-error="true"]:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

/* Disabled */
.input:disabled {
  background: var(--surface-sunken);
  opacity: 0.6;
  cursor: not-allowed;
}

/* Read-only */
.input:read-only {
  background: var(--surface-sunken);
}
```

### 9.4 Card Interactive States

```css
/* Default */
.card-interactive {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  transition: var(--transition-interactive);
}

/* Hover */
.card-interactive:hover {
  background: var(--surface-overlay);
  border-color: var(--border-default);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Focus */
.card-interactive:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Active */
.card-interactive:active {
  transform: translateY(0);
}

/* Selected */
.card-interactive[data-selected="true"] {
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 1px var(--interactive-primary);
}
```

### 9.5 Upload Zone States

```css
/* Default */
.upload-zone {
  border: 2px dashed var(--border-default);
  background: transparent;
}

/* Hover */
.upload-zone:hover {
  border-color: var(--interactive-primary);
  background: rgba(255, 90, 95, 0.05);
}

/* Dragging Over */
.upload-zone[data-dragging="true"] {
  border-color: var(--interactive-secondary);
  background: rgba(0, 217, 255, 0.05);
  border-style: solid;
}

/* Error */
.upload-zone[data-error="true"] {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

/* Disabled */
.upload-zone:disabled {
  opacity: 0.5;
  pointer-events: none;
}
```

---

## 10. Responsive System

### 10.1 Breakpoints

```css
/* Mobile First Breakpoints */
--bp-xs:  0px;      /* Extra small (default) */
--bp-sm:  640px;    /* Small */
--bp-md:  768px;    /* Medium */
--bp-lg:  1024px;   /* Large */
--bp-xl:  1280px;   /* Extra large */
--bp-2xl: 1536px;   /* 2X Extra large */

/* Device-specific (reference only) */
--bp-mobile:     767px;   /* max-width for mobile */
--bp-tablet:     1023px;  /* max-width for tablet */
--bp-laptop:     1279px;  /* max-width for laptop */
--bp-desktop:    1535px;  /* max-width for desktop */
```

### 10.2 Container Queries

```css
/* Container Query Breakpoints */
@container (min-width: 320px) { /* xs */ }
@container (min-width: 480px) { /* sm */ }
@container (min-width: 640px) { /* md */ }
@container (min-width: 768px) { /* lg */ }
@container (min-width: 1024px) { /* xl */ }
```

### 10.3 Responsive Typography

```css
/* Fluid Type Scale */
html {
  font-size: clamp(14px, 0.875rem + 0.25vw, 16px);
}

/* Heading Responsive Sizes */
.heading-display {
  font-size: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}

.heading-1 {
  font-size: clamp(1.75rem, 1.25rem + 1.5vw, 2.5rem);
}

.heading-2 {
  font-size: clamp(1.5rem, 1.125rem + 1vw, 2rem);
}
```

### 10.4 Responsive Spacing

```css
/* Dynamic Spacing */
.section-padding {
  padding-block: clamp(2rem, 1rem + 3vw, 4rem);
}

.page-margin {
  padding-inline: clamp(1rem, 0.5rem + 2vw, 2rem);
}

.card-gap {
  gap: clamp(0.75rem, 0.5rem + 0.5vw, 1.5rem);
}
```

### 10.5 Layout Patterns

```tsx
/* Responsive Grid */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

/* Sidebar Layout Response */
<div className="flex">
  {/* Sidebar: hidden on mobile, fixed on desktop */}
  <aside className="hidden lg:block lg:w-64 lg:fixed">
    <Sidebar />
  </aside>

  {/* Main content: full width on mobile, offset on desktop */}
  <main className="w-full lg:ml-64">
    {children}
  </main>
</div>

/* Stack to Row */
<div className="flex flex-col sm:flex-row gap-4">
  {/* Items stack on mobile, row on tablet+ */}
</div>
```

### 10.6 Touch Optimization

```css
/* Touch Target Minimum Size */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Touch-specific styles */
@media (pointer: coarse) {
  .button {
    min-height: 48px;
    padding-inline: 1.25rem;
  }

  .link {
    padding: 0.75rem;
    margin: -0.75rem;
  }
}

/* Fine pointer (mouse) */
@media (pointer: fine) {
  .button {
    min-height: 36px;
  }
}
```

---

## 11. Theme System

### 11.1 Theme Architecture

```css
/* Theme Variables Structure */
:root {
  /* Light theme is defined but dark is default */
  color-scheme: dark;
}

[data-theme="light"] {
  color-scheme: light;
}

[data-theme="dark"] {
  color-scheme: dark;
}
```

### 11.2 Dark Theme (Default)

```css
[data-theme="dark"], :root {
  /* Surfaces */
  --surface-base:     var(--color-deep-space-800);
  --surface-raised:   var(--color-deep-space-700);
  --surface-overlay:  var(--color-deep-space-600);
  --surface-sunken:   var(--color-deep-space-900);

  /* Text */
  --text-primary:     #FFFFFF;
  --text-secondary:   var(--color-gray-400);
  --text-tertiary:    var(--color-gray-500);
  --text-disabled:    var(--color-gray-600);

  /* Borders */
  --border-subtle:    rgba(255, 255, 255, 0.05);
  --border-default:   rgba(255, 255, 255, 0.10);
  --border-strong:    rgba(255, 255, 255, 0.20);

  /* Shadows */
  --shadow-color: 0 0% 0%;
}
```

### 11.3 Light Theme

```css
[data-theme="light"] {
  /* Surfaces */
  --surface-base:     var(--color-gray-50);
  --surface-raised:   #FFFFFF;
  --surface-overlay:  #FFFFFF;
  --surface-sunken:   var(--color-gray-100);

  /* Text */
  --text-primary:     var(--color-gray-900);
  --text-secondary:   var(--color-gray-600);
  --text-tertiary:    var(--color-gray-500);
  --text-disabled:    var(--color-gray-400);

  /* Borders */
  --border-subtle:    rgba(0, 0, 0, 0.05);
  --border-default:   rgba(0, 0, 0, 0.10);
  --border-strong:    rgba(0, 0, 0, 0.20);

  /* Shadows */
  --shadow-color: 0 0% 50%;
}
```

### 11.4 Theme Toggle Implementation

```tsx
// ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme);
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

---

## 12. Internationalization

### 12.1 Supported Languages

```typescript
const SUPPORTED_LANGUAGES = {
  ko: { name: '한국어', native: '한국어', dir: 'ltr' },
  en: { name: 'English', native: 'English', dir: 'ltr' },
  ja: { name: 'Japanese', native: '日本語', dir: 'ltr' },
  'zh-CN': { name: 'Chinese (Simplified)', native: '简体中文', dir: 'ltr' },
  'zh-TW': { name: 'Chinese (Traditional)', native: '繁體中文', dir: 'ltr' },
  th: { name: 'Thai', native: 'ไทย', dir: 'ltr' },
} as const;
```

### 12.2 Text Direction

```css
/* LTR (default) */
[dir="ltr"] {
  --start: left;
  --end: right;
}

/* RTL Support (future) */
[dir="rtl"] {
  --start: right;
  --end: left;
}

/* Logical Properties */
.margin-start { margin-inline-start: var(--space-4); }
.margin-end { margin-inline-end: var(--space-4); }
.padding-start { padding-inline-start: var(--space-4); }
.padding-end { padding-inline-end: var(--space-4); }
```

### 12.3 Number & Date Formatting

```typescript
// Number formatting
function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

// Currency formatting
function formatCurrency(value: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

// Date formatting
function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Relative time
function formatRelativeTime(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffInDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  return rtf.format(-diffInDays, 'day');
}
```

### 12.4 Language-Specific Typography

```css
/* Korean */
:lang(ko) {
  font-family: 'Pretendard Variable', 'Noto Sans KR', sans-serif;
  word-break: keep-all;
  line-height: 1.6;
}

/* Japanese */
:lang(ja) {
  font-family: 'Pretendard Variable', 'Noto Sans JP', sans-serif;
  word-break: normal;
  line-height: 1.7;
}

/* Chinese */
:lang(zh-CN), :lang(zh-TW) {
  font-family: 'Pretendard Variable', 'Noto Sans SC', sans-serif;
  line-height: 1.7;
}

/* Thai */
:lang(th) {
  font-family: 'Pretendard Variable', 'Noto Sans Thai', sans-serif;
  line-height: 1.8;
  letter-spacing: 0.025em;
}
```

---

## 13. Accessibility

### 13.1 WCAG 2.1 Compliance

```
Target: WCAG 2.1 Level AA

Principles:
1. Perceivable - Content can be perceived
2. Operable - Interface can be operated
3. Understandable - Content is understandable
4. Robust - Content works with assistive tech
```

### 13.2 Color Accessibility

```css
/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --border-default: rgba(255, 255, 255, 0.5);
    --text-secondary: var(--color-gray-300);
  }
}

/* Forced Colors Mode */
@media (forced-colors: active) {
  .button {
    border: 2px solid ButtonText;
  }

  .badge {
    border: 1px solid currentColor;
  }
}
```

### 13.3 Focus Management

```css
/* Focus Ring */
*:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

/* Skip Link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: var(--z-max);
  padding: var(--space-4);
  background: var(--surface-overlay);
  color: var(--text-primary);
}

.skip-link:focus {
  top: 0;
}
```

### 13.4 Screen Reader Utilities

```css
/* Visually Hidden */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Not SR Only (restore visibility) */
.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 13.5 ARIA Patterns

```tsx
// Button with loading state
<button
  aria-busy={isLoading}
  aria-disabled={isDisabled}
  aria-label="Upload photo"
>
  {isLoading ? <Spinner /> : 'Upload'}
</button>

// Tab panel
<div role="tablist" aria-label="Journey tabs">
  <button
    role="tab"
    aria-selected={activeTab === 0}
    aria-controls="panel-0"
    id="tab-0"
  >
    Photos
  </button>
</div>
<div
  role="tabpanel"
  id="panel-0"
  aria-labelledby="tab-0"
  hidden={activeTab !== 0}
>
  Content
</div>

// Modal dialog
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Upload</h2>
  <p id="dialog-description">Are you sure?</p>
</div>

// Live region
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### 13.6 Keyboard Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│ Component       │ Keyboard Support                              │
├─────────────────┼───────────────────────────────────────────────┤
│ Button          │ Enter/Space: Activate                         │
│ Link            │ Enter: Navigate                               │
│ Dialog          │ Escape: Close, Tab: Trap focus               │
│ Dropdown        │ Arrow keys: Navigate, Enter: Select, Esc: Close│
│ Tabs            │ Arrow keys: Switch tabs, Enter: Activate      │
│ Menu            │ Arrow keys: Navigate, Enter: Select           │
│ Slider          │ Arrow keys: Adjust value                      │
│ Switch          │ Space: Toggle                                 │
│ Checkbox        │ Space: Toggle                                 │
│ Radio           │ Arrow keys: Navigate, Space: Select           │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## 14. Pattern Library

### 14.1 Page Layouts

#### Dashboard Layout
```tsx
export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### Auth Layout
```tsx
export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand items-center justify-center">
        <div className="text-white text-center">
          <Logo className="h-12 mx-auto" />
          <h1 className="mt-6 text-4xl font-bold">ZZIK MAP</h1>
          <p className="mt-2 text-xl opacity-80">Discover Real Korea</p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 14.2 Common Patterns

#### Page Header
```tsx
export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-h2 text-primary">{title}</h1>
        {description && (
          <p className="mt-1 text-body text-secondary">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
```

#### Search with Filters
```tsx
export function SearchWithFilters({ onSearch, onFilter }) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-tertiary" />
        <input
          type="search"
          placeholder="Search places..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-default rounded-lg"
        />
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge vibe="cozy" className="cursor-pointer">Cozy</Badge>
        <Badge vibe="modern" className="cursor-pointer">Modern</Badge>
        <Badge vibe="vintage" className="cursor-pointer">Vintage</Badge>
      </div>
    </div>
  );
}
```

#### Card Grid
```tsx
export function CardGrid({ children, columns = 4 }) {
  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 && 'grid-cols-1 sm:grid-cols-2',
      columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    )}>
      {children}
    </div>
  );
}
```

#### Empty State
```tsx
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-surface-raised">
        {icon}
      </div>
      <h3 className="mt-4 text-h4 text-primary">{title}</h3>
      <p className="mt-2 text-body text-secondary max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
}
```

#### Confirmation Dialog
```tsx
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default' // 'default' | 'danger'
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogActions>
        <Button variant="ghost" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          color={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 14.3 Loading States

#### Skeleton Card
```tsx
export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="aspect-photo bg-surface-overlay rounded-lg" />
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-surface-overlay rounded w-3/4" />
        <div className="h-3 bg-surface-overlay rounded w-1/2" />
      </div>
    </div>
  );
}
```

#### Skeleton List
```tsx
export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="size-10 rounded-full bg-surface-overlay" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-overlay rounded w-1/3" />
            <div className="h-3 bg-surface-overlay rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Loading Spinner
```tsx
export function Spinner({ size = 'md', color = 'current' }) {
  const sizes = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  };

  return (
    <svg
      className={cn('animate-spin', sizes[size])}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
```

---

## 15. Implementation

### 15.1 Required Dependencies

```json
{
  "dependencies": {
    "@headlessui/react": "^2.2.0",
    "clsx": "^2.1.1",
    "motion": "^11.12.0",
    "@heroicons/react": "^2.2.0",
    "tailwind-merge": "^2.5.0"
  }
}
```

### 15.2 Utility Functions

```typescript
// lib/utils.ts - Class name merger
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```typescript
// lib/design-tokens.ts - Full TypeScript token export
import { colors, spacing, typography, motion, designTokens } from '@/lib';

// Usage examples:
colors.brand.coral[500]      // '#FF5A5F'
colors.brand.deepSpace[900]  // '#0A1628'
spacing.md                    // '16px'
typography.fontSize.base      // 'clamp(0.9375rem, 0.9rem + 0.1875vw, 1rem)'
motion.duration.normal        // '200ms'
```

```typescript
// lib/vibe-utils.ts - Vibe category utilities
import {
  type VibeCategory,
  getVibeColor,
  getVibeScoreLevel,
  getVibeInfo,
  VIBE_CATEGORIES,
} from '@/lib';

// 8 Vibe Categories
type VibeCategory = 'cozy' | 'modern' | 'vintage' | 'minimal' |
                    'romantic' | 'industrial' | 'nature' | 'luxury';

// Usage examples:
getVibeColor('cozy')           // 'var(--vibe-cozy)'
getVibeScoreLevel(85)          // 'high'
getVibeInfo('modern').icon     // '🏢'
VIBE_CATEGORIES.luxury.labelKo // '럭셔리'
```

```typescript
// Central export: lib/index.ts
import {
  // Design Tokens
  colors, spacing, typography, motion, designTokens,

  // Vibe Utilities
  VIBE_CATEGORIES, getVibeColor, getVibeScoreLevel,
  getAllVibes, getTopVibes, calculateVibeSimilarity,

  // Types
  type VibeCategory, type VibeScoreLevel,
} from '@/lib';
```

### 15.3 Component Checklist

```markdown
## Component Quality Checklist

### Design
- [ ] Uses design tokens (no hardcoded values)
- [ ] Follows ZZIK brand colors
- [ ] Consistent spacing (4px base)
- [ ] Appropriate border radius
- [ ] Proper elevation/shadow

### Accessibility
- [ ] Keyboard navigable
- [ ] Visible focus indicators
- [ ] ARIA attributes where needed
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested

### Responsive
- [ ] Mobile-first implementation
- [ ] Touch targets ≥ 44px
- [ ] Tested at all breakpoints
- [ ] Fluid typography

### Interaction
- [ ] All states implemented (hover, focus, active, disabled)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized/lazy-loaded
- [ ] Animations use transform/opacity
- [ ] Respects prefers-reduced-motion

### i18n
- [ ] Text uses translation keys
- [ ] Numbers/dates formatted by locale
- [ ] Supports different text lengths
- [ ] RTL-ready (logical properties)
```

---

## Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ZZIK DESIGN SYSTEM V3 - QUICK REFERENCE                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  COLORS                                                                      ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  Primary:    zzik-coral-500    #FF5A5F                                       ║
║  Background: deep-space-800    #0A1628                                       ║
║  Accent:     electric-cyan-500 #00D9FF                                       ║
║                                                                              ║
║  TYPOGRAPHY                                                                  ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  Font:    Pretendard Variable, Inter                                         ║
║  Scale:   xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30) 4xl(36)      ║
║  Weight:  normal(400) medium(500) semibold(600) bold(700)                    ║
║                                                                              ║
║  SPACING (4px base)                                                          ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  1=4px  2=8px  3=12px  4=16px  5=20px  6=24px  8=32px  10=40px  12=48px     ║
║                                                                              ║
║  BREAKPOINTS                                                                 ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  sm: 640px  md: 768px  lg: 1024px  xl: 1280px  2xl: 1536px                  ║
║                                                                              ║
║  COMPONENTS                                                                  ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  import { Button, Input, Dialog, Badge } from '@/components/catalyst'        ║
║  import { ZzikButton, ZzikCard, ZzikBadge } from '@/components/zzik'         ║
║  import { VibeScore, VibeBadge, VibeCard } from '@/components/zzik'          ║
║  import { PhotoUpload, JourneyTimeline } from '@/components/zzik'            ║
║  import { MapMarker, MapPopup } from '@/components/zzik'                     ║
║  import { GlassPanel, Skeleton, EmptyState } from '@/components/zzik'        ║
║                                                                              ║
║  ANIMATIONS                                                                  ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  animate-fade-in  animate-scale-in  animate-slide-up  animate-glow-coral    ║
║                                                                              ║
║  VIBES                                                                       ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  cozy modern vintage minimal romantic industrial nature luxury               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

*ZZIK MAP Design System V3.0*
*Enterprise-Grade Design Architecture*
*Last Updated: 2025-11-26*
