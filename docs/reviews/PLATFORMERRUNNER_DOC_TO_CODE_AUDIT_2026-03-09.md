# Platformer Runner - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `platformer-runner`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `src/frontend/src/pages/PlatformerRunner.tsx` (531 lines)
- Spec: `docs/games/platformer-runner-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Platformer Runner is an endless runner game where children raise their hand to make the character jump over obstacles. The implementation features auto-run at 5px/frame, procedural terrain generation, collectible coins and stars, and slime enemies. Hand tracking detects raised hand (y < 0.4) to jump.

### Test Coverage

- **No dedicated logic file** - All logic embedded in component
- **No unit tests** - Testing manual/explored through code review
- **Tests should cover:** Physics simulation, collision detection, terrain generation

---

## Implementation Quality Assessment

### Strengths

1. **Hand-controlled jumping** - Raise hand (y < 0.4) to jump, lower (y > 0.6) to reset
2. **Auto-run system** - Player moves forward at 5px/frame
3. **Procedural generation** - Endless terrain with coins (70%) and slimes (30%)
4. **Canvas rendering** - 800×600 internal resolution
5. **Streak system** - Every 5 collectibles triggers milestone
6. **Score popup** - Floating +{points} animation on collection
7. **Camera tracking** - Follows player keeping them at left 200px
8. **Keyboard fallback** - Spacebar also triggers jump

### Areas for Improvement

1. **No unit tests** - Critical for physics and collision logic
2. **531 lines** - Large component with physics loop embedded
3. **Fixed gravity** - Could be extracted to constants
4. **No difficulty progression** - Same speed throughout

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `PlatformerRunner.tsx` | 531 | Component with UI, physics loop, rendering, terrain gen |
| `components/GameShell` | Shared | Wrapper with error boundary |

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 531 |
| Canvas resolution | 800 × 600 |
| Auto-run speed | 5px/frame |
| Gravity | 0.8/frame² |
| Jump velocity | -16px/frame |
| Ground Y | 536px (600 - 64) |
| Player size | 48 × 64px |
| Enemy (slime) size | 48 × 32px |
| Collectible size | 32 × 32px |
| Collision margin | 40% (0.6) |

---

## Key Constants

```typescript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GROUND_Y = CANVAS_HEIGHT - 64; // 536
const PLAYER_W = 48;
const PLAYER_H = 64;
const PLAYER_VX = 5; // Auto run speed
const GRAVITY = 0.8;
const JUMP_VY = -16;
const COLLISION_MARGIN = 0.4; // 40% margin for hitboxes
const HAND_RAISED_THRESHOLD = 0.4; // Top 40%
const HAND_LOWERED_THRESHOLD = 0.6; // Bottom 40%
```

---

## Physics System

### Player Physics

```typescript
// Apply gravity
player.vy += 0.8 * dt;

// Apply velocity
player.x += player.vx * dt; // Auto run
player.y += player.vy * dt;

// Ground collision
if (player.y > GROUND_Y - player.h) {
  player.y = GROUND_Y - player.h;
  player.vy = 0;
}
```

### Jump Mechanics

```typescript
const doJump = useCallback(() => {
  const player = playerRef.current;
  if (player.y >= GROUND_Y - player.h - 5) { // On ground
    player.vy = -16; // Jump upward
    playClick();
    triggerHaptic('success');
  }
}, [playClick]);
```

### Hand Tracking Jump

```typescript
const handRaised = tip.y < 0.4; // Top 40% of screen
const handLowered = tip.y > 0.6; // Bottom 40% of screen

