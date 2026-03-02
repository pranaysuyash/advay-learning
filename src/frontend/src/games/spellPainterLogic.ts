export interface SpellPainterLevel {
  id: number;
  word: string;
  difficulty: number;
}

export const LEVELS: SpellPainterLevel[] = [
  { id: 1, word: 'CAT', difficulty: 1 },
  { id: 2, word: 'DOG', difficulty: 1 },
  { id: 3, word: 'SUN', difficulty: 1 },
  { id: 4, word: 'BAT', difficulty: 2 },
  { id: 5, word: 'HAT', difficulty: 2 },
  { id: 6, word: 'PIG', difficulty: 2 },
  { id: 7, word: 'CUP', difficulty: 2 },
  { id: 8, word: 'BUS', difficulty: 3 },
  { id: 9, word: 'FROG', difficulty: 3 },
  { id: 10, word: 'STAR', difficulty: 3 },
];

export interface LetterPosition {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  painted: boolean;
}

export function generateLetterTargets(word: string, canvasWidth: number, canvasHeight: number): LetterPosition[] {
  const letters: LetterPosition[] = [];
  const letterWidth = canvasWidth / word.length;
  const letterHeight = letterWidth;
  const startY = (canvasHeight - letterHeight) / 2;

  for (let i = 0; i < word.length; i++) {
    letters.push({
      char: word[i],
      x: i * letterWidth + letterWidth * 0.1,
      y: startY,
      width: letterWidth * 0.8,
      height: letterHeight * 0.8,
      painted: false,
    });
  }

  return letters;
}

export function checkLetterPainted(
  letter: LetterPosition,
  handX: number,
  handY: number,
  threshold: number = 0.1
): boolean {
  const letterCenterX = letter.x + letter.width / 2;
  const letterCenterY = letter.y + letter.height / 2;

  const relX = Math.abs(handX - letterCenterX) / letter.width;
  const relY = Math.abs(handY - letterCenterY) / letter.height;

  return relX < threshold && relY < threshold;
}

export function isLevelComplete(letters: LetterPosition[]): boolean {
  return letters.every((l) => l.painted);
}

export function calculateScore(letters: LetterPosition[], timeMs: number): number {
  const paintedCount = letters.filter((l) => l.painted).length;
  const baseScore = paintedCount * 100;
  const timeBonus = Math.max(0, Math.floor((60000 - timeMs) / 1000) * 5);
  return baseScore + timeBonus;
}
