/**
 * Dinosaur Dig Game Logic
 *
 * Children uncover fossils by brushing away dirt, then assemble dinosaur bones.
 */

export type DinoType = 't-rex' | 'triceratops' | 'stegosaurus' | 'pterodactyl';

export interface DinoBone {
  id: string;
  name: string;
  color: string;
}

export interface Dino {
  id: DinoType;
  emoji: string;
  name: string;
  bones: DinoBone[];
}

export const DINOSAURS: Dino[] = [
  {
    id: 't-rex',
    emoji: '🦖',
    name: 'T-Rex',
    bones: [
      { id: 'skull', name: 'Skull', color: '#F5F5DC' },
      { id: 'spine', name: 'Spine', color: '#FFFAF0' },
      { id: 'ribs', name: 'Ribs', color: '#FAF0E6' },
      { id: 'leg-l', name: 'Left Leg', color: '#FFFAF0' },
      { id: 'leg-r', name: 'Right Leg', color: '#FFFAF0' },
    ],
  },
  {
    id: 'triceratops',
    emoji: '🦕',
    name: 'Triceratops',
    bones: [
      { id: 'skull', name: 'Skull', color: '#F5F5DC' },
      { id: 'horn', name: 'Horn', color: '#FFFAF0' },
      { id: 'spine', name: 'Spine', color: '#FFFAF0' },
      { id: 'body', name: 'Body', color: '#FAF0E6' },
    ],
  },
  {
    id: 'stegosaurus',
    emoji: '🦕',
    name: 'Stegosaurus',
    bones: [
      { id: 'skull', name: 'Skull', color: '#F5F5DC' },
      { id: 'plates', name: 'Plates', color: '#2E8B57' },
      { id: 'spine', name: 'Spine', color: '#FFFAF0' },
      { id: 'tail', name: 'Tail', color: '#FFFAF0' },
    ],
  },
  {
    id: 'pterodactyl',
    emoji: '🦅',
    name: 'Pterodactyl',
    bones: [
      { id: 'skull', name: 'Skull', color: '#F5F5DC' },
      { id: 'wings', name: 'Wings', color: '#FFFAF0' },
      { id: 'body', name: 'Body', color: '#FAF0E6' },
    ],
  },
];

export interface GameState {
  currentDino: Dino | null;
  uncoveredPercent: number;
  placedBones: DinoBone[];
  score: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentDino: null,
    uncoveredPercent: 0,
    placedBones: [],
    score: 0,
    isComplete: false,
    isPlaying: false,
  };
}

export function getRandomDino(): Dino {
  return DINOSAURS[Math.floor(Math.random() * DINOSAURS.length)];
}

export function calculateScore(uncovered: number, bonesPlaced: number): number {
  const uncoverScore = uncovered * 0.5;
  const boneScore = bonesPlaced * 30;
  return Math.round(uncoverScore + boneScore);
}

export function calculateStars(score: number): number {
  if (score >= 200) return 5;
  if (score >= 160) return 4;
  if (score >= 120) return 3;
  if (score >= 80) return 2;
  return 1;
}
