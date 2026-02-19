# IMPLEMENTATION PLAN: TCK-20260128-009

## Drawing Control Mode - Button Toggle (Baseline)

**Ticket**: TCK-20260128-009  
**Status**: Planning Complete  
**Planned Date**: 2026-01-28  

---

## Discovery Summary

### Observed

**File: `src/frontend/src/pages/Game.tsx`**

- Line 25: `const [isPlaying, setIsPlaying] = useState(false);` - Game has play/pause state
- Line 30: `const drawnPointsRef = useRef<Point[]>([]);` - Drawing points stored in ref
- Line 135-245: `detectAndDraw` function handles the drawing loop
- Line 236-238: Points added to drawing when hand detected:

  ```typescript
  // Add point to drawing (store the DISPLAY coordinates)
  setDrawnPoints(prev => [...prev, { x: displayX, y: displayY }]);
  ```

- Line 414+: Game UI with start/stop controls

**Current behavior**:

- Drawing starts immediately when `isPlaying` is true and hand is detected
- No separate "drawing mode" vs "cursor only" state
- `isPlaying` controls both camera and drawing together

**File: `src/frontend/src/store/settingsStore.ts`** (expected pattern)

- Settings store uses Zustand with persistence
- Drawing mode setting would follow same pattern as `showHints`, `language`, etc.

### Inferred

- We need to decouple "camera active" from "drawing active"
- Current `isPlaying` = camera on + drawing on
- New state needed: `isDrawing` = drawing on (only meaningful when camera is on)
- Button should toggle `isDrawing` state independently

### Unknown

- None - implementation approach is clear

---

## Options Considered

| Option | Approach | Pros | Cons | Risk |
|--------|----------|------|------|------|
| A | Add `isDrawing` state, separate from `isPlaying` | Clean separation, matches user mental model | Slightly more complex state | LOW |
| B | Reuse `isPlaying` with modified meaning | Less state to manage | Confusing - "playing" doesn't mean "drawing" | MED |
| C | Always draw when hand detected, add "pause drawing" button | Simpler implementation | Opposite of requested UX | HIGH |

**Recommendation**: Option A

- Cleanest separation of concerns
- Allows cursor to be visible without drawing
- Matches the acceptance criteria

---

## Implementation Plan

### Phase 1: Foundation (State Management)

1. **Add `isDrawing` state to Game.tsx**
   - `const [isDrawing, setIsDrawing] = useState(false);`
   - Initialize to `false` (safe default)

2. **Modify drawing logic in `detectAndDraw`**
   - Change line 236-238 to only add points when `isDrawing` is true
   - Cursor always visible (independent of `isDrawing`)

### Phase 2: Core Implementation (UI)

1. **Add Drawing Toggle Button**
   - Location: Top-right corner of game area (next to Clear/Stop)
   - States:
     - `!isDrawing`: "✏️ Start Drawing" (green/primary)
     - `isDrawing`: "✋ Stop Drawing" (red/warning)
   - Click handler: `() => setIsDrawing(!isDrawing)`

2. **Visual Feedback**
   - When `isDrawing` is true:
     - Button shows "Stop Drawing"
     - Optional: Small indicator near cursor ("Recording" dot)
   - When `isDrawing` is false:
     - Button shows "Start Drawing"
     - Cursor visible but not recording

### Phase 3: Integration & State Reset

1. **Reset `isDrawing` on game state changes**
   - `startGame()`: Set `isDrawing = false` (user must explicitly start)
   - `stopGame()`: Set `isDrawing = false`
   - `nextLetter()`: Keep `isDrawing` as-is (continue drawing next letter)
   - `clearDrawing()`: Keep `isDrawing` as-is (clear but keep drawing)

2. **Help Text Update**
   - Update instruction text to mention the button
   - "Click 'Start Drawing' to begin tracing"

---

## Testing Strategy

### Unit Tests (if test file exists)

- Test state transitions: `isDrawing` toggles correctly
- Test that points only added when `isDrawing` is true

### Manual Verification

1. Start game → "Start Drawing" button visible
2. Move hand → cursor visible, no drawing
3. Click "Start Drawing" → button changes to "Stop Drawing"
4. Move hand → cursor visible, drawing appears
5. Click "Stop Drawing" → button changes back
6. Move hand → cursor visible, no new drawing
7. Click "Clear" → drawing clears, mode stays stopped
8. Click "Next Letter" → new letter, mode stays as-is

### Edge Cases

- Rapid toggle (spam click) - should handle gracefully
- Start drawing with no hand visible - should work when hand appears
- Stop mid-stroke - stroke ends cleanly

---

## Verification Checklist

- [ ] "Start Drawing" button visible when game starts
- [ ] Click button → changes to "Stop Drawing" (visual change)
- [ ] Cursor visible in both states
- [ ] Line only draws when in "drawing" state
- [ ] Button clickable with mouse
- [ ] State resets appropriately on game actions
- [ ] No console errors
- [ ] Works with hand tracking

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User confusion about two-step start | MED | LOW | Clear button labels, help text |
| State getting out of sync | LOW | MED | Single source of truth, simple state |
| Performance from extra re-render | LOW | LOW | Use ref for points, state for UI only |

---

## Rollback Plan

If this implementation causes issues:

1. **Revert to single commit** (if committed):

   ```bash
   git revert <commit-hash>
   ```

2. **Manual removal**:
   - Remove `isDrawing` state
   - Remove button JSX
   - Restore original drawing logic (remove `isDrawing` condition)

3. **Files to restore from backup**:
   - `src/frontend/src/pages/Game.tsx`

---

## Files to Modify

1. `src/frontend/src/pages/Game.tsx` - Main implementation

---

## Implementation Notes

### Key Code Changes

**State addition (around line 25):**

```typescript
const [isDrawing, setIsDrawing] = useState(false);
```

**Drawing condition (around line 236):**

```typescript
// Only add points when in drawing mode
if (isDrawing) {
  setDrawnPoints(prev => [...prev, { x: displayX, y: displayY }]);
}
```

**Button JSX (around line 452, with Clear/Stop buttons):**

```typescript
<button
  onClick={() => setIsDrawing(!isDrawing)}
  className={`px-4 py-2 rounded-lg transition text-sm ${
    isDrawing 
      ? 'bg-red-500/50 hover:bg-red-500/70' 
      : 'bg-green-500/50 hover:bg-green-500/70'
  }`}
>
  {isDrawing ? '✋ Stop Drawing' : '✏️ Start Drawing'}
</button>
```

**State reset in startGame (around line 264):**

```typescript
const startGame = () => {
  setIsPlaying(true);
  setIsDrawing(false);  // Reset drawing state
  drawnPointsRef.current = [];
  setFeedback('');
  setAccuracy(0);
  setStartTime(Date.now());
};
```

---

## Next Steps

1. Execute this plan using `prompts/implementation/feature-implementation-v1.0.md`
2. Verify with `prompts/review/completeness-check-v1.0.md`
3. Update WORKLOG_TICKETS.md with completion evidence
