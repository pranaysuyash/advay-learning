/**
 * Pinch Practice Logic Tests
 *
 * Tests for fine motor skill pinch exercises.
 */

import { describe, it, expect } from 'vitest';
import {
  generateExercises,
  createInitialState,
  startGame,
  handlePinchStart,
  handlePinchHold,
  handlePinchRelease,
  completeExercise,
  nextExercise,
  updateTimer,
  getFeedbackMessage,
  calculateFinalScore,
  getExerciseTypeName,
  distance,
  isOverTarget,
  isOverDropZone,
  DIFFICULTY_CONFIGS,
  DEFAULT_CONFIG,
  type Difficulty,
  type ExerciseType,
} from '../pinchPracticeLogic';

describe('PinchPractice Logic', () => {
  describe('generateExercises', () => {
    it('generates correct number of exercises', () => {
      const exercises = generateExercises(5, 'easy');
      expect(exercises.length).toBe(5);
    });

    it('generates exercises with different types', () => {
      const exercises = generateExercises(4, 'easy');
      const types = exercises.map((e) => e.type);
      expect(types).toContain('hold');
      expect(types).toContain('drag');
      expect(types).toContain('sort');
      expect(types).toContain('target');
    });

    it('assigns unique IDs to exercises', () => {
      const exercises = generateExercises(5, 'easy');
      const ids = exercises.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('generates targets for each exercise', () => {
      const exercises = generateExercises(3, 'easy');
      exercises.forEach((ex) => {
        expect(ex.targets.length).toBeGreaterThan(0);
      });
    });

    it('generates drop zones for drag and sort exercises', () => {
      const exercises = generateExercises(4, 'easy');
      const dragExercise = exercises.find((e) => e.type === 'drag');
      const sortExercise = exercises.find((e) => e.type === 'sort');
      
      expect(dragExercise?.dropZones).toBeDefined();
      expect(dragExercise?.dropZones?.length).toBeGreaterThan(0);
      expect(sortExercise?.dropZones).toBeDefined();
      expect(sortExercise?.dropZones?.length).toBeGreaterThan(0);
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

    it('has no held target initially', () => {
      const state = createInitialState();
      expect(state.heldTargetId).toBeNull();
    });

    it('uses default config when none provided', () => {
      const state = createInitialState();
      expect(state.totalExercises).toBe(DEFAULT_CONFIG.exercisesPerGame);
    });
  });

  describe('startGame', () => {
    it('sets status to playing', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.status).toBe('playing');
    });

    it('generates exercises', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.exercises.length).toBeGreaterThan(0);
    });

    it('sets current exercise index to 0', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.currentExerciseIndex).toBe(0);
    });

    it('sets time based on first exercise', () => {
      const state = createInitialState();
      const newState = startGame(state, 'easy');
      expect(newState.timeLeft).toBe(newState.exercises[0].timeLimit);
    });

    it('resets exercises completed count', () => {
      const state = { ...createInitialState(), exercisesCompleted: 3 };
      const newState = startGame(state, 'easy');
      expect(newState.exercisesCompleted).toBe(0);
    });
  });

  describe('distance', () => {
    it('calculates distance between two points', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(distance(a, b)).toBe(5);
    });

    it('returns 0 for same point', () => {
      const a = { x: 0.5, y: 0.5 };
      expect(distance(a, a)).toBe(0);
    });

    it('handles horizontal distance', () => {
      const a = { x: 0, y: 0.5 };
      const b = { x: 0.5, y: 0.5 };
      expect(distance(a, b)).toBe(0.5);
    });

    it('handles vertical distance', () => {
      const a = { x: 0.5, y: 0 };
      const b = { x: 0.5, y: 0.5 };
      expect(distance(a, b)).toBe(0.5);
    });
  });

  describe('isOverTarget', () => {
    it('returns true when cursor is within target radius', () => {
      const target = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        radius: 0.1,
        color: '#ff0000',
        held: false,
        holdProgress: 0,
      };
      const cursor = { x: 0.52, y: 0.52 };
      expect(isOverTarget(cursor, target)).toBe(true);
    });

    it('returns false when cursor is outside target radius', () => {
      const target = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        radius: 0.05,
        color: '#ff0000',
        held: false,
        holdProgress: 0,
      };
      const cursor = { x: 0.7, y: 0.7 };
      expect(isOverTarget(cursor, target)).toBe(false);
    });

    it('returns true when cursor is exactly at target center', () => {
      const target = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        radius: 0.1,
        color: '#ff0000',
        held: false,
        holdProgress: 0,
      };
      const cursor = { x: 0.5, y: 0.5 };
      expect(isOverTarget(cursor, target)).toBe(true);
    });
  });

  describe('isOverDropZone', () => {
    it('returns true when cursor is inside zone', () => {
      const zone = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        width: 0.2,
        height: 0.2,
        color: '#00ff00',
        label: 'Test',
        acceptedColors: ['#ff0000'],
      };
      const cursor = { x: 0.5, y: 0.5 };
      expect(isOverDropZone(cursor, zone)).toBe(true);
    });

    it('returns false when cursor is outside zone', () => {
      const zone = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        width: 0.1,
        height: 0.1,
        color: '#00ff00',
        label: 'Test',
        acceptedColors: ['#ff0000'],
      };
      const cursor = { x: 0.8, y: 0.8 };
      expect(isOverDropZone(cursor, zone)).toBe(false);
    });

    it('returns true when cursor is at zone edge', () => {
      const zone = {
        id: 'test',
        x: 0.5,
        y: 0.5,
        width: 0.2,
        height: 0.2,
        color: '#00ff00',
        label: 'Test',
        acceptedColors: ['#ff0000'],
      };
      const cursor = { x: 0.6, y: 0.5 }; // Right edge
      expect(isOverDropZone(cursor, zone)).toBe(true);
    });
  });

  describe('handlePinchStart', () => {
    it('grabs target when cursor is over it', () => {
      const state = startGame(createInitialState(), 'easy');
      const exercise = state.exercises[0];
      const target = exercise.targets[0];
      const cursor = { x: target.x, y: target.y };
      const timestamp = Date.now();
      
      const newState = handlePinchStart(state, cursor, timestamp);
      expect(newState.heldTargetId).toBe(target.id);
    });

    it('does not grab when cursor is not over any target', () => {
      const state = startGame(createInitialState(), 'easy');
      const cursor = { x: 0.99, y: 0.99 }; // Far from any target
      const timestamp = Date.now();
      
      const newState = handlePinchStart(state, cursor, timestamp);
      expect(newState.heldTargetId).toBeNull();
    });

    it('does not grab already held targets', () => {
      const state = startGame(createInitialState(), 'easy');
      const exercise = state.exercises[0];
      const target = exercise.targets[0];
      
      // Mark target as held
      const updatedExercises = [...state.exercises];
      updatedExercises[0] = {
        ...exercise,
        targets: [{ ...target, held: true }],
      };
      state.exercises = updatedExercises;
      
      const cursor = { x: target.x, y: target.y };
      const timestamp = Date.now();
      
      const newState = handlePinchStart(state, cursor, timestamp);
      expect(newState.heldTargetId).toBeNull();
    });

    it('sets pinch start time', () => {
      const state = startGame(createInitialState(), 'easy');
      const target = state.exercises[0].targets[0];
      const cursor = { x: target.x, y: target.y };
      const timestamp = 12345;
      
      const newState = handlePinchStart(state, cursor, timestamp);
      expect(newState.pinchStartTime).toBe(timestamp);
    });
  });

  describe('handlePinchHold', () => {
    it('updates target position for drag exercises', () => {
      const state = startGame(createInitialState(), 'easy');
      // Find a drag exercise
      const dragIndex = state.exercises.findIndex((e) => e.type === 'drag');
      if (dragIndex === -1) return; // Skip if no drag exercise
      
      state.currentExerciseIndex = dragIndex;
      const target = state.exercises[dragIndex].targets[0];
      state.heldTargetId = target.id;
      
      const newCursor = { x: 0.7, y: 0.7 };
      const newState = handlePinchHold(state, newCursor, Date.now());
      
      const updatedTarget = newState.exercises[dragIndex].targets[0];
      expect(updatedTarget.x).toBe(newCursor.x);
      expect(updatedTarget.y).toBe(newCursor.y);
      expect(updatedTarget.held).toBe(true);
    });

    it('updates hold progress for hold exercises', () => {
      const state = startGame(createInitialState(), 'easy');
      const holdIndex = state.exercises.findIndex((e) => e.type === 'hold');
      if (holdIndex === -1) return;
      
      state.currentExerciseIndex = holdIndex;
      const target = state.exercises[holdIndex].targets[0];
      state.heldTargetId = target.id;
      state.pinchStartTime = Date.now() - 1000; // 1 second ago
      
      const newState = handlePinchHold(state, { x: target.x, y: target.y }, Date.now());
      
      const updatedTarget = newState.exercises[holdIndex].targets[0];
      expect(updatedTarget.holdProgress).toBeGreaterThan(0);
      expect(updatedTarget.held).toBe(true);
    });

    it('does nothing when not holding a target', () => {
      const state = startGame(createInitialState(), 'easy');
      state.heldTargetId = null;
      
      const newState = handlePinchHold(state, { x: 0.5, y: 0.5 }, Date.now());
      expect(newState).toEqual(state);
    });
  });

  describe('handlePinchRelease', () => {
    it('completes hold exercise when held long enough', () => {
      const state = startGame(createInitialState(), 'easy');
      const holdIndex = state.exercises.findIndex((e) => e.type === 'hold');
      if (holdIndex === -1) return;
      
      state.currentExerciseIndex = holdIndex;
      const config = DIFFICULTY_CONFIGS.easy;
      const target = state.exercises[holdIndex].targets[0];
      state.heldTargetId = target.id;
      state.pinchStartTime = Date.now() - config.holdTime - 100; // Held long enough
      
      const { exerciseComplete } = handlePinchRelease(
        state,
        { x: target.x, y: target.y },
        Date.now()
      );
      
      expect(exerciseComplete).toBe(true);
    });

    it('completes drag exercise when dropped in zone', () => {
      const state = startGame(createInitialState(), 'easy');
      const dragIndex = state.exercises.findIndex((e) => e.type === 'drag');
      if (dragIndex === -1) return;
      
      state.currentExerciseIndex = dragIndex;
      const zone = state.exercises[dragIndex].dropZones![0];
      const target = state.exercises[dragIndex].targets[0];
      state.heldTargetId = target.id;
      
      const { exerciseComplete } = handlePinchRelease(
        state,
        { x: zone.x, y: zone.y },
        Date.now()
      );
      
      expect(exerciseComplete).toBe(true);
    });

    it('releases the target', () => {
      const state = startGame(createInitialState(), 'easy');
      const target = state.exercises[0].targets[0];
      state.heldTargetId = target.id;
      
      const { state: newState } = handlePinchRelease(
        state,
        { x: target.x, y: target.y },
        Date.now()
      );
      
      expect(newState.heldTargetId).toBeNull();
      expect(newState.pinchStartTime).toBeNull();
    });

    it('does nothing when not holding a target', () => {
      const state = startGame(createInitialState(), 'easy');
      state.heldTargetId = null;
      
      const { state: newState, exerciseComplete } = handlePinchRelease(
        state,
        { x: 0.5, y: 0.5 },
        Date.now()
      );
      
      expect(newState).toEqual(state);
      expect(exerciseComplete).toBe(false);
    });
  });

  describe('completeExercise', () => {
    it('increments streak on completion', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = completeExercise(state);
      expect(newState.streak).toBe(1);
    });

    it('adds points to score', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = completeExercise(state);
      expect(newState.score).toBeGreaterThan(0);
    });

    it('increments exercises completed', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = completeExercise(state);
      expect(newState.exercisesCompleted).toBe(1);
    });

    it('sets status to complete when all exercises done', () => {
      const state = startGame(createInitialState(), 'easy');
      state.exercisesCompleted = state.totalExercises - 1;
      const newState = completeExercise(state);
      expect(newState.status).toBe('complete');
    });

    it('sets status to exercise-complete when more exercises remain', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = completeExercise(state);
      expect(newState.status).toBe('exercise-complete');
    });

    it('moves to next exercise index', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = completeExercise(state);
      expect(newState.currentExerciseIndex).toBe(1);
    });
  });

  describe('nextExercise', () => {
    it('sets status back to playing', () => {
      const state = startGame(createInitialState(), 'easy');
      const completed = completeExercise(state);
      const next = nextExercise(completed);
      expect(next.status).toBe('playing');
    });

    it('does nothing if not in exercise-complete status', () => {
      const state = startGame(createInitialState(), 'easy');
      const next = nextExercise(state);
      expect(next.status).toBe('playing');
    });
  });

  describe('updateTimer', () => {
    it('decrements time when playing', () => {
      const state = startGame(createInitialState(), 'easy');
      const newState = updateTimer(state);
      expect(newState.timeLeft).toBe(state.timeLeft - 1);
    });

    it('resets streak when time runs out', () => {
      const state = startGame(createInitialState(), 'easy');
      state.streak = 5;
      state.timeLeft = 1;
      const newState = updateTimer(state);
      expect(newState.streak).toBe(0);
    });

    it('sets time to 0 when timer expires', () => {
      const state = startGame(createInitialState(), 'easy');
      state.timeLeft = 1;
      const newState = updateTimer(state);
      expect(newState.timeLeft).toBe(0);
    });

    it('does nothing when not playing', () => {
      const state = createInitialState();
      const newState = updateTimer(state);
      expect(newState.timeLeft).toBe(state.timeLeft);
    });
  });

  describe('getFeedbackMessage', () => {
    it('returns master message for streak >= 5', () => {
      const feedback = getFeedbackMessage(5);
      expect(feedback.message).toBe('Pinch Master!');
      expect(feedback.emoji).toBe('🔥');
    });

    it('returns great control for streak >= 3', () => {
      const feedback = getFeedbackMessage(3);
      expect(feedback.message).toBe('Great control!');
      expect(feedback.emoji).toBe('✨');
    });

    it('returns nice pinching for streak >= 2', () => {
      const feedback = getFeedbackMessage(2);
      expect(feedback.message).toBe('Nice pinching!');
      expect(feedback.emoji).toBe('👍');
    });

    it('returns basic praise for streak 1', () => {
      const feedback = getFeedbackMessage(1);
      expect(feedback.message).toBe('Good job!');
      expect(feedback.emoji).toBe('🎯');
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
        exercisesCompleted: 5,
        totalExercises: 5,
      };
      const result = calculateFinalScore(state);
      expect(result.accuracyBonus).toBe(200); // 100% accuracy
    });

    it('adds streak bonus', () => {
      const state = { ...createInitialState(), score: 100, streak: 3 };
      const result = calculateFinalScore(state);
      expect(result.streakBonus).toBe(45); // 3 * 15
    });

    it('caps streak bonus at 75', () => {
      const state = { ...createInitialState(), score: 100, streak: 10 };
      const result = calculateFinalScore(state);
      expect(result.streakBonus).toBe(75);
    });

    it('calculates total correctly', () => {
      const state = {
        ...createInitialState(),
        score: 100,
        exercisesCompleted: 3,
        totalExercises: 5,
        streak: 2,
      };
      const result = calculateFinalScore(state);
      const expectedTotal = 100 + 120 + 30; // base + accuracy(60%) + streak
      expect(result.total).toBe(expectedTotal);
    });
  });

  describe('getExerciseTypeName', () => {
    it('returns Hold for hold type', () => {
      expect(getExerciseTypeName('hold')).toBe('Hold');
    });

    it('returns Drag & Drop for drag type', () => {
      expect(getExerciseTypeName('drag')).toBe('Drag & Drop');
    });

    it('returns Color Sort for sort type', () => {
      expect(getExerciseTypeName('sort')).toBe('Color Sort');
    });

    it('returns Target Practice for target type', () => {
      expect(getExerciseTypeName('target')).toBe('Target Practice');
    });
  });

  describe('DIFFICULTY_CONFIGS', () => {
    it('has correct config for easy', () => {
      expect(DIFFICULTY_CONFIGS.easy.targetRadius).toBe(0.08);
      expect(DIFFICULTY_CONFIGS.easy.holdTime).toBe(2000);
    });

    it('has correct config for medium', () => {
      expect(DIFFICULTY_CONFIGS.medium.targetRadius).toBe(0.06);
      expect(DIFFICULTY_CONFIGS.medium.holdTime).toBe(3000);
    });

    it('has correct config for hard', () => {
      expect(DIFFICULTY_CONFIGS.hard.targetRadius).toBe(0.04);
      expect(DIFFICULTY_CONFIGS.hard.holdTime).toBe(4000);
    });

    it('has decreasing target radius with difficulty', () => {
      expect(DIFFICULTY_CONFIGS.easy.targetRadius)
        .toBeGreaterThan(DIFFICULTY_CONFIGS.medium.targetRadius);
      expect(DIFFICULTY_CONFIGS.medium.targetRadius)
        .toBeGreaterThan(DIFFICULTY_CONFIGS.hard.targetRadius);
    });

    it('has increasing hold time with difficulty', () => {
      expect(DIFFICULTY_CONFIGS.easy.holdTime)
        .toBeLessThan(DIFFICULTY_CONFIGS.medium.holdTime);
      expect(DIFFICULTY_CONFIGS.medium.holdTime)
        .toBeLessThan(DIFFICULTY_CONFIGS.hard.holdTime);
    });
  });
});
