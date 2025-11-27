# ZZIK UI Patterns & Component Library V4
## Deep Interaction & Pattern Analysis

## Current Component Inventory

### Catalyst Foundation (27 components)
```yaml
Layout:
  - SidebarLayout
  - StackedLayout
  - Sidebar
  - Navbar

Form:
  - Button (variants: solid, outline, ghost, link)
  - Input
  - Textarea
  - Select
  - Checkbox
  - Radio
  - Switch
  - Fieldset
  - Combobox
  - Listbox

Display:
  - Avatar
  - Badge
  - Table
  - DescriptionList
  - Text
  - Heading
  - Divider

Overlay:
  - Dialog
  - Dropdown
  - Alert

Navigation:
  - Link
  - Pagination
```

### ZZIK Custom Components
```yaml
Journey Feature:
  - SmartPhotoUpload
  - PhotoCard
  - JourneyTimeline
  - RecommendationCard

Vibe Feature:
  - VibeBadge
  - VibeScore
  - VibeMatcher

Map Feature:
  - MapContainer
  - MapPopup
  - LocationMarker
  - ClusterMarker

Shared:
  - ErrorBoundary
  - Toast
  - ThemeProvider
  - Skeleton
  - EmptyState
```

---

## Core ZZIK Patterns

### Pattern 1: Photo-Centric Hero
```tsx
<section className="relative min-h-screen flex items-center">
  {/* Layered Background */}
  <div className="absolute inset-0">
    {/* Gradient base */}
    <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-dark-blue to-deep-space" />

    {/* Animated globs */}
    <motion.div
      className="absolute top-1/4 -left-1/4 w-96 h-96 bg-coral/8 rounded-full blur-3xl"
      animate={{ opacity: [0, 1, 0.8] }}
      transition={{ duration: 3, repeat: Infinity }}
    />

    {/* Noise texture */}
    <div className="absolute inset-0 opacity-[0.03] bg-noise" />

    {/* Gradient borders */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-coral/20 to-transparent" />
  </div>

  {/* Content */}
  <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Pre-title badge */}
      <motion.div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
        <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
        <span className="text-sm text-zinc-400">활성 체험</span>
      </motion.div>

      {/* Hero title */}
      <motion.h1 className="text-7xl md:text-9xl font-black mt-8 tracking-tighter">
        <span className="text-coral">ZZIK</span>
        <span className="text-white"> MAP</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p className="text-xl md:text-2xl text-zinc-400 mt-6 font-light">
        847명의 여행자가 다음으로 간 곳을 알아보세요
      </motion.p>

      {/* CTAs */}
      <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
        <Button color="coral" size="lg">업로드 시작</Button>
        <Button outline size="lg">탐색하기</Button>
      </motion.div>
    </motion.div>
  </div>

  {/* Scroll indicator */}
  <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2">
    <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
      아래로 스크롤
    </motion.div>
  </motion.div>
</section>
```

