# ZZIK LIVE Design Agent Skills

This directory contains custom Claude Code skills for maintaining and developing the ZZIK LIVE design system.

## Installed Skills

### 1. **zzik-frontend-design** 🎨
**Purpose**: Create distinctive, production-grade frontend interfaces for ZZIK LIVE

**Triggers**: frontend, ui, design, component, page, interface

**Key Features**:
- 2026 monotone aesthetic implementation
- Map-based mobile-first experiences
- Next.js 16 + Tailwind CSS optimization
- Avoids generic AI aesthetics
- Production-grade code with attention to detail

**Use When**:
- Building new pages or components
- Designing user interfaces
- Creating visual experiences
- Need creative, polished frontend code

---

### 2. **tailwind-expert** ⚡
**Purpose**: Expert guidance on Tailwind CSS utility-first styling

**Triggers**: tailwind, css, styling, responsive, utility, classes

**Key Features**:
- Utility-first best practices
- Mobile-first responsive patterns
- ZZIK color system enforcement
- Performance optimization
- Common pattern library

**Use When**:
- Writing Tailwind CSS classes
- Implementing responsive design
- Optimizing CSS performance
- Need specific Tailwind patterns
- Troubleshooting styling issues

---

### 3. **zzik-design-system** 🏗️
**Purpose**: Maintain consistency across ZZIK LIVE's @zzik/ui component library

**Triggers**: design system, component library, @zzik/ui, consistency, style guide

**Key Features**:
- Component architecture guidelines
- Design tokens reference
- Usage patterns and examples
- Consistency enforcement
- Testing and migration guides

**Use When**:
- Using @zzik/ui components
- Creating new components
- Ensuring design consistency
- Need component library reference
- Planning design system updates

---

## How Skills Work

Claude Code automatically activates skills based on:
1. **Trigger Words**: Keywords in your request
2. **Context**: The type of task you're performing
3. **Explicit Invocation**: Mentioning the skill name

### Automatic Activation Examples

```
"Create a new PlaceCard component"
→ Activates: zzik-frontend-design, zzik-design-system

"Style this button with Tailwind"
→ Activates: tailwind-expert

"Make this responsive for mobile"
→ Activates: zzik-frontend-design, tailwind-expert
```

### Explicit Invocation

You can explicitly invoke a skill by mentioning it:
```
"Using the zzik-design-system, show me how to implement filters"

"As a tailwind-expert, optimize these classes"

"With zzik-frontend-design principles, create a mission card"
```

---

## Design System Quick Reference

### Colors (2026 Monotone)
```css
/* Backgrounds */
bg-zinc-900  /* Primary */
bg-zinc-800  /* Secondary */
bg-zinc-700  /* Tertiary */

/* Text */
text-white   /* Primary */
text-zinc-400 /* Secondary */

/* Accents (Low Saturation) */
bg-emerald-500/80  /* Success/Green */
bg-amber-500/90    /* Warning/Yellow */
bg-rose-500/80     /* Danger/Red */
```

### Typography
```css
text-xs    /* 12px - Labels */
text-sm    /* 14px - Body */
text-base  /* 16px - Headers */

font-medium    /* 500 */
font-semibold  /* 600 */
```

### Spacing
```css
gap-2 p-2  /* 8px - Tight */
gap-3 p-3  /* 12px - Default */
gap-4 p-4  /* 16px - Comfortable */
```

### Components (@zzik/ui)
```tsx
import {
  // Primitives
  Button, Card,
  // Layout
  MapShell, MapOverlay, BottomTabs, BottomTabItem,
  // Domain
  PlaceCard
} from '@zzik/ui'
```

---

## Best Practices

### ✅ DO:
- Follow mobile-first design (390px → 768px+)
- Use Tailwind utilities exclusively
- Implement subtle hover states (hover:bg-zinc-800/50)
- Add `data-testid` attributes for testing
- Follow @zzik/ui patterns
- Maintain 2026 monotone aesthetic

### ❌ DON'T:
- Use high-saturation colors (no pure blue-500, red-500)
- Create CSS-in-JS or styled-components
- Use generic fonts (Inter, Arial) without consideration
- Break z-index layering (map < overlay < tabs)
- Forget accessibility (ARIA, keyboard nav)

---

## Skill Maintenance

### Adding New Skills
1. Create directory: `.claude/skills/skill-name/`
2. Add `SKILL.md` with frontmatter
3. Update this README

### Updating Skills
Edit the `SKILL.md` file in each skill directory. Changes take effect immediately.

### Removing Skills
Delete the skill directory from `.claude/skills/`

---

## Testing Skills

Test skills are working by:
```
"Show me the ZZIK color palette"
→ Should activate zzik-design-system

"Create a responsive button"
→ Should activate zzik-frontend-design + tailwind-expert
```

---

## Resources

- **Official Design System**: `packages/ui/src/`
- **Tailwind Config**: `apps/web/tailwind.config.ts`
- **Component Examples**: `apps/web/src/app/(tabs)/map/page.tsx`
- **Test Examples**: `tests/ux/map-basic.spec.ts`

---

## Troubleshooting

**Skill not activating?**
- Check trigger words in your request
- Explicitly mention the skill name
- Verify SKILL.md frontmatter syntax

**Conflicts between skills?**
- Skills are designed to work together
- Each has a specific focus area
- They share the same design principles

**Need help?**
Ask Claude:
```
"What design skills are available?"
"How do I use the zzik-frontend-design skill?"
"Show me examples from the design system"
```

---

## Version History

- **v1.0.0** (2025-01-22): Initial release
  - zzik-frontend-design
  - tailwind-expert
  - zzik-design-system

---

**Last Updated**: 2025-01-22
**Maintained By**: ZZIK LIVE Team
