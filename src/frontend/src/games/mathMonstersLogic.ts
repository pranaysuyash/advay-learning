/**
 * Math Monsters Game Logic
 * 
 * Feed hungry monsters by showing the correct answer with your fingers!
 * Extends finger counting to include addition and subtraction.
 * 
 * Research Insights:
 * - Finger counting is natural for children (embodied cognition)
 * - Visual representation of math operations aids understanding
 * - Immediate feedback reinforces learning
 * - Monster theme increases engagement
 * 
 * Age: 5-8 years
 * Category: Math Operations (CRITICAL gap filler)
 */



export type Operation = 'recognition' | 'addition' | 'subtraction' | 'mixed';

export interface MathProblem {
  id: string;
  operation: Operation;
  num1: number;
  num2: number;
  answer: number;
  visual: VisualRepresentation;
  hint: string;
}

export interface VisualRepresentation {
  type: 'objects' | 'fingers' | 'number-line' | 'equation';
  equation: string;           // "3 + 2 = ?"
  emoji1: string;             // First number visual
  emoji2: string;             // Second number visual
  description: string;        // "3 apples + 2 apples"
}

export interface Monster {
  id: string;
  name: string;
  emoji: string;
  color: string;
  personality: 'hungry' | 'sleepy' | 'playful' | 'grumpy' | 'excited';
  phrases: {
    request: string[];
    correct: string[];
    incorrect: string[];
    celebrate: string[];
  };
}

export interface Level {
  number: number;
  operation: Operation;
  maxNumber: number;
  problemsToAdvance: number;
  monsters: string[];
  hintText: string;
}

export interface GameState {
  currentLevel: number;
  problemsSolved: number;
  problemsInLevel: number;
  score: number;
  streak: number;
  maxStreak: number;
  currentProblem: MathProblem | null;
  shownFingers: number;
  lastAnswerCorrect: boolean | null;
  completed: boolean;
  stars: number;
}

// Monster characters
export const MONSTERS: Monster[] = [
  {
    id: 'munchy',
    name: 'Munchy',
    emoji: '🦖',
    color: '#4CAF50',
    personality: 'hungry',
    phrases: {
      request: ['Feed me!', "I'm hungry!", 'Yum yum!', 'More numbers!'],
      correct: ['Yum! Tasty number!', 'Delicious!', 'More! More!', 'So good!'],
      incorrect: ['Eww, not that!', 'Yucky!', 'That makes my tummy hurt!', 'Try again!'],
      celebrate: ['I love you!', 'Best feeder ever!', 'So full and happy!'],
    },
  },
  {
    id: 'crunchy',
    name: 'Crunchy',
    emoji: '🐊',
    color: '#8BC34A',
    personality: 'grumpy',
    phrases: {
      request: ['Hurry up!', "I'm waiting...", 'Give me numbers!', 'Feed me now!'],
      correct: ['Hmm, acceptable.', 'Fine, that works.', 'Not bad.', 'Crunch crunch!'],
      incorrect: ['WRONG!', 'Terrible!', 'Are you kidding?!', 'NO!'],
      celebrate: ['You did... okay.', "I'm almost impressed!", 'Fine, you win!'],
    },
  },
  {
    id: 'nibbles',
    name: 'Nibbles',
    emoji: '🐰',
    color: '#FF9800',
    personality: 'playful',
    phrases: {
      request: ['Play with me!', 'Number time!', "Let's count!", 'Hop hop!'],
      correct: ['Yay! You got it!', 'So smart!', 'Hoppy day!', 'Perfect!'],
      incorrect: ['Oopsie!', 'Try again!', 'Almost!', 'You can do it!'],
      celebrate: ['Hooray! Hooray!', 'You are AMAZING!', 'Best friends forever!'],
    },
  },
  {
    id: 'snoozy',
    name: 'Snoozy',
    emoji: '🐻',
    color: '#795548',
    personality: 'sleepy',
    phrases: {
      request: ['So sleepy...', 'Numbers please...', 'Yawn...', 'Before nap...'],
      correct: ['Yawn... correct...', 'Sleepy happy...', 'Zzz... good...'],
      incorrect: ['No... wake me when right...', 'Wrong... snore...', 'Try... zzz...'],
      celebrate: ['So happy... can sleep now...', 'Dream of you... zzz...'],
    },
  },
  {
    id: 'zippy',
    name: 'Zippy',
    emoji: '🦊',
    color: '#FF5722',
    personality: 'excited',
    phrases: {
      request: ['GO GO GO!', 'NUMBERS! NOW!', "LET'S DO THIS!", 'WHEEE!'],
      correct: ['YES YES YES!', 'SO FAST!', 'YOU ROCK!', 'INCREDIBLE!'],
      incorrect: ['NO NO NO!', 'TRY AGAIN! FAST!', 'WRONG! BUT KEEP GOING!'],
      celebrate: ['YOU ARE THE BEST!', 'AMAZING! FANTASTIC!', 'WOO HOO!'],
    },
  },
];

