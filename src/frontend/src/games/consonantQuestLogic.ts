/**
 * Consonant Quest Game Logic
 *
 * Consonant sound quests - learn consonant clusters, blends, and sounds.
 * Educational focus: consonant recognition, blends, digraphs, phonics.
 */

export interface ConsonantQuest {
  quest: string;
  answer: string;
  sound: string;
  emoji: string;
  hint: string;
  examples: string[];
}

export interface ConsonantRound {
  targetQuest: ConsonantQuest;
  options: string[];
  correctAnswer: string;
}

export interface ConsonantQuestGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  questsCompleted: Set<string>;
  completed: boolean;
}

// Beginning consonant blends
export const BEGINNING_BLENDS: ConsonantQuest[] = [
  { quest: 'Find words starting with "bl"', answer: 'blue', sound: '/bl/', emoji: '🔵', hint: 'A color', examples: ['blue', 'black', 'block', 'blow'] },
  { quest: 'Find words starting with "br"', answer: 'bread', sound: '/br/', emoji: '🍞', hint: 'Baked food', examples: ['bread', 'break', 'brown', 'brush'] },
  { quest: 'Find words starting with "cl"', answer: 'cloud', sound: '/kl/', emoji: '☁️', hint: 'In the sky', examples: ['cloud', 'clap', 'clean', 'clock'] },
  { quest: 'Find words starting with "cr"', answer: 'crown', sound: '/kr/', emoji: '👑', hint: 'Royal headwear', examples: ['crown', 'crab', 'cry', 'cross'] },
  { quest: 'Find words starting with "dr"', answer: 'draw', sound: '/dr/', emoji: '✏️', hint: 'Make art', examples: ['draw', 'dream', 'drink', 'drive'] },
  { quest: 'Find words starting with "fl"', answer: 'flag', sound: '/fl/', emoji: '🚩', hint: 'Waving symbol', examples: ['flag', 'flower', 'fly', 'flip'] },
  { quest: 'Find words starting with "fr"', answer: 'frog', sound: '/fr/', emoji: '🐸', hint: 'Hops and croaks', examples: ['frog', 'friend', 'freeze', 'fruit'] },
  { quest: 'Find words starting with "gl"', answer: 'glass', sound: '/gl/', emoji: '🥛', hint: 'See-through container', examples: ['glass', 'glad', 'glue', 'glow'] },
  { quest: 'Find words starting with "gr"', answer: 'green', sound: '/gr/', emoji: '🟢', hint: 'Grass color', examples: ['green', 'grape', 'grow', 'great'] },
  { quest: 'Find words starting with "pl"', answer: 'plane', sound: '/pl/', emoji: '✈️', hint: 'Flies in sky', examples: ['plane', 'play', 'plant', 'plus'] },
  { quest: 'Find words starting with "pr"', answer: 'present', sound: '/pr/', emoji: '🎁', hint: 'A gift', examples: ['present', 'prince', 'price', 'praise'] },
  { quest: 'Find words starting with "sc"', answer: 'school', sound: '/sk/', emoji: '🏫', hint: 'Where you learn', examples: ['school', 'scarf', 'scare', 'score'] },
  { quest: 'Find words starting with "sk"', answer: 'sky', sound: '/sk/', emoji: '🌤️', hint: 'Above us', examples: ['sky', 'skate', 'ski', 'skip'] },
  { quest: 'Find words starting with "sl"', answer: 'sleep', sound: '/sl/', emoji: '😴', hint: 'Rest at night', examples: ['sleep', 'slow', 'slide', 'slip'] },
  { quest: 'Find words starting with "sm"', answer: 'smile', sound: '/sm/', emoji: '😊', hint: 'Happy face', examples: ['smile', 'small', 'smart', 'smooth'] },
  { quest: 'Find words starting with "sn"', answer: 'snow', sound: '/sn/', emoji: '❄️', hint: 'White and cold', examples: ['snow', 'snake', 'snack', 'sneeze'] },
  { quest: 'Find words starting with "sp"', answer: 'spider', sound: '/sp/', emoji: '🕷️', hint: 'Eight legs', examples: ['spider', 'spoon', 'space', 'spin'] },
  { quest: 'Find words starting with "st"', answer: 'star', sound: '/st/', emoji: '⭐', hint: 'Shines at night', examples: ['star', 'stop', 'stand', 'start'] },
  { quest: 'Find words starting with "sw"', answer: 'swim', sound: '/sw/', emoji: '🏊', hint: 'In water', examples: ['swim', 'swing', 'sweet', 'sweater'] },
  { quest: 'Find words starting with "tr"', answer: 'tree', sound: '/tr/', emoji: '🌳', hint: 'Has leaves', examples: ['tree', 'train', 'truck', 'try'] },
  { quest: 'Find words starting with "tw"', answer: 'twin', sound: '/tw/', emoji: '👯', hint: 'Two the same', examples: ['twin', 'twist', 'twelve', 'twenty'] },
];

