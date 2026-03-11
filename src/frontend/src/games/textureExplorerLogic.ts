/**
 * Texture Explorer Game Logic
 *
 * Children match objects to their texture: rough, smooth, soft, or bumpy.
 */

export type TextureType = 'rough' | 'smooth' | 'soft' | 'bumpy';

export interface TextureItem {
  id: string;
  emoji: string;
  name: string;
  category: TextureType;
  color: string;
}

export const TEXTURE_ITEMS: TextureItem[] = [
  { id: 'rock', emoji: '🪨', name: 'Rock', category: 'rough', color: '#808080' },
  { id: 'bark', emoji: '🌳', name: 'Tree Bark', category: 'rough', color: '#8B4513' },
  { id: 'brick', emoji: '🧱', name: 'Brick', category: 'rough', color: '#B22222' },
  
  { id: 'mirror', emoji: '🪞', name: 'Mirror', category: 'smooth', color: '#C0C0C0' },
  { id: 'ice', emoji: '🧊', name: 'Ice', category: 'smooth', color: '#ADD8E6' },
  { id: 'glass', emoji: '🥃', name: 'Glass', category: 'smooth', color: '#87CEEB' },
  
  { id: 'cotton', emoji: '☁️', name: 'Cloud', category: 'soft', color: '#FFFFFF' },
  { id: 'pillow', emoji: '🛏️', name: 'Pillow', category: 'soft', color: '#FFC0CB' },
  { id: 'teddy', emoji: '🧸', name: 'Teddy Bear', category: 'soft', color: '#D2691E' },
  
  { id: 'ball', emoji: '⚽', name: 'Ball', category: 'bumpy', color: '#FF6347' },
  { id: 'cactus', emoji: '🌵', name: 'Cactus', category: 'bumpy', color: '#228B22' },
  { id: 'pinecone', emoji: '🌲', name: 'Pinecone', category: 'bumpy', color: '#8B4513' },
];

export const TEXTURE_ZONES: Record<TextureType, { emoji: string; name: string; color: string }> = {
  rough: { emoji: '🪨', name: 'Rough', color: '#808080' },
  smooth: { emoji: '✨', name: 'Smooth', color: '#C0C0C0' },
  soft: { emoji: '☁️', name: 'Soft', color: '#FFC0CB' },
  bumpy: { emoji: '⚽', name: 'Bumpy', color: '#FF6347' },
};

export interface GameState {
  currentItem: TextureItem | null;
  matched: number;
  mistakes: number;
  score: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentItem: null,
    matched: 0,
    mistakes: 0,
    score: 0,
    isComplete: false,
    isPlaying: false,
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getTextureItems(): TextureItem[] {
  return shuffleArray(TEXTURE_ITEMS);
}

export function calculateScore(correct: number, mistakes: number): number {
  return correct * 20 - mistakes * 5;
}

export function calculateStars(correct: number): number {
  if (correct >= 10) return 5;
  if (correct >= 8) return 4;
  if (correct >= 6) return 3;
  if (correct >= 4) return 2;
  return 1;
}
