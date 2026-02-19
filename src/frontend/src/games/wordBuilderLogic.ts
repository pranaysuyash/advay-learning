import type { Point } from '../types/tracking';
import { pickSpacedPoints } from './targetPracticeLogic';

export interface LetterTarget {
  id: number;
  letter: string;
  position: Point;
  isCorrect: boolean;
  orderIndex: number; // -1 for distractors
}

export const WORD_LISTS: string[][] = [
  ['CAT', 'DOG', 'SUN', 'HAT', 'BIG', 'RED', 'CUP', 'BUS'],
  ['FISH', 'BIRD', 'STAR', 'FROG', 'BALL', 'MOON', 'TREE', 'DUCK'],
  ['APPLE', 'HOUSE', 'TIGER', 'WATER', 'GREEN', 'HAPPY', 'LIGHT', 'SMILE'],
];

const DISTRACTOR_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function pickWordForLevel(
  level: number,
  random: () => number = Math.random,
): string {
  const listIndex = Math.min(level - 1, WORD_LISTS.length - 1);
  const list = WORD_LISTS[listIndex];
  return list[Math.floor(random() * list.length)];
}

export function createLetterTargets(
  word: string,
  extraCount: number,
  random: () => number = Math.random,
): LetterTarget[] {
  const wordLetters = word.split('');
  const totalCount = wordLetters.length + extraCount;

  const points = pickSpacedPoints(totalCount, 0.18, 0.14, random);

  const targets: LetterTarget[] = wordLetters.map((letter, index) => ({
    id: index,
    letter,
    position: points[index].position,
    isCorrect: true,
    orderIndex: index,
  }));

  const usedLetters = new Set(wordLetters);
  for (let i = 0; i < extraCount; i++) {
    let distractor: string;
    do {
      distractor =
        DISTRACTOR_LETTERS[Math.floor(random() * DISTRACTOR_LETTERS.length)];
    } while (usedLetters.has(distractor));

    targets.push({
      id: wordLetters.length + i,
      letter: distractor,
      position: points[wordLetters.length + i].position,
      isCorrect: false,
      orderIndex: -1,
    });
  }

  return targets;
}
