import { shuffle } from '../utils/random';

export interface NumberBubble {
  id: number;
  value: number;
  x: number;
  y: number;
  size: number;
  popped: boolean;
}

export interface Level {
  id: number;
  numberRange: number;
  timeLimit: number;
  rounds: number;
}

export const LEVELS: Level[] = [
  { id: 1, numberRange: 3, timeLimit: 30, rounds: 3 },
  { id: 2, numberRange: 5, timeLimit: 45, rounds: 5 },
  { id: 3, numberRange: 7, timeLimit: 60, rounds: 7 },
  { id: 4, numberRange: 10, timeLimit: 90, rounds: 10 },
];

export function generateBubbles(level: Level): NumberBubble[] {
  const numbers = Array.from({ length: level.numberRange }, (_, i) => i + 1);
  const shuffled = shuffle(numbers);

  const bubbles: NumberBubble[] = [];
  const positions = generatePositions(level.numberRange, 12, 18);

  for (let i = 0; i < shuffled.length; i++) {
    bubbles.push({
      id: i,
      value: shuffled[i],
      x: positions[i].x,
      y: positions[i].y,
      size: 70,
      popped: false,
    });
  }

  return bubbles;
}

function generatePositions(count: number, margin: number, minDistance: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const maxAttempts = 100;
  const safeMargin = Math.min(Math.max(margin, 0), 49);
  const span = 100 - safeMargin * 2;
  const safeMinDistance = Math.min(Math.max(minDistance, 0), Math.max(span * 0.75, 0));
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0;
    let y = 0;
    
    while (!validPosition && attempts < maxAttempts) {
      x = safeMargin + Math.random() * span;
      y = safeMargin + Math.random() * span;
      
      validPosition = true;
      for (const pos of positions) {
        const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (dist < safeMinDistance) {
          validPosition = false;
          break;
        }
      }
      attempts++;
    }
    
    positions.push({ x, y });
  }
  
  return positions;
}

export function checkPop(
  bubbles: NumberBubble[],
  bubbleId: number,
  nextExpected: number
): { correct: boolean; nextExpected: number; allPopped: boolean } {
  const bubble = bubbles.find(b => b.id === bubbleId);
  
  if (!bubble || bubble.popped) {
    return { 
      correct: false, 
      nextExpected, 
      allPopped: bubbles.every(b => b.popped) 
    };
  }
  
  if (bubble.value === nextExpected) {
    const newExpected = nextExpected + 1;
    const remaining = bubbles.filter(b => !b.popped && b.value >= newExpected);
    return {
      correct: true,
      nextExpected: newExpected,
      allPopped: remaining.length === 0
    };
  }
  
  return { 
    correct: false, 
    nextExpected, 
    allPopped: bubbles.every(b => b.popped) 
  };
}

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // 1-3 range
  2: 1.5,  // 1-5 range
  3: 2,    // 1-7 range
  4: 2.5,  // 1-10 range
};

/**
 * Calculate score based on consecutive pops and level
 * Base: 10 points + consecutive bonus (max 20)
 * Multiplied by difficulty
 * Max per pop: 75 points (level 4, 10+ consecutive)
 */
export function calculateScore(consecutivePops: number, level: number): number {
  const baseScore = 10;
  const consecutiveBonus = Math.min(consecutivePops * 2, 20);
  const multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1;
  return Math.floor((baseScore + consecutiveBonus) * multiplier);
}
