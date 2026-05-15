/**
 * Number Ninja Game Logic
 *
 * Math word problems disguised as ninja missions.
 * Educational focus: math problem solving, word problems, arithmetic.
 */

export interface MathProblem {
  question: string;
  answer: number;
  emoji: string;
  hint: string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
  difficulty: number;
}

export interface NumberNinjaRound {
  targetProblem: MathProblem;
  options: number[];
  correctAnswer: number;
}

export interface NumberNinjaGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  hintsUsed: number;
  completed: boolean;
}

// Addition problems
export const ADDITION_PROBLEMS: MathProblem[] = [
  { question: 'Ninja has 3 apples. He finds 2 more. How many total?', answer: 5, emoji: '🍎', hint: '3 + 2', type: 'addition', difficulty: 1 },
  { question: 'You have 4 stars. Friend gives you 3 more. Total?', answer: 7, emoji: '⭐', hint: '4 + 3', type: 'addition', difficulty: 1 },
  { question: '5 birds on tree. 4 more join. How many now?', answer: 9, emoji: '🐦', hint: '5 + 4', type: 'addition', difficulty: 1 },
  { question: '2 cats play. 6 more come. How many cats?', answer: 8, emoji: '🐱', hint: '2 + 6', type: 'addition', difficulty: 1 },
  { question: 'You score 7 points. Score 8 more. Total?', answer: 15, emoji: '🎯', hint: '7 + 8', type: 'addition', difficulty: 2 },
  { question: '12 fish swim. 9 more arrive. How many fish?', answer: 21, emoji: '🐟', hint: '12 + 9', type: 'addition', difficulty: 2 },
  { question: '25 ninjas train. 17 join. Total ninjas?', answer: 42, emoji: '🥷', hint: '25 + 17', type: 'addition', difficulty: 3 },
];

// Subtraction problems
export const SUBTRACTION_PROBLEMS: MathProblem[] = [
  { question: 'You have 8 cookies. Eat 3. How many left?', answer: 5, emoji: '🍪', hint: '8 - 3', type: 'subtraction', difficulty: 1 },
  { question: '10 balloons. 4 pop. How many remain?', answer: 6, emoji: '🎈', hint: '10 - 4', type: 'subtraction', difficulty: 1 },
  { question: '9 ducks swim. 5 fly away. How many?', answer: 4, emoji: '🦆', hint: '9 - 5', type: 'subtraction', difficulty: 1 },
  { question: '15 stickers. Give away 7. How many left?', answer: 8, emoji: '🏷️', hint: '15 - 7', type: 'subtraction', difficulty: 2 },
  { question: '23 coins. Spend 12. How many remain?', answer: 11, emoji: '🪙', hint: '23 - 12', type: 'subtraction', difficulty: 2 },
  { question: '50 stars collected. Lose 28. How many?', answer: 22, emoji: '⭐', hint: '50 - 28', type: 'subtraction', difficulty: 3 },
];

// Multiplication problems
export const MULTIPLICATION_PROBLEMS: MathProblem[] = [
  { question: '2 boxes with 3 toys each. Total toys?', answer: 6, emoji: '📦', hint: '2 × 3', type: 'multiplication', difficulty: 2 },
  { question: '4 rows of flowers. 5 in each row. Total?', answer: 20, emoji: '🌸', hint: '4 × 5', type: 'multiplication', difficulty: 2 },
  { question: '3 baskets with 7 apples each. Total?', answer: 21, emoji: '🍎', hint: '3 × 7', type: 'multiplication', difficulty: 2 },
  { question: '6 packs with 4 cards each. Total cards?', answer: 24, emoji: '🃏', hint: '6 × 4', type: 'multiplication', difficulty: 3 },
  { question: '8 teams with 5 players each. Total?', answer: 40, emoji: '⚽', hint: '8 × 5', type: 'multiplication', difficulty: 3 },
  { question: '9 shelves with 6 books each. Total?', answer: 54, emoji: '📚', hint: '9 × 6', type: 'multiplication', difficulty: 3 },
];

