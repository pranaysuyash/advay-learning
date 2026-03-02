/**
 * Shape Stacker game logic — stack falling shapes.
 */

export interface FallingShape {
  id: number;
  x: number;
  y: number;
  shape: 'square' | 'circle' | 'triangle' | 'star';
  color: string;
}

export interface TargetSlot {
  id: number;
  shape: FallingShape['shape'];
  color: string;
  filled: boolean;
}

export interface LevelConfig {
  level: number;
  shapeCount: number;
  targetCount: number;
}

export const SHAPES: FallingShape['shape'][] = ['square', 'circle', 'triangle', 'star'];
export const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B'];

export const LEVELS: LevelConfig[] = [
  { level: 1, shapeCount: 5, targetCount: 3 },
  { level: 2, shapeCount: 7, targetCount: 4 },
  { level: 3, shapeCount: 10, targetCount: 5 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function createShapes(level: number): FallingShape[] {
  const config = getLevelConfig(level);
  return Array.from({ length: config.shapeCount }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: -10 - i * 15,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

export function createTargets(level: number): TargetSlot[] {
  const config = getLevelConfig(level);
  const slots: TargetSlot[] = [];
  const usedShapes = new Set<FallingShape['shape']>();

  for (let i = 0; i < config.targetCount; i++) {
    let shape: FallingShape['shape'];
    do {
      shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    } while (usedShapes.has(shape) && usedShapes.size < SHAPES.length);
    usedShapes.add(shape);

    slots.push({
      id: i,
      shape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      filled: false,
    });
  }

  return slots;
}

export function checkMatch(shape: FallingShape, slot: TargetSlot): boolean {
  return shape.shape === slot.shape && shape.color === slot.color;
}

export function updateShapePosition(shape: FallingShape, deltaY: number): FallingShape {
  return {
    ...shape,
    y: shape.y + deltaY,
  };
}

export function isShapeInTargetZone(shape: FallingShape, targetY: number): boolean {
  return shape.y >= targetY - 5 && shape.y <= targetY + 5;
}

export function calculateScore(matches: number, totalTargets: number, timeLeft: number): number {
  const accuracy = matches / totalTargets;
  return Math.round(accuracy * 1000 + timeLeft * 10);
}
