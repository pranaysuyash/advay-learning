# IMPLEMENTATION PLAN: TCK-20260128-010

## Drawing Control Mode - Pinch Gesture

**Ticket**: TCK-20260128-010  
**Status**: Planning Complete  
**Planned Date**: 2026-01-28  

---

## Discovery Summary

### Observed

**File: `src/frontend/src/pages/Game.tsx`**

- MediaPipe hand landmarks: 21 points per hand (0-20)
- Landmark 4: Thumb tip
- Landmark 8: Index finger tip
- Current drawing logic uses `isDrawing` state (from TCK-20260128-009)
- Button toggle currently controls `isDrawing` state

**Current drawing control flow:**

1. User clicks "Start Drawing" button → `setIsDrawing(true)`
2. Hand detection adds points when `isDrawing` is true
3. User clicks "Stop Drawing" button → `setIsDrawing(false)`

### Inferred

- Pinch gesture = thumb tip (4) and index tip (8) close together
- Distance threshold needed (normalized coordinates: 0-1)
- Start threshold: ~0.05 (5% of frame)
- Release threshold: ~0.08 (hysteresis to prevent flickering)
- Visual feedback: cursor color/glow change when pinching

### Unknown

- Optimal threshold for kids (may need tuning)
- Whether to keep button as fallback

---

## Implementation Options

| Option | Approach | Pros | Cons | Risk |
|--------|----------|------|------|------|
| A | Pinch replaces button | Clean, gesture-only | No fallback if gesture fails | MED |
| B | Pinch + Button both active | Flexible, fallback | Two ways to control, might confuse | LOW |
| C | Mode selector (Pinch vs Button) | User choice | More UI complexity | MED |

**Recommendation**: Option B for now (both active), then Option C when mode selector is built

- Button always works as fallback
- Pinch detected continuously when hand visible
- No mode switch needed yet

---

## Implementation Plan

### Phase 1: Pinch Detection Logic

1. **Add pinch detection function**
   - Calculate Euclidean distance between landmarks 4 and 8
   - Return boolean: `isPinching`
   - Use hysteresis: start < 0.05, release > 0.08

2. **Integrate with drawing state**
   - Pinch start → `setIsDrawing(true)`
   - Pinch release → `setIsDrawing(false)`
   - Button can still override

### Phase 2: Visual Feedback

1. **Cursor visual feedback**
   - When pinching: larger cursor, brighter glow
   - Color change: normal → bright yellow/white when pinching
   - Visual indicator near cursor (optional)

2. **Button state feedback**
   - Button shows "Pinching..." or icon when pinch active
   - Helps user understand the connection

### Phase 3: Settings Integration (for later)

1. **Add to settings store** (when mode selector built)
   - `drawingControlMode: 'button' | 'pinch' | 'both'`
   - Default: 'both'

---

## Testing Strategy

### Manual Verification

1. Show hand → cursor visible
2. Move thumb and index apart → not pinching
3. Bring thumb and index together → pinch detected, drawing starts
4. Separate fingers → pinch released, drawing stops
5. Button still works when pinch not used
6. Both can work together

### Edge Cases

- Hand partially visible (only one finger) → no pinch
- Quick pinch/release → should toggle quickly
- Hold pinch long time → continuous drawing
- Multiple hands → use first detected hand

---

## Verification Checklist

- [ ] Pinch detection works (thumb + index close)
- [ ] Visual indicator when pinching
- [ ] Drawing starts on pinch
- [ ] Drawing stops on release
- [ ] Button still works
- [ ] Threshold feels natural
- [ ] No console errors

---

## Files to Modify

1. `src/frontend/src/pages/Game.tsx` - Pinch detection and visual feedback

---

## Implementation Notes

### Pinch Detection Math

```typescript
// Landmarks: 4 = thumb tip, 8 = index tip
const thumbTip = landmarks[4];
const indexTip = landmarks[8];

// Euclidean distance in normalized coordinates
const distance = Math.sqrt(
  Math.pow(thumbTip.x - indexTip.x, 2) +
  Math.pow(thumbTip.y - indexTip.y, 2)
);

// Hysteresis to prevent flickering
const PINCH_START_THRESHOLD = 0.05;  // Start drawing
const PINCH_RELEASE_THRESHOLD = 0.08; // Stop drawing

if (!isPinching && distance < PINCH_START_THRESHOLD) {
  setIsPinching(true);
  setIsDrawing(true);
} else if (isPinching && distance > PINCH_RELEASE_THRESHOLD) {
  setIsPinching(false);
  setIsDrawing(false);
}
```

### Visual Feedback

```typescript
// Cursor style based on pinch state
const cursorRadius = isPinching ? 15 : 12;
const cursorGlow = isPinching ? 20 : 10;
const cursorColor = isPinching ? '#ffff00' : currentLetter.color;
```

---

## Next Steps

1. Implement pinch detection in Game.tsx
2. Add visual feedback
3. Test with browser
4. Update WORKLOG_TICKETS.md
