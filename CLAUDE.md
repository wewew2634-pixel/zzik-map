# ZZIK MAP - Claude Code Project Guide
## V5 Final: AI-Powered K-Travel Discovery Platform

---

## Project Overview

**ZZIK MAP** is a K-travel discovery platform where foreign tourists upload photos and receive next destination recommendations based on Crowd Wisdom.

### One-Liner
> "With one photo, know where 847 travelers went next"

### Brand
- **Meaning**: ZZIK = Capture + Pin + Pick
- **Slogan**: "Discover Real Korea Through Photos"
- **Target**: Foreign Tourists (16.37M/year) + Korean MZ Generation

---

## Core Features (V5)

### 1. Journey Intelligence (Phase 1)
```
User: Upload travel photo
ZZIK: "847 similar travelers went to Seongsu-dong next (78%)"
```

### 2. Vibe Matching (Phase 2)
```
User: "Find cafes with this vibe" + photo
ZZIK: "Onion Seongsu (89% match)"
```

### 3. MAP BOX (Phase 3)
```
Business: Register experience → Creator: Visit/Create content
ZZIK: 20% commission + Vibe data accumulation
```

---

## Tech Stack

```yaml
Frontend: Next.js 15, TypeScript, Tailwind CSS v4, Catalyst UI Kit
Backend:  Supabase (PostgreSQL + pgvector), Firebase Auth, Redis
AI:       Gemini 2.0 Flash (Vision), pgvector
Maps:     Kakao Maps (Korea), Mapbox (International)
i18n:     6 languages (ko, en, ja, zh-CN, zh-TW, th)
```

---

## Design System: Catalyst UI Kit

ZZIK MAP uses **Tailwind Plus Catalyst UI Kit** (27 production-grade components).

### Component Categories
```
Layout (5):     sidebar-layout, sidebar, navbar, stacked-layout, auth-layout
Form (10):      button, input, textarea, select, checkbox, radio, switch, fieldset, combobox, listbox
Display (7):    avatar, badge, table, description-list, text, heading, divider
Overlay (3):    dialog, dropdown, alert
Navigation (2): link, pagination
```

### Usage
```tsx
import { Button, Input, Avatar, Dialog } from '@/components/catalyst'
```

### Reference
- **Design System V3**: `/docs/DESIGN_SYSTEM_V3.md`
- **Frontend Agent V3**: `/.claude/agents/zzik-frontend.md`

---

## Project Structure

```
/home/ubuntu/zzik-map/
├── CLAUDE.md              # This file
├── README.md              # Project README
├── .gitignore             # Git ignore rules
├── /.claude               # Claude Code settings
│   ├── /agents            # Specialized agents
│   ├── /commands          # Slash commands
│   └── /skills            # Development skills
├── /docs                  # Strategy/Technical docs
│   ├── BUSINESS_PLAN_V5_FINAL.md
│   └── ZZIK_IR_DECK_V5_FINAL.md
└── /app                   # Next.js application
    ├── /src
    │   ├── /app           # App router pages
    │   ├── /components    # React components
    │   ├── /hooks         # Custom hooks
    │   ├── /lib           # Utilities
    │   ├── /types         # TypeScript types
    │   └── /i18n          # Internationalization
    ├── /public            # Static assets
    └── /supabase          # DB migrations
```

---

## Available Agents

| Agent | Location | Purpose |
|-------|----------|---------|
| `zzik-frontend` | .claude/agents | UI development with Catalyst Design System |
| `zzik-journey` | .claude/agents | Journey Intelligence development |
| `zzik-vibe` | .claude/agents | Vibe Matching development |
| `zzik-mapbox` | .claude/agents | MAP BOX platform development |
| `zzik-database` | .claude/agents | Supabase/pgvector management |
| `zzik-testing` | .claude/agents | Testing (Vitest, Playwright, MSW) |
| `zzik-ai` | .claude/agents | AI integration (Gemini API) |
| `nano-uxui` | .claude/agents | **V3** Atomic-level QA with Auto-Fix Engine |
| `uxui-audit-v4` | .claude/agents | **V4** 16-dimension audit framework with behavioral science |
| `uxui-mastery-v7` | .claude/agents | **V7** Mastery framework with cognitive psychology & systems thinking |
| `cognitive-principles-v7` | .claude/agents | **V7** Behavioral psychology & mental models for ZZIK |

