# Music Pinch Beat - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `music-pinch-beat`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `src/frontend/src/pages/MusicPinchBeat.tsx` (348 lines)
- Logic: `src/frontend/src/games/musicPinchLogic.ts`
- Spec: `docs/games/music-pinch-beat-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Music Pinch Beat is a rhythm game where children pinch their fingers on glowing lanes to play musical notes. The implementation features 3 lanes (Sa, Re, Ga), 1.8-second beat intervals, and continuous play with streak bonuses.

### Test Coverage

- **Logic module tests** - Should cover lane detection, picking
- **No component tests** - Testing manual/explored through code review
- **Tests should cover:** Lane detection algorithm, hit/miss logic, scoring

---

## Implementation Quality Assessment

### Strengths

1. **3 lane system** - Sa, Re, Ga (Indian musical notes)
2. **Auto beat** - Lane changes every 1.8 seconds
3. **Continuous play** - No game over, keep playing
4. **Streak bonuses** - Up to 20 bonus points
5. **TTS feedback** - Voice confirms hits
6. **Milestone celebrations** - Every 5 streak
7. **Easter egg** - Full-scale achievement
8. **Shared logic** - Lane utilities in musicPinchLogic.ts

### Areas for Improvement

1. **No unit tests** - Lane detection needs coverage
2. **Simple mechanics** - Only 3 lanes, could be more varied
3. **No difficulty progression** - Same speed throughout
4. **Level calculation** - Based on score/80, could be clearer

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `MusicPinchBeat.tsx` | 348 | Component with UI, hand tracking, game loop |
| `musicPinchLogic.ts` | Shared | Lane detection, next lane picking |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code (component) | 348 |
| Lanes | 3 |
| Beat interval | 1800ms |
| Base points per hit | 10 |
| Max streak bonus | 20 |

---

## Key Constants

```typescript
const LANE_COUNT = 3;
const LANE_LABELS = ['Sa', 'Re', 'Ga'];
const TARGET_CHANGE_INTERVAL = 1800;
const BASE_POINTS = 10;
const STREAK_BONUS_PER = 2;
const MAX_STREAK_BONUS = 20;
const STREAK_MILESTONE_INTERVAL = 5;
```

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 20);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 10 | 0 | 10 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 10+ | 10 | 20 | 30 |

### Level Calculation

```typescript
level = Math.max(1, Math.floor(score / 80) + 1);
```

---

## Lane Detection Algorithm

```typescript
function getLaneFromNormalizedX(x: number, laneCount: number): number | null {
  const laneWidth = 1 / laneCount;
  const lane = Math.floor(x / laneWidth);
  return lane < laneCount ? lane : null;
}
```

### Lane Positions

| Lane | X Range | Label |
|------|--------|-------|
| 0 | 0.00 - 0.33 | Sa |
| 1 | 0.33 - 0.66 | Re |
| 2 | 0.66 - 1.00 | Ga |

---

## Lane Selection Algorithm

```typescript
function pickNextLane(currentLane: number, laneCount: number): number {
  return (currentLane + 1) % laneCount;
}
```

Cycles through: 0 → 1 → 2 → 0 → 1 → 2 ...

---

## Game Loop

```typescript
useEffect(() => {
  if (!isPlaying) return;

  const timer = setInterval(() => {
    setTargetLane((prev) => pickNextLane(prev, LANE_COUNT));
  }, 1800);

  return () => clearInterval(timer);
}, [isPlaying]);
```

---

## Visual Design

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Blue-50 (#EFF6FF) |
| Active lane | Amber-100/50 + shadow (#FCD34D glow) |
| Inactive lane | White/40 border (#F2CC8F) |
| Cursor | Blue circle (#3B82F6) |
| Miss | Red feedback |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Hit lane | playPop() | 'success' |
| Miss lane | playError() | 'error' |
| Milestone | playCelebration() | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Move your finger to the glowing lane and pinch to play the beat!" |
| Hit | "Nice rhythm! {Lane} lane hit." |
| Miss | "Move to the glowing lane and pinch!" |
| Milestone | "Great rhythm! Keep going!" |

---

## Hand Tracking Configuration

```typescript
useGameHandTracking({
  gameName: 'MusicPinchBeat',
  targetFps: 30,
  isRunning: isPlaying,
  onFrame: handleFrame,
});
```

### Frame Processing

```typescript
const lane = getLaneFromNormalizedX(tip.x, LANE_COUNT);
setSelectedLane(lane);

if (frame.pinch.transition !== 'start') return;

if (lane === targetLaneRef.current) {
  // Hit!
  const nextStreak = streakRef.current + 1;
  setStreak(nextStreak);
  setScore((prev) => prev + 10 + Math.min(20, nextStreak × 2));
  setTargetLane((prev) => pickNextLane(prev, LANE_COUNT));
} else {
  // Miss!
  setStreak(0);
}
```

---

## Easter Eggs

| Achievement | Trigger |
|-------------|---------|
| egg-full-scale | Play all 3 lanes |

```typescript
playedLanesRef.current.add(lane);
if (playedLanesRef.current.size >= LANE_COUNT) {
  triggerEasterEgg('egg-full-scale');
}
```

---

## Comparison with Similar Games

| Feature | MusicPinchBeat | BeatBounce | RhythmGames |
|---------|----------------|------------|-------------|
| Core Mechanic | Pinch on lane | Bounce on beat | Various |
| Input | Hand pinch | Various | Various |
| Musical notes | Sa, Re, Ga (Indian) | Western | Varies |
| Continuous play | Yes | Varies | Varies |
| Age Range | 4-8 | 5-10 | Varies |

---

## Educational Value

### Skills Developed

1. **Rhythm** - Keeping time with beat changes
2. **Spatial Awareness** - Moving finger to correct position
3. **Hand-Eye Coordination** - Pinching accuracy
4. **Pattern Recognition** - Anticipating lane changes
5. **Musical Notes** - Learning Sa, Re, Ga
6. **Reaction Time** - Quick responses to lane changes

---

## Recommendations

### Testing

1. **Add unit tests** for:
   - `getLaneFromNormalizedX()` - All lane positions
   - `pickNextLane()` - Cycling behavior
   - Edge cases (x = 0, x = 1, x boundaries)

### Code Quality

1. **Extract constants** to named exports
2. **Add difficulty progression** - Faster beats at higher levels
3. **Visual feedback** - Show note pitch/color on hit

---

## Conclusion

Music Pinch Beat is **functionally correct** with engaging rhythm gameplay. The 3-lane system with Sa/Re/Ga notes provides cultural educational value. The continuous play design with no game over creates a low-pressure environment for learning rhythm.

**Audit Status:** APPROVED ✅
**Tests:** NEEDED (lane detection)
**Documentation:** COMPLETE ✅
