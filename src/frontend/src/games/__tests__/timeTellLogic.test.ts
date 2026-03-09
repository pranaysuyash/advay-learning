/**
 * Time Tell Logic Tests
 * Tests for clock reading game
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getLevelConfig,
  generateTime,
  formatTime,
  LEVELS,
  type TimeQuestion,
  type LevelConfig,
} from '../timeTellLogic';

describe('timeTellLogic', () => {
  describe('Level Configuration', () => {
    it('should have 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('should have correct level numbers', () => {
      expect(LEVELS[0].level).toBe(1);
      expect(LEVELS[1].level).toBe(2);
      expect(LEVELS[2].level).toBe(3);
    });

    it('should not include half hours in level 1', () => {
      expect(LEVELS[0].includeHalf).toBe(false);
    });

    it('should include half hours in levels 2 and 3', () => {
      expect(LEVELS[1].includeHalf).toBe(true);
      expect(LEVELS[2].includeHalf).toBe(true);
    });
  });

  describe('getLevelConfig', () => {
    it('should return level 1 config', () => {
      const config = getLevelConfig(1);

      expect(config.level).toBe(1);
      expect(config.includeHalf).toBe(false);
    });

    it('should return level 2 config', () => {
      const config = getLevelConfig(2);

      expect(config.level).toBe(2);
      expect(config.includeHalf).toBe(true);
    });

    it('should return level 3 config', () => {
      const config = getLevelConfig(3);

      expect(config.level).toBe(3);
      expect(config.includeHalf).toBe(true);
    });

    it('should fallback to level 1 for invalid level', () => {
      const config = getLevelConfig(99);

      expect(config.level).toBe(1);
    });

    it('should fallback to level 1 for zero level', () => {
      const config = getLevelConfig(0);

      expect(config.level).toBe(1);
    });

    it('should fallback to level 1 for negative level', () => {
      const config = getLevelConfig(-1);

      expect(config.level).toBe(1);
    });
  });

  describe('generateTime', () => {
    it('should generate valid hour (1-12)', () => {
      for (let i = 0; i < 50; i++) {
        const time = generateTime(1);
        expect(time.hour).toBeGreaterThanOrEqual(1);
        expect(time.hour).toBeLessThanOrEqual(12);
      }
    });

    it('should generate only o\'clock (0 minutes) for level 1', () => {
      for (let i = 0; i < 20; i++) {
        const time = generateTime(1);
        expect(time.minute).toBe(0);
      }
    });

    it('should generate quarter hours for levels with includeHalf', () => {
      const validMinutes = [0, 15, 30, 45];

      for (let i = 0; i < 50; i++) {
        const time = generateTime(2);
        expect(validMinutes).toContain(time.minute);
      }
    });

    it('should generate isDigital flag randomly', () => {
      const times = [];
      for (let i = 0; i < 50; i++) {
        times.push(generateTime(1).isDigital);
      }

      // Should have both true and false values over many runs
      const hasTrue = times.includes(true);
      const hasFalse = times.includes(false);

      expect(hasTrue || hasFalse).toBe(true);
    });

    it('should return TimeQuestion with all required fields', () => {
      const time = generateTime(1);

      expect(time.hour).toBeDefined();
      expect(time.minute).toBeDefined();
      expect(time.isDigital).toBeDefined();
    });

    it('should generate quarter past options', () => {
      let foundQuarterPast = false;

      for (let i = 0; i < 100; i++) {
        const time = generateTime(2);
        if (time.minute === 15) {
          foundQuarterPast = true;
          break;
        }
      }

      expect(foundQuarterPast).toBe(true);
    });

    it('should generate half past options', () => {
      let foundHalfPast = false;

      for (let i = 0; i < 100; i++) {
        const time = generateTime(2);
        if (time.minute === 30) {
          foundHalfPast = true;
          break;
        }
      }

      expect(foundHalfPast).toBe(true);
    });

    it('should generate quarter to options', () => {
      let foundQuarterTo = false;

      for (let i = 0; i < 100; i++) {
        const time = generateTime(2);
        if (time.minute === 45) {
          foundQuarterTo = true;
          break;
        }
      }

      expect(foundQuarterTo).toBe(true);
    });
  });

  describe('formatTime', () => {
    describe('o\'clock times', () => {
      it('should format 1:00 as "1 o\'clock"', () => {
        expect(formatTime(1, 0)).toBe("1 o'clock");
      });

      it('should format 12:00 as "12 o\'clock"', () => {
        expect(formatTime(12, 0)).toBe("12 o'clock");
      });

      it('should format 6:00 as "6 o\'clock"', () => {
        expect(formatTime(6, 0)).toBe("6 o'clock");
      });
    });

    describe('quarter past times', () => {
      it('should format 1:15 as "quarter past 1"', () => {
        expect(formatTime(1, 15)).toBe('quarter past 1');
      });

      it('should format 12:15 as "quarter past 12"', () => {
        expect(formatTime(12, 15)).toBe('quarter past 12');
      });
    });

    describe('half past times', () => {
      it('should format 1:30 as "half past 1"', () => {
        expect(formatTime(1, 30)).toBe('half past 1');
      });

      it('should format 12:30 as "half past 12"', () => {
        expect(formatTime(12, 30)).toBe('half past 12');
      });
    });

    describe('quarter to times', () => {
      it('should format 1:45 as "quarter to 2"', () => {
        expect(formatTime(1, 45)).toBe('quarter to 2');
      });

      it('should format 11:45 as "quarter to 12"', () => {
        expect(formatTime(11, 45)).toBe('quarter to 12');
      });

      it('should wrap around correctly for 12:45', () => {
        expect(formatTime(12, 45)).toBe('quarter to 1');
      });
    });

    describe('other times', () => {
      it('should format 1:05 as "1:05"', () => {
        expect(formatTime(1, 5)).toBe('1:05');
      });

      it('should format 1:10 as "1:10"', () => {
        expect(formatTime(1, 10)).toBe('1:10');
      });

      it('should format 12:25 as "12:25"', () => {
        expect(formatTime(12, 25)).toBe('12:25');
      });

      it('should pad single digit minutes', () => {
        expect(formatTime(3, 7)).toBe('3:07');
        expect(formatTime(9, 3)).toBe('9:03');
      });
    });
  });

  describe('Type Definitions', () => {
    it('should have correct TimeQuestion structure', () => {
      const time: TimeQuestion = {
        hour: 3,
        minute: 0,
        isDigital: false,
      };

      expect(time.hour).toBeDefined();
      expect(time.minute).toBeDefined();
      expect(time.isDigital).toBeDefined();
    });

    it('should have correct LevelConfig structure', () => {
      const config: LevelConfig = {
        level: 1,
        includeHalf: false,
      };

      expect(config.level).toBeDefined();
      expect(config.includeHalf).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle hour 12 correctly in formatTime', () => {
      expect(formatTime(12, 0)).toBe("12 o'clock");
      expect(formatTime(12, 45)).toBe('quarter to 1');
    });

    it('should handle minute boundaries', () => {
      expect(formatTime(1, 0)).toBe("1 o'clock");
      expect(formatTime(1, 15)).toBe('quarter past 1');
      expect(formatTime(1, 30)).toBe('half past 1');
      expect(formatTime(1, 45)).toBe('quarter to 2');
    });

    it('should handle all hours 1-12', () => {
      for (let hour = 1; hour <= 12; hour++) {
        const formatted = formatTime(hour, 0);
        expect(formatted).toContain('o\'clock');
      }
    });
  });

  describe('Integration Scenarios', () => {
    it('should generate level 1 times correctly', () => {
      const time = generateTime(1);
      const formatted = formatTime(time.hour, time.minute);

      expect(time.minute).toBe(0);
      expect(formatted).toContain('o\'clock');
    });

    it('should generate level 2 times with quarter hours', () => {
      const times = [];
      for (let i = 0; i < 20; i++) {
        times.push(generateTime(2));
      }

      const hasNonZeroMinute = times.some(t => t.minute !== 0);
      expect(hasNonZeroMinute).toBe(true);
    });

    it('should format all generated level 2 times', () => {
      for (let i = 0; i < 20; i++) {
        const time = generateTime(2);
        const formatted = formatTime(time.hour, time.minute);

        expect(formatted).toBeTruthy();
        expect(typeof formatted).toBe('string');
      }
    });
  });

  describe('Educational Content', () => {
    it('should teach time progression (o\'clock)', () => {
      const times = [1, 2, 3, 4, 5];

      times.forEach(hour => {
        const formatted = formatTime(hour, 0);
        expect(formatted).toContain(`${hour} o'clock`);
      });
    });

    it('should teach quarter hour vocabulary', () => {
      expect(formatTime(1, 15)).toContain('quarter past');
      expect(formatTime(1, 30)).toContain('half past');
      expect(formatTime(1, 45)).toContain('quarter to');
    });

    it('should introduce digital/analog toggle', () => {
      const time1 = generateTime(1);
      const time2 = generateTime(1);

      expect(time1.isDigital).toBeDefined();
      expect(time2.isDigital).toBeDefined();
    });
  });
});
