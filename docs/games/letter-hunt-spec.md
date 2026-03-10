# Letter Hunt Game Specification

**Game ID:** `letter-hunt`
**Age Range:** 4-8
**CV Required:** Hand (pinch)
**Vibe:** Active

---

## Overview

Letter Hunt is an active letter recognition game where children find and select a target letter from a grid of options using hand tracking. Players use their index finger to control a cursor and pinch (thumb + index) to select letters, with faster answers earning more points.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Hand tracking with index finger cursor |
| Selection | Pinch gesture (thumb + index finger) |
| Fallback | Mouse/touch controls with dwell option |

### Game Loop

1. **Target Display:** A target letter appears at the top with its example word
2. **Letter Grid:** 5 letter options display at the bottom (1 correct, 4 distractors)
3. **Timer:** 60-second countdown per round
4. **Selection:** Player points to a letter and pinches to select
5. **Feedback:** Immediate success/error feedback
6. **Next Round:** After 1.5 second delay

---

## Levels & Progression

| Level | Rounds | Letters | Difficulty |
|-------|--------|---------|------------|
| 1 | 10 | Alphabet subset | Introduction |
| 2 | 10 | More variety | Increased challenge |
| 3 | 10 | Full alphabet | Mastery |

### Completion

- Complete all 10 rounds to advance to next level
- Complete Level 3 to finish the game
- Rounds advance regardless of correct/incorrect (feedback only)

---

## Scoring System

### Score Formula

```typescript
basePoints = timeLeft × 5;
streakBonus = Math.min(streak × 3, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Time Left | Streak | Base | Bonus | Total |
|-----------|--------|------|-------|-------|
| 60s | 0 | 300 | 0 | 300 |
| 45s | 2 | 225 | 6 | 231 |
| 30s | 5 | 150 | 15 | 165 |
| 10s | 10 | 50 | 15 | 65 |

### Max Score per Round

315 points (300 base + 15 bonus)

---

## Streak System

### Streak Building

- Correct answer: streak + 1
- Wrong answer: streak resets to 0
- Timeout: streak resets to 0

### Streak Milestones

- Every **5 consecutive correct answers** - Show celebration overlay
- Duration: 1500ms
- Includes haptic feedback

### Visual Feedback

- Heart HUD shows filled hearts for every 2 streak
- Streak counter displays current streak

---

## Multi-Language Support

Uses `getAlphabet()` from `data/alphabets.ts`:

| Language | Letters | Script Type |
|----------|---------|-------------|
| English (en) | 26 | Latin |
| Hindi (hi) | 36 | Devanagari |
| Kannada (kn) | 43 | Kannada |
| Telugu (te) | 42 | Telugu |
| Tamil (ta) | 247 | Tamil |

Each letter includes:
- Character (e.g., "A", "अ", "ಅ")
- Example word (e.g., "Apple", "अनार", "ಅಪ್ಪೆ")
- Display color
- Optional transliteration and pronunciation

---

## Letter Data Structure

```typescript
interface LetterOption {
  id: number;
  char: string;           // The letter character
  name: string;          // Example word
  color: string;         // Display color
  isTarget: boolean;     // True for correct answer
}
```

---

## Visual Design

### UI Elements

- **Target Display:** Large letter with example word at top
- **Score Panel:** Current score, level, round counter
- **Heart HUD:** 5 hearts filling every 2 streak
- **Letter Grid:** 5 cards at bottom with letter + name
- **Cursor:** Hand/finger cursor with pinch indicator
- **Feedback Overlay:** Success/error messages

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Cream (#FFF8F0) |
| Border | Gold (#F2CC8F) |
| Correct | Green (#10B981) |
| Wrong | Red |
| Target | Letter-specific colors |

### Letter Colors

17 predefined color classes mapped to hex values:
- #ef4444 (red), #3b82f6 (blue), #f59e0b (orange)
- #10b981 (green), #8b5cf6 (purple), #06b6d4 (cyan)
- And more...

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | TTS: "Let's hunt for letters!" | None |
| Letter appears | TTS: "Find the letter X!" | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Streak milestone | playCelebration() | 'celebration' |
| Level complete | playFanfare() + TTS | None |
| Game complete | playFanfare() + TTS | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Let's hunt for letters! Show me your hand!" |
| Target shown | "Find the letter {X}!" |
| Correct | "Correct! Great job!" |
| Wrong | "Try again! Find the letter {X}!" |
| Level complete (1-2) | "Level complete! Next level!" |
| All complete | "You finished all levels! You're a letter expert!" |

---

## Game Constants

```typescript
const TIMER_DURATION = 60;              // 60 seconds per round
const TOTAL_ROUNDS = 10;                 // Rounds per level
const BASE_POINTS_PER_SECOND = 5;        // Points per second remaining
const STREAK_BONUS_PER_STREAK = 3;       // Bonus per streak
const MAX_STREAK_BONUS = 15;             // Max bonus
const STREAK_MILESTONE_INTERVAL = 5;     // Celebrate every 5
const STREAK_MILESTONE_DURATION_MS = 1500;
const FEEDBACK_DELAY_MS = 1500;          // Delay before next round
const PINCH_DEBOUNCE_MS = 450;           // Min time between selections
const HEARTS_PER_MILESTONE = 2;          // Fill a heart every 2 streak
```

---

## Easter Eggs

| Achievement | Trigger |
|-------------|---------|
| egg-treasure-hunter | Find 8 correct letters |

---

## Fallback Controls

When mouse fallback is enabled:

| Feature | Settings |
|---------|----------|
| Dwell time | 400ms |
| Snap radius | 32px |
| Snap targets | All 5 letter options |
| Selection | Auto-select after dwell |

---

## Technical Details

### Hand Tracking

- **Target FPS:** 30
- **Detection:** Index finger tip for cursor
- **Pinch detection:** Thumb + index proximity
- **Debounce:** 450ms minimum between selections

### Hit Testing

- Uses `hitTestRects()` utility for cursor-to-option collision
- Normalized coordinates (0-1) mapped to screen

---

## Comparison with Similar Games

| Feature | LetterHunt | AlphabetTracing | WordBuilder |
|---------|------------|-----------------|-------------|
| CV Required | Hand (pinch) | Hand (pinch) - optional | Hand (pinch) |
| Core Mechanic | Find target letter | Trace letter outline | Build words |
| Educational Focus | Letter recognition | Letter formation | Spelling |
| Time Limit | 60s/round | None | None |
| Scoring | Time-based | Accuracy-based | Word-based |
| Age Range | 4-8 | 3-8 | 5-8 |
| Multi-Language | 5 languages | 5 languages | 1 |

---

## Educational Value

### Skills Developed

1. **Letter Recognition** - Quick letter identification, character discrimination
2. **Visual Scanning** - Finding target among distractors, visual attention
3. **Hand-Eye Coordination** - Pointing accuracy, pinch gesture control
4. **Vocabulary** - Letter-word associations, example words
5. **Time Management** - Working under time pressure, quick decision-making
6. **Multi-Language Literacy** - Support for 5 alphabets

---

## Accessibility

- **Voice Instructions:** TTS announcements for all game events
- **Visual Feedback:** Clear success/error indicators
- **Fallback Controls:** Mouse/touch support with dwell
- **Adjustable Difficulty:** 3 levels with progression
- **Color Coding:** Letter-specific colors for visual distinction
