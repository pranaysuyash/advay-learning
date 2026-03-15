import type { GameManifest } from '../gameRegistry';

export const DOODLE_DOCK_GAMES: GameManifest[] = [
  // ── Doodle Dock ───────────────────────────────────────────────────
  {
    id: 'connect-the-dots',
    name: 'Connect Dots',
    tagline: 'Connect the dots to reveal hidden pictures! 🎨',
    path: '/games/connect-the-dots',
    icon: 'target',
    worldId: 'doodle-dock',
    vibe: 'chill',
    ageRange: '3-6',
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.2 },
      { itemId: 'shape-heart', chance: 0.15 },
      { itemId: 'creature-butterfly', chance: 0.1 },
    ],
    easterEggs: [
      {
        id: 'egg-star-connector',
        name: 'Star Connector',
        description: 'Complete a picture that forms a star!',
        trigger: 'complete-star-picture',
        reward: { itemId: 'shape-star', quantity: 2 },
        hint: 'Some pictures are written in the stars...',
        difficulty: 'easy',
      },
    ],
  },
];

export const ART_ATELIER_GAMES: GameManifest[] = [
  // ── Art Atelier ───────────────────────────────────────────────────
  {
    id: 'air-canvas',
    name: 'Air Canvas',
    tagline: 'Draw in the air with your finger — glowing art! 🎨✨',
    path: '/games/air-canvas',
    icon: 'sparkles',
    previewImage: '/assets/previews/shadow-puppet-theater.png',
    worldId: 'art-atelier',
    vibe: 'creative',
    ageRange: '3-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'color-red', chance: 0.3 },
      { itemId: 'color-blue', chance: 0.3 },
      { itemId: 'color-yellow', chance: 0.3 },
      { itemId: 'color-green', chance: 0.2 },
      { itemId: 'tool-paintbrush', chance: 0.03 },
    ],
    easterEggs: [
      {
        id: 'egg-golden-brush',
        name: 'The Golden Brush',
        description: 'Draw a circle in the air!',
        trigger: 'draw-circle',
        reward: { itemId: 'tool-paintbrush', quantity: 1 },
        hint: 'Try drawing the most perfect shape...',
        difficulty: 'easy',
      },
      {
        id: 'egg-rainbow-canvas',
        name: 'Rainbow Artist',
        description: 'Use all available colors in one drawing.',
        trigger: 'use-all-colors',
        reward: { itemId: 'color-rainbow', quantity: 1 },
        hint: 'Why settle for one color?',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'mirror-draw',
    name: 'Mirror Draw',
    tagline: 'Trace the mirror half of shapes — perfect symmetry! ✏️',
    path: '/games/mirror-draw',
    icon: 'sparkles',
    previewImage: '/assets/previews/shadow-puppet-theater.png',
    worldId: 'art-atelier',
    vibe: 'chill',
    ageRange: '4-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.2 },
      { itemId: 'shape-heart', chance: 0.15 },
      { itemId: 'shape-diamond', chance: 0.05 },
      { itemId: 'material-crystal', chance: 0.02, minScore: 95 },
    ],
    easterEggs: [
      {
        id: 'egg-perfect-symmetry',
        name: 'Perfect Symmetry',
        description: 'Achieve 95%+ accuracy on a mirror drawing!',
        trigger: 'accuracy-95',
        reward: { itemId: 'material-crystal', quantity: 1 },
        hint: "Crystals are nature's perfect symmetry...",
        difficulty: 'hard',
      },
    ],
  },
];

export const CREATIVE_CORNER_GAMES: GameManifest[] = [
  // ── Creative Corner ───────────────────────────────────────────────
  {
    id: 'free-draw',
    name: 'Free Draw',
    tagline: 'Paint with your finger! Mix colors and create art! 🎨',
    path: '/games/free-draw',
    icon: 'drop',
    previewImage: '/assets/previews/shadow-puppet-theater.png',
    worldId: 'creative-corner',
    vibe: 'creative',
    ageRange: '2-6',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'color-rainbow', chance: 0.1 },
      { itemId: 'tool-paintbrush', chance: 0.2 },
    ],
    easterEggs: [],
  },
  // ── Circle Drawing ────────────────────────────────────────────────
  {
    id: 'circle-drawing',
    name: 'Circle Drawing',
    tagline: 'Draw perfect circles and shapes with your finger! ⭕✏️',
    path: '/games/circle-drawing',
    icon: 'drop',
    previewImage: '/assets/previews/shadow-puppet-theater.png',
    worldId: 'creative-corner',
    vibe: 'creative',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'color-rainbow', chance: 0.15 },
      { itemId: 'tool-paintbrush', chance: 0.2 },
    ],
    easterEggs: [],
  },
  // ── Finger Painting Madness ─────────────────────────────────────────
  {
    id: 'finger-painting-madness',
    name: 'Finger Painting Madness',
    tagline: 'No rules, pure messy finger painting! 🎨🖌️',
    path: '/games/finger-painting-madness',
    icon: 'sparkles',
    worldId: 'creative-corner',
    vibe: 'creative',
    ageRange: '2-6',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'color-rainbow', chance: 0.15 },
      { itemId: 'tool-paintbrush', chance: 0.2 },
    ],
    easterEggs: [],
  },
];
