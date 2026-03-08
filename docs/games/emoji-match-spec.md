# Emoji Match Game Specification

**Game ID:** `emoji-match`
**World:** Discovery
**Vibe:** Chill
**Age Range:** 5-10 years
**CV Requirements:** Yes (Hand Tracking)

---

## Overview

Emoji Match is an emotional intelligence game where children identify and match emotions by selecting the correct emoji. Players see a target emotion name and must find and pinch the matching emoji on screen.

### Tagline
"Find the feeling! Match the emotions! 😊"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Target** - Emotion name displayed at top (e.g., "Find Happy")
2. **Scan Emojis** - Look at arranged emoji options on screen
3. **Move Cursor** - Use hand to move cursor to target emoji
4. **Pinch to Select** - Pinch fingers when cursor is on correct emoji
5. **Get Feedback** - Instant feedback on correctness
6. **Continue** - 10 rounds per level, 3 levels

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Hand tracking - index finger |
| Select emoji | Pinch gesture |
| Start game | Pinch "Start" button |
| Pause | Pause button or hand loss |
| Resume | Pinch or tap Resume |

---

## Difficulty Levels

### 3 Levels

| Level | Options | Time | Target Count | Description |
|-------|---------|------|--------------|-------------|
| 1 | 2 emotions | 60s | 2 per round | Simple emotions |
| 2 | 3 emotions | 60s | 3 per round | More variety |
| 3 | 4 emotions | 60s | 4 per round | Full challenge |

### Adaptive Difficulty

- If 3+ misses: Reduces option count by 1
- If 3+ misses: Adds +10 seconds to timer

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 3, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Bonus | Total |
|--------|-------|-------|
| 0 | 0 | 10 |
| 1 | 3 | 13 |
| 2 | 6 | 16 |
| 3 | 9 | 19 |
| 4 | 12 | 22 |
| 5+ | 15 | 25 |

### Max per Round

25 points (10 base + 15 bonus)

### Penalties

- Missed pinch: Streak resets, miss count increases
- Timeout: Streak resets, miss count increases

---

## Emotions

### 8 Emotions

| Emotion | Emoji | Color | Description |
|---------|-------|-------|-------------|
| Happy | 😊 | #FFD700 | Joyful, cheerful |
| Sad | 😢 | #4FC3F7 | Unhappy, down |
| Angry | 😠 | #EF5350 | Mad, furious |
| Surprised | 😲 | #FF9800 | Shocked, amazed |
| Scared | 😨 | #CE93D8 | Frightened, afraid |
| Silly | 🤪 | #66BB6A | Playful, goofy |
| Sleepy | 😴 | #90CAF9 | Tired, drowsy |
| Love | 🥰 | #F48FB1 | Affectionate, caring |

---

## Round Generation

### Algorithm

```typescript
// Pick random subset of emotions
shuffled = shuffle(EMOTIONS);
picked = shuffled.slice(0, optionCount);

// Generate spaced positions
points = pickSpacedPoints(optionCount, 0.26, 0.18, random);

// Create targets with positions
targets = picked.map((emotion, index) => ({
  ...emotion,
  id: index,
  position: points[index].position,
}));

// Select correct answer
correctId = random(0, targets.length - 1);
```

### Position Spacing

- Emojis spaced to avoid overlap
- Adaptive positioning based on option count
- Grid-like distribution

---

## Visual Design

### UI Elements

- **Target Display:** Top-left shows emotion to find
- **Emojis:** Large circular emoji targets (22vw × 22vw)
- **Cursor:** Yellow finger cursor with pinch indicator
- **Timer:** Top-right shows "Take your time!" / "Almost there!"
- **Progress:** Dots showing completed rounds
- **Feedback:** Center banner shows result message

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Discovery cream |
| Target border | Each emotion has unique color |
| Hit effect | Green glow |
| Miss effect | Red glow |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Correct | playPop() | 'success' |
| Wrong | playError() | 'error' |
| Complete level | playCelebration() | 'celebration' |
| Streak milestone | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Rounds per level | 10 | Total rounds per level |
| Max levels | 3 | Level progression |
| Round time | 60s | Base time per round |
| Adaptive time bonus | +10s | Added when struggling |
| Hit radius | 0.22 | Base hit detection radius |
| Adaptive hit bonus | +0.08 | Added when struggling |
| Snap radius | 0.1 | Cursor snap distance |

---

## Tutorial Steps

| Step | Icon | Instruction |
|------|------|-------------|
| 1 | hand | Show your hand |
| 2 | target | Move the dot to the matching emoji |
| 3 | circle | Pinch when you are on the right emoji |

---

## Data Structures

### Emotion

```typescript
interface Emotion {
  name: string;      // 'Happy', 'Sad', etc.
  emoji: string;     // 😊, 😢, etc.
  color: string;     // Hex color code
}
```

### Emotion Target

```typescript
interface EmotionTarget extends Emotion {
  id: number;        // Unique identifier
  position: Point;   // Normalized {x, y}
}
```

### Round Result

```typescript
interface RoundResult {
  targets: EmotionTarget[];  // All emotion options
  correctId: number;         // Index of correct answer
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `EmojiMatch.tsx` | 976 | Main component with CV, game loop |
| `emojiMatchLogic.ts` | 43 | Game logic and utilities |
| `emojiMatchLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`EmojiMatch.tsx`): CV tracking, UI, state, events
- **Logic** (`emojiMatchLogic.ts`): Round generation, position calculation
- **Tests** (`emojiMatchLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Emotional Intelligence**
   - Emotion recognition
   - Empathy building
   - Emotional vocabulary

2. **Visual Scanning**
   - Finding targets among options
   - Visual discrimination
   - Attention to detail

3. **Social Skills**
   - Understanding feelings
   - Recognizing expressions
   - Emotional awareness

4. **Fine Motor Skills**
   - Hand-eye coordination
   - Pinching precision
   - Controlled movement

5. **Language Development**
   - Emotion vocabulary
   - Descriptive words
   - Social-emotional concepts

---

## Comparison with Similar Games

| Feature | EmojiMatch | ColorMatchGarden | ShapePop |
|---------|------------|------------------|----------|
| Domain | Emotions | Colors | Shapes |
| CV Required | Yes | Yes | Yes |
| Age Range | 5-10 | 3-8 | 3-6 |
| Levels | 3 | 1 | 1 |
| Rounds per level | 10 | 5 | 5 |
| Vibe | Chill | Chill | Chill |

---

## Easter Eggs

| Achievement | Condition | Egg |
|-------------|-----------|-----|
| Emotion Master | Complete with 0 misses | egg-emotion-master |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
