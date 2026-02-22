/**
 * Free Draw / Finger Painting Game Logic
 * 
 * Open-ended creative canvas where children paint with their fingers.
 * Pure expression without objectives - just joyful creation!
 * 
 * Research Insights:
 * - Open-ended play builds creative confidence
 * - Color mixing teaches cause-and-effect scientifically
 * - No "wrong" answers = safe space for exploration
 * - Sensory play important for development
 * 
 * Age: 2-6 years
 * Category: Creativity / Art
 */

import type { Point } from '../types/tracking';

export type BrushType = 
  | 'round'      // Standard round brush
  | 'flat'       // Flat brush (oval)
  | 'spray'      // Spray paint effect
  | 'glitter'    // Sparkle particles
  | 'neon'       // Glow effect
  | 'rainbow'    // Cycling rainbow colors
  | 'marker'     // Marker pen
  | 'eraser';    // Eraser

export interface BrushSettings {
  type: BrushType;
  size: number;        // 5-50 pixels
  color: string;       // Hex color
  opacity: number;     // 0-1
  isRainbow: boolean;  // Override color with rainbow cycle
}

export interface Stroke {
  points: Point[];
  brush: BrushSettings;
  timestamp: number;
}

export interface CanvasState {
  strokes: Stroke[];
  currentStroke: Stroke | null;
  backgroundColor: string;
}

export interface GameState {
  canvas: CanvasState;
  currentBrush: BrushSettings;
  isDrawing: boolean;
  lastPoint: Point | null;
  undoStack: Stroke[][];
  redoStack: Stroke[][];
  brushColorHue: number;  // For rainbow brush
}

// Default colors palette
export const COLOR_PALETTE = [
  '#000000', // Black
  '#ffffff', // White
  '#ff0000', // Red
  '#ff8800', // Orange
  '#ffff00', // Yellow
  '#00ff00', // Green
  '#00ffff', // Cyan
  '#0000ff', // Blue
  '#8800ff', // Purple
  '#ff00ff', // Magenta
  '#ff69b4', // Pink
  '#8b4513', // Brown
];

// Predefined background colors
export const BACKGROUND_COLORS = [
  '#ffffff', // White
  '#000000', // Black
  '#fff8dc', // Cream
  '#f0f8ff', // Alice Blue
  '#f5f5dc', // Beige
  '#ffe4e1', // Misty Rose
];

// Brush presets
export const BRUSH_PRESETS: Record<BrushType, { name: string; emoji: string; defaultSize: number }> = {
  round: { name: 'Round Brush', emoji: '🖌️', defaultSize: 15 },
  flat: { name: 'Flat Brush', emoji: '🎨', defaultSize: 20 },
  spray: { name: 'Spray Paint', emoji: '🌫️', defaultSize: 25 },
  glitter: { name: 'Glitter', emoji: '✨', defaultSize: 15 },
  neon: { name: 'Neon Glow', emoji: '💡', defaultSize: 18 },
  rainbow: { name: 'Rainbow', emoji: '🌈', defaultSize: 15 },
  marker: { name: 'Marker', emoji: '🖊️', defaultSize: 12 },
  eraser: { name: 'Eraser', emoji: '🧼', defaultSize: 30 },
};

// Initialize game state
export function initializeGame(): GameState {
  return {
    canvas: {
      strokes: [],
      currentStroke: null,
      backgroundColor: '#ffffff',
    },
    currentBrush: {
      type: 'round',
      size: 15,
      color: '#000000',
      opacity: 1,
      isRainbow: false,
    },
    isDrawing: false,
    lastPoint: null,
    undoStack: [],
    redoStack: [],
    brushColorHue: 0,
  };
}

// Start a new stroke
export function startStroke(
  gameState: GameState,
  point: Point,
  pressure: number = 1
): GameState {
  // Save current state for undo
  const newUndoStack = [...gameState.undoStack, gameState.canvas.strokes];
  
  // Limit undo stack size
  if (newUndoStack.length > 20) {
    newUndoStack.shift();
  }
  
  const brush = { ...gameState.currentBrush };
  
  // Adjust size based on pressure (if supported)
  if (pressure > 0 && pressure < 2) {
    brush.size = Math.max(5, Math.min(50, brush.size * pressure));
  }
  
  const newStroke: Stroke = {
    points: [point],
    brush,
    timestamp: Date.now(),
  };
  
  return {
    ...gameState,
    canvas: {
      ...gameState.canvas,
      currentStroke: newStroke,
    },
    isDrawing: true,
    lastPoint: point,
    undoStack: newUndoStack,
    redoStack: [], // Clear redo on new action
  };
}

// Continue current stroke
export function continueStroke(
  gameState: GameState,
  point: Point
): GameState {
  if (!gameState.isDrawing || !gameState.canvas.currentStroke) {
    return gameState;
  }
  
  const currentStroke = gameState.canvas.currentStroke;
  const lastPoint = currentStroke.points[currentStroke.points.length - 1];
  
  // Distance check - only add point if moved enough
  const dx = point.x - lastPoint.x;
  const dy = point.y - lastPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 0.005) { // Minimum distance (normalized 0-1)
    return gameState;
  }
  
  // Update rainbow hue for rainbow brush
  let newHue = gameState.brushColorHue;
  if (currentStroke.brush.isRainbow) {
    newHue = (newHue + 5) % 360;
  }
  
  return {
    ...gameState,
    canvas: {
      ...gameState.canvas,
      currentStroke: {
        ...currentStroke,
        points: [...currentStroke.points, point],
      },
    },
    lastPoint: point,
    brushColorHue: newHue,
  };
}