// Ending consonant blends
export const ENDING_BLENDS: ConsonantQuest[] = [
  { quest: 'Find words ending in "mp"', answer: 'jump', sound: '/mp/', emoji: '🦘', hint: 'Leap up', examples: ['jump', 'lamp', 'camp', 'bump'] },
  { quest: 'Find words ending in "nd"', answer: 'hand', sound: '/nd/', emoji: '✋', hint: 'Five fingers', examples: ['hand', 'sand', 'land', 'find'] },
  { quest: 'Find words ending in "nt"', answer: 'plant', sound: '/nt/', emoji: '🌱', hint: 'Grows from seed', examples: ['plant', 'paint', 'want', 'sent'] },
  { quest: 'Find words ending in "nk"', answer: 'pink', sound: '/nk/', emoji: '🩷', hint: 'A color', examples: ['pink', 'drink', 'think', 'sink'] },
  { quest: 'Find words ending in "st"', answer: 'nest', sound: '/st/', emoji: '🪹', hint: 'Bird home', examples: ['nest', 'west', 'test', 'best'] },
  { quest: 'Find words ending in "sk"', answer: 'desk', sound: '/sk/', emoji: '🪑', hint: 'Work surface', examples: ['desk', 'ask', 'mask', 'task'] },
  { quest: 'Find words ending in "sp"', answer: 'wasp', sound: '/sp/', emoji: '🐝', hint: 'Flying insect', examples: ['wasp', 'clasp', 'grasp', 'gasp'] },
  { quest: 'Find words ending in "ft"', answer: 'gift', sound: '/ft/', emoji: '🎁', hint: 'A present', examples: ['gift', 'lift', 'soft', 'left'] },
  { quest: 'Find words ending in "lk"', answer: 'milk', sound: '/lk/', emoji: '🥛', hint: 'White drink', examples: ['milk', 'silk', 'walk', 'talk'] },
  { quest: 'Find words ending in "lt"', answer: 'salt', sound: '/lt/', emoji: '🧂', hint: 'Seasoning', examples: ['salt', 'belt', 'melt', 'felt'] },
  { quest: 'Find words ending in "lf"', answer: 'wolf', sound: '/lf/', emoji: '🐺', hint: 'Howls at moon', examples: ['wolf', 'golf', 'self', 'shelf'] },
  { quest: 'Find words ending in "lp"', answer: 'help', sound: '/lp/', emoji: '❓', hint: 'Give assistance', examples: ['help', 'yelp', 'kelp', 'gulp'] },
  { quest: 'Find words ending in "ct"', answer: 'cat', sound: '/kt/', emoji: '🐱', hint: 'Meows', examples: ['cat', 'act', 'fact', 'tact'] },
  { quest: 'Find words ending in "pt"', answer: 'sleep', sound: '/pt/', emoji: '😴', hint: 'Rest', examples: ['sleep', 'kept', 'wept', 'swept'] },
];

// Digraphs (two letters, one sound)
export const DIGRAPHS: ConsonantQuest[] = [
  { quest: 'Find words with "ch" sound', answer: 'chair', sound: '/tʃ/', emoji: '🪑', hint: 'You sit on it', examples: ['chair', 'cheese', 'chicken', 'church'] },
  { quest: 'Find words with "sh" sound', answer: 'sheep', sound: '/ʃ/', emoji: '🐑', hint: 'Woolly animal', examples: ['sheep', 'ship', 'shoe', 'shop'] },
  { quest: 'Find words with "th" sound (voiced)', answer: 'this', sound: '/ð/', emoji: '👉', hint: 'Pointing word', examples: ['this', 'that', 'the', 'they'] },
  { quest: 'Find words with "th" sound (unvoiced)', answer: 'think', sound: '/θ/', emoji: '🧠', hint: 'Use your brain', examples: ['think', 'three', 'thumb', 'thin'] },
  { quest: 'Find words with "wh" sound', answer: 'whale', sound: '/w/', emoji: '🐋', hint: 'Huge sea mammal', examples: ['whale', 'white', 'wheel', 'whip'] },
  { quest: 'Find words with "ph" sound', answer: 'phone', sound: '/f/', emoji: '📱', hint: 'Call friends', examples: ['phone', 'photo', 'dolphin', 'graph'] },
  { quest: 'Find words with "ck" sound', answer: 'duck', sound: '/k/', emoji: '🦆', hint: 'Quacks', examples: ['duck', 'stick', 'clock', 'rock'] },
  { quest: 'Find words with "ng" sound', answer: 'ring', sound: '/ŋ/', emoji: '💍', hint: 'Jewelry', examples: ['ring', 'sing', 'song', 'king'] },
];

