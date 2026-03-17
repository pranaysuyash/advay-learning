# useEffect Audit — Full Codebase

**Date:** March 18, 2026
**Scope:** 578 useEffect calls across 232 files
**Audited:** 130 useEffect calls across 23 high-impact files (top-10 game pages + 13 shared hooks/components)
**Reference:** [Factory's "Why we banned useEffect"](https://x.com/alvinsng/status/2033969062834045089)

---

## Headline Numbers

| Classification | Game Pages (10 files) | Hooks/Components (13 files) | **Total** | **%** |
|---|---|---|---|---|
| **RULE4_MOUNT** — Legitimate (timers, DOM, subscriptions) | 64 | 27 | **91** | 70% |
| **RULE3_EVENT** — Flag-watching (should be event handler) | 19 | 3 | **22** | 17% |
| **RULE1_DERIVE** — Derived state (should be useMemo/inline) | 3 | 8 | **11** | 8.5% |
| **RULE2_FETCH** — Data fetching (should use React Query) | 0 | 5 | **5** | 3.8% |
| **RULE5_RESET** — ID-change reset (should use key=) | 1 | 0 | **1** | 0.8% |
| **Total audited** | 87 | 43 | **130** | |

**~70% are legitimate.** The remaining 30% (~39 effects) are fixable.

---

## Recurring Anti-Patterns (Ordered by Impact)

### 1. 🔴 "startTracking when flags align" — 8+ game files

```tsx
// ANTI-PATTERN (appears in 8 of 10 game pages):
useEffect(() => {
  if (isPlaying && isHandTrackingReady && !gameCompleted) {
    startTracking();
  }
}, [isPlaying, isHandTrackingReady, gameCompleted, startTracking]);
```

**Fix:** Call `startTracking()` directly in the `startGame()` event handler.

**Impact:** Eliminates 8 effects + removes one render cycle per game start.

### 2. 🔴 "startRound when level changes" — 6+ game files

```tsx
// ANTI-PATTERN:
useEffect(() => {
  if (isPlaying && !gameCompleted) {
    startRound();
  }
}, [isPlaying, level, gameCompleted]);
```

**Fix:** Call `startRound()` in `completeLevel()` / `startGame()` handlers.

**Impact:** Eliminates 6 effects + removes one render cycle per level transition.

### 3. 🟡 Ref-sync boilerplate — 40+ individual effects

```tsx
// BOILERPLATE (extremely common):
useEffect(() => { scoreRef.current = score; }, [score]);
useEffect(() => { levelRef.current = level; }, [level]);
useEffect(() => { streakRef.current = streak; }, [streak]);
// ... repeated for every state variable used in callbacks
```

These are **technically legitimate** (RULE4_MOUNT) but account for ~40 of the 91 "OK" effects.

**Fix:** Create a `useLatest<T>(value: T)` hook:

```tsx
function useLatest<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  ref.current = value;  // sync inline, no effect needed
  return ref;
}
```

**Impact:** Eliminates ~40 effects. Each was a no-op re-render-wise but adds noise and deps array maintenance burden.

### 4. 🟡 Derived state via effect — 11 cases

| File | What's derived | Fix |
|------|---------------|-----|
| `Progress.tsx` | `timeBreakdown`, `struggleSummary` from `progress` | `useMemo` |
| `Dashboard.tsx` | `currentProfile` from `defaultProfile` | Set in fetch callback |
| `VisionButton.tsx` | `isSpatialHovered` from cursor position | `useMemo` |
| `VoiceButton.tsx` | `showSpeakingLabel` from `isTTSspeaking` | CSS transition |
| `Mascot.tsx` | `bounce` from `state` | CSS animation |
| `useVoicePrompt.ts` | `preferredVoice` from settings store | Read from store directly |
| `useTimeOnTask.ts` | ref-sync of `state` | Inline ref assignment |
| `useGameHandTracking.ts` | `lifecycleState` from 8 values | `useMemo` |
| `AlphabetGame.tsx` | `isHandTrackingLoading` from `isHandTrackingReady` | Derive inline |
| `ConnectTheDots.tsx` | "all dots connected" check | Derive in handler |
| `Progress.tsx` | Auto-select first profile | Set in fetch callback |

**Impact:** Each removes 1 extra render cycle (effect sets state → triggers re-render).

### 5. 🟡 Data fetching in effects — 5 cases

| File | What's fetched |
|------|---------------|
| `Dashboard.tsx` | Profiles, progress, subscription status |
| `Progress.tsx` | Profiles, progress + stats |

**Fix:** Adopt React Query / TanStack Query. These already need caching, error handling, and loading states.

**Impact:** Eliminates race conditions, duplicate requests, and manual loading/error state.

### 6. 🟢 Reset via effect — 1 case

`AlphabetGame.tsx` resets `pendingCount` when `resolvedProfileId` changes. Fix: `key={resolvedProfileId}`.

---

## Priority Implementation Plan

### P0 — High Impact, Low Risk

| # | Change | Effects Removed | Files | Effort |
|---|--------|----------------|-------|--------|
| 1 | Create `useLatest<T>` hook | ~40 | All game pages | 1 hour |
| 2 | Move `startTracking()` to `startGame()` handler | 8 | 8 game pages | 2 hours |
| 3 | Move `startRound()` to event handlers | 6 | 6 game pages | 2 hours |
| 4 | Convert `lifecycleState` to `useMemo` in `useGameHandTracking` | 1 | All games (shared hook) | 30 min |

**Subtotal: ~55 effects eliminated**

### P1 — Medium Impact

| # | Change | Effects Removed | Files | Effort |
|---|--------|----------------|-------|--------|
| 5 | Convert 11 derived-state effects to `useMemo`/inline | 11 | Various | 3 hours |
| 6 | Add lint rule: `no-restricted-syntax` for bare `useEffect` | 0 (prevention) | eslint config | 30 min |

### P2 — Larger Effort

| # | Change | Effects Removed | Files | Effort |
|---|--------|----------------|-------|--------|
| 7 | Adopt React Query for Dashboard/Progress fetching | 5 | 2 pages | 4 hours |
| 8 | VisionButton → deprecate (GlobalCVCursor replaces it) | 2 | 1 component | 30 min |

**Grand total: ~73 effects eliminated out of 130 audited (~56%)**

Extrapolating to the full 578: **estimated ~250 effects removable** codebase-wide.

---

## Perf Measurement Plan

See `docs/USEEFFECT_PERF_MEASUREMENT.md` for the before/after tracking methodology.
