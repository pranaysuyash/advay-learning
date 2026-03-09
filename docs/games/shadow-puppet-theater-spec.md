# Shadow Puppet Theater Game Specification

**Game ID:** `shadow-puppet-theater`
**Age Range:** 3-6
**CV Required:** Hand (optional - self-reporting)
**Vibe:** Chill

---

## Overview

Shadow Puppet Theater is an imaginative role-play game where children make hand shadow puppets. The game shows a target puppet shape (with emoji and description) and the child makes the shape with their hands. Self-reporting with "I Made It!" button.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Child makes shape with hands |
| Confirmation | "I Made It!" button (self-reporting) |
| CV | Not required - no pose validation |

### Game Loop

1. **Shape Display:** Target puppet shown with emoji + name + description
2. **Voice Prompt:** TTS describes the shape to make
3. **Child Acts:** Child makes shape with their hands
4. **Self Report:** Child presses "I Made It!" when done
5. **Progression:** Next shape appears

---

## Levels & Progression

| Level | Shapes Per Round | Description |
|-------|------------------|-------------|
| 1 | 5 | Simple shapes |
| 2 | 6 | Moderate shapes |
| 3 | 7 | Complex shapes |

### Completion

- Complete all shapes in level to advance
- 3 levels total
- Final score = total points / shapes per round

---

## Scoring System

### Score Formula

```typescript
basePoints = 25;
streakBonus = Math.min(streak × 3, 20);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 25 | 0 | 25 |
| 3 | 25 | 9 | 34 |
| 5+ | 25 | 15 | 40 |

### Max Score per Shape

40 points (25 base + 15 bonus)

---

## Puppet Shapes

Examples of shadow puppet shapes include:

| Shape | Emoji | Description |
|-------|-------|-------------|
| Butterfly | 🦋 | Spread your wings like a butterfly |
| Dog | 🐕 | Make dog ears with your hands |
| Bird | 🐦 | Flap your wings like a bird |
| Bunny | 🐰 | Long ears like a bunny rabbit |
| Spider | 🕷️ | Eight legs crawling around |
| Heart | ❤️ | Two hands making a heart shape |

---

## Visual Design

### UI Elements

- **Shadow Theater:** Dark rectangular area (gray-900)
- **Puppet Display:** Large emoji at 50% opacity
- **Instruction:** "Hold your hand up to the camera!"
- **Feedback:** Colorful success messages

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Gray-900 (shadow theater) |
| Puppet emoji | 50% opacity |
| Buttons | Green gradient (success), Yellow (hint) |
| Stats panels | Green (done), Orange (streak), Blue (score), Purple (progress) |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Shape appears | TTS description | None |
| "I Made It!" | playSuccess() | 'success' |
| Streak milestone | playCelebration() | 'celebration' |
| "Hear Hint" | playClick() | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Shape appears | "[Shape name]! [Description]" |
| Hint button | Repeats shape description |
| Correct | "Great job! Next shape..." |
| Level complete | "Amazing Performer!" |

---

## Game Constants

```typescript
const BASE_POINTS = 25;
const STREAK_BONUS_PER = 3;
const MAX_STREAK_BONUS = 15;
const STREAK_MILESTONE_INTERVAL = 5;
const STREAK_MILESTONE_DURATION_MS = 1500;
const SHAPES_PER_ROUND = 5; // Level 1
```

---

## Controls

| Button | Action |
|--------|--------|
| "I Made It!" ✓ | Confirm shape completion |
| "Hear Hint" 🔊 | Replay TTS description |
| Level buttons (1, 2, 3) | Switch level |
| Play Again | Restart current level |
| Finish | End game, show score |

---

## Progress Tracking

### Session Persistence

```typescript
interface ShadowPuppetSession {
  currentLevel: number;
  score: number;
  correctCount: number;
  shapeIndex: number;
}
```

---

## Educational Value

### Skills Developed

1. **Imagination** - Creative play with shadow puppets
2. **Fine Motor Skills** - Hand coordination for shapes
3. **Body Awareness** - Understanding hand positions
4. **Listening Skills** - Following verbal descriptions
5. **Self-Confidence** - Self-reporting builds autonomy
6. **Visual Memory** - Remembering shape patterns

---

## Accessibility

- **No CV required** - No pose validation pressure
- **Self-paced** - Child controls when to move on
- **Voice prompts** - TTS describes each shape
- **Visual feedback** - Emoji + name + description
- **No time limit** - Child takes as long as needed
- **Multi-level** - Progressive difficulty
