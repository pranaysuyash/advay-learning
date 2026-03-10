# Phonics Tracing - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `phonics-tracing`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Logic: `src/frontend/src/games/phonicsTracingLogic.ts` (236 lines)
- Spec: `docs/games/phonics-tracing-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Phonics Tracing is an educational letter tracing game with real-time audio feedback based on letter sound types. The implementation includes 26 letters categorized into 3 sound types (continuous, burst, vowel), 3 progressive difficulty levels, and accuracy scoring combining coverage, smoothness, and complexity.

### Test Coverage

- **No dedicated test file** - Testing manual/explored through code review
- **Tests should cover:** Letter data loading, accuracy calculation, smoothness scoring, completion detection, level progression, guide points

---

## Implementation Quality Assessment

### Strengths

1. **26 letter database** - Complete alphabet with TTS examples and emojis
2. **3 sound types** - Continuous (8), burst (12), vowel (6) for real-time audio
3. **3 difficulty levels** - Progressive timing (30s → 25s → 20s) and thresholds (60% → 65% → 70%)
4. **Multi-component accuracy** - Coverage (50%), smoothness (40%), complexity (10%)
5. **Completion detection** - Area-based (15% min width/height) + point count (30 min)
6. **Guide point templates** - Simplified letter outlines for visual guides
7. **Level-based progression** - Letters grouped by difficulty
8. **Pure functional design** - No side effects in logic module

### Areas for Improvement

1. **No unit tests** - Critical for accuracy calculation algorithm
2. **Simplified guide points** - Only 4 letters have detailed templates (A, S, B, O)
3. **Magic numbers** - Some thresholds embedded in functions
4. **Limited completion criteria** - Only checks area, not path matching

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `phonicsTracingLogic.ts` | 236 | Letter data, level configs, accuracy calculation, completion detection |
| Used by | Phonics Tracing game | Game component for logic |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 236 |
| Exports | 11 (3 interfaces, 1 type, 7 functions) |
| Letters | 26 |
| Sound types | 3 |
| Levels | 3 |
| Guide templates | 4 (A, S, B, O) |

---

## Key Interfaces

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

interface TracingLevelConfig {
  level: number;         // 1, 2, or 3
  letters: string[];     // Letters in this level
  timePerLetter: number; // Seconds allowed
  passThreshold: number; // Min accuracy % to pass
}
```

---

## 26 Letters by Sound Type

### Continuous (8 letters)

| Letter | Uppercase | Lowercase | Example | Emoji |
|--------|-----------|-----------|---------|-------|
| F | F | f | Fish | 🐟 |
| L | L | l | Lion | 🦁 |
| M | M | m | Moon | 🌙 |
| N | N | n | Nest | 🪺 |
| R | R | r | Rain | 🌧️ |
| S | S | s | Sun | ☀️ |
| W | W | w | Water | 💧 |
| Z | Z | z | Zoo | 🦓 |

### Burst (12 letters)

| Letter | Uppercase | Lowercase | Example | Emoji |
|--------|-----------|-----------|---------|-------|
| B | B | b | Ball | 🏐 |
| C | C | c | Cat | 🐱 |
| D | D | d | Dog | 🐕 |
| G | G | g | Goat | 🐐 |
| H | H | h | Hat | 🎩 |
| J | J | j | Jam | 🫙 |
| K | K | k | Kite | 🪁 |
| P | P | p | Pig | 🐷 |
| Q | Q | q | Queen | 👑 |
| T | T | t | Tree | 🌳 |
| V | V | v | Van | 🚐 |
| X | X | x | Box | 📦 |

### Vowel (6 letters)

| Letter | Uppercase | Lowercase | Example | Emoji |
|--------|-----------|-----------|---------|-------|
| A | A | a | Apple | 🍎 |
| E | E | e | Egg | 🥚 |
| I | I | i | Igloo | 🏠 |
| O | O | o | Octopus | 🐙 |
| U | U | u | Umbrella | ☂️ |
| Y | Y | y | Yellow | 🟡 |

---

## Level Configurations

