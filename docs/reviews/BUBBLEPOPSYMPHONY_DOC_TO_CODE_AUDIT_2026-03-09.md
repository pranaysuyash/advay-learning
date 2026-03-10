# Bubble Pop Symphony - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `bubble-pop-symphony`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `src/frontend/src/pages/BubblePopSymphony.tsx` (472 lines)
- Spec: `docs/games/bubble-pop-symphony-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Bubble Pop Symphony is a musical bubble-popping game where children pop bubbles to hear musical notes. Each bubble color corresponds to a different musical note (C4-A4 scale). Toddler-friendly with no timer pressure, continuous play, and voice feedback for milestones.

### Test Coverage

- **No dedicated logic file** - All logic embedded in component
- **No unit tests** - Testing manual/explored through code review
- **Tests should cover:** Bubble generation, musical note playback, scoring

---

## Implementation Quality Assessment

### Strengths

1. **6 musical notes** - C4, D4, E4, F4, G4, A4 with distinct colors
2. **Web Audio API** - Real-time oscillator synthesis
3. **Toddler-friendly** - No timer, slow movement, large targets
4. **Voice feedback** - TTS announcements at milestones
5. **Magnetic snap** - 100px threshold for easy targeting
6. **Hitbox multiplier** - 2.0x for generous hit detection
7. **Continuous play** - Auto-respawn when all popped
8. **Asset preloading** - Bubbles and sounds loaded on mount

### Areas for Improvement

1. **No unit tests** - Critical for audio system
2. **Embedded logic** - All 472 lines in component
3. **No difficulty progression** - Same throughout
4. **Limited interaction** - Just pop, no other mechanics

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `BubblePopSymphony.tsx` | 472 | Component with UI, game loop, audio |
| `components/game/TargetSystem` | Shared | Hit detection, magnetic snap |
| `utils/assets.ts` | Shared | Asset loading (bubbles, sounds) |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 472 |
| Bubbles per round | 6 |
| Musical notes | 6 (C4-A4) |
| Hitbox multiplier | 2.0 |
| Magnetic threshold | 100px |
| Movement speed | 0.35 (slow) |

---

## Key Constants

```typescript
const BUBBLE_COUNT = 6;
const VELOCITY_RANGE = 0.35;
const MARGIN = 100;
const HITBOX_MULTIPLIER = 2.0;
const MAGNETIC_THRESHOLD = 100;
const MIN_SPACING = 40;
```

---

## Musical Notes

| Note | Pitch | Color | Oscillator |
|------|-------|-------|-----------|
| C4 | 261.63 Hz | #FF6B6B | Sine |
| D4 | 293.66 Hz | #4ECDC4 | Sine |
| E4 | 329.63 Hz | #45B7D1 | Sine |
| F4 | 349.23 Hz | #FFA500 | Sine |
| G4 | 392.0 Hz | #FFD700 | Sine |
| A4 | 440.0 Hz | #95E1D3 | Sine |

### Sound Generation

```typescript
const oscillator = ctx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.value = frequency;

