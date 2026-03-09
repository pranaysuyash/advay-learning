# Mirror Draw - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `mirror-draw`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Logic: `src/frontend/src/games/mirrorDrawLogic.ts` (494 lines)
- Tests: `src/frontend/src/games/__tests__/mirrorDrawLogic.test.ts` (28 tests)
- Component: `MirrorDraw.tsx` (625 lines)
- Spec: `docs/games/mirror-draw-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Mirror Draw is a creative educational game where children trace mirror images of shapes. Half of a shape is shown on the left; children must draw the mirror image on the right side. The implementation includes 20 templates across 4 levels.

### Test Coverage
- **28 tests** (excellent)
- **28 tests passing** (100% pass rate)
- Tests cover: templates data, level configs, template retrieval, mirror point function, point sampling, star rating, match scoring

---

## Implementation Quality Assessment

### Strengths
1. **20 templates** - 5 per level with carefully designed shapes
2. **4-level progression** - Increasing accuracy thresholds (40%, 55%, 65%, 75%)
3. **Star rating system** - 0-3 stars based on accuracy (90%+, 70-89%, 30-69%)
4. **Mirror point algorithm** - `x: 1.0 - point.x` for center-line reflection
5. **Fisher-Yates sampling** - Evenly distributed point sampling for accuracy calculation
6. **Pure functional design** - No side effects in logic module

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `mirrorDrawLogic.ts` | 494 | Templates, mirror math, scoring, accuracy |
| `MirrorDraw.tsx` | 625 | Component with UI and hand tracking |
| `mirrorDrawLogic.test.ts` | ~400 | Unit tests |

---

## Test Results

### Passing Tests (28/28) ✅

**TEMPLATES Data (5 tests)**
- Has 20 total templates
- Has 5 templates per level
- All templates have non-empty points
- All templates have valid fields
- Template points are within 0-1 range

**LEVELS Configuration (2 tests)**
- Has 4 levels
- Thresholds increase with level

**getTemplatesForLevel (3 tests)**
- Returns 5 templates for each level
- Returns empty for invalid level
- All returned templates match requested level

**mirrorPoint (4 tests)**
- Mirrors point across center line x=0.5
- Center point stays at center
- Preserves y coordinate
- Left edge mirrors to right edge

**samplePoints (5 tests)**
- Returns requested count
- Returns all points if count >= input length
- Returns empty for empty input
- Returns empty for count <= 0
- First and last points match input endpoints

**getStars (4 tests)**
- Returns 3 stars for 90%+
- Returns 2 stars for 70-89%
- Returns 1 star for 30-69%
- Returns 0 stars for <30%

**calculateMatchScore (5 tests)**
- Returns high accuracy for perfect mirror trace
- Returns low accuracy for far-off points
- Returns 0 accuracy for fewer than 3 user points
- Uses level-specific pass threshold
- Returns valid MatchScore shape

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 494 |
| Exports | 7 (3 interfaces, 4 functions, 2 constants) |
| Test coverage | 28 tests |
| Test pass rate | 100% |
| Templates | 20 |

---

## 4 Difficulty Levels

| Level | Pass Threshold | Templates | Difficulty |
|-------|----------------|-----------|------------|
| 1 | 40% | 5 | Easy - simple shapes |
| 2 | 55% | 5 | Medium - organic shapes |
| 3 | 65% | 5 | Hard - complex shapes |
| 4 | 75% | 5 | Expert - intricate shapes |

---

## 20 Templates

### Level 1 - Simple Shapes (5)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| heart | Heart | ❤️ | 9 |
| circle | Circle | ⭕ | 9 |
| square | Square | ⬜ | 4 |
| star | Star | ⭐ | 6 |
| moon | Moon | 🌙 | 7 |

### Level 2 - Organic Shapes (5)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| butterfly | Butterfly | 🦋 | 14 |
| leaf | Leaf | 🍃 | 8 |
| smiley | Smiley | 😊 | 9 |
| fish | Fish | 🐟 | 10 |
| diamond | Diamond | 💎 | 5 |

### Level 3 - Complex Shapes (5)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| flower | Flower | 🌸 | 14 |
| tree | Tree | 🌲 | 10 |
| house | House | 🏠 | 7 |
| car | Car | 🚗 | 11 |
| rocket | Rocket | 🚀 | 10 |

### Level 4 - Intricate Shapes (5)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| snowflake | Snowflake | ❄️ | 13 |
| crown | Crown | 👑 | 7 |
| robot | Robot | 🤖 | 14 |
| bell | Bell | 🔔 | 13 |
| shield | Shield | 🛡️ | 8 |

---

## Key Interfaces

```typescript
interface MirrorTemplate {
  id: string;
  name: string;
  emoji: string;
  level: 1 | 2 | 3 | 4;
  points: Array<{ x: number; y: number }>;
}

interface MatchScore {
  accuracy: number;  // 0-1
  stars: 0 | 1 | 2 | 3;
  passed: boolean;
}

