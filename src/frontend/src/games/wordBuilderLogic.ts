/**
 * Word Builder Game Logic
 *
 * Orchestrates word selection, game state, and curriculum progression.
 * Analytics are delegated to analyticsStore.ts for separation of concerns.
 */

import type { Point } from '../types/tracking';
import type { SelectionMode } from './analyticsStore';

/**
 * Simple LRU (Least Recently Used) cache with bounded size.
 * Evicts oldest entries when capacity is reached.
 */
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Re-insert to mark as recently used
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  set(key: K, value: V): void {
    // Remove if exists (will be re-added at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest if at capacity
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as K;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get size(): number {
    return this.cache.size;
  }
}

// Re-export types for consumers
export type { SelectionMode };
export type { SessionAnalytics, AnalyticsSummary } from './analyticsStore';

// Backward compatible type aliases
export type ExploreOptions = PickWordOptions;
export type PhonicsOptions = PickWordOptions;

import wordBank from './wordbank/wordbank.json';
import curriculum from './wordbank/curriculum.json';

// ============ TYPES ============

export interface WordEntry {
  word: string;
  pronunciation?: string;
  meaning?: string;
  difficulty?: number;
}

export interface WordBank {
  words: WordEntry[];
  metadata: {
    version: number | string;
    totalWords: number;
    [key: string]: unknown;
  };
}

export interface LetterTarget {
  id: number;
  letter: string;
  position: Point;
  isCorrect: boolean;
  orderIndex: number; // -1 for distractors
}

export interface StageCriteria {
  length?: number[];
  vowel?: string[];
  pattern?: string[];
  is_sight?: boolean;
}

export interface Stage {
  id: string;
  name?: string;
  description?: string;
  order?: number;
  criteria: StageCriteria;
}

export interface Curriculum {
  stages: Stage[];
}

// ============ DATA LOADING ============

const typedWordBank = wordBank as unknown as WordBank;
const typedCurriculum = curriculum as unknown as Curriculum;

// Cache for tag computations
const tagCache = new Map<string, WordBank>();
const curriculumCache = new Map<string, Curriculum>();

// Lazy load functions for compatibility
export async function loadWordBank(): Promise<WordBank> {
  if (tagCache.has('bank')) {
    return tagCache.get('bank')!;
  }
  tagCache.set('bank', typedWordBank);
  return typedWordBank;
}

export async function loadCurriculum(): Promise<Curriculum> {
  if (curriculumCache.has('curriculum')) {
    return curriculumCache.get('curriculum')!;
  }
  curriculumCache.set('curriculum', typedCurriculum);
  return typedCurriculum;
}

export function clearCaches(): void {
  tagCache.clear();
  curriculumCache.clear();
}

// Backward compatibility exports
export function loadWordLists(): string[][] {
  // Group words by difficulty for old API compatibility
  const lists: string[][] = [[], [], [], []];
  for (const w of typedWordBank.words) {
    const d = (w.difficulty ?? 1) - 1;
    if (d >= 0 && d < 4) {
      lists[d].push(w.word.toUpperCase());
    }
  }
  return lists;
}

// Legacy export kept for backward compatibility with older consumers.
export const WORD_LISTS: string[][] = loadWordLists();

export async function pickWordAsync(options: PickWordOptions): Promise<PickWordResult | null> {
  return pickWord(options);
}

export function pickWordForLevel(level: number, random?: () => number): PickWordResult | null {
  return pickWord({ mode: 'explore', level }, random);
}

export function getStageIds(): string[] {
  return typedCurriculum.stages.map(s => s.id);
}

/**
 * Create letter targets for a word with distractors.
 */
