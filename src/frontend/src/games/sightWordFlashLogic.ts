/**
 * Sight Word Flash game logic — recognize common sight words.
 *
 * Flash a sight word, kid recognizes it.
 */

export interface SightWord {
  word: string;
  difficulty: number;
}

export interface LevelConfig {
  level: number;
  wordCount: number;
}

const SIGHT_WORDS: SightWord[] = [
  { word: 'the', difficulty: 1 },
  { word: 'is', difficulty: 1 },
  { word: 'it', difficulty: 1 },
  { word: 'a', difficulty: 1 },
  { word: 'to', difficulty: 1 },
  { word: 'and', difficulty: 1 },
  { word: 'I', difficulty: 1 },
  { word: 'you', difficulty: 1 },
  { word: 'he', difficulty: 1 },
  { word: 'she', difficulty: 1 },
  { word: 'we', difficulty: 1 },
  { word: 'me', difficulty: 1 },
  { word: 'go', difficulty: 1 },
  { word: 'no', difficulty: 1 },
  { word: 'so', difficulty: 1 },
  { word: 'at', difficulty: 1 },
  { word: 'be', difficulty: 1 },
  { word: 'by', difficulty: 1 },
  { word: 'or', difficulty: 2 },
  { word: 'if', difficulty: 2 },
  { word: 'but', difficulty: 2 },
  { word: 'was', difficulty: 2 },
  { word: 'were', difficulty: 2 },
  { word: 'had', difficulty: 2 },
  { word: 'her', difficulty: 2 },
  { word: 'him', difficulty: 2 },
  { word: 'his', difficulty: 2 },
  { word: 'how', difficulty: 2 },
  { word: 'now', difficulty: 2 },
  { word: 'out', difficulty: 2 },
  { word: 'what', difficulty: 3 },
  { word: 'when', difficulty: 3 },
  { word: 'who', difficulty: 3 },
  { word: 'which', difficulty: 3 },
  { word: 'their', difficulty: 3 },
  { word: 'there', difficulty: 3 },
  { word: 'where', difficulty: 3 },
  { word: 'would', difficulty: 3 },
  { word: 'could', difficulty: 3 },
  { word: 'should', difficulty: 3 },
  { word: 'would', difficulty: 3 },
  { word: 'come', difficulty: 3 },
  { word: 'some', difficulty: 3 },
  { word: 'come', difficulty: 3 },
  { word: 'said', difficulty: 2 },
  { word: 'saw', difficulty: 2 },
  { word: 'make', difficulty: 2 },
  { word: 'like', difficulty: 2 },
  { word: 'have', difficulty: 2 },
  { word: 'has', difficulty: 2 },
  { word: 'does', difficulty: 3 },
  { word: 'doing', difficulty: 3 },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, wordCount: 5 },
  { level: 2, wordCount: 8 },
  { level: 3, wordCount: 10 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function getWordsForLevel(level: number): SightWord[] {
  const config = getLevelConfig(level);
  const filtered = SIGHT_WORDS.filter(w => w.difficulty <= level);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.wordCount);
}
