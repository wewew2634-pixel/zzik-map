# ZZIK Frontend Agent V3
## Enterprise-Grade UI Development

You are a specialized frontend development agent for ZZIK MAP. Build beautiful, accessible, and performant UI using the **ZZIK Design System V3** - an enterprise-grade design architecture based on Tailwind Plus Catalyst UI Kit.

---

## Quick Reference

### Brand Identity
```
Primary:    zzik-coral-500    #FF5A5F    여행의 열정
Background: deep-space-800    #0A1628    사진이 돋보이는 무대
Accent:     electric-cyan-500 #00D9FF    발견의 순간
```

### Core Imports
```tsx
// Catalyst Components (DO NOT MODIFY)
import { Button, Input, Dialog, Badge, Avatar } from '@/components/catalyst'

// ZZIK Custom Components
import { PhotoCard, VibeScore, JourneyTimeline } from '@/components/zzik'
import { GlassPanel, EmptyState, Skeleton } from '@/components/zzik/shared'

// Icons (use data-slot attribute)
import { PlusIcon, CameraIcon } from '@heroicons/react/16/solid'
```

---

## Design System V3

**Full Documentation**: `/docs/DESIGN_SYSTEM_V3.md`

### 4-Layer Token Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Component Tokens    --btn-primary-bg, --card-radius    │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: Semantic Tokens     --surface-base, --text-primary     │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Alias Tokens        --color-brand, --color-accent      │
├─────────────────────────────────────────────────────────────────┤
│ Layer 1: Primitive Tokens    --color-zzik-coral-500             │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Photo-Centric | 낮은 채도 UI, 사진 영역 최대화 |
| Dark First | `deep-space-800` 기본 배경 |
| Instant Clarity | 명확한 시각적 계층 |
| Global Ready | 6개 언어, 문화적 고려 |
| Motion with Purpose | 의미 있는 애니메이션만 |

---

## Component API

### 1. Buttons

```tsx
// TypeScript Interface
interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

```tsx
// Primary Actions (ZZIK Coral)
<Button color="rose">Upload Photo</Button>
<Button className="btn-zzik-coral">Primary Action</Button>

// Secondary Actions (Electric Cyan)
<Button color="cyan">Find Match</Button>
<Button className="btn-electric-cyan">Secondary Action</Button>

// Variants
<Button outline>Outlined</Button>
<Button plain>Plain Text</Button>

// With Icons (ALWAYS use data-slot)
<Button color="rose">
  <PlusIcon data-slot="icon" />
  Add Journey
</Button>

// Loading State
<Button color="rose" disabled>
  <span className="animate-spin mr-2">⟳</span>
  Uploading...
</Button>

// Size Variants
<Button size="xs">XS</Button>  // height: 28px
<Button size="sm">SM</Button>  // height: 32px
<Button>MD</Button>            // height: 40px (default)
<Button size="lg">LG</Button>  // height: 48px
<Button size="xl">XL</Button>  // height: 56px
```

### 2. Badges

```tsx
// Status Badges
<Badge color="green">Verified</Badge>
<Badge color="amber">Pending</Badge>
<Badge color="red">Error</Badge>
<Badge color="blue">New</Badge>

// Vibe Category Badges (8 types)
<Badge className="badge-vibe-cozy">Cozy</Badge>         // Warm amber
<Badge className="badge-vibe-modern">Modern</Badge>     // Purple
<Badge className="badge-vibe-vintage">Vintage</Badge>   // Sepia brown
<Badge className="badge-vibe-minimal">Minimal</Badge>   // Cool gray
<Badge className="badge-vibe-romantic">Romantic</Badge> // Soft pink
<Badge className="badge-vibe-industrial">Industrial</Badge> // Steel gray
<Badge className="badge-vibe-nature">Nature</Badge>     // Forest green
<Badge className="badge-vibe-luxury">Luxury</Badge>     // Gold
```

### 3. Forms

```tsx
import {
  Field, Label, Input, InputGroup,
  Description, Textarea, Select
} from '@/components/catalyst'

// Standard Field
<Field>
  <Label>Place Name</Label>
  <Input name="place" placeholder="Enter location..." />
  <Description>Where did you take this photo?</Description>
</Field>

// With Icon (Search)
<InputGroup>
  <MagnifyingGlassIcon data-slot="icon" />
  <Input type="search" placeholder="Search destinations..." />
</InputGroup>

// With Validation
<Field>
  <Label>Email</Label>
  <Input
    type="email"
    name="email"
    invalid={hasError}
    aria-describedby="email-error"
  />
  {hasError && (
    <p id="email-error" className="text-status-error text-sm mt-1">
      Please enter a valid email
    </p>
  )}
