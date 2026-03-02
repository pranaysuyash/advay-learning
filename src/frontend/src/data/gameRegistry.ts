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

export type GameVibe =
  | 'chill'
  | 'active'
  | 'creative'
  | 'brainy'
  | 'educational'
  | 'musical'
  | 'puzzle'
  | 'focus'
  | 'relaxed';

export interface GameManifest {
  // Identity
  id: string;
  name: string;
  tagline: string; // fun one-liner — NOT "learn X", but "do Y!"
  path: string;
  icon: IconName | string;

  // World & feel
  worldId: string;
  vibe: GameVibe;
  ageRange: string;
  isNew?: boolean;

  // Visibility
  listed: boolean; // false = exists but hidden from gallery (easter egg game?)

  // CV requirements
  cv: ('hand' | 'pose' | 'face' | 'voice')[];

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

export const VIBE_CONFIG: Record<
  GameVibe,
  { label: string; emoji: string; color: string }
> = {
  chill: { label: 'Chill', emoji: '😌', color: '#10B981' },
  active: { label: 'Active', emoji: '⚡', color: '#F59E0B' },
  creative: { label: 'Creative', emoji: '🎨', color: '#A855F7' },
  brainy: { label: 'Brainy', emoji: '🧠', color: '#3B82F6' },
  educational: { label: 'Educational', emoji: '📚', color: '#6366F1' },
  musical: { label: 'Musical', emoji: '🎵', color: '#EC4899' },
  puzzle: { label: 'Puzzle', emoji: '🧩', color: '#8B5CF6' },
  focus: { label: 'Focus', emoji: '🎯', color: '#14B8A6' },
  relaxed: { label: 'Relaxed', emoji: '😴', color: '#60A5FA' },
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
  {
    id: 'phonics-tracing',
    name: 'Phonics Tracing',
    tagline: 'Trace letters and hear them sound out in real-time! 🔤🎵',
    path: '/games/phonics-tracing',
    icon: 'letters',
    worldId: 'word-workshop',
    vibe: 'chill',
    ageRange: '4-6',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'food-apple', chance: 0.2 },
      { itemId: 'creature-cat', chance: 0.15 },
      { itemId: 'creature-dog', chance: 0.15 },
      { itemId: 'creature-owl', chance: 0.05, minScore: 85 },
    ],
    easterEggs: [
      {
        id: 'egg-phonics-master',
        name: 'Phonics Master',
        description: 'Complete all 3 levels!',
        trigger: 'all-levels-complete',
        reward: { itemId: 'creature-owl', quantity: 1 },
        hint: 'Master all the letter sounds...',
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'beginning-sounds',
    name: 'Beginning Sounds',
    tagline: 'What sound does the word start with? Listen and choose! 🔊',
    path: '/games/beginning-sounds',
    icon: 'letters',
    worldId: 'word-workshop',
    vibe: 'brainy',
    ageRange: '3-6',
    isNew: true,
    cv: ['hand', 'voice'],
    listed: true,
    drops: [
      { itemId: 'creature-owl', chance: 0.15 },
      { itemId: 'food-apple', chance: 0.2 },
      { itemId: 'creature-cat', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'odd-one-out',
    name: 'Odd One Out',
    tagline: 'Find the one that does NOT belong! 🤔',
    path: '/games/odd-one-out',
    icon: 'sparkles',
    worldId: 'mind-maze',
    vibe: 'brainy',
    ageRange: '3-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.2 },
      { itemId: 'material-crystal', chance: 0.1 },
    ],
    easterEggs: [],
  },
  {
    id: 'shadow-puppet-theater',
    name: 'Shadow Puppet Theater',
    tagline: 'Make shadow animals with your hands! 🦋',
    path: '/games/shadow-puppet-theater',
    icon: 'sparkles',
    worldId: 'creative-corner',
    vibe: 'creative',
    ageRange: '3-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'tool-paintbrush', chance: 0.15 },
      { itemId: 'color-rainbow', chance: 0.1 },
    ],
    easterEggs: [],
  },
  {
    id: 'virtual-bubbles',
    name: 'Virtual Bubbles',
    tagline: 'Blow to make bubbles, pop them with your hands! 🫧',
    path: '/games/virtual-bubbles',
    icon: 'drop',
    worldId: 'creative-corner',
    vibe: 'chill',
    ageRange: '2-6',
    isNew: true,
    cv: ['hand', 'voice'],
    listed: true,
    drops: [
      { itemId: 'material-crystal', chance: 0.1 },
      { itemId: 'shape-circle', chance: 0.2 },
    ],
    easterEggs: [],
  },
  {
    id: 'kaleidoscope-hands',
    name: 'Kaleidoscope Hands',
    tagline: 'Move your hands to create beautiful symmetrical art! 🎨',
    path: '/games/kaleidoscope-hands',
    icon: 'sparkles',
    worldId: 'creative-corner',
    vibe: 'creative',
    ageRange: '3-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'color-rainbow', chance: 0.2 },
      { itemId: 'tool-paintbrush', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'air-guitar-hero',
    name: 'Air Guitar Hero',
    tagline: 'Strum and rock like a superstar! 🎸',
    path: '/games/air-guitar-hero',
    icon: 'guitar',
    worldId: 'sound-studio',
    vibe: 'musical',
    ageRange: '3-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'music-note', chance: 0.2 },
      { itemId: 'star-gold', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'fruit-ninja-air',
    name: 'Fruit Ninja Air',
    tagline: 'Slice fruits in the air with hand gestures! 🍎',
    path: '/games/fruit-ninja-air',
    icon: 'fruit',
    worldId: 'motor-zone',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'fruit-apple', chance: 0.2 },
      { itemId: 'tool-knife', chance: 0.1 },
    ],
    easterEggs: [],
  },
  {
    id: 'counting-objects',
    name: 'Counting Objects',
    tagline: 'Count the fun objects you see! 🔢',
    path: '/games/counting-objects',
    icon: 'numbers',
    worldId: 'number-jungle',
    vibe: 'educational',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'number-one', chance: 0.2 },
      { itemId: 'shape-star', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'more-or-less',
    name: 'More or Less',
    tagline: 'Find which group has more or less! 📊',
    path: '/games/more-or-less',
    icon: 'scale',
    worldId: 'number-jungle',
    vibe: 'educational',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'math-plus', chance: 0.2 },
      { itemId: 'trophy-bronze', chance: 0.1 },
    ],
    easterEggs: [],
  },
  {
    id: 'blend-builder',
    name: 'Blend Builder',
    tagline: 'Blend sounds to make words! 🧩',
    path: '/games/blend-builder',
    icon: 'puzzle',
    worldId: 'word-workshop',
    vibe: 'educational',
    ageRange: '4-7',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'letter-a', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'syllable-clap',
    name: 'Syllable Clap',
    tagline: 'Clap the syllables in words! 👏',
    path: '/games/syllable-clap',
    icon: 'clap',
    worldId: 'word-workshop',
    vibe: 'educational',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'music-note', chance: 0.2 },
      { itemId: 'star-bronze', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'sight-word-flash',
    name: 'Sight Word Flash',
    tagline: 'How many words do you know? 👀',
    path: '/games/sight-word-flash',
    icon: 'eye',
    worldId: 'word-workshop',
    vibe: 'educational',
    ageRange: '4-7',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'book-blue', chance: 0.2 },
      { itemId: 'star-gold', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'maze-runner',
    name: 'Maze Runner',
    tagline: 'Navigate through the maze! 🧩',
    path: '/games/maze-runner',
    icon: 'labyrinth',
    worldId: 'mind-maze',
    vibe: 'puzzle',
    ageRange: '4-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'key-gold', chance: 0.2 },
      { itemId: 'trophy-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'path-following',
    name: 'Path Following',
    tagline: 'Stay on the winding path! 🛤️',
    path: '/games/path-following',
    icon: 'path',
    worldId: 'motor-zone',
    vibe: 'focus',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'path-star', chance: 0.2 },
      { itemId: 'trophy-bronze', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'rhythm-tap',
    name: 'Rhythm Tap',
    tagline: 'Repeat the rhythm patterns! 🎵',
    path: '/games/rhythm-tap',
    icon: 'music',
    worldId: 'sound-studio',
    vibe: 'musical',
    ageRange: '3-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'music-note', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'animal-sounds',
    name: 'Animal Sounds',
    tagline: 'Which animal makes this sound? 🐾',
    path: '/games/animal-sounds',
    icon: 'paw',
    worldId: 'knowledge-zone',
    vibe: 'educational',
    ageRange: '2-5',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'animal-cat', chance: 0.2 },
      { itemId: 'star-bronze', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'body-parts',
    name: 'Body Parts',
    tagline: 'Point to your body parts! 🧘',
    path: '/games/body-parts',
    icon: 'person',
    worldId: 'knowledge-zone',
    vibe: 'educational',
    ageRange: '2-5',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'body-heart', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'voice-stories',
    name: 'Voice Stories',
    tagline: 'Listen and follow along! 📖',
    path: '/games/voice-stories',
    icon: 'book',
    worldId: 'story-corner',
    vibe: 'relaxed',
    ageRange: '3-7',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'book-blue', chance: 0.2 },
      { itemId: 'star-gold', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'math-smash',
    name: 'Math Smash',
    tagline: 'Solve math and smash the answer! 🔨',
    path: '/games/math-smash',
    icon: 'calculator',
    worldId: 'number-jungle',
    vibe: 'educational',
    ageRange: '4-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'math-plus', chance: 0.2 },
      { itemId: 'trophy-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'color-sort',
    name: 'Color Sort',
    tagline: 'Sort colors into matching buckets! 🎨',
    path: '/games/color-sort',
    icon: 'palette',
    worldId: 'color-splash',
    vibe: 'puzzle',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'color-rainbow', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'letter-catcher',
    name: 'Letter Catcher',
    tagline: 'Catch falling letters! 🪣',
    path: '/games/letter-catcher',
    icon: 'alphabet',
    worldId: 'letter-land',
    vibe: 'active',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'letter-a', chance: 0.2 },
      { itemId: 'star-bronze', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'number-bubble-pop',
    name: 'Number Bubble Pop',
    tagline: 'Pop bubbles with the right number! 🫧',
    path: '/games/number-bubble-pop',
    icon: 'bubble',
    worldId: 'number-jungle',
    vibe: 'active',
    ageRange: '3-5',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'number-one', chance: 0.2 },
      { itemId: 'star-gold', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'pop-the-number',
    name: 'Pop the Number',
    tagline: 'Pop numbers in order! 1, 2, 3... 🔢',
    path: '/games/pop-the-number',
    icon: 'numbers',
    worldId: 'number-jungle',
    vibe: 'active',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'rainbow-bridge',
    name: 'Rainbow Bridge',
    tagline: 'Connect the dots to build a rainbow! 🌈',
    path: '/games/rainbow-bridge',
    icon: 'rainbow',
    worldId: 'colors',
    vibe: 'creative',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'beat-bounce',
    name: 'Beat Bounce',
    tagline: 'Tap to the rhythm! 🎵',
    path: '/games/beat-bounce',
    icon: 'music',
    worldId: 'rhythm',
    vibe: 'active',
    ageRange: '4-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'bubble-count',
    name: 'Bubble Count',
    tagline: 'Count the bubbles! 🫧',
    path: '/games/bubble-count',
    icon: 'bubble',
    worldId: 'number-jungle',
    vibe: 'relaxed',
    ageRange: '3-5',
    isNew: true,
    cv: [],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'feed-the-monster',
    name: 'Feed the Monster',
    tagline: 'Match food to feelings! 👾',
    path: '/games/feed-the-monster',
    icon: 'monster',
    worldId: 'social',
    vibe: 'active',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'shape-stacker',
    name: 'Shape Stacker',
    tagline: 'Stack shapes to match! 🔷',
    path: '/games/shape-stacker',
    icon: 'shape',
    worldId: 'motor-zone',
    vibe: 'puzzle',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'digital-jenga',
    name: 'Digital Jenga',
    tagline: 'Remove blocks carefully! 🧱',
    path: '/games/digital-jenga',
    icon: 'blocks',
    worldId: 'motor-zone',
    vibe: 'puzzle',
    ageRange: '4-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'block-wood', chance: 0.2 },
      { itemId: 'trophy-gold', chance: 0.1 },
    ],
    easterEggs: [],
  },
  {
    id: 'weather-match',
    name: 'Weather Match',
    tagline: 'Match weather to clothing! 🌤️',
    path: '/games/weather-match',
    icon: 'cloud',
    worldId: 'real-world',
    vibe: 'educational',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'clothing-umbrella', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'fraction-pizza',
    name: 'Fraction Pizza',
    tagline: 'Learn fractions with pizza! 🍕',
    path: '/games/fraction-pizza',
    icon: 'pizza',
    worldId: 'number-jungle',
    vibe: 'educational',
    ageRange: '5-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'food-pizza', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'time-tell',
    name: 'Time Tell',
    tagline: 'Learn to read the clock! 🕐',
    path: '/games/time-tell',
    icon: 'clock',
    worldId: 'number-jungle',
    vibe: 'educational',
    ageRange: '5-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'tool-clock', chance: 0.2 },
      { itemId: 'star-bronze', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'money-match',
    name: 'Money Match',
    tagline: 'Count coins and make amounts! 💰',
    path: '/games/money-match',
    icon: 'dollar',
    worldId: 'number-jungle',
    vibe: 'educational',
    ageRange: '5-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'coin-gold', chance: 0.2 },
      { itemId: 'trophy-bronze', chance: 0.15 },
    ],
    easterEggs: [],
  },
  {
    id: 'pattern-play',
    name: 'Pattern Play',
    tagline: 'Complete the pattern! 🔮',
    path: '/games/pattern-play',
    icon: 'pattern',
    worldId: 'mind-maze',
    vibe: 'puzzle',
    ageRange: '3-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'pattern-star', chance: 0.2 },
      { itemId: 'star-silver', chance: 0.15 },
    ],
    easterEggs: [],
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
  {
    id: 'memory-match',
    name: 'Memory Match',
    tagline: 'Flip, remember, and match every pair before time runs out! 🧠',
    path: '/games/memory-match',
    icon: 'star',
    worldId: 'mind-maze',
    vibe: 'brainy',
    ageRange: '4-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'shape-star', chance: 0.25 },
      { itemId: 'shape-heart', chance: 0.2 },
      { itemId: 'material-crystal', chance: 0.05, minScore: 80 },
    ],
    easterEggs: [
      {
        id: 'egg-memory-streak',
        name: 'Memory Streak',
        description: 'Finish a board with 2 or fewer mistakes.',
        trigger: 'memory-perfect-ish',
        reward: { itemId: 'material-crystal', quantity: 1 },
        hint: 'Remember where each card hides.',
        difficulty: 'medium',
      },
    ],
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
  {
    id: 'color-by-number',
    name: 'Color by Number',
    tagline:
      'Pick a number, paint the matching regions, finish the picture! 🎨',
    path: '/games/color-by-number',
    icon: 'drop',
    worldId: 'color-splash',
    vibe: 'creative',
    ageRange: '4-6',
    isNew: true,
    cv: [],
    listed: true,
    drops: [
      { itemId: 'color-red', chance: 0.35 },
      { itemId: 'color-blue', chance: 0.35 },
      { itemId: 'color-yellow', chance: 0.35 },
      { itemId: 'color-green', chance: 0.25 },
      { itemId: 'tool-paintbrush', chance: 0.08, minScore: 80 },
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
    id: 'balloon-pop-fitness',
    name: 'Balloon Pop Fitness',
    tagline: 'Pop balloons by jumping, waving, and clapping! 🎈💪',
    path: '/games/balloon-pop-fitness',
    icon: 'sparkles',
    worldId: 'body-zone',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['pose'],
    listed: true,
    drops: [
      { itemId: 'material-balloon', chance: 0.3 },
      { itemId: 'material-confetti', chance: 0.2 },
    ],
    easterEggs: [
      {
        id: 'egg-balloon-combo',
        name: 'Combo Master',
        description: 'Get a 10x combo!',
        trigger: 'combo-10x',
        reward: { itemId: 'material-confetti', quantity: 5 },
        hint: 'Pop balloons quickly without missing!',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'obstacle-course',
    name: 'Obstacle Course',
    tagline: 'Duck, jump, and sidestep through the course in sequence!',
    path: '/games/obstacle-course',
    icon: 'sparkles',
    worldId: 'body-zone',
    vibe: 'active',
    ageRange: '4-7',
    isNew: true,
    cv: ['pose'],
    listed: true,
    drops: [
      { itemId: 'material-star', chance: 0.25 },
      { itemId: 'trophy-bronze', chance: 0.15 },
      { itemId: 'trophy-gold', chance: 0.03, minScore: 90 },
    ],
    easterEggs: [
      {
        id: 'egg-course-champion',
        name: 'Course Champion',
        description: 'Build a streak of 5 clean obstacle clears in one run!',
        trigger: 'streak-5',
        reward: { itemId: 'trophy-gold', quantity: 1 },
        hint: 'Stay sharp and keep the sequence flowing...',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'follow-the-leader',
    name: 'Follow the Leader',
    tagline: 'Mirror the movements shown by the guide character! 🎭👯',
    path: '/games/follow-the-leader',
    icon: 'sparkles',
    worldId: 'body-zone',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['pose'],
    listed: true,
    drops: [
      { itemId: 'material-star', chance: 0.3 },
      { itemId: 'trophy-bronze', chance: 0.2 },
    ],
    easterEggs: [
      {
        id: 'egg-perfect-mimic',
        name: 'Perfect Mimic',
        description: 'Match 10 movements perfectly in a row!',
        trigger: 'perfect-mimic-10x',
        reward: { itemId: 'trophy-gold', quantity: 1 },
        hint: 'Try to match each movement as closely as possible!',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'musical-statues',
    name: 'Musical Statues',
    tagline: 'Dance to the music and freeze when it stops! 🎵🗿',
    path: '/games/musical-statues',
    icon: 'music',
    worldId: 'body-zone',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['pose'],
    listed: true,
    drops: [
      { itemId: 'material-star', chance: 0.3 },
      { itemId: 'trophy-bronze', chance: 0.2 },
    ],
    easterEggs: [
      {
        id: 'egg-statue-master',
        name: 'Statue Master',
        description: 'Stay frozen through 5 consecutive rounds!',
        trigger: 'freeze-5x-combo',
        reward: { itemId: 'trophy-gold', quantity: 1 },
        hint: 'Practice holding very still when the music stops!',
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
        name: "Simon's Apprentice",
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
        hint: "Crystals are nature's perfect symmetry...",
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

  // ── Shape Garden (Additional) ─────────────────────────────────────
  {
    id: 'shape-safari',
    name: 'Shape Safari',
    tagline: 'Trace hidden shapes to discover animals and objects! 🔍',
    path: '/games/shape-safari',
    icon: 'target',
    worldId: 'shape-garden',
    vibe: 'creative',
    ageRange: '3-5',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [
      { itemId: 'shape-circle', chance: 0.3 },
      { itemId: 'shape-square', chance: 0.3 },
      { itemId: 'shape-triangle', chance: 0.3 },
      { itemId: 'shape-star', chance: 0.15 },
    ],
    easterEggs: [],
  },

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

  // ── Creative Corner ───────────────────────────────────────────────
  {
    id: 'free-draw',
    name: 'Free Draw',
    tagline: 'Paint with your finger! Mix colors and create art! 🎨',
    path: '/games/free-draw',
    icon: 'drop',
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

  // ── Voice Input (Experimental) ────────────────────────────────────
  {
    id: 'bubble-pop',
    name: 'Bubble Pop',
    tagline: 'Blow into the mic to pop bubbles! 🫧🎤',
    path: '/games/bubble-pop',
    icon: 'drop',
    worldId: 'creative-corner',
    vibe: 'active',
    ageRange: '3-8',
    isNew: true,
    cv: ['voice'],
    listed: true,
    drops: [
      { itemId: 'color-blue', chance: 0.2 },
      { itemId: 'tool-wand', chance: 0.1, minScore: 80 },
    ],
    easterEggs: [],
  },
  {
    id: 'word-search',
    name: 'Word Search',
    tagline: 'Find hidden words with your finger! 🔍',
    path: '/games/word-search',
    icon: 'search',
    worldId: 'word-workshop',
    vibe: 'brainy',
    ageRange: '4-8',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'spell-painter',
    name: 'Spell Painter',
    tagline: 'Paint letters with your finger to spell words! 🎨',
    path: '/games/spell-painter',
    icon: 'paintbrush',
    worldId: 'word-workshop',
    vibe: 'creative',
    ageRange: '4-7',
    isNew: true,
    cv: ['hand'],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'music-conductor',
    name: 'Music Conductor',
    tagline: 'Conduct the music by hitting the notes! 🎵',
    path: '/games/music-conductor',
    icon: 'music',
    worldId: 'sound-studio',
    vibe: 'musical',
    ageRange: '3-8',
    isNew: true,
    cv: [],
    listed: true,
    drops: [],
    easterEggs: [],
  },
  {
    id: 'physics-demo',
    name: 'Physics Demo',
    tagline: 'Explore physics with your hands! ⚛️',
    path: '/games/physics-demo',
    icon: 'atom',
    worldId: 'discovery-lab',
    vibe: 'educational',
    ageRange: '4-8',
    cv: ['hand'],
    listed: true,
    drops: [],
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
  return [
    ...new Set(GAME_REGISTRY.filter((g) => g.listed).map((g) => g.worldId)),
  ];
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

/** Look up a single easter egg by id across all games. */
export function getRegistryEasterEggById(eggId: string): EasterEgg | undefined {
  for (const manifest of GAME_REGISTRY) {
    const egg = manifest.easterEggs.find((e) => e.id === eggId);
    if (egg) return { ...egg, gameId: manifest.id };
  }
  return undefined;
}
