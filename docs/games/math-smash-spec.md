# Math Smash Game Specification

**Game ID:** `math-smash`
**World:** Number Jungle
**Vibe:** Educational
**Age Range:** 4-8 years
**CV Requirements:** Hand tracking, Pose detection

---

## Overview

Math Smash is an educational math game where children solve arithmetic problems and "smash" the correct answer block using hand gestures (pinch). The game features progressive difficulty levels, a streak/combo system for engagement, and voice instructions for accessibility.

### Tagline
"Solve math and smash the answer! 🔨"

---

## Game Mechanics

### Core Gameplay Loop

1. **Start Game** - Player presses "Start Smashing!" button
2. **Question Displayed** - Math problem appears (e.g., "3 + 2 = ?")
3. **Answer Blocks Spawn** - 4 stone blocks appear with different numbers
4. **Player Pinches** - Using hand tracking, player pinches the correct answer
5. **Feedback** - Success animation, score update, streak counter
6. **Next Round** - New question after 2-second delay
7. **Level Up** - After 5 correct answers, advance to next level
8. **Game Complete** - After finishing all 4 levels

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Hand position (index finger tracking) |
| Smash answer | Pinch gesture (thumb + index finger) |
| Pause | Hand lost detection |

---

## Level System

### Level Configuration

| Level | Max Number | Operator | Difficulty |
|-------|------------|----------|------------|
| 1 | 5 | Addition (+) | Easy - single digit sums |
| 2 | 10 | Addition (+) | Medium - larger sums |
| 3 | 10 | Subtraction (-) | Medium - no negative results |
| 4 | 20 | Addition (+) | Hard - larger numbers |

### Level Progression Rules

- **Rounds per level:** 5 rounds (rounds 0-4)
- **Advancement condition:** After 5th round, advance to next level
- **Game complete:** After finishing level 4

### Level 1: Easy Addition
- Numbers: 1-5
- Operator: Addition only
- Max answer: 10 (5 + 5)
- Target: Introduce basic addition

### Level 2: Medium Addition
- Numbers: 1-10
- Operator: Addition only
- Max answer: 20 (10 + 10)
- Target: Build fluency with larger sums

### Level 3: Subtraction
- Numbers: 1-10
- Operator: Subtraction
- Constraint: Never produces negative answers
- Target: Introduce subtraction concept

### Level 4: Hard Addition
- Numbers: 1-20
- Operator: Addition only
- Max answer: 40 (20 + 20)
- Target: Challenge with larger numbers

---

## Scoring System

### Base Points
- **Correct answer:** 10 points

### Streak Bonus
- **Formula:** `min(streak × 2, 15)`
- **Max bonus:** 15 points (at streak 8+)
- **Total per correct:** Up to 25 points

### Streak Progression

| Streak | Bonus | Total Points |
|--------|-------|--------------|
| 1 | 2 | 12 |
| 2 | 4 | 14 |
| 3 | 6 | 16 |
| 4 | 8 | 18 |
| 5 | 10 | 20 |
| 6 | 12 | 22 |
| 7 | 14 | 24 |
| 8+ | 15 | 25 |

### Streak Reset
- Streak resets to 0 on wrong answer
- Visual feedback: Streak counter disappears
- Audio feedback: "Oops! The answer is not X. Try again!"

---

## Answer Generation

### Question Generation Algorithm

```typescript
function generateQuestion(level: number): Question {
  const config = getLevelConfig(level);
  const num1 = random(1, config.maxNum);
  const num2 = random(1, config.maxNum);

  if (config.operator === '-') {
    // Ensure no negative answers
    if (num2 > num1) {
      operator = '+';
      answer = num1 + num2;
    } else {
      answer = num1 - num2;
    }
  } else {
    answer = num1 + num2;
  }

  return { num1, num2, operator, answer };
}
```

### Wrong Answer Generation

```typescript
function generateOptions(correctAnswer: number, count: number): number[] {
  const options = [correctAnswer];

  while (options.length < count) {
    const offset = random(1, 5);
    const sign = random() > 0.5 ? 1 : -1;
    const wrongAnswer = correctAnswer + offset * sign;

    if (wrongAnswer > 0) {
      options.add(wrongAnswer);
    }
  }

  return shuffle(options);
}
```

### Wrong Answer Properties
- Always positive (> 0)
- Within ±10 of correct answer
- No duplicates
- Randomly shuffled positions

---

## Visual Design

### Answer Blocks (Stone Blocks)

| Property | Value |
|----------|-------|
| Size | 140px |
| Shape | Rounded rectangle (2rem radius) |
| Color | Slate-700 background |
| Border | 8px slate-900 bottom border |
| Text | 5xl font-black white |
| Layout | 2×2 grid centered on screen |

### Question Display

| Property | Value |
|----------|-------|
| Position | Top-center, below HUD |
| Background | White with 4px red-400 border |
| Text Size | 6xl-7xl font-black |
| Format | "num1 operator num2 = ?" |
| Operator Color | Red-500 |

### HUD (Heads-Up Display)

