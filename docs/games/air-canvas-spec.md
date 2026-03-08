# Air Canvas Game Specification

**Game ID:** `air-canvas`
**World:** Creative
**Vibe:** Chill
**Age Range:** 3-10 years
**CV Requirements:** None

---

## Overview

Air Canvas is a creative drawing game where children draw in the air with their finger, creating glowing light trails on screen. The game features multiple brush types, colors, and visual effects.

### Tagline
"Draw in the Air! ✨"

---

## Game Mechanics

### Core Gameplay Loop

1. **Move Hand** - Track hand/finger position
2. **Create Strokes** - Draw glowing light trails
3. **Change Colors** - Cycle through color palette
4. **Switch Brushes** - Try different visual effects
5. **Shake to Clear** - Rapid hand shake clears canvas

### Controls

| Action | Input |
|--------|-------|
| Draw | Move hand/finger |
| Change color | Tap button or gesture |
| Change brush | Tap button or gesture |
| Clear canvas | Shake hand rapidly |

---

## Brush Types

### 4 Brush Styles

| Brush | Line Width | Shadow Blur | Effect |
|-------|------------|-------------|--------|
| rainbow | 6px | 12px | Rainbow hue gradient |
| sparkle | 3px | 20px | White sparkle effect |
| neon | 8px | 25px | Bright neon glow |
| glow | 14px | 30px | Soft diffuse glow |

---

## Color Palette

### 6 Colors

| Index | Color | Name |
|-------|-------|------|
| 0 | #FF0000 | Red |
| 1 | #FF8800 | Orange |
| 2 | #FFFF00 | Yellow |
| 3 | #00CC00 | Green |
| 4 | #0088FF | Blue |
| 5 | #AA00FF | Purple |

---

## Stroke Management

### Data Structures

```typescript
interface StrokePoint {
  x: number;        // 0-1 normalized
  y: number;        // 0-1 normalized
  timestamp: number;
}

interface Stroke {
  points: StrokePoint[];
  brushType: BrushType;
  color: string;
}
```

### Stroke Lifecycle

```typescript
// Create new stroke
stroke = createStroke(brushType, color);

// Add points while drawing
stroke = addPointToStroke(stroke, x, y, timestamp);
```

---

## Shake Detection

### Algorithm

```typescript
function detectShake(
  positions: Array<{ x: number; y: number; t: number }>,
  threshold: number = 0.08
): boolean

// 1. Need at least 4 positions
// 2. Calculate velocity between consecutive positions
// 3. Average velocities must exceed threshold
```

### Velocity Calculation

```
velocity = distance(position[i], position[i-1]) / timeDelta
avgVelocity = sum(velocities) / count
shakeDetected = avgVelocity > threshold
```

---

## Rainbow Brush

### Hue Calculation

```typescript
function getRainbowHue(pointIndex: number, totalPoints: number): number
hue = (pointIndex / totalPoints) * 360
```

### Example

For a stroke with 100 points:
- Point 0: hue = 0° (red)
- Point 25: hue = 90° (yellow/green)
- Point 50: hue = 180° (cyan)
- Point 75: hue = 270° (purple)
- Point 99: hue = 356° (red)

---

## Visual Design

### UI Elements

- **Canvas:** Full-screen drawing area
- **Color Picker:** Color palette buttons
- **Brush Selector:** Brush type buttons
- **Clear Button:** Manual clear option
- **Stroke Counter:** Number of strokes drawn

### Rendering

| Element | Style |
|---------|-------|
| Background | Dark/black for glow effect |
| Strokes | Composite additive blending |
| Line Cap | Round |
| Shadow | Dynamic based on brush |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start stroke | playBrush() | None |
| Change color | playClick() | None |
| Change brush | playWhoosh() | None |
| Clear canvas | playShake() | 'light' |
| Complete drawing | playSparkle() | 'success' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Brush types | 4 | rainbow, sparkle, neon, glow |
| Colors | 6 | Rainbow spectrum |
| Shake threshold | 0.08 | Velocity for clear |
| Min shake positions | 4 | Points required |
| Max strokes | No limit | Free drawing |

---

## Data Structures

### Brush Type

```typescript
type BrushType = 'rainbow' | 'sparkle' | 'neon' | 'glow';
```

### Stroke Point

```typescript
interface StrokePoint {
  x: number;        // 0-1 normalized
  y: number;        // 0-1 normalized
  timestamp: number;
}
```

### Stroke

```typescript
interface Stroke {
  points: StrokePoint[];
  brushType: BrushType;
  color: string;
}
```

### Brush Config

```typescript
interface BrushRenderConfig {
  lineWidth: number;
  shadowBlur: number;
  shadowColor: string;
  globalAlpha: number;
  lineCap: CanvasLineCap;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `AirCanvas.tsx` | ~ | Main component with canvas rendering |
| `airCanvasLogic.ts` | 153 | Brush configs, stroke management, shake detection |
| `airCanvasLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`AirCanvas.tsx`): Canvas rendering, event handling, state
- **Logic** (`airCanvasLogic.ts`): 153 lines - Pure functions for brushes, colors, strokes
- **Tests** (`airCanvasLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Fine Motor Skills**
   - Hand-eye coordination
   - Precision movement
   - Spatial awareness

2. **Creativity**
   - Artistic expression
   - Color exploration
   - Visual design

3. **Technology Literacy**
   - Gesture control
   - Digital drawing
   - Interface understanding

4. **Self-Expression**
   - Free drawing
   - Emotional outlet
   - Confidence building

---

## Cognitive Concepts Taught

1. **Spatial Relations** - 2D coordinate system
2. **Color Theory** - Color relationships
3. **Motion** - Speed and velocity
4. **Patterns** - Visual repetition
5. **Cause/Effect** - Hand movement creates drawing

---

## Comparison with Similar Games

| Feature | AirCanvas | FreeDraw | MirrorDraw |
|---------|-----------|----------|------------|
| Domain | Gesture Drawing | Touch Drawing | Symmetry Drawing |
| Age Range | 3-10 | 3-10 | 4-10 |
| Input | Hand gesture | Touch | Touch |
| Brushes | 4 types | Variable | Variable |
| Colors | 6 | Variable | Variable |
| Clear method | Shake | Button | Button |
| Test Coverage | ~ tests | ~ tests | ~ tests |
| Vibe | Chill | Creative | Creative |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