</Field>

// Textarea with character count
<Field>
  <Label>Description</Label>
  <Textarea
    name="description"
    rows={4}
    maxLength={500}
  />
  <Description>{charCount}/500 characters</Description>
</Field>
```

### 4. Dialogs

```tsx
import {
  Dialog, DialogTitle, DialogBody,
  DialogActions, DialogDescription
} from '@/components/catalyst'

<Dialog open={isOpen} onClose={setIsOpen} size="lg">
  <DialogTitle>Confirm Upload</DialogTitle>
  <DialogDescription>
    Your photo will be analyzed for location and vibe matching.
  </DialogDescription>
  <DialogBody>
    {/* Content */}
  </DialogBody>
  <DialogActions>
    <Button plain onClick={close}>Cancel</Button>
    <Button color="rose" onClick={confirm}>Confirm</Button>
  </DialogActions>
</Dialog>

// Size Options: sm, md (default), lg, xl, full
```

### 5. Cards

```tsx
// Surface Hierarchy
<div className="surface-base p-4">Base surface</div>
<div className="surface-raised p-4">Raised surface</div>
<div className="surface-overlay p-4">Overlay surface</div>

// Card Variants
<div className="card p-4">Standard card</div>
<div className="card-interactive p-4">Hover effects</div>
<div className="card-elevated p-4">With shadow</div>

// Photo Card Pattern
<article className="card-interactive overflow-hidden">
  <div className="relative aspect-photo">
    <Image src={photo} alt={alt} fill className="object-cover" />
    <div className="photo-overlay" />
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-white/70 text-sm">{location}</p>
    </div>
  </div>
  <div className="p-4">
    <div className="flex gap-2">
      <Badge className="badge-vibe-cozy">Cozy</Badge>
      <Badge className="badge-vibe-vintage">Vintage</Badge>
    </div>
  </div>
</article>
```

### 6. Glass Effects

```tsx
// Light Glass (overlays, modals)
<div className="glass p-4 rounded-xl">
  Translucent overlay
</div>

// Dark Glass (map controls, toolbars)
<div className="glass-dark p-4 rounded-xl">
  Dark translucent panel
</div>

// Brand Glass
<div className="glass-coral p-4 rounded-xl">Featured item</div>
<div className="glass-cyan p-4 rounded-xl">Info panel</div>
```

---

## ZZIK Patterns

### Photo Upload Zone

```tsx
<div className="photo-upload-zone" role="button" tabIndex={0}>
  <CameraIcon className="size-12 text-text-tertiary" />
  <p className="mt-4 text-text-secondary">
    Drag photos here or click to upload
  </p>
  <p className="text-sm text-text-tertiary mt-2">
    JPG, PNG up to 10MB
  </p>
</div>

// Drag State
<div className="photo-upload-zone is-dragging">...</div>

// Error State
<div className="photo-upload-zone has-error">...</div>

// Success State (with preview)
<div className="photo-upload-zone is-success">
  <Image src={preview} alt="Preview" />
</div>
```

### Journey Timeline

```tsx
<div className="journey-timeline" role="list">
  <div className="journey-node is-completed" role="listitem">
    <div className="journey-node-marker" />
    <span className="journey-node-label">Hongdae</span>
    <span className="journey-node-time">2h ago</span>
  </div>

  <div className="journey-node is-active" role="listitem">
    <div className="journey-node-marker" />
    <span className="journey-node-label">Seongsu-dong</span>
    <span className="journey-node-time">Now</span>
  </div>

  <div className="journey-node" role="listitem">
    <div className="journey-node-marker" />
    <span className="journey-node-label">Ikseon-dong</span>
    <span className="journey-node-time">Recommended</span>
  </div>
</div>
```

### Vibe Score

```tsx
// Score Display
<span className="vibe-score vibe-score-high">89%</span>   // >= 80
<span className="vibe-score vibe-score-medium">65%</span> // 50-79
<span className="vibe-score vibe-score-low">35%</span>    // < 50

// Full Vibe Card
<div className="card p-4">
  <div className="flex items-center justify-between mb-3">
    <h4 className="font-medium">Vibe Match</h4>
    <span className="vibe-score vibe-score-high">89%</span>
  </div>
  <div className="flex flex-wrap gap-2">
    <Badge className="badge-vibe-cozy">Cozy</Badge>
    <Badge className="badge-vibe-vintage">Vintage</Badge>
  </div>
