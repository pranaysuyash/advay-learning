import { describe, expect, it } from 'vitest';

import {
  MONSTERS,
  LEVELS,
  initializeGame,
  generateProblem,
  checkAnswer,
  getMonsterForLevel,
  getRandomPhrase,
  processAnswer,
  getLevelProgress,
  getTotalProgress,
  getFingerCountingHint,
} from '../mathMonstersLogic';

describe('MONSTERS', () => {
  it('has 5 monsters', () => {
    expect(MONSTERS).toHaveLength(5);
  });

  it('each monster has required properties', () => {
    for (const monster of MONSTERS) {
      expect(typeof monster.id).toBe('string');
      expect(typeof monster.name).toBe('string');
      expect(typeof monster.emoji).toBe('string');
      expect(typeof monster.color).toBe('string');
      expect(typeof monster.personality).toBe('string');
      expect(monster.phrases).toHaveProperty('request');
      expect(monster.phrases).toHaveProperty('correct');
      expect(monster.phrases).toHaveProperty('incorrect');
      expect(monster.phrases).toHaveProperty('celebrate');
    }
  });

  it('has expected monster personalities', () => {
    const personalities = MONSTERS.map(m => m.personality);
    expect(personalities).toContain('hungry');
    expect(personalities).toContain('grumpy');
    expect(personalities).toContain('playful');
    expect(personalities).toContain('sleepy');
    expect(personalities).toContain('excited');
  });
});

describe('LEVELS', () => {
  it('has 7 levels', () => {
    expect(LEVELS).toHaveLength(7);
  });

  it('each level has required properties', () => {
    for (const level of LEVELS) {
      expect(typeof level.number).toBe('number');
      expect(typeof level.operation).toBe('string');
      expect(typeof level.maxNumber).toBe('number');
      expect(typeof level.problemsToAdvance).toBe('number');
      expect(Array.isArray(level.monsters)).toBe(true);
      expect(typeof level.hintText).toBe('string');
    }
  });

  it('levels increase in difficulty', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].maxNumber).toBeGreaterThanOrEqual(LEVELS[i - 1].maxNumber);
    }
  });

  it('level numbers are sequential', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      expect(LEVELS[i].number).toBe(i + 1);
    }
  });

  it('each level has at least one monster', () => {
    for (const level of LEVELS) {
      expect(level.monsters.length).toBeGreaterThan(0);
    }
  });
});

describe('initializeGame', () => {
  it('returns initial game state', () => {
    const state = initializeGame();
    
    expect(state).toHaveProperty('currentLevel', 1);
    expect(state).toHaveProperty('problemsSolved', 0);
    expect(state).toHaveProperty('problemsInLevel', 0);
    expect(state).toHaveProperty('score', 0);
    expect(state).toHaveProperty('streak', 0);
    expect(state).toHaveProperty('maxStreak', 0);
    expect(state).toHaveProperty('stars', 0);
    expect(state).toHaveProperty('completed', false);
  });

  it('starts at level 1', () => {
    const state = initializeGame();
    expect(state.currentLevel).toBe(1);
  });

  it('has a current problem', () => {
    const state = initializeGame();
    expect(state.currentProblem).not.toBeNull();
  });
});

describe('generateProblem', () => {
  it('returns a valid problem for each level', () => {
    for (const level of LEVELS) {
      const problem = generateProblem(level);
      
      expect(problem).toHaveProperty('id');
      expect(problem).toHaveProperty('operation');
      expect(problem).toHaveProperty('num1');
      expect(problem).toHaveProperty('num2');
      expect(problem).toHaveProperty('answer');
      expect(problem).toHaveProperty('visual');
      expect(problem).toHaveProperty('hint');
    }
  });

  it('numbers are within level max', () => {
    for (const level of LEVELS) {
      const problem = generateProblem(level);
      
      expect(problem.num1).toBeLessThanOrEqual(level.maxNumber);
      expect(problem.num2).toBeLessThanOrEqual(level.maxNumber);
    }
  });

  it('answer is correct for addition', () => {
    const level = LEVELS.find(l => l.operation === 'addition')!;
    const problem = generateProblem(level);
    
    expect(problem.answer).toBe(problem.num1 + problem.num2);
  });

  it('answer is correct for subtraction', () => {
    const level = LEVELS.find(l => l.operation === 'subtraction')!;
    const problem = generateProblem(level);
    
    expect(problem.answer).toBe(problem.num1 - problem.num2);
  });

  it('has visual representation', () => {
    const problem = generateProblem(LEVELS[0]);
    expect(problem.visual).toHaveProperty('equation');
    expect(problem.visual).toHaveProperty('emoji1');
    expect(problem.visual).toHaveProperty('emoji2');
    expect(problem.visual).toHaveProperty('description');
  });

  it('has a hint', () => {
    const problem = generateProblem(LEVELS[0]);
    expect(typeof problem.hint).toBe('string');
    expect(problem.hint.length).toBeGreaterThan(0);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct answer', () => {
    expect(checkAnswer(5, 5)).toBe(true);
  });

  it('returns false for incorrect answer', () => {
    expect(checkAnswer(3, 5)).toBe(false);
  });

  it('handles zero correctly', () => {
    expect(checkAnswer(0, 0)).toBe(true);
  });
});

describe('getMonsterForLevel', () => {
  it('returns a valid monster for each level', () => {
    for (const level of LEVELS) {
      const monster = getMonsterForLevel(level);
      expect(monster).toBeDefined();
      expect(monster).toHaveProperty('id');
      expect(monster).toHaveProperty('name');
      expect(monster).toHaveProperty('emoji');
    }
  });

  it('returns monster from level monsters list', () => {
    for (const level of LEVELS) {
      const monster = getMonsterForLevel(level);
      expect(level.monsters).toContain(monster.id);
    }
  });

  it('returns consistent monster for same level', () => {
    const level = LEVELS[0];
    const monster1 = getMonsterForLevel(level);
    const monster2 = getMonsterForLevel(level);
    expect(monster1.id).toBe(monster2.id);
  });
});