export function createLetterTargets(
  word: string,
  distractorCount: number,
  random: () => number
): LetterTarget[] {
  const targets: LetterTarget[] = [];
  const upperWord = word.toUpperCase();
  
  // Add correct letters
  for (let i = 0; i < upperWord.length; i++) {
    targets.push({
      id: i,
      letter: upperWord[i],
      position: { x: 0, y: 0 }, // Will be positioned by caller
      isCorrect: true,
      orderIndex: i,
    });
  }
  
  // Add distractors from alphabet (excluding letters in the word)
  const wordLetters = new Set(upperWord);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const availableDistractors = alphabet.split('').filter(l => !wordLetters.has(l));
  
  // Ensure no duplicates by shuffling and taking first N
  const shuffled = [...availableDistractors].sort(() => random() - 0.5);
  const selected = shuffled.slice(0, Math.min(distractorCount, shuffled.length));
  
  for (let i = 0; i < selected.length; i++) {
    targets.push({
      id: word.length + i,
      letter: selected[i],
      position: { x: 0, y: 0 },
      isCorrect: false,
      orderIndex: -1,
    });
  }
  
  return targets;
}

// Pre-compute word tags for efficient filtering
// LRU cache with 500 entry limit (word bank has ~1200 words)
const wordTagCache = new LRUCache<string, Set<string>>(500);

function getWordTags(word: string): Set<string> {
  if (wordTagCache.has(word)) {
    return wordTagCache.get(word)!;
  }
  
  const tags = computeWordTags(word);
  wordTagCache.set(word, tags);
  return tags;
}

function computeWordTags(word: string): Set<string> {
  const tags = new Set<string>();
  const upper = word.toUpperCase();
  
  // Length tag
  tags.add(`len:${upper.length}`);
  
  // Vowel tags
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const foundVowels = new Set<string>();
  for (const char of upper) {
    if (vowels.includes(char)) {
      foundVowels.add(char);
    }
  }
  for (const v of foundVowels) {
    tags.add(`vowel:${v}`);
  }
  
  // Pattern tags
  if (upper.length === 3) {
    const [c1, v, c2] = [upper[0], upper[1], upper[2]];
    if (isConsonant(c1) && isVowel(v) && isConsonant(c2)) {
      tags.add('pattern:cvc');
      tags.add(`cvc:${v}`); // e.g., cvc:A for "CAT"
    }
  }
  if (upper.length === 4) {
    const [c1, c2, v, c3] = [upper[0], upper[1], upper[2], upper[3]];
    if (isConsonant(c1) && isConsonant(c2) && isVowel(v) && isConsonant(c3)) {
      tags.add('pattern:ccvc');
    }
    const [d1, v2, c4, c5] = [upper[0], upper[1], upper[2], upper[3]];
    if (isConsonant(d1) && isVowel(v2) && isConsonant(c4) && isConsonant(c5)) {
      tags.add('pattern:cvcc');
    }
  }
  
  // Digraph patterns
  if (upper.includes('SH')) tags.add('pattern:digraph_sh');
  if (upper.includes('CH')) tags.add('pattern:digraph_ch');
  if (upper.includes('TH')) tags.add('pattern:digraph_th');
  if (upper.startsWith('WH')) tags.add('pattern:digraph_wh');
  
  // Vowel team
  const vowelTeams = ['AI', 'AY', 'EE', 'EA', 'OA', 'OE', 'UE', 'UI', 'IE'];
  for (const team of vowelTeams) {
    if (upper.includes(team)) {
      tags.add('pattern:vowel_team');
      break;
    }
  }
  
  // Sight word heuristic (simple approximation)
  const sightWords = new Set(['THE', 'AND', 'YOU', 'FOR', 'ARE', 'BUT', 'NOT', 'ALL', 'ANY', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'USE', 'MAN', 'NEW', 'NOW', 'WAY', 'MAY', 'SAY', 'SHE', 'TRY', 'ASK', 'TOO', 'OLD', 'TELL', 'VERY', 'WHEN', 'COME', 'EACH', 'MORE', 'MUST', 'ONLY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE', 'HERE', 'JUST', 'KNOW', 'LONG', 'MAKE', 'MADE', 'MOST', 'NAME', 'PAGE', 'PART', 'SAID', 'SOME', 'TIME', 'VERY', 'WHAT', 'WITH', 'YEAR', 'YOUR']);
  if (sightWords.has(upper)) {
    tags.add('is_sight:true');
  }
  
  return tags;
}

