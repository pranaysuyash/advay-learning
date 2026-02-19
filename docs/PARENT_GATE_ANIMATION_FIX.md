
---

## FIX: Parent Gate Animation Not Showing

**Date:** 2026-02-02  
**Status:** ✅ FIXED  
**Problem:** Button works but no visual feedback (no % counter, no color change)

### Root Cause

The `animateProgress` function had a **closure issue** - it was using a stale `holding` state value from the closure, causing the animation loop to stop after the first frame.

### Solution

1. Moved `holdingRef` declaration before the animation function
2. Set `holdingRef.current = true` immediately when starting to hold
3. Changed the animation check from `if (holding)` to `if (holdingRef.current)` to always get fresh value
4. Explicitly started the animation loop with `requestAnimationFrame`

### Changes Made

**File:** `src/frontend/src/components/ui/ParentGate.tsx`

**Key Fixes:**

```typescript
// Before: holding state was stale in closure
const animateProgress = () => {
  // ...
  if (holding) {  // ❌ Stale value!
    animationRef.current = requestAnimationFrame(animateProgress);
  }
};

// After: using ref for fresh value
const holdingRef = useRef(false);

const animateProgress = useCallback(() => {
  // ...
  if (holdingRef.current) {  // ✅ Fresh value!
    animationRef.current = requestAnimationFrame(animateProgress);
  }
}, [holdDuration, onUnlock]);

const startHolding = useCallback(() => {
  setHolding(true);
  holdingRef.current = true;  // ✅ Set ref immediately
  startTimeRef.current = Date.now();
  
  // ✅ Explicitly start animation
  animationRef.current = requestAnimationFrame(animateProgress);
  // ...
}, [unlocked, holdDuration, onUnlock, animateProgress]);
```

### Expected Behavior Now

1. Press button → Shows "Hold... 0%" immediately
2. While holding → Progress increases: 5%, 15%, 30%, 60%, etc.
3. Button turns orange while holding
4. Progress bar fills from left to right
5. At 100% → Shows "✓ Access Granted" in green

---
EOF
