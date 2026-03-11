/**
 * Sound Garden Game Logic
 *
 * Children create music by touching flowers that play different notes.
 * Each flower is an instrument that plays a musical note.
 */

export type InstrumentType = 'flute' | 'violin' | 'piano' | 'drum' | 'guitar';

export interface Flower {
  id: string;
  emoji: string;
  name: string;
  instrument: InstrumentType;
  note: string;
  frequency: number;
  color: string;
}

export const FLOWERS: Flower[] = [
  { id: 'flute-flower', emoji: '🌸', name: 'Flute Flower', instrument: 'flute', note: 'C', frequency: 261.63, color: '#FFB6C1' },
  { id: 'violin-flower', emoji: '🌺', name: 'Violin Flower', instrument: 'violin', note: 'D', frequency: 293.66, color: '#FF6B6B' },
  { id: 'piano-flower', emoji: '🌷', name: 'Piano Flower', instrument: 'piano', note: 'E', frequency: 329.63, color: '#FF69B4' },
  { id: 'drum-flower', emoji: '🌼', name: 'Drum Flower', instrument: 'drum', note: 'F', frequency: 349.23, color: '#FFD700' },
  { id: 'guitar-flower', emoji: '🌻', name: 'Guitar Flower', instrument: 'guitar', note: 'G', frequency: 392.00, color: '#FFA500' },
  { id: 'flute-flower-2', emoji: '🏵️', name: 'High Flute', instrument: 'flute', note: 'A', frequency: 440.00, color: '#E6E6FA' },
  { id: 'piano-flower-2', emoji: '💐', name: 'High Piano', instrument: 'piano', note: 'B', frequency: 493.88, color: '#DDA0DD' },
  { id: 'violin-flower-2', emoji: '🌹', name: 'High Violin', instrument: 'violin', note: 'C2', frequency: 523.25, color: '#DC143C' },
];

export interface GameState {
  playedNotes: string[];
  score: number;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    playedNotes: [],
    score: 0,
    isPlaying: false,
  };
}

export function calculateScore(notesPlayed: number): number {
  return notesPlayed * 10;
}

export function calculateStars(notesPlayed: number): number {
  if (notesPlayed >= 20) return 5;
  if (notesPlayed >= 15) return 4;
  if (notesPlayed >= 10) return 3;
  if (notesPlayed >= 5) return 2;
  return 1;
}
