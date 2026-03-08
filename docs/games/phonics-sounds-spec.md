# Phonics Sounds Game Specification

**Game ID:** `phonics-sounds`
**World:** Arcade
**Vibe:** Chill
**Age Range:** 4-8 years
**CV Requirements:** Hand tracking (pinch detection)

---

## Overview

Phonics Sounds is an educational game where children listen to a letter sound and pinch the correct letter card from multiple options. The game teaches phonics (letter-sound correspondence) through 3 levels covering consonants, vowels, and blends.

### Tagline
"Listen to the sound, then pinch the right letter! 🔤🔊"

---

## Game Mechanics

### Core Gameplay Loop

1. **Start Game** - Press "Start Phonics!" button
2. **Hear Sound** - TTS speaks the phoneme sound
3. **See Options** - 3-4 letter cards appear on screen
4. **Move Hand** - Child moves hand to position cursor
5. **Pinch to Select** - Child pinches when cursor is over target
6. **Get Feedback** - Correct = example word shown, Wrong = "Listen again!"
7. **Next Round** - After delay, new sound and letters appear
8. **Level Complete** - After completing rounds with threshold correct
9. **Advance** - Next level or game complete

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Move hand (index finger tip tracked) |
| Select letter | Pinch when cursor is over target |
| Repeat sound | Click "🔊 Repeat" button |
| Start/Restart | Click "Start/Restart" button |
| Home | Click "Home" button |

---

## Levels

### Level Configuration

```typescript
interface PhonicsLevelConfig {
  level: number;
  optionCount: number;    // Number of letter cards to display
  roundCount: number;      // Rounds before level check
  timePerRound: number;   // Seconds per round
  passThreshold: number;  // Correct answers needed to pass
}
```

### Three Levels

| Level | Option Count | Rounds | Time/Round | Pass Threshold | Phoneme Types |
|-------|--------------|--------|------------|----------------|---------------|
| 1 | 3 | 8 | 20s | 5/8 | 15 consonants |
| 2 | 4 | 8 | 15s | 6/8 | 5 vowels |
| 3 | 4 | 8 | 15s | 6/8 | 7 blends |

---

## Phonemes

### Consonants (Level 1)

| Letter | Sound | Example Word | Emoji |
|--------|-------|-------------|-------|
| B | buh | Ball | 🏐 |
| C | kuh | Cat | 🐱 |
| D | duh | Dog | 🐕 |
| F | fuh | Fish | 🐟 |
| G | guh | Goat | 🐐 |
| H | huh | Hat | 🎩 |
| J | juh | Jam | 🫙 |
| K | kuh | Kite | 🪁 |
| L | luh | Lion | 🦁 |
| M | muh | Moon | 🌙 |
| N | nuh | Nest | 🪺 |
| P | puh | Pig | 🐷 |
| R | ruh | Rain | 🌧️ |
| S | sss | Sun | ☀️ |
| T | tuh | Tree | 🌳 |

### Vowels (Level 2)

| Letter | Sound | Example Word | Emoji |
|--------|-------|-------------|-------|
| A | ah | Apple | 🍎 |
| E | eh | Egg | 🥚 |
| I | ih | Igloo | 🏠 |
| O | oh | Octopus | 🐙 |
| U | uh | Umbrella | ☂️ |

### Blends (Level 3)

| Letters | Sound | Example Word | Emoji |
|---------|-------|-------------|-------|
| BL | bluh | Block | 🧱 |
| BR | bruh | Brush | 🖌️ |
| CL | cluh | Clock | 🕐 |
| CR | cruh | Crab | 🦀 |
| DR | druh | Drum | 🥁 |
| FL | fluh | Flag | 🏴 |
| FR | fruh | Frog | 🐸 |
| GR | gruh | Grape | 🍇 |

---

## Round Building

### Algorithm

```typescript
function buildPhonicsRound(level: number, usedLetters: string[]): PhonicsRound {
  // 1. Get phoneme pool for level
  // 2. Pick target phoneme (preferring unused letters)
  // 3. Pick distractors (different letters from target)
  4. Shuffle all phonemes
  // 5. Place at spaced positions
  // 6. Return round configuration
}
```

### Target Selection

- **Prefer unused letters** - Avoids repeating recently used
- **Fallback to full pool** - If all letters used, pick randomly
- **One correct answer** - Target phoneme marked with `isCorrect: true`
- **Rest are distractors** - Wrong letters

### Positioning

- Uses `pickSpacedPoints()` utility
- **Padding:** 0.22 (from edges)
- **Spacing:** 0.16 (minimum distance)
- **Random seed:** Injected for testability

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10; // per correct answer
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 2 | 12 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 (capped) |

---

## Streak System

### Visual Display

- Streak badge in top-center when streak > 0
- Orange badge with "🔥 X streak!" text

### Streak Milestone

- Every 5 consecutive correct answers
- Shows "🔥 {streak} STREAK! 🔥" overlay
- Plays celebration haptic
- Shows celebration overlay

### Streak Reset

- Resets to 0 on wrong answer
- Visual feedback via error sound and haptic

---

## Hit Detection

### Algorithm

Uses `isPointInCircle()` from `targetPracticeLogic.ts`:

```typescript
const hit = activeTargets.find((t) =>
  isPointInCircle(tip, { x: t.x, y: t.y }, HIT_RADIUS)
);
```

### Hit Radius

- **Radius:** 0.12 (12% of screen dimension)
- Measured from finger tip to card center
- Uses circle collision detection

