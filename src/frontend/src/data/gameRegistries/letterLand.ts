import type { GameManifest } from '../gameRegistry';

export const LETTER_LAND_GAMES: GameManifest[] = [
  // ── Letter Land ───────────────────────────────────────────────────
  {
    id: 'alphabet-tracing',
    name: 'Draw Letters',
    tagline: 'Draw letters with your finger and see them come alive! 🎉',
    path: '/games/alphabet-tracing',
    icon: 'letters',
    previewImage: '/assets/previews/alphabet-tracing.png',
    worldId: 'letter-land',
    vibe: 'chill',
    ageRange: '2-8',
    cv: ['hand', 'face'],
    listed: true,
    drops: [
      { itemId: 'color-rainbow', chance: 0.01, minScore: 95 },
      { itemId: 'tool-paintbrush', chance: 0.02, minScore: 85 },
    ],
    easterEggs: [],
  },
  {
    id: 'letter-hunt',
    name: 'Find the Letter',
    tagline: 'Hidden letters are everywhere — can you spot them? ⭐',
    path: '/games/letter-hunt',
    icon: 'target',
    previewImage: '/assets/previews/letter-hunt-v2.png',
    worldId: 'letter-land',
    vibe: 'active',
    ageRange: '2-6',
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'tool-magnifier', chance: 0.08 },
      { itemId: 'creature-owl', chance: 0.03, minScore: 85 },
    ],
    easterEggs: [
      {
        id: 'egg-treasure-hunter',
        name: 'Treasure Hunter Pro',
        description: 'Find 8 letters in a single session!',
        trigger: 'find-8-letters',
        reward: { itemId: 'tool-magnifier', quantity: 1 },
        hint: 'A keen eye finds treasure everywhere...',
        difficulty: 'medium',
      },
    ],
  },
];
