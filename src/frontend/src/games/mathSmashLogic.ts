/**
 * Math Smash game logic — solve math to smash the answer.
 */

export interface Question {
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
}

export interface LevelConfig {
  level: number;
  maxNum: number;
  operator: '+' | '-';
}

export const LEVELS: LevelConfig[] = [
  { level: 1, maxNum: 5, operator: '+' },
  { level: 2, maxNum: 10, operator: '+' },
  { level: 3, maxNum: 10, operator: '-' },
  { level: 4, maxNum: 20, operator: '+' },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function generateQuestion(level: number): Question {
  const config = getLevelConfig(level);
  const num1 = Math.floor(Math.random() * config.maxNum) + 1;
  const num2 = Math.floor(Math.random() * config.maxNum) + 1;
  let answer: number;
  let operator = config.operator;

  if (operator === '-' && num2 > num1) {
    operator = '+';
    answer = num1 + num2;
  } else if (operator === '-') {
    answer = num1 - num2;
  } else {
    answer = num1 + num2;
  }

  return { num1, num2, operator, answer };
}

export function generateOptions(
  correctAnswer: number,
  count: number = 4,
): number[] {
  const options = new Set<number>([correctAnswer]);
  while (options.size < count) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const wrongAnswer = correctAnswer + offset * sign;
    if (wrongAnswer > 0) options.add(wrongAnswer);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}
