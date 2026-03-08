# Beat Bounce Game Specification

**Game ID:** `beat-bounce`
**World:** Music
**Vibe:** Active
**Age Range:** 5-10 years
**CV Requirements:** None

---

## Overview

Beat Bounce is a rhythm game where children tap in time with bouncing balls. Players watch balls bounce to a beat and tap when the ball hits the ground, matching the timing to the beat.

### Tagline
"Bounce to the beat! Tap when it hits! 🎵"

---

## Game Mechanics

### Core Gameplay Loop

1. **Watch Ball** - Ball bounces to a beat
2. **Feel Rhythm** - Internalize the BPM (beats per minute)
3. **Time Tap** - Tap when ball hits the ground
4. **Get Feedback** - Perfect/Good/Miss rating
5. **Build Combo** - Consecutive hits increase score
6. **Level Up** - Higher BPM, more balls

### Controls

| Action | Input |
|--------|-------|
| Tap on beat | Click/tap anywhere or spacebar |
| Start game | Click "Start" button |
| Pause | Pause button |

---

## Difficulty Levels

### 3 Levels

| Level | BPM | Ball Count | Description |
|-------|-----|------------|-------------|
| 1 | 80 | 1 | Slow, single ball |
| 2 | 100 | 1 | Medium tempo |
| 3 | 120 | 2 | Fast, multiple balls |

### Beat Interval

```typescript
beatInterval = 60000 / bpm;  // milliseconds per beat

// Level 1: 60000 / 80 = 750ms per beat
// Level 2: 60000 / 100 = 600ms per beat
// Level 3: 60000 / 120 = 500ms per beat
```

---

## Scoring System

### Score Formula

```typescript
if (timing === 'perfect') {
  score = 100 + combo × 10;
} else if (timing === 'good') {
  score = 50 + combo × 5;
} else {
  score = 0;  // miss
}
```

### Score Examples

| Timing | Combo 0 | Combo 5 | Combo 10 |
|--------|---------|---------|----------|
| Perfect | 100 | 150 | 200 |
| Good | 50 | 75 | 100 |
| Miss | 0 | 0 | 0 |

### Max per Tap

200 points (Perfect with combo 10+)

---

## Timing Windows

### Beat Timing

```typescript
const TIMING_WINDOWS = {
  perfect: 0.1,  // ±10% of beat interval
  good: 0.2,     // ±20% of beat interval
  miss: 0.3,     // ±30% of beat interval (beyond this is miss)
};
```

### Window Examples (Level 2 - 600ms beat interval)

| Rating | Window | Time Range |
|--------|--------|------------|
| Perfect | ±10% | ±60ms from beat |
| Good | ±20% | ±120ms from beat |
| Miss | Beyond | Beyond ±120ms |

---

## Ball Physics

### Bouncing Ball Properties

```typescript
interface BouncingBall {
  id: number;
  x: number;           // Horizontal position (30-70%)
  y: number;           // Vertical position (0-100%)
  velocityY: number;   // Vertical velocity
  beatPhase: number;   // Phase in beat cycle
}
```

### Physics Update

```typescript
newY = y + velocityY × deltaTime;
newVelocityY = velocityY + gravity × deltaTime;

if (newY >= groundY) {
  newY = groundY;
  newVelocityY = -abs(velocityY) × bounceFactor;
}
```

### Ground Detection

A ball is considered "on the ground" when within 15% of ground Y position.

---

## Beat Timing Algorithm

### Detection Method

```typescript
function checkBeatTiming(ballY, groundY, bpm) {
  threshold = groundY × 0.15;  // 15% threshold

  if (abs(ballY - groundY) < threshold) {
    beatInterval = 60000 / bpm;
    timing = (Date.now() % beatInterval) / beatInterval;

    if (timing < 0.1 || timing > 0.9) {
      return 'perfect';
    } else if (timing < 0.2 || timing > 0.8) {
      return 'good';
    }
  }

  return null;  // Not in timing window
}
```

---

## Visual Design

### UI Elements

