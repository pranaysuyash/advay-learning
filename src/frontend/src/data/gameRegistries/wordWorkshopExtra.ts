import type { GameManifest } from '../gameRegistry';

export const WORD_WORKSHOP_EXTRA_GAMES: GameManifest[] = [
  // ── Word Workshop (Additional) ────────────────────────────────────
  {
    id: 'rhyme-time',
    name: 'Rhyme Time',
    tagline: 'Which word rhymes? Listen and choose! 🎵',
    path: '/games/rhyme-time',
    icon: 'sparkles',
    worldId: 'word-workshop',
    vibe: 'brainy',
    ageRange: '4-6',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'creature-cat', chance: 0.15 },
      { itemId: 'creature-dog', chance: 0.15 },
      { itemId: 'food-apple', chance: 0.1 },
    ],
    easterEggs: [],
  },
];
