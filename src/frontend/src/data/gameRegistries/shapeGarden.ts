import type { GameManifest } from '../gameRegistry';

export const SHAPE_GARDEN_GAMES: GameManifest[] = [
  // ── Shape Garden ──────────────────────────────────────────────────
  {
    id: 'shape-pop',
    name: 'Shape Pop',
    tagline: 'Pop glowing shapes before they vanish! ✨',
    path: '/games/shape-pop',
    icon: 'sparkles',
    worldId: 'shape-garden',
    vibe: 'active',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-circle', chance: 0.5 },
      { itemId: 'shape-triangle', chance: 0.5 },
      { itemId: 'shape-square', chance: 0.5 },
      { itemId: 'shape-star', chance: 0.15 },
      { itemId: 'shape-heart', chance: 0.1 },
      { itemId: 'shape-diamond', chance: 0.03, minScore: 90 },
    ],
    easterEggs: [
      {
        id: 'egg-diamond-pop',
        name: 'Diamond in the Rough',
        description: 'Pop 20 shapes in under 30 seconds!',
        trigger: 'speed-pop-20',
        reward: { itemId: 'shape-diamond', quantity: 1 },
        hint: 'Speed reveals hidden gems...',
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'shape-sequence',
    name: 'Shape Sequence',
    tagline: 'Remember the pattern and tap them in order! 🧩',
    path: '/games/shape-sequence',
    icon: 'sparkles',
    worldId: 'mind-maze',
    vibe: 'brainy',
    ageRange: '4-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.2 },
      { itemId: 'shape-diamond', chance: 0.05 },
      { itemId: 'material-crystal', chance: 0.02, minScore: 90 },
    ],
    easterEggs: [],
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    tagline: 'Flip, remember, and match every pair before time runs out! 🧠',
    path: '/games/memory-match',
    icon: 'star',
    worldId: 'mind-maze',
    vibe: 'brainy',
    ageRange: '4-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.25 },
      { itemId: 'shape-heart', chance: 0.2 },
      { itemId: 'material-crystal', chance: 0.05, minScore: 80 },
    ],
    easterEggs: [
      {
        id: 'egg-memory-streak',
        name: 'Memory Streak',
        description: 'Finish a board with 2 or fewer mistakes.',
        trigger: 'memory-perfect-ish',
        reward: { itemId: 'material-crystal', quantity: 1 },
        hint: 'Remember where each card hides.',
        difficulty: 'medium',
      },
    ],
  },
];

export const SHAPE_GARDEN_EXTRA_GAMES: GameManifest[] = [
  // ── Shape Garden (Additional) ─────────────────────────────────────
  {
    id: 'shape-safari',
    name: 'Shape Safari',
    tagline: 'Trace hidden shapes to discover animals and objects! 🔍',
    path: '/games/shape-safari',
    icon: 'target',
    worldId: 'shape-garden',
    vibe: 'creative',
    ageRange: '3-5',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-circle', chance: 0.3 },
      { itemId: 'shape-square', chance: 0.3 },
      { itemId: 'shape-triangle', chance: 0.3 },
      { itemId: 'shape-star', chance: 0.15 },
    ],
    easterEggs: [],
  },
];
