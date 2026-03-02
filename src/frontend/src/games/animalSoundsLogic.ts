/**
 * Animal Sounds game logic — match animal to sound.
 */

export interface Animal {
  name: string;
  emoji: string;
  sound: string;
}

export interface LevelConfig {
  level: number;
  animalCount: number;
}

const ANIMALS: Animal[] = [
  { name: 'Dog', emoji: '🐕', sound: 'Woof woof!' },
  { name: 'Cat', emoji: '🐱', sound: 'Meow!' },
  { name: 'Cow', emoji: '🐄', sound: 'Moo!' },
  { name: 'Pig', emoji: '🐷', sound: 'Oink oink!' },
  { name: 'Duck', emoji: '🦆', sound: 'Quack quack!' },
  { name: 'Rooster', emoji: '🐓', sound: 'Cock-a-doodle-doo!' },
  { name: 'Sheep', emoji: '🐑', sound: 'Baa baa!' },
  { name: 'Horse', emoji: '🐴', sound: 'Neigh!' },
  { name: 'Lion', emoji: '🦁', sound: 'Roar!' },
  { name: 'Elephant', emoji: '🐘', sound: 'Trumpet!' },
  { name: 'Monkey', emoji: '🐵', sound: 'Ooh ooh ah ah!' },
  { name: 'Frog', emoji: '🐸', sound: 'Ribbit ribbit!' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, animalCount: 3 },
  { level: 2, animalCount: 4 },
  { level: 3, animalCount: 6 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function getAnimalsForLevel(level: number): Animal[] {
  const config = getLevelConfig(level);
  const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.animalCount);
}