function isVowel(char: string): boolean {
  return 'AEIOU'.includes(char.toUpperCase());
}

function isConsonant(char: string): boolean {
  const c = char.toUpperCase();
  return c >= 'A' && c <= 'Z' && !isVowel(c);
}

// ============ WORD SELECTION ============

export interface PickWordOptions {
  mode: 'explore' | 'phonics';
  stageId?: string;
  difficulty?: number;
  level?: number; // For backward compatibility with explore mode
  usedWords?: Set<string>;
  maxDifficulty?: number;
}

export interface PickWordResult {
  word: string;
  difficulty: number;
  letters: string[];
  stage?: Stage;
}

/**
 * Pick a word based on game mode and curriculum stage.
 * Implements fallback chain: requested stage → cvc_all → any 3-letter → null
 */
export function pickWord(
  options: PickWordOptions,
  random: () => number = Math.random
): PickWordResult | null {
  const { mode, stageId, usedWords = new Set(), maxDifficulty = 3, level } = options;
  
  // Map level to maxDifficulty for backward compatibility
  const effectiveMaxDifficulty = level ?? maxDifficulty;
  
  // Phonics mode: use curriculum stage
  if (mode === 'phonics' && stageId) {
    const stage = typedCurriculum.stages.find(s => s.id === stageId);
    if (stage) {
      const result = pickWordForStage(stage, usedWords, random);
      if (result) return { ...result, stage };
      
      // Fallback to cvc_all if stage is empty
      console.warn(`[WordBuilder] No words for stage ${stageId}, trying cvc_all`);
      const cvcAll = typedCurriculum.stages.find(s => s.id === 'cvc_all');
      if (cvcAll) {
        const fallback = pickWordForStage(cvcAll, usedWords, random);
        if (fallback) return { ...fallback, stage: cvcAll };
      }
      
      // Fallback to any 3-letter word
      const any3 = pickWordByCriteria({ length: [3] }, usedWords, random);
      if (any3) return any3;
      
      return null;
    }
  }
  
  // Explore mode: use difficulty ladder
  const wordList = typedWordBank.words.filter(w => {
    const d = w.difficulty ?? 1;
    return d <= effectiveMaxDifficulty && !usedWords.has(w.word.toUpperCase());
  });
  
  if (wordList.length === 0) return null;
  
  const selected = wordList[Math.floor(random() * wordList.length)];
  return {
    word: selected.word.toUpperCase(),
    difficulty: selected.difficulty ?? 1,
    letters: selected.word.toUpperCase().split(''),
  };
}

/**
 * Pick a word matching stage criteria.
 */
function pickWordForStage(
  stage: Stage,
  usedWords: Set<string>,
  random: () => number
): PickWordResult | null {
  const candidates = typedWordBank.words.filter(w => {
    // Check if already used
    if (usedWords.has(w.word.toUpperCase())) return false;
    
    // Check criteria
    return matchesCriteria(w, stage.criteria);
  });
  
  if (candidates.length === 0) return null;
  
  const selected = candidates[Math.floor(random() * candidates.length)];
  return {
    word: selected.word.toUpperCase(),
    difficulty: selected.difficulty ?? 1,
    letters: selected.word.toUpperCase().split(''),
  };
}

/**
 * Pick a word by raw criteria.
 */
function pickWordByCriteria(
  criteria: StageCriteria,
  usedWords: Set<string>,
  random: () => number
): PickWordResult | null {
  const candidates = typedWordBank.words.filter(w => {
    if (usedWords.has(w.word.toUpperCase())) return false;
    return matchesCriteria(w, criteria);
  });
  
  if (candidates.length === 0) return null;
  
  const selected = candidates[Math.floor(random() * candidates.length)];
  return {
    word: selected.word.toUpperCase(),
    difficulty: selected.difficulty ?? 1,
    letters: selected.word.toUpperCase().split(''),
  };
}

