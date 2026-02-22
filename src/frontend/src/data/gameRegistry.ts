/**
 * GAME REGISTRY — Single source of truth for all games on the platform.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  HOW TO ADD A NEW GAME:                                         │
 * │                                                                  │
 * │  1. Create your game component in src/pages/ or src/games/      │
 * │  2. Add a GameManifest entry to GAME_REGISTRY below             │
 * │  3. Add a lazy import + <Route> in App.tsx                      │
 * │  4. That's it! Gallery, drops, easter eggs — all automatic.     │
 * │                                                                  │
 * │  The manifest defines:                                           │
 * │  - How the game appears in the gallery (name, tagline, icon)    │
 * │  - What world it belongs to (replaces "category")               │
 * │  - What items can drop when the game is completed               │
 * │  - What easter eggs are hidden inside                           │
 * │  - What inventory items affect gameplay (cross-game hooks)      │
 * └──────────────────────────────────────────────────────────────────┘
 */

import type { IconName } from '../components/ui/Icon';
import type { DropEntry } from './collectibles';
import type { EasterEgg } from './easterEggs';

// ─── TYPES ──────────────────────────────────────────────────────────────

export type GameVibe = 'chill' | 'active' | 'creative' | 'brainy';

export interface GameManifest {
  // Identity
  id: string;
  name: string;
  tagline: string; // fun one-liner — NOT "learn X", but "do Y!"
  path: string;
  icon: IconName;

  // World & feel
  worldId: string;
  vibe: GameVibe;
  ageRange: string;
  isNew?: boolean;

  // Visibility
  listed: boolean; // false = exists but hidden from gallery (easter egg game?)

  // CV requirements
  cv: ('hand' | 'pose' | 'face')[];

  // Item system
  drops: DropEntry[];
  easterEggs: Omit<EasterEgg, 'gameId'>[]; // gameId auto-set from manifest id

  // Cross-game: items from inventory that change this game's behavior
  usesItems?: {
    itemId: string;
    effect: string; // human-readable description for docs
  }[];
}

// ─── VIBE CONFIG ────────────────────────────────────────────────────────

export const VIBE_CONFIG: Record<GameVibe, { label: string; emoji: string; color: string }> = {
  chill:    { label: 'Chill',    emoji: '😌', color: '#10B981' },
  active:   { label: 'Active',   emoji: '⚡', color: '#F59E0B' },
  creative: { label: 'Creative', emoji: '🎨', color: '#A855F7' },
  brainy:   { label: 'Brainy',   emoji: '🧠', color: '#3B82F6' },
};

// ─── THE REGISTRY ───────────────────────────────────────────────────────

