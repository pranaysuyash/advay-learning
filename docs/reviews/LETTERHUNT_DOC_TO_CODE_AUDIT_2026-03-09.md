# Letter Hunt - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `letter-hunt`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `src/frontend/src/pages/LetterHunt.tsx` (844 lines)
- Spec: `docs/games/letter-hunt-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Letter Hunt is an active letter recognition game where children find and select a target letter from a grid of options using hand tracking. The implementation includes 60-second rounds, time-based scoring, streak bonuses, and multi-language alphabet support for 5 languages.

### Test Coverage

- **No dedicated logic file** - All logic embedded in component
- **No dedicated test file** - Testing manual/explored through code review
- **Tests should cover:** Round generation, scoring calculation, streak system, multi-language alphabet loading

---

## Implementation Quality Assessment

### Strengths

1. **Multi-language support** - 5 languages via getAlphabet() (English, Hindi, Kannada, Telugu, Tamil)
2. **Time-based scoring** - Rewards faster answers (timeLeft × 5)
3. **Streak system** - Build up to 5 for milestone celebrations
4. **Fallback controls** - Mouse/touch support with dwell and snap
5. **TTS integration** - Voice instructions for all game events
6. **Feature flag support** - Controls fallback via `controls.fallbackV1`
7. **Hand tracking optimization** - 30 FPS target, debounced pinch (450ms)
8. **Easter egg** - Treasure hunter achievement after 8 correct

### Areas for Improvement

1. **No extracted logic module** - 844 lines in component, difficult to test
2. **No unit tests** - Scoring, streak logic, round generation untested
3. **Magic numbers** - Some constants could be extracted
4. **Embedded color mapping** - 17-entry color class map in component

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `LetterHunt.tsx` | 844 | Component with embedded game logic, UI, hand tracking |
| `data/alphabets.ts` | 283 | Multi-language alphabet data (shared) |
| `games/constants.ts` | Shared | STREAK_MILESTONE_INTERVAL, etc. |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 844 |
| Component complexity | High (embedded logic) |
| Languages supported | 5 |
| Levels | 3 |
| Rounds per level | 10 |
| Timer duration | 60 seconds |

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

## Scoring System

### Score Formula

```typescript
basePoints = timeLeft * 5;
streakBonus = Math.min(newStreak * 3, 15);
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

## Key Interfaces

```typescript
interface LetterOption {
  id: number;
  char: string;           // The letter character
  name: string;          // Example word (e.g., "Apple")
  color: string;         // Display color (hex)
  isTarget: boolean;     // True for correct answer
}
```

---

## Round Generation Algorithm

```typescript
// On round change, generate new options
const randomIndex = Math.floor(Math.random() * alphabet.letters.length);
const target = alphabet.letters[randomIndex].char;
setTargetLetter(target);

// Create target option
newOptions.push({
  id: 0,
  char: target,
  name: alphabet.letters[randomIndex].name,
  color: alphabet.letters[randomIndex].color,
  isTarget: true,
});

// Add 4 distractors
const usedIndices = new Set([randomIndex]);
for (let i = 1; i < 5; i++) {
  let randomIdx;
  do {
    randomIdx = Math.floor(Math.random() * alphabet.letters.length);
  } while (usedIndices.has(randomIdx));
  usedIndices.add(randomIdx);
  // Add distractor...
}

// Shuffle and set
setOptions(newOptions.sort(() => Math.random() - 0.5));
```

---

## Streak System

### Streak Building

| Event | Streak Change |
|-------|---------------|
| Correct answer | +1 |
| Wrong answer | Reset to 0 |
| Timeout | Reset to 0 |

### Milestone Celebration

```typescript
if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
  setShowStreakMilestone(true);
  triggerHaptic('celebration');
  setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
}
```

Every 5 consecutive correct answers:
- Show "🔥 {streak} Streak! 🔥" overlay
- Trigger celebration haptic
- Display for 1500ms

---

## 5 Supported Languages

| Code | Language | Letters | Script Type |
|------|----------|---------|------------|
| en | English | 26 | Latin |
| hi | Hindi | 36 | Devanagari |
| kn | Kannada | 43 | Kannada |
| te | Telugu | 42 | Telugu |
| ta | Tamil | 247 | Tamil |

---

## Visual Design

### UI Elements

- **Target Display:** Large letter + example word at top
- **Score Panel:** Current score, level, round counter
- **Heart HUD:** 5 hearts filling every 2 streak
- **Letter Grid:** 5 cards at bottom with letter + name
- **Cursor:** Hand/finger cursor with pinch indicator (👆)
- **Feedback Overlay:** Success/error messages

### Color Mapping

