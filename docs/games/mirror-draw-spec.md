# Mirror Draw Game Specification

**Game ID:** `mirror-draw`
**World:** Arcade
**Vibe:** Chill
**Age Range:** 4-10 years
**CV Requirements:** Hand tracking (pinch detection) - required

---

## Overview

Mirror Draw is a creative educational game where children trace mirror images of shapes. Half of a shape is shown on the left side of the screen; children must draw the mirror image on the right side using hand tracking (pinch and draw). The game teaches symmetry, spatial reasoning, and fine motor skills.

### Tagline
"Draw the mirror image! What's on the left, copy on the right! ✏️👆"

---

## Game Mechanics

### Core Gameplay Loop

1. **Start Game** - Press "Start Drawing!" button
2. **See Template** - Half of a shape appears on the left side
3. **Observe** - Look at the guide faintly shown on the right (ghost)
4. **Trace** - Pinch and draw on the right side to mirror the shape
5. **Submit** - Release pinch or press "Done" button
6. **Score** - Receive star rating based on accuracy
7. **Next Template** - Move to next shape (5 per level)
8. **Level Complete** - Pass 3/5 templates to advance
9. **Game Complete** - Finish all 4 levels

### Controls

| Action | Input |
|--------|-------|
| Start drawing | Pinch when cursor is on right side (x > 0.5) |
| Stop drawing | Release pinch |
| Submit | Release pinch (if 10+ points) or click "Done" |
| Clear | Click "Clear" button |
| Restart | Click "Restart" button |
| Home | Click "Home" button |

---

## Levels

### Four Levels

| Level | Pass Threshold | Templates | Difficulty |
|-------|----------------|-----------|------------|
| 1 | 40% | 5 | Easy - simple shapes |
| 2 | 55% | 5 | Medium - organic shapes |
| 3 | 65% | 5 | Hard - complex shapes |
| 4 | 75% | 5 | Expert - intricate shapes |

### Level Progression

- **Templates per Level:** 5
- **Templates to Pass:** 3/5
- **Failed Level:** Restart with same 5 templates

---

## Templates

### 20 Total Templates (5 per level)

#### Level 1 Templates (Simple Shapes)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| heart | Heart | ❤️ | 9 |
| circle | Circle | ⭕ | 9 |
| square | Square | ⬜ | 4 |
| star | Star | ⭐ | 6 |
| moon | Moon | 🌙 | 7 |

#### Level 2 Templates (Organic Shapes)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| butterfly | Butterfly | 🦋 | 14 |
| leaf | Leaf | 🍃 | 8 |
| smiley | Smiley | 😊 | 9 |
| fish | Fish | 🐟 | 10 |
| diamond | Diamond | 💎 | 5 |

#### Level 3 Templates (Complex Shapes)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| flower | Flower | 🌸 | 14 |
| tree | Tree | 🌲 | 10 |
| house | House | 🏠 | 7 |
| car | Car | 🚗 | 11 |
| rocket | Rocket | 🚀 | 10 |

#### Level 4 Templates (Intricate Shapes)

| ID | Name | Emoji | Points |
|----|------|-------|--------|
| snowflake | Snowflake | ❄️ | 13 |
| crown | Crown | 👑 | 7 |
| robot | Robot | 🤖 | 14 |
| bell | Bell | 🔔 | 13 |
| shield | Shield | 🛡️ | 8 |

### Template Points

- **Coordinate System:** Normalized (0-1)
- **Left Half:** x from 0 to 0.5
- **Right Half:** x from 0.5 to 1.0
- **Y Range:** 0 (top) to 1 (bottom)
- **Center Line:** x = 0.5

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
basePoints = 10; // per passed template
starBonus = stars × 5; // 0, 5, 10, or 15
totalScore = basePoints + starBonus;
```

### Score Examples

| Stars | Base | Bonus | Total |
|-------|------|-------|-------|
| 0 | 0 (failed) | 0 | 0 |
| 1 | 10 | 5 | 15 |
| 2 | 10 | 10 | 20 |
| 3 | 10 | 15 | 25 |

### Accuracy Algorithm

```typescript
// 1. Mirror template points to right side
mirroredTemplate = template.points.map(mirrorPoint);

// 2. Sample user points to match template count
sampled = samplePoints(userPoints, mirroredTemplate.length);

// 3. Find average nearest-point distance
avgDist = average(min distance from each user point to template);