---

## Available Skills V3 + V7

| Skill | Category | Purpose |
|-------|----------|---------|
| `photo-processing` | Core | EXIF extraction, compression, validation |
| `pgvector-optimization` | Core | Vector search indexing & optimization |
| `i18n-implementation` | Core | next-intl setup & translation patterns |
| `browser-automation` | QA | Playwright visual QA & screenshot capture |
| `performance-optimization` | QA | Core Web Vitals & 60fps optimization |
| `accessibility-audit` | QA | WCAG 2.1 AA/AAA compliance |
| `design-tokens` | **V3** | 4-layer token architecture & generation |
| `animation-system` | **V3** | 60fps motion design & performance |
| `responsive-design` | **V3** | Mobile-first & fluid typography |
| `zzik-ui-patterns` | **V4** | ZZIK-specific UI pattern library (7 core patterns) |
| `microinteractions-v4` | **V4** | 10 core microinteraction patterns with timings |
| `motion-economics-v7` | **V7** | Animation ROI, performance efficiency & psychology |
| `data-driven-design-v7` | **V7** | Metrics, analytics & evidence-based decisions |
| `state-machines-v7` | **V7** | Complete user flow state transitions |

---

## Available Commands

| Command | Description |
|---------|-------------|
| `/zzik-dev` | Start development environment |
| `/zzik-status` | Check project status |
| `/zzik-build` | Production build |
| `/zzik-test` | Run test suite (unit, E2E, coverage) |
| `/zzik-db` | Database operations (migrations, seeds, backup) |
| `/zzik-deploy` | Deployment (staging, production, rollback) |
| `/zzik-i18n` | Translation management (6 languages) |

---

## Quick Start

```bash
# 1. Navigate to project
cd /home/ubuntu/zzik-map/app

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local

# 4. Start dev server
pnpm dev
```

---

## Brand Colors

```css
--zzik-coral: #FF5A5F;      /* Primary */
--deep-space: #0A1628;      /* Background */
--electric-cyan: #00D9FF;   /* Accent */
```

---

## Development Roadmap

| Phase | Period | Goal | KPI |
|-------|--------|------|-----|
| 1 | Week 1-4 | Journey Intelligence MVP | Beta 50 users |
| 2 | Week 5-8 | Vibe Matching | 500 embeddings |
| 3 | Week 9-12 | MAP BOX | 20 partners, 50 creators |

---

## Key Technical Specs (V5)

| Tech | Spec | Notes |
|------|------|-------|
| GPS Extraction | 50-60% EXIF + 40-85% AI | 3-step fallback |
| Recommendation | Content-Based → Hybrid → Collaborative (M12+) | Phased evolution |
| Vibe Embedding | 128-dim pgvector | IVFFlat O(sqrt(n)) |
| API | Gemini 2.0 Flash Vision | M4 paid tier |

---

## Reference Documents

- **Business Plan**: `/docs/BUSINESS_PLAN_V5_FINAL.md`
- **IR Deck**: `/docs/ZZIK_IR_DECK_V5_FINAL.md`
- **Design System V3**: `/docs/DESIGN_SYSTEM_V3.md`

---

## Core Messages

```
"With one photo, know your next destination"
"AI handles the vibe, Crowd handles discovery"
"Once data accumulates, no one can follow"
```

---

*Version: v5.3 | Updated: 2025-11-27*
*V7 Complete: UX/UI Mastery Framework with behavioral psychology, cognitive principles, motion economics, data-driven design, and state machines*
*Agents: +3 V7 agents (uxui-mastery-v7, uxui-audit-v4, cognitive-principles-v7)*
*Skills: +5 V7 skills (motion-economics-v7, data-driven-design-v7, state-machines-v7, zzik-ui-patterns, microinteractions-v4)*
