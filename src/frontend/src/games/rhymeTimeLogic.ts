/**
 * Rhyme Time Game Logic
 * 
 * Children match rhyming words to build phonological awareness.
 * Research shows rhyme awareness is the #1 predictor of reading success.
 * 
 * Targets: Phonological awareness, rhyme recognition, vocabulary
 * Age: 4-6 years
 * 
 * Research Insights:
 * - Phonological awareness is the strongest predictor of early reading success
 * - Children who can rhyme at 4 read better at 6 (National Reading Panel, 2000)
 * - Rhyme awareness > letter knowledge for early reading
 * - CVC words (consonant-vowel-consonant) are easiest for beginners
 */



export interface RhymeWord {
  word: string;
  emoji: string;
  audio?: string;  // Path to audio file (optional)
}

export interface RhymeFamily {
  family: string;      // -at, -an, -ig, etc.
  words: RhymeWord[];
  exampleSentence: string;
}

export interface RhymeRound {
  targetWord: RhymeWord;
  targetFamily: string;
  options: RhymeOption[];    // 3-4 options including distractors
  correctAnswer: string;
}

export interface RhymeOption {
  word: RhymeWord;
  isCorrect: boolean;
  family: string;
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  startTime: number;
  completed: boolean;
  usedFamilies: Set<string>;
}

// Comprehensive rhyme families database
export const RHYME_FAMILIES: RhymeFamily[] = [
  {
    family: '-at',
    exampleSentence: 'The cat sat on the mat.',
    words: [
      { word: 'cat', emoji: '🐱' },
      { word: 'bat', emoji: '🦇' },
      { word: 'hat', emoji: '🎩' },
      { word: 'mat', emoji: '🧘' },
      { word: 'rat', emoji: '🐀' },
      { word: 'sat', emoji: '🪑' },
    ],
  },
  {
    family: '-an',
    exampleSentence: 'The man with the can ran to the van.',
    words: [
      { word: 'can', emoji: '🥫' },
      { word: 'fan', emoji: '🌀' },
      { word: 'man', emoji: '👨' },
      { word: 'pan', emoji: '🍳' },
      { word: 'van', emoji: '🚐' },
      { word: 'ran', emoji: '🏃' },
    ],
  },
  {
    family: '-ig',
    exampleSentence: 'The big pig wore a wig.',
    words: [
      { word: 'big', emoji: '🐘' },
      { word: 'dig', emoji: '⛏️' },
      { word: 'fig', emoji: '🍈' },
      { word: 'pig', emoji: '🐷' },
      { word: 'wig', emoji: '👩‍🦰' },
    ],
  },
  {
    family: '-op',
    exampleSentence: 'The cop saw the mop drop.',
    words: [
      { word: 'cop', emoji: '👮' },
      { word: 'hop', emoji: '🐰' },
      { word: 'mop', emoji: '🧹' },
      { word: 'pop', emoji: '🎈' },
      { word: 'top', emoji: '🏆' },
    ],
  },
  {
    family: '-ug',
    exampleSentence: 'Give the bug a hug in the rug.',
    words: [
      { word: 'bug', emoji: '🐛' },
      { word: 'hug', emoji: '🤗' },
      { word: 'jug', emoji: '🏺' },
      { word: 'mug', emoji: '☕' },
      { word: 'rug', emoji: '🧶' },
    ],
  },
  {
    family: '-et',
    exampleSentence: 'The pet wet the net.',
    words: [
      { word: 'bet', emoji: '🎰' },
      { word: 'get', emoji: '🎁' },
      { word: 'jet', emoji: '✈️' },
      { word: 'net', emoji: '🕸️' },
      { word: 'pet', emoji: '🐕' },
      { word: 'wet', emoji: '💧' },
    ],
  },
  {
    family: '-en',
    exampleSentence: 'The hen sat in the pen.',
    words: [
      { word: 'den', emoji: '🦁' },
      { word: 'hen', emoji: '🐔' },
      { word: 'men', emoji: '👥' },
      { word: 'pen', emoji: '🖊️' },
      { word: 'ten', emoji: '🔟' },
    ],
  },
  {
    family: '-it',
    exampleSentence: 'Please sit on the lit bit.',
    words: [
      { word: 'bit', emoji: '🤏' },
      { word: 'hit', emoji: '👊' },
      { word: 'kit', emoji: '🎒' },
      { word: 'lit', emoji: '💡' },
      { word: 'sit', emoji: '🪑' },
    ],
  },
  {
    family: '-og',
    exampleSentence: 'The dog sat on the log.',
    words: [
      { word: 'bog', emoji: '🌿' },
      { word: 'dog', emoji: '🐕' },
      { word: 'fog', emoji: '🌫️' },
      { word: 'hog', emoji: '🐖' },
      { word: 'log', emoji: '🪵' },
    ],
  },
  {
    family: '-un',
    exampleSentence: 'The sun is fun for everyone.',
    words: [
      { word: 'bun', emoji: '🥯' },
      { word: 'fun', emoji: '🎉' },
      { word: 'run', emoji: '🏃' },
      { word: 'sun', emoji: '☀️' },
    ],
  },
];

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  useVisualDistractors: boolean;
  useSimilarFamilies: boolean;
  families: string[];
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    useVisualDistractors: false,
    useSimilarFamilies: false,
    families: ['-at', '-an', '-ig'],  // Easiest rhymes
  },
  medium: {
    optionCount: 3,
    useVisualDistractors: true,
    useSimilarFamilies: false,
    families: ['-at', '-an', '-ig', '-op', '-ug', '-et'],
  },
  hard: {
    optionCount: 4,
    useVisualDistractors: true,
    useSimilarFamilies: true,
    families: ['-at', '-an', '-ig', '-op', '-ug', '-et', '-en', '-it', '-og', '-un'],
  },
};

