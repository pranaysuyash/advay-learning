/**
 * More or Less game logic — compare quantities.
 *
 * Which group has MORE? Which group has LESS?
 */

export interface QuantityGroup {
  emoji: string;
  count: number;
}

export interface CompareQuestion {
  left: QuantityGroup;
  right: QuantityGroup;
  question: 'more' | 'less';
}

export interface LevelConfig {
  level: number;
  minCount: number;
  maxCount: number;
}

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '⭐', '🎈', '🦋', '🌸', '🐱'];

export const LEVELS: LevelConfig[] = [
  { level: 1, minCount: 1, maxCount: 5 },
  { level: 2, minCount: 3, maxCount: 8 },
  { level: 3, minCount: 5, maxCount: 12 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function generateQuestion(level: number): CompareQuestion {
  const config = getLevelConfig(level);
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const leftCount = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;
  let rightCount = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;
  while (rightCount === leftCount) rightCount = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;
  const question: 'more' | 'less' = Math.random() > 0.5 ? 'more' : 'less';
  return {
    left: { emoji, count: leftCount },
    right: { emoji, count: rightCount },
    question,
  };
}
