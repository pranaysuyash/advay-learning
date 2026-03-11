import type { Point } from './tracking';

export interface GameScore {
  value: number;
}

export interface GameTarget {
  id: string | number;
  position: Point;
}

export interface GameSessionState {
  isPlaying: boolean;
  score: number;
  level: number;
  feedback: string;
}

// Specific target shape used by Color Match Garden and similar games
export interface GardenTarget {
  id: number;
  name: string;
  color: string;
  emoji: string;
  assetId: string;
  position: Point;
}