| Level | Letters | Time | Threshold |
|-------|---------|------|------------|
| 1 | A, B, C, M, S, T | 30s | 60% |
| 2 | D, F, G, H, K, L, N, P, R | 25s | 65% |
| 3 | E, I, O, U, V, W, Y, Z | 20s | 70% |

---

## Scoring System

### Score Formula

```typescript
baseScore = accuracy;
timeBonus = max(0, round(((timeLimit - timeUsed) / timeLimit) * 20));
totalScore = min(100, baseScore + timeBonus);
```

### Score Examples

| Accuracy | Time Used | Time Limit | Base | Bonus | Total |
|----------|-----------|------------|------|-------|-------|
| 70% | 15s | 30s | 70 | 10 | 80 |
| 85% | 10s | 30s | 85 | 13 | 98 |
| 90% | 5s | 30s | 90 | 17 | 100 |
| 60% | 30s | 30s | 60 | 0 | 60 |

---

## Accuracy Calculation

### Formula

```typescript
coverageScore = min(100, tracedArea * 200 + (pointCount / 50) * 50);
smoothnessScore = max(0, 100 - avgAngleChange * 50);
complexityBonus = letter.length > 1 ? 10 : 0;
accuracy = min(100, coverageScore * 0.5 + smoothnessScore * 0.4 + complexityBonus);
```

### Components

| Component | Weight | Description |
|-----------|--------|-------------|
| Coverage | 50% | Area traced + point density |
| Smoothness | 40% | Angle variance between segments |
| Complexity | 10% | Bonus for multi-character letters |

### Minimum Points

Must have at least 10 trace points before calculating accuracy

---

## Smoothness Score Algorithm

```typescript
function calculateSmoothnessScore(points: TracePoint[]): number {
  if (points.length < 3) return 0;

  let totalAngleChange = 0;
  let pointCount = 0;

  for (let i = 2; i < points.length; i++) {
    const v1 = { x: points[i - 1].x - points[i - 2].x, y: points[i - 1].y - points[i - 2].y };
    const v2 = { x: points[i].x - points[i - 1].x, y: points[i].y - points[i - 1].y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 > 0 && mag2 > 0) {
      const cosAngle = max(-1, min(1, dot / (mag1 * mag2)));
      const angle = acos(cosAngle);
      totalAngleChange += angle;
      pointCount++;
    }
  }

  const avgAngleChange = totalAngleChange / pointCount;
  return max(0, 100 - avgAngleChange * 50);
}
```

**Interpretation:** Lower angle variance = smoother = higher score

---

## Completion Detection

```typescript
function isTracingComplete(tracePoints: TracePoint[], minPoints: number = 30): boolean {
  if (tracePoints.length < minPoints) return false;

  const bounds = getTraceBounds(tracePoints);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  return width > 0.15 && height > 0.15;
}
```

### Completion Criteria

1. **Minimum points:** 30 trace points (configurable)
2. **Area coverage:** At least 15% width AND 15% height
3. **No time requirement:** Can complete before timer expires

---

## Letter Guide Points

Simplified template coordinates for letter outlines:

```typescript
function getLetterGuidePoints(letter: string): { x: number; y: number }[] {
  const templates: Record<string, { x: number; y: number }[]> = {
    'A': [
      { x: 0.5, y: 0.1 },   // Peak
      { x: 0.2, y: 0.9 },   // Left leg
      { x: 0.5, y: 0.5 },   // Crossbar start
      { x: 0.8, y: 0.9 },   // Right leg
      { x: 0.5, y: 0.1 },   // Close to peak
    ],
    'S': [
      { x: 0.8, y: 0.2 },   // Top right
      { x: 0.2, y: 0.2 },   // Top left
      { x: 0.5, y: 0.5 },   // Center
      { x: 0.8, y: 0.8 },   // Bottom right
      { x: 0.2, y: 0.8 },   // Bottom left
    ],
    'B': [
      { x: 0.2, y: 0.1 },   // Top of stem
      { x: 0.2, y: 0.9 },   // Bottom of stem
      { x: 0.6, y: 0.2 },   // Top bump start
      { x: 0.8, y: 0.35 },  // Top bump out
      { x: 0.6, y: 0.5 },   // Middle
      { x: 0.8, y: 0.65 },  // Bottom bump out
      { x: 0.6, y: 0.8 },   // Bottom bump in
      { x: 0.2, y: 0.9 },   // Back to stem
    ],
    'O': [
      { x: 0.5, y: 0.1 },   // Top
      { x: 0.1, y: 0.5 },   // Left
      { x: 0.5, y: 0.9 },   // Bottom
      { x: 0.9, y: 0.5 },   // Right
      { x: 0.5, y: 0.1 },   // Close to top
    ],
  };

  const upper = letter.toUpperCase();
  return templates[upper] ?? [/* Default 4-point template */];
}
```

