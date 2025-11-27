# /zzik-test Command

Run ZZIK MAP test suite with various options.

---

## Usage

```
/zzik-test [type] [options]
```

---

## Test Types

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run with watch mode
pnpm test:watch

# Run specific test file
pnpm test src/components/zzik/vibe/VibeBadge.test.tsx

# Run tests matching pattern
pnpm test --grep "useJourney"
```

### Coverage
```bash
# Run with coverage report
pnpm test:coverage

# Open coverage UI
pnpm test:ui
```

### E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific E2E test
pnpm test:e2e e2e/journey.spec.ts

# Run on specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project="Mobile Safari"
```

---

## Test Commands by Feature

### Journey Intelligence
```bash
# Unit tests
pnpm test src/hooks/useJourney.test.ts
pnpm test src/lib/journey/*.test.ts
pnpm test src/components/zzik/journey/**/*.test.tsx

# Integration tests
pnpm test src/app/api/journey/**/*.test.ts

# E2E tests
pnpm test:e2e e2e/journey.spec.ts
```

### Vibe Matching
```bash
# Unit tests
pnpm test src/hooks/useVibe.test.ts
pnpm test src/lib/vibe*.test.ts
pnpm test src/components/zzik/vibe/**/*.test.tsx

# E2E tests
pnpm test:e2e e2e/vibe.spec.ts
```

### MAP BOX
```bash
# Unit tests
pnpm test src/lib/mapbox/*.test.ts
pnpm test src/components/zzik/mapbox/**/*.test.tsx

# E2E tests
pnpm test:e2e e2e/mapbox.spec.ts
```

---

## CI Commands

```bash
# Run all tests (CI mode)
CI=true pnpm test:coverage && pnpm test:e2e

# Check coverage thresholds
pnpm test:coverage --coverage.thresholds.statements=80

# Generate test report
pnpm test:e2e --reporter=html
```

---

## Quick Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all unit tests |
| `pnpm test:watch` | Watch mode |
| `pnpm test:coverage` | With coverage |
| `pnpm test:ui` | Visual UI |
| `pnpm test:e2e` | E2E tests |
| `pnpm test:e2e:ui` | E2E with UI |

---

## Test Configuration Files

- **Vitest**: `vitest.config.ts`
- **Playwright**: `playwright.config.ts`
- **Setup**: `src/test/setup.ts`
- **Mocks**: `src/test/mocks/`

---

## Debugging Tests

```bash
# Debug specific test
pnpm test --inspect-brk src/hooks/useVibe.test.ts

# Run with verbose output
pnpm test --reporter=verbose

# Show test names only
pnpm test --reporter=dot
```

---

## Coverage Targets

| Area | Target |
|------|--------|
| Statements | 80% |
| Branches | 75% |
| Functions | 85% |
| Lines | 80% |

### Critical Paths (100% required)
- GPS extraction pipeline
- Payment processing
- Authentication flows
- Data validation