---

## Visual Design

### Letter Cards

- **Size:** 130px × 130px
- **Border:** 6px
- **Border Radius:** 2.5rem
- **Font:** 6xl (text-6xl)
- **Shadow:** 4px shadow with E5B86E

### Card Colors

8 colors for visual variety:
- #FF6B6B (red), #4ECDC4 (teal), #45B7D1 (blue), #96CEB4 (green)
- #FFEAA7 (orange), #DDA0DD (purple), #98D8C8 (mint), #F7DC6F (yellow)

### Target Display

- **Sound Display:** Large text with phoneme sound
- **Round Info:** "R1/8" (Round 1 of 8)
- **Repeat Button:** 🔊 icon to replay sound

### Example Popup

- **Position:** Bottom center
- **Style:** Emerald background with green border
- **Content:** "A = Apple 🍎"

---

## Audio & TTS

| Event | Audio | TTS |
|-------|-------|-----|
| Game start | playPop() | None |
| Correct answer | playSuccess(), playPop() | "Yes! {letter} as in {word}!" |
| Wrong answer | playError() (×2) | "That's {sound}. Try again!" |
| Level complete | playCelebration(), playLevelUp() | "Level complete! Great job!" |
| All complete | playCelebration() | "Congratulations! You are a phonics pro!" |
| Streak milestone | playCelebration() | "Amazing streak! Keep going!" |

### TTS Voice

- **Initial instruction:** "Listen to the sound. Find the matching letter."
- **Target phoneme:** "{letter}! Like in {word}!"
- **Repeat:** Same as target phoneme
- **Wrong answer:** "That's {sound}. Try again!"

---

## Easter Eggs

### Vowel Master

| Property | Value |
|----------|-------|
| ID | `egg-vowel-master` |
| Trigger | Collect all 5 unique vowels (A, E, I, O, U) |
| Effect | Triggers item drop system |

### Implementation

```typescript
const vowels = ['A', 'E', 'I', 'O', 'U'];
if (vowels.includes(hit.phoneme.letter.toUpperCase())) {
  correctVowelsRef.current.add(hit.phoneme.letter.toUpperCase());
  if (correctVowelsRef.current.size >= 5) {
    triggerEasterEgg('egg-vowel-master');
  }
}
```

---

## Progress Tracking

### Integration with useGameDrops

```typescript
await onGameComplete(finalScore);
```

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| gameCompleted | boolean | Whether all levels finished |
| score | number | Total accumulated score |
| streak | number | Current consecutive correct answers |
| level | number | Current level (1-3) |
| round | number | Current round (1-roundCount) |
| targets | PhonicsTarget[] | Letter cards on screen |
| targetPhoneme | Phoneme \| null | Current target sound to match |
| cursor | Point \| null | Current finger tip position |
| feedback | string | Current feedback message |
| correctCount | number | Correct answers in current level |
| usedLetters | string[] | Letters used in current level |

---

## Technical Implementation

### Dependencies

```typescript
// Game logic
import {
  LEVELS,
  buildPhonicsRound,
  getPhonemesForLevel,
  type PhonicsTarget,
  type Phoneme,
} from '../games/phonicsSoundsLogic';

// Shared utilities
import { pickSpacedPoints } from '../games/targetPracticeLogic';
import { isPointInCircle } from '../games/targetPracticeLogic';

// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

// Audio & TTS
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

// UI components
import { GameContainer } from '../components/GameContainer';
import { GameCursor } from '../components/game/GameCursor';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
```

### Key Constants

```typescript
const HIT_RADIUS = 0.12; // Hit radius (normalized)
const MAX_LEVEL = 3; // Maximum level
const CARD_COLORS = [/* 8 colors */]; // Visual variety
```

---

## Accessibility Features

### Visual Cues
- Large letter cards (130px)
- 8 distinct colors for visual variety
- Clear sound display with quotes
- Example word popup with emoji
- Round indicator (R1/8)

### Audio Cues
- TTS speaks the phoneme sound
- Sound plays for each letter sound
- Repeat button to hear sound again

### Motor Assistance
- Large hit radius (12% of screen)
- No time pressure (relaxed timer)
- TTS voice instructions
- Can repeat sound anytime

---

## Test Coverage

### Test Suite: `phonicsSoundsLogic.test.ts`

**Tests covering:**
- Level configurations (4 tests)
- Phoneme data (4 tests)
- Round building (5 tests)
- Target selection (2 tests)
- Positioning (2 tests)
| Hit detection (3 tests)
| Scoring (3 tests)
| Streak system (2 tests)
| Level progression (3 tests)
| Edge cases (4 tests)

---

## Comparison with Similar Games

| Feature | PhonicsSounds | LetterCatcher | NumberTapTrail |
|---------|---------------|---------------|----------------|
| CV Required | Hand (pinch) | None (mouse) | Hand (pinch) |
| Core Mechanic | Match sound to letter | Catch falling letter | Pinch in sequence |
| Educational Focus | Phonics (letter-sound) | Letter recognition | Number sequencing |
| Levels | 3 (consonants/vowels/blends) | 3 (speed) | 6 (1-10) |
| Input Options | 3-4 cards per round | Falling letters | All numbers 1-10 |
| Time Pressure | Relaxed (15-20s/round) | None | Relaxed (90s) |
| Streak System | Yes | Yes | Yes |
| Age Range | 4-8 | 3-6 | 3-6 |
| Vibe | Chill | Active | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
