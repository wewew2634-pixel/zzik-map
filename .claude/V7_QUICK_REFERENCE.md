# V7 Framework Quick Reference
## 빠른 참고 (Quick Lookup Guide)

---

## Find What You Need

### **By Question**

**"How should I design this?"**
→ `uxui-mastery-v7.md` → Level 1-7 framework

**"Why do users behave this way?"**
→ `cognitive-principles-v7.md` → Behavioral psychology + mental models

**"Is my animation worth the code?"**
→ `motion-economics-v7.md` → ROI calculation

**"What should I measure?"**
→ `data-driven-design-v7.md` → Metrics framework

**"What's the flow from signup to recommendations?"**
→ `state-machines-v7.md` → Complete state diagrams

**"How do I know if my design is good?"**
→ `uxui-audit-v4.md` → 16-dimension evaluation

**"What are the ZZIK-specific patterns?"**
→ `zzik-ui-patterns.md` → 7 core patterns

**"How do I animate this without janking?"**
→ `microinteractions-v4.md` → 10 patterns + timings

---

### **By Phase**

**Wireframing/Planning** →
1. `state-machines-v7.md` (understand flow)
2. `cognitive-principles-v7.md` (design for behavior)
3. `zzik-ui-patterns.md` (use patterns)

**Design/Mockups** →
1. `uxui-mastery-v7.md` (7 levels of design)
2. `design-tokens.md` (colors, spacing, fonts)
3. `data-driven-design-v7.md` (metrics to optimize)

**Implementation** →
1. `responsive-design.md` (mobile-first CSS)
2. `microinteractions-v4.md` (animation code)
3. `animation-system.md` (60fps patterns)

**Optimization** →
1. `motion-economics-v7.md` (animation ROI)
2. `performance-optimization.md` (Web Vitals)
3. `data-driven-design-v7.md` (A/B testing)

**Testing/Audit** →
1. `browser-automation.md` (E2E testing)
2. `accessibility-audit.md` (WCAG compliance)
3. `uxui-audit-v4.md` (comprehensive audit)

---

### **By Role**

**Product Manager** →
- `data-driven-design-v7.md` (North Star, KPIs, metrics)
- `cognitive-principles-v7.md` (user motivation, habits)
- `state-machines-v7.md` (complete user journeys)

**Designer** →
- `uxui-mastery-v7.md` (design thinking framework)
- `zzik-ui-patterns.md` (component patterns)
- `microinteractions-v4.md` (animation specs)
- `design-tokens.md` (design system tokens)

**Engineer** →
- `state-machines-v7.md` (implement state flows)
- `microinteractions-v4.md` (animation code)
- `responsive-design.md` (CSS patterns)
- `animation-system.md` (Framer Motion patterns)

**QA/Test** →
- `browser-automation.md` (automation framework)
- `accessibility-audit.md` (compliance testing)
- `uxui-audit-v4.md` (comprehensive checks)

**Analytics/Growth** →
- `data-driven-design-v7.md` (events, metrics, cohorts, A/B testing)
- `cognitive-principles-v7.md` (habit formation, motivation)

---

## Key Formulas & Calculations

### Cognitive Load
```
Total Load = Intrinsic + Extraneous + Germane
Target: Total ≤ 100% (working memory capacity)
Strategy: Reduce Extraneous, increase Germane, manage Intrinsic
```

### Information Weight
```
Weight = (Importance + Complexity) × Frequency
Higher weight → more prominent in UI
```

### Design Debt ROI
```
ROI = (Impact × Frequency) / Effort
ROI > 7 = Implement
ROI 3-7 = Optimize
ROI < 3 = Remove
```

### Animation ROI
```
ROI = (Cognitive Value + Engagement Value) / (Performance Cost + Memory Cost)
High ROI (>7) = Essential microinteractions (button feedback, form validation)
Medium ROI (3-7) = Nice-to-have (hover effects, list animations)
Low ROI (<3) = Remove (decorative background effects)
```

### A/B Test Power
```
Need sample size? Use: https://www.abtestguide.com/calculator/
Key: p-value < 0.05 (statistically significant)
Key: MDE (Minimum Detectable Effect) > 10%
```

---

## Quick Decision Trees

### "Should I add this animation?"

```
Is there an interaction? (user clicks/taps)
├─ Yes → Add feedback animation (100-200ms)
└─ No → Skip (decorative is low ROI)

Does it communicate something?
├─ Yes → Keep (cognitive value)
└─ No → Remove (no value)

Is it GPU accelerated? (transform/opacity only)
├─ Yes → Can ship
└─ No → Refactor to use transform/opacity

Does it respect prefers-reduced-motion?
├─ Yes → Accessible ✓
└─ No → Add media query support

Duration appropriate for action?
├─ Yes → Ship
└─ No → Adjust duration

Performance OK? (60 FPS, < 200ms)
├─ Yes → ✓ Ready to ship
└─ No → Optimize or remove
```

### "Is this metric worth tracking?"

```
Does it reflect user value?
├─ No → Vanity metric, don't track
└─ Yes → Continue...

Can we act on this data?
├─ No → Diagnostic metric (support only, don't optimize)
└─ Yes → Continue...

Is it aligned with North Star?
├─ Yes → KPI, track and optimize ✓
└─ No → Diagnostic, track but don't optimize

Can we influence it?
├─ No → Monitor only
└─ Yes → Build experiments around it
```

### "What state should this be in?"