17 predefined color classes:
```typescript
const LETTER_COLOR_CLASS_MAP: Record<string, string> = {
  '#ef4444': 'letter-color-ef4444',
  '#dc2626': 'letter-color-dc2626',
  '#3b82f6': 'letter-color-3b82f6',
  '#f59e0b': 'letter-color-f59e0b',
  '#10b981': 'letter-color-10b981',
  '#8b5cf6': 'letter-color-8b5cf6',
  '#06b6d4': 'letter-color-06b6d4',
  '#84cc16': 'letter-color-84cc16',
  '#f97316': 'letter-color-f97316',
  '#ec4899': 'letter-color-ec4899',
  '#eab308': 'letter-color-eab308',
  '#6366f1': 'letter-color-6366f1',
  '#64748b': 'letter-color-64748b',
  '#a16207': 'letter-color-a16207',
  '#a855f7': 'letter-color-a855f7',
  '#16a34a': 'letter-color-16a34a',
  '#1f2937': 'letter-color-1f2937',
  '#fff': 'letter-color-ffffff',
  '#ffffff': 'letter-color-ffffff',
};
```

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Cream (#FFF8F0) |
| Border | Gold (#F2CC8F) |
| Correct | Green (#10B981) |
| Wrong | Red |
| Target | Letter-specific |

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
| Level 1-2 complete | "Level complete! Next level!" |
| All complete | "You finished all levels! You're a letter expert!" |

---

## Hand Tracking Configuration

```typescript
const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking } =
  useGameHandTracking({
    gameName: 'LetterHunt',
    isRunning: gameStarted && !gameCompleted && !feedback && !useMouseFallback,
    webcamRef,
    targetFps: 30,
    onFrame: handleTrackingFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
      if (hoveredOptionIndex !== null) setHoveredOptionIndex(null);
      if (isPinching) setIsPinching(false);
    },
  });
```

### Cursor Tracking

- Uses index finger tip for cursor position
- Normalized coordinates (0-1) mapped to screen
- Hit testing via `hitTestRects()` utility
- Pinch debounce: 450ms minimum between selections

---

## Fallback Controls

```typescript
const fallback = useFallbackControls({
  enabled: useMouseFallback && fallbackFlag,
  dwell: { dwellTimeMs: 400 },
  snap: {
    snapRadiusPx: 32,
    targets: optionRefs.current.map((el, idx) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          id: idx.toString(),
        };
      }
      return { x: 0, y: 0, id: idx.toString() };
    }),
  },
  onDwellSelect: (id) => {
    const idx = parseInt(id, 10);
    const opt = options[idx];
    if (opt) handleSelectOption(opt);
  },
  onCursorMove: (pos) => setCursor(pos),
  containerRef: cameraAreaRef,
});
```

### Fallback Settings

| Feature | Value |
|---------|-------|
| Dwell time | 400ms |
| Snap radius | 32px |
| Snap targets | All 5 letter options |
| Selection | Auto-select after dwell |

---

## Easter Eggs

| Achievement | Trigger |
|-------------|---------|
| egg-treasure-hunter | Find 8 correct letters |

```typescript
foundCountRef.current += 1;
if (foundCountRef.current >= 8) {
  triggerEasterEgg('egg-treasure-hunter');
}
```

---

## Game Flow

1. **Menu Screen:** Display instructions, start button
2. **Start Game:** Initialize hand tracking, announce start
3. **Round Loop:**
   - Show target letter at top
   - Display 5 letter options (shuffled)
   - Start 60-second timer
   - Player points and pinches to select
   - Show feedback for 1.5 seconds
   - Next round or level complete
4. **Level Complete:** After 10 rounds, advance to next level
5. **Game Complete:** After level 3, show final score

---

## Comparison with Similar Games

| Feature | LetterHunt | AlphabetTracing | WordBuilder |
|---------|------------|-----------------|-------------|
| CV Required | Hand (pinch) | Hand (pinch) - optional | Hand (pinch) |
| Core Mechanic | Find target letter | Trace letter outline | Build words |
| Educational Focus | Letter recognition | Letter formation | Spelling |
| Time Limit | 60s/round | None | None |
| Scoring | Time-based | Accuracy-based | Word-based |
| Levels | 3 | Difficulty levels | Curriculum stages |
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

## Recommendations

### Testing

1. **Extract logic module** - Create `letterHuntLogic.ts` with:
   - `generateRoundOptions()` - Round generation
   - `calculateRoundScore()` - Score calculation
   - `getNextStreakState()` - Streak management

2. **Add unit tests** covering:
   - Round generation (target + 4 unique distractors)
   - Scoring with various time/streak combinations
   - Streak building and reset behavior
   - Multi-language alphabet loading

3. **Integration tests** for:
   - Hand tracking frame handling
   - Pinch debounce behavior
   - Fallback control activation

### Code Quality

1. **Extract color mapping** - Move `LETTER_COLOR_CLASS_MAP` to constants file
2. **Extract magic numbers** - Create named constants for timer values
3. **Component splitting** - Break into smaller components (LetterGrid, TargetDisplay, ScorePanel)

---

## Conclusion

Letter Hunt is **functionally correct** but lacks test coverage. The implementation provides comprehensive letter recognition gameplay with 5 supported languages and time-based scoring. The embedded logic makes testing difficult, and extracting a logic module would improve maintainability.

**Audit Status:** APPROVED ✅
**Tests:** NONE (recommend adding)
**Documentation:** COMPLETE ✅

**Priority Improvements:**
1. Extract logic module for testability
2. Add unit tests for scoring and round generation
3. Extract color mapping to constants
