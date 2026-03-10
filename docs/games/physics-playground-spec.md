# Physics Playground Game Specification

**Game ID:** `physics-playground`
**Age Range:** 5-12
**CV Required:** Hand (optional)
**Vibe:** Discovery

---

## Overview

Physics Playground is an open-ended sandbox where children pour and mix different particle types. Each material behaves differently according to physics simulation - sand settles, water flows, fire rises, bubbles float. Features chalk drawing for creating ramps and containers.

---

## Core Mechanics

### Input Methods

| Method | Description |
|--------|-------------|
| Mouse/touch | Click/drag to pour particles |
| Hand tracking | Pinch to pour particles |
| Keyboard | 1-9,0 for materials, Space to spawn, C to clear |
| Draw mode | Draw chalk outlines |

### Game Loop

1. **Select Material:** Choose from 10 particle types
2. **Spawn:** Click/drag or pinch to pour particles
3. **Simulate:** Physics engine updates particles
4. **Interact:** Apply forces, draw chalk, clear
5. **Experiment:** Mix materials and observe reactions

---

## Particle Types

| Type | Label | Color | Density | Behavior |
|------|-------|-------|--------|----------|
| SAND | Sand | #e6c229 | Heavy | Settles quickly |
| WATER | Water | #4da6ff | 1.0 | Flows freely |
| FIRE | Fire | #ff6b35 | Light | Rises, burns leaves |
| BUBBLE | Bubbles | #ffffff | Very light | Floats upward |
| STAR | Stars | #ffd700 | Medium | Bouncy, sparkly |
| LEAF | Leaves | #90ee90 | Light | Fluttery |
| SEED | Seeds | #8B4513 | Medium | Grows plants when watered |
| GAS | Gas | #c2b280 | Light | Rises quickly |
| STEAM | Steam | #d0d0d0 | Light | Floats up (fire + water) |
| PLANT | Plants | #228B22 | Heavy | Grows from seeds |

---

## Simulation Features

### Physics

- **Gravity:** Pulls particles down
- **Collision:** Particles bounce off walls
- **Friction:** Particles slow on surfaces
- **Buoyancy:** Light particles float in heavy
- **Reactions:** Fire + water = steam

### Forces

- **Wind Gust:** Pushes all particles right and up
- **Gravity:** Constant downward force
- **Wall Bounce:** Particles reflect off walls

---

## Visual Design

### UI Elements

- **Canvas:** 960×540 main simulation area
- **Material Buttons:** 10 color-coded buttons
- **Active Material:** Shows selected material
- **Particle Counter:** Live particle count
- **Mode Toggle:** Pour elements vs Draw chalk

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Radial gradient (cream to blue) |
| Active button | Indigo (#6366F1) with shadow |
| Inactive button | White with gray border |
| Chalk lines | White (#FFFFFF) |

---

## Controls

### Mouse/Touch

| Action | Input |
|--------|-------|
| Spawn particles | Click or drag |
| Draw chalk | Switch to draw mode, drag to draw |
| Spawn at crosshair | Space bar |
| Move crosshair | Arrow keys |
| Clear canvas | C key |

### Hand Tracking

| Action | Input |
|--------|-------|
| Pour particles | Pinch while hovering |
| Cursor position | Follows index finger |
| Pinch indicator | Green when pinching |

---

## Game Constants

```typescript
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const PARTICLE_COUNT_LIMIT = 500;
const DEFAULT_SPAWN = 10; // particles per click
const SPRAY_BURST = 28; // particles for burst
const WIND_FORCE = { x: 1.75, y: -0.85 };
const GRAVITY = 0.8;
const BOUNCE_RESTITUTION = 0.5;
const WALL_MARGIN = 0;
const KEYBOARD_STEP = 24;
```

---

## Features

### Pour Elements Mode

- Click/drag to spawn particles at cursor
- Particles follow physics simulation
- Different materials have unique behaviors

### Draw Chalk Mode

- Draw white lines on canvas
- Lines become static bodies (ramps, walls, containers)
- Particles interact with chalk outlines

### Actions

| Button | Function |
|--------|----------|
| Launch Burst | Spray 28 particles randomly |
| Send Wind Gust | Push all particles |
| Pause Motion | Pause/resume simulation |
| Mute Sound | Toggle audio |
| Save Snapshot | Save canvas as image |
| Clear Playground | Remove all particles |

---

## Particle System

### Properties

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: ParticleType;
  color: string;
  properties: {
    density: number;
    restitution: number;
    friction: number;
    flammability: number;
  };
}
```

### Behaviors

- **Sand:** Falls and piles up
- **Water:** Flows and spreads
- **Fire:** Rises, ignites flammable objects
- **Bubbles:** Rise and pop at surface
- **Stars:** Bouncy, sparkle effect
- **Leaves:** Light, affected by wind
- **Seeds:** Static until watered
- **Gas:** Rises quickly
- **Steam:** Rises (created by fire + water)
- **Plants:** Grows from seed + water

---

## Chalk Drawing

### Static Bodies

Chalk lines become static physics bodies:

```typescript
addChalkOutline(points: Point[], color: string) {
  // Creates Matter.js body from drawn path
  // Particles collide with chalk
}
```

### Uses

- Ramps for particles to slide down
- Containers to hold particles
- Funnels to direct flow
- Platforms to separate materials

---

## Educational Value

### Skills Developed

1. **Scientific Thinking** - Experimenting with materials
2. **Cause & Effect** - Understanding physics interactions
3. **Creativity** - Building with chalk and particles
4. **Observation** - Watching material behaviors
5. **Problem Solving** - Directing flow with ramps
6. **Vocabulary** - Material names and properties

---

## Particle Interactions

| Material A | Material B | Result |
|------------|------------|--------|
| Fire | Water | Steam |
| Water | Seed | Plant |
| Sand | Water | Wet sand (slower) |
| Oil | Water | Oil floats on water |
| Leaf | Fire | Burns (creates gas/steam) |

---

## Accessibility

- **Multiple inputs:** Mouse, touch, keyboard, hand tracking
- **Self-paced:** No timer or objectives
- **Generous limits:** 500 particles for complexity
- **Visual feedback:** Color-coded materials
- **Audio feedback:** Sound on particle spawn
- **Keyboard shortcuts:** Full keyboard control available
| Shortcut | Action |
|----------|--------|
| 1-9, 0 | Select material |
| Space | Spawn at crosshair |
| Arrow keys | Move crosshair |
| W | Wind gust |
| C | Clear playground |
