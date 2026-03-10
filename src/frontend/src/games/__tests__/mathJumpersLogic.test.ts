/**
 * Math Jumpers Logic Tests
 *
 * Tests for the math platformer game logic including problem generation,
 * player movement, answer checking, and scoring.
 */

import { describe, it, expect } from 'vitest';
import {
  generateProblem,
  generateAnswerOptions,
  createPlatforms,
  createInitialState,
  startGame,
  movePlayerToPlatform,
  updatePlayerPosition,
  checkAnswer,
  nextProblem,
  updateTimer,
  getFeedbackMessage,
  calculateFinalScore,
  getOperationSymbol,
  LEVEL_CONFIGS,
  DEFAULT_CONFIG,
  type Difficulty,
  type Operation,
} from '../mathJumpersLogic';

describe('MathJumpers Logic', () => {
  describe('generateProblem', () => {
    it('generates an addition problem for easy difficulty', () => {
      const problem = generateProblem('easy');
      
      expect(problem).toHaveProperty('id');
      expect(problem).toHaveProperty('operandA');
      expect(problem).toHaveProperty('operandB');
      expect(problem).toHaveProperty('correctAnswer');
      expect(problem.answers).toBeInstanceOf(Array);
      expect(problem.answers.length).toBeGreaterThanOrEqual(3);
      expect(problem.answers).toContain(problem.correctAnswer);
    });

    it('generates problems with correct answers for addition', () => {
      // Mock consistent random for predictable test
      const problem = generateProblem('easy');
      
      if (problem.operation === 'add') {
        expect(problem.correctAnswer).toBe(problem.operandA + problem.operandB);
      } else if (problem.operation === 'subtract') {
        expect(problem.correctAnswer).toBe(problem.operandA - problem.operandB);
      } else if (problem.operation === 'multiply') {
        expect(problem.correctAnswer).toBe(problem.operandA * problem.operandB);
      }
    });

    it('includes the correct answer in options', () => {
      const problem = generateProblem('easy');
      expect(problem.answers).toContain(problem.correctAnswer);
    });

    it('generates unique problem IDs', () => {
      const problem1 = generateProblem('easy');
      const problem2 = generateProblem('easy');
      expect(problem1.id).not.toBe(problem2.id);
    });

    it('formats display string correctly', () => {
      const problem = generateProblem('easy');
      const opSymbol = problem.operation === 'add' ? '+' : 
                       problem.operation === 'subtract' ? '-' : '×';
      expect(problem.display).toContain(opSymbol);
      expect(problem.display).toContain('?');
    });
  });

  describe('generateAnswerOptions', () => {
    it('generates correct number of options for easy difficulty', () => {
      const options = generateAnswerOptions(10, 'easy');
      expect(options.length).toBe(3);
      expect(options).toContain(10);
    });

    it('generates correct number of options for medium difficulty', () => {
      const options = generateAnswerOptions(10, 'medium');
      expect(options.length).toBe(4);
      expect(options).toContain(10);
    });

    it('generates correct number of options for hard difficulty', () => {
      const options = generateAnswerOptions(10, 'hard');
      expect(options.length).toBe(5);
      expect(options).toContain(10);
    });

    it('only includes positive numbers', () => {
      const options = generateAnswerOptions(5, 'easy');
      options.forEach(opt => {
        expect(opt).toBeGreaterThan(0);
      });
    });
  });

  describe('createPlatforms', () => {
    it('creates correct number of platforms', () => {
      const answers = [5, 10, 15];
      const platforms = createPlatforms(answers);
      expect(platforms.length).toBe(3);
    });

    it('assigns numbers correctly to platforms', () => {
      const answers = [5, 10, 15];
      const platforms = createPlatforms(answers);
      const platformNumbers = platforms.map(p => p.number);
      expect(platformNumbers.sort()).toEqual([5, 10, 15].sort());
    });

    it('positions platforms with unique IDs', () => {
      const answers = [1, 2, 3, 4];
      const platforms = createPlatforms(answers);
      const ids = platforms.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('distributes platforms across width', () => {
      const answers = [1, 2, 3];
      const platforms = createPlatforms(answers);
      
      // All platforms should be within bounds
      platforms.forEach(p => {
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(1);
        expect(p.y).toBe(0.6); // Fixed height
      });
    });
  });

  describe('createInitialState', () => {
    it('creates state with idle status', () => {
      const state = createInitialState();
      expect(state.status).toBe('idle');
    });

    it('initializes score to 0', () => {
      const state = createInitialState();
      expect(state.score).toBe(0);
    });

    it('initializes streak to 0', () => {
      const state = createInitialState();
      expect(state.streak).toBe(0);
    });

    it('positions player at start position', () => {
      const state = createInitialState();
      expect(state.player.x).toBe(0.5);
      expect(state.player.y).toBe(0.3);
      expect(state.player.isJumping).toBe(false);
    });

    it('uses default config when none provided', () => {
      const state = createInitialState();
      expect(state.totalProblems).toBe(DEFAULT_CONFIG.totalProblems);
    });

    it('uses provided config', () => {
      const customConfig = { ...DEFAULT_CONFIG, totalProblems: 10 };
      const state = createInitialState(customConfig);
      expect(state.totalProblems).toBe(10);
    });
  });

  describe('startGame', () => {
    it('sets status to playing', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.status).toBe('playing');
    });

    it('generates a problem', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.problem).not.toBeNull();
    });

    it('creates platforms for the problem', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.platforms.length).toBeGreaterThan(0);
    });

    it('resets player position', () => {
      const state = createInitialState();
      const playing = startGame(state, 'easy');
      const moved = movePlayerToPlatform(playing, 0);
      const restarted = startGame(moved, 'easy');
      expect(restarted.player.x).toBe(0.5);
      expect(restarted.player.isJumping).toBe(false);
    });

    it('sets time based on difficulty', () => {
      const state = createInitialState();
      const easy = startGame(state, 'easy');
      expect(easy.timeLeft).toBe(LEVEL_CONFIGS.easy.timePerProblem);
    });
  });

  describe('movePlayerToPlatform', () => {
    it('sets player jumping when moving to valid platform', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = movePlayerToPlatform(state, 0);
      expect(newState.player.isJumping).toBe(true);
      expect(newState.player.targetX).not.toBeNull();
    });

    it('does nothing when platform does not exist', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = movePlayerToPlatform(state, 999);
      expect(newState.player.isJumping).toBe(false);
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newState = movePlayerToPlatform(state, 0);
      expect(newState.player.isJumping).toBe(false);
    });
  });

  describe('updatePlayerPosition', () => {
    it('moves player toward target when jumping', () => {
      const state = startGame(createInitialState(), 'easy');
      const moving = movePlayerToPlatform(state, 0);
      const updated = updatePlayerPosition(moving, 0.1);
      expect(updated.player.x).not.toBe(moving.player.x);
    });

    it('stops jumping when reaching target', () => {
      const state = startGame(createInitialState(), 'easy');
      const moving = movePlayerToPlatform(state, 0);
      // Simulate reaching target with large delta time
      const updated = updatePlayerPosition(moving, 10);
      expect(updated.player.isJumping).toBe(false);
      expect(updated.player.targetX).toBeNull();
    });

    it('sets onPlatform when landing', () => {
      const state = startGame(createInitialState(), 'easy');
      const moving = movePlayerToPlatform(state, 0);
      const landed = updatePlayerPosition(moving, 10);
      expect(landed.player.onPlatform).toBe(0);
    });

    it('does not change position when not jumping', () => {
      const state = startGame(createInitialState(), 'easy');
      const updated = updatePlayerPosition(state, 0.1);
      expect(updated.player.x).toBe(state.player.x);
    });
  });

  describe('checkAnswer', () => {
    it('returns correct when player on correct platform', () => {
      const state = startGame(createInitialState(), 'easy');
      const correctPlatformId = state.platforms.find(
        p => p.number === state.problem!.correctAnswer
      )!.id;
      const moving = movePlayerToPlatform(state, correctPlatformId);
      const landed = updatePlayerPosition(moving, 10);
      const { isCorrect } = checkAnswer(landed);
      expect(isCorrect).toBe(true);
    });

    it('returns wrong when player on incorrect platform', () => {
      const state = startGame(createInitialState(), 'easy');
      const wrongPlatform = state.platforms.find(
        p => p.number !== state.problem!.correctAnswer
      )!;
      const moving = movePlayerToPlatform(state, wrongPlatform.id);
      const landed = updatePlayerPosition(moving, 10);
      const { isCorrect } = checkAnswer(landed);
      expect(isCorrect).toBe(false);
    });

    it('increments streak on correct answer', () => {
      const state = startGame(createInitialState(), 'easy');
      const correctPlatformId = state.platforms.find(
        p => p.number === state.problem!.correctAnswer
      )!.id;
      const moving = movePlayerToPlatform(state, correctPlatformId);
      const landed = updatePlayerPosition(moving, 10);
      const { state: result } = checkAnswer(landed);
      expect(result.streak).toBe(1);
    });

    it('resets streak on wrong answer', () => {
      const state = { ...startGame(createInitialState(), 'easy'), streak: 5 };
      const wrongPlatform = state.platforms.find(
        p => p.number !== state.problem!.correctAnswer
      )!;
      const moving = movePlayerToPlatform(state, wrongPlatform.id);
      const landed = updatePlayerPosition(moving, 10);
      const { state: result } = checkAnswer(landed);
      expect(result.streak).toBe(0);
    });

    it('adds points on correct answer', () => {
      const state = startGame(createInitialState(), 'easy');
      const correctPlatformId = state.platforms.find(
        p => p.number === state.problem!.correctAnswer
      )!.id;
      const moving = movePlayerToPlatform(state, correctPlatformId);
      const landed = updatePlayerPosition(moving, 10);
      const { state: result } = checkAnswer(landed);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('nextProblem', () => {
    it('generates new problem', () => {
      const state = startGame(createInitialState(), 'easy');
      const firstProblemId = state.problem!.id;
      const next = nextProblem(state, 'easy');
      expect(next.problem!.id).not.toBe(firstProblemId);
    });

    it('creates new platforms', () => {
      const state = startGame(createInitialState(), 'easy');
      const next = nextProblem(state, 'easy');
      expect(next.platforms.length).toBeGreaterThan(0);
    });

    it('resets player position', () => {
      const state = startGame(createInitialState(), 'easy');
      const moving = movePlayerToPlatform(state, 0);
      const next = nextProblem(moving, 'easy');
      expect(next.player.x).toBe(0.5);
      expect(next.player.isJumping).toBe(false);
    });

    it('completes game when all problems solved', () => {
      const state = { 
        ...startGame(createInitialState(), 'easy'),
        problemsSolved: DEFAULT_CONFIG.totalProblems 
      };
      const next = nextProblem(state, 'easy');
      expect(next.status).toBe('complete');
    });

    it('resets timer', () => {
      const state = { ...startGame(createInitialState(), 'easy'), timeLeft: 5 };
      const next = nextProblem(state, 'easy');
      expect(next.timeLeft).toBe(LEVEL_CONFIGS.easy.timePerProblem);
    });
  });

  describe('updateTimer', () => {
    it('decrements time when playing', () => {
      const state = startGame(createInitialState(), 'easy');
      const updated = updateTimer(state);
      expect(updated.timeLeft).toBe(state.timeLeft - 1);
    });

    it('marks wrong when time runs out', () => {
      const state = { ...startGame(createInitialState(), 'easy'), timeLeft: 1 };
      const updated = updateTimer(state);
      expect(updated.status).toBe('wrong');
      expect(updated.timeLeft).toBe(0);
    });

    it('resets streak on timeout', () => {
      const state = { 
        ...startGame(createInitialState(), 'easy'), 
        timeLeft: 1,
        streak: 3 
      };
      const updated = updateTimer(state);
      expect(updated.streak).toBe(0);
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const updated = updateTimer(state);
      expect(updated.timeLeft).toBe(state.timeLeft);
    });
  });

  describe('getFeedbackMessage', () => {
    it('returns high praise for streak >= 5', () => {
      const feedback = getFeedbackMessage(5);
      expect(feedback.message).toBe('Unstoppable!');
      expect(feedback.emoji).toBe('🔥');
    });

    it('returns good praise for streak >= 3', () => {
      const feedback = getFeedbackMessage(3);
      expect(feedback.message).toBe('Amazing streak!');
      expect(feedback.emoji).toBe('⚡');
    });

    it('returns encouragement for streak >= 2', () => {
      const feedback = getFeedbackMessage(2);
      expect(feedback.message).toBe('Keep it up!');
      expect(feedback.emoji).toBe('⭐');
    });

    it('returns basic praise for streak 1', () => {
      const feedback = getFeedbackMessage(1);
      expect(feedback.message).toBe('Great job!');
      expect(feedback.emoji).toBe('🎉');
    });

    it('returns basic praise for streak 0', () => {
      const feedback = getFeedbackMessage(0);
      expect(feedback.message).toBe('Great job!');
    });
  });

  describe('calculateFinalScore', () => {
    it('calculates base score', () => {
      const state = { ...createInitialState(), score: 500 };
      const result = calculateFinalScore(state);
      expect(result.baseScore).toBe(500);
    });

    it('adds accuracy bonus', () => {
      const state = { 
        ...createInitialState(), 
        score: 100,
        problemsSolved: 5,
        totalProblems: 5 
      };
      const result = calculateFinalScore(state);
      expect(result.accuracyBonus).toBe(200); // 100% accuracy
    });

    it('adds streak bonus', () => {
      const state = { ...createInitialState(), score: 100, streak: 3 };
      const result = calculateFinalScore(state);
      expect(result.streakBonus).toBe(60); // 3 * 20
    });

    it('caps streak bonus at 100', () => {
      const state = { ...createInitialState(), score: 100, streak: 10 };
      const result = calculateFinalScore(state);
      expect(result.streakBonus).toBe(100);
    });

    it('calculates total correctly', () => {
      const state = { 
        ...createInitialState(), 
        score: 100,
        problemsSolved: 3,
        totalProblems: 5,
        streak: 2
      };
      const result = calculateFinalScore(state);
      const expectedTotal = 100 + 120 + 40; // base + accuracy(60%) + streak
      expect(result.total).toBe(expectedTotal);
    });
  });

  describe('getOperationSymbol', () => {
    it('returns + for add', () => {
      expect(getOperationSymbol('add')).toBe('+');
    });

    it('returns - for subtract', () => {
      expect(getOperationSymbol('subtract')).toBe('-');
    });

    it('returns × for multiply', () => {
      expect(getOperationSymbol('multiply')).toBe('×');
    });
  });

  describe('LEVEL_CONFIGS', () => {
    it('has correct config for easy', () => {
      expect(LEVEL_CONFIGS.easy.difficulty).toBe('easy');
      expect(LEVEL_CONFIGS.easy.totalProblems).toBe(5);
      expect(LEVEL_CONFIGS.easy.platformCount).toBe(3);
    });

    it('has correct config for medium', () => {
      expect(LEVEL_CONFIGS.medium.difficulty).toBe('medium');
      expect(LEVEL_CONFIGS.medium.totalProblems).toBe(7);
      expect(LEVEL_CONFIGS.medium.platformCount).toBe(4);
    });

    it('has correct config for hard', () => {
      expect(LEVEL_CONFIGS.hard.difficulty).toBe('hard');
      expect(LEVEL_CONFIGS.hard.totalProblems).toBe(10);
      expect(LEVEL_CONFIGS.hard.platformCount).toBe(5);
    });

    it('has decreasing time per difficulty', () => {
      expect(LEVEL_CONFIGS.easy.timePerProblem)
        .toBeGreaterThan(LEVEL_CONFIGS.medium.timePerProblem);
      expect(LEVEL_CONFIGS.medium.timePerProblem)
        .toBeGreaterThan(LEVEL_CONFIGS.hard.timePerProblem);
    });
  });
});
