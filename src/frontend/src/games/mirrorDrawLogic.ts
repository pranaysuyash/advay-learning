/**
 * Mirror Draw game logic — pure functions for the Mirror Draw symmetry game.
 *
 * Half a shape is shown on the left; kids trace the mirror on the right.
 * This module handles templates, path matching, and scoring.
 *
 * @see docs/plans/NEXT_3_GAMES_PLAN.md
 */

export interface MirrorTemplate {
  id: string;
  name: string;
  emoji: string;
  level: 1 | 2 | 3 | 4;
  /** Points defining the left half. x: 0=left edge, 0.5=center. y: 0=top, 1=bottom. */
  points: Array<{ x: number; y: number }>;
}

export interface MatchScore {
  accuracy: number; // 0-1
  stars: 0 | 1 | 2 | 3;
  passed: boolean;
}

export interface LevelConfig {
  level: number;
  passThreshold: number;
  templateCount: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, passThreshold: 0.4, templateCount: 5 },
  { level: 2, passThreshold: 0.55, templateCount: 5 },
  { level: 3, passThreshold: 0.65, templateCount: 5 },
  { level: 4, passThreshold: 0.75, templateCount: 5 },
];

// ---------------------------------------------------------------------------
// Templates — 20 half-shapes (5 per level)
// Points define the LEFT half in normalized coords.
// ---------------------------------------------------------------------------

const LEVEL_1_TEMPLATES: MirrorTemplate[] = [
  {
    id: 'heart',
    name: 'Heart',
    emoji: '❤️',
    level: 1,
    points: [
      { x: 0.50, y: 0.35 },
      { x: 0.42, y: 0.22 },
      { x: 0.30, y: 0.20 },
      { x: 0.20, y: 0.25 },
      { x: 0.15, y: 0.35 },
      { x: 0.18, y: 0.48 },
      { x: 0.25, y: 0.58 },
      { x: 0.35, y: 0.68 },
      { x: 0.50, y: 0.80 },
    ],
  },
  {
    id: 'circle',
    name: 'Circle',
    emoji: '⭕',
    level: 1,
    points: [
      { x: 0.50, y: 0.20 },
      { x: 0.40, y: 0.22 },
      { x: 0.30, y: 0.28 },
      { x: 0.22, y: 0.38 },
      { x: 0.20, y: 0.50 },
      { x: 0.22, y: 0.62 },
      { x: 0.30, y: 0.72 },
      { x: 0.40, y: 0.78 },
      { x: 0.50, y: 0.80 },
    ],
  },
  {
    id: 'square',
    name: 'Square',
    emoji: '⬜',
    level: 1,
    points: [
      { x: 0.50, y: 0.25 },
      { x: 0.20, y: 0.25 },
      { x: 0.20, y: 0.75 },
      { x: 0.50, y: 0.75 },
    ],
  },
  {
    id: 'star',
    name: 'Star',
    emoji: '⭐',
    level: 1,
    points: [
      { x: 0.50, y: 0.15 },
      { x: 0.44, y: 0.35 },
      { x: 0.25, y: 0.35 },
      { x: 0.40, y: 0.50 },
      { x: 0.32, y: 0.70 },
      { x: 0.50, y: 0.58 },
    ],
  },
  {
    id: 'moon',
    name: 'Moon',
    emoji: '🌙',
    level: 1,
    points: [
      { x: 0.50, y: 0.20 },
      { x: 0.40, y: 0.25 },
      { x: 0.32, y: 0.35 },
      { x: 0.28, y: 0.50 },
      { x: 0.32, y: 0.65 },
      { x: 0.40, y: 0.75 },
      { x: 0.50, y: 0.80 },
    ],
  },
];

const LEVEL_2_TEMPLATES: MirrorTemplate[] = [
  {
    id: 'butterfly',
    name: 'Butterfly',
    emoji: '🦋',
    level: 2,
    points: [
      { x: 0.50, y: 0.25 },
      { x: 0.40, y: 0.20 },
      { x: 0.25, y: 0.22 },
      { x: 0.15, y: 0.30 },
      { x: 0.12, y: 0.42 },
      { x: 0.20, y: 0.48 },
      { x: 0.35, y: 0.50 },
      { x: 0.50, y: 0.50 },
      { x: 0.35, y: 0.52 },
      { x: 0.20, y: 0.55 },
      { x: 0.15, y: 0.65 },
      { x: 0.22, y: 0.75 },
      { x: 0.35, y: 0.78 },
      { x: 0.50, y: 0.75 },
    ],
  },
  {
    id: 'leaf',
    name: 'Leaf',
    emoji: '🍃',
    level: 2,
    points: [
      { x: 0.50, y: 0.20 },
      { x: 0.40, y: 0.25 },
      { x: 0.30, y: 0.33 },
      { x: 0.22, y: 0.45 },
      { x: 0.20, y: 0.55 },
      { x: 0.25, y: 0.65 },
      { x: 0.35, y: 0.72 },
      { x: 0.50, y: 0.80 },
    ],
  },
  {
    id: 'smiley',
    name: 'Smiley',
    emoji: '😊',
    level: 2,
    points: [
      { x: 0.50, y: 0.18 },
      { x: 0.38, y: 0.20 },
      { x: 0.25, y: 0.28 },
      { x: 0.18, y: 0.40 },
      { x: 0.15, y: 0.52 },
      { x: 0.18, y: 0.65 },
      { x: 0.25, y: 0.75 },
      { x: 0.38, y: 0.80 },
      { x: 0.50, y: 0.82 },
    ],
  },
  {
    id: 'fish',
    name: 'Fish',
    emoji: '🐟',
    level: 2,
    points: [
      { x: 0.50, y: 0.40 },
      { x: 0.40, y: 0.32 },
      { x: 0.30, y: 0.28 },
      { x: 0.20, y: 0.32 },
      { x: 0.15, y: 0.42 },
      { x: 0.15, y: 0.55 },
      { x: 0.20, y: 0.65 },
      { x: 0.30, y: 0.70 },
      { x: 0.40, y: 0.65 },
      { x: 0.50, y: 0.58 },
    ],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    level: 2,
    points: [
      { x: 0.50, y: 0.20 },
      { x: 0.30, y: 0.35 },
      { x: 0.20, y: 0.50 },
      { x: 0.30, y: 0.65 },
      { x: 0.50, y: 0.80 },
    ],
  },
];

