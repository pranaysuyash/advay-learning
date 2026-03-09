import type { GameManifest } from '../gameRegistry';

export const STEADY_LABS_GAMES: GameManifest[] = [
  // ── Steady Labs ───────────────────────────────────────────────────
  {
    id: 'steady-hand-lab',
    name: 'Steady Hand Lab',
    tagline:
      'Hold your finger steady inside the ring — how long can you last? 🎯',
    path: '/games/steady-hand-lab',
    icon: 'circle',
    worldId: 'steady-labs',
    vibe: 'chill',
    ageRange: '4-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'tool-magnifier', chance: 0.05, minScore: 90 },
      { itemId: 'material-crystal', chance: 0.02, minScore: 95 },
    ],
    easterEggs: [
      {
        id: 'egg-surgeon-hands',
        name: 'Surgeon Hands',
        description: 'Keep your hand perfectly steady for 15 seconds!',
        trigger: 'steady-15s',
        reward: { itemId: 'tool-microscope', quantity: 1 },
        hint: 'Can you be steadier than a surgeon?',
        difficulty: 'hard',
      },
    ],
  },
];

export const FEELING_FOREST_GAMES: GameManifest[] = [
  // ── Feeling Forest ────────────────────────────────────────────────
  {
    id: 'emoji-match',
    name: 'Emoji Match',
    tagline: 'Match emotions to the right face! 😊😢😠',
    path: '/games/emoji-match',
    icon: 'heart',
    worldId: 'feeling-forest',
    vibe: 'chill',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'emotion-happy', chance: 0.5 },
      { itemId: 'emotion-sad', chance: 0.4 },
      { itemId: 'emotion-angry', chance: 0.4 },
      { itemId: 'emotion-surprised', chance: 0.2 },
      { itemId: 'emotion-scared', chance: 0.15 },
      { itemId: 'emotion-love', chance: 0.05, minScore: 80 },
      { itemId: 'emotion-calm', chance: 0.05, minScore: 90 },
    ],
    easterEggs: [
      {
        id: 'egg-emotion-master',
        name: 'Emotion Master',
        description: 'Match all emotions without mistakes!',
        trigger: 'perfect-all-emotions',
        reward: { itemId: 'emotion-love', quantity: 1 },
        hint: 'Every emotion matters — can you catch them all perfectly?',
        difficulty: 'hard',
      },
    ],
  },
];
