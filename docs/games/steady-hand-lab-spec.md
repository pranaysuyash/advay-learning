# Steady Hand Lab Game Specification

**Game ID:** `steady-hand-lab`
**World:** Steady Labs
**Vibe:** Chill
**Age Range:** 4-7 years
**CV Requirements:** Hand tracking

---

## Overview

Steady Hand Lab is a precision-focused game where children hold their index finger steady inside a target ring to fill a progress bar. The game emphasizes patience, focus, and fine motor control without time pressure.

### Tagline
"Hold your finger steady inside the ring — how long can you last? 🎯"

---

## Game Mechanics

### Core Gameplay Loop

1. **Start Game** - Player presses "Start Steady Hand" button
2. **Target Appears** - Green ring appears at random position
3. **Player Holds** - Using hand tracking, player holds index finger tip inside ring
4. **Progress Fills** - Bar fills while inside, drains while outside
5. **Target Complete** - At 100%, player earns 20 points, new target appears
6. **Milestones** - Every 5 targets, celebration overlay appears
7. **Game Ends** - No hard ending; player can stop anytime via Home button

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Hand position (index finger tip tracking) |
| No pinch needed | Simply hold finger in place |
| Pause | Hand lost detection |

---

## Hold Progress System

### Progress Formula

```typescript
function updateHoldProgress(options: HoldProgressOptions): number {
  const { current, isInside, deltaTimeMs, holdDurationMs, decayDurationMs } = options;

  if (deltaTimeMs <= 0) return current;

  const step = isInside
    ? deltaTimeMs / holdDurationMs      // Increase when inside
    : -(deltaTimeMs / decayDurationMs);  // Decrease when outside

  const next = current + step;
  return Math.min(1, Math.max(0, next)); // Clamp to [0, 1]
}
```

### Default Timing

| Parameter | Value | Description |
|-----------|-------|-------------|
| holdDurationMs | 2500 | Time to complete (2.5 seconds) |
| decayDurationMs | 1400 | Time to fully drain (1.4 seconds) |

### Visual Progress

| Progress | Ring Scale | Bar Width |
|----------|-----------|-----------|
| 0% | 1.00 | 0% |
| 25% | 1.0375 | 25% |
| 50% | 1.075 | 50% |
| 75% | 1.1125 | 75% |
| 100% | 1.15 | 100% |

---

## Target System

### Target Positioning

```typescript
function pickTargetPoint(randomA: number, randomB: number, margin: number = 0.2): Point {
  const clampedMargin = Math.min(0.45, Math.max(0.05, margin));
  const span = 1 - clampedMargin * 2;

  return {
    x: clampedMargin + Math.min(1, Math.max(0, randomA)) * span,
    y: clampedMargin + Math.min(1, Math.max(0, randomB)) * span,
  };
}
```

### Target Properties

| Property | Value | Description |
|----------|-------|-------------|
| Target Radius | 0.18 | 18% of smaller screen dimension |
| Margin | 0.22 | 22% from edges (kept 20% centered) |
| Target Size | 160px | Display size of ring |
| Cursor Size | 84px | Size of finger cursor |

### Distance Check

```typescript
const dx = tip.x - target.x;
const dy = tip.y - target.y;
const distance = Math.sqrt(dx * dx + dy * dy);
const isInside = distance <= TARGET_RADIUS; // 0.18
```

---

## Scoring System

### Points

| Action | Points |
|--------|--------|
| Target completed | 20 |
| Milestone celebration | 0 (visual only) |

### Total Score Calculation

```
totalScore = targetsCompleted × 20
```

### Milestones

- **Interval:** Every 5 targets (STREAK_MILESTONE_INTERVAL = 5)
- **Duration:** 3 seconds
- **Message:** "Steady Champion! You held the target perfectly."
- **Effects:** Celebration overlay + fanfare sound + haptic

### Easter Egg

| Property | Value |
|----------|-------|
| ID | `egg-surgeon-hands` |
| Name | "Surgeon Hands" |
| Trigger | Complete 3+ rounds |
| Drop | Triggers item drop system |

---

## Visual Design

### Target Ring

| Property | Value |
|----------|-------|
| Outer border | 8px solid #10B981 (emerald-500) |
| Shadow | 0 4px 0 #E5B86E (gold shadow) |
| Inner ring | 3px solid emerald-200/60 |
| Scale animation | 1.0 → 1.15 based on progress |

### Progress Bar

| Property | Value |
|----------|-------|
| Container | White/50, rounded-full, 2px border |
| Fill | #10B981 (emerald-500), animated width |
| Position | Bottom of target ring |

### Feedback Message

| Property | Value |
|----------|-------|
| Container | White/95, backdrop-blur, rounded-full |
| Border | 4px #F2CC8F (gold) |
| Shadow | 0 4px 0 #E5B86E |
| Position | Top-center, below HUD |

### Background

| Property | Value |
|----------|-------|
| Base color | #FFF8F0 (warm white) |
| Weather image | Sunny background at 30% opacity |
| Overlay | White gradient from top/bottom |

---