**Principles:**
- Deep visual hierarchy with layered elements
- Brand colors (coral #FF5A5F, cyan #00D9FF)
- Animated elements that don't distract
- Clear CTA hierarchy (primary > secondary)
- Accessible text over background

---

### Pattern 2: Step Indicator (Progress)
```tsx
<div className="flex justify-center gap-3">
  {['upload', 'location', 'results'].map((step, idx) => (
    <div key={step} className="flex items-center">
      {/* Step dot */}
      <motion.div
        className="w-3 h-3 rounded-full"
        animate={{
          backgroundColor: isStepActive(step) ? 'var(--coral)' : 'rgba(255,255,255,0.1)',
          scale: isStepActive(step) ? 1.2 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Connector line */}
      {idx < 2 && (
        <div className={`w-12 h-0.5 mx-2 transition-colors ${
          isStepComplete(step) ? 'bg-cyan' : 'bg-white/10'
        }`} />
      )}
    </div>
  ))}
</div>
```

**Interaction Design:**
- Smooth dot color transition
- Line fills as steps complete
- Scale animation on active step
- Clear visual progression

---

### Pattern 3: Glass Morphism Card
```tsx
<div className="
  glass
  border border-white/10
  rounded-2xl
  p-6
  backdrop-blur-lg
  hover:border-white/20
  transition-all duration-200
  hover:shadow-lg
">
  {/* Content */}
</div>

/* Glass CSS */
.glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**Visual Properties:**
- Frosted glass effect
- Subtle hover state (elevation)
- Border color increases on hover
- Shadow depth indicates elevation

---

### Pattern 4: Photo Upload Zone
```tsx
<motion.div
  className="
    border-2 border-dashed border-coral/50
    rounded-2xl p-12
    flex flex-col items-center justify-center
    cursor-pointer
    transition-all duration-200
  "
  whileHover={{
    borderColor: 'var(--coral)',
    backgroundColor: 'rgba(255, 90, 95, 0.05)',
  }}
  whileDrag={{
    borderColor: 'var(--coral)',
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
  }}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
>
  <motion.div
    className="text-center"
    animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
  >
    <CameraIcon className="w-12 h-12 text-coral mx-auto mb-4" />
    <p className="text-white font-medium mb-2">사진을 여기에 드래그하세요</p>
    <p className="text-zinc-400 text-sm">JPG, PNG, WebP (최대 10MB)</p>
  </motion.div>

  <input
    type="file"
    accept="image/*"
    onChange={handleFileSelect}
    className="hidden"
  />
</motion.div>
```

**Interaction:**
- Dashed border indicates drop zone
- Hover state invites interaction
- Drag state shows active acceptance
- Clear file type requirements
- File input hidden, zone clickable

---

### Pattern 5: Journey Timeline
```tsx
<div className="space-y-4">
  {journeys.map((journey, idx) => (
    <motion.div
      key={journey.id}
      className="flex gap-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
    >
      {/* Timeline marker */}
      <div className="relative flex flex-col items-center">
        <motion.div
          className={`w-3 h-3 rounded-full ${
            isCompleted(idx) ? 'bg-cyan' : 'bg-white/20'
          }`}
          animate={{
            scale: isActive(idx) ? 1.4 : 1,
          }}
        />
        {idx < journeys.length - 1 && (
          <div className={`w-0.5 h-12 ${
            isCompleted(idx) ? 'bg-cyan' : 'bg-white/10'
          }`} />
        )}
      </div>

      {/* Content */}
      <div className="pb-4 flex-grow">
        <h3 className="font-semibold text-white">{journey.place}</h3>
        <p className="text-zinc-400 text-sm">{journey.timestamp}</p>
        <p className="text-zinc-500 text-sm mt-1">{journey.description}</p>
      </div>
    </motion.div>
  ))}
</div>
```

**Design Principles:**
- Vertical timeline clearly shows progression
- Color indicates completion status
- Staggered entrance animation
- Content right-aligned with markers
- Time metadata secondary

---

### Pattern 6: Vibe Badge System
```tsx
const vibes = {
  cozy: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '아늑한' },
  modern: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '모던한' },
  vintage: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: '빈티지' },
  minimal: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: '미니멀' },
  romantic: { bg: 'bg-pink-500/20', text: 'text-pink-400', label: '로맨틱' },
  industrial: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: '인더스트리얼' },
  nature: { bg: 'bg-green-500/20', text: 'text-green-400', label: '자연' },
  luxury: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '럭셔리' },
};

