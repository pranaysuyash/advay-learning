# Phonics Tracing Game Specification

**Game ID:** `phonics-tracing`
**Age Range:** 4-8
**CV Required:** Hand (pinch)
**Vibe:** Chill

---

## Overview

Phonics Tracing is an educational letter tracing game with real-time audio feedback. As children trace letters, Pip sounds them out IN REAL-TIME based on the letter's sound type: continuous (S, F, M, N, R, L, Z, W), burst (B, D, P, T, K, G, C, H, J, Q, V, X), or vowel (A, E, I, O, U, Y).

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Hand tracking with index finger tracing |
| Selection | Pinch gesture to start/stop tracing |
| Fallback | Mouse/touch drawing |

### Game Loop

1. **Letter Display:** Show target letter with example word
2. **Tracing:** Player traces letter outline with finger
3. **Real-Time Audio:** Sound plays while tracing based on sound type
4. **Completion Check:** System validates tracing when complete
5. **Scoring:** Points based on accuracy and time used

---

## Sound Types

### Continuous (8 letters)

Sound plays continuously while tracing:

| Letter | Sound | Example Word | Emoji |
|--------|-------|--------------|-------|
| F | Fuh | Fish | 🐟 |
| L | Luh | Lion | 🦁 |
| M | Muh | Moon | 🌙 |
| N | Nuh | Nest | 🪺 |
| R | Ruh | Rain | 🌧️ |
| S | Ssss | Sun | ☀️ |
| W | Wuh | Water | 💧 |
| Z | Zzz | Zoo | 🦓 |

### Burst (12 letters)

Single burst at stroke start:

| Letter | Sound | Example Word | Emoji |
|--------|-------|--------------|-------|
| B | Buh | Ball | 🏐 |
| C | Kuh | Cat | 🐱 |
| D | Duh | Dog | 🐕 |
| G | Guh | Goat | 🐐 |
| H | Huh | Hat | 🎩 |
| J | Juh | Jam | 🫙 |
| K | Kuh | Kite | 🪁 |
| P | Puh | Pig | 🐷 |
| Q | Ks | Queen | 👑 |
| T | Tuh | Tree | 🌳 |
| V | Vuh | Van | 🚐 |
| X | Ks | Box | 📦 |

### Vowel (6 letters)

Held note while tracing:

| Letter | Sound | Example Word | Emoji |
|--------|-------|--------------|-------|
| A | Ahh | Apple | 🍎 |
| E | Ehhh | Egg | 🥚 |
| I | Ihh | Igloo | 🏠 |
| O | Ohh | Octopus | 🐙 |
| U | Uhh | Umbrella | ☂️ |
| Y | Yuh | Yellow | 🟡 |

---

## Levels & Progression

| Level | Letters | Time Per Letter | Pass Threshold |
|-------|---------|-----------------|----------------|
| 1 | A, B, C, M, S, T | 30s | 60% |
| 2 | D, F, G, H, K, L, N, P, R | 25s | 65% |
| 3 | E, I, O, U, V, W, Y, Z | 20s | 70% |

### Progression

- Complete letters in sequence within level
- Pass threshold increases with level (60% → 65% → 70%)
- Time per letter decreases (30s → 25s → 20s)
- More complex letters in later levels

---

## Scoring System

### Score Formula

```typescript
baseScore = accuracy;
timeBonus = max(0, ((timeLimit - timeUsed) / timeLimit) × 20);
totalScore = min(100, baseScore + timeBonus);
```

### Score Examples

| Accuracy | Time Used | Time Limit | Base | Bonus | Total |
|----------|-----------|------------|------|-------|-------|
| 70% | 15s | 30s | 70 | 10 | 80 |
| 85% | 10s | 30s | 85 | 13 | 98 |
| 90% | 5s | 30s | 90 | 16 | 100 |
| 60% | 30s | 30s | 60 | 0 | 60 |

### Max Score per Letter

100 points

---

## Accuracy Calculation

### Components

1. **Coverage Score (50%)** - What percentage of letter area was traced
2. **Smoothness Score (40%)** - How smooth the strokes are (angle variance)
3. **Complexity Bonus (10%)** - Bonus for complex letters

### Formula

```typescript
coverageScore = min(100, tracedArea × 200 + (pointCount / 50) × 50);
smoothnessScore = 100 - (avgAngleChange × 50);
complexityBonus = letter.length > 1 ? 10 : 0;
accuracy = min(100, coverageScore × 0.5 + smoothnessScore × 0.4 + complexityBonus);
```

### Minimum Points

Must have at least 10 trace points before calculating accuracy

---

## Letter Data Structure

```typescript
interface LetterData {
  letter: string;          // Uppercase letter (e.g., "A")
  uppercase: string;       // Uppercase (e.g., "A")
  lowercase: string;       // Lowercase (e.g., "a")
  soundType: SoundType;    // 'continuous' | 'burst' | 'vowel'
  ttsIntro: string;        // "A is for"
  ttsExample: string;      // "Ahhh like in Apple"
  exampleWord: string;     // "Apple"
  exampleEmoji: string;    // "🍎"
}
```

---

## Tracing State

```typescript
interface TracingState {
  letter: string;              // Current letter
  strokePoints: TracePoint[];  // Points drawn
  isComplete: boolean;         // Tracing done
  accuracy: number;            // Calculated accuracy
}

interface TracePoint {
  x: number;          // Normalized 0-1
  y: number;          // Normalized 0-1
  timestamp: number;  // Milliseconds
}
```