interface LevelConfig {
  level: number;
  passThreshold: number;
  templateCount: number;
}
```

---

## Mirror Point Function

```typescript
export function mirrorPoint(point: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: 1.0 - point.x, y: point.y };
}
```

### Examples

| Input (x, y) | Output (x, y) |
|--------------|---------------|
| (0.2, 0.3) | (0.8, 0.3) |
| (0.5, 0.5) | (0.5, 0.5) |
| (0.0, 0.5) | (1.0, 0.5) |

---

## Accuracy Algorithm

### Calculation Steps

1. **Mirror Template:** `mirroredTemplate = template.points.map(mirrorPoint)`
2. **Sample User Points:** `sampled = samplePoints(userPoints, mirroredTemplate.length)`
3. **Find Average Distance:** For each user point, find nearest template point
4. **Calculate Accuracy:** `accuracy = clamp(0, 1, 1 - avgDist / maxAllowedDistance)`

### Constants

```typescript
maxAllowedDistance = 0.15;  // forgiving for kids
```

---

## Scoring System

### Star Rating

| Accuracy | Stars | Rating |
|----------|-------|--------|
| 90%+ | 3 | Perfect! |
| 70-89% | 2 | Great! |
| 30-69% | 1 | Nice! |
| <30% | 0 | Try Again |

### Score Calculation

```typescript
basePoints = 10;  // per passed template
starBonus = stars × 5;  // 0, 5, 10, or 15
totalScore = basePoints + starBonus;
```

### Score Examples

| Stars | Base | Bonus | Total |
|-------|------|-------|-------|
| 0 | 0 (failed) | 0 | 0 |
| 1 | 10 | 5 | 15 |
| 2 | 10 | 10 | 20 |
| 3 | 10 | 15 | 25 |

---

## Visual Design

### Canvas

- **Size:** 800 × 600 pixels
- **Background:** #FFF8F0 (warm off-white)
- **Texture:** Subtle weather pattern (5% opacity)

### Drawing Layers

| Layer | Description | Style |
|-------|-------------|-------|
| Center Line | Dashed divider | Slate-300, 4px, [12,12] dash |
| Template | Left half shape | Blue (#3B82F6), 8px, solid |
| Ghost Guide | Faint right mirror | Blue 20% opacity, 6px, [8,12] dash |
| User Stroke | Right half drawing | Emerald (#10B981), 10px, glow |
| Cursor | Bubbly indicator | Orange/Emerald, 18-24px radius |

### Cursor States

| State | Fill | Radius | Emoji |
|-------|------|--------|-------|
| Idle | Orange (#E85D04) | 18px | 👆 |
| Drawing | Emerald (#10B981) | 24px | ✏️ |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playPop() | None |
| Passed template | playPop(), success sound | 'success' |
| Failed template | playError(), wrong sound | None |
| Level complete | playCelebration(), level-complete | 'celebration' |
| All complete | playCelebration() | 'celebration' |
| Streak milestone | None | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Let's go! Trace the other half! ✨" |
| Menu | "Look at the shape on the left. Trace its mirror on the right. Pinch and draw with your finger!" |
| Passed (3 stars) | "Perfect tracing! You matched the {shape}!" |
| Passed (2 stars) | "Great job! You matched the {shape}!" |
| Passed (1 star) | "Nice work! You matched the {shape}!" |
| Failed | "Keep trying! Trace the shape more carefully!" |
| Level complete | "Level complete! Great mirror drawing!" |
| All complete | "Amazing! You completed all the mirror drawings!" |

---

## Progress Tracking

### Integration with useGameDrops

```typescript
await onGameComplete(finalScore);
triggerEasterEgg('egg-perfect-symmetry');  // When accuracy >= 95%
```

### Easter Egg

| ID | Trigger | Effect |
|----|---------|--------|
| egg-perfect-symmetry | Accuracy >= 95% | Item drop |

---

## Comparison with Similar Games

| Feature | MirrorDraw | FreeDraw | YogaAnimals |
|---------|------------|----------|-------------|
| CV Required | Hand (pinch) | Hand (draw) | Pose (full body) |
| Core Mechanic | Mirror symmetry drawing | Free creative drawing | Pose mimicking |
| Educational Focus | Symmetry, spatial reasoning | Creativity | Body awareness |
| Progression | 4 levels × 5 templates | None | 10 poses |
| Visual Feedback | Ghost guide, star rating | Drawing canvas | Photo overlay |
| Time Limit | None | None | 10s per pose |
| Age Range | 4-10 | 3-10 | 4-10 |

---

## Educational Value

### Skills Developed

1. **Symmetry Understanding** - Mirror image concept, left-right correspondence, spatial relationships
2. **Fine Motor Skills** - Pinch gesture control, drawing precision, hand-eye coordination
3. **Visual-Spatial Reasoning** - Shape recognition, pattern completion, mental rotation
4. **Attention to Detail** - Following guidelines, matching shapes, precision drawing

---

## Conclusion

Mirror Draw is **functionally correct** with excellent test coverage (28 tests). The implementation provides comprehensive symmetry training with 20 well-designed templates across 4 difficulty levels. The accuracy calculation algorithm is forgiving for children while still providing meaningful feedback.

**Audit Status:** APPROVED ✅
**All Tests:** PASSING ✅ (28/28)
**Documentation:** COMPLETE ✅
