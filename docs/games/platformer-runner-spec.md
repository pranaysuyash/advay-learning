# Platformer Runner Game Specification

**Game ID:** `platformer-runner`
**Age Range:** 5-10
**CV Required:** Hand (raise/lower)
**Vibe:** Active

---

## Overview

Platformer Runner is an endless runner game where children automatically run forward and must jump over obstacles. Raising the hand high (y < 0.4) triggers a jump, and the hand must be lowered (y > 0.6) before jumping again.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Hand tracking with index finger |
| Jump | Raise hand high (y < 0.4) |
| Reset | Lower hand (y > 0.6) to jump again |
| Fallback | Spacebar or tap to jump |

### Game Loop

1. **Auto Run:** Player automatically runs right
2. **Obstacles:** Slimes spawn ahead, crawl left
3. **Coins:** Stars and coins spawn in arcs
4. **Jump:** Raise hand to jump over slimes
5. **Collect:** Grab coins for points
6. **Collision:** Hit slime → game over

---

## Player Physics

### Movement

```typescript
vx = 5; // Auto run speed
vy += 0.8 × dt; // Gravity
x += vx × dt; // Auto run
y += vy × dt; // Apply velocity

// Ground collision
if (y > GROUND_Y - height) {
  y = GROUND_Y - height;
  vy = 0;
}
```

### Jump

```typescript
jumpVelocity = -16;
canJump = (y >= GROUND_Y - height - 5);
```

---

## Game Objects

### Collectibles

| Type | Points | Spawn Rate | Color |
|------|--------|------------|-------|
| Coin | 10 | 70% | #FDE047 (gold) |
| Star | 50 | 10% of coins | #FBBF24 (amber) |

### Enemies

| Type | Movement | Size | Color |
|------|----------|------|-------|
| Slime | Crawls left (vx = -1) | 48×32 | #DC2626 (red) |

---

## Scoring System

### Score Formula

```typescript
itemPoints = type === 'star' ? 50 : 10;
streakBonus = Math.min(streak × 2, 15);
totalPoints = itemPoints + streakBonus;
```

### Score Examples

| Item | Streak 0 | Streak 5+ |
|------|----------|-----------|
| Coin | 10 | 25 |
| Star | 50 | 65 |

---

## Visual Design

### UI Elements

- **Canvas:** 800×600 internal resolution
- **Player:** Blue rectangle (48×64px) with rounded corners
- **Ground:** Brown dirt with green grass trim
- **Slime:** Red rounded rectangle with eyes
- **Coins:** Yellow/gold circles
- **Stars:** Amber circles

### Color Scheme

| Element | Colors |
|---------|--------|
| Sky | #87CEEB |
| Ground dirt | #8B4513 |
| Grass | #228B22 |
| Player | #2563EB |
| Slime | #DC2626 |
| Coins | #FDE047 |
| Stars | #FBBF24 |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Jump | playClick() | 'success' |
| Collect coin | playSuccess() | 'success' |
| Game over | playError() | 'error' |
| Streak milestone | playCelebration() | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Let's go! Raise your hand high to jump over the slimes and grab the coins!" |
| Game over | "Oh no, you hit a slime! Good run!" |

---

## Game Constants

```typescript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GROUND_Y = 536; // 600 - 64
const PLAYER_W = 48;
const PLAYER_H = 64;
const PLAYER_VX = 5;
const GRAVITY = 0.8;
const JUMP_VELOCITY = -16;
const HAND_RAISED_THRESHOLD = 0.4;
const HAND_LOWERED_THRESHOLD = 0.6;
const SLIME_VX = -1;
const SPAWN_AHEAD = 200; // Minimum pixels ahead
```

---

## Terrain Generation

### Procedural Generation

```typescript
while (furthestX < playerX + CANVAS_WIDTH * 2) {
  newX = furthestX + 300 + random × 400;

  if (random < 0.7) {
    // Spawn coins (1-3 in arc pattern)
    numCoins = floor(random × 3) + 1;
    baseY = GROUND_Y - 80 - random × 60;
    for (i = 0; i < numCoins; i++) {
      spawnCoin(newX + i × 50, baseY - (i % 2) × 50);
    }
  } else {
    // Spawn slime at ground level
    spawnSlime(newX, GROUND_Y - 32);
  }

  furthestX = newX + 200;
}
```

### Cleanup

Objects behind camera (cameraX - 200) are removed

---

## Camera

### Follow Player

```typescript
cameraX = playerX - 200;
```

Keeps player at left 200px of screen

---

## Streak System

### Streak Building

- Collect item: streak + 1
- Hit slime: streak resets, game over

### Milestone

- Every 5 consecutive items
- Shows "🔥 {streak} Streak!" overlay

---

## Educational Value

### Skills Developed

1. **Timing** - Jump at the right moment
2. **Hand-Eye Coordination** - Raising/lowering hand
3. **Spatial Awareness** - Judging jump distance
4. **Reaction Time** - Quick responses to obstacles
5. **Focus** - Sustained attention to game
6. **Gross Motor Skills** - Arm movement for jumping

---

## Controls

| Input | Action |
|-------|--------|
| Raise hand (y < 0.4) | Jump |
| Lower hand (y > 0.6) | Reset jump |
| Spacebar | Jump |
| Tap screen | Jump |
| Start button | Begin game |
| Play again | Restart |

---

## Collision Detection

### Hitbox Shrinking

```typescript
margin = 0.6; // Use 60% of hitbox
```

Makes collision more forgiving for children

---

## Progress Tracking

### Session Persistence

```typescript
interface PlatformerSession {
  score: number;
  coins: number;
  streak: number;
  isPlaying: boolean;
}
```
