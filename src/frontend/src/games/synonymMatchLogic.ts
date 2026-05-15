/**
 * Synonym Match Game Logic
 *
 * Match words with similar meanings to build vocabulary.
 * Educational focus: synonyms, vocabulary expansion, word relationships.
 */

export interface SynonymGroup {
  words: string[];
  emoji: string;
  meaning: string;
}

export interface SynonymRound {
  targetWord: string;
  targetGroup: SynonymGroup;
  options: SynonymOption[];
  correctAnswer: string;
}

export interface SynonymOption {
  word: string;
  isCorrect: boolean;
  emoji?: string;
}

export interface SynonymMatchGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  groupsLearned: Set<string>;
  completed: boolean;
}

export const SYNONYM_GROUPS: SynonymGroup[] = [
  { words: ['big', 'large', 'huge', 'giant'], emoji: '🐘', meaning: 'Not small' },
  { words: ['small', 'tiny', 'little', 'mini'], emoji: '🐜', meaning: 'Not big' },
  { words: ['happy', 'joyful', 'cheerful', 'glad'], emoji: '😊', meaning: 'Feeling good' },
  { words: ['sad', 'unhappy', 'gloomy', 'blue'], emoji: '😢', meaning: 'Feeling down' },
  { words: ['fast', 'quick', 'rapid', 'swift'], emoji: '⚡', meaning: 'Speedy' },
  { words: ['slow', 'sluggish', 'gradual', 'lazy'], emoji: '🐢', meaning: 'Not fast' },
  { words: ['smart', 'clever', 'intelligent', 'bright'], emoji: '🧠', meaning: 'Brainy' },
  { words: ['beautiful', 'pretty', 'lovely', 'gorgeous'], emoji: '💎', meaning: 'Nice to look at' },
  { words: ['angry', 'mad', 'furious', 'upset'], emoji: '😠', meaning: 'Not happy' },
  { words: ['scared', 'afraid', 'frightened', 'terrified'], emoji: '😨', meaning: 'Feeling fear' },
  { words: ['tired', 'sleepy', 'exhausted', 'weary'], emoji: '😴', meaning: 'Need rest' },
  { words: ['funny', 'silly', 'hilarious', 'amusing'], emoji: '😂', meaning: 'Makes you laugh' },
  { words: ['hungry', 'starving', 'famished', 'ravenous'], emoji: '😋', meaning: 'Want food' },
  { words: ['thirsty', 'parched', 'dry', 'dehydrated'], emoji: '🥤', meaning: 'Want drink' },
  { words: ['cold', 'chilly', 'freezing', 'icy'], emoji: '❄️', meaning: 'Not warm' },
  { words: ['hot', 'warm', 'boiling', 'scorching'], emoji: '🔥', meaning: 'Not cold' },
  { words: ['dirty', 'messy', 'filthy', 'grubby'], emoji: '😷', meaning: 'Not clean' },
  { words: ['clean', 'tidy', 'spotless', 'neat'], emoji: '✨', meaning: 'Not dirty' },
  { words: ['loud', 'noisy', 'deafening', 'thunderous'], emoji: '🔊', meaning: 'Makes noise' },
  { words: ['quiet', 'silent', 'peaceful', 'hushed'], emoji: '🔇', meaning: 'Not loud' },
  { words: ['new', 'fresh', 'recent', 'modern'], emoji: '🆕', meaning: 'Not old' },
  { words: ['old', 'ancient', 'aged', 'vintage'], emoji: '📜', meaning: 'Not new' },
  { words: ['good', 'great', 'excellent', 'wonderful'], emoji: '👍', meaning: 'Positive' },
  { words: ['bad', 'terrible', 'awful', 'horrible'], emoji: '👎', meaning: 'Negative' },
  { words: ['fun', 'enjoyable', 'entertaining', 'pleasant'], emoji: '🎉', meaning: 'Good time' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  wordPool: SynonymGroup[];
  distractorGroups: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    wordPool: SYNONYM_GROUPS.slice(0, 12), // Simple, common synonyms
    distractorGroups: 2,
  },
  medium: {
    optionCount: 4,
    wordPool: SYNONYM_GROUPS.slice(0, 20), // More variety
    distractorGroups: 3,
  },
  hard: {
    optionCount: 6,
    wordPool: SYNONYM_GROUPS, // All groups
    distractorGroups: 5,
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedGroups: Set<string> = new Set()
): SynonymRound {
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Filter out used groups
  const availableGroups = config.wordPool.filter(
    g => !usedGroups.has(g.words[0])
  );

  // If all groups used, reset pool
  const groupPool = availableGroups.length > 0
    ? availableGroups
    : config.wordPool;

  // Select random group
  const targetGroup = groupPool[Math.floor(Math.random() * groupPool.length)];

  // Select target word from group
  const targetWord = targetGroup.words[Math.floor(Math.random() * targetGroup.words.length)];

  // Generate correct answer (different word from same group)
  const correctAnswers = targetGroup.words.filter(w => w !== targetWord);
  const correctAnswer = correctAnswers[Math.floor(Math.random() * correctAnswers.length)];

  // Create options
  const options: SynonymOption[] = [{
    word: correctAnswer,
    isCorrect: true,
    emoji: targetGroup.emoji,
  }];

  // Add distractors from other groups
  const otherGroups = groupPool.filter(g => g.words[0] !== targetGroup.words[0]);
  const shuffled = [...otherGroups].sort(() => Math.random() - 0.5);

  let distractorsAdded = 0;
  for (const group of shuffled) {
    if (distractorsAdded >= config.optionCount - 1) break;

    // Add one word from this group
    const distractor = group.words[Math.floor(Math.random() * group.words.length)];
    if (!options.find(o => o.word === distractor)) {
      options.push({
        word: distractor,
        isCorrect: false,
        emoji: group.emoji,
      });
      distractorsAdded++;
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  return {
    targetWord,
    targetGroup,
    options,
    correctAnswer,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): SynonymMatchGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    groupsLearned: new Set(),
    completed: false,
  };
}

export function checkAnswer(selectedWord: string, correctWord: string): boolean {
  return selectedWord.toLowerCase() === correctWord.toLowerCase();
}

export function processAnswer(
  gameState: SynonymMatchGameState,
  isCorrect: boolean,
  groupWord: string
): SynonymMatchGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 15;
  const streakBonus = Math.min(newStreak * 2, 20);
  const points = isCorrect ? basePoints + streakBonus : 0;

  const newGroupsLearned = new Set(gameState.groupsLearned);
  if (isCorrect) {
    newGroupsLearned.add(groupWord);
  }

  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    groupsLearned: newGroupsLearned,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: SynonymMatchGameState): number {
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
      return { label: 'Easy', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}
