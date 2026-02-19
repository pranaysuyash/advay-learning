import type { Point } from '../types/tracking';
import { pickSpacedPoints } from './targetPracticeLogic';

export interface Emotion {
  name: string;
  emoji: string;
  color: string;
}

export interface EmotionTarget extends Emotion {
  id: number;
  position: Point;
}

export const EMOTIONS: Emotion[] = [
  { name: 'Happy', emoji: '😊', color: '#FFD700' },
  { name: 'Sad', emoji: '😢', color: '#4FC3F7' },
  { name: 'Angry', emoji: '😠', color: '#EF5350' },
  { name: 'Surprised', emoji: '😲', color: '#FF9800' },
  { name: 'Scared', emoji: '😨', color: '#CE93D8' },
  { name: 'Silly', emoji: '🤪', color: '#66BB6A' },
  { name: 'Sleepy', emoji: '😴', color: '#90CAF9' },
  { name: 'Love', emoji: '🥰', color: '#F48FB1' },
];

export function buildRound(
  optionCount: number = 4,
  random: () => number = Math.random,
): { targets: EmotionTarget[]; correctId: number } {
  const shuffled = [...EMOTIONS].sort(() => random() - 0.5);
  const picked = shuffled.slice(0, optionCount);
  const points = pickSpacedPoints(optionCount, 0.22, 0.16, random);

  const targets: EmotionTarget[] = picked.map((emotion, index) => ({
    ...emotion,
    id: index,
    position: points[index].position,
  }));

  const correctId = Math.floor(random() * targets.length);
  return { targets, correctId };
}
