/**
 * Plant a Garden Logic Tests
 *
 * Tests for the gardening sequence game logic.
 */

import { describe, it, expect } from 'vitest';
import {
  PLANTS,
  GARDEN_STEPS,
  createInitialState,
  getRandomPlant,
  getCurrentStage,
  calculateScore,
  calculateStars,
  type Plant,
  type GardenStage,
  type GameState,
  type PlantType,
  type GardenStep,
} from '../plantGardenLogic';

describe('Constants', () => {
  it('should have 8 plants defined', () => {
    expect(PLANTS.length).toBe(8);
  });

  it('should have 3 flowers', () => {
    const flowers = PLANTS.filter(p => p.type === 'flower');
    expect(flowers.length).toBe(3);
  });

  it('should have 2 vegetables', () => {
    const vegetables = PLANTS.filter(p => p.type === 'vegetable');
    expect(vegetables.length).toBe(3);
  });

  it('should have 2 fruits', () => {
    const fruits = PLANTS.filter(p => p.type === 'fruit');
    expect(fruits.length).toBe(2);
  });

  it('should have 4 garden stages', () => {
    expect(GARDEN_STEPS.length).toBe(4);
  });

  it('should have stages in correct order', () => {
    expect(GARDEN_STEPS[0].step).toBe('dig');
    expect(GARDEN_STEPS[1].step).toBe('plant');
    expect(GARDEN_STEPS[2].step).toBe('water');
    expect(GARDEN_STEPS[3].step).toBe('grow');
  });
});

describe('createInitialState', () => {
  it('should create initial state with no plant', () => {
    const state = createInitialState();
    expect(state.currentPlant).toBeNull();
  });

  it('should start at step 0', () => {
    const state = createInitialState();
    expect(state.currentStep).toBe(0);
  });

  it('should start with zero completed stages', () => {
    const state = createInitialState();
    expect(state.completedStages).toBe(0);
  });

  it('should start with zero score', () => {
    const state = createInitialState();
    expect(state.score).toBe(0);
  });

  it('should start not complete', () => {
    const state = createInitialState();
    expect(state.isComplete).toBe(false);
  });

  it('should start not playing', () => {
    const state = createInitialState();
    expect(state.isPlaying).toBe(false);
  });
});

describe('getRandomPlant', () => {
  it('should return a plant from PLANTS array', () => {
    const plant = getRandomPlant();
    expect(PLANTS).toContain(plant);
  });

  it('should return plant with all required properties', () => {
    const plant = getRandomPlant();
    expect(plant.id).toBeTruthy();
    expect(plant.emoji).toBeTruthy();
    expect(plant.name).toBeTruthy();
    expect(['flower', 'vegetable', 'fruit']).toContain(plant.type);
    expect(plant.color).toBeTruthy();
  });

  it('should eventually return all plants given enough calls', () => {
    const returned = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const plant = getRandomPlant();
      returned.add(plant.id);
    }
    // All 8 plants should eventually be returned
    expect(returned.size).toBe(8);
  });
});

describe('getCurrentStage', () => {
  it('should return dig stage for step 0', () => {
    const stage = getCurrentStage(0);
    expect(stage.step).toBe('dig');
    expect(stage.emoji).toBe('⛏️');
  });

  it('should return plant stage for step 1', () => {
    const stage = getCurrentStage(1);
    expect(stage.step).toBe('plant');
    expect(stage.emoji).toBe('🌱');
  });

  it('should return water stage for step 2', () => {
    const stage = getCurrentStage(2);
    expect(stage.step).toBe('water');
    expect(stage.emoji).toBe('💧');
  });

  it('should return grow stage for step 3', () => {
    const stage = getCurrentStage(3);
    expect(stage.step).toBe('grow');
    expect(stage.emoji).toBe('🌿');
  });

  it('should return grow stage for steps beyond array bounds', () => {
    const stage = getCurrentStage(100);
    expect(stage.step).toBe('grow');
  });

  it('should return last stage for step equal to length', () => {
    const stage = getCurrentStage(4);
    expect(stage.step).toBe('grow');
  });
});

