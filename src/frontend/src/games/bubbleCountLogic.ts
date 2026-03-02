/**
 * Bubble Count game logic — count bubbles in groups.
 */

export interface BubbleGroup {
  id: number;
  x: number;
  y: number;
  count: number;
  radius: number;
}

export interface LevelConfig {
  level: number;
  groupCount: number;
  minCount: number;
  maxCount: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, groupCount: 2, minCount: 1, maxCount: 3 },
  { level: 2, groupCount: 3, minCount: 1, maxCount: 5 },
  { level: 3, groupCount: 4, minCount: 2, maxCount: 8 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

function generateGroups(level: number): BubbleGroup[] {
  const config = getLevelConfig(level);
  const groups: BubbleGroup[] = [];

  for (let i = 0; i < config.groupCount; i++) {
    const count = config.minCount + Math.floor(Math.random() * (config.maxCount - config.minCount + 1));
    const row = Math.floor(i / 2);
    const col = i % 2;
    
    groups.push({
      id: i,
      x: 25 + col * 50,
      y: 30 + row * 35,
      count,
      radius: 15 + count * 2,
    });
  }

  return groups;
}

export function createGame(level: number): {
  groups: BubbleGroup[];
  config: LevelConfig;
} {
  const config = getLevelConfig(level);
  const groups = generateGroups(level);
  return { groups, config };
}

export function checkAnswer(selectedGroupId: number, groups: BubbleGroup[], targetCount: number): boolean {
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  return selectedGroup?.count === targetCount;
}

export function generateQuestion(config: LevelConfig, groups: BubbleGroup[]): number {
  const validCounts = groups.map(g => g.count).filter(c => c >= config.minCount && c <= config.maxCount);
  const uniqueCounts = [...new Set(validCounts)];
  return uniqueCounts[Math.floor(Math.random() * uniqueCounts.length)];
}

export function calculateScore(isCorrect: boolean, timeLeft: number): number {
  if (isCorrect) {
    return 100 + timeLeft * 5;
  }
  return 0;
}
