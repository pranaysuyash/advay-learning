/**
 * Test suite for Shadow Puppet game logic
 * Game ID: shadow-puppet
 * Educational Focus: Fine motor skills, hand-eye coordination, creative expression
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PUPPET_SHAPES,
  LEVELS,
  PuppetShape,
  LevelConfig,
  getShapesForLevel,
  getLevelConfig,
  getRandomShape,
  speakShape,
} from '../shadowPuppetLogic';

describe('shadowPuppetLogic', () => {
  describe('PUPPET_SHAPES constant', () => {
    it('has 15 puppet shapes defined', () => {
      expect(PUPPET_SHAPES).toHaveLength(15);
    });

    it('has shapes with id, name, emoji, description, and difficulty', () => {
      PUPPET_SHAPES.forEach(shape => {
        expect(shape).toHaveProperty('id');
        expect(shape).toHaveProperty('name');
        expect(shape).toHaveProperty('emoji');
        expect(shape).toHaveProperty('description');
        expect(shape).toHaveProperty('difficulty');
        expect(typeof shape.id).toBe('string');
        expect(typeof shape.name).toBe('string');
        expect(typeof shape.emoji).toBe('string');
        expect(typeof shape.description).toBe('string');
        expect(typeof shape.difficulty).toBe('number');
      });
    });

    it('has difficulties in valid range (1-3)', () => {
      PUPPET_SHAPES.forEach(shape => {
        expect(shape.difficulty).toBeGreaterThanOrEqual(1);
        expect(shape.difficulty).toBeLessThanOrEqual(3);
      });
    });

    it('has unique shape IDs', () => {
      const ids = PUPPET_SHAPES.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has 5 shapes per difficulty level', () => {
      const easyShapes = PUPPET_SHAPES.filter(s => s.difficulty === 1);
      const mediumShapes = PUPPET_SHAPES.filter(s => s.difficulty === 2);
      const hardShapes = PUPPET_SHAPES.filter(s => s.difficulty === 3);

      expect(easyShapes).toHaveLength(5);
      expect(mediumShapes).toHaveLength(5);
      expect(hardShapes).toHaveLength(5);
    });

    it('has animal-themed shapes', () => {
      const animalIds = ['dog', 'cat', 'rabbit', 'bird', 'duck', 'wolf', 'bear', 'lion', 'eagle', 'monkey', 'butterfly', 'spider', 'scorpion', 'crab', 'octopus'];
      const actualIds = PUPPET_SHAPES.map(s => s.id);
      animalIds.forEach(id => {
        expect(actualIds).toContain(id);
      });
    });

    it('has emojis for all shapes', () => {
      PUPPET_SHAPES.forEach(shape => {
        expect(shape.emoji).toBeTruthy();
        expect(shape.emoji.length).toBeGreaterThan(0);
      });
    });
  });

  describe('LEVELS constant', () => {
    it('has 3 levels defined', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('has progressive shapes per round', () => {
      expect(LEVELS[0].shapesPerRound).toBe(4);
      expect(LEVELS[1].shapesPerRound).toBe(6);
      expect(LEVELS[2].shapesPerRound).toBe(8);
    });

    it('has decreasing time per shape', () => {
      expect(LEVELS[0].timePerShape).toBe(15);
      expect(LEVELS[1].timePerShape).toBe(12);
      expect(LEVELS[2].timePerShape).toBe(10);
    });

    it('has increasing pass thresholds', () => {
      expect(LEVELS[0].passThreshold).toBe(3);
      expect(LEVELS[1].passThreshold).toBe(4);
      expect(LEVELS[2].passThreshold).toBe(6);
    });
  });

  describe('getShapesForLevel', () => {
    it('returns only difficulty 1 shapes for level 1', () => {
      const shapes = getShapesForLevel(1);
      expect(shapes).toHaveLength(5);
      shapes.forEach(shape => {
        expect(shape.difficulty).toBeLessThanOrEqual(1);
      });
    });

    it('returns difficulty 1-2 shapes for level 2', () => {
      const shapes = getShapesForLevel(2);
      expect(shapes).toHaveLength(10);
      shapes.forEach(shape => {
        expect(shape.difficulty).toBeLessThanOrEqual(2);
      });
    });

    it('returns all shapes for level 3', () => {
      const shapes = getShapesForLevel(3);
      expect(shapes).toHaveLength(15);
    });

    it('returns shapes with all required properties', () => {
      const shapes = getShapesForLevel(1);
      shapes.forEach(shape => {
        expect(shape).toHaveProperty('id');
        expect(shape).toHaveProperty('name');
        expect(shape).toHaveProperty('emoji');
        expect(shape).toHaveProperty('description');
        expect(shape).toHaveProperty('difficulty');
      });
    });
  });

  describe('getLevelConfig', () => {
    it('returns level 1 config for level 1', () => {
      const config = getLevelConfig(1);
      expect(config.level).toBe(1);
      expect(config.shapesPerRound).toBe(4);
      expect(config.timePerShape).toBe(15);
      expect(config.passThreshold).toBe(3);
    });

    it('returns level 2 config for level 2', () => {
      const config = getLevelConfig(2);
      expect(config.level).toBe(2);
      expect(config.shapesPerRound).toBe(6);
      expect(config.timePerShape).toBe(12);
      expect(config.passThreshold).toBe(4);
    });

    it('returns level 3 config for level 3', () => {
      const config = getLevelConfig(3);
      expect(config.level).toBe(3);
      expect(config.shapesPerRound).toBe(8);
      expect(config.timePerShape).toBe(10);
      expect(config.passThreshold).toBe(6);
    });

    it('falls back to level 1 for invalid levels', () => {
      const config = getLevelConfig(99);
      expect(config.level).toBe(1);
    });

    it('falls back to level 1 for level 0', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });

    it('falls back to level 1 for negative levels', () => {
      const config = getLevelConfig(-1);
      expect(config.level).toBe(1);
    });
  });

  describe('getRandomShape', () => {
    it('returns a shape for level 1', () => {
      const shape = getRandomShape(1);
      expect(PUPPET_SHAPES.map(s => s.id)).toContain(shape.id);
      expect(shape.difficulty).toBeLessThanOrEqual(1);
    });

    it('returns a shape for level 2', () => {
      const shape = getRandomShape(2);
      expect(PUPPET_SHAPES.map(s => s.id)).toContain(shape.id);
      expect(shape.difficulty).toBeLessThanOrEqual(2);
    });

    it('returns a shape for level 3', () => {
      const shape = getRandomShape(3);
      expect(PUPPET_SHAPES.map(s => s.id)).toContain(shape.id);
    });

    it('returns a shape with all properties', () => {
      const shape = getRandomShape(1);
      expect(shape).toHaveProperty('id');
      expect(shape).toHaveProperty('name');
      expect(shape).toHaveProperty('emoji');
      expect(shape).toHaveProperty('description');
      expect(shape).toHaveProperty('difficulty');
    });

    it('avoids used shapes when available', () => {
      const shape1 = getRandomShape(1);
      const shape2 = getRandomShape(1, [shape1.id]);
      // With only 5 shapes at level 1, there's a good chance we get different ones
      expect(shape2.id).not.toBe(shape1.id);
    });

    it('can handle all shapes being used', () => {
      // Use all level 1 shapes
      const level1Shapes = getShapesForLevel(1);
      const allIds = level1Shapes.map(s => s.id);

      const shape = getRandomShape(1, allIds);
      // Should still return a shape (falls back to full pool)
      expect(shape).toBeDefined();
      expect(level1Shapes.map(s => s.id)).toContain(shape.id);
    });

    it('handles empty usedShapes array', () => {
      const shape = getRandomShape(1, []);
      expect(shape).toBeDefined();
    });

    it('respects difficulty filtering', () => {
      const shape = getRandomShape(1);
      expect(shape.difficulty).toBe(1);
    });
  });

  describe('speakShape', () => {
    it('handles speech synthesis gracefully', () => {
      const mockSpeak = vi.fn();
      const originalSpeech = window.speechSynthesis;

      Object.defineProperty(window, 'speechSynthesis', {
        value: { speak: mockSpeak },
        writable: true,
        configurable: true,
      });

      const shape = PUPPET_SHAPES[0];
      expect(() => speakShape(shape)).not.toThrow();

      Object.defineProperty(window, 'speechSynthesis', {
        value: originalSpeech,
        writable: true,
        configurable: true,
      });
    });

    it('does not throw when speech synthesis is unavailable', () => {
      const originalSpeech = (window as any).speechSynthesis;
      delete (window as any).speechSynthesis;

      const shape = PUPPET_SHAPES[0];
      expect(() => speakShape(shape)).not.toThrow();

      (window as any).speechSynthesis = originalSpeech;
    });

    it('has pronounceable shape names', () => {
      PUPPET_SHAPES.forEach(shape => {
        expect(shape.name).toMatch(/^[a-zA-Z\s]+$/);
        expect(shape.name.length).toBeGreaterThan(0);
      });
    });

    it('has descriptions for speech synthesis', () => {
      PUPPET_SHAPES.forEach(shape => {
        expect(shape.description).toBeTruthy();
        expect(shape.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles getting shape with very large level', () => {
      const shape = getRandomShape(999);
      expect(shape).toBeDefined();
    });

    it('handles getting config for edge level values', () => {
      const config0 = getLevelConfig(0);
      const configNeg = getLevelConfig(-1);
      const configLarge = getLevelConfig(1000);

      expect(config0.level).toBe(1);
      expect(configNeg.level).toBe(1);
      expect(configLarge.level).toBe(1);
    });

    it('handles shapesPerRound vs available shapes', () => {
      const level1Config = getLevelConfig(1);
      const level1Shapes = getShapesForLevel(1);
      expect(level1Config.shapesPerRound).toBeLessThanOrEqual(level1Shapes.length);
    });

    it('has appropriate time limits for toddlers', () => {
      expect(LEVELS[0].timePerShape).toBe(15); // 15 seconds
      expect(LEVELS[2].timePerShape).toBe(10); // 10 seconds
    });

    it('pass thresholds are achievable', () => {
      LEVELS.forEach(config => {
        expect(config.passThreshold).toBeLessThanOrEqual(config.shapesPerRound);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('can get level-appropriate shapes for all levels', () => {
      const shapes1 = getShapesForLevel(1);
      const shapes2 = getShapesForLevel(2);
      const shapes3 = getShapesForLevel(3);

      expect(shapes1.length).toBeLessThan(shapes2.length);
      expect(shapes2.length).toBeLessThan(shapes3.length);
    });

    it('can select random shapes avoiding repeats', () => {
      const used: string[] = [];
      const shapes: PuppetShape[] = [];

      for (let i = 0; i < 5; i++) {
        const shape = getRandomShape(1, used);
        used.push(shape.id);
        shapes.push(shape);
      }

      // Should have 5 unique shapes
      const uniqueIds = new Set(shapes.map(s => s.id));
      expect(uniqueIds.size).toBe(5);
    });

    it('can complete full level progression', () => {
      const configs = [1, 2, 3].map(l => getLevelConfig(l));

      expect(configs[0].shapesPerRound).toBe(4);
      expect(configs[1].shapesPerRound).toBe(6);
      expect(configs[2].shapesPerRound).toBe(8);

      // Time decreases as difficulty increases
      expect(configs[0].timePerShape).toBeGreaterThan(configs[1].timePerShape);
      expect(configs[1].timePerShape).toBeGreaterThan(configs[2].timePerShape);
    });

    it('all difficulty 1 shapes are simple animals', () => {
      const easyShapes = getShapesForLevel(1);
      const expectedAnimals = ['dog', 'cat', 'rabbit', 'bird', 'duck'];
      const actualIds = easyShapes.map(s => s.id);

      expectedAnimals.forEach(id => {
        expect(actualIds).toContain(id);
      });
    });
  });

  describe('Type Definitions', () => {
    it('PuppetShape interface is correctly implemented', () => {
      const shape = PUPPET_SHAPES[0];
      expect(typeof shape.id).toBe('string');
      expect(typeof shape.name).toBe('string');
      expect(typeof shape.emoji).toBe('string');
      expect(typeof shape.description).toBe('string');
      expect(typeof shape.difficulty).toBe('number');
      expect(shape.fingerPattern).toBeUndefined(); // Optional property
    });

    it('LevelConfig interface is correctly implemented', () => {
      const config = getLevelConfig(1);
      expect(typeof config.level).toBe('number');
      expect(typeof config.shapesPerRound).toBe('number');
      expect(typeof config.timePerShape).toBe('number');
      expect(typeof config.passThreshold).toBe('number');
    });
  });

  describe('Educational Design', () => {
    it('has encouraging descriptions', () => {
      PUPPET_SHAPES.forEach(shape => {
        expect(shape.description).toBeTruthy();
        expect(shape.description.length).toBeGreaterThan(5);
      });
    });

    it('uses visual emojis for toddlers', () => {
      PUPPET_SHAPES.forEach(shape => {
        expect(shape.emoji.match(/\p{Emoji}/u)).toBeTruthy();
      });
    });

    it('progresses from simple to complex shapes', () => {
      const level1 = getShapesForLevel(1);
      const level3 = getShapesForLevel(3);

      // Level 1 should have simpler animals
      expect(level1.some(s => s.id === 'dog')).toBe(true);
      expect(level1.some(s => s.id === 'cat')).toBe(true);

      // Level 3 includes complex creatures
      expect(level3.some(s => s.id === 'octopus')).toBe(true);
      expect(level3.some(s => s.id === 'butterfly')).toBe(true);
    });

    it('time limits are age-appropriate', () => {
      // 10-15 seconds is reasonable for toddlers
      LEVELS.forEach(config => {
        expect(config.timePerShape).toBeGreaterThanOrEqual(10);
        expect(config.timePerShape).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('Difficulty Progression', () => {
    it('level 1 is easiest', () => {
      const config = getLevelConfig(1);
      const shapes = getShapesForLevel(1);

      expect(config.shapesPerRound).toBe(4);
      expect(config.timePerShape).toBe(15);
      expect(shapes.length).toBe(5);
    });

    it('level 3 is hardest', () => {
      const config = getLevelConfig(3);
      const shapes = getShapesForLevel(3);

      expect(config.shapesPerRound).toBe(8);
      expect(config.timePerShape).toBe(10);
      expect(shapes.length).toBe(15);
    });

    it('pass thresholds scale with difficulty', () => {
      expect(LEVELS[0].passThreshold / LEVELS[0].shapesPerRound).toBe(0.75); // 3/4 = 75%
      expect(LEVELS[1].passThreshold / LEVELS[1].shapesPerRound).toBeCloseTo(0.67); // 4/6 ≈ 67%
      expect(LEVELS[2].passThreshold / LEVELS[2].shapesPerRound).toBe(0.75); // 6/8 = 75%
    });
  });
});