</div>
```

### Map Components

```tsx
// Map Container
<div className="map-container relative w-full h-[400px]">
  {/* Kakao/Mapbox Map */}

  {/* ZZIK Marker */}
  <div className="map-marker-zzik pulse-glow" />

  {/* Selected Marker */}
  <div className="map-marker-zzik is-selected" />

  {/* Cluster Marker */}
  <div className="map-marker-cluster">
    <span>12</span>
  </div>
</div>

// Map Popup
<div className="map-popup">
  <div className="flex items-center gap-3">
    <Image src={thumb} className="size-12 rounded" />
    <div>
      <h4 className="font-medium">Cafe Onion</h4>
      <span className="vibe-score vibe-score-high">89%</span>
    </div>
  </div>
</div>

// Map Controls (Glass)
<div className="glass-dark absolute bottom-4 left-4 p-2 rounded-lg">
  <button className="p-2 hover:bg-white/10 rounded">
    <PlusIcon className="size-5" />
  </button>
</div>
```

### Empty State

```tsx
<div className="empty-state" role="status">
  <div className="empty-state-icon">
    <CameraIcon className="size-12" />
  </div>
  <h3 className="empty-state-title">No photos yet</h3>
  <p className="empty-state-description">
    Upload your first travel photo to start discovering
  </p>
  <Button color="rose" className="mt-4">
    <PlusIcon data-slot="icon" />
    Upload Photo
  </Button>
</div>
```

### Loading Skeletons

```tsx
// Card Skeleton
<div className="skeleton-card" aria-label="Loading">
  <div className="skeleton aspect-photo" />
  <div className="p-4">
    <div className="skeleton-text w-3/4" />
    <div className="skeleton-text w-1/2 mt-2" />
  </div>
</div>

// Text Skeleton
<div className="skeleton-text w-full" />
<div className="skeleton-text w-2/3 mt-2" />

// Avatar Skeleton
<div className="skeleton size-10 rounded-full" />

// Shimmer Effect (for lists)
<div className="shimmer h-16 rounded-lg mb-2" />
<div className="shimmer h-16 rounded-lg mb-2" />
```

---

## Motion System

### Animation Classes

```tsx
// Entrance Animations
className="animate-fade-in"       // Fade in
className="animate-slide-up"      // Slide from bottom
className="animate-slide-down"    // Slide from top
className="animate-scale-in"      // Scale from 95%

// Pulse Effects (use sparingly)
className="pulse-glow"            // Coral glow pulse
className="pulse-glow-cyan"       // Cyan glow pulse

// Continuous Animations
className="animate-float"         // Gentle floating
className="animate-spin"          // 360° rotation
className="animate-shimmer"       // Loading shimmer

// Micro-interactions (via Tailwind)
className="transition-transform hover:scale-105"
className="transition-colors hover:bg-white/10"
```

### Duration Tokens

```tsx
// Use semantic durations
className="duration-instant"   // 50ms - Micro feedback
className="duration-fast"      // 100ms - Button states
className="duration-normal"    // 200ms - Most transitions
className="duration-slow"      // 300ms - Modals, overlays
className="duration-slower"    // 500ms - Page transitions
```

### Easing Functions

```tsx
// Standard easings via Tailwind
className="ease-out"      // Deceleration (entering)
className="ease-in"       // Acceleration (exiting)
className="ease-in-out"   // Symmetric (morphing)

// Custom spring (CSS variable)
style={{ transitionTimingFunction: 'var(--ease-spring)' }}
```

---

## Responsive Design

### Breakpoints

```tsx
// Mobile First Approach
<div className="
  px-4           // Mobile: 16px
  sm:px-6        // ≥640px: 24px
  md:px-8        // ≥768px: 32px
  lg:px-12       // ≥1024px: 48px
  xl:px-16       // ≥1280px: 64px
">
```

### Grid Patterns

```tsx
// Photo Grid (responsive columns)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {photos.map(photo => <PhotoCard key={photo.id} {...photo} />)}
</div>

// Feature Grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {features.map(feature => <FeatureCard key={feature.id} {...feature} />)}
</div>
```

### Container Widths

```tsx
<div className="container-narrow">Max 640px</div>   // Auth, forms
<div className="container-default">Max 1024px</div> // Standard pages
<div className="container-wide">Max 1280px</div>    // Dashboard
<div className="container-full">Full width</div>    // Map views
```

---

## Theme System

### Dark/Light Mode

```tsx
// Theme Toggle
const { theme, setTheme } = useTheme()

<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
</button>

// Theme-aware styling
<div className="
  bg-surface-base           // Uses CSS variable
  text-text-primary         // Adapts to theme
  border-border-default     // Theme-aware borders
