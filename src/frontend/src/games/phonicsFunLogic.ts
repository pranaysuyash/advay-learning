/**
 * Phonics Fun Game Logic
 *
 * Interactive phonics game for learning letter sounds.
 * Educational focus: phonemic awareness, letter-sound correspondence.
 */

export interface PhonicsSound {
  letter: string;
  sound: string;
  example: string;
  emoji: string;
  audio?: string;
}

export interface PhonicsRound {
  targetSound: PhonicsSound;
  options: PhonicsOption[];
  questionType: 'sound-to-letter' | 'letter-to-sound';
}

export interface PhonicsOption {
  letter: string;
  sound: string;
  isCorrect: boolean;
  emoji: string;
  example: string;
}

export interface PhonicsFunGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  soundsMastered: Set<string>;
  completed: boolean;
}

export const PHONICS_SOUNDS: PhonicsSound[] = [
  // Short vowels
  { letter: 'A', sound: '/æ/', example: 'apple', emoji: '🍎' },
  { letter: 'E', sound: '/ɛ/', example: 'egg', emoji: '🥚' },
  { letter: 'I', sound: '/ɪ/', example: 'igloo', emoji: '🧊' },
  { letter: 'O', sound: '/ɒ/', example: 'octopus', emoji: '🐙' },
  { letter: 'U', sound: '/ʌ/', example: 'umbrella', emoji: '☂️' },
  
  // Consonants - Group 1 (early letters)
  { letter: 'B', sound: '/b/', example: 'ball', emoji: '⚽' },
  { letter: 'C', sound: '/k/', example: 'cat', emoji: '🐱' },
  { letter: 'D', sound: '/d/', example: 'dog', emoji: '🐕' },
  { letter: 'F', sound: '/f/', example: 'fish', emoji: '🐟' },
  { letter: 'G', sound: '/g/', example: 'goat', emoji: '🐐' },
  
  // Consonants - Group 2
  { letter: 'H', sound: '/h/', example: 'hat', emoji: '🎩' },
  { letter: 'J', sound: '/dʒ/', example: 'jump', emoji: '⬆️' },
  { letter: 'K', sound: '/k/', example: 'kite', emoji: '🪁' },
  { letter: 'L', sound: '/l/', example: 'lion', emoji: '🦁' },
  { letter: 'M', sound: '/m/', example: 'monkey', emoji: '🐒' },
  
  // Consonants - Group 3
  { letter: 'N', sound: '/n/', example: 'nest', emoji: '🪹' },
  { letter: 'P', sound: '/p/', example: 'pizza', emoji: '🍕' },
  { letter: 'Q', sound: '/kw/', example: 'queen', emoji: '👸' },
  { letter: 'R', sound: '/r/', example: 'rainbow', emoji: '🌈' },
  { letter: 'S', sound: '/s/', example: 'sun', emoji: '☀️' },
  
  // Consonants - Group 4
  { letter: 'T', sound: '/t/', example: 'tree', emoji: '🌳' },
  { letter: 'V', sound: '/v/', example: 'violin', emoji: '🎻' },
  { letter: 'W', sound: '/w/', example: 'water', emoji: '💧' },
  { letter: 'X', sound: '/ks/', example: 'box', emoji: '📦' },
  { letter: 'Y', sound: '/j/', example: 'yellow', emoji: '🟡' },
  { letter: 'Z', sound: '/z/', example: 'zebra', emoji: '🦓' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  soundPool: PhonicsSound[];
  questionTypes: ('sound-to-letter' | 'letter-to-sound')[];
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    soundPool: PHONICS_SOUNDS.slice(0, 10), // Short vowels + early consonants
    questionTypes: ['letter-to-sound'],
  },
  medium: {
    optionCount: 4,
    soundPool: PHONICS_SOUNDS.slice(0, 21), // Most letters
    questionTypes: ['letter-to-sound', 'sound-to-letter'],
  },
  hard: {
    optionCount: 6,
    soundPool: PHONICS_SOUNDS, // All letters
    questionTypes: ['letter-to-sound', 'sound-to-letter'],
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedSounds: Set<string> = new Set()
): PhonicsRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter out used sounds
  const availableSounds = config.soundPool.filter(
    s => !usedSounds.has(s.letter)
  );
  
  // If all sounds used, reset pool
  const soundPool = availableSounds.length > 0 
    ? availableSounds 
    : config.soundPool;
  
  // Select random target sound
  const targetSound = soundPool[Math.floor(Math.random() * soundPool.length)];
  
  // Random question type for medium/hard
  const questionType = config.questionTypes[Math.floor(Math.random() * config.questionTypes.length)];
  
  // Generate options
  const options: PhonicsOption[] = [];
  
  // Add correct option
  options.push({
    letter: targetSound.letter,
    sound: targetSound.sound,
    isCorrect: true,
    emoji: targetSound.emoji,
    example: targetSound.example,
  });
  
  // Add distractors
  const otherSounds = config.soundPool.filter(
    s => s.letter !== targetSound.letter
  );
  const shuffled = [...otherSounds].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < config.optionCount - 1 && i < shuffled.length; i++) {
    options.push({
      letter: shuffled[i].letter,
      sound: shuffled[i].sound,
      isCorrect: false,
      emoji: shuffled[i].emoji,
      example: shuffled[i].example,
    });
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    targetSound,
    options,
    questionType,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): PhonicsFunGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    soundsMastered: new Set(),
    completed: false,
  };
}

