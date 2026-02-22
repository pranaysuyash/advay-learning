/**
 * Air Canvas game logic — pure functions for the Air Canvas drawing game.
 *
 * Kids draw in the air with their finger, creating glowing light trails.
 * This module handles stroke management, brush configs, and color cycling.
 *
 * @see docs/plans/NEXT_3_GAMES_PLAN.md
 */

export type BrushType = 'rainbow' | 'sparkle' | 'neon' | 'glow';

export interface StrokePoint {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  timestamp: number;
}

export interface Stroke {
  points: StrokePoint[];
  brushType: BrushType;
  color: string;
}

export interface BrushRenderConfig {
  lineWidth: number;
  shadowBlur: number;
  shadowColor: string;
  globalAlpha: number;
  lineCap: CanvasLineCap;
}

export const COLORS: string[] = [
  '#FF0000', // Red
  '#FF8800', // Orange
  '#FFFF00', // Yellow
  '#00CC00', // Green
  '#0088FF', // Blue
  '#AA00FF', // Purple
];

export const BRUSH_TYPES: BrushType[] = ['rainbow', 'sparkle', 'neon', 'glow'];

/** Cycle to the next color in the palette, wrapping around. */
export function nextColor(current: string): string {
  const idx = COLORS.indexOf(current);
  if (idx < 0) return COLORS[0];
  return COLORS[(idx + 1) % COLORS.length];
}

/** Cycle to the next brush type, wrapping around. */
export function nextBrush(current: BrushType): BrushType {
  const idx = BRUSH_TYPES.indexOf(current);
  if (idx < 0) return BRUSH_TYPES[0];
  return BRUSH_TYPES[(idx + 1) % BRUSH_TYPES.length];
}

/** Create a new empty stroke. */
export function createStroke(brushType: BrushType, color: string): Stroke {
  return { points: [], brushType, color };
}

/** Add a point to a stroke, returning a new Stroke (immutable). */
export function addPointToStroke(
  stroke: Stroke,
  x: number,
  y: number,
  timestamp: number,
): Stroke {
  return {
    ...stroke,
    points: [...stroke.points, { x, y, timestamp }],
  };
}

/**
 * Detect rapid hand shake for canvas clear.
 *
 * Takes the last N positions with timestamps and computes average velocity.
 * Returns true when average frame-to-frame velocity exceeds the threshold.
 */
export function detectShake(
  positions: Array<{ x: number; y: number; t: number }>,
  threshold: number = 0.08,
): boolean {
  if (positions.length < 4) return false;

  let totalVelocity = 0;
  let segments = 0;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const dt = curr.t - prev.t;
    if (dt <= 0) continue;

    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalVelocity += dist / dt;
    segments++;
  }

  if (segments === 0) return false;
  return totalVelocity / segments > threshold;
}

/** Get a hue (0-360) for the rainbow brush based on point index. */
export function getRainbowHue(pointIndex: number, totalPoints: number): number {
  if (totalPoints <= 0) return 0;
  return (pointIndex / totalPoints) * 360;
}

/** Get canvas rendering config for a given brush type + color. */
export function getBrushConfig(
  brushType: BrushType,
  color: string,
): BrushRenderConfig {
  switch (brushType) {
    case 'rainbow':
      return {
        lineWidth: 6,
        shadowBlur: 12,
        shadowColor: color,
        globalAlpha: 0.9,
        lineCap: 'round',
      };
    case 'sparkle':
      return {
        lineWidth: 3,
        shadowBlur: 20,
        shadowColor: '#FFFFFF',
        globalAlpha: 0.85,
        lineCap: 'round',
      };
    case 'neon':
      return {
        lineWidth: 8,
        shadowBlur: 25,
        shadowColor: color,
        globalAlpha: 0.95,
        lineCap: 'round',
      };
    case 'glow':
      return {
        lineWidth: 14,
        shadowBlur: 30,
        shadowColor: color,
        globalAlpha: 0.6,
        lineCap: 'round',
      };
  }
}