const gain = ctx.createGain();
gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
```

Duration: ~360ms

---

## Scoring System

| Event | Points |
|-------|--------|
| Pop bubble | +1 |
| All popped | New round appears |

### Milestones

| Bubbles Popped | Feedback |
|----------------|----------|
| 1 | "Great job! You popped a bubble!" |
| 5, 10, 15, 20 | "Amazing! {N} bubbles popped!" + celebration |

---

## Visual Design

### UI Elements

- **Score Display:** Top center with music icon 🎵
- **Bubbles:** 6 colored circles with inner colored dot
- **Cursor:** Blue cursor with pointer icon
- **Success Animation:** Confetti "Pop!" message
- **Hand Tracking Status:** Shows if hand detected

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Discovery cream (#FFF8F0) |
| Bubbles | 6 musical colors (see table above) |
| Score panel | White with gold border (#F2CC8F) |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Pop bubble | Musical note + pop sound | 'success' |
| Milestone | TTS + celebration sound | 'celebration' |
| Round complete | Success sound | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Pop the bubbles by pinching them! Each one makes a musical note!" |
| First pop | "Great job! You popped a bubble!" |
| Milestone | "Amazing! {N} bubbles popped!" |
| Round complete | "Amazing! New bubbles are ready!" |

---

## Bubble Physics

### Movement

```typescript
velocity: {
  x: (random - 0.5) × 0.35,
  y: (random - 0.5) × 0.35
}
```

### Bounce

```typescript
if (x < MARGIN || x > screenWidth - MARGIN) {
  velocityX *= -1;
  x = clamp(x, MARGIN, screenWidth - MARGIN);
}
if (y < MARGIN || y > screenHeight - MARGIN) {
  velocityY *= -1;
  y = clamp(y, MARGIN, screenHeight - MARGIN);
}
```

Update interval: 50ms

---

## Bubble Generation

```typescript
function createBubbleSet(): Bubble[] {
  const targetSize = getRecommendedTargetSize(screenDims.width);
  const positions = generateTargets(6, screenDims.width, screenDims.height, targetSize, 40);
  return positions.map((pos, index) => {
    const noteData = MUSICAL_NOTES[index % MUSICAL_NOTES.length];
    return {
      id: `bubble-${Date.now()}-${index}`,
      ...pos,
      content: buildBubbleVisual(assetId, noteData.color, bubbleSize),
      color: noteData.color,
      note: noteData.note,
      pitch: noteData.pitch,
      velocity: { x: (random - 0.5) × 0.35, y: (random - 0.5) × 0.35 },
    };
  });
}
```

---

## Game Flow

1. **Menu Screen:** Start button with instructions
2. **Start Game:** 6 bubbles spawn, timer starts
3. **Pop Loop:**
   - Child pinches bubble
   - Musical note plays
   - Score increments
   - Bubble disappears
4. **Round Complete:** All popped → new bubbles appear after 700ms
5. **Continuous Play:** No game over, keeps going

---

## Educational Value

### Skills Developed

1. **Musical Awareness** - Different notes for different colors
2. **Hand-Eye Coordination** - Pinching accuracy
3. **Cause and Effect** - Pop → sound
4. **Visual Tracking** - Following moving targets
5. **Fine Motor Skills** - Pinch gesture practice
6. **Auditory Learning** - Associating colors with sounds

---

## Comparison with Similar Games

| Feature | BubblePopSymphony | NumberBubblePop | ShapePop |
|---------|------------------|----------------|----------|
| Core Mechanic | Pop to hear note | Pop for counting | Pop for shapes |
| Audio | Musical notes | Pop sound | Pop sound |
| Age Range | 3-7 | 3-6 | 3-6 |
| Scoring | Counter (1 per pop) | Number learning | Shape matching |
| Time Pressure | None | None | None |

---

## Recommendations

### Testing

1. **Add unit tests** for:
   - `playNote()` - Audio generation
   - `createBubbleSet()` - Bubble generation
   - Scoring milestones
   - Asset preloading

### Code Quality

1. **Extract constants**:
   ```typescript
   export const BUBBLE_SYMPHONY_CONSTANTS = {
     BUBBLE_COUNT: 6,
     VELOCITY_RANGE: 0.35,
     MARGIN: 100,
     // ...
   } as const;
   ```

2. **Component splitting** - Extract audio system to hook

---

## Conclusion

Bubble Pop Symphony is **functionally correct** with excellent toddler-friendly design. The musical note feature adds educational value, and the generous hitbox (2.0x) with magnetic snap (100px) makes it accessible for young children. Continuous play without time pressure creates a positive experience.

**Audit Status:** APPROVED ✅
**Tests:** NEEDED (audio system)
**Documentation:** COMPLETE ✅
