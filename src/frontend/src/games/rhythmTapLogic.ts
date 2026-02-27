/**
 * Rhythm Tap game logic — repeat rhythm patterns.
 */

export interface RhythmPattern {
  notes: number[];
  bpm: number;
}

export interface LevelConfig {
  level: number;
  patternLength: number;
  bpm: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, patternLength: 3, bpm: 120 },
  { level: 2, patternLength: 4, bpm: 140 },
  { level: 3, patternLength: 5, bpm: 160 },
];

function generatePattern(length: number): number[] {
  return Array.from({ length }, () => Math.random() > 0.5 ? 1 : 0);
}

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function createPattern(level: number): RhythmPattern {
  const config = getLevelConfig(level);
  return {
    notes: generatePattern(config.patternLength),
    bpm: config.bpm,
  };
}

export function checkPattern(userInput: number[], correctPattern: number[]): boolean {
  if (userInput.length !== correctPattern.length) return false;
  return userInput.every((val, idx) => val === correctPattern[idx]);
}
