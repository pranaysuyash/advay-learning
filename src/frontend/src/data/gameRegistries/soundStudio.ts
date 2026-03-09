import type { GameManifest } from '../gameRegistry';

export const SOUND_STUDIO_GAMES: GameManifest[] = [
  // ── Sound Studio ──────────────────────────────────────────────────
  {
    id: 'music-pinch-beat',
    name: 'Music Pinch Beat',
    tagline: 'Pinch the glowing lanes to play beats! 🎵',
    path: '/games/music-pinch-beat',
    icon: 'sparkles',
    worldId: 'sound-studio',
    vibe: 'creative',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'note-do', chance: 0.4 },
      { itemId: 'note-re', chance: 0.4 },
      { itemId: 'note-mi', chance: 0.4 },
      { itemId: 'note-fa', chance: 0.3 },
      { itemId: 'note-sol', chance: 0.15 },
      { itemId: 'note-la', chance: 0.15 },
      { itemId: 'note-ti', chance: 0.1 },
    ],
    easterEggs: [
      {
        id: 'egg-full-scale',
        name: 'Full Scale!',
        description: 'Play all 7 notes in one session.',
        trigger: 'play-all-notes',
        reward: { itemId: 'artifact-melody', quantity: 1 },
        hint: 'The scale has 7 notes — have you played them all?',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'bubble-pop-symphony',
    name: 'Bubble Pop Symphony',
    tagline: 'Pop bubbles to create melodies! 🫧🎶',
    path: '/games/bubble-pop-symphony',
    icon: 'sparkles',
    worldId: 'sound-studio',
    vibe: 'chill',
    ageRange: '3-7',
    cv: ['hand'],
    listed: true, // was unlisted — now visible!
    drops: [
      { itemId: 'note-do', chance: 0.3 },
      { itemId: 'note-re', chance: 0.3 },
      { itemId: 'note-mi', chance: 0.3 },
      { itemId: 'note-fa', chance: 0.3 },
      { itemId: 'note-sol', chance: 0.2 },
      { itemId: 'note-la', chance: 0.2 },
      { itemId: 'note-ti', chance: 0.15 },
    ],
    easterEggs: [],
  },
];