- **Bouncing Balls:** Circles moving up and down
- **Ground Line:** Visual reference at bottom
- **Beat Indicator:** Visual metronome/pulse
- **Timing Feedback:** "Perfect!", "Good!", "Miss"
- **Combo Counter:** Streak display with fire emoji
- **Score Display:** Current score
- **BPM Display:** Current tempo

### Ball Visual

| Element | Style |
|---------|-------|
| Shape | Circle |
| Color | Gradient or solid color |
| Size | Fixed radius |
| Shadow | Changes based on height |
| Trail | Optional motion trail |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Tap | playClick() | None |
| Perfect | playSuccess() | 'success' |
| Good | playPop() | 'light' |
| Miss | playError() | 'error' |
| Beat hit | playBeat() | None (metronome) |
| Combo milestone | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| BPM range | 80-120 | Beats per minute |
| Ball count | 1-2 | Number of balls |
| Gravity | ~9.8 | Physics simulation |
| Bounce factor | <1 | Energy loss on bounce |
| Ground Y | ~90% | Ground position |
| Perfect window | ±10% | Tight timing |
| Good window | ±20% | Lenient timing |
| Combo multiplier | +10/+5 | Score bonus |

---

## Data Structures

### Bouncing Ball

```typescript
interface BouncingBall {
  id: number;
  x: number;
  y: number;
  velocityY: number;
  beatPhase: number;
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;
  bpm: number;
  ballCount: number;
}
```

### Beat Timing

```typescript
interface BeatTiming {
  perfect: number;  // 0.1
  good: number;     // 0.2
  miss: number;     // 0.3
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `BeatBounce.tsx` | ~ | Main component with game loop |
| `beatBounceLogic.ts` | 115 | Ball physics, timing, scoring |
| `beatBounceLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`BeatBounce.tsx`): UI, state, game loop, events
- **Logic** (`beatBounceLogic.ts`): Ball physics, beat detection, scoring
- **Tests** (`beatBounceLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Rhythm Skills**
   - Beat recognition
   - Tempo awareness
   - Timing precision

2. **Musical Understanding**
   - BPM concepts
   - Beat patterns
   - Musical timing

3. **Hand-Eye Coordination**
   - Visual tracking
   - Reaction time
   - Motor timing

4. **Pattern Recognition**
   - Predicting bounce timing
   - Internalizing rhythm
   - Anticipating beats

5. **Focus & Concentration**
   - Sustained attention
   - Multi-ball tracking
   - Rhythmic focus

---

## Music Concepts Taught

1. **Tempo** - Speed of the beat (BPM)
2. **Timing** - Hitting on the beat
3. **Rhythm** - Consistent patterns
4. **Downbeat** - Strong beat emphasis
5. **Meter** - Grouping of beats

---

## Comparison with Similar Games

| Feature | BeatBounce | MusicConductor | MusicalStatues |
|---------|------------|----------------|----------------|
| Domain | Rhythm | Rhythm | Rhythm |
| Age Range | 5-10 | 5-12 | 4-10 |
| Core Mechanic | Tap on bounce | Conduct pattern | Freeze on beat |
| Input | Tap/Space | Hand gestures | Pose freeze |
| Difficulty | BPM + balls | Pattern complexity | Music tempo |
| Visual | Bouncing ball | Orchestra | Dancer |
| Feedback | Perfect/Good/Miss | Note accuracy | Freeze quality |
| Vibe | Active | Creative | Active |

---

## Example Gameplay

### Level 1 Example (80 BPM)

```
Ball bounces every 750ms
Tap when ball hits line ▁▁▁▁▁▁

Perfect timing: Within ±75ms of beat
Good timing: Within ±150ms of beat
```

### Level 3 Example (120 BPM, 2 balls)

```
Ball 1: ● ← → ● ← → ●
Ball 2:     ● ← → ● ←

Beat interval: 500ms
Tap when either ball hits ground!
```

---

## Physics Notes

### Gravity Simulation

- Gravity affects vertical velocity
- Bounce factor preserves some energy
- Consistent bounce timing creates rhythm

### Ball Positioning

- Level 1-2: Single ball at ~50% x position
- Level 3: Two balls at different x positions
- Y position updates based on velocity and gravity

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
