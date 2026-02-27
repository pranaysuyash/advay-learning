/**
 * Shadow Puppet Theater game logic — create shadow shapes with hands.
 *
 * Make shadow animals and creatures with your hands!
 * Uses hand tracking to detect finger poses.
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Shadow Puppet Theater P1
 */

export interface PuppetShape {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: 1 | 2 | 3;
  // Finger pattern: [thumb, index, middle, ring, pinky] - 1 = up, 0 = down
  fingerPattern?: number[];
}

export const PUPPET_SHAPES: PuppetShape[] = [
  { id: 'dog', name: 'Dog', emoji: '🐕', description: 'Make a dog face with your hand!', difficulty: 1 },
  { id: 'cat', name: 'Cat', emoji: '🐱', description: 'Meow! Make cat ears!', difficulty: 1 },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', description: 'Hop hop! Rabbit ears!', difficulty: 1 },
  { id: 'bird', name: 'Bird', emoji: '🐦', description: 'Flap your wings!', difficulty: 1 },
  { id: 'duck', name: 'Duck', emoji: '🦆', description: 'Quack quack!', difficulty: 1 },
  { id: 'wolf', name: 'Wolf', emoji: '🐺', description: 'Howl at the moon!', difficulty: 2 },
  { id: 'bear', name: 'Bear', emoji: '🐻', description: 'Growl like a bear!', difficulty: 2 },
  { id: 'lion', name: 'Lion', emoji: '🦁', description: 'King of the jungle!', difficulty: 2 },
  { id: 'eagle', name: 'Eagle', emoji: '🦅', description: 'Soar through the sky!', difficulty: 2 },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', description: 'Ooh ooh ah ah!', difficulty: 2 },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', description: 'Flutter your wings!', difficulty: 3 },
  { id: 'spider', name: 'Spider', emoji: '🕷️', description: 'Creepy crawly!', difficulty: 3 },
  { id: 'scorpion', name: 'Scorpion', emoji: '🦂', description: 'Watch out for the tail!', difficulty: 3 },
  { id: 'crab', name: 'Crab', emoji: '🦀', description: 'Side to side!', difficulty: 3 },
  { id: 'octopus', name: 'Octopus', emoji: '🐙', description: 'Lots of wiggle arms!', difficulty: 3 },
];

export interface LevelConfig {
  level: number;
  shapesPerRound: number;
  timePerShape: number;
  passThreshold: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, shapesPerRound: 4, timePerShape: 15, passThreshold: 3 },
  { level: 2, shapesPerRound: 6, timePerShape: 12, passThreshold: 4 },
  { level: 3, shapesPerRound: 8, timePerShape: 10, passThreshold: 6 },
];

export function getShapesForLevel(level: number): PuppetShape[] {
  return PUPPET_SHAPES.filter((s) => s.difficulty <= level);
}

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function getRandomShape(level: number, usedShapes: string[] = []): PuppetShape {
  const available = getShapesForLevel(level).filter((s) => !usedShapes.includes(s.id));
  const pool = available.length > 0 ? available : getShapesForLevel(level);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function speakShape(shape: PuppetShape): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(`${shape.name}! ${shape.description}`);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
}
