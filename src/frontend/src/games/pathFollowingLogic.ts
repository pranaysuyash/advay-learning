/**
 * Path Following game logic — stay on the winding path.
 */

export interface PathPoint {
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  pathLength: number;
  pathWidth: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, pathLength: 8, pathWidth: 60 },
  { level: 2, pathLength: 12, pathWidth: 50 },
  { level: 3, pathLength: 16, pathWidth: 40 },
];

function generatePath(level: number): PathPoint[] {
  const config = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const points: PathPoint[] = [];
  let x = 50;
  let y = 50;

  for (let i = 0; i < config.pathLength; i++) {
    points.push({ x, y });
    const dir = Math.random();
    if (dir < 0.33) x += 60 + Math.random() * 30;
    else if (dir < 0.66) y += 60 + Math.random() * 30;
    else {
      x += 40;
      y += 40;
    }
  }

  return points;
}

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function createPath(level: number): {
  path: PathPoint[];
  config: LevelConfig;
} {
  const config = getLevelConfig(level);
  const path = generatePath(level);
  return { path, config };
}

export function isOnPath(
  x: number,
  y: number,
  path: PathPoint[],
  pathWidth: number,
): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const minX = Math.min(p1.x, p2.x) - pathWidth / 2;
    const maxX = Math.max(p1.x, p2.x) + pathWidth / 2;
    const minY = Math.min(p1.y, p2.y) - pathWidth / 2;
    const maxY = Math.max(p1.y, p2.y) + pathWidth / 2;
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) return true;
  }
  return false;
}
