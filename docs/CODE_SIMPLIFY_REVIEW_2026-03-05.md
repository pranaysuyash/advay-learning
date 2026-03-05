# Code Simplify Review Findings

**Date**: 2026-03-05
**Review Type**: Code Reuse, Quality, and Efficiency
**Trigger**: `/simplify` command on large diff (143 files changed, ~10,622 additions, ~4,546 deletions)

## Executive Summary

The codebase review identified significant opportunities for consolidation across game logic files, game page components, and utility functions. The most impactful findings involve duplicate scoring calculations, repeated streak tracking patterns, and inefficient localStorage operations.

---

## 1. Code Reuse Issues

### 1.1 CRITICAL: Duplicate `calculateScore` Functions (10+ files)

**Pattern**: Identical scoring logic duplicated across game logic files with only `baseScore` varying (10, 15, or 20).

**Affected Files**:
- `src/frontend/src/games/animalSoundsLogic.ts` (baseScore: 15)
- `src/frontend/src/games/bodyPartsLogic.ts` (baseScore: 15)
- `src/frontend/src/games/colorSortGameLogic.ts` (baseScore: 10)
- `src/frontend/src/games/countingObjectsLogic.ts` (baseScore: 10)
- `src/frontend/src/games/moneyMatchLogic.ts` (baseScore: 15)
- `src/frontend/src/games/moreOrLessLogic.ts` (baseScore: 10)
- `src/frontend/src/games/numberBubblePopLogic.ts` (baseScore: 15)
- `src/frontend/src/games/popTheNumberLogic.ts` (baseScore: 10)
- `src/frontend/src/games/weatherMatchLogic.ts` (baseScore: 15)
- `src/frontend/src/games/beginningSoundsLogic.ts` (baseScore: 20)
- `src/frontend/src/games/oddOneOutLogic.ts` (baseScore: 20)
- `src/frontend/src/games/sizeSortingLogic.ts` (baseScore: 15)
- `src/frontend/src/games/airGuitarHeroLogic.ts` (baseScore: 10)
- `src/frontend/src/games/numberSequenceLogic.ts` (baseScore: 10)

**Duplicate Pattern**:
```typescript
const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
};

export function calculateScore(streak: number, level: number): number {
  const baseScore = 10;  // or 15 or 20
  const streakBonus = Math.min(streak * 3, 15);
  const multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1;
  return Math.floor((baseScore + streakBonus) * multiplier);
}
```

**Recommendation**: Create `src/frontend/src/utils/scoring.ts` with a shared function that accepts `baseScore` as a parameter.

---

### 1.2 HIGH: Duplicate Window Resize Handlers (2+ files)

**Affected Files**:
- `src/frontend/src/pages/FeedTheMonster.tsx`
- `src/frontend/src/pages/TimeTell.tsx`
- (And ~30+ other game pages with similar patterns)

**Duplicate Pattern**:
```typescript
const [windowSize, setWindowSize] = useState({
  width: window.innerWidth,
  height: window.innerHeight,
});

useEffect(() => {
  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**Recommendation**: Create `src/frontend/src/hooks/useWindowSize.ts` (does not currently exist).

---

### 1.3 MEDIUM: Inline Shuffle Pattern (30+ locations)

**Pattern**: `[...array].sort(() => Math.random() - 0.5)` appears throughout the codebase.

**Affected Files**:
- `src/frontend/src/games/animalSoundsLogic.ts`
- `src/frontend/src/games/bodyPartsLogic.ts`
- `src/frontend/src/games/colorSortGameLogic.ts`
- (and 27+ more game logic files)

**Issue**: The sort-with-random approach:
1. Is not a properly distributed shuffle
2. Is slower than Fisher-Yates for larger arrays
3. Is duplicated everywhere

**Note**: `src/frontend/src/utils/random.ts` exists but only has `randomFloat01()` and `randomBetween()` - no `shuffle()` function.

---

### 1.4 MEDIUM: Duplicate Total Time Calculation

**Location**: `src/frontend/src/utils/progressCalculations.ts`

**Duplicate Pattern** (appears at least 2 times):
```typescript
const totalTime = attempts.reduce((sum, a) => sum + a.durationSeconds, 0);
```

**Lines**: ~595 and ~678

**Recommendation**: Extract to `sumDurationSeconds(attempts: Attempt[]): number` helper.

---

## 2. Code Quality Issues

### 2.1 HIGH: Mass Copy-Paste of Streak Tracking State (60+ game components)

**Pattern Repeated 60+ Times**:
```typescript
const [streak, setStreak] = useState(0);
const [maxStreak, setMaxStreak] = useState(0);
const [showStreakMilestone, setShowStreakMilestone] = useState(false);
const [scorePopup, setScorePopup] = useState<{...} | null>(null);
const streakRef = useRef(0);

