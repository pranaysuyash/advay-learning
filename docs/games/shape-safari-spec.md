# Shape Safari Game Specification

**Game ID:** `shape-safari`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-5 years
**CV Requirements:** Yes (Hand Tracking for Tracing)

---

## Overview

Shape Safari is an educational game where children trace hidden shapes in illustrated scenes to discover animals and objects. The game builds shape recognition and fine motor skills through engaging hidden object discovery.

### Tagline
"Find hidden shapes by tracing them with your finger\! 🔍"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Scene** - Choose from 5 themed scenes
2. **Scan Scene** - Look for subtle shape outlines
3. **Trace Shape** - Use finger to trace around hidden shape
4. **Discover Object** - Shape reveals hidden animal/object
5. **Continue** - Find all shapes in scene

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Hand tracking - index finger |
| Start tracing | Pinch when near shape |
| Trace | Move finger along shape outline |
| Get hint | Click "💡 Hint" button |
| Select scene | Click scene card |

---

## Difficulty Levels

### 3 Difficulties

| Difficulty | Scenes | Shape Types | Target Count |
|------------|--------|-------------|--------------|
| 1 | Jungle, Ocean, Farm | Circle, Square, Triangle | 4-6 |
| 2 | Ocean, Space, Farm | Square, Triangle, Mixed | 4-6 |
| 3 | Space, Garden | Triangle, Star, Heart | 5 |

---

## Scenes

### 5 Safari Scenes

| Scene ID | Theme | Difficulty | Target Shape | Count |
|----------|-------|------------|--------------|-------|
| jungle-circles | Jungle | 1 | Circle | 5 |
| ocean-squares | Ocean | 1 | Square | 4 |
| space-triangles | Space | 2 | Triangle | 4 |
| farm-mixed | Farm | 2 | Mixed | 6 |
| garden-stars | Garden | 3 | Star | 5 |

---

## Shapes

### 8 Shape Types

| Shape | Emojis | Typical Age |
|-------|--------|-------------|
| Circle | 🐵, 🥥, ☀️ | 2-3 yrs |
| Square | 💎, 🐠, 🏠 | 3-4 yrs |
| Triangle | 🚀, 🐔, 🏔️ | 4-5 yrs |
| Rectangle | 🌾 | 4-5 yrs |
| Star | ⭐, 🧚, 🌻 | 5-6 yrs |
| Oval | - | 4-5 yrs |
| Diamond | ◆ | 5-6 yrs |
| Heart | 🧚, 🐞 | 5-6 yrs |

---

## Scoring System

### Score Formula

```typescript
baseScore = shapesFound × 100;
timeBonus = max(0, 300 - elapsedTimeSeconds);
hintPenalty = hintsUsed × 50;
finalScore = baseScore + timeBonus - hintPenalty;
```

### Streak Bonus

```typescript
basePoints = 15;
streakBonus = Math.min(streak × 3, 15);
totalPoints = basePoints + streakBonus;
```

### Max per Shape

30 points (15 base + 15 bonus)

---

## Tracing Mechanics

### Accuracy Threshold

- **60% accuracy** required to complete shape
- Accuracy measured by distance from target path
- Sample 20 points along traced path

### Tolerance

- Default tolerance: 30px
- Scene-specific tolerance based on difficulty

---

## Visual Design

### Scene Elements

- **Gradient Backgrounds** - Themed per scene
- **Decorations** - Emoji elements placed around
- **Hidden Shapes** - Subtle outlines (15% opacity white)
- **Glow Effect** - When hovering near shape
- **Found Shapes** - Gold glow + revealed emoji

### Scene Themes

| Scene | BG Colors | Decorations |
|-------|-----------|-------------|
| Jungle | Dark greens | Palm trees, leaves |
| Ocean | Blue gradients | Waves, whale, crab |
| Space | Dark navy | Stars, moon, UFO |
| Farm | Sky blue | Sun, clouds, animals |
| Garden | Pink/green | Flowers, butterflies |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Shape found | playSuccess() | 'success' |
| Scene complete | playCelebration() | 'celebration' |
| Streak milestone | None | 'celebration' |
| Hover near shape | playHover() | None |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Scenes total | 5 | Available scenes |
| Shapes per scene | 4-6 | Variable by scene |
| Tracing accuracy | 60% | Minimum to complete |
| Time bonus max | 300 | Seconds |
| Hint penalty | 50 | Per hint used |
| Streak milestone | 5 | Every 5 streaks |

---

## Hint System

### Position Hints

- "Look on the left side\!"
- "Check the right side\!"
- "Look near the top\!"
- "Check near the bottom\!"
- "Look in the center\!"

---

## Educational Value

### Skills Developed

1. **Shape Recognition** - Foundational for geometry
2. **Fine Motor Control** - Tracing builds writing skills
3. **Visual Scanning** - Finding hidden objects
4. **Vocabulary** - Shape and animal names
5. **Spatial Reasoning** - Understanding shapes in context

---

## Data Structures

### Hidden Shape

```typescript
interface HiddenShape {
  id: string;
  type: ShapeType;
  path: Path2D | null;
  normalizedPath: Point[];
  position: Point;
  size: number;
  rotation: number;
  isFound: boolean;
  hiddenObject: {
    name: string;
    emoji: string;
    description: string;
  };
  difficulty: 1 | 2 | 3;
}
```

### Safari Scene

```typescript
interface SafariScene {
  id: string;
  theme: 'jungle' | 'ocean' | 'space' | 'farm' | 'garden';
  name: string;
  description: string;
  backgroundColor: string;
  gradientColors: [string, string];
  difficulty: 1 | 2 | 3;
  targetShape: ShapeType | 'mixed';
  targetCount: number;
  shapes: HiddenShape[];
  decorations: Decoration[];
}
```

---

## Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `ShapeSafari.tsx` | 692 | Main component with CV, canvas |
| `shapeSafariLogic.ts` | 814 | Scene data, path generation |
| `shapeSafariLogic.test.ts` | 270 | Unit tests (23 tests) |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
