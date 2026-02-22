// Easter egg definitions — hidden discoverable items within games.
// Each egg has a trigger condition and a reward.

export interface EasterEgg {
  id: string;
  gameId: string;
  name: string;
  description: string;
  trigger: string; // human-readable description for the "how to find" guide after unlocking
  reward: { itemId: string; quantity: number };
  hint: string; // shown when nearby or after finding an egg in the same game
  difficulty: 'easy' | 'medium' | 'hard' | 'secret';
}

export const EASTER_EGGS: EasterEgg[] = [
  // ─── Chemistry Lab ────────────────────────────────────────────────────
  {
    id: 'egg-gold-reaction',
    gameId: 'chemistry-lab',
    name: 'The Midas Touch',
    description: 'Perform a perfect reaction 3 times in a row!',
    trigger: 'perfect-streak-3',
    reward: { itemId: 'element-au', quantity: 1 },
    hint: 'Perfection attracts gold...',
    difficulty: 'medium',
  },
  {
    id: 'egg-periodic-key',
    gameId: 'chemistry-lab',
    name: 'Key to the Elements',
    description: 'Discover 5 different elements in Chemistry Lab.',
    trigger: 'unique-elements-5',
    reward: { itemId: 'artifact-periodic-key', quantity: 1 },
    hint: 'Collect many different elements...',
    difficulty: 'hard',
  },

  // ─── Air Canvas ───────────────────────────────────────────────────────
  {
    id: 'egg-golden-brush',
    gameId: 'air-canvas',
    name: 'The Golden Brush',
    description: 'Draw a circle in the air — the universal shape!',
    trigger: 'draw-circle',
    reward: { itemId: 'tool-paintbrush', quantity: 1 },
    hint: 'Try drawing the most perfect shape...',
    difficulty: 'easy',
  },
  {
    id: 'egg-rainbow-canvas',
    gameId: 'air-canvas',
    name: 'Rainbow Artist',
    description: 'Use all available colors in one drawing session.',
    trigger: 'use-all-colors',
    reward: { itemId: 'color-rainbow', quantity: 1 },
    hint: 'Why settle for one color?',
    difficulty: 'medium',
  },

  // ─── Yoga Animals ─────────────────────────────────────────────────────
  {
    id: 'egg-spirit-animal',
    gameId: 'yoga-animals',
    name: 'Spirit Bond',
    description: 'Hold any pose perfectly for 10 seconds straight!',
    trigger: 'perfect-hold-10s',
    reward: { itemId: 'creature-owl', quantity: 1 },
    hint: 'Be still and patient like an owl...',
    difficulty: 'medium',
  },

  // ─── Music Pinch Beat ─────────────────────────────────────────────────
  {
    id: 'egg-full-scale',
    gameId: 'music-pinch-beat',
    name: 'Full Scale!',
    description: 'Play all 7 notes (Do Re Mi Fa Sol La Ti) in one session.',
    trigger: 'play-all-notes',
    reward: { itemId: 'artifact-melody', quantity: 1 },
    hint: 'The scale has 7 notes — have you played them all?',
    difficulty: 'medium',
  },

  // ─── Emoji Match ──────────────────────────────────────────────────────
  {
    id: 'egg-emotion-master',
    gameId: 'emoji-match',
    name: 'Emotion Master',
    description: 'Match all emotion types in a single session without mistakes!',
    trigger: 'perfect-all-emotions',
    reward: { itemId: 'emotion-love', quantity: 1 },
    hint: 'Every emotion matters — can you catch them all perfectly?',
    difficulty: 'hard',
  },

  // ─── Word Builder ─────────────────────────────────────────────────────
  {
    id: 'egg-first-word',
    gameId: 'word-builder',
    name: 'First Word!',
    description: 'Successfully spell your first word!',
    trigger: 'first-word-complete',
    reward: { itemId: 'artifact-first-word', quantity: 1 },
    hint: 'Spell any word correctly!',
    difficulty: 'easy',
  },

  // ─── Steady Hand Lab ──────────────────────────────────────────────────
  {
    id: 'egg-surgeon-hands',
    gameId: 'steady-hand-lab',
    name: 'Surgeon Hands',
    description: 'Keep your hand perfectly steady for 15 seconds!',
    trigger: 'steady-15s',
    reward: { itemId: 'tool-microscope', quantity: 1 },
    hint: 'Can you be steadier than a surgeon?',
    difficulty: 'hard',
  },

  // ─── Simon Says ───────────────────────────────────────────────────────
  {
    id: 'egg-simon-master',
    gameId: 'simon-says',
    name: 'Simon\'s Apprentice',
    description: 'Complete 10 commands in a row without mistakes!',
    trigger: 'perfect-streak-10',
    reward: { itemId: 'tool-wand', quantity: 1 },
    hint: 'Listen carefully and follow EXACTLY...',
    difficulty: 'secret',
  },

  // ─── Freeze Dance ─────────────────────────────────────────────────────
  {
    id: 'egg-ice-sculpture',
    gameId: 'freeze-dance',
    name: 'Ice Sculpture',
    description: 'Freeze perfectly still 5 times in a row!',
    trigger: 'perfect-freeze-5',
    reward: { itemId: 'material-ice', quantity: 2 },
    hint: 'Can you freeze like a statue?',
    difficulty: 'medium',
  },

  // ─── Mirror Draw ──────────────────────────────────────────────────────
  {
    id: 'egg-perfect-symmetry',
    gameId: 'mirror-draw',
    name: 'Perfect Symmetry',
    description: 'Achieve 95%+ accuracy on a mirror drawing!',
    trigger: 'accuracy-95',
    reward: { itemId: 'material-crystal', quantity: 1 },
    hint: 'Crystals are nature\'s perfect symmetry...',
    difficulty: 'hard',
  },

  // ─── Phonics Sounds ───────────────────────────────────────────────────
  {
    id: 'egg-vowel-master',
    gameId: 'phonics-sounds',
    name: 'Vowel Master',
    description: 'Correctly identify all 5 vowel sounds (A, E, I, O, U).',
    trigger: 'all-vowels-correct',
    reward: { itemId: 'creature-owl', quantity: 1 },
    hint: 'A-E-I-O-U — the special letters!',
    difficulty: 'medium',
  },

  // ─── Connect the Dots ─────────────────────────────────────────────────
  {
    id: 'egg-star-connector',
    gameId: 'connect-the-dots',
    name: 'Star Connector',
    description: 'Complete a connect-the-dots picture that forms a star!',
    trigger: 'complete-star-picture',
    reward: { itemId: 'shape-star', quantity: 2 },
    hint: 'Some pictures are written in the stars...',
    difficulty: 'easy',
  },

  // ─── Shape Pop ────────────────────────────────────────────────────────
  {
    id: 'egg-diamond-pop',
    gameId: 'shape-pop',
    name: 'Diamond in the Rough',
    description: 'Pop 20 shapes in under 30 seconds!',
    trigger: 'speed-pop-20',
    reward: { itemId: 'shape-diamond', quantity: 1 },
    hint: 'Speed reveals hidden gems...',
    difficulty: 'hard',
  },

  // ─── Number Tap Trail ─────────────────────────────────────────────────
  {
    id: 'egg-golden-number',
    gameId: 'number-tap-trail',
    name: 'Golden Sequence',
    description: 'Complete a trail of 10+ numbers with no mistakes!',
    trigger: 'perfect-trail-10',
    reward: { itemId: 'element-au', quantity: 1 },
    hint: 'Numbers in perfect order reveal gold...',
    difficulty: 'hard',
  },

  // ─── Letter Hunt ──────────────────────────────────────────────────────
  {
    id: 'egg-treasure-hunter',
    gameId: 'letter-hunt',
    name: 'Treasure Hunter Pro',
    description: 'Find 8 letters in a single session!',
    trigger: 'find-8-letters',
    reward: { itemId: 'tool-magnifier', quantity: 1 },
    hint: 'A keen eye finds treasure everywhere...',
    difficulty: 'medium',
  },
];

export const EASTER_EGGS_BY_GAME: Record<string, EasterEgg[]> = {};
for (const egg of EASTER_EGGS) {
  if (!EASTER_EGGS_BY_GAME[egg.gameId]) {
    EASTER_EGGS_BY_GAME[egg.gameId] = [];
  }
  EASTER_EGGS_BY_GAME[egg.gameId].push(egg);
}

export function getEasterEggsForGame(gameId: string): EasterEgg[] {
  return EASTER_EGGS_BY_GAME[gameId] ?? [];
}

export function getEasterEggById(id: string): EasterEgg | undefined {
  return EASTER_EGGS.find((egg) => egg.id === id);
}
