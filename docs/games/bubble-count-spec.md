# Bubble Count Game Specification

**Game ID:** `bubble-count`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** None

---

## Overview

Bubble Count is an early math game where children count bubbles displayed in groups. Players see multiple groups of bubbles and must select the group that matches a target number.

### Tagline
"Count the bubbles! Which group has [X]?"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Groups** - Multiple bubble groups displayed
2. **Read Question** - "Which group has [X] bubbles?"
3. **Count Bubbles** - Count bubbles in each group
4. **Select Group** - Tap/click the correct group
5. **Get Feedback** - Instant feedback on correctness
6. **Continue** - Next round

### Controls

| Action | Input |
|--------|-------|
| Select group | Click/tap bubble group |
| Start game | Click "Start" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### 3 Levels

| Level | Groups | Min Count | Max Count | Description |
|-------|--------|-----------|-----------|-------------|
| 1 | 2 | 1 | 3 | Simple counting |
| 2 | 3 | 1 | 5 | More groups |
| 3 | 4 | 2 | 8 | Challenging counts |

---

## Scoring System

### Score Formula

```typescript
if (correct) {
  score = 100 + timeLeft × 5;
} else {
  score = 0;
}
```

### Score Examples

| Time Left | Correct | Score |
|-----------|---------|-------|
| 0 | Yes | 100 |
| 5 | Yes | 125 |
| 10 | Yes | 150 |
| Any | No | 0 |

### Max per Round

150 points (10 seconds bonus + 100 base)

---

## Bubble Groups

### Group Properties

```typescript
interface BubbleGroup {
  id: number;      // Unique identifier
  x: number;       // Horizontal position (0-100%)
  y: number;       // Vertical position (0-100%)
  count: number;   // Number of bubbles (1-8)
  radius: number;  // Visual size (15-31px)
}
```

### Positioning Algorithm

```typescript
for (i = 0; i < groupCount; i++) {
  row = floor(i / 2);
  col = i % 2;
  x = 25 + col × 50;   // 25% or 75% (2 columns)
  y = 30 + row × 35;   // 30%, 65%, 100% (rows)
  radius = 15 + count × 2;
}
```

### Example Layout (Level 2 - 3 groups)

```
  25%           75%
    ↓             ↓
[ 30% ] Group 0  Group 1
[ 65% ] Group 2
```

---

## Question Generation

### Algorithm

```typescript
validCounts = groups.map(g => g.count);
uniqueCounts = removeDuplicates(validCounts);
targetCount = random(uniqueCounts);
```

### Rules

- Target count must be one of the actual group counts
- Only counts within level range (minCount to maxCount)
- Randomly selected from valid unique counts

---

## Visual Design

### UI Elements

- **Question Banner:** "Which group has [X] bubbles?"
- **Bubble Groups:** Circular representations with count labels
- **Timer:** Countdown display
- **Score Display:** Current score
- **Round Counter:** "Round X / Y"

### Bubble Group Visual

| Element | Style |
|---------|-------|
| Shape | Circle |
| Border | Light blue stroke |
| Fill | Semi-transparent blue |
| Count label | Centered, large text |
| Size | 15-31px radius (based on count) |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select group | playClick() | None |
| Correct | playPop() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Groups per level | 2-4 | By difficulty |
| Min count | 1-2 | By difficulty |
| Max count | 3-8 | By difficulty |
| Base score | 100 | Points per correct answer |
| Time bonus | 5 per second | Bonus for speed |
| Time limit | ~30s | Per round |

---

## Data Structures

### Bubble Group

```typescript
interface BubbleGroup {
  id: number;
  x: number;
  y: number;
  count: number;
  radius: number;
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;
  groupCount: number;
  minCount: number;
  maxCount: number;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `BubbleCount.tsx` | ~ | Main component with game loop |
| `bubbleCountLogic.ts` | 77 | Group generation, scoring |
| `bubbleCountLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`BubbleCount.tsx`): UI, state, game loop, events
- **Logic** (`bubbleCountLogic.ts`): Group generation, validation, scoring
- **Tests** (`bubbleCountLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Counting Skills**
   - One-to-one correspondence
   - Number sequence
   - Counting small quantities

2. **Number Recognition**
   - Digit identification
   - Number-quantity matching
   - Understanding amounts

3. **Visual Discrimination**
   - Group comparison
   - Size differentiation
   - Visual counting

4. **Early Math**
   - Quantity concepts
   - Number sense
   - Comparison skills

5. **Decision Making**
   - Selecting correct option
   - Multiple choice reasoning
   - Confidence building

---

## Counting Principles Taught

1. **One-to-One** - Each bubble counted once
2. **Stable Order** - Count in consistent order
3. **Cardinality** - Last number is total count
4. **Number-Quantity** - Symbols represent amounts
5. **Visual Counting** - Seeing groups as quantities

---

## Comparison with Similar Games

| Feature | BubbleCount | CountingObjects | NumberTapTrail |
|---------|-------------|-----------------|----------------|
| Domain | Counting | Counting | Numbers |
| Age Range | 3-6 | 3-6 | 3-5 |
| Objects | Bubble groups | Individual items | Tap targets |
| Question | "Which has X?" | "How many?" | Tap in order |
| Answer | Select group | Type/select number | Tap sequence |
| Difficulty | 3 levels | 3 levels | 1 level |
| Visual | Groups | Scatter | Trail |
| Scoring | Time bonus | Streak bonus | Accuracy |
| Test Coverage | ~ tests | 60 tests | - |
| Vibe | Chill | Chill | Active |

---

## Example Gameplay

### Level 1 Example

```
Question: "Which group has 2 bubbles?"

  (3)    (2)
 ●●●    ●●

  (1)
 ●

Answer: Click the group with 2 bubbles
```

### Level 3 Example

```
Question: "Which group has 6 bubbles?"

  (4)      (6)
 ●●●●    ●●●●●●

  (8)      (3)
 ●●●●●●●●  ●●●

Answer: Click the group with 6 bubbles
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