// Division problems
export const DIVISION_PROBLEMS: MathProblem[] = [
  { question: '12 candies shared by 3 friends. Each gets?', answer: 4, emoji: '🍬', hint: '12 ÷ 3', type: 'division', difficulty: 2 },
  { question: '20 cookies divided into 4 groups. Each?', answer: 5, emoji: '🍪', hint: '20 ÷ 4', type: 'division', difficulty: 2 },
  { question: '15 apples put in bags of 3. How many bags?', answer: 5, emoji: '🍎', hint: '15 ÷ 3', type: 'division', difficulty: 2 },
  { question: '36 marbles shared by 6 kids. Each gets?', answer: 6, emoji: '🔮', hint: '36 ÷ 6', type: 'division', difficulty: 3 },
  { question: '48 stickers in pages of 8. How many pages?', answer: 6, emoji: '⭐', hint: '48 ÷ 8', type: 'division', difficulty: 3 },
  { question: '63 toys packed in boxes of 9. How many?', answer: 7, emoji: '🧸', hint: '63 ÷ 9', type: 'division', difficulty: 3 },
];

// Word problems (mixed)
export const WORD_PROBLEMS: MathProblem[] = [
  { question: 'You have 5 toy cars. Mom buys 3 more. Total?', answer: 8, emoji: '🚗', hint: '5 + 3', type: 'mixed', difficulty: 1 },
  { question: 'Birthday cake cut into 8 slices. 5 eaten. Left?', answer: 3, emoji: '🎂', hint: '8 - 5', type: 'mixed', difficulty: 1 },
  { question: '2 bags with 6 balls each. Total balls?', answer: 12, emoji: '⚽', hint: '2 × 6', type: 'mixed', difficulty: 2 },
  { question: 'Library has 30 books. 14 borrowed. Remain?', answer: 16, emoji: '📖', hint: '30 - 14', type: 'mixed', difficulty: 2 },
  { question: '5 friends each have 7 stickers. Total?', answer: 35, emoji: '🏷️', hint: '5 × 7', type: 'mixed', difficulty: 2 },
  { question: 'You earn $12 and spend $5. How much left?', answer: 7, emoji: '💵', hint: '12 - 5', type: 'mixed', difficulty: 2 },
  { question: 'Plant grows 2 inches each week. 4 weeks growth?', answer: 8, emoji: '🌱', hint: '2 × 4', type: 'mixed', difficulty: 2 },
  { question: '24 fish in 3 tanks equally. Fish per tank?', answer: 8, emoji: '🐠', hint: '24 ÷ 3', type: 'mixed', difficulty: 3 },
  { question: 'Bike ride: 15 km morning, 18 km afternoon. Total?', answer: 33, emoji: '🚴', hint: '15 + 18', type: 'mixed', difficulty: 3 },
  { question: 'Jar holds 50 candies. 23 inside. Space left?', answer: 27, emoji: '🍬', hint: '50 - 23', type: 'mixed', difficulty: 3 },
  { question: '6 rows of chairs. 9 chairs each. Total?', answer: 54, emoji: '💺', hint: '6 × 9', type: 'mixed', difficulty: 3 },
  { question: '56 cookies divided among 7 friends. Each?', answer: 8, emoji: '🍪', hint: '56 ÷ 7', type: 'mixed', difficulty: 3 },
];

export const ALL_PROBLEMS: MathProblem[] = [
  ...ADDITION_PROBLEMS,
  ...SUBTRACTION_PROBLEMS,
  ...MULTIPLICATION_PROBLEMS,
  ...DIVISION_PROBLEMS,
  ...WORD_PROBLEMS,
];

