# Free Draw Game Specification

**Game ID:** `free-draw`
**World:** Learning
**Vibe:** Chill
**Age Range:** 2-6 years
**CV Requirements:** Hand tracking (optional)

---

## Overview

Free Draw is an open-ended creative canvas where children can paint with their fingers or hands. This is a pure expression game without objectives - just joyful creation. The game supports multiple brush types, colors, and includes features like undo/redo and canvas export.

### Tagline
"Create beautiful art with your finger! 🎨✨"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Color** - Choose from 12-color palette
2. **Draw** - Move finger/hand to draw on canvas
3. **Create** - Express imagination freely
4. **Save** - Export artwork as PNG
5. **Clear** - Start fresh when ready

### Controls

| Action | Input |
|--------|-------|
| Draw | Pinch and drag (hand) or click/drag (mouse) |
| Change color | Click color button |
| Clear canvas | Click "Clear" button |
| Save artwork | Click "Save" button |
| Back to menu | Click "Back" button |

---

## Color Palette

### 12 Colors

| Hex | Color | Hex | Color |
|-----|-------|-----|-------|
| #000000 | Black | #ffffff | White |
| #ff0000 | Red | #ff8800 | Orange |
| #ffff00 | Yellow | #00ff00 | Green |
| #00ffff | Cyan | #0000ff | Blue |
| #8800ff | Purple | #ff00ff | Magenta |
| #ff69b4 | Pink | #8b4513 | Brown |

### Background Colors

| Hex | Name |
|-----|------|
| #ffffff | White |
| #000000 | Black |
| #fff8dc | Cream |
| #f0f8ff | Alice Blue |
| #f5f5dc | Beige |
| #ffe4e1 | Misty Rose |

---

## Brush Types

### 8 Brush Presets

| Type | Name | Emoji | Default Size |
|------|------|-------|--------------|
| round | Round Brush | 🖌️ | 15px |
| flat | Flat Brush | 🎨 | 20px |
| spray | Spray Paint | 🌫️ | 25px |
| glitter | Glitter | ✨ | 15px |
| neon | Neon Glow | 💡 | 18px |
| rainbow | Rainbow | 🌈 | 15px |
| marker | Marker | 🖊️ | 12px |
| eraser | Eraser | 🧼 | 30px |

### Brush Settings

```typescript
interface BrushSettings {
  type: BrushType;    // Brush type
  size: number;       // 5-50 pixels
  color: string;      // Hex color
  opacity: number;    // 0-1
  isRainbow: boolean; // Rainbow cycling override
}
```

---

## Canvas Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Canvas Size | 800×600 | Drawing area in pixels |
| Min Brush Size | 5px | Minimum stroke width |
| Max Brush Size | 50px | Maximum stroke width |
| Min Point Distance | 0.005 (normalized) | Smoothing threshold |
| Undo Stack Size | 20 | Maximum undo history |

---

## Drawing Mechanics

### Stroke Creation

1. **Start** - Pinch/click creates new stroke
2. **Continue** - Movement adds points to stroke
3. **End** - Release completes stroke

### Pressure Sensitivity

```typescript
adjustedSize = brush.size × pressure;
clampedSize = Math.max(5, Math.min(50, adjustedSize));
```

| Pressure | Size (for 15px brush) |
|----------|----------------------|
| 0.1 | 5px (min) |
| 0.5 | 7.5px |
| 1.0 | 15px |
| 2.0+ | 30px (max for 15px base) |

### Point Filtering

Points closer than 0.005 (normalized) are filtered out for smoothness.

### Rainbow Brush

Cycles through hue spectrum:
```typescript
newHue = (currentHue + 5) % 360;
```

---

## Undo/Redo System

### Undo Stack

- Saves stroke history up to 20 levels
- Cleared on new stroke (redo stack)
- Preserves for canvas clearing

### Redo Stack

- Populated when undo is performed
- Cleared on new action
- Max 20 levels (from undo history)

### Operations

| Action | Undo Effect | Redo Effect |
|--------|-------------|-------------|
| Draw stroke | Removes stroke | Restores stroke |
| Clear canvas | Restores strokes | Clears again |
| New action | Clears redo stack | N/A |

---

## Color Mixing

### mixColors Function

Educational feature that mixes two colors:

```typescript
mixed.r = (color1.r + color2.r) / 2;
mixed.g = (color1.g + color2.g) / 2;
mixed.b = (color1.b + color2.b) / 2;
```

### Examples