describe('getRandomPhrase', () => {
  it('returns a string for valid type', () => {
    const monster = MONSTERS[0];
    const phrase = getRandomPhrase(monster, 'request');
    expect(typeof phrase).toBe('string');
    expect(phrase.length).toBeGreaterThan(0);
  });

  it('returns phrase from correct category', () => {
    const monster = MONSTERS[0];
    const requestPhrase = getRandomPhrase(monster, 'request');
    expect(monster.phrases.request).toContain(requestPhrase);
  });

  it('returns phrase for all categories', () => {
    const monster = MONSTERS[0];
    expect(typeof getRandomPhrase(monster, 'request')).toBe('string');
    expect(typeof getRandomPhrase(monster, 'correct')).toBe('string');
    expect(typeof getRandomPhrase(monster, 'incorrect')).toBe('string');
    expect(typeof getRandomPhrase(monster, 'celebrate')).toBe('string');
  });
});

describe('processAnswer', () => {
  it('increments problems solved on correct answer', () => {
    const state = initializeGame();
    const initialSolved = state.problemsSolved;
    
    const newState = processAnswer(state, state.currentProblem!.answer, true);
    expect(newState.problemsSolved).toBe(initialSolved + 1);
  });

  it('increments streak on correct answer', () => {
    const state = initializeGame();
    const newState = processAnswer(state, state.currentProblem!.answer, true);
    expect(newState.streak).toBe(1);
  });

  it('resets streak on incorrect answer', () => {
    const state = initializeGame();
    state.streak = 3;
    
    const newState = processAnswer(state, 999, false);
    expect(newState.streak).toBe(0);
  });

  it('advances level after enough problems', () => {
    const state = initializeGame();
    const level = LEVELS[0];
    state.problemsInLevel = level.problemsToAdvance - 1;
    
    const newState = processAnswer(state, state.currentProblem!.answer, true);
    expect(newState.currentLevel).toBe(2);
  });

  it('marks completed after final level', () => {
    const state = initializeGame();
    state.currentLevel = LEVELS.length;
    state.problemsInLevel = LEVELS[LEVELS.length - 1].problemsToAdvance - 1;
    
    const newState = processAnswer(state, state.currentProblem!.answer, true);
    expect(newState.completed).toBe(true);
  });

  it('updates max streak', () => {
    const state = initializeGame();
    state.streak = 5;
    state.maxStreak = 3;
    
    const newState = processAnswer(state, state.currentProblem!.answer, true);
    expect(newState.maxStreak).toBe(5);
  });

  it('generates new problem after answer', () => {
    const state = initializeGame();
    const oldProblem = state.currentProblem;
    
    const newState = processAnswer(state, state.currentProblem!.answer, true);
    expect(newState.currentProblem).not.toBeNull();
    expect(newState.currentProblem!.id).not.toBe(oldProblem!.id);
  });
});

describe('getLevelProgress', () => {
  it('returns 0 for new level', () => {
    const state = initializeGame();
    state.problemsInLevel = 0;
    const progress = getLevelProgress(state);
    expect(progress).toBe(0);
  });

  it('returns 100 when level complete', () => {
    const state = initializeGame();
    const level = LEVELS[state.currentLevel - 1];
    state.problemsInLevel = level.problemsToAdvance;
    
    const progress = getLevelProgress(state);
    expect(progress).toBe(100);
  });

  it('returns proportional progress', () => {
    const state = initializeGame();
    const level = LEVELS[state.currentLevel - 1];
    state.problemsInLevel = Math.floor(level.problemsToAdvance / 2);
    
    const progress = getLevelProgress(state);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });
});

describe('getTotalProgress', () => {
  it('returns 0 for new game', () => {
    const state = initializeGame();
    const progress = getTotalProgress(state);
    expect(progress).toBe(0);
  });

  it('returns 100 when all levels complete', () => {
    const state = initializeGame();
    const totalProblems = LEVELS.reduce((sum, l) => sum + l.problemsToAdvance, 0);
    state.problemsSolved = totalProblems;
    
    const progress = getTotalProgress(state);
    expect(progress).toBe(100);
  });

  it('caps at 100', () => {
    const state = initializeGame();
    state.problemsSolved = 999;
    
    const progress = getTotalProgress(state);
    expect(progress).toBe(100);
  });
});

describe('getFingerCountingHint', () => {
  it('returns hint for single hand numbers', () => {
    const hint = getFingerCountingHint(3);
    expect(typeof hint).toBe('string');
    expect(hint).toContain('3');
  });

  it('returns hint for two-hand numbers', () => {
    const hint = getFingerCountingHint(7);
    expect(typeof hint).toBe('string');
    expect(hint).toContain('5');
    expect(hint).toContain('2');
  });

  it('handles zero', () => {
    const hint = getFingerCountingHint(0);
    expect(typeof hint).toBe('string');
  });

  it('handles maximum number', () => {
    const hint = getFingerCountingHint(10);
    expect(typeof hint).toBe('string');
    expect(hint).toContain('5');
  });

  it('pluralizes fingers correctly', () => {
    const oneFinger = getFingerCountingHint(1);
    const twoFingers = getFingerCountingHint(2);
    
    expect(oneFinger).toContain('finger');
    expect(twoFingers).toContain('fingers');
  });
});
