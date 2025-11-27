# Responsive Design Skill V3
## Mobile-First & Fluid Typography

## When to Use
Invoke this skill when:
- Implementing responsive layouts
- Setting up fluid typography
- Building mobile-first components
- Handling touch interactions
- Testing across devices

---

## Breakpoint System

### ZZIK Breakpoints
```typescript
export const breakpoints = {
  sm: '640px',   // Mobile landscape, small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large screens
};

// Tailwind Config
module.exports = {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
};
```

### Device Targets
```yaml
Mobile (< 640px):
  - iPhone SE to 14 Pro Max
  - Primary touch interaction
  - Single column layouts

Tablet (640px - 1023px):
  - iPad Mini to iPad Pro
  - Touch + occasional keyboard
  - 2-column capable

Desktop (1024px+):
  - Laptops and monitors
  - Mouse + keyboard
  - Full multi-column layouts
```

---

## Mobile-First Approach

### Pattern
```tsx
// Start with mobile, add complexity for larger screens
<div className="
  px-4           // Mobile: 16px padding
  sm:px-6        // ≥640px: 24px
  md:px-8        // ≥768px: 32px
  lg:px-12       // ≥1024px: 48px
  xl:px-16       // ≥1280px: 64px
">
```

### Grid Progression
```tsx
// Photo grid: 1 → 2 → 3 → 4 columns
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
  md:gap-6
">
  {photos.map(photo => <PhotoCard key={photo.id} {...photo} />)}
</div>
```

### Navigation Pattern
```tsx
// Mobile: Bottom nav, Desktop: Top nav
<>
  {/* Desktop Nav - hidden on mobile */}
  <nav className="hidden lg:flex items-center h-16">
    <NavLinks />
  </nav>

  {/* Mobile Nav - fixed bottom */}
  <nav className="
    fixed bottom-0 left-0 right-0
    lg:hidden
    flex justify-around
    h-16
    bg-deep-space-800
    border-t border-white/10
  ">
    <MobileNavItems />
  </nav>
</>
```

---

## Fluid Typography

### Clamp-Based Scaling
```css
:root {
  /* Base: 16px at 375px, 18px at 1440px */
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);

  /* Headings */
  --text-h1: clamp(2rem, 1.5rem + 2.5vw, 4.5rem);
  --text-h2: clamp(1.5rem, 1.2rem + 1.5vw, 3rem);
  --text-h3: clamp(1.25rem, 1rem + 1vw, 2rem);
  --text-h4: clamp(1.125rem, 0.95rem + 0.75vw, 1.5rem);

  /* Body */
  --text-body-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  --text-body: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
  --text-body-sm: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);
}
```

### Usage
```tsx
// Apply fluid typography
<h1 className="text-[length:var(--text-h1)]">
  Journey Intelligence
</h1>

// Or with Tailwind utilities
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
  Journey Intelligence
</h1>
```

### Line Height Adjustments
```css
/* Tighter line height on mobile for large text */
@media (max-width: 640px) {
  h1, h2 {
    line-height: 1.1;
  }
}

/* More relaxed on desktop */
@media (min-width: 1024px) {
  h1, h2 {
    line-height: 1.2;
  }
}
```

---

## Container System

### Container Widths
```tsx
// Narrow: Auth, forms (max 640px)
<div className="max-w-xl mx-auto px-4">
  <AuthForm />
</div>

// Default: Standard pages (max 1024px)
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
  <PageContent />
</div>

// Wide: Dashboard (max 1280px)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <Dashboard />
</div>

// Full: Map views (100%)
<div className="w-full h-screen">
  <MapView />
</div>
```

### Component: Container
```tsx
interface ContainerProps {
  size?: 'narrow' | 'default' | 'wide' | 'full';
  children: React.ReactNode;
}

export function Container({ size = 'default', children }: ContainerProps) {
  const maxWidth = {
    narrow: 'max-w-xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
    full: 'max-w-none',
  }[size];

  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
      {children}
    </div>
  );
}
```

---

## Touch Optimization

### Touch Targets
```css
/* Minimum 44x44px touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Increase for coarse pointers (touch) */
@media (pointer: coarse) {
  .touch-target {
    min-height: 48px;
    min-width: 48px;
  }
}
```

### Touch Actions
```css
/* Prevent accidental zoom on double-tap */
.no-zoom {
  touch-action: manipulation;
}

/* Scroll only vertically */
.scroll-vertical {
  touch-action: pan-y;
}

/* Scroll only horizontally */
.scroll-horizontal {
  touch-action: pan-x;
}

/* Prevent all touch actions */
.no-touch {
  touch-action: none;
}
```

### Safe Area Insets
```css
/* Handle iPhone notch and home indicator */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Full coverage */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* Fixed bottom nav with safe area */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
}
```

