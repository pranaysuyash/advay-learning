# Alphabet Game (Letter Tracing) Game Specification

**Game ID:** `alphabet-tracing`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-8 years
**CV Requirements:** Hand tracking (pinch/draw) - optional (mouse/touch fallback)

---

## Overview

Alphabet Game is an educational letter tracing game where children draw letters with their finger. The game supports multiple languages (English, Hindi, Kannada, Telugu, Tamil) and provides visual feedback through letter tracing accuracy.

### Tagline
"Draw the letters! Trace A, B, C with your finger! ✏️👆"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Language** - Choose from 5 supported languages
2. **See Letter** - Letter displayed with visual guide
3. **Trace Letter** - Pinch and draw along the letter outline
4. **Release to Check** - Release pinch to check accuracy
5. **Get Feedback** - See accuracy score and encouraging message
6. **Next Letter** - Advance to next letter in sequence

### Controls

| Action | Hand Mode | Mouse Mode |
|--------|-----------|------------|
| Start drawing | Pinch when cursor is near letter | Click and drag |
| Stop drawing | Release pinch | Release click |
| Check accuracy | Release pinch after tracing | Release click after drawing |
| Clear canvas | Click "Clear" button | Click "Clear" button |
| Next/Prev letter | Click navigation arrows | Click navigation arrows |

---

## Supported Languages

### 5 Languages

| Code | Language | Letters | Script Type |
|------|----------|---------|------------|
| en | English | 26 (A-Z) | Latin |
| hi | Hindi | 36 (vowels + consonants) | Devanagari |
| kn | Kannada | 43 (vowels + consonants) | Kannada |
| te | Telugu | 42 (vowels + consonants) | Telugu |
| ta | Tamil | 247 (vowels + consonants) | Tamil |

### Language Selection

```typescript
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
];
```

---

## Letter Data Structure

### Letter Properties

```typescript
interface Letter {
  char: string;           // Character (e.g., "A", "अ", "ಅ")
  name: string;          // Example word (e.g., "Apple", "अनार", "ಅಪ್ಪೆ")
  icon: string | string[]; // Icon file path(s)
  color: string;         // Display color
  transliteration?: string; // Romanized pronunciation
  pronunciation?: string;  // Phonetic guide
}
```

### English Letter Examples

| Letter | Name | Icon Options | Color | Pronunciation |
|--------|------|-------------|-------|--------------|
| A | Apple | apple, aardvark, airplane | #ef444 | ay |
| B | Ball | ball, bear, boat | #3b82f6 | bee |
| C | Cat | cat, cow, cake | #f59e0b | see |
| D | Dog | dog, dolphin, donut | #10b981 | dee |
| E | Elephant | elephant, eagle, egg | #8b5cf6 | ee |
| F | Fish | fish, flower, frog | #06b6d4 | ef |
| G | Grapes | grapes, giraffe, guitar | #84cc16 | jee |
| H | House | house, heart, hat | #f97316 | aych |
| I | Ice cream | ice-cream, igloo, ice | #ec4899 | eye |
| J | Juice | juice, jellyfish, jacket | #eab308 | jay |
| K | Kite | kite, key, kangaroo | #6366f1 | kay |
| L | Lion | lion, lamp, laptop | #f59e0b | el |
| M | Moon | moon, monkey, mushroom | #64748b | em |
| N | Nest | nest, net, nose | #a16207 | en |
| O | Orange | orange, octopus, owl | #f97316 | oh |
| P | Pencil | pencil, pizza, penguin | #eab308 | pee |
| Q | Queen | queen, quill, quiz | #a855f7 | cue |
| R | Rainbow | rainbow, rabbit, radio | #ec4899 | ar |
| S | Sun | sun, star, snake | #eab308 | ess |
| T | Tree | tree, tiger, train | #16a34a | tee |
| U | Umbrella | umbrella, unicorn, underwear | #3b82f6 | you |
| V | Violin | violin, van, vase | #8b5cf6 | vee |
| W | Watermelon | watermelon, whale, watch | #ef444 | double-you |
| X | Xylophone | xylophone, xray, xmas-tree | #f59e0b | ex |
| Y | Yacht | yacht, yak, yoyo | #06b6d4 | why |
| Z | Zebra | zebra, zipper, zoo | #1f2937 | zee |

---

## Scoring System

### Accuracy Calculation

```typescript
baseAccuracy = 60; // Starting accuracy
pointsPerPoint = 10; // Each drawn point adds accuracy
maxAccuracy = 100;

accuracy = Math.min(
  MAX_ACCURACY,
  BASE_ACCURACY + Math.floor(drawnPoints / ACCURACY_POINT_DIVISOR)
);
// ACCURACY_POINT_DIVISOR = 4
```

### Accuracy Examples

| Points Drawn | Accuracy |
|---------------|----------|
| 0 | 60% |
| 16 | 100% |
| 32 | 100% (capped) |

### Success Threshold

```typescript
ACCURACY_SUCCESS_THRESHOLD = 80; // 80% accuracy required to pass
MIN_DRAW_POINTS_FOR_CHECK = 30; // Minimum points before checking
MIN_FEEDBACK_ACCURACY = 0; // For too few points
```

---

## Visual Design

### Canvas

- **Size:** 800 × 600 pixels (configurable)
- **Background:** White (with optional grid lines)
- **Guide Color:** Faint gray for letter outline
- **Tracing Color:** Black (drawn by user)

### Letter Rendering

| State | Stroke | Visibility |
|-------|--------|------------|
| Guide | Faint gray (dashed) | Always visible |
| Tracing | Solid black | Visible while drawing |
| Complete | Gold/green | Shows success state |

