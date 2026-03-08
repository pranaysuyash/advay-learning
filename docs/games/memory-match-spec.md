# Memory Match Game Specification

**Game ID:** `memory-match`
**World:** Learning
**Vibe:** Chill
**Age Range:** 4-10 years
**CV Requirements:** Hand tracking (optional)

---

## Overview

Memory Match is a classic card matching game where children flip cards to find matching pairs. The game uses computer vision for hand tracking or supports mouse clicks as input.

### Tagline
"Flip cards to find matching pairs! 🧠✨"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Cards** - Grid of face-down cards
2. **Flip Card 1** - Hover and pinch/click first card
3. **Flip Card 2** - Hover and pinch/click second card
4. **Check Match** - Symbols compared
   - **Match:** Cards stay face up, score points
   - **No Match:** Cards flip back over
5. **Repeat** - Continue until all pairs found

### Controls

| Action | Input |
|--------|-------|
| Flip card | Pinch (hand) or click (mouse) |
| Use hint | Click "💡 Hint" button |
| Start game | Select difficulty button |
| Back to menu | Click "Menu" button |

---

## Difficulty Levels

### 3 Difficulty Settings

| Level | Pairs | Grid | Time | Emoji | Description |
|-------|-------|------|------|-------|-------------|
| Easy | 6 | 3×4 | 90s | 🌱 | 6 pairs, 3×4 grid |
| Medium | 8 | 4×4 | 120s | 🌟 | 8 pairs, 4×4 grid |
| Hard | 10 | 4×5 | 150s | 🔥 | 10 pairs, 4×5 grid |

### Grid Layout

- **Easy (6 pairs):** 3 columns
- **Medium (8 pairs):** 4 columns
- **Hard (10 pairs):** 4 columns

---

## Card Symbols

### 12 Animal Emojis

| Emoji | Name | Emoji | Name |
|-------|------|-------|------|
| 🐶 | Dog | 🐵 | Monkey |
| 🐱 | Cat | 🐧 | Penguin |
| 🦊 | Fox | 🐢 | Turtle |
| 🐼 | Panda | 🐰 | Rabbit |
| 🐸 | Frog | 🦋 | Butterfly |
| 🦁 | Lion | 🐙 | Octopus |

### Card Data Structure

```typescript
interface MemoryCard {
  id: string;          // Unique identifier (symbol-index-a/b)
  symbol: string;      // Animal emoji
  isFlipped: boolean;  // Currently face up
  isMatched: boolean;  // Permanently face up
}
```

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| CARD_SIZE | 80-96px | Card dimensions (responsive) |
| FLIP_PAUSE_MS | 600 | Delay before hiding non-matching pair |
| STREAK_BASE_POINTS | 15 | Base score per match |
| STREAK_BONUS_PER | 3 | Bonus per streak level |
| MAX_STREAK_BONUS | 15 | Maximum streak bonus |
| STREAK_MILESTONE | 5 | Celebration interval |
| INITIAL_HINTS | 3 | Starting hint count |

---

## Scoring System

### Score Formula

```typescript
efficiency = Math.round((matches × 20) / moves);
timeBonus = Math.max(0, Math.floor(secondsLeft / 2));
score = matches × 12 + efficiency + timeBonus;
```

### Score Components

| Component | Formula | Description |
|-----------|---------|-------------|
| Base | matches × 12 | Points for each pair |
| Efficiency | (pairs × 20) / moves | Perfect play bonus |
| Time Bonus | seconds / 2 | Speed bonus |

### Example Scores

| Scenario | Matches | Moves | Time | Score |
|----------|---------|-------|------|-------|
| Perfect (easy) | 6 | 6 | 60 | 132 |
| Perfect (medium) | 8 | 8 | 90 | 201 |
| Good (easy) | 6 | 12 | 30 | 97 |
| Slow (easy) | 6 | 18 | 10 | 79 |

---

## Streak System

### Streak Calculation

Streak increments on each successful match, resets on miss.

### Scoring with Streak

```typescript
basePoints = 15;
streakBonus = Math.min(streak × 3, 15);
totalPoints = basePoints + streakBonus;
```

| Streak | Points | Running Total |
|--------|--------|---------------|
| 1 | 15 | 15 |
| 2 | 18 | 33 |
| 3 | 21 | 54 |
| 4 | 24 | 78 |
| 5 | 27 | 105 |
| 6+ | 30 | 135+ |

### Streak Milestones

Every 5 matches:
- Full-screen overlay shows
- "🔥 X Streak! 🔥" message
- Yellow/orange/pink gradient
- Haptic celebration
- 1.2 second display