| Color 1 | Color 2 | Result |
|---------|---------|--------|
| Red (#ff0000) | Blue (#0000ff) | Purple (~#7f007f) |
| Red (#ff0000) | Yellow (#ffff00) | Orange (~#7f7f00) |
| Black (#000000) | White (#ffffff) | Gray (#808080) |

---

## Visual Design

### UI Elements

- **Canvas:** 800×600 white drawing area
- **Color Palette:** 12 circular color buttons
- **Clear Button:** Red trash icon
- **Save Button:** Green save icon
- **Back Button:** Gray navigation
- **Milestone Overlay:** "🎨 X Strokes! 🎨" animation

### Stroke Milestones

Every 10 strokes:
- Full-screen overlay appears
- Shows stroke count with emoji
- Purple/pink gradient background
- 1.2 second display
- Haptic celebration

### Active Color Indicator

Selected color shows:
- Dark border (#1f2937)
- 110% scale
- Other colors have white border

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Color change | playClick() | 'success' |
| Stroke milestone | None | 'celebration' |
| Clear | playClick() | None |
| Save | playClick() | None |

---

## Gesture Detection

### Shake Detection

Detects rapid direction changes for clearing canvas:

```typescript
// Requirements:
// - 5+ velocity samples
// - 3+ direction changes
// - Speed > threshold (default 3)
```

Used for gesture-based canvas clearing (future feature).

---

## Data Structures

### Stroke

```typescript
interface Stroke {
  points: Point[];       // Array of x,y coordinates
  brush: BrushSettings;  // Brush used for stroke
  timestamp: number;     // Creation time
}
```

### Canvas State

```typescript
interface CanvasState {
  strokes: Stroke[];           // Completed strokes
  currentStroke: Stroke | null; // Currently drawing
  backgroundColor: string;      // Canvas background
}
```

### Game State

```typescript
interface GameState {
  canvas: CanvasState;
  currentBrush: BrushSettings;
  isDrawing: boolean;
  lastPoint: Point | null;
  undoStack: Stroke[][];
  redoStack: Stroke[][];
  brushColorHue: number;  // For rainbow brush
}
```

---

## Game Constants

```typescript
const MIN_BRUSH_SIZE = 5;
const MAX_BRUSH_SIZE = 50;
const MIN_POINT_DISTANCE = 0.005;
const UNDO_STACK_LIMIT = 20;
const RAINBOW_HUE_STEP = 5;
const STROKE_MILESTONE = 10;
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `FreeDraw.tsx` | 441 | Main component with canvas rendering |
| `freeDrawLogic.ts` | 436 | Game logic and state management |
| `freeDrawLogic.test.ts` | 381 | Unit tests (44 tests) |

### Architecture

- **Component** (`FreeDraw.tsx`): UI, canvas rendering, mouse/hand events, state
- **Logic** (`freeDrawLogic.ts`): Pure functions for strokes, colors, undo/redo
- **Tests** (`freeDrawLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Creativity & Expression**
   - Open-ended art creation
   - No "wrong" answers
   - Safe exploration space

2. **Fine Motor Skills**
   - Finger/hand coordination
   - Precision control
   - Pressure sensitivity awareness

3. **Color Recognition**
   - 12-color palette
   - Color name learning
   - Color mixing concepts

4. **Cause & Effect**
   - Drawing creates visible marks
   - Color choices affect appearance
   - Actions can be undone

5. **Digital Literacy**
   - Touch/mouse interface
   - Save/export concepts
   - Undo/redo understanding

---

## Comparison with Similar Games

| Feature | FreeDraw | ColorMixing | AirCanvas |
|---------|----------|-------------|-----------|
| Open-ended | Yes | Yes | Yes |
| Brush Types | 8 | 3 | 1 |
| Color Palette | 12 | Custom | Full spectrum |
| Undo/Redo | Yes (20 levels) | No | No |
| Export | PNG | No | No |
| Age Range | 2-6 | 3-8 | 3-8 |
| Vibe | Chill | Chill | Chill |

---

## Test Coverage

### Test Suite: `freeDrawLogic.test.ts`

**44 tests covering:**

*COLOR_PALETTE (3 tests)*
*BACKGROUND_COLORS (2 tests)*
*BRUSH_PRESETS (3 tests)*
*mixColors (4 tests)*
*detectShake (2 tests, 1 skipped)*
*initializeGame (5 tests)*
*startStroke (2 tests)*
*continueStroke (2 tests)*
*endStroke (2 tests)*
*undo (2 tests)*
*redo (2 tests)*
*clearCanvas (2 tests)*
*setBrushType (2 tests)*
*setBrushColor (1 test)*
*setBrushSize (3 tests)*
*isCanvasEmpty (2 tests)*
*getStrokeCount (1 test)*
*getColorName (3 tests)*

**All tests passing ✅ (44/44, 1 skipped)**

---

## Progress Tracking

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('free-draw');

// On exit with artwork
await onGameComplete(100);  // Fixed score for completion
```

### Metadata Tracked

```typescript
{
  strokesCreated: number,  // Count of completed strokes
  brushType: string        // Last used brush type
}
```

---

## Accessibility

### Subscription Required

FreeDraw requires premium subscription access (checked via `useSubscription`).

### Input Flexibility

- **Hand Tracking:** Pinch and drag
- **Mouse:** Click and drag
- **Touch:** Finger painting

---

## Canvas Export

### Export Function

```typescript
function exportCanvas(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
```

### Download Format

- **Format:** PNG
- **Filename:** `free-draw-{timestamp}.png`
- **Quality:** Lossless

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