---

## Level Configuration

```typescript
interface TracingLevelConfig {
  level: number;         // 1, 2, or 3
  letters: string[];     // Letters in this level
  timePerLetter: number; // Seconds allowed
  passThreshold: number; // Min accuracy % to pass
}
```

---

## Visual Design

### UI Elements

- **Letter Display:** Large target letter at top
- **Canvas:** Drawing area with letter guide overlay
- **Guide Points:** Faint outline showing letter shape
- **Tracing Path:** User's drawn path in real-time
- **Timer:** Countdown for current letter
- **Score Panel:** Current score and accuracy

### Color Scheme

| Element | Color |
|---------|-------|
| Background | White/cream |
| Letter guide | Faint gray (25% opacity) |
| Tracing path | Black with glow |
| Success state | Green/gold |
| Error state | Red |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | TTS: "Trace the letters!" | None |
| Letter shown | TTS: "{Letter}! Like in {Example}!" | None |
| Tracing starts | Continuous/burst/vowel sound | None |
| Tracing (continuous) | Ongoing sound while tracing | None |
| Letter complete | Celebration + TTS | 'celebration' |
| Time's up | Error sound | 'error' |

---

## Real-Time Audio Feedback

### Continuous Sounds

Play continuously while finger is down and moving:
- S, F, M, N, R, L, Z, W
- Sound stops when tracing stops

### Burst Sounds

Single burst at stroke start:
- B, D, P, T, K, G, C, H, J, Q, V, X
- Plays once when user starts tracing

### Vowel Sounds

Held note while tracing:
- A, E, I, O, U, Y
- Similar to continuous but with vowel quality

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Trace the letters! Sound them out as you go!" |
| Letter shown | "{Letter}! Like in {Example word}!" |
| Sound example | "{Sound} like in {Example word}!" |
| Success | "Great job! You traced {letter}!" |
| Too fast | "Take your time! Trace carefully!" |
| Time's up | "Time's up! Let's try the next letter!" |

---

## Game Constants

```typescript
const MIN_TRACE_POINTS = 10;           // Min points before calculating accuracy
const MIN_AREA_SIZE = 0.15;            // Min width/height for completion
const COVERAGE_WEIGHT = 0.5;           // 50% of accuracy
const SMOOTHNESS_WEIGHT = 0.4;         // 40% of accuracy
const COMPLEXITY_BONUS = 10;           // Bonus for complex letters
const MAX_SCORE = 100;                 // Maximum score
const MAX_TIME_BONUS = 20;             // Maximum time bonus
```

---

## Completion Detection

```typescript
function isTracingComplete(tracePoints: TracePoint[], minPoints: number = 30): boolean {
  if (tracePoints.length < minPoints) return false;

  const bounds = getTraceBounds(tracePoints);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  // Must have traced a reasonable area
  return width > 0.15 && height > 0.15;
}
```

### Completion Criteria

1. **Minimum points:** 30 trace points
2. **Area coverage:** At least 15% width and height
3. **Time:** Can complete before timer expires

---

## Letter Guide Points

Simplified template coordinates for letter outlines:

```typescript
function getLetterGuidePoints(letter: string): { x: number; y: number }[] {
  // Returns normalized coordinates (0-1) for letter outline
  // Used for visual guide overlay
}
```

### Example Guides

- **A:** Peak at (0.5, 0.1), legs to (0.2, 0.9) and (0.8, 0.9), crossbar at (0.5, 0.5)
- **S:** Top curve to (0.2, 0.2), center at (0.5, 0.5), bottom curve to (0.2, 0.8)
- **O:** Oval from (0.5, 0.1) → (0.1, 0.5) → (0.5, 0.9) → (0.9, 0.5) → close

---

## Comparison with Similar Games

| Feature | PhonicsTracing | AlphabetTracing | WordBuilder |
|---------|----------------|-----------------|-------------|
| CV Required | Hand (pinch) | Hand (pinch) - optional | Hand (pinch) |
| Core Mechanic | Trace with sound | Trace letter outline | Build words |
| Audio Feedback | Real-time per sound type | TTS only | TTS only |
| Educational Focus | Phonics, letter sounds | Letter formation | Spelling |
| Time Limit | Per letter (20-30s) | None | None |
| Scoring | Accuracy + time | Accuracy only | Word completion |
| Age Range | 4-8 | 3-8 | 5-8 |

---

## Educational Value

### Skills Developed

1. **Phonics** - Letter-sound correspondence, sound types (continuous, burst, vowel)
2. **Letter Formation** - Proper stroke order (implicit), letter shapes
3. **Fine Motor Skills** - Tracing along lines, hand-eye coordination
4. **Writing Readiness** - Pre-writing skills, pencil grip preparation
5. **Auditory Learning** - Associating sounds with visual letters
6. **Sound Discrimination** - Distinguishing between sound types

---

## Accessibility

- **Real-time audio** - Immediate sound feedback while tracing
- **Visual guides** - Faint letter outlines for tracing
- **Adjustable timing** - 3 levels with different time limits
- **Forgiving thresholds** - 60-70% accuracy sufficient
- **Multi-sensory** - Visual (tracing) + auditory (sounds) learning