export const GAME_REGISTRY: GameManifest[] = [
  // ── Letter Land ───────────────────────────────────────────────────
  {
    id: 'alphabet-tracing',
    name: 'Draw Letters',
    tagline: 'Draw letters with your finger and see them come alive! 🎉',
    path: '/games/alphabet-tracing',
    icon: 'letters',
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

  // ── Word Workshop ─────────────────────────────────────────────────
  {
    id: 'word-builder',
    name: 'Word Builder',
    tagline: 'Grab letters and build words — spell anything! 📝✨',
    path: '/games/word-builder',
    icon: 'letters',
    worldId: 'word-workshop',
    vibe: 'brainy',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'creature-cat', chance: 0.2 },
      { itemId: 'creature-dog', chance: 0.2 },
      { itemId: 'food-cookie', chance: 0.15 },
      { itemId: 'food-apple', chance: 0.15 },
      { itemId: 'artifact-first-word', chance: 0.05, minScore: 80 },
    ],
    easterEggs: [
      {
        id: 'egg-first-word',
        name: 'First Word!',
        description: 'Successfully spell your first word!',
        trigger: 'first-word-complete',
        reward: { itemId: 'artifact-first-word', quantity: 1 },
        hint: 'Spell any word correctly!',
        difficulty: 'easy',
      },
    ],
  },
  {
    id: 'phonics-sounds',
    name: 'Phonics Sounds',
    tagline: 'Hear the sound, find the letter! 🔤🔊',
    path: '/games/phonics-sounds',
    icon: 'letters',
    worldId: 'word-workshop',
    vibe: 'brainy',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'food-apple', chance: 0.2 },
      { itemId: 'creature-cat', chance: 0.15 },
      { itemId: 'creature-dog', chance: 0.15 },
      { itemId: 'creature-owl', chance: 0.03, minScore: 90 },
    ],
    easterEggs: [
      {
        id: 'egg-vowel-master',
        name: 'Vowel Master',
        description: 'Correctly identify all 5 vowel sounds (A, E, I, O, U).',
        trigger: 'all-vowels-correct',
        reward: { itemId: 'creature-owl', quantity: 1 },
        hint: 'A-E-I-O-U — the special letters!',
        difficulty: 'medium',
      },
    ],
  },

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

  // ── Color Splash ──────────────────────────────────────────────────
  {
    id: 'color-match-garden',
    name: 'Color Match Garden',
    tagline: 'Grab the right color before time runs out! 🌸',
    path: '/games/color-match-garden',
    icon: 'drop',
    worldId: 'color-splash',
    vibe: 'active',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'color-red', chance: 0.5 },
      { itemId: 'color-blue', chance: 0.5 },
      { itemId: 'color-yellow', chance: 0.5 },
      { itemId: 'color-green', chance: 0.4 },
      { itemId: 'color-white', chance: 0.3 },
      { itemId: 'color-black', chance: 0.3 },
      { itemId: 'material-seed', chance: 0.1 },
    ],
    easterEggs: [],
  },

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

  // ── Steady Labs ───────────────────────────────────────────────────
  {
    id: 'steady-hand-lab',
    name: 'Steady Hand Lab',
    tagline: 'Hold your finger steady inside the ring — how long can you last? 🎯',
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

  // ── Body Zone ─────────────────────────────────────────────────────
  {
    id: 'yoga-animals',
    name: 'Yoga Animals',
    tagline: 'Become a tree, a lion, a flamingo — hold the pose! 🦁🌳',
    path: '/games/yoga-animals',
    icon: 'sparkles',
    worldId: 'body-zone',
    vibe: 'chill',
    ageRange: '3-8',
    isNew: true,
    cv: ['pose'],
    listed: true,
    drops: [
      { itemId: 'creature-cat', chance: 0.4 },
      { itemId: 'creature-dog', chance: 0.4 },
      { itemId: 'creature-lion', chance: 0.15 },
      { itemId: 'creature-butterfly', chance: 0.15 },
      { itemId: 'creature-owl', chance: 0.05 },
    ],
    easterEggs: [
      {
        id: 'egg-spirit-animal',
        name: 'Spirit Bond',
        description: 'Hold any pose perfectly for 10 seconds!',
        trigger: 'perfect-hold-10s',
        reward: { itemId: 'creature-owl', quantity: 1 },
        hint: 'Be still and patient like an owl...',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'freeze-dance',
    name: 'Freeze Dance',
    tagline: 'Dance when the music plays, FREEZE when it stops! 💃❄️',
    path: '/games/freeze-dance',
    icon: 'sparkles',
    worldId: 'body-zone',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['pose'],
    listed: true,
    drops: [
      { itemId: 'material-ice', chance: 0.15 },
      { itemId: 'emotion-happy', chance: 0.2 },
      { itemId: 'material-sunshine', chance: 0.03 },
    ],
    easterEggs: [
      {
        id: 'egg-ice-sculpture',
        name: 'Ice Sculpture',
        description: 'Freeze perfectly still 5 times in a row!',
        trigger: 'perfect-freeze-5',
        reward: { itemId: 'material-ice', quantity: 2 },
        hint: 'Can you freeze like a statue?',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'simon-says',
    name: 'Simon Says',
    tagline: 'Touch your head, wave, arms up — but only if Simon says! 🧠👆',
    path: '/games/simon-says',
    icon: 'sparkles',
    worldId: 'body-zone',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['pose'],
    listed: true,
    drops: [
      { itemId: 'creature-lion', chance: 0.1 },
      { itemId: 'creature-owl', chance: 0.05, minScore: 85 },
      { itemId: 'tool-wand', chance: 0.01, minScore: 95 },
    ],
    easterEggs: [
      {
        id: 'egg-simon-master',
        name: 'Simon\'s Apprentice',
        description: 'Complete 10 commands in a row without mistakes!',
        trigger: 'perfect-streak-10',
        reward: { itemId: 'tool-wand', quantity: 1 },
        hint: 'Listen carefully and follow EXACTLY...',
        difficulty: 'secret',
      },
    ],
  },

  // ── Lab of Wonders ────────────────────────────────────────────────
  {
    id: 'chemistry-lab',
    name: 'Chemistry Lab',
    tagline: 'Mix potions and discover amazing reactions! 🧪⚗️',
    path: '/games/chemistry-lab',
    icon: 'sparkles',
    worldId: 'lab-of-wonders',
    vibe: 'brainy',
    ageRange: '4-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'element-h', chance: 0.4 },
      { itemId: 'element-o', chance: 0.4 },
      { itemId: 'element-c', chance: 0.3 },
      { itemId: 'element-n', chance: 0.3 },
      { itemId: 'element-s', chance: 0.2 },
      { itemId: 'element-na', chance: 0.15 },
      { itemId: 'element-cl', chance: 0.15 },
      { itemId: 'element-fe', chance: 0.1 },
      { itemId: 'element-he', chance: 0.1 },
      { itemId: 'element-au', chance: 0.03, minScore: 90 },
    ],
    easterEggs: [
      {
        id: 'egg-gold-reaction',
        name: 'The Midas Touch',
        description: 'Perform a perfect reaction 3 times in a row!',
        trigger: 'perfect-streak-3',
        reward: { itemId: 'element-au', quantity: 1 },
        hint: 'Perfection attracts gold...',
        difficulty: 'medium',
      },
      {
        id: 'egg-periodic-key',
        name: 'Key to the Elements',
        description: 'Discover 5 different elements.',
        trigger: 'unique-elements-5',
        reward: { itemId: 'artifact-periodic-key', quantity: 1 },
        hint: 'Collect many different elements...',
        difficulty: 'hard',
      },
    ],
  },

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

  // ── Art Atelier ───────────────────────────────────────────────────
  {
    id: 'air-canvas',
    name: 'Air Canvas',
    tagline: 'Draw in the air with your finger — glowing art! 🎨✨',
    path: '/games/air-canvas',
    icon: 'sparkles',
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
        hint: 'Crystals are nature\'s perfect symmetry...',
        difficulty: 'hard',
      },
    ],
  },

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

// ─── LOOKUP HELPERS ─────────────────────────────────────────────────────

const _byId = new Map(GAME_REGISTRY.map((g) => [g.id, g]));

export function getGameManifest(id: string): GameManifest | undefined {
  return _byId.get(id);
}

export function getListedGames(): GameManifest[] {
  return GAME_REGISTRY.filter((g) => g.listed);
}

export function getGamesByWorld(worldId: string): GameManifest[] {
  return GAME_REGISTRY.filter((g) => g.worldId === worldId && g.listed);
}

export function getGamesByVibe(vibe: GameVibe): GameManifest[] {
  return GAME_REGISTRY.filter((g) => g.vibe === vibe && g.listed);
}

export function getAllWorlds(): string[] {
  return [...new Set(GAME_REGISTRY.filter((g) => g.listed).map((g) => g.worldId))];
}

/**
 * Get drop table for a game from the registry.
 * This replaces the hardcoded GAME_DROP_TABLES in collectibles.ts.
 */
export function getDropTable(gameId: string): DropEntry[] {
  return _byId.get(gameId)?.drops ?? [];
}

/**
 * Get easter eggs for a game from the registry.
 * Auto-injects gameId from the manifest.
 */
export function getRegistryEasterEggs(gameId: string): EasterEgg[] {
  const manifest = _byId.get(gameId);
  if (!manifest) return [];
  return manifest.easterEggs.map((egg) => ({ ...egg, gameId }));
}
