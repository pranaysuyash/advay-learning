# Design Document: Physics Playground

## Overview

Physics Playground is a comprehensive physics sandbox for kids to explore physics concepts through play. Unlike the current "Physics Demo" (a color-sorting prototype), this feature will be a rich, open-ended environment where children can experiment with cause-and-effect relationships, scientific exploration, and pure discovery without structured objectives.

The vision emphasizes "Learning IS playing" and "AI-Native Learning" - children explore physics concepts like gravity, friction, collisions, and particle interactions through hands-on experimentation. The app is designed for Generation Alpha who learn through exploration, not structured learning.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Physics Playground                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Particle   │  │   Hand       │  │   Audio      │          │
│  │   System     │  │   Tracking   │  │   System     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼───────┐                             │
│                    │   Canvas      │                             │
│                    │   Renderer    │                             │
│                    └───────┬───────┘                             │
│                            │                                     │
│                    ┌───────▼───────┐                             │
│                    │   State       │                             │
│                    │   Manager     │                             │
│                    └───────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

1. **Particle System**: Core physics simulation engine
2. **Hand Tracking**: MediaPipe integration for gesture detection
3. **Canvas Renderer**: HTML5 Canvas for particle visualization
4. **Audio System**: Web Audio API for sound effects
5. **State Manager**: Manages particle configurations and saved states

## Components and Interfaces

### Particle System

```typescript
interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number; // For particles that fade
  properties: ParticleProperties;
}

interface ParticleProperties {
  gravity: number;
  friction: number;
  restitution: number; // Bounciness
  density: number;
  specific: Record<string, any>;
}

enum ParticleType {
  SAND = 'sand',      // Heavy, settles quickly
  WATER = 'water',    // Fluid, flows freely
  FIRE = 'fire',      // Rises, burns leaves, creates gas with leaves
  BUBBLE = 'bubble',  // Floats upward gently
  STAR = 'star',      // Sparkly and bouncy
  LEAF = 'leaf',      // Light and fluttery, catches fire
  SEED = 'seed',      // Grows plants when watered
  GAS = 'gas',        // Rises quickly, created by fire + leaf
  STEAM = 'steam',    // Floats up, created by fire + water
  PLANT = 'plant'     // Static, created by water + seed
}
```

### Hand Tracking Interface

```typescript
interface HandTracking {
  isReady: boolean;
  handPosition: Vector2 | null;
  gestures: Gesture[];
  detectHand(): void;
  detectGesture(): Gesture | null;
}

interface Gesture {
  type: 'tap' | 'pinch' | 'swipe' | 'hold';
  position: Vector2;
  direction?: Vector2;
  duration?: number;
}
```

### Canvas Renderer

```typescript
interface CanvasRenderer {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  renderParticles(particles: Particle[]): void;
  renderBackground(): void;
  renderUI(): void;
}
```

### Audio System

```typescript
interface AudioSystem {
  playParticleAdd(): void;
  playCollision(particleType: ParticleType): void;
  playBoundaryCollision(particleType: ParticleType): void;
  setMuted(muted: boolean): void;
  isMuted: boolean;
}
```

### Elemental Reactions

When certain particle types collide, they can transform into new types:

| Reaction A | Reaction B | Result | Chance | Description |
|------------|------------|--------|--------|-------------|
| Fire | Leaf | Fire + Gas | 20% | Leaf catches fire and releases gas |
| Fire | Water | Steam | 50% | Fire extinguishes and creates steam |
| Water | Seed | Plant | 30% | Seed grows into a plant when watered |

These reactions encourage experimentation and discovery. Children can observe how different materials interact and create new materials.

```typescript
interface ElementalReaction {
  typeA: ParticleType;
  typeB: ParticleType;
  resultType: ParticleType | ParticleType[];
  probability: number; // 0-1
}
```

## Data Models

### Particle Configuration

```typescript
interface ParticleConfig {
  type: ParticleType;
  spawnRate: number; // Particles per second
  maxParticles: number;
  initialVelocity: Vector2;
  properties: ParticleProperties;
}
```

