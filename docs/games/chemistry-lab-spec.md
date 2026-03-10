# Virtual Chemistry Lab Game Specification

**Game ID:** `chemistry-lab`
**Age Range:** 6-10
**CV Required:** Hand (pinch)
**Vibe:** Discovery

---

## Overview

Virtual Chemistry Lab is an educational science game where children mix chemicals to discover reactions. Players select a chemical from the shelf, then pinch over the beaker to pour it in. Discover all 5 reactions to complete the discovery book.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Selection | Click chemical button |
| Pouring | Pinch hand over beaker (y > 0.5, 0.3 < x < 0.7) |
| Pinch threshold | Distance < 0.1 between thumb and index |

### Game Loop

1. **Select:** Choose chemical from shelf
2. **Position:** Move hand over beaker
3. **Pour:** Pinch to pour chemical into beaker
4. **Mix:** Combine with existing chemicals
5. **Discover:** Reactions trigger automatically
6. **Record:** Discovered reactions saved to book

---

## Chemicals

| ID | Name | Color | Symbol | Density |
|----|------|-------|--------|--------|
| water | Water | #4FC3F7 | H₂O | 1.0 |
| vinegar | Vinegar | #FFF9C4 | CH₃COOH | 1.01 |
| baking-soda | Baking Soda | #FFFFFF | NaHCO₃ | 2.2 |
| red-dye | Red Dye | #FF5252 | Red | 1.05 |
| blue-dye | Blue Dye | #448AFF | Blue | 1.05 |
| yellow-dye | Yellow Dye | #FFD740 | Yellow | 1.05 |
| oil | Oil | #FFF59D | Oil | 0.9 |
| soap | Soap | #E1BEE7 | Soap | 1.02 |

---

## Reactions

| ID | Name | Input 1 | Input 2 | Result Color | Effect |
|----|------|---------|---------|-------------|--------|
| volcano | Fizzy Eruption | vinegar | baking-soda | #FFF9C4 | Bubble |
| purple | Purple Mix | red-dye | blue-dye | #9C27B0 | Color change |
| orange | Orange Mix | red-dye | yellow-dye | #FF9800 | Color change |
| green | Green Mix | blue-dye | yellow-dye | #4CAF50 | Color change |
| bubbles | Bubble Mix | water | soap | #E1BEE7 | Bubble |

---

## Scoring System

### Score Formula

```typescript
basePoints = 50;
streakBonus = Math.min(streak × 5, 25);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Discovery | Base | Bonus | Total |
|------------|------|-------|-------|
| First reaction | 50 | 5 | 55 |
| Second reaction | 50 | 10 | 60 |
| Third reaction | 50 | 15 | 65 |
| 5+ reactions | 50 | 25 | 75 |

---

## Visual Design

### UI Elements

- **Chemical Shelf:** 8 chemicals in 4×2 grid
- **Beaker:** Center canvas with measurement lines
- **Discovery Book:** Shows discovered reactions (5/5)
- **Hand Cursor:** Green (pinching) or orange (not pinching)

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Discovery cream (#FFF8F0) |
| Beaker | Glass with measurement lines |
| Selected | Blue border |
| Active | Amber glow |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Pour | playPop() | None |
| Discovery | playSuccess() | 'success' |
| Streak milestone | playCelebration() | 'celebration' |
| Bubble effect | Animated bubbles | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Discovery | "{Reaction name}! {Description}" |
| Instructions | "Select a chemical, then pinch your fingers over the beaker to pour!" |

---

## Game Constants

```typescript
const BEAKER_WIDTH = 120;
const BEAKER_HEIGHT = 150;
const BEAKER_Y = height * 0.7;
const BEAKER_AREA = { xMin: 0.3, xMax: 0.7, yMin: 0.5 };
const PINCH_THRESHOLD = 0.1;
const POUR_DURATION = 500;
const AMOUNT_PER_POUR = 20;
const MAX_AMOUNT = 100;
```

---

## Beaker Rendering

### Liquid Layering

Liquids layer by density (heaviest at bottom):

```
┌─────────────────┐
│                 │  ← air
│  light (0.9)    │  ← oil floats
│  medium (1.0)   │  ← water
│  heavy (2.2)    │  ← baking soda sinks
└─────────────────┘
```

### Measurement Lines

4 lines at 20%, 40%, 60%, 80% of beaker height

---

## Discovery Book

Tracks discovered reactions:

| Status | Display |
|--------|---------|
| Discovered | Colored box with name + description |
| Undiscovered | Gray box with "Unknown Reaction" |

### Progress

```
Discovered: 3/5
```

---

## Streak System

### Streak Building

- New reaction: streak + 1
- Same reaction again: No streak increment

### Milestone

- Every 3 new reactions
- Shows "🔥 {count} Reactions!" overlay
- Duration: 1500ms

---

## Easter Eggs

| Achievement | Trigger |
|-------------|---------|
| egg-gold-reaction | Discover 3 reactions |
| egg-periodic-key | Discover 5 reactions |

---

## Educational Value

### Skills Developed

1. **Scientific Thinking** - Hypothesis and experimentation
2. **Cause and Effect** - Understanding chemical reactions
3. **Color Mixing** - Primary and secondary colors
4. **Observation** - Watching reactions occur
5. **Memory** - Remembering which combinations work
6. **Vocabulary** - Learning chemical names and symbols

---

## How to Experiment

1. Select a chemical from the shelf
2. Pinch your thumb and index finger together
3. Move your hand over the beaker to pour
4. Discover amazing reactions!
