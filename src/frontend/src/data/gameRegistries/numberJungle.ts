import type { GameManifest } from '../gameRegistry';

export const NUMBER_JUNGLE_GAMES: GameManifest[] = [
  // ── Number Jungle ─────────────────────────────────────────────────
  {
    id: 'finger-number-show',
    name: 'Finger Counting',
    tagline: 'Show numbers with your fingers and Pip will count them! 🔢',
    path: '/games/finger-number-show',
    icon: 'hand',
    worldId: 'number-jungle',
    vibe: 'chill',
    ageRange: '3-7',
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-circle', chance: 0.15 },
      { itemId: 'shape-triangle', chance: 0.15 },
      { itemId: 'shape-star', chance: 0.05 },
    ],
    easterEggs: [],
  },
  {
    id: 'number-tap-trail',
    name: 'Number Tap Trail',
    tagline: 'Tap numbers in order and clear the trail! 🔢',
    path: '/games/number-tap-trail',
    icon: 'circle',
    worldId: 'number-jungle',
    vibe: 'active',
    ageRange: '4-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.15 },
      { itemId: 'element-au', chance: 0.02, minScore: 90 },
    ],
    easterEggs: [
      {
        id: 'egg-golden-number',
        name: 'Golden Sequence',
        description: 'Complete a trail of 10+ numbers with no mistakes!',
        trigger: 'perfect-trail-10',
        reward: { itemId: 'element-au', quantity: 1 },
        hint: 'Numbers in perfect order reveal gold...',
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'number-tracing',
    name: 'Number Tracing',
    tagline:
      'Trace digits from 0 to 9 and build your number-writing skills! ✍️',
    path: '/games/number-tracing',
    icon: 'pencil',
    worldId: 'number-jungle',
    vibe: 'chill',
    ageRange: '4-7',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'shape-circle', chance: 0.2 },
      { itemId: 'shape-star', chance: 0.12 },
      { itemId: 'tool-paintbrush', chance: 0.04, minScore: 80 },
    ],
    easterEggs: [],
  },
];

export const NUMBER_JUNGLE_EXTRA_GAMES: GameManifest[] = [
  // ── Number Jungle (Additional) ────────────────────────────────────
  {
    id: 'math-monsters',
    name: 'Math Monsters',
    tagline: 'Feed hungry monsters with your finger counting! 🦖🔢',
    path: '/games/math-monsters',
    icon: 'hand',
    worldId: 'number-jungle',
    vibe: 'brainy',
    ageRange: '5-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.15 },
      { itemId: 'element-au', chance: 0.02, minScore: 90 },
    ],
    easterEggs: [],
  },
  {
    id: 'math-jumpers',
    name: 'Math Jumpers',
    tagline: 'Jump to the correct answer and solve math problems! 🚀🔢',
    path: '/games/math-jumpers',
    icon: 'target',
    worldId: 'number-jungle',
    vibe: 'active',
    ageRange: '4-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.2 },
      { itemId: 'creature-alien', chance: 0.1 },
      { itemId: 'element-au', chance: 0.03, minScore: 95 },
    ],
    easterEggs: [
      {
        id: 'egg-math-master',
        name: 'Math Master',
        description: 'Solve 5 problems in a row without mistakes!',
        trigger: 'perfect-streak-5',
        reward: { itemId: 'element-au', quantity: 1 },
        hint: 'Perfect math skills reveal golden treasures...',
        difficulty: 'hard',
      },
    ],
  },
];
