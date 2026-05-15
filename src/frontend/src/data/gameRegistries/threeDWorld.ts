import type { GameManifest, GameVibe } from '../gameRegistry';

// ── 3D World Game Registry ──────────────────────────────────────────
// Refactored: Extract common patterns to reduce repetition

// Enable all 3D games for production
const BETA_3D_GAMES_ENABLED = true;

// ── Shared Drop Pools ───────────────────────────────────────────────
const DROPS = {
  starSilver: { itemId: 'star-silver', chance: 0.1, minScore: 80 } as const,
  starSilverEasy: { itemId: 'star-silver', chance: 0.15 } as const,
  starGold: { itemId: 'star-gold', chance: 0.15, minScore: 80 } as const,
  colorBlue: { itemId: 'color-blue', chance: 0.3 } as const,
  shapeCube: { itemId: 'shape-cube', chance: 0.25 } as const,
  shapeStar: { itemId: 'shape-star', chance: 0.3 } as const,
};

// ── Shared Easter Eggs ──────────────────────────────────────────────
const EGGS = {
  towerMaster: {
    id: 'egg-tower-master',
    name: 'Tower Master',
    description: 'Stack 20 blocks without toppling!',
    trigger: 'stack-20-blocks',
    reward: { itemId: 'trophy-gold', quantity: 1 } as const,
    hint: 'Steady hands build the tallest towers...',
    difficulty: 'hard' as const,
  },
  fashionStar: {
    id: 'egg-fashion-star',
    name: 'Fashion Star',
    description: 'Dress perfectly for 5 different weathers!',
    trigger: 'perfect-outfit-5',
    reward: { itemId: 'star-gold', quantity: 1 } as const,
    hint: 'Match your clothes to the sky...',
    difficulty: 'medium' as const,
  },
  speedRunner: {
    id: 'egg-speed-runner',
    name: 'Speed Runner',
    description: 'Complete the course in record time!',
    trigger: 'speed-run-complete',
    reward: { itemId: 'trophy-gold', quantity: 1 } as const,
    hint: 'Fast and steady wins the race...',
    difficulty: 'hard' as const,
  },
  monsterChef: {
    id: 'egg-monster-chef',
    name: 'Monster Chef',
    description: 'Feed the monster 50 times!',
    trigger: 'feed-50-times',
    reward: { itemId: 'star-gold', quantity: 1 } as const,
    hint: 'A hungry monster is a happy monster...',
    difficulty: 'medium' as const,
  },
  bubblePopper: {
    id: 'egg-bubble-popper',
    name: 'Bubble Popper',
    description: 'Pop 100 bubbles in one session!',
    trigger: 'pop-100-bubbles',
    reward: { itemId: 'star-gold', quantity: 1 } as const,
    hint: "Pop, pop, pop until they're all gone...",
    difficulty: 'easy' as const,
  },
  bubbleMaster3D: {
    id: 'egg-bubble-master-3d',
    name: 'Bubble Master 3D',
    description: 'Complete all 3 levels without losing a life!',
    trigger: 'perfect-bubble-3d',
    reward: { itemId: 'star-gold', quantity: 1 } as const,
    hint: 'Pop them all before they float away...',
    difficulty: 'hard' as const,
  },
};

// ── Helper Functions ────────────────────────────────────────────────
/**
 * Create a basic 3D game with minimal configuration
 */
function createBasic3DGame(params: {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  vibe: GameVibe;
  ageRange: string;
  drops?: GameManifest['drops'];
  listed?: boolean;
}): GameManifest {
  return {
    id: params.id,
    name: params.name,
    tagline: params.tagline,
    path: `/games/${params.id}`,
    icon: params.icon,
    worldId: '3d-world',
    vibe: params.vibe,
    ageRange: params.ageRange,
    isNew: true,
    cv: ['hand'],
    listed: params.listed ?? true,
    drops: params.drops ?? [],
    easterEggs: [],
  };
}

/**
 * Create a featured 3D game with easter eggs
 */
function createFeatured3DGame(params: {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  vibe: GameVibe;
  ageRange: string;
  drops: GameManifest['drops'];
  easterEggs: GameManifest['easterEggs'];
  listed?: boolean;
}): GameManifest {
  return {
    ...createBasic3DGame(params),
    drops: params.drops,
    easterEggs: params.easterEggs,
  };
}