### Saved State

```typescript
interface SavedState {
  id: string;
  timestamp: number;
  particles: Particle[];
  settings: Settings;
}

interface Settings {
  particleCountLimit: number;
  audioEnabled: boolean;
  handTrackingEnabled: boolean;
  accessibilityMode: AccessibilityMode;
}

enum AccessibilityMode {
  NONE = 'none',
  KEYBOARD = 'keyboard',
  SCREEN_READER = 'screen_reader',
  HIGH_CONTRAST = 'high_contrast',
  COLORBLIND = 'colorblind',
  SWITCH_ACCESS = 'switch_access',
  VOICE_COMMANDS = 'voice_commands'
}
```

### Accessibility Implementation

The Physics Playground supports multiple accessibility modes to ensure inclusive play:

| Mode | Status | Description |
|------|--------|-------------|
| **NONE** | ✅ Implemented | Default mode, standard rendering |
| **KEYBOARD** | ✅ Implemented | Full keyboard controls: 1-9/0 for materials, arrow keys for cursor, Space to spawn, W for wind, C to clear |
| **HIGH_CONTRAST** | ✅ Implemented | High contrast color palette with distinct colors for all particle types. Black background with bright foreground colors. |
| **COLORBLIND** | ✅ Implemented | Adds patterns and shapes to particles beyond just color differentiation. Dots for sand, waves for water, triangles for fire, etc. |
| **SCREEN_READER** | 🔄 Planned | ARIA labels and live announcements for particle counts and interactions. Handled at component level. |
| **SWITCH_ACCESS** | 📋 Planned | Single-switch scanning mode for particle selection and interaction. |
| **VOICE_COMMANDS** | 📋 Planned | Voice commands for material selection and actions (e.g., "pour sand", "clear"). |

**Keyboard Controls (FULLY IMPLEMENTED)**:
- `1-9, 0` - Select particle type (1=Sand through 0=Plant)
- `Arrow Keys` - Move the crosshair emitter
- `Space` - Spawn particles at crosshair
- `W` - Send wind gust
- `C` - Clear playground
- `P` - Pause/Resume motion
- `M` - Mute/Unmute sound

