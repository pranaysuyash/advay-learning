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
}

export const LEVELS: LevelConfig[] = [
  { level: 1, notesToPlay: 8, timeLimit: 30 },
  { level: 2, notesToPlay: 12, timeLimit: 25 },
  { level: 3, notesToPlay: 16, timeLimit: 20 },
];

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