// End current stroke
export function endStroke(gameState: GameState): GameState {
  if (!gameState.canvas.currentStroke) {
    return gameState;
  }
  
  const completedStroke = gameState.canvas.currentStroke;
  
  // Don't save empty strokes
  if (completedStroke.points.length < 2) {
    return {
      ...gameState,
      canvas: {
        ...gameState.canvas,
        currentStroke: null,
      },
      isDrawing: false,
      lastPoint: null,
    };
  }
  
  return {
    ...gameState,
    canvas: {
      ...gameState.canvas,
      strokes: [...gameState.canvas.strokes, completedStroke],
      currentStroke: null,
    },
    isDrawing: false,
    lastPoint: null,
  };
}

// Undo last stroke
export function undo(gameState: GameState): GameState {
  if (gameState.undoStack.length === 0) {
    return gameState;
  }
  
  const previousStrokes = gameState.undoStack[gameState.undoStack.length - 1];
  const newUndoStack = gameState.undoStack.slice(0, -1);
  
  return {
    ...gameState,
    canvas: {
      ...gameState.canvas,
      strokes: previousStrokes,
    },
    undoStack: newUndoStack,
    redoStack: [...gameState.redoStack, gameState.canvas.strokes],
  };
}

// Redo last undone stroke
export function redo(gameState: GameState): GameState {
  if (gameState.redoStack.length === 0) {
    return gameState;
  }
  
  const nextStrokes = gameState.redoStack[gameState.redoStack.length - 1];
  const newRedoStack = gameState.redoStack.slice(0, -1);
  
  return {
    ...gameState,
    canvas: {
      ...gameState.canvas,
      strokes: nextStrokes,
    },
    undoStack: [...gameState.undoStack, gameState.canvas.strokes],
    redoStack: newRedoStack,
  };
}

// Clear canvas
export function clearCanvas(gameState: GameState): GameState {
  // Save for undo
  const newUndoStack = [...gameState.undoStack, gameState.canvas.strokes];
  if (newUndoStack.length > 20) {
    newUndoStack.shift();
  }
  
  return {
    ...gameState,
    canvas: {
      ...gameState.canvas,
      strokes: [],
      currentStroke: null,
    },
    undoStack: newUndoStack,
    redoStack: [],
  };
}

// Set brush type
export function setBrushType(gameState: GameState, type: BrushType): GameState {
  const isRainbow = type === 'rainbow';
  
  return {
    ...gameState,
    currentBrush: {
      ...gameState.currentBrush,
      type,
      isRainbow,
    },
  };
}

// Set brush color
export function setBrushColor(gameState: GameState, color: string): GameState {
  return {
    ...gameState,
    currentBrush: {
      ...gameState.currentBrush,
      color,
      isRainbow: false,
    },
  };
}

// Set brush size
export function setBrushSize(gameState: GameState, size: number): GameState {
  return {
    ...gameState,
    currentBrush: {
      ...gameState.currentBrush,
      size: Math.max(5, Math.min(50, size)),
    },
  };
}

// Set background color
export function setBackgroundColor(gameState: GameState, color: string): GameState {
  return {
    ...gameState,
    canvas: {
      ...gameState.canvas,
      backgroundColor: color,
    },
  };
}

// Mix two colors (educational feature!)
export function mixColors(color1: string, color2: string): string {
  // Parse hex colors
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };
  
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return '#808080'; // Fallback gray
  
  // Mix using subtractive color model (like paint)
  const mixed = {
    r: Math.round((rgb1.r + rgb2.r) / 2),
    g: Math.round((rgb1.g + rgb2.g) / 2),
    b: Math.round((rgb1.b + rgb2.b) / 2),
  };
  
  // Convert back to hex
  return `#${mixed.r.toString(16).padStart(2, '0')}${mixed.g.toString(16).padStart(2, '0')}${mixed.b.toString(16).padStart(2, '0')}`;
}

// Get color name for display
export function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#000000': 'Black',
    '#ffffff': 'White',
    '#ff0000': 'Red',
    '#ff8800': 'Orange',
    '#ffff00': 'Yellow',
    '#00ff00': 'Green',
    '#00ffff': 'Cyan',
    '#0000ff': 'Blue',
    '#8800ff': 'Purple',
    '#ff00ff': 'Magenta',
    '#ff69b4': 'Pink',
    '#8b4513': 'Brown',
  };
  return colorNames[hex.toLowerCase()] || 'Custom';
}

// Detect shake gesture (for clearing canvas)
export function detectShake(
  velocityHistory: { x: number; y: number }[],
  threshold: number = 3
): boolean {
  if (velocityHistory.length < 5) return false;
  
  // Check for rapid direction changes
  let directionChanges = 0;
  let lastDirection = 0;
  
  for (let i = 1; i < velocityHistory.length; i++) {
    const vx = velocityHistory[i].x;
    const vy = velocityHistory[i].y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    
    if (speed > threshold) {
      const direction = Math.atan2(vy, vx);
      
      if (lastDirection !== 0) {
        const angleDiff = Math.abs(direction - lastDirection);
        if (angleDiff > Math.PI / 2) {
          directionChanges++;
        }
      }
      
      lastDirection = direction;
    }
  }
  
  return directionChanges >= 3;
}

// Export canvas as image
export function exportCanvas(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

// Check if canvas is empty
export function isCanvasEmpty(gameState: GameState): boolean {
  return gameState.canvas.strokes.length === 0 && !gameState.canvas.currentStroke;
}

// Get stroke count
export function getStrokeCount(gameState: GameState): number {
  return gameState.canvas.strokes.length;
}