### Visual Feedback

- **Accuracy Display:** Shows percentage (0-100%)
- **Success Overlay:** Shows celebration when threshold met
- **Confetti:** Triggered on successful letter completion
- **Score Popup:** Shows points earned

---

## Difficulty Levels

### Difficulty Settings

| Difficulty | Letters Count | Description |
|------------|---------------|-------------|
| easy | 5 | First 5 letters of alphabet |
| medium | 10 | First 10 letters of alphabet |
| hard | All | All letters in alphabet |

### Difficulty Selection

```typescript
const count = difficulty === 'easy' ? 5
  : difficulty === 'medium' ? 10
  : alphabet.letters.length;
```

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playPop() | None |
| Letter complete | playCelebration() + confetti | 'celebration' |
| Too few points | playError() | 'error' |
| Streak milestone | playCelebration() | 'celebration' |
| Clear canvas | playPop() | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Draw the letters! Trace A, B, C with your finger!" |
| Letter shown | "[Letter]! Like in [Example word]!" |
| Success (80%+) | "Great job! You drew [letter]!" |
| Too few points | "Draw more of the letter first! ✏️" |
| Language switch | "[Language] alphabet loaded!" |

---

## Progress Tracking

### Session Persistence

```typescript
interface AlphabetGameSession {
  language: string;
  currentLetterIndex: number;
  difficulty: string;
  score: number;
  streak: number;
}
```

### Integration with Progress Tracking

```typescript
await recordProgressActivity({
  profileId: resolvedProfileId,
  activityType: 'letter_tracing',
  contentId: `letter-${language}-${letterCode}`,
  score: accuracy,
  metaData: {
    language: selectedLanguage,
    letter: currentLetter.char,
    letter_name: currentLetter.name,
    attempt_count: attemptCount,
    points_drawn: drawnPoints.length,
  },
  completed: accuracy >= ACCURACY_SUCCESS_THRESHOLD,
});
```

---

## Streak System

### Milestone

- **Every 5 successful letters** - Show celebration overlay
- **Duration:** STREAK_MILESTONE_DURATION_MS (1500ms)
- **Triggered via:** useStreakTracking hook

### Streak Display

- Top-center overlay during milestone
- Shows current streak count
- Displays "🔥 {streak} Streak! 🔥"

---

## Game Constants

```typescript
const ACCURACY_POINT_DIVISOR = 4;          // Points per accuracy point
const ACCURACY_SUCCESS_THRESHOLD = 80;     // Success threshold
const BASE_ACCURACY = 60;                    // Starting accuracy
const MAX_ACCURACY = 100;                     // Maximum accuracy
const MIN_DRAW_POINTS_FOR_CHECK = 30;      // Minimum points to check
const MIN_FEEDBACK_ACCURACY = 0;            // For too few points
const MAX_DRAWN_POINTS = 200;                 // Maximum points tracked
const POINT_MIN_DISTANCE = 3;                 // Pixels between points
const TIP_SMOOTHING_ALPHA = 0.3;             // Smoothing factor
const CONFETTI_ORIGIN_Y = 0.6;                // Confetti origin
const CONFETTI_PARTICLE_COUNT = 50;          // Confetti particles
const CONFETTI_SPREAD = 50;                   // Confetti spread
```

---

## Canvas Drawing

### Build Segments

```typescript
function buildSegments(canvas: HTMLCanvasElement): LetterSegment[] {
  // Analyzes canvas to create letter segments
  // Returns array of stroke segments with point data
}
```

### Draw Segments

```typescript
function drawSegments(
  ctx: CanvasRenderingContext2D,
  segments: LetterSegment[],
  isComplete: boolean
): void {
  // Draws letter segments on canvas
  // Complete segments shown in gold/green
}
```

### Draw Letter Hint

```typescript
function drawLetterHint(
  ctx: CanvasRenderingContext2D,
  letter: string,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Draws faint guide letter for tracing
}
```

---

## Educational Value

### Skills Developed

1. **Letter Recognition**
   - Uppercase and lowercase letters
   - Letter-sound correspondence
   - Letter formation

2. **Fine Motor Skills
   - Tracing along lines
   - Pinch gesture control
   - Hand-eye coordination

3. **Multi-Language Learning**
   - 5 Indian languages supported
   - Cultural relevance through local words
   - Transliteration for pronunciation

4. **Writing Foundation
   - Proper stroke order (implicit through tracing)
   - Letter shapes and forms
   - Pre-writing skills

---

## Age Appropriateness

| Age Group | Difficulty | Language Focus |
|-----------|------------|----------------|
| 3-5 years | Easy (5 letters) | English, native language |
| 5-7 years | Medium (10 letters) | English + second language |
| 7-8 years | Hard (all letters) | All supported languages |

---

## Comparison with Similar Games

| Feature | AlphabetGame | MirrorDraw | ShapeSafari |
|---------|-------------|------------|-------------|
| CV Required | Hand (pinch) - optional | Hand (pinch) | Hand (pinch/draw) |
| Core Mechanic | Trace letter outlines | Trace mirror images | Trace hidden shapes |
| Educational Focus | Letter formation | Symmetry | Shape recognition |
| Multi-Language | 5 languages | 1 | 1 |
| Progression | Sequential letters | Scenes with shapes | Scenes with shapes |
| Time Limit | None | None | None |
| Streak System | Yes | Yes | No |
| Age Range | 3-8 | 4-10 | 3-5 |
| Vibe | Chill | Chill | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