// Level progression
export const LEVELS: Level[] = [
  {
    number: 1,
    operation: 'recognition',
    maxNumber: 5,
    problemsToAdvance: 5,
    monsters: ['nibbles'],
    hintText: 'Show the number with your fingers!',
  },
  {
    number: 2,
    operation: 'recognition',
    maxNumber: 10,
    problemsToAdvance: 5,
    monsters: ['nibbles', 'munchy'],
    hintText: 'Use both hands for numbers bigger than 5!',
  },
  {
    number: 3,
    operation: 'addition',
    maxNumber: 5,
    problemsToAdvance: 5,
    monsters: ['munchy'],
    hintText: 'Add the two numbers together!',
  },
  {
    number: 4,
    operation: 'addition',
    maxNumber: 10,
    problemsToAdvance: 5,
    monsters: ['munchy', 'crunchy'],
    hintText: 'Count up from the bigger number!',
  },
  {
    number: 5,
    operation: 'subtraction',
    maxNumber: 5,
    problemsToAdvance: 5,
    monsters: ['crunchy'],
    hintText: 'Take away the second number!',
  },
  {
    number: 6,
    operation: 'subtraction',
    maxNumber: 10,
    problemsToAdvance: 5,
    monsters: ['crunchy', 'snoozy'],
    hintText: 'Count backwards from the first number!',
  },
  {
    number: 7,
    operation: 'mixed',
    maxNumber: 10,
    problemsToAdvance: 10,
    monsters: ['munchy', 'crunchy', 'nibbles', 'snoozy', 'zippy'],
    hintText: 'Look at the sign! + means add, - means subtract!',
  },
];

// Emojis for visual representations
const MATH_EMOJIS = ['🍎', '🍪', '🌟', '🎈', '🐟', '🍓', '🦋', '🌸', '🍄', '🎀'];

// Generate a math problem
export function generateProblem(level: Level): MathProblem {
  const { operation, maxNumber } = level;
  let num1: number, num2: number, answer: number;
  
  switch (operation) {
    case 'recognition':
      num1 = Math.floor(Math.random() * maxNumber) + 1;
      return {
        id: `rec-${Date.now()}`,
        operation,
        num1,
        num2: 0,
        answer: num1,
        visual: {
          type: 'fingers',
          equation: `Show ${num1}!`,
          emoji1: MATH_EMOJIS[num1 % MATH_EMOJIS.length],
          emoji2: '',
          description: `Show ${num1} with your fingers!`,
        },
        hint: `Hold up ${num1} finger${num1 > 1 ? 's' : ''}!`,
      };
      
    case 'addition':
      // Ensure sum doesn't exceed maxNumber
      num1 = Math.floor(Math.random() * (maxNumber - 1)) + 1;
      num2 = Math.floor(Math.random() * (maxNumber - num1)) + 1;
      answer = num1 + num2;
      return {
        id: `add-${Date.now()}`,
        operation,
        num1,
        num2,
        answer,
        visual: {
          type: 'objects',
          equation: `${num1} + ${num2} = ?`,
          emoji1: MATH_EMOJIS[num1 % MATH_EMOJIS.length],
          emoji2: MATH_EMOJIS[num2 % MATH_EMOJIS.length],
          description: `${num1} ${MATH_EMOJIS[num1 % MATH_EMOJIS.length]} + ${num2} ${MATH_EMOJIS[num2 % MATH_EMOJIS.length]}`,
        },
        hint: `Count: ${num1}, then count up ${num2} more!`,
      };
      
    case 'subtraction':
      // Ensure result is positive
      num1 = Math.floor(Math.random() * (maxNumber - 1)) + 2;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      answer = num1 - num2;
      return {
        id: `sub-${Date.now()}`,
        operation,
        num1,
        num2,
        answer,
        visual: {
          type: 'objects',
          equation: `${num1} - ${num2} = ?`,
          emoji1: MATH_EMOJIS[num1 % MATH_EMOJIS.length],
          emoji2: MATH_EMOJIS[num2 % MATH_EMOJIS.length],
          description: `${num1} ${MATH_EMOJIS[num1 % MATH_EMOJIS.length]} - ${num2} ${MATH_EMOJIS[num2 % MATH_EMOJIS.length]}`,
        },
        hint: `Start at ${num1} and count back ${num2}!`,
      };
      
    case 'mixed': {
      // Randomly choose addition or subtraction
      const isAddition = Math.random() > 0.5;
      if (isAddition) {
        num1 = Math.floor(Math.random() * (maxNumber - 1)) + 1;
        num2 = Math.floor(Math.random() * (maxNumber - num1)) + 1;
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * (maxNumber - 1)) + 2;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
      }
      return {
        id: `mix-${Date.now()}`,
        operation: isAddition ? 'addition' : 'subtraction',
        num1,
        num2,
        answer,
        visual: {
          type: 'equation',
          equation: `${num1} ${isAddition ? '+' : '-'} ${num2} = ?`,
          emoji1: MATH_EMOJIS[num1 % MATH_EMOJIS.length],
          emoji2: MATH_EMOJIS[num2 % MATH_EMOJIS.length],
          description: `${num1} ${isAddition ? 'plus' : 'minus'} ${num2}`,
        },
        hint: isAddition
          ? `Add ${num1} and ${num2}!`
          : `Take ${num2} away from ${num1}!`,
      };
    }
      
    default:
      return generateProblem({ ...level, operation: 'recognition' });
  }
}

