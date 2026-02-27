/**
 * Syllable Clap game logic — clap or tap to count syllables.
 *
 * Listen to a word and clap the number of syllables.
 */

export interface SyllableWord {
  word: string;
  syllableCount: number;
  hint: string;
  emoji: string;
}

export interface LevelConfig {
  level: number;
  wordCount: number;
  maxSyllables: number;
}

const SYLLABLE_WORDS: SyllableWord[] = [
  { word: 'cat', syllableCount: 1, hint: 'A furry pet', emoji: '🐱' },
  { word: 'dog', syllableCount: 1, hint: 'A barking pet', emoji: '🐕' },
  { word: 'sun', syllableCount: 1, hint: 'It shines in the sky', emoji: '☀️' },
  { word: 'ball', syllableCount: 1, hint: 'You throw and catch it', emoji: '⚽' },
  { word: 'fish', syllableCount: 1, hint: 'It swims in water', emoji: '🐟' },
  { word: 'bird', syllableCount: 1, hint: 'It flies in the sky', emoji: '🐦' },
  { word: 'apple', syllableCount: 2, hint: 'A red or green fruit', emoji: '🍎' },
  { word: 'banana', syllableCount: 3, hint: 'A long yellow fruit', emoji: '🍌' },
  { word: 'elephant', syllableCount: 3, hint: 'A huge gray animal', emoji: '🐘' },
  { word: 'butterfly', syllableCount: 3, hint: 'It has beautiful wings', emoji: '🦋' },
  { word: 'flower', syllableCount: 2, hint: 'It smells nice', emoji: '🌸' },
  { word: 'rainbow', syllableCount: 2, hint: 'It appears after rain', emoji: '🌈' },
  { word: 'sunshine', syllableCount: 2, hint: 'It comes from the sun', emoji: '☀️' },
  { word: 'water', syllableCount: 2, hint: 'We drink it every day', emoji: '💧' },
  { word: 'happy', syllableCount: 2, hint: 'The opposite of sad', emoji: '😊' },
  { word: 'baby', syllableCount: 2, hint: 'A very young child', emoji: '👶' },
  { word: 'purple', syllableCount: 2, hint: 'A color like grapes', emoji: '🟣' },
  { word: 'orange', syllableCount: 2, hint: 'A fruit and a color', emoji: '🍊' },
  { word: 'computer', syllableCount: 3, hint: 'We use it to work and play', emoji: '💻' },
  { word: 'television', syllableCount: 4, hint: 'We watch shows on it', emoji: '📺' },
  { word: 'helicopter', syllableCount: 4, hint: 'It flies with spinning blades', emoji: '🚁' },
  { word: 'dinosaur', syllableCount: 3, hint: 'An ancient reptile', emoji: '🦖' },
  { word: 'chocolate', syllableCount: 3, hint: 'A sweet brown treat', emoji: '🍫' },
  { word: 'strawberry', syllableCount: 3, hint: 'A red fruit with seeds', emoji: '🍓' },
  { word: 'cucumber', syllableCount: 3, hint: 'A green vegetable', emoji: '🥒' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, wordCount: 4, maxSyllables: 1 },
  { level: 2, wordCount: 6, maxSyllables: 2 },
  { level: 3, wordCount: 8, maxSyllables: 3 },
  { level: 4, wordCount: 10, maxSyllables: 4 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function getWordsForLevel(level: number): SyllableWord[] {
  const config = getLevelConfig(level);
  const filtered = SYLLABLE_WORDS.filter(w => w.syllableCount <= config.maxSyllables);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.wordCount);
}

export function checkAnswer(correct: number, answer: number): boolean {
  return correct === answer;
}
