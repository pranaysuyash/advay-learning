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