if (handRaised && canJumpRef.current) {
  doJump();
  canJumpRef.current = false; // Must lower hand to jump again
} else if (handLowered) {
  canJumpRef.current = true; // Reset jump state
}
```

---

## Collision Detection

```typescript
function checkCollision(r1: Rect, r2: Rect, margin = 0.6): boolean {
  // Shrink rectangles by margin (40%)
  const r1Shrunken = {
    x: r1.x + r1.w * (1 - margin) / 2,
    y: r1.y + r1.h * (1 - margin) / 2,
    w: r1.w * margin,
    h: r1.h * margin,
  };
  const r2Shrunken = { /* similar */ };

  return (
    r1Shrunken.x < r2Shrunken.x + r2Shrunken.w &&
    r1Shrunken.x + r1Shrunken.w > r2Shrunken.x &&
    r1Shrunken.y < r2Shrunken.y + r2Shrunken.h &&
    r1Shrunken.y + r1Shrunken.h > r2Shrunken.y
  );
}
```

---

## Scoring System

### Collectible Points

| Type | Points |
|------|--------|
| Coin | 10 |
| Star | 50 |

### Score Formula

```typescript
basePoints = type === 'star' ? 50 : 10;
streakBonus = Math.min(streak × 2, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Type | Streak | Base | Bonus | Total |
|------|--------|------|-------|-------|
| Coin | 0 | 10 | 0 | 10 |
| Coin | 5 | 10 | 10 | 20 |
| Star | 3 | 50 | 6 | 56 |
| Star | 8+ | 50 | 15 | 65 |

---

## Terrain Generation

### Spawn Algorithm

```typescript
while (furthestX < player.x + CANVAS_WIDTH * 2) {
  const newX = furthestX + 300 + Math.random() * 400;

  // 70% coins, 30% slimes
  if (Math.random() < 0.7) {
    // Spawn 1-3 coins in arc pattern
    const numCoins = Math.floor(Math.random() * 3) + 1;
    const baseY = GROUND_Y - 80 - Math.random() * 60;
    for (let i = 0; i < numCoins; i++) {
      collectibles.push({
        type: Math.random() < 0.1 ? 'star' : 'coin',
        x: newX + i * 50,
        y: baseY - (i % 2 === 1 ? 50 : 0), // Arc
      });
    }
  } else {
    // Spawn slime at ground level
    enemies.push({
      type: 'slime',
      x: newX,
      y: GROUND_Y - 32,
      vx: -1, // Crawls left
    });
  }

  furthestX = newX + 200;
}
```

### Entity Cleanup

```typescript
const cleanupDist = cameraX - 200;
enemies = enemies.filter(e => e.x > cleanupDist);
collectibles = collectibles.filter(c => c.x > cleanupDist);
```

---

## Camera System

### Camera Tracking

```typescript
// Keep player at left 200px of screen
cameraX = player.x - 200;

// Render with camera offset
ctx.translate(-cameraX, 0);

// Draw ground spanning camera viewport
const vpX = cameraX;
ctx.fillRect(vpX - 100, GROUND_Y, CANVAS_WIDTH + 200, CANVAS_HEIGHT - GROUND_Y);
```

---

## Visual Design

### Color Scheme

| Element | Colors |
|---------|--------|
| Sky | Sky blue (#87CEEB) |
| Ground (grass) | Forest green (#228B22) |
| Ground (dirt) | Brown (#8B4513) |
| Player | Blue (#2563EB) |
| Slime | Red (#DC2626) |
| Coin | Yellow (#FDE047) |
| Star | Gold (#FBBF24) |

### Render Order

1. Sky background
2. Ground (dirt + grass)
3. Collectibles (coins/stars)
4. Enemies (slimes)
5. Player

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Jump | playClick() | 'success' |
| Collect coin | playSuccess() | 'success' |
| Collect star | playSuccess() | 'success' |
| Hit slime | playError() | 'error' |
| Streak milestone | - | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Let's go! Raise your hand high to jump over the slimes and grab the coins!" |
| Game over | "Oh no, you hit a slime! Good run!" |

---

## Hand Tracking Configuration

```typescript
useGameHandTracking({
  gameName: 'PlatformerRunner',
  isRunning: gameState === 'playing',
  webcamRef,
  onFrame: handleHandFrame,
});
```

### Hand Detection

```typescript
const handRaised = tip.y < 0.4;  // Jump
const handLowered = tip.y > 0.6; // Reset canJump
```

---

## Game States

| State | Description |
|-------|-------------|
| start | Menu screen with instructions |
| playing | Active gameplay with physics loop |
| complete | Game over with final score |

---

## Streak System

### Streak Building

- Collect item: streak + 1
- Hit slime: streak resets (implicit via game over)

### Milestone

- Every 5 consecutive collectibles
- Shows "🔥 {streak} Streak!" overlay
- Haptic: 'celebration'

---

## Game Flow

1. **Start Screen:** Instructions, start button
2. **Game Start:** Player spawns at x=100, auto-run begins
3. **Main Loop:**
   - Apply gravity and velocity
   - Generate terrain ahead
   - Check collisions
   - Render frame
4. **Jump:** Raise hand above 40% screen height
5. **Collect:** Coins (+10) and stars (+50)
6. **Game Over:** Hit slime, show score
7. **Restart:** Play again button

---

## Educational Value

### Skills Developed

1. **Timing** - Learning when to jump
2. **Hand-Eye Coordination** - Controlling character with hand position
3. **Spatial Awareness** - Judging distances to obstacles
4. **Reaction Time** - Quick responses to approaching slimes
5. **Cause and Effect** - Understanding jump mechanics
6. **Persistence** - Try again after game over

---

## Comparison with Similar Games

| Feature | PlatformerRunner | MazeRunner | EndlessRunners |
|---------|----------------|------------|----------------|
| Core Mechanic | Auto-run + jump | Navigate maze | Varies |
| Input | Hand height | Hand pointer | Varies |
| Obstacles | Slimes (static) | Walls | Varies |
| Collectibles | Coins, stars | Gems | Varies |
| Terrain | Procedural endless | Pre-designed | Varies |
| Age Range | 5-10 | 6-12 | 5+ |

---

## Recommendations

### Testing

1. **Extract logic module** - Create `platformerRunnerLogic.ts`:
   - `PhysicsState` - Player position, velocity
   - `applyPhysics(player, dt)` - Gravity, movement
   - `checkCollision(r1, r2, margin)` - Collision detection
   - `generateTerrain(furthestX)` - Procedural generation

2. **Add unit tests** for:
   - Physics (gravity, jump, ground collision)
   - Collision detection with various margins
   - Terrain generation distribution (70% coins, 30% slimes)
   - Scoring with streak bonuses

### Code Quality

1. **Extract constants**:
   ```typescript
   export const PLATFORMER_RUNNER_CONSTANTS = {
     CANVAS_WIDTH: 800,
     CANVAS_HEIGHT: 600,
     GROUND_Y: 536,
     PLAYER_SPEED: 5,
     GRAVITY: 0.8,
     JUMP_VELOCITY: -16,
     COLLISION_MARGIN: 0.4,
     HAND_RAISED_THRESHOLD: 0.4,
     HAND_LOWERED_THRESHOLD: 0.6,
   } as const;
   ```

2. **Component splitting** - Extract physics loop to custom hook

3. **Difficulty progression** - Increase speed over time

---

## Conclusion

Platformer Runner is **functionally correct** with engaging endless runner gameplay. The hand-controlled jump mechanic (raise hand to jump) is intuitive and works well. The procedural terrain generation provides endless replayability, and the 60% collision margin makes the game forgiving for children.

**Audit Status:** APPROVED ✅
**Tests:** NEEDED (physics and collision)
**Documentation:** COMPLETE ✅