<div className="flex flex-wrap gap-2">
  {selectedVibes.map(vibe => (
    <motion.div
      key={vibe}
      layoutId={`vibe-${vibe}`}
      className={`
        px-4 py-2
        rounded-full
        text-sm font-medium
        ${vibes[vibe].bg}
        ${vibes[vibe].text}
        cursor-pointer
        transition-all
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {vibes[vibe].label}
    </motion.div>
  ))}
</div>
```

**Color Coding:**
- Each vibe has distinct color
- Background color muted (20% opacity)
- Text color bright/readable
- Consistent ordering and naming
- Easily extensible to 8 vibes

---

### Pattern 7: Recommendation Card
```tsx
<motion.article
  className="
    glass
    rounded-2xl
    overflow-hidden
    hover:scale-105
    transition-transform
  "
  layoutId={`rec-${place.id}`}
>
  {/* Image section */}
  <div className="relative h-48 overflow-hidden">
    <Image
      src={place.image}
      alt={place.name}
      fill
      className="object-cover"
    />

    {/* Match score overlay */}
    <div className="absolute top-4 right-4">
      <motion.div
        className={`
          px-4 py-2 rounded-full text-sm font-bold
          ${getScoreColor(place.matchScore)}
        `}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {place.matchScore}% 매칭
      </motion.div>
    </div>

    {/* Bottom gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
  </div>

  {/* Content section */}
  <div className="p-6">
    <h3 className="text-lg font-semibold text-white mb-2">
      {place.name}
    </h3>

    {/* Vibes */}
    <div className="flex flex-wrap gap-2 mb-4">
      {place.vibes.map(vibe => (
        <Badge key={vibe} className={`badge-vibe-${vibe}`}>
          {vibe}
        </Badge>
      ))}
    </div>

    {/* Stats */}
    <div className="flex justify-between text-sm text-zinc-400">
      <span>{place.reviewCount} 리뷰</span>
      <span>{place.travelers} 명이 찾음</span>
    </div>

    {/* CTA */}
    <Button className="w-full mt-4" color="coral">
      상세보기
    </Button>
  </div>
</motion.article>
```

**Visual Hierarchy:**
- Image focal point
- Score badge top-right
- Gradient improves text readability
- Content organized top to bottom
- CTA clearly buttons at bottom

---

## State Patterns

### Loading State
```tsx
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(null).map((_, i) => (
        <div
          key={i}
          className="
            h-24
            bg-white/5
            rounded-xl
            animate-shimmer
          "
        />
      ))}
    </div>
  );
}
```

### Error State
```tsx
<div className="text-center py-12">
  <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
  <h3 className="text-lg font-semibold text-white mb-2">
    불러올 수 없습니다
  </h3>
  <p className="text-zinc-400 mb-6">
    일시적인 오류가 발생했습니다. 다시 시도해주세요.
  </p>
  <Button onClick={handleRetry}>
    다시 시도
  </Button>
</div>
```

### Empty State
```tsx
<div className="text-center py-16">
  <ImageIcon className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
  <h3 className="text-lg font-semibold text-white mb-2">
    아직 여행 기록이 없습니다
  </h3>
  <p className="text-zinc-400 mb-6">
    첫 번째 사진을 업로드하여 시작해보세요
  </p>
  <Button color="coral">
    사진 업로드
  </Button>
</div>
```

### Success State
```tsx
<motion.div
  className="
    p-6 bg-green-500/10 border border-green-500/30
    rounded-xl text-center
  "
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }}
>
  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2 }}>
    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
  </motion.div>
  <p className="text-white font-semibold mb-2">업로드 완료!</p>
  <p className="text-zinc-400 text-sm">
    추천 여행지를 곧 확인할 수 있습니다
  </p>
</motion.div>
```

---

## Form Patterns

### Input Field
```tsx
<Field>
  <Label htmlFor="location">위치</Label>
  <Input
    id="location"
    type="text"
    placeholder="장소명 입력"
    disabled={isLoading}
    aria-invalid={hasError}
    aria-describedby={hasError ? 'location-error' : undefined}
  />
  {hasError && (
    <p id="location-error" className="text-red-400 text-sm mt-2" role="alert">
      유효한 위치를 입력해주세요
    </p>
  )}
</Field>
```

### Date Picker Pattern
```tsx
<Popover>
  <PopoverButton as={Button} outline>
    <CalendarIcon className="w-5 h-5" />
    {selectedDate.toLocaleDateString('ko-KR')}
  </PopoverButton>
  <PopoverPanel className="absolute z-10">
    <Calendar value={selectedDate} onChange={setSelectedDate} />
  </PopoverPanel>
</Popover>
```

---

## Navigation Patterns

### Breadcrumb
```tsx
<nav aria-label="Breadcrumb" className="text-sm">
  <ol className="flex items-center gap-2">
    {breadcrumbs.map((item, idx) => (
      <li key={item.href}>
        <Link href={item.href} className="text-cyan hover:text-cyan-300">
          {item.label}
        </Link>
        {idx < breadcrumbs.length - 1 && (
          <span className="mx-2 text-zinc-600">/</span>
        )}
      </li>
    ))}
  </ol>
</nav>
```

### Tab Navigation
```tsx
<Tabs>
  <TabList className="flex gap-2 border-b border-white/10">
    {tabs.map(tab => (
      <Tab
        key={tab.id}
        className={`
          px-4 py-2 border-b-2 font-medium transition-colors
          ${activeTab === tab.id
            ? 'border-coral text-coral'
            : 'border-transparent text-zinc-400 hover:text-white'
          }
        `}
      >
        {tab.label}
      </Tab>
    ))}
  </TabList>

  {tabs.map(tab => (
    <TabPanel key={tab.id} className={activeTab === tab.id ? '' : 'hidden'}>
      {tab.content}
    </TabPanel>
  ))}
</Tabs>
```

---

## Responsive Behaviors

### Mobile-to-Desktop
```tsx
{/* Mobile: Stack */}
<div className="flex flex-col gap-4 md:flex-row">
  {/* Desktop: Side-by-side */}
</div>

{/* Mobile: Single column, Desktop: Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
</div>

{/* Mobile: Bottom sheet, Desktop: Modal */}
<Sheet open={isOpen}>
  <SheetContent side="bottom" className="md:side-center md:w-96">
    {content}
  </SheetContent>
</Sheet>
```

---

## Accessibility Patterns

### Skip Link
```tsx
<a
  href="#main-content"
  className="
    sr-only focus:not-sr-only
    fixed top-4 left-4 z-50
    px-4 py-2 bg-coral text-white
    rounded hover:bg-coral-600
  "
>
  본문으로 바로가기
</a>

<main id="main-content" tabIndex={-1}>
  {content}
</main>
```

### ARIA Live Region
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {notifications.map(notif => (
    <motion.div
      key={notif.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {notif.message}
    </motion.div>
  ))}
</div>
```

---

*ZZIK UI Patterns V4.0*
*Component Library & Interaction Guide*
