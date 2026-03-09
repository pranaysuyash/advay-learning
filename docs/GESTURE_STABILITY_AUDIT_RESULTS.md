# Gesture Stability Audit Results

**Ticket:** TCK-20260307-CRIT-004  
**Date:** 2026-03-07  
**Status:** ✅ **COMPLETED**

---

## Complete Hit Radius Comparison

| Game | Hit Radius | Normalized (0-1) | Context | Status | Notes |
|------|------------|------------------|---------|--------|-------|
| **EmojiMatch** | 0.22 | 22% | Card matching | ✅ Excellent | Designed large |
| **SteadyHandLab** | 0.18 | 18% | Follow path | ✅ Excellent | Increased from 0.12 |
| **WordBuilder** | 0.15 | 15% | Letter tiles | ✅ Good | Increased from 0.1 |
| **ColorMatchGarden** | ~~0.10~~ → **0.15** | 15% | Color matching | ✅ **FIXED** | Increased 2026-03-07 |
| **ShapePop** (easy) | 0.20 | 20% | Bubble popping | ✅ Good | Dynamic by difficulty |
| **ShapePop** (med) | 0.16 | 16% | Bubble popping | ✅ Good | Dynamic by difficulty |
| **ShapePop** (hard) | 0.12 | 12% | Bubble popping | ✅ Good | Dynamic by difficulty |
| **PhonicsSounds** | 0.12 | 12% | Sound matching | ⚠️ Marginal | Consider 0.15 |
| **ShapeSequence** | 0.10 | 10% | Sequence copy | 🔴 **TOO SMALL** | Needs fix |
| **NumberTapTrail** | 0.10 | 10% | Number tracing | 🔴 **TOO SMALL** | Needs fix |

---

## Key Findings

### Finding 1: ColorMatchGarden TARGET_RADIUS Too Restrictive ✅ FIXED

**File:** `src/frontend/src/pages/ColorMatchGarden.tsx`  
**Previous:** `const TARGET_RADIUS = 0.1;`  
**Fixed:** `const TARGET_RADIUS = 0.15; // Increased from 0.1 for kids' easier targeting`

**Impact:** 125% larger hit area (π×0.15² vs π×0.1²) for children with developing motor control.

### Finding 2: ShapeSequence Uses Restrictive Hit Radius 🔴 NEEDS FIX

**File:** `src/frontend/src/pages/ShapeSequence.tsx`  
**Line 33:** `const HIT_RADIUS = 0.1;`

Children need to copy a sequence by tapping shapes in order. With 0.1 radius, missed taps will cause frustration.

### Finding 3: NumberTapTrail Uses Restrictive Hit Radius 🔴 NEEDS FIX

**File:** `src/frontend/src/pages/NumberTapTrail.tsx`  
**Line 32:** `const HIT_RADIUS = 0.1;`

Children trace numbers by tapping sequential points. Shaky hands will miss the trail.

### Finding 4: PhonicsSounds Marginally Small ⚠️ CONSIDER FIX

**File:** `src/frontend/src/pages/PhonicsSounds.tsx`  
**Line 31:** `const HIT_RADIUS = 0.12;`

Slightly larger than 0.1, but still on the small side. Consider increasing to 0.15 for consistency.

---

## Fix Applied

### ColorMatchGarden ✅

```typescript
// BEFORE
const TARGET_RADIUS = 0.1;

// AFTER
const TARGET_RADIUS = 0.15; // Increased from 0.1 for kids' easier targeting
```

**Evidence:**
```bash
$ git diff src/frontend/src/pages/ColorMatchGarden.tsx
- const TARGET_RADIUS = 0.1;
+ const TARGET_RADIUS = 0.15; // Increased from 0.1 for kids' easier targeting
```

---

## Recommended Follow-Up Actions

| Priority | Game | Action | Expected Impact |
|----------|------|--------|-----------------|
| P1 | ShapeSequence | HIT_RADIUS 0.1 → 0.15 | Reduce sequence completion frustration |
| P1 | NumberTapTrail | HIT_RADIUS 0.1 → 0.15 | Easier number tracing for ages 3-5 |
| P2 | PhonicsSounds | HIT_RADIUS 0.12 → 0.15 | Consistency across all games |

---

## Stability Mechanism Assessment

**Question:** Do hover+pinch games need stability mechanisms like Finger Number Show?

**Analysis:**
- **Finger Number Show:** Requires HOLDING a pose → stability mechanism required
- **ColorMatchGarden/ShapePop/WordBuilder:** Hover + pinch (dynamic) → pinch is the commit action

**Conclusion:** No additional stability mechanism needed. The pinch gesture is the intentional commit. However, **hit radius must be generous** (≥0.15) to account for hand tremor during approach.

---

## Evidence Log

**Commands Used:**
```bash
# Find all hit radius constants across games
grep -rn "HIT_RADIUS\|TARGET_RADIUS" src/frontend/src/pages/*.tsx

# Compare with WordBuilder (good reference)
grep -B2 -A2 "HIT_RADIUS" src/frontend/src/pages/WordBuilder.tsx
```

**Evidence Labels:**
- `Observed`: Code review of radius constants
- `Inferred`: Child development impact (fine motor control research)

---

## Sign-off

| Item | Status |
|------|--------|
| Audit completed | ✅ |
| ColorMatchGarden fixed | ✅ |
| Remaining fixes documented | ✅ |
| Tickets created for follow-up | ⬜ (separate task) |

**Completed by:** Agent (TCK-20260307-CRIT-004)  
**Date:** 2026-03-07