---

## Hint System

### Usage

- **Starting Hints:** 3 per game
- **Activation:** Click "💡 Hint" button
- **Effect:** Highlights one matching pair card for 2 seconds
- **Visual:** Purple glow with scale animation

### Hint Behavior

1. Finds first unmatched, unflipped card
2. Locates its matching pair
3. Highlights matching card with purple glow
4. Clears highlight after 2 seconds
5. Decrements hint counter

---

## Visual Design

### UI Elements

- **Header Bar:** Shows moves, streak hearts, pairs found, timer
- **Card Grid:** Responsive grid layout by difficulty
- **Hint Button:** Purple with lightbulb emoji
- **Streak HUD:** 5 hearts (kenney platformer assets)
- **Score Popup:** Animated points on match
- **Milestone Overlay:** Celebration animation

### Card States

| State | Background | Border | Text |
|-------|------------|--------|------|
| Hidden | White | #F2CC8F (gold) | ? (brown, opacity 60%) |
| Hovered | Amber-50 | Amber-300 | ? |
| Flipped | Blue-50 | Blue-300 | Symbol |
| Matched | Emerald-50 | Emerald-300 | Symbol |
| Hint | Purple-100 | Purple-400 | Symbol |

### Match Particles

6 colorful particles burst from matched cards:
- Colors: Gold, Red, Teal, Blue, Green, Yellow
- 60° rotation each
- Ping animation (0.6s)

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Flip card | playFlip() | None |
| Match found | playSuccess() | 'success' |
| No match | playError() | 'error' |
| Streak milestone | None | 'celebration' |
| Game complete | playCelebration() | 'celebration' |
| Use hint | None | 'success' |

---

## TTS Features

| Situation | Message |
|-----------|---------|
| Start | "Find the matching pairs! You have X seconds." |
| Match | "Great match!" |
| Hint | "Here is a hint!" |
| Instructions | "Show your hand to the camera. Move over a card and pinch to flip it. Find matching pairs to win!" |

---

## Game States

### State Flow

```
Menu → Playing → (Complete OR Time's Up) → Results
                    ↓
                  Menu
```

### Completion Condition

Board is complete when all cards have `isMatched = true`.

---

## Difficulty Scaling

| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Pairs | 6 | 8 | 10 |
| Cards | 12 | 16 | 20 |
| Time | 90s | 120s | 150s |
| Grid | 3×4 | 4×4 | 4×5 |

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `MemoryMatch.tsx` | 791 | Main component with game loop |
| `memoryMatchLogic.ts` | 115 | Game logic and utilities |
| `memoryMatchLogic.test.ts` | 89 | Unit tests (8 tests) |

### Architecture

- **Component** (`MemoryMatch.tsx`): UI, hand tracking, game logic, state
- **Logic** (`memoryMatchLogic.ts`): Pure functions for deck, matching, scoring
- **Tests** (`memoryMatchLogic.test.ts`): Test coverage

---

## Educational Value

### Skills Developed

1. **Working Memory**
   - Card position tracking
   - Symbol recall
   - Focus and concentration

2. **Visual Recognition**
   - Symbol matching
   - Pattern recognition
   - Visual scanning

3. **Planning**
   - Strategic card selection
   - Turn-by-turn thinking
   - Spatial awareness

4. **Patience**
   - Taking time to remember
   - Not rushing guesses
   - Perseverance

5. **Counting**
   - Pair counting
   - Score tracking
   - Time awareness

---

## Comparison with Similar Games

| Feature | MemoryMatch | PatternPlay | ShapeSequence |
|---------|-------------|-------------|---------------|
| Core Mechanic | Flip pairs | Repeat patterns | Remember sequences |
| Educational Focus | Memory | Patterns | Memory |
| Age Range | 4-10 | 4-8 | 5-10 |
| Input Method | Hand/Click | Hand/Click | Hand/Click |
| Hint System | Yes (3) | No | No |
| Timer | Yes | No | No |
| Vibe | Chill | Chill | Chill |

---

## Test Coverage

### Test Suite: `memoryMatchLogic.test.ts`

**8 tests covering:**

*getPairsForDifficulty (1 test)*
*createShuffledDeck (2 tests)*
*match helpers (3 tests)*
*completion and score (2 tests)*

**All tests passing ✅ (8/8)**

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Memory Match',
  score,
  level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
  isPlaying: gameStarted && !completed,
  metaData: { moves, matches, difficulty }
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('memory-match');

// On board completion
await onGameComplete(score);
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
