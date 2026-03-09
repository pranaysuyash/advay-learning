/**
 * Test suite for Rainbow Bridge game logic
 * Game ID: rainbow-bridge
 * Educational Focus: Number recognition, sequencing, fine motor skills
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  Dot,
  LevelConfig,
  RAINBOW_COLORS,
  LEVELS,
  getLevelConfig,
  createGame,
  checkDotClick,
  isGameComplete,
  calculateScore,
} from '../rainbowBridgeLogic';

describe('rainbowBridgeLogic', () => {
  describe('RAINBOW_COLORS constant', () => {
    it('has 7 colors', () => {
      expect(RAINBOW_COLORS).toHaveLength(7);
    });

    it('contains standard rainbow colors in order', () => {
      expect(RAINBOW_COLORS[0]).toBe('#FF0000'); // Red
      expect(RAINBOW_COLORS[1]).toBe('#FF7F00'); // Orange
      expect(RAINBOW_COLORS[2]).toBe('#FFFF00'); // Yellow
      expect(RAINBOW_COLORS[3]).toBe('#00FF00'); // Green
      expect(RAINBOW_COLORS[4]).toBe('#0000FF'); // Blue
      expect(RAINBOW_COLORS[5]).toBe('#4B0082'); // Indigo
      expect(RAINBOW_COLORS[6]).toBe('#9400D3'); // Violet
    });

    it('all colors are hex strings', () => {
      for (const color of RAINBOW_COLORS) {
        expect(typeof color).toBe('string');
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  describe('LEVELS constant', () => {
    it('has 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('level 1 has 5 dots and radius 35', () => {
      expect(LEVELS[0].level).toBe(1);
      expect(LEVELS[0].dotCount).toBe(5);
      expect(LEVELS[0].arcRadius).toBe(35);
    });

    it('level 2 has 7 dots and radius 30', () => {
      expect(LEVELS[1].level).toBe(2);
      expect(LEVELS[1].dotCount).toBe(7);
      expect(LEVELS[1].arcRadius).toBe(30);
    });

    it('level 3 has 10 dots and radius 25', () => {
      expect(LEVELS[2].level).toBe(3);
      expect(LEVELS[2].dotCount).toBe(10);
      expect(LEVELS[2].arcRadius).toBe(25);
    });

    it('dotCount increases across levels', () => {
      expect(LEVELS[0].dotCount).toBeLessThan(LEVELS[1].dotCount);
      expect(LEVELS[1].dotCount).toBeLessThan(LEVELS[2].dotCount);
    });

    it('arcRadius decreases across levels', () => {
      expect(LEVELS[0].arcRadius).toBeGreaterThan(LEVELS[1].arcRadius);
      expect(LEVELS[1].arcRadius).toBeGreaterThan(LEVELS[2].arcRadius);
    });
  });

  describe('getLevelConfig', () => {
    it('returns level 1 config for level 1', () => {
      const config = getLevelConfig(1);
      expect(config.level).toBe(1);
      expect(config.dotCount).toBe(5);
      expect(config.arcRadius).toBe(35);
    });

    it('returns level 2 config for level 2', () => {
      const config = getLevelConfig(2);
      expect(config.level).toBe(2);
      expect(config.dotCount).toBe(7);
      expect(config.arcRadius).toBe(30);
    });

    it('returns level 3 config for level 3', () => {
      const config = getLevelConfig(3);
      expect(config.level).toBe(3);
      expect(config.dotCount).toBe(10);
      expect(config.arcRadius).toBe(25);
    });

    it('returns level 1 for invalid level', () => {
      const config = getLevelConfig(999);
      expect(config.level).toBe(1);
    });

    it('returns level 1 for zero level', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });

    it('returns level 1 for negative level', () => {
      const config = getLevelConfig(-1);
      expect(config.level).toBe(1);
    });
  });

  describe('createGame', () => {
    it('creates game with dots and config', () => {
      const game = createGame(1);
      expect(game.dots).toBeDefined();
      expect(game.config).toBeDefined();
      expect(game.config.level).toBe(1);
    });

    it('creates correct number of dots for level 1', () => {
      const game = createGame(1);
      expect(game.dots).toHaveLength(5);
    });

    it('creates correct number of dots for level 2', () => {
      const game = createGame(2);
      expect(game.dots).toHaveLength(7);
    });

    it('creates correct number of dots for level 3', () => {
      const game = createGame(3);
      expect(game.dots).toHaveLength(10);
    });

    it('all dots start unconnected', () => {
      const game = createGame(1);
      expect(game.dots.every(d => !d.connected)).toBe(true);
    });

    it('dots have sequential numbers starting from 1', () => {
      const game = createGame(1);
      for (let i = 0; i < game.dots.length; i++) {
        expect(game.dots[i].number).toBe(i + 1);
      }
    });

    it('dots have sequential ids', () => {
      const game = createGame(1);
      for (let i = 0; i < game.dots.length; i++) {
        expect(game.dots[i].id).toBe(i);
      }
    });

    it('dots have x and y coordinates', () => {
      const game = createGame(1);
      for (const dot of game.dots) {
        expect(typeof dot.x).toBe('number');
        expect(typeof dot.y).toBe('number');
      }
    });

    it('returns correct config for each level', () => {
      const game1 = createGame(1);
      const game2 = createGame(2);
      const game3 = createGame(3);

      expect(game1.config.dotCount).toBe(5);
      expect(game2.config.dotCount).toBe(7);
      expect(game3.config.dotCount).toBe(10);
    });
  });

  describe('checkDotClick', () => {
    it('returns success when clicking correct dot', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result = checkDotClick(50, 50, dots, 0);
      expect(result.success).toBe(true);
      expect(result.nextIndex).toBe(1);
    });

    it('returns failure when clicking wrong position', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result = checkDotClick(100, 100, dots, 0);
      expect(result.success).toBe(false);
      expect(result.nextIndex).toBe(0);
    });

    it('uses default tolerance of 5', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result1 = checkDotClick(55, 50, dots, 0);
      expect(result1.success).toBe(true);
      const result2 = checkDotClick(56, 50, dots, 0);
      expect(result2.success).toBe(false);
    });

    it('respects custom tolerance', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result = checkDotClick(60, 50, dots, 0, 10);
      expect(result.success).toBe(true);
    });

    it('returns failure when currentIndex is out of bounds', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result = checkDotClick(50, 50, dots, 5);
      expect(result.success).toBe(false);
      expect(result.nextIndex).toBe(5);
    });

    it('checks against correct dot by index', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
        { id: 1, x: 100, y: 100, connected: false, number: 2 },
      ];
      const result = checkDotClick(50, 50, dots, 1);
      expect(result.success).toBe(false);
      expect(result.nextIndex).toBe(1);
    });

    it('advances to next dot on success', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
        { id: 1, x: 100, y: 100, connected: false, number: 2 },
      ];
      const result = checkDotClick(50, 50, dots, 0);
      expect(result.nextIndex).toBe(1);
    });

    it('calculates distance correctly using Pythagorean theorem', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      // Distance: sqrt(3^2 + 4^2) = 5, at tolerance boundary
      const result = checkDotClick(53, 54, dots, 0, 5);
      expect(result.success).toBe(true);
    });

    it('handles clicks within tolerance in y direction', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result = checkDotClick(50, 55, dots, 0);
      expect(result.success).toBe(true);
    });

    it('handles clicks on diagonal edge of tolerance', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      // Distance ~3.5 from center
      const result = checkDotClick(53, 53, dots, 0);
      expect(result.success).toBe(true);
    });
  });

  describe('isGameComplete', () => {
    it('returns false when no dots are connected', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
        { id: 1, x: 100, y: 100, connected: false, number: 2 },
      ];
      expect(isGameComplete(dots)).toBe(false);
    });

    it('returns false when some dots are connected', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: true, number: 1 },
        { id: 1, x: 100, y: 100, connected: false, number: 2 },
      ];
      expect(isGameComplete(dots)).toBe(false);
    });

    it('returns true when all dots are connected', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: true, number: 1 },
        { id: 1, x: 100, y: 100, connected: true, number: 2 },
      ];
      expect(isGameComplete(dots)).toBe(true);
    });

    it('handles single dot game', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: true, number: 1 },
      ];
      expect(isGameComplete(dots)).toBe(true);
    });

    it('handles empty dots array', () => {
      const dots: Dot[] = [];
      expect(isGameComplete(dots)).toBe(true);
    });

    it('returns false when only last dot is unconnected', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: true, number: 1 },
        { id: 1, x: 100, y: 50, connected: true, number: 2 },
        { id: 2, x: 150, y: 50, connected: false, number: 3 },
      ];
      expect(isGameComplete(dots)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('calculates base score for level 1', () => {
      const score = calculateScore(0, 1);
      expect(score).toBe(100);
    });

    it('calculates base score for level 2', () => {
      const score = calculateScore(0, 2);
      expect(score).toBe(200);
    });

    it('calculates base score for level 3', () => {
      const score = calculateScore(0, 3);
      expect(score).toBe(300);
    });

    it('adds time bonus', () => {
      const score1 = calculateScore(5, 1);
      const score2 = calculateScore(10, 1);
      expect(score1).toBe(150);
      expect(score2).toBe(200);
    });

    it('combines level and time bonus', () => {
      const score = calculateScore(15, 2);
      expect(score).toBe(350);
    });

    it('handles zero time remaining', () => {
      const score = calculateScore(0, 2);
      expect(score).toBe(200);
    });

    it('score increases with level for same time', () => {
      const score1 = calculateScore(10, 1);
      const score2 = calculateScore(10, 2);
      const score3 = calculateScore(10, 3);
      expect(score1).toBeLessThan(score2);
      expect(score2).toBeLessThan(score3);
    });

    it('score increases with time for same level', () => {
      const score1 = calculateScore(5, 1);
      const score2 = calculateScore(15, 1);
      expect(score1).toBeLessThan(score2);
    });
  });

  describe('integration scenarios', () => {
    it('can complete a full level 1 game', () => {
      const game = createGame(1);
      let currentIndex = 0;

      for (const dot of game.dots) {
        const result = checkDotClick(dot.x, dot.y, game.dots, currentIndex);
        expect(result.success).toBe(true);
        currentIndex = result.nextIndex;
        game.dots[dot.id].connected = true;
      }

      expect(isGameComplete(game.dots)).toBe(true);
    });

    it('can complete a full level 3 game', () => {
      const game = createGame(3);
      let currentIndex = 0;

      for (const dot of game.dots) {
        const result = checkDotClick(dot.x, dot.y, game.dots, currentIndex);
        expect(result.success).toBe(true);
        currentIndex = result.nextIndex;
        game.dots[dot.id].connected = true;
      }

      expect(isGameComplete(game.dots)).toBe(true);
    });

    it('fails when clicking wrong dot', () => {
      const game = createGame(1);

      if (game.dots.length > 1) {
        const result = checkDotClick(
          game.dots[1].x,
          game.dots[1].y,
          game.dots,
          0
        );
        expect(result.success).toBe(false);
        expect(result.nextIndex).toBe(0);
      }
    });

    it('handles clicking dots in sequence', () => {
      const game = createGame(2);
      let currentIndex = 0;

      for (let i = 0; i < game.dots.length; i++) {
        const dot = game.dots[i];
        const result = checkDotClick(dot.x, dot.y, game.dots, currentIndex);
        expect(result.success).toBe(true);
        currentIndex = result.nextIndex;
      }

      expect(currentIndex).toBe(game.dots.length);
    });
  });

  describe('edge cases', () => {
    it('handles single dot', () => {
      const singleDot: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result = checkDotClick(50, 50, singleDot, 0);
      expect(result.success).toBe(true);
      expect(result.nextIndex).toBe(1);
    });

    it('handles negative tolerance gracefully', () => {
      const dots: Dot[] = [
        { id: 0, x: 50, y: 50, connected: false, number: 1 },
      ];
      const result = checkDotClick(50, 50, dots, 0, -5);
      expect(result).toBeDefined();
    });

    it('handles very large time values', () => {
      const score = calculateScore(9999, 1);
      expect(score).toBe(100 + 99990);
    });

    it('handles fractional time values', () => {
      const score = calculateScore(5.5, 1);
      expect(score).toBeCloseTo(155, 0);
    });

    it('handles clicking same dot twice', () => {
      const game = createGame(1);
      game.dots[0].connected = true;

      const result = checkDotClick(game.dots[0].x, game.dots[0].y, game.dots, 1);
      // Should check dot at index 1, not 0
      expect(result).toBeDefined();
    });
  });

  describe('type definitions', () => {
    it('Dot interface is correctly implemented', () => {
      const dot: Dot = {
        id: 1,
        x: 50,
        y: 50,
        connected: false,
        number: 5,
      };
      expect(typeof dot.id).toBe('number');
      expect(typeof dot.x).toBe('number');
      expect(typeof dot.y).toBe('number');
      expect(typeof dot.connected).toBe('boolean');
      expect(typeof dot.number).toBe('number');
    });

    it('LevelConfig interface is correctly implemented', () => {
      const config: LevelConfig = {
        level: 2,
        dotCount: 7,
        arcRadius: 30,
      };
      expect(typeof config.level).toBe('number');
      expect(typeof config.dotCount).toBe('number');
      expect(typeof config.arcRadius).toBe('number');
    });
  });

  describe('arc generation', () => {
    it('generates dots in arc pattern', () => {
      const game = createGame(1);
      expect(game.dots[0].x).toBeLessThan(50);
      expect(game.dots[game.dots.length - 1].x).toBeGreaterThan(50);
    });

    it('all dots are within reasonable bounds', () => {
      const game = createGame(1);
      for (const dot of game.dots) {
        expect(dot.x).toBeGreaterThan(0);
        expect(dot.x).toBeLessThan(100);
        expect(dot.y).toBeGreaterThan(0);
        expect(dot.y).toBeLessThan(100);
      }
    });

    it('dots are ordered from left to right', () => {
      const game = createGame(1);
      const xCoords = game.dots.map(d => d.x);
      for (let i = 1; i < xCoords.length; i++) {
        expect(xCoords[i]).toBeGreaterThan(xCoords[i - 1]);
      }
    });

    it('first dot is at left edge of arc', () => {
      const game = createGame(1);
      const centerX = 50;
      const radius = 35;
      // At angle PI, x = center - radius
      expect(game.dots[0].x).toBeCloseTo(centerX - radius, 0);
    });

    it('last dot is at right edge of arc', () => {
      const game = createGame(1);
      const centerX = 50;
      const radius = 35;
      // At angle 0, x = center + radius
      expect(game.dots[game.dots.length - 1].x).toBeCloseTo(centerX + radius, 0);
    });
  });

  describe('difficulty progression', () => {
    it('level 1 is easiest', () => {
      const config = getLevelConfig(1);
      expect(config.dotCount).toBe(5);
      expect(config.arcRadius).toBe(35);
    });

    it('level 3 is hardest', () => {
      const config = getLevelConfig(3);
      expect(config.dotCount).toBe(10);
      expect(config.arcRadius).toBe(25);
    });

    it('score increases with level', () => {
      const score1 = calculateScore(10, 1);
      const score2 = calculateScore(10, 2);
      const score3 = calculateScore(10, 3);
      expect(score1).toBeLessThan(score2);
      expect(score2).toBeLessThan(score3);
    });

    it('more dots at higher levels require more clicks', () => {
      const game1 = createGame(1);
      const game2 = createGame(2);
      const game3 = createGame(3);
      expect(game1.dots.length).toBeLessThan(game2.dots.length);
      expect(game2.dots.length).toBeLessThan(game3.dots.length);
    });
  });
});