// Generate a rhyme round
export function generateRound(
  difficulty: Difficulty,
  usedFamilies: Set<string>
): RhymeRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Pick a rhyme family (avoid recently used if possible)
  let availableFamilies = RHYME_FAMILIES.filter(f => config.families.includes(f.family));
  const unusedFamilies = availableFamilies.filter(f => !usedFamilies.has(f.family));
  
  if (unusedFamilies.length > 0) {
    availableFamilies = unusedFamilies;
  }
  
  const targetFamily = availableFamilies[Math.floor(Math.random() * availableFamilies.length)];
  
  // Pick target word
  const targetWord = targetFamily.words[Math.floor(Math.random() * targetFamily.words.length)];
  
  // Generate options
  const options: RhymeOption[] = [
    { word: targetWord, isCorrect: true, family: targetFamily.family },
  ];
  
  // Add correct family distractors
  const otherFamilyWords = targetFamily.words.filter(w => w.word !== targetWord.word);
  const shuffledFamilyWords = [...otherFamilyWords].sort(() => Math.random() - 0.5);
  
  // Add one distractor from same family (if available)
  if (shuffledFamilyWords.length > 0 && config.useSimilarFamilies) {
    options.push({
      word: shuffledFamilyWords[0],
      isCorrect: false,
      family: targetFamily.family,
    });
  }
  
  // Add distractors from other families
  const otherFamilies = RHYME_FAMILIES.filter(f => f.family !== targetFamily.family);
  const shuffledOtherFamilies = [...otherFamilies].sort(() => Math.random() - 0.5);
  
  while (options.length < config.optionCount && shuffledOtherFamilies.length > 0) {
    const distractorFamily = shuffledOtherFamilies.shift()!;
    const distractorWord = distractorFamily.words[Math.floor(Math.random() * distractorFamily.words.length)];
    
    // Avoid duplicate words
    if (!options.some(o => o.word.word === distractorWord.word)) {
      options.push({
        word: distractorWord,
        isCorrect: false,
        family: distractorFamily.family,
      });
    }
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    targetWord,
    targetFamily: targetFamily.family,
    options,
    correctAnswer: targetWord.word,
  };
}

// Initialize game state
export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): GameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    startTime: Date.now(),
    completed: false,
    usedFamilies: new Set(),
  };
}

// Check answer
export function checkAnswer(selectedWord: string, correctAnswer: string): boolean {
  return selectedWord.toLowerCase() === correctAnswer.toLowerCase();
}

// Update game state after answer
export function processAnswer(
  gameState: GameState,
  isCorrect: boolean,
  family: string
): GameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const points = isCorrect ? 10 + Math.min(gameState.streak * 2, 20) : 0;
  
  const newUsedFamilies = new Set(gameState.usedFamilies);
  newUsedFamilies.add(family);
  
  // Keep only last 3 families to avoid repetition
  if (newUsedFamilies.size > 3) {
    const familiesArray = Array.from(newUsedFamilies);
    newUsedFamilies.clear();
    familiesArray.slice(-3).forEach(f => newUsedFamilies.add(f));
  }
  
  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    usedFamilies: newUsedFamilies,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

// Get performance feedback
export function getPerformanceFeedback(accuracy: number): { message: string; emoji: string } {
  if (accuracy >= 90) return { message: 'Amazing!', emoji: '🌟' };
  if (accuracy >= 80) return { message: 'Great job!', emoji: '⭐' };
  if (accuracy >= 70) return { message: 'Well done!', emoji: '👍' };
  if (accuracy >= 60) return { message: 'Good try!', emoji: '👏' };
  return { message: 'Keep practicing!', emoji: '💪' };
}

// Get difficulty display
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

// Text-to-speech for words
export function speakWord(word: string): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

// Get example sentence for family
export function getExampleSentence(family: string): string {
  const rhymeFamily = RHYME_FAMILIES.find(f => f.family === family);
  return rhymeFamily?.exampleSentence || '';
}

// Calculate accuracy
export function calculateAccuracy(gameState: GameState): number {
  if (gameState.currentRound === 0) return 0;
  return Math.round((gameState.correctAnswers / gameState.currentRound) * 100);
}

// Get star rating based on accuracy
export function getStarRating(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}