**High Contrast Colors**:
- Sand: Yellow (#FFFF00)
- Water: Cyan (#00FFFF)
- Fire: Red (#FF0000)
- Bubbles: White (#FFFFFF)
- Stars: Magenta (#FF00FF)
- Leaves: Green (#00FF00)
- Seeds: Orange (#FF6600)
- Gas: Gray (#999999)
- Steam: Light Gray (#CCCCCC)
- Plants: Dark Green (#008000)

**Colorblind Patterns**:
- Sand: Small dots inside circle
- Water: Wavy line through circle
- Fire: Triangle overlay
- Seeds: Circle outline
- Other types: Distinct shapes (star, leaf)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Particle Type Rendering

*For any* particle type, when that type is selected, the system shall render and simulate particles with the correct physical properties for that type.

**Validates: Requirements 1.1, 2.1-2.7**

### Property 2: Particle Motion Conservation

*For any* particle in the system, the sum of forces acting on it (gravity, friction, collisions) shall determine its acceleration according to Newton's second law (F = ma).

**Validates: Requirements 1.2, 4.2**

### Property 3: Collision Response Consistency

*For any* two particles that collide, the post-collision velocities shall conserve momentum and follow the restitution coefficient for the particle types involved.

**Validates: Requirements 1.3, 4.3**

### Property 4: Multi-Particle Interaction Integrity

*For any* set of particles of different types, the system shall maintain separate physical properties for each type while allowing interactions between types.

**Validates: Requirements 1.4, 2.4**

### Property 5: Performance Threshold

*For any* simulation with up to 500 particles, the system shall maintain a minimum frame rate of 60fps on mid-range devices.

**Validates: Requirements 6.1**

### Property 6: Zero Objectives Compliance

*For any* user interaction with the system, the system shall not provide success/failure feedback, scores, timers, or progress indicators.

**Validates: Requirements 5.1-5.5**

### Property 7: Hand Tracking Fallback

*For any* scenario where hand tracking is unavailable, the system shall provide equivalent functionality through keyboard or touch input.

**Validates: Requirements 3.5, 7.1**

### Property 8: Visual Quality Consistency

*For any* particle type, the system shall render particles with appropriate colors, visual effects, and animations that match the particle's physical properties.

**Validates: Requirements 8.1-8.5**

### Property 9: Audio-Visual Synchronization

*For any* particle interaction (addition, collision, boundary contact), the system shall play appropriate sound effects that match the visual feedback.

**Validates: Requirements 9.1-9.5**

### Property 10: State Persistence

*For any* saved state, the system shall accurately restore all particle positions, types, properties, and settings when loaded.

**Validates: Requirements 10.1-10.5**

## Error Handling

### Particle System Errors

- **Simulation instability**: If particle count exceeds limits, gracefully degrade performance
- **Memory overflow**: Warn user and suggest reducing particle count
- **Invalid particle type**: Log error and use default particle type

### Hand Tracking Errors

- **Tracking loss**: Fall back to mouse/touch interaction
- **Gesture misinterpretation**: Use confidence thresholds and require consistent detection
- **Performance impact**: Reduce tracking frequency or disable if CPU usage is high

### Rendering Errors

- **Canvas not available**: Show error message and fallback UI
- **Rendering lag**: Reduce particle count or simplify visual effects
- **Color rendering issues**: Support accessibility modes (high contrast, colorblind)

### Audio Errors

- **Audio context suspended**: Resume on user interaction
- **Sound not playing**: Log warning and continue without audio
- **Browser not supported**: Disable audio features gracefully

## Testing Strategy

### Dual Testing Approach

**Unit tests**: Verify specific examples, edge cases, and error conditions
**Property tests**: Verify universal properties across all inputs

Both are complementary and necessary for comprehensive coverage.

### Property-Based Testing Configuration

- **Library**: fast-check (TypeScript)
- **Minimum iterations**: 100 per property test
- **Tag format**: **Feature: physics-playground, Property {number}: {property_text}**

### Unit Testing Balance

- **Unit tests**: Specific examples, edge cases, error conditions
- **Property tests**: Universal properties across all inputs

### Property Test Implementation

Each correctness property will be implemented as a separate property-based test using fast-check. Each test will be tagged with the property number and requirements it validates.

Example test structure:

```typescript
import * as fc from 'fast-check';

describe('Physics Playground - Property 1: Particle Type Rendering', () => {
  it('should render and simulate particles with correct properties', () => {
    fc.assert(
      fc.property(
        fc.oneOf(
          fc.constant(ParticleType.SAND),
          fc.constant(ParticleType.WATER),
          fc.constant(ParticleType.FIRE),
          fc.constant(ParticleType.BUBBLE),
          fc.constant(ParticleType.STAR),
          fc.constant(ParticleType.LEAF),
          fc.constant(ParticleType.SEED),
          fc.constant(ParticleType.GAS),
          fc.constant(ParticleType.STEAM),
          fc.constant(ParticleType.PLANT)
        ),
        (particleType) => {
          // Test implementation
          const particle = createParticle(particleType);
          expect(particle.type).toBe(particleType);
          expect(particle.properties).toBeDefined();
          // Additional assertions...
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage

- **Particle types**: All 10 particle types (sand, water, fire, bubbles, stars, leaves, seeds, gas, steam, plants)
- **Interactions**: Particle-particle, particle-boundary, particle-hand
- **Elemental reactions**: Fire+Leaf=Gas, Fire+Water=Steam, Water+Seed=Plant
- **Edge cases**: Empty canvas, maximum particles, rapid creation/deletion
- **Accessibility**: All accessibility modes (keyboard, screen reader, high contrast, colorblind, switch access, voice commands)
- **Performance**: Frame rate, memory usage, CPU usage
- **State management**: Save, load, restore operations
