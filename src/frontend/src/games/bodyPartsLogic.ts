/**
 * Body Parts game logic — point to named body part.
 */

export interface BodyPart {
  name: string;
  emoji: string;
}

export interface LevelConfig {
  level: number;
  partCount: number;
}

const BODY_PARTS: BodyPart[] = [
  { name: 'Head', emoji: '🗣️' },
  { name: 'Eyes', emoji: '👀' },
  { name: 'Nose', emoji: '👃' },
  { name: 'Mouth', emoji: '👄' },
  { name: 'Ears', emoji: '👂' },
  { name: 'Hands', emoji: '👐' },
  { name: 'Fingers', emoji: '🫵' },
  { name: 'Feet', emoji: '🦶' },
  { name: 'Arms', emoji: '💪' },
  { name: 'Legs', emoji: '🦵' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, partCount: 4 },
  { level: 2, partCount: 6 },
  { level: 3, partCount: 8 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function getPartsForLevel(level: number): BodyPart[] {
  const config = getLevelConfig(level);
  const shuffled = [...BODY_PARTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.partCount);
}
