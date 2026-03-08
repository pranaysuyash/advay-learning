# Digital Jenga Game Specification

**Game ID:** `digital-jenga`
**World:** Physics
**Vibe:** Active
**Age Range:** 6-12 years
**CV Requirements:** None

---

## Overview

Digital Jenga is a physics-based tower building game where children carefully remove blocks from a tower and place them on top without toppling it. The game teaches balance, patience, and spatial reasoning.

### Tagline
"Pull it out, stack it on top! Don't let it fall! 🏗️"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Tower** - 3D tower of stacked blocks
2. **Select Block** - Choose a loose block to remove
3. **Pull Block** - Carefully extract the block
4. **Place on Top** - Stack removed block on top
5. **Check Stability** - Tower may wobble or fall
6. **Continue** - Remove more blocks until tower falls

### Controls

| Action | Input |
|--------|-------|
| Select block | Click/tap block |
| Pull block | Drag or double-click |
| Rotate view | Drag background |
| Zoom | Pinch or scroll |

---

## Difficulty Levels

### 3 Levels

| Level | Initial Height | Blocks | Description |
|-------|----------------|--------|-------------|
| 1 | 3 layers | 9 | Easy start |
| 2 | 5 layers | 15 | Medium height |
| 3 | 7 layers | 21 | Challenging tower |

### Tower Structure

- Each layer has 3 blocks
- Layers alternate orientation (0° or 90°)
- Even layers: blocks aligned along X-axis
- Odd layers: blocks aligned along Z-axis

---

## Block Properties

### Block Data Structure

```typescript
interface Block {
  id: number;                    // Unique identifier
  position: [number, number, number];  // [x, y, z] in 3D space
  rotation: [number, number, number];  // [x, y, z] rotation (radians)
  color: string;                 // Hex color
}
```

### Block Dimensions

```typescript
const blockSize = {
  x: 1,   // Width
  y: 0.3, // Height
  z: 0.3, // Depth
};
```

### Block Colors

7 colors cycle through layers:

| Layer | Color | Hex |
|-------|-------|-----|
| 0 | Red | #EF4444 |
| 1 | Orange | #F97316 |
| 2 | Yellow | #EAB308 |
| 3 | Green | #22C55E |
| 4 | Blue | #3B82F6 |
| 5+ | Purple | #A855F7 |
| ... | (cycles) | ... |

---

## Tower Generation

### Algorithm

```typescript
for (layerY = 0; layerY < initialHeight; layerY++) {
  isEvenLayer = (layerY % 2 === 0);

  for (blockX = 0; blockX < 3; blockX++) {
    block = {
      id: blocks.length,
      position: [
        isEvenLayer ? blockX - 1 : 0,
        layerY × blockSize.y + blockSize.y / 2,
        isEvenLayer ? 0 : blockX - 1
      ],
      rotation: [0, isEvenLayer ? 0 : π/2, 0],
      color: BLOCK_COLORS[layerY % BLOCK_COLORS.length],
    };
    blocks.push(block);
  }
}
```

### Position Examples

**Layer 0 (Even):**
- Block 0: position [-1, 0.15, 0], rotation [0, 0, 0]
- Block 1: position [0, 0.15, 0], rotation [0, 0, 0]
- Block 2: position [1, 0.15, 0], rotation [0, 0, 0]

**Layer 1 (Odd):**
- Block 3: position [0, 0.45, -1], rotation [0, π/2, 0]
- Block 4: position [0, 0.45, 0], rotation [0, π/2, 0]
- Block 5: position [0, 0.45, 1], rotation [0, π/2, 0]

---

## Physics

### Gravity

- Constant downward force
- Affects all blocks
- Default: ~9.8 m/s²

### Collision

- Blocks collide with each other
- Ground plane at Y=0
- Friction between blocks

### Stability

- Tower wobbles when center of mass shifts
- Tower falls when stability threshold exceeded
- Toppling depends on block arrangement

---

## Visual Design

### UI Elements

- **Tower View:** 3D perspective of tower
- **Block Highlight:** Selected block glows
- **Stability Meter:** Shows how stable the tower is
- **Block Counter:** How many blocks successfully moved
- **Height Display:** Current tower height
- **Controls:** Zoom, rotate, reset

### Camera Controls

- **Orbit:** Rotate around tower
- **Pan:** Move camera position
- **Zoom:** In/out for detail or overview

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select block | playClick() | None |
| Pull block | slide sound | 'light' |
| Place on top | place sound | 'medium' |
| Tower wobble | creak sound | None |
| Tower falls | crash sound | 'heavy' |
| Win (all blocks) | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Initial height | 3-7 layers | By difficulty |
| Blocks per layer | 3 | Standard Jenga |
| Block size | 1×0.3×0.3 | Width×Height×Depth |
| Colors | 7 | Cycle through layers |
| Gravity | ~9.8 | Physics simulation |
| Win condition | All blocks moved | Or tower falls |

---

## Data Structures

### Block

```typescript
interface Block {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;
  initialHeight: number;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `DigitalJenga.tsx` | ~ | Main component with game loop |
| `digitalJengaLogic.ts` | 59 | Tower generation, block data |
| `digitalJengaLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`DigitalJenga.tsx`): UI, physics integration, game loop
- **Logic** (`digitalJengaLogic.ts`): Tower generation, block creation
- **Tests** (`digitalJengaLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Spatial Reasoning**
   - 3D visualization
   - Position understanding
   - Orientation awareness

2. **Physics Concepts**
   - Balance and stability
   - Center of mass
   - Gravity effects

3. **Fine Motor Skills**
   - Precise selection
   - Careful movements
   - Hand-eye coordination

4. **Patience & Focus**
   - Careful planning
   - Steady hands
   - Concentration

5. **Problem Solving**
   - Which block to remove
   - Predicting effects
   - Strategic thinking

---

## Physics Concepts Taught

1. **Gravity** - Downward force on objects
2. **Balance** - Center of mass importance
3. **Friction** - Blocks gripping each other
4. **Stability** - Why things fall
5. **Structure** - How arrangements affect strength

---

## Comparison with Similar Games

| Feature | DigitalJenga | ObstacleCourse | SteadyHand |
|---------|--------------|----------------|------------|
| Domain | Physics | Movement | Precision |
| Age Range | 6-12 | 5-10 | 5-10 |
| Core Mechanic | Remove blocks | Navigate obstacles | Hold steady |
| Input | Click/drag | Hand gestures | Hand steadiness |
| Difficulty | Height levels | Course length | Time duration |
| Physics | Yes | Some | No |
| 3D | Yes | No | No |
| Vibe | Active | Active | Chill |

---

## Example Gameplay

### Level 1 (3 layers, 9 blocks)

```
Initial Tower:
┌─────────┐
│ [O][O][O] │  Layer 2 (rotated)
│ [O][O][O] │  Layer 1 (rotated)
│ [O][O][O] │  Layer 0 (base)
└─────────┘

1. Select middle block from layer 0
2. Pull it out carefully
3. Place it on top
4. Tower now has 4 layers!
5. Repeat until tower falls
```

---

## Win Conditions

### Success

- Move all possible blocks
- Tower remains standing
- Highest tower wins

### Failure

- Tower topples over
- Blocks fall to ground
- Game over

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