## Accessibility Features

### Voice Instructions (TTS)

| Event | Voice Prompt |
|-------|--------------|
| Game start | "Let's test your steady hand! Show me your finger!" |
| Target completed | "Great job! You held steady!" |
| Milestone reached | "Amazing! You are doing great!" |
| Leaving target (>60% progress) | "Keep your finger inside the ring!" |
| Instructions (replayable) | "Hold your finger inside the ring." / "Keep it steady!" / "Fill the bar to win!" |

### Haptic Feedback

| Event | Pattern |
|-------|---------|
| Target completed | 'success' |
| Progress loss error | 'error' |
| Milestone | 'celebration' |

### Visual Feedback Messages

| Condition | Message |
|-----------|---------|
| Initial | "Hold your fingertip inside the target ring." |
| Target completed | "Excellent control! New target unlocked." |
| Leaving target | "Almost there. Move back into the ring and hold steady." |
| Subtitle | "Take your time!" (always visible) |

---

## Audio & Sound Effects

| Event | Sound |
|-------|-------|
| Button click | playClick() |
| Game start | playPop() |
| Target completed | playSuccess() |
| Error (progress loss) | playError() |
| Milestone | playFanfare() |

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| score | number | Total score (targets × 20) |
| round | number | Current round (starts at 1) |
| target | Point | Current target position (normalized 0-1) |
| cursor | Point \| null | Hand cursor position |
| holdProgress | number | Current fill level (0-1) |
| feedback | string | Feedback message text |
| showCelebration | boolean | Celebration overlay visibility |

---

## Technical Implementation

### Dependencies

```typescript
// Game logic
import { pickTargetPoint, updateHoldProgress } from '../games/steadyHandLogic';

// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';

// Audio
import { useAudio } from '../utils/hooks/useAudio';

// Voice
import { useTTS } from '../hooks/useTTS';

// Game completion
import { useGameDrops } from '../hooks/useGameDrops';

// UI components
import { GameCursor } from '../components/game/GameCursor';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
```

### Key Hooks Used

| Hook | Purpose |
|------|---------|
| useGameHandTracking | Hand tracking with index tip detection |
| useGameDrops | Track completions for item drops |
| useTTS | Text-to-speech feedback |
| useAudio | Sound effects |

### Constants

```typescript
const TARGET_RADIUS = 0.18;      // 18% of screen
const CURSOR_SIZE = 84;          // pixels
const TARGET_SIZE = 160;         // pixels
```

---

## End Behavior

### No Hard Ending

Unlike other games, SteadyHandLab has no fixed ending:
- Player can complete infinite targets
- Score accumulates continuously
- Player controls when to stop (via Home/Restart buttons)

### Round Counter

- Starts at 1
- Increments on each target completion
- Used for milestone tracking and easter egg trigger

### Reset Behavior

| Action | Effect |
|--------|--------|
| Restart button | Score → 0, Round → 1, New target, Resume tracking |
| Home button | Trigger game complete, Navigate to dashboard |

---

## Target Positioning Examples

### Margin = 0.22 (default)

| Random Input | Result Position | Notes |
|--------------|-----------------|-------|
| (0.0, 0.0) | (0.22, 0.22) | Minimum x/y |
| (0.5, 0.5) | (0.50, 0.50) | Center |
| (1.0, 1.0) | (0.78, 0.78) | Maximum x/y |

### Safe Zone

With margin = 0.22:
- Playable area: 22% to 78% on both axes
- Ensures targets never appear too close to edges

---

## Difficulty Considerations

### Kid-Friendly Adjustments

| Feature | Value | Rationale |
|---------|-------|-----------|
| Large target | 18% radius | Easier for small fingers |
| Large cursor | 84px | Clear visual feedback |
| Slow hold | 2.5s | Manageable for young kids |
| Fast decay | 1.4s | Quick feedback when leaving |
| No timer | No time pressure | Chill vibe, reduces anxiety |
| Voice feedback | TTS enabled | Accessibility for pre-readers |

---

## Ticket References

| Ticket | Description | Status |
|--------|-------------|--------|
| GQ-002 | Game subscription hooks | ✅ Implemented |
| GQ-003 | Game progress tracking | ✅ Implemented |
| GQ-004 | Quality/UX standards | ✅ Implemented |
| GQ-005 | Accessibility features | ✅ Implemented |

---

## Test Coverage

### Test Suite: `steadyHandLogic.test.ts`

**27 tests covering:**
- Hold progress mechanics (9 tests)
- Custom duration behavior (3 tests)
- Edge cases and boundaries (5 tests)
- Target point generation (6 tests)
- Integration scenarios (4 tests)

**All tests passing ✅**

---

## Future Enhancements

### Potential Additions
- **Difficulty levels** - Smaller targets, faster hold times
- **Moving targets** - Targets that drift for advanced players
- **Multiple simultaneous targets** - Hold two at once
- **Obstacle modes** - Avoid moving obstacles while holding
- **Timer mode** - How many targets in 60 seconds
- **Precision scoring** - Bonus for staying perfectly centered

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