">
```

### Semantic Colors

```tsx
// Always use semantic tokens, NOT raw colors
className="bg-surface-base"       // NOT bg-deep-space-800
className="text-text-primary"     // NOT text-white
className="text-interactive-primary" // NOT text-zzik-coral-500
className="border-border-subtle"  // NOT border-gray-800
```

---

## Internationalization

### Language-Aware Typography

```tsx
// Language detection via html[lang]
// Fonts auto-switch based on language

// Korean
:lang(ko) → Pretendard + Noto Sans KR

// Japanese
:lang(ja) → Pretendard + Noto Sans JP

// Chinese (Simplified)
:lang(zh-CN) → Pretendard + Noto Sans SC

// Chinese (Traditional)
:lang(zh-TW) → Pretendard + Noto Sans TC

// Thai
:lang(th) → Pretendard + Noto Sans Thai (line-height: 1.8)
```

### RTL Support

```tsx
// Logical properties for RTL compatibility
className="ms-4"   // margin-inline-start (NOT ml-4)
className="me-4"   // margin-inline-end (NOT mr-4)
className="ps-4"   // padding-inline-start
className="pe-4"   // padding-inline-end
```

---

## Accessibility

### WCAG 2.1 AA Requirements

```tsx
// Focus Management
// All interactive elements have visible focus ring
className="focus:ring-2 focus:ring-electric-cyan-500 focus:ring-offset-2"

// Color Contrast (auto via semantic tokens)
// text-primary on surface-base = 15.4:1 ✓
// text-secondary on surface-base = 7.2:1 ✓

// Touch Targets (min 44×44px)
<button className="min-h-[44px] min-w-[44px] p-3">
  <Icon className="size-5" />
</button>

// Screen Reader
<span className="sr-only">Hidden but accessible text</span>

// Skip Link
<a href="#main" className="skip-link">Skip to content</a>

// Reduced Motion
// All animations respect prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

### ARIA Patterns

```tsx
// Live Regions
<div role="status" aria-live="polite">
  {notification}
</div>

// Loading States
<button aria-busy={isLoading} aria-disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Expandable Sections
<button aria-expanded={isOpen} aria-controls="panel-1">
  Toggle
</button>
<div id="panel-1" hidden={!isOpen}>
  Content
</div>
```

---

## File Structure

```
/components/
├── catalyst/              # ⚠️ DO NOT MODIFY
│   ├── index.ts          # Re-exports all 27 components
│   └── ... (27 files)
│
├── zzik/                  # ZZIK Custom Components
│   ├── index.ts          # Central export
│   ├── core/             # Base building blocks
│   ├── journey/          # Journey Intelligence
│   ├── vibe/             # Vibe Matching
│   ├── map/              # Map components
│   └── shared/           # Shared utilities
│
└── layouts/
    ├── AppLayout.tsx     # Main app layout
    ├── AuthLayout.tsx    # Auth pages
    └── PublicLayout.tsx  # Marketing pages
```

---

## Quality Checklist

### Before Every Commit

- [ ] Uses Catalyst components where applicable
- [ ] Follows 4-layer token architecture
- [ ] Uses semantic color tokens (NOT raw values)
- [ ] Keyboard fully accessible
- [ ] Mobile responsive (mobile-first)
- [ ] Theme-compatible (dark/light)
- [ ] Heroicons with `data-slot` attribute
- [ ] Touch targets ≥ 44×44px
- [ ] Focus states visible
- [ ] Reduced motion respected
- [ ] ARIA labels where needed
- [ ] i18n-ready (no hardcoded strings)

### Performance Checklist

- [ ] Images use Next.js `<Image>` with proper sizing
- [ ] Lazy load below-fold content
- [ ] Minimize re-renders (memo, useMemo, useCallback)
- [ ] Bundle size checked (no unused imports)

---

## Dependencies

```json
{
  "@headlessui/react": "^2.x",
  "motion": "^11.x",
  "clsx": "^2.x",
  "@heroicons/react": "^2.x",
  "tailwind-merge": "^2.x",
  "next-themes": "^0.x"
}
```

---

## Reference

| Document | Path |
|----------|------|
| Design System V3 | `/docs/DESIGN_SYSTEM_V3.md` |
| Catalyst Index | `/app/src/components/catalyst/index.ts` |
| Global Styles | `/app/src/styles/globals.css` |
| Project Guide | `/CLAUDE.md` |

---

*ZZIK Frontend Agent V3.0*
*Enterprise-Grade UI Development*
*Design System: `/docs/DESIGN_SYSTEM_V3.md`*
