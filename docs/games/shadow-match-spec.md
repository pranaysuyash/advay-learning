# Shadow Match Game Specification

**Game ID:** `shadow-match`
**World:** Discovery
**Vibe:** Chill
**Age Range:** 3-5 years
**CV Requirements:** None

---

## Overview

Shadow Match is a visual recognition game where children match objects to their silhouettes. Players see a shadow silhouette and must select the matching object from three options.

### Tagline
"Match the shadow! Find the object! 👻"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Shadow** - Black silhouette displayed at top
2. **Scan Options** - Three colorful objects shown below
3. **Select Match** - Tap the object that matches the shadow
4. **Get Feedback** - Instant feedback on correctness
5. **Continue** - Continue until session ends

### Controls

| Action | Input |
|--------|-------|
| Select object | Click/tap object button |
| Start game | Click "Start Matching" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### Single Difficulty

| Property | Value |
|----------|-------|
| Options per round | 3 |
| Target avoidance | Prevents recent repeats |

### Target Selection

- Tracks used target IDs
- Prefers unused targets
- Cycles back when all exhausted

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Bonus | Total |
|--------|-------|-------|
| 0 | 0 | 10 |
| 1 | 2 | 12 |
| 2 | 4 | 14 |
| 3 | 6 | 16 |
| 5+ | 15 | 25 |

### Max per Round

25 points (10 base + 15 bonus)

### Penalties

- Wrong answer: Streak resets to 0

---

## Shadow Pairs

### 8 Pairs

| Object | ID | Emoji | Description |
|--------|-----|-------|-------------|
| Cat | cat | 🐱 | House pet |
| Car | car | 🚗 | Vehicle |
| Tree | tree | 🌳 | Nature |
| House | house | 🏠 | Building |
| Fish | fish | 🐟 | Water animal |
| Star | star | ⭐ | Celestial |
| Ball | ball | ⚽ | Toy |
| Boat | boat | ⛵ | Water vehicle |

---

## Round Generation

### Algorithm

```typescript
// 1. Filter unused targets (or all if all used)
unused = SHADOW_PAIRS.filter(p => !usedTargetIds.includes(p.id));
source = unused.length > 0 ? unused : SHADOW_PAIRS;

// 2. Select target
target = source[random(0, source.length - 1)];

// 3. Pick 2 distractors
distractors = shuffle(
  SHADOW_PAIRS.filter(p => p.id !== target.id)
).slice(0, 2);

// 4. Shuffle and create options
options = shuffle([target, ...distractors]);

return {
  target,
  options,
};
```

### Round Structure

```typescript
interface ShadowMatchRound {
  target: ShadowMatchPair;      // The shadow to match
  options: ShadowMatchPair[];   // 3 shuffled options including target
}
```

---

## Visual Design

### UI Elements

- **Shadow Display**: Black silhouette at top (large)
- **Options Grid**: 3 circular emoji buttons
- **Progress Indicator**: Round counter
- **Streak Indicator**: Fire emoji 🔥 with count
- **Feedback Bar**: Shows result message

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Discovery cream |
| Shadow | Black silhouette |
| Correct hit | Green glow |
| Wrong hit | Red glow |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select answer | playClick() | None |
| Correct | playPop() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |
| Streak milestone | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Rounds per session | ∞ | Continuous play |
| Base points | 10 | Points per correct match |
| Streak bonus per | 2 | Points per streak level |
| Max streak bonus | 15 | Cap on streak bonus |
| Options per round | 3 | Fixed at 3 options |
| Total shadow pairs | 8 | All available objects |

---

## Data Structures

### Shadow Match Pair

```typescript
interface ShadowMatchPair {
  id: string;           // 'cat', 'car', etc.
  objectName: string;   // 'Cat', 'Car', etc.
  objectEmoji: string;  // 🐱, 🚗, etc.
}
```

### Shadow Match Round

```typescript
interface ShadowMatchRound {
  target: ShadowMatchPair;      // Object to find
  options: ShadowMatchPair[];   // 3 shuffled options
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `ShadowMatch.tsx` | ~ | Main component with game loop |
| `shadowMatchLogic.ts` | 57 | Round generation, validation |
| `shadowMatchLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`ShadowMatch.tsx`): UI, state, game loop, events
- **Logic** (`shadowMatchLogic.ts`): Pure functions for rounds, validation
- **Tests** (`shadowMatchLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Visual Discrimination**
   - Shape recognition
   - Silhouette matching
   - Object identification

2. **Observation Skills**
   - Detail attention
   - Pattern recognition
   - Visual scanning

3. **Object Recognition**
   - Common objects
   - Animal identification
   - Vehicle knowledge

4. **Cognitive Skills**
   - Matching skills
   - Visual memory
   - Decision making

5. **Early Learning**
   - Object permanence
   - categorization
   - Comparison skills

---

## Comparison with Similar Games

| Feature | ShadowMatch | SizeSorting | ShapePop |
|---------|-------------|-------------|----------|
| Domain | Visual | Size | Shapes |
| Age Range | 3-5 | 3-6 | 3-6 |
| CV Required | No | No | Yes |
| Rounds | Continuous | Continuous | 5 |
| Content | Objects | Size ordering | Shapes |

---

## Easter Eggs

| Achievement | Condition | Egg |
|-------------|-----------|-----|
| Shadow Master | Complete with 90%+ accuracy | egg-shadow-master |
| Perfect Match | Complete 10 in a row | egg-perfect-match |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