/**
 * Check if a word matches the given criteria.
 */
function matchesCriteria(word: WordEntry, criteria: StageCriteria): boolean {
  const upper = word.word.toUpperCase();
  const tags = getWordTags(word.word);
  
  // Length check
  if (criteria.length && !criteria.length.includes(upper.length)) {
    return false;
  }
  
  // Vowel check (orthographic - middle letter for CVC)
  if (criteria.vowel && criteria.vowel.length > 0) {
    const wantsCVC = criteria.pattern?.includes('cvc');
    const wantsLen3 = criteria.length?.includes(3);
    
    // Validate: vowel constraint only makes sense with CVC pattern + length 3
    if (!wantsCVC || !wantsLen3) {
      console.warn(
        `[WordBuilder] Stage with vowel constraint requires cvc pattern + length 3; rejecting filter.`
      );
      return false;
    }
    
    // Must be exactly 3 letters with middle letter matching required vowel
    if (upper.length !== 3) return false;
    const middleLetter = upper[1];
    if (!criteria.vowel.includes(middleLetter)) return false;
  }
  
  // Pattern check
  if (criteria.pattern) {
    const hasMatchingPattern = criteria.pattern.some(p => tags.has(`pattern:${p}`));
    if (!hasMatchingPattern) return false;
  }
  
  // Sight word check
  if (criteria.is_sight !== undefined) {
    const isSight = tags.has('is_sight:true');
    if (criteria.is_sight && !isSight) return false;
    if (!criteria.is_sight && isSight) return false;
  }
  
  return true;
}

// ============ CURRICULUM UTILITIES ============

export function getStages(): Stage[] {
  return [...typedCurriculum.stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getStageById(id: string): Stage | undefined {
  return typedCurriculum.stages.find(s => s.id === id);
}

export function getNextStage(currentId: string): Stage | null {
  const stages = getStages();
  const currentIndex = stages.findIndex(s => s.id === currentId);
  if (currentIndex === -1 || currentIndex >= stages.length - 1) {
    return null;
  }
  return stages[currentIndex + 1];
}

export function getWordsForStage(stageId: string): WordEntry[] {
  const stage = typedCurriculum.stages.find(s => s.id === stageId);
  if (!stage) return [];
  
  return typedWordBank.words.filter(w => matchesCriteria(w, stage.criteria));
}

// ============ ANALYTICS DELEGATION ============

// Re-export analytics functions from analyticsStore
export {
  startSession,
  endSession,
  recordWordCompleted,
  recordTouch,
  getStoredSessions,
  getAnalyticsSummary,
  exportAnalytics,
  clearAnalytics,
} from './analyticsStore';

// ============ DIFFICULTY UTILITIES ============

export const DIFFICULTY_LEVELS = {
  1: { label: 'Easy', description: 'Simple 3-letter words' },
  2: { label: 'Medium', description: 'Common 4-letter words' },
  3: { label: 'Hard', description: 'Blends and digraphs' },
  4: { label: 'Expert', description: 'Sight words and longer words' },
} as const;

export function getDifficultyLabel(level: number): string {
  return DIFFICULTY_LEVELS[level as keyof typeof DIFFICULTY_LEVELS]?.label ?? 'Unknown';
}

export function getDifficultyForStage(stageId: string): number {
  switch (stageId) {
    case 'cvc_a':
    case 'cvc_e':
      return 1;
    case 'cvc_all':
      return 2;
    case 'blends':
    case 'digraphs':
      return 3;
    case 'long_vowels':
    case 'sight_words_3':
      return 4;
    case 'advanced':
      return 4;
    default:
      return 2;
  }
}
