import type { GameManifest } from '../gameRegistry';

export const REAL_WORLD_GAMES: GameManifest[] = [
  // ── Real World ────────────────────────────────────────────────────
  {
    id: 'dress-for-weather',
    name: 'Dress For Weather',
    tagline: 'Is it rainy? Sunny? Snowy? Pick the right outfit! ☀️🌧️',
    path: '/games/dress-for-weather',
    icon: 'sparkles',
    worldId: 'real-world',
    vibe: 'chill',
    ageRange: '3-7',
    cv: ['hand'],
    listed: true, // was unlisted — now visible!
    drops: [
      { itemId: 'material-water', chance: 0.2 },
      { itemId: 'material-sunshine', chance: 0.15 },
      { itemId: 'material-ice', chance: 0.15 },
    ],
    easterEggs: [],
  },
];

export const STORY_CORNER_GAMES: GameManifest[] = [
  // ── Story Corner ──────────────────────────────────────────────────
  {
    id: 'story-sequence',
    name: 'Story Sequence',
    tagline: 'Put the picture cards in order to tell the story! 📚',
    path: '/games/story-sequence',
    icon: 'sparkles',
    worldId: 'story-corner',
    vibe: 'brainy',
    ageRange: '4-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'creature-owl', chance: 0.1 },
      { itemId: 'artifact-first-word', chance: 0.05, minScore: 85 },
    ],
    easterEggs: [],
  },
];
