# Kaleidoscope Hands - Game Specification

## Overview
**Game ID**: `kaleidoscope-hands`
**Educational Focus**: Creativity, symmetry, patterns, art
**Target Age**: 3-7 years
**Code Location**: `src/frontend/src/games/kaleidoscopeHandsLogic.ts`

## Game Description
Children move their hands to create beautiful symmetrical patterns on screen. Hand movements are mirrored across multiple segments to create kaleidoscope-like art. This game encourages creative expression while teaching concepts of symmetry and patterns.

## Educational Goals
1. Understand symmetry and reflection
2. Create and observe patterns
3. Practice creative expression
4. Develop hand-eye coordination

## Game Logic

### Interfaces

```typescript
interface KaleidoscopeSegment {
  angle: number;
  mirrors: number;
}

interface LevelConfig {
  level: number;
  segmentCount: number;
  colorMode: 'rainbow' | 'gradient' | 'solid';
}
```

### Level Configuration

| Level | Segments | Color Mode |
|-------|----------|------------|
| 1 | 4 | rainbow |
| 2 | 6 | gradient |
| 3 | 8 | rainbow |

### Color Palette

**COLORS array**: 15 hex colors
- Red/pink tones: #FF6B6B, #F1948A
- Teal/cyan tones: #4ECDC4, #45B7D1, #96CEB4, #98D8C8, #82E0AA
- Yellow tones: #FFEAA7, #F7DC6F
- Purple tones: #DDA0DD, #BB8FCE, #D2B4DE
- Blue tones: #85C1E9, #AED6F1

### Core Functions

#### `getLevelConfig(level)`
Gets configuration for a level.

**Parameters:**
- `level: number` - Level number (1-3)

**Returns:** `LevelConfig`

**Fallback:** Returns level 1 config for invalid levels.

#### `getRainbowColor(progress)`
Generates a rainbow HSL color based on progress.

**Parameters:**
- `progress: number` - Progress value (0-1)

**Returns:** HSL color string

**Formula:** `hue = (progress * 360) % 360`

#### `getGradientColor(progress)`
Returns a color from the gradient palette.

**Parameters:**
- `progress: number` - Progress value (0-1)

**Returns:** Hex color string

**Palette:** #FF6B6B → #4ECDC4 → #45B7D1

#### `getColorForPoint(mode, progress)`
Gets color for a point based on color mode.

**Parameters:**
- `mode: 'rainbow' | 'gradient' | 'solid'`
- `progress: number`

**Returns:** Color string

**Behavior:**
- `rainbow`: Uses `getRainbowColor`
- `gradient`: Uses `getGradientColor`
- `solid`: Random color from COLORS palette

## Game Progression

### Difficulty Scaling
- **Segments**: Increases from 4 to 8 (more mirror points)
- **Color modes**: Rainbow (full spectrum) vs Gradient (3-color) vs Solid (random)

### Symmetry Patterns
- Level 1 (4 segments): Cross/plus symmetry
- Level 2 (6 segments): Snowflake-like symmetry
- Level 3 (8 segments): Complex mandala patterns

## Technical Notes

### Test Coverage
- 45 tests covering:
  - Level configuration
  - Color palette
  - Color generation functions
  - Edge cases
  - Type definitions
  - Progression design

### Implementation Details
- Pure functional design
- HSL color space for smooth rainbow transitions
- Progress values wrap around (modulo 360)
- Solid mode uses random selection from 15-color palette

### Design Decisions
- Segments count determines symmetry complexity
- Rainbow mode uses full hue rotation (0-360°)
- Gradient mode uses 3-color transition
- Solid mode provides variety through random selection