// ── 3D Game Definitions ─────────────────────────────────────────────
export const THREE_D_WORLD_GAMES: GameManifest[] = [
  // Featured Games (with easter eggs)
  createFeatured3DGame({
    id: 'digital-jenga',
    name: '3D Jenga',
    tagline: 'Physics-based block stacking in 3D! 🧱✨',
    icon: 'box',
    vibe: 'focus',
    ageRange: '4-10',
    drops: [
      DROPS.shapeCube,
      { itemId: 'star-silver', chance: 0.15, minScore: 70 },
      { itemId: 'star-gold', chance: 0.05, minScore: 90 },
    ],
    easterEggs: [EGGS.towerMaster],
  }),

  createBasic3DGame({
    id: 'pattern-pop-3d-2',
    name: 'Pattern Pop 3D - Extra',
    tagline: 'Pop 3D patterns in a new mode!',
    icon: 'sparkles',
    vibe: 'active',
    ageRange: '4-8',
    drops: [{ itemId: 'shape-star', chance: 0.2 }],
  }),

  createBasic3DGame({
    id: 'counting-collectathon-3d',
    name: 'Counting Collectathon 3D',
    tagline: 'Collect numbers in 3D space in order! 🔢🟦',
    icon: 'numbers',
    vibe: 'educational',
    ageRange: '4-8',
    listed: false,
    drops: [{ itemId: 'number-one', chance: 0.3 }, DROPS.starSilverEasy],
  }),

  createFeatured3DGame({
    id: 'dress-for-weather-3d',
    name: 'Dress Up 3D',
    tagline: 'Dress a 3D character for the weather! 👕🌦️',
    icon: 'shirt',
    vibe: 'creative',
    ageRange: '3-7',
    listed: BETA_3D_GAMES_ENABLED,
    drops: [{ itemId: 'color-rainbow', chance: 0.25 }, DROPS.starSilver],
    easterEggs: [EGGS.fashionStar],
  }),

  createFeatured3DGame({
    id: 'obstacle-course-3d',
    name: 'Obstacle Course 3D',
    tagline: '3D platform adventure! Run, jump, and dodge! 🏃‍♂️🎮',
    icon: 'gamepad',
    vibe: 'active',
    ageRange: '4-10',
    listed: BETA_3D_GAMES_ENABLED,
    drops: [DROPS.shapeStar, DROPS.starGold],
    easterEggs: [EGGS.speedRunner],
  }),

  createFeatured3DGame({
    id: 'feed-the-monster-3d',
    name: 'Feed Monster 3D',
    tagline: 'Feed the hungry 3D monster! 🍕👾',
    icon: 'utensils',
    vibe: 'relaxed',
    ageRange: '3-8',
    listed: BETA_3D_GAMES_ENABLED,
    drops: [
      { itemId: 'color-green', chance: 0.25 },
      { itemId: 'star-silver', chance: 0.1, minScore: 75 },
    ],
    easterEggs: [EGGS.monsterChef],
  }),

  createFeatured3DGame({
    id: 'virtual-bubbles-3d',
    name: 'Bubbles 3D',
    tagline: 'Pop iridescent 3D bubbles! 🫧✨',
    icon: 'sparkles',
    vibe: 'chill',
    ageRange: '2-6',
    listed: BETA_3D_GAMES_ENABLED,
    drops: [
      DROPS.colorBlue,
      { itemId: 'drop', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.1, minScore: 70 },
    ],
    easterEggs: [EGGS.bubblePopper],
  }),

  createFeatured3DGame({
    id: 'bubble-pop-3d',
    name: 'Bubble Pop 3D',
    tagline: 'Pop iridescent 3D bubbles with your hand! 🫧✨',
    icon: 'sparkles',
    vibe: 'chill',
    ageRange: '3-8',
    drops: [
      DROPS.colorBlue,
      { itemId: 'drop', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.1, minScore: 80 },
    ],
    easterEggs: [EGGS.bubbleMaster3D],
  }),

  createBasic3DGame({
    id: 'color-match-garden-3d',
    name: 'Color Match Garden 3D',
    tagline: 'Match colorful 3D flowers in the garden! 🌺🎨',
    icon: 'flower',
    vibe: 'creative',
    ageRange: '3-7',
    drops: [
      { itemId: 'color-red', chance: 0.25 },
      DROPS.colorBlue,
      DROPS.starSilver,
    ],
  }),

  createBasic3DGame({
    id: 'shape-safari-3d',
    name: 'Shape Safari 3D',
    tagline: 'Find 3D shapes in the safari adventure! 🦁🔺',
    icon: 'triangle',
    vibe: 'educational',
    ageRange: '3-7',
    drops: [
      DROPS.shapeCube,
      { itemId: 'shape-sphere', chance: 0.25 },
      DROPS.starSilver,
    ],
  }),

  createBasic3DGame({
    id: 'cutting-practice-3d',
    name: 'Cutting Practice 3D',
    tagline: 'Practice cutting in 3D space with precise slices!',
    icon: 'scissors',
    vibe: 'focus',
    ageRange: '4-8',
    drops: [{ itemId: 'tool-scissors', chance: 0.2 }],
  }),
];
