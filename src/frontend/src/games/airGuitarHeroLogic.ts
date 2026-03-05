/**
 * Air Guitar Hero game logic — strum to play guitar notes.
 *
 * Make guitar gestures to play rockstar melodies!
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Air Guitar Hero P1
 */

export interface GuitarNote {
  id: string;
  name: string;
  fret: number;
  string: number;
  color: string;
}

export interface LevelConfig {
  level: number;
  notesToPlay: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const LEVELS: LevelConfig[] = [
  { level: 1, notesToPlay: 8, timeLimit: 30, difficulty: 'easy' },
  { level: 2, notesToPlay: 12, timeLimit: 25, difficulty: 'medium' },
  { level: 3, notesToPlay: 16, timeLimit: 20, difficulty: 'hard' },
];

// Difficulty multipliers for scoring
const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

/**
 * Calculate score based on streak and difficulty
 * Base: 10 points + streak bonus (max 20) = 30 max base
 * Multiplied by difficulty (easy 1x, medium 1.5x, hard 2x)
 * Max per note: 60 points (hard, streak 10+)
 */
export function calculateScore(
  streak: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): number {
  const baseScore = 10;
  const streakBonus = Math.min(streak * 2, 20);
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] ?? 1;
  return Math.floor((baseScore + streakBonus) * multiplier);
}

export const NOTES: GuitarNote[] = [
  { id: 'e2', name: 'E2', fret: 0, string: 6, color: '#FF6B6B' },
  { id: 'a2', name: 'A2', fret: 0, string: 5, color: '#4ECDC4' },
  { id: 'd3', name: 'D3', fret: 0, string: 4, color: '#45B7D1' },
  { id: 'g3', name: 'G3', fret: 0, string: 3, color: '#96CEB4' },
  { id: 'b3', name: 'B3', fret: 0, string: 2, color: '#FFEAA7' },
  { id: 'e4', name: 'E4', fret: 0, string: 1, color: '#DDA0DD' },
  { id: 'f3', name: 'F3', fret: 1, string: 6, color: '#FF6B6B' },
  { id: 'c3', name: 'C3', fret: 1, string: 5, color: '#4ECDC4' },
  { id: 'g3f1', name: 'G3', fret: 1, string: 3, color: '#96CEB4' },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function generateNoteSequence(count: number): GuitarNote[] {
  const sequence: GuitarNote[] = [];
  for (let i = 0; i < count; i++) {
    sequence.push(NOTES[Math.floor(Math.random() * NOTES.length)]);
  }
  return sequence;
}

export function playNoteSound(note: GuitarNote): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(note.name);
    utterance.rate = 2;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }
}