export type ProblemType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  problemPool: MathProblem[];
  distractorRange: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    problemPool: [...ADDITION_PROBLEMS.slice(0, 5), ...SUBTRACTION_PROBLEMS.slice(0, 4)],
    distractorRange: 3,
  },
  medium: {
    optionCount: 4,
    problemPool: [
      ...ADDITION_PROBLEMS,
      ...SUBTRACTION_PROBLEMS,
      ...WORD_PROBLEMS.filter(p => p.difficulty <= 2),
    ],
    distractorRange: 5,
  },
  hard: {
    optionCount: 4,
    problemPool: ALL_PROBLEMS,
    distractorRange: 8,
  },
};

function generateDistractors(correctAnswer: number, count: number, range: number): number[] {
  const distractors: number[] = [];
  const used = new Set([correctAnswer]);

  // Generate distractors near the answer
  for (let i = 1; i <= count; i++) {
    const offset = Math.floor(Math.random() * range) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const distractor = correctAnswer + (offset * sign);

    if (distractor >= 0 && !used.has(distractor)) {
      distractors.push(distractor);
      used.add(distractor);
    }
  }

  // If we don't have enough, add more random ones
  while (distractors.length < count) {
    const randomDist = correctAnswer + Math.floor(Math.random() * range * 2) - range;
    if (randomDist >= 0 && !used.has(randomDist)) {
      distractors.push(randomDist);
      used.add(randomDist);
    }
  }

  return distractors;
}

export function generateRound(
  difficulty: Difficulty,
  usedProblems: Set<string> = new Set()
): NumberNinjaRound {
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Filter out used problems (by question text)
  const availableProblems = config.problemPool.filter(
    p => !usedProblems.has(p.question)
  );

  // If all problems used, reset pool
  const problemPool = availableProblems.length > 0
    ? availableProblems
    : config.problemPool;

  // Select random problem
  const targetProblem = problemPool[Math.floor(Math.random() * problemPool.length)];

  // Generate options
  const distractors = generateDistractors(
    targetProblem.answer,
    config.optionCount - 1,
    config.distractorRange
  );

  const options = [targetProblem.answer, ...distractors].sort(() => Math.random() - 0.5);

  return {
    targetProblem,
    options,
    correctAnswer: targetProblem.answer,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): NumberNinjaGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    completed: false,
  };
}

export function checkAnswer(selectedAnswer: number, correctAnswer: number): boolean {
  return selectedAnswer === correctAnswer;
}

export function processAnswer(
  gameState: NumberNinjaGameState,
  isCorrect: boolean,
  hintsUsed: number
): NumberNinjaGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 20;
  const streakBonus = Math.min(newStreak * 3, 25);
  const hintPenalty = hintsUsed * 5;
  const points = isCorrect ? Math.max(0, basePoints + streakBonus - hintPenalty) : 0;

  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    hintsUsed: gameState.hintsUsed + hintsUsed,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: NumberNinjaGameState): number {
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
      return { label: 'Easy (Add/Sub)', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium (All Basic)', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard (All Operations)', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}

export function getNinjaRank(score: number, totalRounds: number): { title: string; emoji: string } {
  const maxPossible = totalRounds * 45; // Approx max score
  const percentage = (score / maxPossible) * 100;

  if (percentage >= 90) return { title: 'Grandmaster Ninja', emoji: '🥷👑' };
  if (percentage >= 80) return { title: 'Master Ninja', emoji: '🥷⭐' };
  if (percentage >= 70) return { title: 'Expert Ninja', emoji: '🥷⚡' };
  if (percentage >= 60) return { title: 'Skilled Ninja', emoji: '🥷🔥' };
  if (percentage >= 50) return { title: 'Ninja Apprentice', emoji: '🥷🌱' };
  if (percentage >= 40) return { title: 'Ninja Trainee', emoji: '🥷📚' };
  return { title: 'Ninja Beginner', emoji: '🥷🎯' };
}

export function getProblemTypeIcon(type: ProblemType): string {
  const icons: Record<ProblemType, string> = {
    addition: '➕',
    subtraction: '➖',
    multiplication: '✖️',
    division: '➗',
    mixed: '🧮',
  };
  return icons[type] || '📐';
}
