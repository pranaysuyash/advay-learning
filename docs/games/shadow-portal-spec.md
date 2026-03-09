# Shadow Portal - Game Specification

**Game ID:** `shadow-portal`
**Status:** ✅ Implemented (2026-03-09)
**Implementation File:** `src/frontend/src/pages/ShadowPortal.tsx` (814 lines)
**Last Updated:** 2026-03-09

---

## Overview

Shadow Portal is a creative, physically interactive game where children use their body silhouette to guide magical light particles into portals. The game emphasizes body awareness, spatial reasoning, and cause-and-effect learning through an engaging visual metaphor.

**Target Age:** 3-6 years (Band B)
**Session Length:** 2-3 minutes per level
**Core Fantasy:** Be a shadow wizard - use your body to guide magical light particles into portals

---

## Core Game Loop

```
┌─────────────┐
│  Camera     │ → Captures player silhouette
└─────────────┘
       ↓
┌─────────────┐
│  Particles  │ → Spawn from top, fall with gravity
└─────────────┘
       ↓
┌─────────────┐
│  Player     │ → Moves body to guide/bounce particles
└─────────────┘
       ↓
┌─────────────┐
│  Portals    │ → Particles enter → portal fills
└─────────────┘
       ↓
┌─────────────┐
│  Win/Lose   │ → 80% fill = win, 60s = lose
└─────────────┘
```

---

## Game Rules

### Controls

| Gesture | Action |
|---------|--------|
| **Move body/hands** | Create physical barrier for particles to bounce off |
| **Raise both arms** | Wind gust - pushes particles upward (3s cooldown) |
| **Mouse move** (fallback) | Creates temporary barrier at cursor |
| **Click** (fallback) | Wind gust at cursor location |

### Win Condition
- Portal fills to **80%** (target particle count reached) within **60 seconds**

### Lose Condition
- Timer reaches **0** before portal reaches target

### Scoring

| Event | Points |
|-------|--------|
| Particle enters portal | +1 |
| Streak bonus (every 10) | +5 to +25 |
| Level completion (time bonus) | +remaining seconds × 5 |

### Progression

| Level | Portals | Particle Speed | Spawn Rate | Target | Time |
|-------|---------|----------------|------------|--------|------|
| 1 | 1 (center) | 1.5 | 400ms | 15 particles | 60s |
| 2 | 2 (left/right) | 2.5 | 300ms | 20 each (40 total) | 60s |
| 3 | 2 (left/right) | 3.5 | 250ms | 25 each (50 total) | 60s |

---

## Visual Design

### Color Palette

| Element | Colors |
|---------|--------|
| Background | `#0f0f23` (dark purple/blue) |
| Portal glow | `#a855f7` (purple) |
| Portal inner | `#7c3aed` (deep purple) |
| Particles | `#fbbf24` (golden) |
| Wind gust | `rgba(56, 189, 248, 0.3)` (blue) |
| Silhouette | `rgba(15, 15, 35, 0.8)` (dark) |

### UI Elements

- **Portal:** Circular with glow effect, fill meter shows progress
- **Particles:** Small glowing circles that fall from top
- **Wind Gust:** Screen overlay with wind particles when active
- **HUD:** Level number, timer, score display
- **Streak Milestone:** Full-screen overlay every 10 particles

---

## Technical Implementation

### File Structure

```
src/
├── pages/
│   └── ShadowPortal.tsx          # Main game component
├── data/
│   └── gameRegistry.ts          # Game registry entry
└── App.tsx                      # Route configuration
```

### Key Constants

```typescript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PARTICLE_RADIUS = 8;
const GRAVITY = 0.15;
const BOUNCE_DAMPING = 0.6;
const ARMS_UP_THRESHOLD = 0.45;  // Normalized Y position
const WIND_GUST_COOLDOWN_MS = 3000;
const LEVEL_DURATION_SECONDS = 60;
```

### Canvas Rendering

- **Target FPS:** 60fps for game loop
- **Hand Tracking FPS:** 30fps
- **Particle Limit:** 100 active particles

### Collision Detection

