# useEffect Cleanup — Performance Measurement Plan

**Date:** March 18, 2026
**Goal:** Quantify before/after perf impact of removing unnecessary useEffect calls

---

## What We're Measuring

Removing useEffect anti-patterns reduces:
1. **Render cycles** — derived-state effects cause setState-in-effect → extra render
2. **Effect scheduling overhead** — React's effect queue, dep comparison, cleanup/setup cycle
3. **Time-to-interactive** — fewer mount-time effects = faster first paint
4. **Re-render count** — flag-watching effects trigger cascading state updates

---

## Measurement Methods

### Method 1: React Profiler (Render Count + Duration)

Already in use — see `AlphabetGame.performance.test.tsx` for the pattern.

**Before/after test for each refactored component:**

```tsx
import { Profiler } from 'react';

const renders: Array<{ phase: string; duration: number }> = [];

<Profiler
  id="ComponentName"
  onRender={(_id, phase, actualDuration) => {
    renders.push({ phase, duration: actualDuration });
  }}
>
  <ComponentUnderTest />
</Profiler>

// After interaction sequence:
console.log('Total renders:', renders.length);
console.log('Mount duration:', renders[0]?.duration);
console.log('Total render time:', renders.reduce((s, r) => s + r.duration, 0));
```

**Metrics to capture:**
| Metric | What it tells us |
|--------|-----------------|
| `renders.length` | Total re-renders (fewer = better) |
| `renders[0].duration` | Mount cost in ms |
| `renders.reduce(sum)` | Total render CPU time |
| `renders.filter(r => r.phase === 'update').length` | Update re-renders only |

### Method 2: Custom useEffect Counter (Development Only)

Patch React's useEffect in dev to count calls:

```tsx
// src/frontend/src/utils/dev/effectCounter.ts
let effectCount = 0;
const originalUseEffect = React.useEffect;

export function patchEffectCounter() {
  if (import.meta.env.DEV) {
    React.useEffect = ((fn, deps) => {
      effectCount++;
      return originalUseEffect(fn, deps);
    }) as typeof React.useEffect;
  }
}

export function getEffectCount() { return effectCount; }
export function resetEffectCount() { effectCount = 0; }
```

**Usage in test:**
```tsx
resetEffectCount();
render(<AlphabetGame />);
// simulate game start + level complete
const count = getEffectCount();
console.log(`[PERF] AlphabetGame effects fired: ${count}`);
```

### Method 3: Performance.mark/measure (Wall Clock)

For real-user timing of specific interactions:

```tsx
function startGame() {
  performance.mark('game-start-begin');
  // ... existing handler logic
  startTracking();
  startRound();
  performance.mark('game-start-end');
  performance.measure('game-start', 'game-start-begin', 'game-start-end');
}
```

### Method 4: Chrome DevTools Profiler (Manual Verification)

1. Open React DevTools → Profiler tab
2. Enable "Record why each component rendered"
3. Click Start → interact → Stop
4. Look for "hook changed" re-render reasons — these are the effect-triggered renders

---

## Before/After Snapshot Process

### Step 1: Capture Baseline (Before)

```bash
# Run perf tests and save output
PERF_ASSERT_STRICT=1 npx vitest run --reporter=verbose \
  src/pages/__tests__/AlphabetGame.performance.test.tsx 2>&1 \
  | tee docs/perf/baseline_$(date +%Y%m%d).txt
```

### Step 2: Capture Key Metrics

For each page being refactored, record:

```markdown
## AlphabetGame — Baseline (2026-03-18)

| Metric | Value |
|--------|-------|
| useEffect count in file | 14 |
| Mount renders | ? |
| Mount duration (ms) | ? |
| Game-start renders | ? |
| Level-complete renders | ? |
| Total effects fired (mount→first-interaction) | ? |
```

### Step 3: Apply Changes

Implement P0 fixes from the audit:
- `useLatest` hook (eliminates ~40 ref-sync effects)
- Move `startTracking()` to handlers (eliminates 8 effects)
- Move `startRound()` to handlers (eliminates 6 effects)

### Step 4: Capture After

Same tests, same metrics. Diff the numbers.

### Step 5: Document in Perf Report

```markdown
## AlphabetGame — After useEffect Cleanup

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| useEffect count in file | 14 | 6 | -8 |
| Mount renders | X | Y | -Z |
| Mount duration (ms) | X | Y | -Z% |
| Effects fired (mount→first-interaction) | X | Y | -Z |
```

---

## Automated Regression Test

Create a reusable perf test factory:

```tsx
// src/frontend/src/test-utils/createPerfTest.tsx
import { Profiler } from 'react';
import { render } from '@testing-library/react';

export function createPerfTest(
  name: string,
  Component: React.ComponentType,
  wrapper: React.ComponentType<{ children: React.ReactNode }>,
) {
  return () => {
    const renders: Array<{ phase: string; duration: number }> = [];

    render(
      <wrapper>
        <Profiler
          id={name}
          onRender={(_id, phase, actualDuration) => {
            renders.push({ phase, duration: actualDuration });
          }}
        >
          <Component />
        </Profiler>
      </wrapper>
    );

    return {
      totalRenders: renders.length,
      mountDuration: renders[0]?.duration ?? 0,
      updateRenders: renders.filter(r => r.phase === 'update').length,
      totalCpuTime: renders.reduce((s, r) => s + r.duration, 0),
    };
  };
}
```

---

## What "Good" Looks Like

| Metric | Target |
|--------|--------|
| useEffect calls per game page | ≤ 5 (down from 8-14) |
| Mount renders | ≤ 2 (mount + 1 update) |
| Mount duration | < 100ms |
| Effects fired per game start | ≤ 3 |
| Zero RULE1/RULE3 effects | Enforced by lint rule |

---

## Lint Rule (Prevention)

Add to `.eslintrc` after cleanup:

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "react",
        "importNames": ["useEffect"],
        "message": "Import useEffect from '@/hooks/useMountEffect' or handle in event handler. See docs/USEEFFECT_AUDIT_2026-03-18.md"
      }]
    }]
  }
}
```

This forces developers to consciously choose: is this really a mount effect, or should it be derived/event-driven?

---

## Files

| File | Purpose |
|------|---------|
| `docs/USEEFFECT_AUDIT_2026-03-18.md` | Full audit results |
| `docs/USEEFFECT_PERF_MEASUREMENT.md` | This file — measurement plan |
| `src/pages/__tests__/AlphabetGame.performance.test.tsx` | Existing perf test (baseline) |