export function checkAnswer(
  selectedLetter: string,
  targetLetter: string,
  _questionType: 'sound-to-letter' | 'letter-to-sound'
): boolean {
  return selectedLetter.toUpperCase() === targetLetter.toUpperCase();
}

export function processAnswer(
  gameState: PhonicsFunGameState,
  isCorrect: boolean,
  sound: string
): PhonicsFunGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 15;
  const streakBonus = Math.min(newStreak * 2, 20);
  const points = isCorrect ? basePoints + streakBonus : 0;
  
  const newSoundsMastered = new Set(gameState.soundsMastered);
  if (isCorrect) {
    newSoundsMastered.add(sound);
  }
  
  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    soundsMastered: newSoundsMastered,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: PhonicsFunGameState): number {
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
      return { label: 'Easy (Vowels + ABC)', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium (A-U)', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard (A-Z)', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}

export function getQuestionText(
  questionType: 'sound-to-letter' | 'letter-to-sound',
  target: PhonicsSound
): string {
  if (questionType === 'letter-to-sound') {
    return `What sound does "${target.letter}" make?`;
  }
  return `Which letter makes the "${target.sound}" sound?`;
}

export function speakLetter(letter: string): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  }
}

export function speakSound(sound: string): void {
  if ('speechSynthesis' in window) {
    // Map IPA sounds to approximate English pronunciation
    const soundMap: Record<string, string> = {
      '/æ/': 'ah as in apple',
      '/ɛ/': 'eh as in egg',
      '/ɪ/': 'ih as in igloo',
      '/ɒ/': 'oh as in octopus',
      '/ʌ/': 'uh as in umbrella',
      '/b/': 'buh as in ball',
      '/k/': 'kuh as in cat',
      '/d/': 'duh as in dog',
      '/f/': 'fff as in fish',
      '/g/': 'guh as in goat',
      '/h/': 'huh as in hat',
      '/dʒ/': 'juh as in jump',
      '/l/': 'lll as in lion',
      '/m/': 'mmm as in monkey',
      '/n/': 'nnn as in nest',
      '/p/': 'puh as in pizza',
      '/kw/': 'kwuh as in queen',
      '/r/': 'rrr as in rainbow',
      '/s/': 'sss as in sun',
      '/t/': 'tuh as in tree',
      '/v/': 'vvv as in violin',
      '/w/': 'wuh as in water',
      '/ks/': 'ks as in box',
      '/j/': 'yuh as in yellow',
      '/z/': 'zzz as in zebra',
    };
    
    const utterance = new SpeechSynthesisUtterance(soundMap[sound] || sound);
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}