---

## Viewport Units

### Standard vs Dynamic
```css
/* Standard - doesn't account for mobile browser UI */
height: 100vh;

/* Dynamic - accounts for browser chrome */
height: 100dvh;

/* Small - minimum viewport (UI visible) */
height: 100svh;

/* Large - maximum viewport (UI hidden) */
height: 100lvh;
```

### Usage Pattern
```tsx
// Full-screen sections
<section className="min-h-[100dvh] flex items-center">
  <HeroContent />
</section>

// Map container
<div className="h-[calc(100dvh-64px)]">
  <Map />
</div>
```

---

## Responsive Images

### Next.js Image with Sizes
```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  fill
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 75vw,
    50vw
  "
  priority
  className="object-cover"
/>
```

### Art Direction
```tsx
// Different images for different screen sizes
<picture>
  <source
    media="(min-width: 1024px)"
    srcSet="/hero-desktop.webp"
  />
  <source
    media="(min-width: 640px)"
    srcSet="/hero-tablet.webp"
  />
  <img
    src="/hero-mobile.webp"
    alt="Hero"
    className="w-full h-full object-cover"
  />
</picture>
```

### Responsive Aspect Ratios
```tsx
// Photo card: 4:3 on mobile, 16:9 on desktop
<div className="
  relative
  aspect-[4/3]
  md:aspect-video
  overflow-hidden
  rounded-xl
">
  <Image src={photo} fill className="object-cover" />
</div>
```

---

## Responsive Patterns

### Card Grid
```tsx
<div className="
  grid
  grid-cols-1
  gap-4
  sm:grid-cols-2 sm:gap-6
  lg:grid-cols-3
  xl:grid-cols-4 xl:gap-8
">
  {cards.map(card => <Card key={card.id} {...card} />)}
</div>
```

### Sidebar Layout
```tsx
<div className="
  flex flex-col
  lg:flex-row
  min-h-screen
">
  {/* Sidebar - full width on mobile, fixed on desktop */}
  <aside className="
    w-full
    lg:w-64 lg:flex-shrink-0
    border-b lg:border-b-0 lg:border-r
    border-white/10
  ">
    <Sidebar />
  </aside>

  {/* Main content */}
  <main className="flex-grow p-4 lg:p-8">
    <Content />
  </main>
</div>
```

### Stack to Row
```tsx
<div className="
  flex flex-col
  sm:flex-row
  gap-4
  sm:items-center
  sm:justify-between
">
  <div>
    <h2 className="text-xl font-bold">Title</h2>
    <p className="text-zinc-400">Description</p>
  </div>
  <div className="flex gap-2">
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </div>
</div>
```

### Hide/Show Elements
```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  <DesktopOnly />
</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">
  <MobileOnly />
</div>
```

---

## Testing Checklist

### Device Matrix
```yaml
Mobile:
  - iPhone SE (375x667)
  - iPhone 14 Pro (393x852)
  - iPhone 14 Pro Max (430x932)
  - Android small (360x640)
  - Android medium (412x915)

Tablet:
  - iPad Mini (744x1133)
  - iPad (810x1080)
  - iPad Pro 11" (834x1194)
  - iPad Pro 12.9" (1024x1366)

Desktop:
  - Laptop (1280x800)
  - Desktop (1440x900)
  - Large (1920x1080)
  - Ultra-wide (2560x1440)
```

### Playwright Responsive Tests
```typescript
import { test, devices } from '@playwright/test';

const viewports = [
  { name: 'mobile', ...devices['iPhone 14'] },
  { name: 'tablet', viewport: { width: 768, height: 1024 } },
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
];

for (const viewport of viewports) {
  test(`responsive: ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport.viewport);
    await page.goto('/');
    await page.screenshot({ path: `screenshots/${viewport.name}.png` });
  });
}
```

---

## Responsive Utilities

### useMediaQuery Hook
```tsx
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery('(max-width: 639px)');
const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');
```

### useBreakpoint Hook
```tsx
import { useMediaQuery } from './useMediaQuery';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery('(min-width: 1536px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isSm = useMediaQuery('(min-width: 640px)');

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'sm'; // Default to smallest
}
```

---

## Quick Reference

| Breakpoint | Width | Device | Columns |
|------------|-------|--------|---------|
| Default | < 640px | Mobile | 1 |
| sm | ≥ 640px | Mobile L | 2 |
| md | ≥ 768px | Tablet | 2-3 |
| lg | ≥ 1024px | Laptop | 3-4 |
| xl | ≥ 1280px | Desktop | 4-5 |
| 2xl | ≥ 1536px | Large | 4-6 |

---

*Responsive Design Skill V3.0*
*Mobile-First & Fluid Typography*