// Trigraphs (three letters, one sound)
export const TRIGRAPHS: ConsonantQuest[] = [
  { quest: 'Find words with "tch" sound', answer: 'catch', sound: '/tʃ/', emoji: '🎾', hint: 'Grab the ball', examples: ['catch', 'match', 'watch', 'scratch'] },
  { quest: 'Find words with "dge" sound', answer: 'bridge', sound: '/dʒ/', emoji: '🌉', hint: 'Crosses rivers', examples: ['bridge', 'fridge', 'edge', 'badge'] },
];

export const ALL_QUESTS: ConsonantQuest[] = [
  ...BEGINNING_BLENDS,
  ...ENDING_BLENDS,
  ...DIGRAPHS,
  ...TRIGRAPHS,
];

export type QuestCategory = 'beginning-blends' | 'ending-blends' | 'digraphs' | 'trigraphs' | 'all';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  questPool: ConsonantQuest[];
  hintPenalty: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    questPool: [...BEGINNING_BLENDS.slice(0, 10)], // Simple beginning blends
    hintPenalty: 2,
  },
  medium: {
    optionCount: 4,
    questPool: [...BEGINNING_BLENDS, ...DIGRAPHS], // Blends + digraphs
    hintPenalty: 3,
  },
  hard: {
    optionCount: 4,
    questPool: ALL_QUESTS, // All quest types
    hintPenalty: 5,
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedQuests: Set<string> = new Set()
): ConsonantRound {
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Filter out used quests
  const availableQuests = config.questPool.filter(
    q => !usedQuests.has(q.answer)
  );

  // If all quests used, reset pool
  const questPool = availableQuests.length > 0
    ? availableQuests
    : config.questPool;

  // Select random quest
  const targetQuest = questPool[Math.floor(Math.random() * questPool.length)];

  // Generate options including correct answer
  const options = [targetQuest.answer];

  // Add distractors from other quests in the same pool
  const otherQuests = questPool.filter(q => q.answer !== targetQuest.answer);
  const shuffled = [...otherQuests].sort(() => Math.random() - 0.5);

  for (let i = 0; i < config.optionCount - 1 && i < shuffled.length; i++) {
    if (!options.includes(shuffled[i].answer)) {
      options.push(shuffled[i].answer);
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  return {
    targetQuest,
    options,
    correctAnswer: targetQuest.answer,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): ConsonantQuestGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    questsCompleted: new Set(),
    completed: false,
  };
}

export function checkAnswer(selectedWord: string, correctWord: string): boolean {
  return selectedWord.toLowerCase() === correctWord.toLowerCase();
}

export function processAnswer(
  gameState: ConsonantQuestGameState,
  isCorrect: boolean,
  questAnswer: string,
  hintsUsed: number
): ConsonantQuestGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 20;
  const streakBonus = Math.min(newStreak * 3, 25);
  const hintPenalty = hintsUsed * (DIFFICULTY_CONFIGS.easy.hintPenalty);
  const points = isCorrect ? Math.max(0, basePoints + streakBonus - hintPenalty) : 0;

  const newQuestsCompleted = new Set(gameState.questsCompleted);
  if (isCorrect) {
    newQuestsCompleted.add(questAnswer);
  }

  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    questsCompleted: newQuestsCompleted,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: ConsonantQuestGameState): number {
  if (gameState.currentRound === 0) return 0;
  return Math.round((gameState.correctAnswers / gameState.currentRound) * 100);
}

export function getStarRating(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}

export function getDifficultyDisplay(difficulty: Difficulty): { label: string; color: string } {
  switch (difficulty) {
    case 'easy':
      return { label: 'Easy (Beginning Blends)', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium (Blends + Digraphs)', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard (All Consonants)', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}

export function getCategoryName(category: QuestCategory): string {
  const names: Record<QuestCategory, string> = {
    'beginning-blends': 'Beginning Blends',
    'ending-blends': 'Ending Blends',
    'digraphs': 'Digraphs',
    'trigraphs': 'Trigraphs',
    'all': 'All Consonants',
  };
  return names[category] || 'Unknown';
}