const LEVEL_3_TEMPLATES: MirrorTemplate[] = [
  {
    id: 'flower',
    name: 'Flower',
    emoji: '🌸',
    level: 3,
    points: [
      { x: 0.50, y: 0.22 },
      { x: 0.40, y: 0.18 },
      { x: 0.30, y: 0.22 },
      { x: 0.32, y: 0.32 },
      { x: 0.42, y: 0.35 },
      { x: 0.50, y: 0.38 },
      { x: 0.38, y: 0.40 },
      { x: 0.28, y: 0.38 },
      { x: 0.20, y: 0.42 },
      { x: 0.22, y: 0.52 },
      { x: 0.32, y: 0.55 },
      { x: 0.50, y: 0.55 },
      { x: 0.48, y: 0.65 },
      { x: 0.50, y: 0.80 },
    ],
  },
  {
    id: 'tree',
    name: 'Tree',
    emoji: '🌲',
    level: 3,
    points: [
      { x: 0.50, y: 0.15 },
      { x: 0.30, y: 0.30 },
      { x: 0.40, y: 0.30 },
      { x: 0.22, y: 0.48 },
      { x: 0.35, y: 0.48 },
      { x: 0.18, y: 0.65 },
      { x: 0.42, y: 0.65 },
      { x: 0.42, y: 0.85 },
      { x: 0.50, y: 0.85 },
    ],
  },
  {
    id: 'house',
    name: 'House',
    emoji: '🏠',
    level: 3,
    points: [
      { x: 0.50, y: 0.18 },
      { x: 0.15, y: 0.40 },
      { x: 0.15, y: 0.82 },
      { x: 0.35, y: 0.82 },
      { x: 0.35, y: 0.62 },
      { x: 0.50, y: 0.62 },
      { x: 0.50, y: 0.82 },
    ],
  },
  {
    id: 'car',
    name: 'Car',
    emoji: '🚗',
    level: 3,
    points: [
      { x: 0.50, y: 0.35 },
      { x: 0.40, y: 0.28 },
      { x: 0.30, y: 0.28 },
      { x: 0.20, y: 0.35 },
      { x: 0.15, y: 0.45 },
      { x: 0.15, y: 0.55 },
      { x: 0.20, y: 0.60 },
      { x: 0.28, y: 0.65 },
      { x: 0.35, y: 0.60 },
      { x: 0.45, y: 0.60 },
      { x: 0.50, y: 0.55 },
    ],
  },
  {
    id: 'rocket',
    name: 'Rocket',
    emoji: '🚀',
    level: 3,
    points: [
      { x: 0.50, y: 0.12 },
      { x: 0.45, y: 0.22 },
      { x: 0.40, y: 0.35 },
      { x: 0.38, y: 0.50 },
      { x: 0.38, y: 0.62 },
      { x: 0.30, y: 0.72 },
      { x: 0.30, y: 0.82 },
      { x: 0.38, y: 0.75 },
      { x: 0.40, y: 0.82 },
      { x: 0.50, y: 0.85 },
    ],
  },
];