useEffect(() => {
  streakRef.current = streak;
}, [streak]);

// And in the handler:
if (newStreak > 0 && newStreak % 5 === 0) {
  setShowStreakMilestone(true);
  setTimeout(() => setShowStreakMilestone(false), 1200);
}
```

**Affected Files**: 60+ game page components

**Recommendation**: Create `src/frontend/src/hooks/useStreakTracking.ts` to consolidate this pattern.

---

### 2.2 MEDIUM: Stringly-Typed Haptic Types (150+ instances)

**Pattern**: Raw string literals used 150+ times instead of typed constants.

**Current Usage**:
```typescript
triggerHaptic('success');
triggerHaptic('celebration');
triggerHaptic('error');
```

**Note**: `src/frontend/src/utils/haptics.ts` already has `HapticType` type defined but doesn't export the values as constants for autocomplete/type safety.

**Current haptics.ts**:
```typescript
export type HapticType = 'success' | 'error' | 'celebration';
// No exported constants like HAPTIC_SUCCESS, etc.
```

**Recommendation**: Export typed constants:
```typescript
export const HAPTIC_TYPES = {
  SUCCESS: 'success',
  CELEBRATION: 'celebration',
  ERROR: 'error',
} as const;
```

---

### 2.3 MEDIUM: Magic Number for Streak Milestones (67 instances)

**Pattern**: Hardcoded `% 5` check appears 67 times across the codebase.

**Current Usage**:
```typescript
if (newStreak > 0 && newStreak % 5 === 0) {
```

**Recommendation**: Create `src/frontend/src/games/constants.ts`:
```typescript
export const STREAK_MILESTONE_INTERVAL = 5;
export const STREAK_MILESTONE_DURATION_MS = 1200;
```

---

### 2.4 MEDIUM: Copy-Paste Streak Milestone JSX (40+ variations)

**Issue**: Similar but not identical streak milestone popup JSX repeated across games with different animation/positioning values.

**Examples**:
- `AirGuitarHero.tsx`: Uses `motion.div` with `rotate: -20` initial
- `AnimalSounds.tsx`: Uses CSS `animate-bounce` with `bg-orange-100`
- `BeatBounce.tsx`: Uses `motion.div` with `rotate: -180` initial

**Recommendation**: Create a shared `StreakMilestone` component with variant support.

---

### 2.5 LOW: Redundant State with Ref Synchronization

**Pattern**: `useRef` + `useEffect` to sync state, often unnecessary:

```typescript
const streakRef = useRef(0);
useEffect(() => {
  streakRef.current = streak;
}, [streak]);
```

**Issue**: This pattern exists because closures in event handlers capture stale state. Better to use functional state updates or proper `useCallback` dependencies.

---

### 2.6 LOW: Leaky Abstraction in Progress Metadata

**Location**: `src/frontend/src/pages/BubblePop.tsx`

**Issue**: `metadata?: Record<string, unknown>` allows any data without validation.

**Recommendation**: Define typed metadata schema.

---

## 3. Efficiency Issues

### 3.1 MEDIUM: N+1 Pattern in Analytics (WordBuilder.tsx)

**Location**: `src/frontend/src/pages/WordBuilder.tsx` (lines ~20523-20530)

**Issue**:
```typescript
const loadInsights = () => {
  const summary = getAnalyticsSummary();  // Calls getStoredSessions() internally
  const sessions = getStoredSessions();   // Calls getStoredSessions() again
  setAnalyticsData({ summary, sessions });
  setShowInsights(true);
};
```

**Impact**: localStorage is read and JSON parsed twice.

**Recommendation**: Modify `getAnalyticsSummary()` to return both summary and sessions, or call `getStoredSessions()` once and pass to summary function.

---

### 3.2 MEDIUM: Unbounded wordTagCache Growth

**Location**: `src/frontend/src/games/wordBuilderLogic.ts`

**Issue**: Module-level `Map` grows indefinitely:
```typescript
const wordTagCache = new Map<string, Set<string>>();
```

**Impact**: With ~1200 words in the word bank, this cache could grow unbounded over time.

**Recommendation**: Use LRU cache with size limit (e.g., 500 entries).

---

### 3.3 MEDIUM-HIGH: Multiple localStorage Writes on State Change

**Location**: `src/frontend/src/pages/WordBuilder.tsx` (lines ~136-151)

**Issue**: Four separate `useEffect` hooks write to localStorage on every state change:
- `gameMode`
- `phonicsStageId`
- `autoAdvance`
- `wordsCompletedInStage`

**Impact**: Synchronous writes during render can block main thread during rapid state updates.

**Recommendation**: Batch writes using single effect with multiple dependencies, or use debouncing for frequently-changing values.

---

### 3.4 MEDIUM: Uncached getStoredSessions() Calls

**Location**: `src/frontend/src/games/analyticsStore.ts`

**Issue**: Every call to `getStoredSessions()` results in `localStorage.getItem()` + `JSON.parse()` + validation loop.

**Impact**: This is called by `getAnalyticsSummary()` which can be called multiple times during a session.

**Recommendation**: Add module-level session cache with invalidation on write.

---

### 3.5 LOW: Build-Time Synchronous Operations

**Location**: `src/frontend/src/vite.config.ts`

**Issue**: `execSync('git rev-parse --short HEAD')` spawns child process synchronously during build.

**Impact**: Can noticeably slow down build/start time, especially in large repos or CI.

**Recommendation**: Cache git SHA in env file or skip git info during development builds.

---

### 3.6 LOW: Array.from() in Game Render Loops

**Pattern**: `Array.from({ length: 5 }).map((_, i) => ...)` to render HUD hearts in 8+ game files.

**Issue**: Creates new array on every render in hot path (game loop).

**Recommendation**: Pre-compute as constant outside component or write out elements explicitly.

---

### 3.7 LOW: Inefficient Distractor Shuffle

**Location**: `src/frontend/src/games/wordBuilderLogic.ts`

**Issue**: `sort(() => random() - 0.5)` used for distractor generation on every word.

**Recommendation**: Use Fisher-Yates for only N elements needed (random sampling without replacement).

---

### 3.8 LOW: String Sort on Every Touch

**Location**: `src/frontend/src/games/analyticsStore.ts`

**Issue**: For every incorrect touch, `sort().join('/')` is called for confusion pair tracking.

**Recommendation**: Use deterministic key without sorting (e.g., min-max comparison).

---

## Summary Table

| Priority | Issue | Files Affected | Type |
|----------|-------|----------------|------|
| **CRITICAL** | Duplicate `calculateScore` | 14 game logic files | Reuse |
| **HIGH** | Duplicate window resize handlers | 30+ game pages | Reuse |
| **HIGH** | Streak state duplication | 60+ game components | Quality |
| **MEDIUM** | Inline shuffle pattern | 30+ locations | Reuse |
| **MEDIUM** | Stringly-typed haptics | 150+ instances | Quality |
| **MEDIUM** | Magic `% 5` milestone | 67 instances | Quality |
| **MEDIUM** | Duplicate sumDurationSeconds | 2 locations | Reuse |
| **MEDIUM** | N+1 analytics pattern | WordBuilder.tsx | Efficiency |
| **MEDIUM** | Unbounded wordTagCache | wordBuilderLogic.ts | Efficiency |
| **MEDIUM** | Multiple localStorage writes | WordBuilder.tsx | Efficiency |
| **MEDIUM** | Uncached getStoredSessions | analyticsStore.ts | Efficiency |
| **LOW** | Build-time sync execSync | vite.config.ts | Efficiency |
| **LOW** | Array.from in hot path | 8+ game files | Efficiency |

---

## Recommended Action Plan

### Phase 1: High-Impact Shared Utilities (Create once, use everywhere)

1. **Create `src/frontend/src/utils/scoring.ts`**
   - Consolidate 14 duplicate `calculateScore` functions
   - Support configurable `baseScore` parameter
   - Export `DIFFICULTY_MULTIPLIERS` constant

2. **Create `src/frontend/src/hooks/useWindowSize.ts`**
   - Replace 30+ duplicate window resize handlers
   - Already a common pattern in React ecosystem

3. **Add `shuffle()` to `src/frontend/src/utils/random.ts`**
   - Proper Fisher-Yates implementation
   - Replace 30+ inline shuffle patterns

4. **Create `src/frontend/src/games/constants.ts`**
   - `STREAK_MILESTONE_INTERVAL = 5`
   - `STREAK_MILESTONE_DURATION_MS = 1200`
   - Replace 67 magic number instances

### Phase 2: Quality & Type Safety Improvements

5. **Enhance `src/frontend/src/utils/haptics.ts`**
   - Export typed constants (`HAPTIC_TYPES.SUCCESS`, etc.)
   - Improve autocomplete and type safety

6. **Extract `sumDurationSeconds()` helper**
   - Move duplicate reduce pattern to utility function
   - Use in both locations in `progressCalculations.ts`

### Phase 3: Efficiency Improvements

7. **Fix N+1 analytics pattern**
   - Modify `getAnalyticsSummary()` to return sessions
   - Or cache `getStoredSessions()` result

8. **Add LRU cache to `wordTagCache`**
   - Limit cache size to ~500 entries
   - Prevent unbounded growth

9. **Batch localStorage writes**
   - Consolidate multiple `useEffect` hooks
   - Consider debouncing for frequently-changing values

---

## Notes

- All findings preserve existing code structure (no deletions without verification)
- Focus on creating shared utilities that multiple files can adopt incrementally
- Each fix can be implemented independently without blocking others
- Testing should verify no behavioral changes after consolidation
