import type { GameManifest } from '../gameRegistry';

export const PLATFORM_WORLD_GAMES: GameManifest[] = [
  // ── Platform World ────────────────────────────────────────────────
  {
    id: 'platformer-runner',
    name: 'Platform Runner',
    tagline: 'Raise your hand to jump, dodge slimes, grab coins! 🏃⭐',
    path: '/games/platformer-runner',
    icon: 'sparkles',
    worldId: 'platform-world',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.25 },
      { itemId: 'color-rainbow', chance: 0.15, minScore: 70 },
    ],
    easterEggs: [
      {
        id: 'egg-coin-king',
        name: 'Coin King',
        description: 'Collect 20 coins in one run!',
        trigger: 'coins-20',
        reward: { itemId: 'shape-star', quantity: 2 },
        hint: 'Grab every shiny coin you see…',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'counting-collectathon',
    name: 'Counting Collect-a-thon',
    tagline: 'Collect the treasures! How many can you get? ⭐🪙💎',
    path: '/games/counting-collectathon',
    icon: 'treasure',
    worldId: 'number-jungle',
    vibe: 'active',
    ageRange: '2-5',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.25 },
      { itemId: 'shape-circle', chance: 0.2 },
      { itemId: 'shape-triangle', chance: 0.15 },
    ],
    easterEggs: [
      {
        id: 'egg-treasure-master',
        name: 'Treasure Master',
        description: 'Complete all 5 rounds without mistakes!',
        trigger: 'perfect-rounds-5',
        reward: { itemId: 'element-au', quantity: 1 },
        hint: 'Collect only the right items…',
        difficulty: 'hard',
      },
    ],
  },
];