```
User action occurred?
├─ No → Show loading state (spinner, skeleton)
└─ Yes → Continue...

Action successful?
├─ No → Show error state (message, icon, retry)
└─ Yes → Continue...

Data loaded?
├─ No → Loading state
└─ Yes → Show content

Content available?
├─ No → Empty state (explanation, action)
└─ Yes → Show results

User satisfied?
├─ No → Suggest alternatives
└─ Yes → Success state (celebration, confirmation)
```

---

## Core Principles (One-Liners)

**Cognitive Load**:
> *Reduce friction, encourage learning, respect working memory*

**Behavioral Design**:
> *Design for what users want to do repeatedly, not what they should do once*

**Motion**:
> *Every pixel that moves should earn its place through cognitive or engagement value*

**Data-Driven**:
> *Measure real metrics, ignore vanity metrics, test hypotheses*

**State Machines**:
> *Every state tells a story; design them well*

**Accessibility**:
> *WCAG AA minimum, AAA excellence, universal design beyond compliance*

**Emotional Design**:
> *Trust through reliability, delight through unexpected moments*

---

## Animation Timings (Copy-Paste Ready)

```typescript
// Standard timings
const DURATION = {
  instant: 50,      // Tap feedback
  fast: 100,        // Hover effects
  normal: 200,      // Standard transition
  slow: 300,        // Modal, intentional action
  slower: 500,      // Celebration, important moment
  slowest: 800,     // Extended celebration
};

// Standard easing
const EASING = {
  out: [0, 0, 0.2, 1],              // Responsive (entering)
  in: [0.4, 0, 1, 1],               // Deliberate (exiting)
  inOut: [0.4, 0, 0.2, 1],          // Morphing (changing)
  spring: [0.175, 0.885, 0.32, 1.275], // Playful (celebratory)
  bounce: [0.34, 1.56, 0.64, 1],   // Bouncy (achievement)
  linear: 'linear',                  // Honest time (loading)
};

// For Framer Motion
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: DURATION.fast, ease: EASING.out }}
/>
```

---

## KPI Checklist

- [ ] Define North Star metric (primary success measure)
- [ ] Identify 3-5 supporting KPIs
- [ ] Set targets for each KPI
- [ ] Create tracking dashboard
- [ ] Review weekly with team
- [ ] Run A/B tests to improve KPIs
- [ ] Calculate cohort retention (Day-1, 7, 30)
- [ ] Track feature adoption %
- [ ] Monitor error rates
- [ ] Measure task completion rate

---

## Design Checklist (16 Dimensions)

- [ ] **Information Architecture**: Navigation clear, content organized, wayfinding obvious
- [ ] **Interaction Design**: Immediate feedback, clear errors, success states
- [ ] **Visual Hierarchy**: Emphasis through size/color/weight, clear focus
- [ ] **Accessibility**: WCAG AA contrast, 44px targets, full keyboard nav
- [ ] **Performance**: FCP < 1.8s, interactive < 3.5s, smooth scrolling
- [ ] **Mobile**: Single column, touch-friendly, no horizontal scroll
- [ ] **Microinteractions**: Hover states, focus rings, feedback animations
- [ ] **Consistency**: Visual patterns reused, same action = same result
- [ ] **Cognitive Load**: One primary action per screen, progressive disclosure
- [ ] **Brand & Personality**: Colors, typography, tone of voice consistent
- [ ] **Emotional Design**: Delight moments, empathy in errors, engagement clear
- [ ] **Content & Copy**: Clear headings, scannable text, action-oriented buttons
- [ ] **Internationalization**: RTL ready, text expansion room, localized formats
- [ ] **Privacy & Security**: HTTPS, transparent tracking, user control, data exports
- [ ] **Onboarding**: First screen explains value, minimum friction, progressive
- [ ] **Analytics**: Key actions tracked, funnels visible, experiments ready

---

## Resources Inside Files

### uxui-mastery-v7.md
- 7 operating levels of design
- Cognitive load theory with formulas
- Behavioral psychology principles
- Emotional resonance drivers
- Conversion funnel optimization
- State machine diagrams

### cognitive-principles-v7.md
- 6 cognitive biases with applications
- Habit formation timeline
- Decision-making framework
- Mental models & metaphors
- Trust building stages
- Error recovery strategies

### motion-economics-v7.md
- ROI calculation for animations
- Performance thresholds (FPS, frame time)
- Duration psychology (50ms-800ms+)
- Easing curve psychology
- Motion metrics & measurement
- Optimization checklist

### data-driven-design-v7.md
- Vanity vs. real metrics
- 12 KPIs for ZZIK
- UX metrics (responsiveness, error recovery)
- Analytics event taxonomy
- Cohort analysis framework
- A/B testing methodology
- Metrics reporting templates

### state-machines-v7.md
- Auth flow (signup → onboarding → authenticated)
- Upload flow (validation → uploading → results)
- Vibe matching flow
- Saving & MAP BOX flow
- Error recovery machine
- System health states
- Notification machine

---

## When in Doubt

1. **Read** `uxui-mastery-v7.md` for strategic direction
2. **Check** `cognitive-principles-v7.md` for user psychology
3. **Measure** with `data-driven-design-v7.md` framework
4. **Verify** with `uxui-audit-v4.md` checklist
5. **Implement** with pattern libraries and timing guides

---

*V7 Quick Reference | 2025-11-27*
*Keep this open while designing, building, testing*