// Get current monster for level
export function getMonsterForLevel(level: Level): Monster {
  const monsterId = level.monsters[Math.floor(Math.random() * level.monsters.length)];
  return MONSTERS.find(m => m.id === monsterId) || MONSTERS[0];
}

// Get random phrase
export function getRandomPhrase(monster: Monster, type: keyof Monster['phrases']): string {
  const phrases = monster.phrases[type];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Initialize game state
export function initializeGame(): GameState {
  const firstLevel = LEVELS[0];
  const firstProblem = generateProblem(firstLevel);
  
  return {
    currentLevel: 1,
    problemsSolved: 0,
    problemsInLevel: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    currentProblem: firstProblem,
    shownFingers: 0,
    lastAnswerCorrect: null,
    completed: false,
    stars: 0,
  };
}

// Check answer
export function checkAnswer(shownFingers: number, expectedAnswer: number): boolean {
  return shownFingers === expectedAnswer;
}

// Process answer and update game state
export function processAnswer(
  gameState: GameState,
  shownFingers: number,
  isCorrect: boolean
): GameState {
  const currentLevel = LEVELS[gameState.currentLevel - 1];
  
  // Calculate points
  const basePoints = isCorrect ? 10 : 0;
  const streakBonus = isCorrect ? Math.min(gameState.streak * 2, 20) : 0;
  const speedBonus = 0; // Could add time-based bonus
  const totalPoints = basePoints + streakBonus + speedBonus;
  
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const newProblemsInLevel = gameState.problemsInLevel + 1;
  const newProblemsSolved = isCorrect ? gameState.problemsSolved + 1 : gameState.problemsSolved;
  
  // Check for level up
  let newLevel = gameState.currentLevel;
  let newProblem = gameState.currentProblem;
  
  if (newProblemsInLevel >= currentLevel.problemsToAdvance && isCorrect) {
    if (gameState.currentLevel < LEVELS.length) {
      newLevel = gameState.currentLevel + 1;
      newProblem = generateProblem(LEVELS[newLevel - 1]);
    } else {
      // Game complete
      return {
        ...gameState,
        score: gameState.score + totalPoints,
        streak: newStreak,
        maxStreak: Math.max(gameState.maxStreak, newStreak),
        problemsSolved: newProblemsSolved,
        problemsInLevel: newProblemsInLevel,
        shownFingers,
        lastAnswerCorrect: isCorrect,
        completed: true,
        stars: calculateStars(gameState.score + totalPoints),
      };
    }
  } else if (isCorrect) {
    // Generate next problem for current level
    newProblem = generateProblem(currentLevel);
  }
  
  return {
    ...gameState,
    currentLevel: newLevel,
    score: gameState.score + totalPoints,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    problemsSolved: newProblemsSolved,
    problemsInLevel: newProblemsInLevel,
    currentProblem: newProblem,
    shownFingers,
    lastAnswerCorrect: isCorrect,
  };
}

// Calculate stars based on score
function calculateStars(score: number): number {
  if (score >= 500) return 3;
  if (score >= 300) return 2;
  if (score >= 150) return 1;
  return 0;
}

// Get finger counting hint
export function getFingerCountingHint(number: number): string {
  if (number <= 5) {
    return `Hold up ${number} finger${number > 1 ? 's' : ''} on one hand!`;
  } else {
    const rightHand = number - 5;
    return `Show 5 fingers on left hand, ${rightHand} on right hand!`;
  }
}

// Get progress percentage
export function getLevelProgress(gameState: GameState): number {
  const currentLevel = LEVELS[gameState.currentLevel - 1];
  return Math.min(100, (gameState.problemsInLevel / currentLevel.problemsToAdvance) * 100);
}

// Get total progress across all levels
export function getTotalProgress(gameState: GameState): number {
  const totalProblems = LEVELS.reduce((sum, level) => sum + level.problemsToAdvance, 0);
  return Math.min(100, (gameState.problemsSolved / totalProblems) * 100);
}
