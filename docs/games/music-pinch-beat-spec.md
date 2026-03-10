# Music Pinch Beat Game Specification

**Game ID:** `music-pinch-beat`
**Age Range:** 4-8
**CV Required:** Hand (pinch)
**Vibe:** Active

---

## Overview

Music Pinch Beat is a rhythm game where children pinch their fingers on glowing lanes to play musical notes. The target lane changes every 1.8 seconds, and players must move their finger to the correct lane and pinch to keep the beat.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Hand tracking with index finger |
| Selection | Pinch gesture (thumb + index finger) |
| Lane detection | Based on normalized X position |

### Game Loop

1. **Lane Selection:** One lane (Sa, Re, or Ga) glows amber
2. **Move:** Player moves finger to the glowing lane
3. **Pinch:** Player pinches to play the note
4. **Beat:** Score points + play sound
5. **Change:** Target lane changes after 1.8s

---

## Lanes

| Lane | Label | Position | Color |
|------|-------|----------|-------|
| Left | Sa | 0 (x < 0.33) | Amber when active |
| Center | Re | 1 (0.33 < x < 0.66) | Amber when active |
| Right | Ga | 2 (x > 0.66) | Amber when active |

### Lane Detection

```typescript
function getLaneFromNormalizedX(x: number, laneCount: number): number | null {
  const laneWidth = 1 / laneCount;
  const lane = Math.floor(x / laneWidth);
  return lane < laneCount ? lane : null;
}
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

## Visual Design

### UI Elements

- **3 Lane Grid:** Vertical lanes with labels (Sa, Re, Ga)
- **Glowing Lane:** Amber background + shadow when active
- **Cursor:** Blue circle pointing at current position
- **Streak Display:** "🔥 {streak}x Streak" at top right

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Blue-50 (#EFF6FF) |
| Active lane | Amber-100/50 + glow |
| Inactive lane | White/40 border |
| Cursor | Blue circle |
| Miss | Red feedback |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Hit lane | playPop() | 'success' |
| Miss lane | playError() | 'error' |
| Streak milestone | playCelebration() | 'celebration' |
| Game start | playPop() | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Move your finger to the glowing lane and pinch to play the beat!" |
| Hit | "Nice rhythm! {Lane} lane hit." |
| Miss | "Move to the glowing lane and pinch!" |
| Milestone | "Great rhythm! Keep going!" |

---

## Game Constants

```typescript
const LANE_COUNT = 3;
const LANE_LABELS = ['Sa', 'Re', 'Ga'];
const TARGET_CHANGE_INTERVAL = 1800; // ms
const BASE_POINTS = 10;
const STREAK_BONUS_PER = 2;
const MAX_STREAK_BONUS = 20;
const STREAK_MILESTONE_INTERVAL = 5;
```

---

## Lane Selection Algorithm

```typescript
function pickNextLane(currentLane: number, laneCount: number): number {
  return (currentLane + 1) % laneCount;
}
```

Lane cycles: 0 → 1 → 2 → 0 → 1 → 2 ...

---

## Easter Eggs

| Achievement | Trigger |
|-------------|---------|
| egg-full-scale | Play all 3 lanes |

---

## Educational Value

### Skills Developed

1. **Rhythm** - Keeping time with beat changes
2. **Spatial Awareness** - Moving finger to correct position
3. **Hand-Eye Coordination** - Pinching accuracy
4. **Pattern Recognition** - Anticipating lane changes
5. **Musical Notes** - Learning Sa, Re, Ga (Indian musical notes)
6. **Reaction Time** - Quick responses to lane changes

---

## Accessibility

- **Large lanes:** Easy to target
- **Visual feedback:** Glowing lane clearly marked
- **Audio feedback:** Sound confirms hits
- **No game over:** Continuous play
- **Self-paced:** No pressure to perform perfectly