| Element | Style |
|---------|-------|
| Container | White/95 backdrop-blur, rounded-2rem |
| Icon | 🔨 (hammer emoji, 5xl) |
| Level Text | "Level X" (2xl font-black) |
| Score Text | Red-600, lg font-bold |
| Streak Badge | Orange-100 bg, orange-300 border (when streak > 0) |

---

## Accessibility Features

### Voice Instructions

| Event | Voice Prompt |
|-------|--------------|
| Game start | "Pinch to smash the correct answer!" |
| Hand detected | "Hand detected!" (via GAME_INSTRUCTIONS.HAND_DETECTED) |
| Hand lost | "Hand lost!" (via GAME_INSTRUCTIONS.HAND_LOST) |
| Correct answer | "Smashing! You got it!" |
| Level up | "Awesome! Let's try harder math!" |
| Game complete | "You're a Math Master!" |
| Wrong answer | "Oops! The answer is not X. Try again!" |

### Hand Tracking Feedback

| State | Visual Indicator |
|-------|------------------|
| Hand detected | Camera thumbnail shows visible state |
| Hand lost | Pause overlay with mascot |
| Pinching | Cursor pulses and shows hammer icon |
| Cursor trail | Enabled for visual tracking |
| Magnetic snap | 100px threshold for easier targeting |

---

## Audio & Haptics

### Sound Effects

| Event | Sound |
|-------|-------|
| Button click | playClick() |
| Game start | playPop() |
| Correct answer | playSuccess() |
| Wrong answer | playError() |

### Haptic Feedback

| Event | Pattern |
|-------|---------|
| Correct answer | 'success' haptic |
| Wrong answer | 'error' haptic |

---

## Animations

### Success Animation
- **Type:** Confetti
- **Duration:** 1500ms
- **Message:** "Smashing!"

### Score Popup
- **Initial:** opacity 0, scale 0.5
- **Animate:** opacity 1, scale 1.2, y -50px
- **Duration:** 500ms
- **Position:** Center-top (50%, 30%)

### Streak Milestone
- **Trigger:** Every 5 streaks (implied from code)
- **Animation:** Rotate from -20deg to 0, scale 0.3 → 1.2
- **Message:** "🔥 X STREAK! 🔥"
- **Subtext:** "Keep it up!"
- **Background:** Orange-400 to Red-500 gradient

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| gameStarted | boolean | Whether game is active |
| currentLevel | number | Current level (0-3 index) |
| round | number | Current round (0-4) |
| score | number | Total score |
| correct | number | Number of correct answers |
| streak | number | Current streak count |
| question | Question \| null | Current math problem |
| targets | Target[] | Answer block objects |
| cursorPosition | {x, y} | Hand cursor position |
| isPinching | boolean | Pinch gesture state |
| isHandDetected | boolean | Hand visibility state |

---

## Technical Implementation

### Dependencies

```typescript
// Game logic
import { LEVELS, generateQuestion, generateOptions } from '../games/mathSmashLogic';

// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';

// Audio
import { useAudio } from '../utils/hooks/useAudio';

// Streak tracking
import { useStreakTracking } from '../hooks/useStreakTracking';

// Voice instructions
import { useVoiceInstructions } from '../components/game/VoiceInstructions';

// UI components
import { TargetSystem } from '../components/game/TargetSystem';
import { GameCursor } from '../components/game/GameCursor';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
```

### Key Hooks Used

| Hook | Purpose |
|------|---------|
| useGameDrops | Track completions for item drops |
| useGameSessionProgress | Send progress data to analytics |
| useGameHandTracking | Hand tracking with pinch detection |
| useStreakTracking | Manage streak counter and bonuses |
| useVoiceInstructions | Text-to-speech feedback |
| useWindowSize | Responsive positioning |

---

## End Behavior

### Level Completion
- After 5 rounds (round index 4):
  - If not at max level: Advance to next level, reset round to 0
  - Voice: "Awesome! Let's try harder math!"

### Game Completion
- After completing level 4:
  - Show completion message
  - Trigger `onGameComplete(correct + 1)` for drops
  - Voice: "You're a Math Master!"
  - Return to start screen

---

## Ticket References

| Ticket | Description | Status |
|--------|-------------|--------|
| GQ-002 | Game subscription hooks | ✅ Implemented |
| GQ-003 | Game progress tracking | ✅ Implemented |
| GQ-004 | Quality/UX standards | ✅ Implemented |
| GQ-005 | Accessibility features | ✅ Implemented |
| GQ-007 | Engagement features | ✅ Implemented (streak system) |

---

## Future Enhancements

### Potential Additions
- **Multiplication levels** - For older children (ages 7-8)
- **Division levels** - Advanced math concepts
- **Infinite play mode** - Randomized difficulty after level 4
- **Time attack mode** - Race against timer
- **Two-player mode** - Competitive smashing
- **More operators** - Mix of +, -, ×, ÷

---

## Test Coverage

### Test Suite: `mathSmashLogic.test.ts`

**25 tests covering:**
- Level configuration (5 tests)
- Question generation (9 tests)
- Option generation (9 tests)
- Integration tests (2 tests)

**All tests passing ✅**

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