```typescript
// Circle-circle collision
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}

// Portal hit detection (generous 2x hitbox)
if (distance(particle, portal) < portal.radius + PARTICLE_RADIUS * 2) {
  // Particle enters portal
}
```

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Particle spawn | - | - |
| Particle enters portal | `playSuccess()` | 'success' |
| Wind gust | `playPop()` | - |
| Level complete | `playCelebration()` | 'celebration' |
| Game over | `playError()` | 'error' |

---

## Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Move your body to guide the lights into the portal!" |
| Level start | "Level {N}! Guide more lights into the portals!" |
| Portal full | "Portal full!" |
| Level complete | "Amazing! You filled all the portals!" |
| Game over | "Time's up! Try again!" |
| Arms up cooldown | "Cooling down..." |

---

## Fallback Controls

When camera is unavailable or disabled:

| Input | Action |
|-------|--------|
| Mouse move | Creates barrier at cursor position (60px radius) |
| Mouse click | Wind gust at cursor |
| Touch | Same as mouse |

---

## Easter Eggs

| ID | Name | Trigger | Reward |
|----|------|---------|--------|
| `egg-shadow-master` | Shadow Master | Complete all 3 levels without missing a single particle | element-un |

---

## Accessibility Features

- **Voice instructions:** All major events announced
- **Visual feedback:** Clear portal fill progress
- **Large targets:** Portals are 25% of screen width
- **Forgiving hitboxes:** 2x particle radius for portal entry
- **Grace period:** First 10 seconds don't count down timer
- **Fallback mode:** Full mouse/touch support

---

## Educational Value

### Skills Developed

1. **Body Awareness** - Understanding how body position affects the game
2. **Spatial Reasoning** - Predicting particle movement and bounce angles
3. **Cause and Effect** - Seeing how body position changes particle paths
4. **Timing** - Learning when to use wind gust
5. **Visual-Motor Coordination** - Tracking multiple moving objects
6. **Collaboration** - Body as an extension of will/intention

### Learning Objectives

- **Physics intuition:** Objects fall, bounce, can be pushed
- **Spatial reasoning:** Barriers redirect moving objects
- **Body agency:** My body can change the world
- **Patience:** Wait for the right moment to act

---

## Future Enhancements

### Potential Features

1. **Multiplayer mode** - Two players create barriers together
2. **Obstacles** - Static blockers that particles must navigate around
3. **Power-ups** - Freeze particles, attract particles, etc.
4. **Theme system** - Space, jungle, ocean themes
5. **Silhouette customization** - Different silhouette styles

---

## Testing Checklist

### Pre-Launch QA

- [ ] All 3 levels playable and winnable
- [ ] Timer counts down correctly
- [ ] Win condition triggers at 80% fill
- [ ] Lose condition triggers at 0s
- [ ] Wind gust works with arms raised
- [ ] Wind gust has cooldown (3s)
- [ ] Fallback mouse mode works
- [ ] Particles bounce off canvas edges
- [ ] Portal fill meter updates correctly
- [ ] Streak milestones trigger every 10 particles
- [ ] Celebration on win
- [ ] "Try again" on lose
- [ ] Voice instructions play
- [ ] No breaking errors in console

### User Testing (5+ children ages 3-6)

- [ ] Child understands goal within 30 seconds
- [ ] Child can complete Level 1 independently
- [ ] Smiles/positive emotional response
- [ ] Wants to play again
- [ ] No frustration or confusion

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame rate | 60fps (game), 30fps (tracking) |
| Particle count | Max 100 active |
| Canvas render | < 16ms per frame |
| Hand tracking latency | < 100ms to cursor |
| Loading time | < 3s to first frame |

---

## Known Limitations

1. **No silhouette rendering** - Currently uses hand position only (pose detection could add full body silhouette)
2. **Single device only** - Not optimized for multiplayer yet
3. **Lighting dependent** - Very bright/dark environments affect tracking
4. **No difficulty adjustment** - Currently fixed 3-level progression

---

## Credits

**Design:** Based on "Shadow Portal" concept from `docs/GAME_IDEAS_CATALOG.md`
**Implementation:** 2026-03-09
**Priority:** P0 (wow factor + low precision requirement)
