/**
 * Light Painter Game Logic
 * 
 * Children draw glowing light trails on a dark canvas.
 * Creates a "light painting" or "long exposure photography" effect.
 * 
 * Research Insights:
 * - Light/dark contrast is visually captivating for children
 * - Glowing effects create sense of magic/wonder
 * - Simple, unrestricted creative expression
 * - Cause-effect: touch = light
 * 
 * Age: 4-7 years
 * Category: Creativity / Art
 */

import type { Point } from '../types/tracking';

export type GlowColor = 
  | 'cyan'      // #00ffff
  | 'magenta'   // #ff00ff
  | 'lime'      // #00ff00
  | 'yellow'    // #ffff00
  | 'orange'    // #ff8800
  | 'pink'      // #ff69b4
  | 'white'     // #ffffff
  | 'red';      // #ff0000

export interface GlowSettings {
  color: GlowColor;
  size: number;      // Trail width: 8-40 pixels
  intensity: number; // Glow strength: 0.3-1.0
  isFading: boolean; // Trail fade effect
  fadeSpeed: number; // How fast trails fade: 0-1
}

export interface TrailPoint {
  point: Point;
  timestamp: number;
  color: GlowColor;
  size: number;
  intensity: number;
}

export interface CanvasState {
  trails: TrailPoint[];
  backgroundColor: string;
}

export interface GameState {
  canvas: CanvasState;
  currentGlow: GlowSettings;
  isDrawing: boolean;
  lastPoint: Point | null;
}

export const GLOW_COLORS: { id: GlowColor; hex: string; name: string }[] = [
  { id: 'cyan', hex: '#00ffff', name: 'Cyan' },
  { id: 'magenta', hex: '#ff00ff', name: 'Magenta' },
  { id: 'lime', hex: '#00ff00', name: 'Lime' },
  { id: 'yellow', hex: '#ffff00', name: 'Yellow' },
  { id: 'orange', hex: '#ff8800', name: 'Orange' },
  { id: 'pink', hex: '#ff69b4', name: 'Pink' },
  { id: 'white', hex: '#ffffff', name: 'White' },
  { id: 'red', hex: '#ff0000', name: 'Red' },
];

export const DEFAULT_GLOW_SETTINGS: GlowSettings = {
  color: 'cyan',
  size: 20,
  intensity: 0.8,
  isFading: true,
  fadeSpeed: 0.002,
};

export const BACKGROUND_COLORS = [
  '#0a0a0a', // Near black
  '#1a0a2e', // Dark purple
  '#0a1a2e', // Dark blue
  '#001a1a', // Dark teal
  '#1a001a', // Dark magenta
];

export function getColorHex(color: GlowColor): string {
  const found = GLOW_COLORS.find(c => c.id === color);
  return found?.hex ?? '#00ffff';
}

export function createInitialState(): GameState {
  return {
    canvas: {
      trails: [],
      backgroundColor: '#0a0a0a',
    },
    currentGlow: { ...DEFAULT_GLOW_SETTINGS },
    isDrawing: false,
    lastPoint: null,
  };
}

export function addTrailPoint(
  state: GameState,
  point: Point
): GameState {
  const newPoint: TrailPoint = {
    point,
    timestamp: Date.now(),
    color: state.currentGlow.color,
    size: state.currentGlow.size,
    intensity: state.currentGlow.intensity,
  };

  return {
    ...state,
    canvas: {
      ...state.canvas,
      trails: [...state.canvas.trails, newPoint],
    },
    lastPoint: point,
  };
}

export function updateGlowSettings(
  state: GameState,
  settings: Partial<GlowSettings>
): GameState {
  return {
    ...state,
    currentGlow: {
      ...state.currentGlow,
      ...settings,
    },
  };
}

export function clearCanvas(state: GameState): GameState {
  return {
    ...state,
    canvas: {
      ...state.canvas,
      trails: [],
    },
  };
}

export function setBackgroundColor(
  state: GameState,
  color: string
): GameState {
  return {
    ...state,
    canvas: {
      ...state.canvas,
      backgroundColor: color,
    },
  };
}

export function fadeOldTrails(state: GameState, maxAge: number = 5000): GameState {
  const now = Date.now();
  const fadedTrails = state.canvas.trails.filter(
    trail => now - trail.timestamp < maxAge
  );
  
  return {
    ...state,
    canvas: {
      ...state.canvas,
      trails: fadedTrails,
    },
  };
}
