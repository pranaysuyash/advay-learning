/**
 * Pattern Play game logic — complete the pattern.
 */

export interface PatternItem {
  shape: string;
  color: string;
}

export interface LevelConfig {
  level: number;
  patternLength: number;
}

const SHAPES = ['●', '■', '▲', '★', '♦', '♥'];
const COLORS = ['red', 'blue', 'green', 'purple', 'orange'];

export const LEVELS: LevelConfig[] = [
  { level: 1, patternLength: 4 },
  { level: 2, patternLength: 6 },
  { level: 3, patternLength: 8 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generatePattern(level: number): { shown: PatternItem[]; answer: PatternItem } {
  const config = getLevelConfig(level);
  const pattern: PatternItem[] = [];
  for (let i = 0; i < config.patternLength; i++) {
    pattern.push({
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }
  const answer = pattern[pattern.length - 1];
  return { shown: pattern.slice(0, -1), answer };
}

export function generateOptions(correct: PatternItem, count: number = 4): PatternItem[] {
  const options: PatternItem[] = [correct];
  while (options.length < count) {
    const option = {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    if (!options.some(o => o.shape === option.shape && o.color === option.color)) {
      options.push(option);
    }
  }
  return options.sort(() => Math.random() - 0.5);
}