describe('calculateScore', () => {
  it('should give base score of 100', () => {
    expect(calculateScore(0)).toBe(100);
  });

  it('should add 25 points per step', () => {
    expect(calculateScore(1)).toBe(125); // 100 + 25
    expect(calculateScore(2)).toBe(150); // 100 + 50
    expect(calculateScore(3)).toBe(175); // 100 + 75
    expect(calculateScore(4)).toBe(200); // 100 + 100
  });

  it('should scale linearly with steps', () => {
    const score1 = calculateScore(1);
    const score2 = calculateScore(2);
    expect(score2 - score1).toBe(25);
  });
});

describe('calculateStars', () => {
  it('should return 5 stars for score >= 200', () => {
    expect(calculateStars(200)).toBe(5);
    expect(calculateStars(250)).toBe(5);
  });

  it('should return 4 stars for score >= 175', () => {
    expect(calculateStars(175)).toBe(4);
    expect(calculateStars(180)).toBe(4);
    expect(calculateStars(194)).toBe(4);
  });

  it('should return 3 stars for score >= 150', () => {
    expect(calculateStars(150)).toBe(3);
    expect(calculateStars(160)).toBe(3);
    expect(calculateStars(174)).toBe(3);
  });

  it('should return 2 stars for score >= 125', () => {
    expect(calculateStars(125)).toBe(2);
    expect(calculateStars(130)).toBe(2);
    expect(calculateStars(149)).toBe(2);
  });

  it('should return 1 star for score < 125', () => {
    expect(calculateStars(100)).toBe(1);
    expect(calculateStars(120)).toBe(1);
    expect(calculateStars(0)).toBe(1);
  });
});

describe('Type Safety', () => {
  it('should accept Plant type', () => {
    const plant: Plant = {
      id: 'test',
      emoji: '🌻',
      name: 'Test Plant',
      type: 'flower',
      color: '#FFD700',
    };
    expect(plant.type).toBe('flower');
  });

  it('should accept GardenStage type', () => {
    const stage: GardenStage = {
      step: 'dig',
      emoji: '⛏️',
      instruction: 'Dig a hole!',
    };
    expect(stage.step).toBe('dig');
  });

  it('should accept GameState type', () => {
    const state: GameState = {
      currentPlant: null,
      currentStep: 0,
      completedStages: 0,
      score: 0,
      isComplete: false,
      isPlaying: false,
    };
    expect(typeof state.currentStep).toBe('number');
  });

  it('should accept PlantType type', () => {
    const type: PlantType = 'vegetable';
    expect(['flower', 'vegetable', 'fruit']).toContain(type);
  });

  it('should accept GardenStep type', () => {
    const step: GardenStep = 'water';
    expect(['dig', 'plant', 'water', 'grow']).toContain(step);
  });
});

describe('Integration - Game Flow', () => {
  it('should simulate complete game cycle', () => {
    let state = createInitialState();
    state.isPlaying = true;
    state.currentPlant = PLANTS[0];

    // Simulate completing all 4 steps
    for (let i = 0; i < 4; i++) {
      state.currentStep = i;
      state.completedStages = i + 1;
    }

    state.score = calculateScore(state.completedStages);
    state.stars = calculateStars(state.score);
    state.isComplete = state.completedStages >= 4;

    expect(state.isComplete).toBe(true);
    expect(state.score).toBe(200);
    expect(state.stars).toBe(5);
  });

  it('should track progress through stages', () => {
    const plant = PLANTS[0];

    // Step 0: Dig
    let stage0 = getCurrentStage(0);
    expect(stage0.step).toBe('dig');
    expect(stage0.instruction).toBeTruthy();

    // Step 1: Plant
    let stage1 = getCurrentStage(1);
    expect(stage1.step).toBe('plant');
    expect(stage1.instruction).toBeTruthy();

    // Step 2: Water
    let stage2 = getCurrentStage(2);
    expect(stage2.step).toBe('water');
    expect(stage2.instruction).toBeTruthy();

    // Step 3: Grow
    let stage3 = getCurrentStage(3);
    expect(stage3.step).toBe('grow');
    expect(stage3.instruction).toBeTruthy();
  });
});
