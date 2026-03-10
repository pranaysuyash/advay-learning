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

export const WELLNESS_GAMES: GameManifest[] = [
  // ── Wellness / Hygiene ────────────────────────────────────────────
  {
    id: 'wash-hands-dance',
    name: 'Wash Hands Dance',
    tagline: 'Dance your hands clean with Pip! 🧼💧',
    path: '/games/wash-hands-dance',
    icon: 'heart',
    worldId: 'wellness',
    vibe: 'active',
    ageRange: '3-6',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'item-soap-bubble', chance: 0.4 },
      { itemId: 'item-water-drop', chance: 0.3 },
    ],
    easterEggs: [
      {
        id: 'egg-squeaky-clean',
        name: 'Squeaky Clean',
        description: 'Complete all 5 steps on the first try!',
        trigger: 'perfect-all-steps',
        reward: { itemId: 'item-sparkle', quantity: 1 },
        hint: 'Can you wash perfectly every step?',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'pack-lunchbox',
    name: 'Pack Lunchbox',
    tagline: 'Pack a healthy lunch with fruit, veggies, and protein! 🍱',
    path: '/games/pack-lunchbox',
    icon: 'utensils',
    worldId: 'wellness',
    vibe: 'creative',
    ageRange: '3-5',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'food-apple', chance: 0.3 },
      { itemId: 'food-carrot', chance: 0.25 },
      { itemId: 'food-chicken', chance: 0.2 },
      { itemId: 'item-lunchbox', chance: 0.1, minScore: 80 },
    ],
    easterEggs: [
      {
        id: 'egg-balanced-lunch',
        name: 'Nutrition Expert',
        description: 'Pack a perfectly balanced lunch!',
        trigger: 'balanced-lunch',
        reward: { itemId: 'item-star', quantity: 1 },
        hint: 'One fruit, one vegetable, one protein!',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'set-the-table',
    name: 'Set the Table',
    tagline: 'Learn to set the table! Fork left, knife right! 🍽️',
    path: '/games/set-the-table',
    icon: 'utensils',
    worldId: 'wellness',
    vibe: 'educational',
    ageRange: '4-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'item-plate', chance: 0.4 },
      { itemId: 'item-fork', chance: 0.3 },
      { itemId: 'item-cup', chance: 0.25 },
    ],
    easterEggs: [],
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
