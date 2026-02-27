/**
 * Blend Builder game logic — build words by blending sounds.
 *
 * Given onset + rime, blend to form the word.
 */

export interface BlendWord {
  word: string;
  onset: string;
  rime: string;
  hint: string;
}

export interface LevelConfig {
  level: number;
  wordCount: number;
}

const BLEND_WORDS: BlendWord[] = [
  { word: 'cat', onset: 'c', rime: 'at', hint: 'A furry pet that says meow' },
  { word: 'dog', onset: 'd', rime: 'og', hint: 'A furry pet that barks' },
  { word: 'sun', onset: 's', rime: 'un', hint: 'It shines in the sky' },
  { word: 'hat', onset: 'h', rime: 'at', hint: 'You wear it on your head' },
  { word: 'bat', onset: 'b', rime: 'at', hint: 'It flies at night' },
  { word: 'map', onset: 'm', rime: 'ap', hint: 'It shows you where to go' },
  { word: 'cup', onset: 'c', rime: 'up', hint: 'You drink from it' },
  { word: 'bus', onset: 'b', rime: 'us', hint: 'It takes kids to school' },
  { word: 'pig', onset: 'p', rime: 'ig', hint: 'It says oink' },
  { word: 'big', onset: 'b', rime: 'ig', hint: 'The opposite of small' },
  { word: 'red', onset: 'r', rime: 'ed', hint: 'A color like apples' },
  { word: 'bed', onset: 'b', rime: 'ed', hint: 'You sleep in it' },
  { word: 'hop', onset: 'h', rime: 'op', hint: 'Like a rabbit!' },
  { word: 'top', onset: 't', rime: 'op', hint: 'Spins on your finger' },
  { word: 'hot', onset: 'h', rime: 'ot', hint: 'The opposite of cold' },
  { word: 'pop', onset: 'p', rime: 'op', hint: 'A sound bubbles make' },
  { word: 'run', onset: 'r', rime: 'un', hint: 'Faster than walking' },
  { word: 'fun', onset: 'f', rime: 'un', hint: 'What you have playing!' },
  { word: 'win', onset: 'w', rime: 'in', hint: 'The opposite of lose' },
  { word: 'sit', onset: 's', rime: 'it', hint: 'The opposite of stand' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, wordCount: 4 },
  { level: 2, wordCount: 6 },
  { level: 3, wordCount: 8 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function getWordsForLevel(level: number): BlendWord[] {
  const config = getLevelConfig(level);
  const shuffled = [...BLEND_WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.wordCount);
}

export function checkAnswer(word: string, answer: string): boolean {
  return word.toLowerCase() === answer.toLowerCase().trim();
}
