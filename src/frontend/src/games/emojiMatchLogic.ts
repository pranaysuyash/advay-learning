import type { Point } from '../types/tracking';
import { pickSpacedPoints } from './targetPracticeLogic';

export interface Emotion {
  name: string;
  emoji: string;
  icon?: string;
  color: string;
}

export interface EmotionTarget extends Emotion {
  id: number;
  position: Point;
}

export const EMOTIONS: Emotion[] = [
  { name: 'Happy', emoji: '😊', icon: '/assets/items/emotions/happy.png', color: '#FFD700' },
  { name: 'Sad', emoji: '😢', icon: '/assets/items/emotions/sad.png', color: '#4FC3F7' },
  { name: 'Angry', emoji: '😠', icon: '/assets/items/emotions/angry.png', color: '#EF5350' },
  { name: 'Surprised', emoji: '😲', icon: '/assets/items/emotions/surprised.png', color: '#FF9800' },
  { name: 'Scared', emoji: '😨', icon: '/assets/items/emotions/scared.png', color: '#CE93D8' },
  { name: 'Silly', emoji: '🤪', icon: '/assets/items/emotions/silly.png', color: '#66BB6A' },
  { name: 'Sleepy', emoji: '😴', icon: '/assets/items/emotions/sleepy.png', color: '#90CAF9' },
  { name: 'Love', emoji: '🥰', icon: '/assets/items/emotions/love.png', color: '#F48FB1' },
];

export function buildRound(
  optionCount: number = 4,
  random: () => number = Math.random,
): { targets: EmotionTarget[]; correctId: number } {
  const shuffled = [...EMOTIONS].sort(() => random() - 0.5);
  const picked = shuffled.slice(0, optionCount);
  const points = pickSpacedPoints(optionCount, 0.26, 0.18, random);

  const targets: EmotionTarget[] = picked.map((emotion, index) => ({
    ...emotion,
    id: index,
    position: points[index].position,
  }));

  const correctId = Math.floor(random() * targets.length);
  return { targets, correctId };
}