// 4. Calculate accuracy
accuracy = clamp(0, 1, 1 - avgDist / maxAllowedDistance);
maxAllowedDistance = 0.15;
```

---

## Streak System

### Milestone

- **Every 3 passes** - Show "🔥 {streak} Perfect! 🔥" overlay
- **Haptic:** 'celebration' on milestone

### Streak Display

- Top-center overlay during milestone
- Shows current streak count
- Auto-dismisses after 1.5s

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

### UI Elements

- **Feedback Badge:** Top-center, shows current message
- **Template Badge:** Top-left, shows name + emoji + progress (N/5)
- **Score Badge:** Top-right, shows stars + percentage
- **Attention Meter:** Bottom-left, shows hand tracking quality
- **Controls:** Bottom-right, Start/Clear/Done/Home

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
| Menu instructions | "Look at the shape on the left. Trace its mirror on the right. Pinch and draw with your finger!" |
| Passed (3 stars) | "Perfect tracing! You matched the {shape}!" |
| Passed (2 stars) | "Great job! You matched the {shape}!" |
| Passed (1 star) | "Nice work! You matched the {shape}!" |
| Failed | "Keep trying! Trace the shape more carefully!" |
| Level complete (1-3) | "Level complete! Great mirror drawing!" |
| All complete | "Amazing! You completed all the mirror drawings!" |

---

## Progress Tracking

### Integration with useGameDrops

```typescript
await onGameComplete(finalScore);
triggerEasterEgg('egg-perfect-symmetry'); // When accuracy >= 95%
```

### Easter Eggs

| ID | Trigger | Effect |
|----|---------|--------|
| egg-perfect-symmetry | Accuracy >= 95% on any template | Item drop |

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| gameCompleted | boolean | Whether all levels finished |
| score | number | Total accumulated score |
| level | number | Current level (1-4) |
| templateIndex | number | Current template (0-4) |
| template | MirrorTemplate \| null | Current shape data |
| userPoints | Point[] | Drawn points on right side |
| cursor | Point \| null | Current finger tip position |
| isDrawing | boolean | Currently pinching and drawing |
| feedback | string | Current feedback message |
| lastScore | MatchScore \| null | Result of last submission |
| passedCount | number | Passed templates in current level |
| streak | number | Consecutive passes |

---

## Technical Implementation

### Key Constants

```typescript
const MAX_LEVEL = 4;
const TEMPLATES_TO_PASS = 3;
const MIN_DRAWING_POINTS = 5; // to enable submit
const AUTO_SUBMIT_POINTS = 10; // to auto-submit on release
const MAX_ALLOWED_DISTANCE = 0.15; // for accuracy calculation
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
```

### Dependencies

```typescript
// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';

// Game hooks
import { useGameDrops } from '../hooks/useGameDrops';

// Audio & TTS
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

// Logic
import {
  LEVELS,
  TEMPLATES,
  getTemplatesForLevel,
  mirrorPoint,
  calculateMatchScore,
} from '../games/mirrorDrawLogic';

// UI components
import { AttentionMeter } from '../components/game/AttentionMeter';
import { TrackingLossOverlay } from '../components/game/TrackingLossOverlay';
```

---

## Drawing Restrictions

### Right-Only Drawing

- **Drawing Only Allowed:** x > 0.5 (right half)
- **Reason:** Template is on left, user draws mirror on right
- **Visual Cues:** Ghost guide shows where to draw
- **Enforcement:** Points only collected when `cursor.x > 0.5` and pinching

### Auto-Submit

- **Trigger:** Release pinch after drawing
- **Minimum:** 10 points required for auto-submit
- **Manual:** "Done" button enabled with 5+ points

---

## Accessibility Features

### Visual Cues
- Large bubbly cursor (18-24px)
- Color-coded states (orange idle, emerald drawing)
- Ghost guide showing target shape
- Clear center line divider
- Emoji indicators on cursor

### Audio Cues
- TTS voice instructions
- Sound effects for pass/fail
- Voice feedback on results

### Motor Assistance
- Forgiving accuracy thresholds (40-75%)
- Ghost guide for visual reference
- No time pressure
- Can clear and retry
- Multiple submission methods

---

## Test Coverage

### Test Suite: `mirrorDrawLogic.test.ts`

**Tests covering:**
- TEMPLATES data validation (5 tests)
- LEVELS configuration (2 tests)
- getTemplatesForLevel function (3 tests)
- mirrorPoint function (4 tests)
- samplePoints function (5 tests)
- getStars function (4 tests)
- calculateMatchScore function (5 tests)

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
| Vibe | Chill | Chill | Chill |

---

## Educational Value

### Skills Developed

1. **Symmetry Understanding**
   - Mirror image concept
   - Left-right correspondence
   - Spatial relationships

2. **Fine Motor Skills**
   - Pinch gesture control
   - Drawing precision
   - Hand-eye coordination

3. **Visual-Spatial Reasoning**
   - Shape recognition
   - Pattern completion
   - Mental rotation

4. **Attention to Detail**
   - Following guidelines
   - Matching shapes
   - Precision drawing

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: false)