const LEVEL_4_TEMPLATES: MirrorTemplate[] = [
  {
    id: 'snowflake',
    name: 'Snowflake',
    emoji: '❄️',
    level: 4,
    points: [
      { x: 0.50, y: 0.15 },
      { x: 0.45, y: 0.25 },
      { x: 0.35, y: 0.22 },
      { x: 0.42, y: 0.30 },
      { x: 0.32, y: 0.35 },
      { x: 0.42, y: 0.38 },
      { x: 0.50, y: 0.45 },
      { x: 0.42, y: 0.52 },
      { x: 0.32, y: 0.55 },
      { x: 0.42, y: 0.60 },
      { x: 0.35, y: 0.68 },
      { x: 0.45, y: 0.65 },
      { x: 0.50, y: 0.75 },
    ],
  },
  {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    level: 4,
    points: [
      { x: 0.50, y: 0.25 },
      { x: 0.42, y: 0.40 },
      { x: 0.35, y: 0.22 },
      { x: 0.25, y: 0.38 },
      { x: 0.15, y: 0.22 },
      { x: 0.15, y: 0.60 },
      { x: 0.50, y: 0.60 },
    ],
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    level: 4,
    points: [
      { x: 0.50, y: 0.10 },
      { x: 0.45, y: 0.10 },
      { x: 0.45, y: 0.15 },
      { x: 0.50, y: 0.15 },
      { x: 0.50, y: 0.18 },
      { x: 0.30, y: 0.18 },
      { x: 0.30, y: 0.40 },
      { x: 0.50, y: 0.40 },
      { x: 0.50, y: 0.42 },
      { x: 0.32, y: 0.42 },
      { x: 0.32, y: 0.70 },
      { x: 0.40, y: 0.70 },
      { x: 0.40, y: 0.85 },
      { x: 0.50, y: 0.85 },
    ],
  },
  {
    id: 'bell',
    name: 'Bell',
    emoji: '🔔',
    level: 4,
    points: [
      { x: 0.50, y: 0.15 },
      { x: 0.45, y: 0.20 },
      { x: 0.38, y: 0.28 },
      { x: 0.30, y: 0.38 },
      { x: 0.25, y: 0.50 },
      { x: 0.22, y: 0.62 },
      { x: 0.20, y: 0.72 },
      { x: 0.50, y: 0.72 },
      { x: 0.50, y: 0.78 },
      { x: 0.42, y: 0.78 },
      { x: 0.42, y: 0.82 },
      { x: 0.50, y: 0.82 },
    ],
  },
  {
    id: 'shield',
    name: 'Shield',
    emoji: '🛡️',
    level: 4,
    points: [
      { x: 0.50, y: 0.18 },
      { x: 0.20, y: 0.18 },
      { x: 0.18, y: 0.30 },
      { x: 0.20, y: 0.45 },
      { x: 0.25, y: 0.58 },
      { x: 0.32, y: 0.68 },
      { x: 0.42, y: 0.78 },
      { x: 0.50, y: 0.82 },
    ],
  },
];

export const TEMPLATES: MirrorTemplate[] = [
  ...LEVEL_1_TEMPLATES,
  ...LEVEL_2_TEMPLATES,
  ...LEVEL_3_TEMPLATES,
  ...LEVEL_4_TEMPLATES,
];

/** Get templates for a specific level. */
export function getTemplatesForLevel(level: number): MirrorTemplate[] {
  return TEMPLATES.filter((t) => t.level === level);
}

/** Mirror a point across the center line (x = 0.5). */
export function mirrorPoint(point: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: 1.0 - point.x, y: point.y };
}

/** Sample `count` evenly-spaced points from a dense stroke. */
export function samplePoints(
  points: Array<{ x: number; y: number }>,
  count: number,
): Array<{ x: number; y: number }> {
  if (points.length === 0 || count <= 0) return [];
  if (points.length <= count) return [...points];

  const result: Array<{ x: number; y: number }> = [];
  const step = (points.length - 1) / (count - 1);

  for (let i = 0; i < count; i++) {
    const idx = Math.round(i * step);
    result.push(points[Math.min(idx, points.length - 1)]);
  }

  return result;
}

/** Get star rating from accuracy. */
export function getStars(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.3) return 1;
  return 0;
}

/**
 * Calculate match score between user-drawn points and the mirrored template.
 *
 * 1. Mirror template points to the right side.
 * 2. Sample user points to the same count.
 * 3. For each user point, find the nearest template point.
 * 4. Score = 1 - (avgDistance / maxAllowedDistance), clamped 0-1.
 */
export function calculateMatchScore(
  userPoints: Array<{ x: number; y: number }>,
  template: MirrorTemplate,
  level: number,
): MatchScore {
  const maxDist = 0.15; // forgiving for kids
  const levelCfg = LEVELS.find((l) => l.level === level) ?? LEVELS[0];

  if (userPoints.length < 3 || template.points.length === 0) {
    return { accuracy: 0, stars: 0, passed: false };
  }

  // Mirror template to right side
  const mirroredTemplate = template.points.map(mirrorPoint);

  // Sample user points to match template count
  const sampled = samplePoints(userPoints, mirroredTemplate.length);

  // Compute average nearest-point distance
  let totalDist = 0;
  for (const up of sampled) {
    let minDist = Infinity;
    for (const tp of mirroredTemplate) {
      const dx = up.x - tp.x;
      const dy = up.y - tp.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) minDist = d;
    }
    totalDist += minDist;
  }

  const avgDist = totalDist / sampled.length;
  const accuracy = Math.max(0, Math.min(1, 1 - avgDist / maxDist));
  const stars = getStars(accuracy);
  const passed = accuracy >= levelCfg.passThreshold;

  return { accuracy, stars, passed };
}
