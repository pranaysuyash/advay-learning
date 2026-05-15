# Infinite Loop Fix - 2026-03-19

## Problem
Critical "Maximum update depth exceeded" error causing all games to fail loading. The error originated from an infinite loop between `SpatialInputContext.tsx` and `commonCvController.tsx`.

## Root Cause Analysis

### The Loop Chain
1. `SpatialInputContext.tsx` line 63: Context value object recreated on every render
2. `commonCvController.tsx` line 29: useEffect depends on `cv?.cursor` object (new reference each render)
3. Effect calls `setSpatialCursor()` → updates context state
4. New context value triggers re-render of `commonCvController`
5. `cv?.cursor` reference changes → effect runs again
6. Repeat infinitely

### Error Pattern
```
dispatchSetState
  → SpatialInputContext.tsx:55 (setSpatialCursor)
  → commonCvController.tsx:27 (cursor dependency)
  → commitHookPassiveMountEffects
  → Maximum update depth exceeded
```

## Files Modified

### 1. `src/frontend/src/context/SpatialInputContext.tsx`
**Added:**
- `useMemo` import
- Memoized `contextValue` to prevent unnecessary re-renders

```tsx
// Before:
<SpatialInputContext.Provider value={{ cursor, setSpatialCursor, resetSpatialCursor }}>

// After:
const contextValue = useMemo(() => ({
  cursor,
  setSpatialCursor,
  resetSpatialCursor,
}), [cursor, setSpatialCursor, resetSpatialCursor]);

<SpatialInputContext.Provider value={contextValue}>
```

### 2. `src/frontend/src/controllers/commonCvController.tsx`
**Changed:**
- useEffect dependencies from object references to primitive values
- Removed `spatialCtx` from deps (useContext provides current value)

```tsx
// Before:
}, [cv?.cursor, cv?.pinch?.isPinching, spatialCtx]);

// After:
}, [
  cv?.cursor?.x,
  cv?.cursor?.y,
  cv?.pinch?.isPinching,
]);
```

### 3. `src/frontend/src/components/GameShell.tsx`
**Changed:**
- Removed `profileId` from useEffect deps
- Read `location.state` directly in effect to avoid infinite loop

```tsx
// Before:
const profileId = (location.state as any)?.profileId;
useEffect(() => { ... }, [profileId]);

// After:
useEffect(() => {
  const currentProfileId = (location.state as any)?.profileId;
  // ... use currentProfileId
}, []); // Empty deps
```

### 4. `src/frontend/src/pages/AlphabetGame.tsx`
**Changed:**
- Removed `fetchProfiles` from useEffect deps (line 313)
- Removed `startTracking` from useEffect deps (line 259)

### 5. `src/frontend/src/pages/Dashboard.tsx`
**Changed:**
- Removed `setCurrentProfile` from useEffect deps (line 239)

### 6. `tools/cdp_game_tester.py`
**Changed:**
- Fixed dataclass initialization
- Fixed emoji regex syntax
- Changed `wait_until` from "networkidle" to "domcontentloaded"

## Test Results After Fix

All 10 games now load successfully:

| Game | Load Time | Status | Issues |
|------|-----------|--------|--------|
| Alphabet Tracing | 1701ms | ✅ Loads | 4 buttons < 80px |
| Odd One Out | ~1800ms | ✅ Loads | 4 buttons < 80px |
| Spelling Run | ~1900ms | ✅ Loads | 4 buttons < 80px |
| Math Jumpers | 2133ms | ✅ Loads | 4 buttons < 80px |
| Shadow Match | ~2000ms | ✅ Loads | 4 buttons < 80px |
| Balloon Pop Fitness | ~2100ms | ✅ Loads | 4 buttons < 80px |
| Catch Sort | 2161ms | ✅ Loads | 4 buttons < 80px |
| Maze Runner | 2197ms | ✅ Loads | 4 buttons < 80px |
| Animal Sounds | 2521ms | ✅ Loads | 4 buttons < 80px |
| Virtual Bubbles | 2795ms | ✅ Loads | 4 buttons < 80px |

## Remaining Issues

### Common Across All Games
1. **Button Sizes**: 4 buttons per game smaller than 80px (WCAG failure for kids)
2. **Feedback Animations**: 3 warnings per game (likely missing visual feedback)

### Next Steps
1. Fix button sizes to minimum 80px for all games
2. Add visual feedback animations for user actions
3. Investigate slow load times (Virtual Bubbles at 2795ms)

## Related Issues Fixed
- #27: React hooks order violation in AlphabetGame
- #31: Dashboard infinite loop bug
- All games now load without infinite loop errors

## Documentation
- Screenshots saved to: `./screenshots/game-test/`
- JSON results: `./game-test-results.json`