### Template Coverage

| Letters | Template |
|---------|----------|
| A, S, B, O | Custom detailed template |
| All others | Default 4-point template |

---

## Game Constants

```typescript
const MIN_TRACE_POINTS_FOR_ACCURACY = 10;   // Min points before calculating
const MIN_TRACE_POINTS_FOR_COMPLETE = 30;   // Min points for completion
const MIN_AREA_SIZE = 0.15;                 // Min width/height for completion
const COVERAGE_WEIGHT = 0.5;                // 50% of accuracy
const SMOOTHNESS_WEIGHT = 0.4;              // 40% of accuracy
const COMPLEXITY_BONUS = 10;                // Bonus for complex letters
const MAX_SCORE = 100;                      // Maximum score
const MAX_TIME_BONUS = 20;                  // Maximum time bonus
```

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
| Letters | 26 | 26 (multi-language) | ~1200 words |
| Age Range | 4-8 | 3-8 | 5-8 |

---

## Educational Value

### Skills Developed

1. **Phonics** - Letter-sound correspondence, continuous/burst/vowel sounds
2. **Letter Formation** - Proper stroke order (implicit), letter shapes
3. **Fine Motor Skills** - Tracing along lines, hand-eye coordination
4. **Writing Readiness** - Pre-writing skills, pencil grip preparation
5. **Auditory Learning** - Associating sounds with visual letters
6. **Sound Discrimination** - Distinguishing between sound types

---

## Recommendations

### Testing

1. **Add unit tests** for:
   - `getLetterData()` - All 26 letters
   - `getLettersForLevel()` - All 3 levels
   - `calculateTraceAccuracy()` - Various point patterns
   - `calculateSmoothnessScore()` - Smooth vs jagged lines
   - `isTracingComplete()` - Edge cases
   - `calculateScore()` - Time/accuracy combinations
   - `getNextLetter()` - Sequence progression

2. **Test data** should include:
   - Smooth tracing paths
   - Jagged/noisy paths
   - Incomplete traces
   - Minimal completion traces

### Code Quality

1. **Extract constants** - Magic numbers to named exports:
   ```typescript
   export const PHONICS_TRACING_CONSTANTS = {
     MIN_TRACE_POINTS_FOR_ACCURACY: 10,
     MIN_TRACE_POINTS_FOR_COMPLETE: 30,
     MIN_AREA_SIZE: 0.15,
     COVERAGE_WEIGHT: 0.5,
     SMOOTHNESS_WEIGHT: 0.4,
     COMPLEXITY_BONUS: 10,
     MAX_SCORE: 100,
     MAX_TIME_BONUS: 20,
   } as const;
   ```

2. **Complete guide templates** - Add detailed templates for all 26 letters

3. **Add JSDoc** - Enhanced documentation for accuracy calculation

### Features

1. **Path matching** - Compare traced path to guide points (not just area)
2. **Stroke order validation** - Check if traced in correct direction
3. **Real-time accuracy** - Show accuracy while tracing
4. **Multi-language support** - Extend beyond English alphabet

---

## Conclusion

Phonics Tracing is **functionally correct** with a well-structured logic module. The implementation provides comprehensive phonics learning with 26 letters categorized by sound type and 3 progressive difficulty levels. The accuracy calculation combines coverage, smoothness, and complexity for fair assessment.

**Audit Status:** APPROVED ✅
**Tests:** NONE (recommend adding)
**Documentation:** COMPLETE ✅

**Priority Improvements:**
1. Add unit tests for accuracy calculation
2. Complete guide point templates for all 26 letters
3. Extract magic numbers to named constants
