export interface Quest {
  id: string;
  title: string;
  description: string;
  islandId: string;
  gameType: 'alphabet' | 'numbers' | 'drawing' | 'letter-hunt';
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    xp: number;
    badge?: string;
    badgeIcon?: string;
  };
  requirements: {
    minAccuracy?: number;
    minLetters?: number;
    timeLimit?: number;
  };
}

export interface Island {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  color: string;
  lockedColor: string;
  requiredQuests?: string[];
  unlocksAfter?: string;
}

export const ISLANDS: Island[] = [
  {
    id: 'alphabet-lighthouse',
    name: 'Alphabet Lighthouse',
    description: 'Learn to trace letters with Pip!',
    position: { x: 60, y: 80 },
    color: '#ef4444',
    lockedColor: '#334155',
  },
  {
    id: 'number-nook',
    name: 'Number Nook',
    description: 'Count and play with numbers!',
    position: { x: 180, y: 50 },
    color: '#3b82f6',
    lockedColor: '#334155',
    unlocksAfter: 'alphabet-lighthouse',
  },
  {
    id: 'treasure-bay',
    name: 'Treasure Bay',
    description: 'Find hidden letters in the wild!',
    position: { x: 320, y: 80 },
    color: '#10b981',
    lockedColor: '#334155',
    unlocksAfter: 'number-nook',
  },
  {
    id: 'star-studio',
    name: 'Star Studio',
    description: 'Draw constellations in the sky!',
    position: { x: 240, y: 120 },
    color: '#f59e0b',
    lockedColor: '#334155',
    unlocksAfter: 'treasure-bay',
  },
];

export const QUESTS: Quest[] = [
  // Alphabet Lighthouse Quests
  {
    id: 'quest-a-to-z',
    title: 'Master the Alphabet',
    description: 'Complete all 26 letters!',
    islandId: 'alphabet-lighthouse',
    gameType: 'alphabet',
    difficulty: 'easy',
    rewards: { xp: 100, badge: 'Alphabet Master', badgeIcon: '🔤' },
    requirements: { minAccuracy: 70, minLetters: 5 },
  },
  {
    id: 'quest-vowels',
    title: 'Vowel Champion',
    description: 'Trace A, E, I, O, U perfectly!',
    islandId: 'alphabet-lighthouse',
    gameType: 'alphabet',
    difficulty: 'medium',
    rewards: { xp: 50, badge: 'Vowel Star', badgeIcon: '⭐' },
    requirements: { minAccuracy: 80, minLetters: 5 },
  },
  {
    id: 'quest-handstand',
    title: 'Upside Down Fun',
    description: 'Trace H, I, M, N, O, S, X, Z!',
    islandId: 'alphabet-lighthouse',
    gameType: 'alphabet',
    difficulty: 'medium',
    rewards: { xp: 60, badge: 'Flip Expert', badgeIcon: '🔄' },
    requirements: { minAccuracy: 75, minLetters: 8 },
  },
  // Number Nook Quests
  {
    id: 'quest-counting',
    title: 'Count to 10',
    description: 'Show 1-10 with your fingers!',
    islandId: 'number-nook',
    gameType: 'numbers',
    difficulty: 'easy',
    rewards: { xp: 40, badge: 'Counter', badgeIcon: '🔢' },
    requirements: { minAccuracy: 70 },
  },
  {
    id: 'quest-fingers',
    title: 'Finger Flash',
    description: 'Quick finger counting!',
    islandId: 'number-nook',
    gameType: 'numbers',
    difficulty: 'medium',
    rewards: { xp: 50, badge: 'Flash Master', badgeIcon: '✨' },
    requirements: { minAccuracy: 80 },
  },
  // Treasure Bay Quests
  {
    id: 'quest-letter-hunt',
    title: 'Treasure Hunter',
    description: 'Find letters in the wild!',
    islandId: 'treasure-bay',
    gameType: 'letter-hunt',
    difficulty: 'medium',
    rewards: { xp: 60, badge: 'Treasure Hunter', badgeIcon: '💎' },
    requirements: { minAccuracy: 70 },
  },
  // Star Studio Quests
  {
    id: 'quest-constellations',
    title: 'Star Gazer',
    description: 'Draw your first constellation!',
    islandId: 'star-studio',
    gameType: 'drawing',
    difficulty: 'hard',
    rewards: { xp: 80, badge: 'Star Gazer', badgeIcon: '🌟' },
    requirements: { minAccuracy: 85 },
  },
];

export function getIslandById(id: string): Island | undefined {
  return ISLANDS.find((island) => island.id === id);
}

export function getQuestsByIsland(islandId: string): Quest[] {
  return QUESTS.filter((quest) => quest.islandId === islandId);
}

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find((quest) => quest.id === id);
}

export function isIslandUnlocked(
  islandId: string,
  unlockedIslands: string[],
): boolean {
  if (islandId === 'alphabet-lighthouse') return true;
  const island = getIslandById(islandId);
  if (!island?.unlocksAfter) return true;
  return unlockedIslands.includes(island.unlocksAfter);
}

export function getNextIsland(currentIslandId: string): Island | null {
  const currentIndex = ISLANDS.findIndex((i) => i.id === currentIslandId);
  if (currentIndex === -1 || currentIndex >= ISLANDS.length - 1) return null;
  return ISLANDS[currentIndex + 1];
}
