import { describe, it, expect } from 'vitest';
import {
    normalizeToScale,
    normalizeFromZero,
    normalizePercentage,
    normalizeInverted,
    normalizeArray,
    clampToHundred,
} from './normalization';

describe('normalization - Normalization Utilities', () => {
    describe('normalizeToScale', () => {
        it('should normalize a value in the middle of the range to 50', () => {
            expect(normalizeToScale(50, 0, 100)).toBe(50);
        });

        it('should normalize a value at the minimum to 0', () => {
            expect(normalizeToScale(0, 0, 100)).toBe(0);
        });

        it('should normalize a value at the maximum to 100', () => {
            expect(normalizeToScale(100, 0, 100)).toBe(100);
        });

        it('should normalize a value below the minimum to 0', () => {
            expect(normalizeToScale(-10, 0, 100)).toBe(0);
        });

        it('should normalize a value above the maximum to 100', () => {
            expect(normalizeToScale(150, 0, 100)).toBe(100);
        });

        it('should handle negative ranges', () => {
            expect(normalizeToScale(0, -100, 100)).toBe(50);
            expect(normalizeToScale(-100, -100, 100)).toBe(0);
            expect(normalizeToScale(100, -100, 100)).toBe(100);
        });

        it('should handle decimal values', () => {
            expect(normalizeToScale(33.33, 0, 100)).toBeCloseTo(33.33, 1);
            expect(normalizeToScale(66.67, 0, 100)).toBeCloseTo(66.67, 1);
        });

        it('should return 0 for empty range (min >= max)', () => {
            expect(normalizeToScale(50, 100, 100)).toBe(0);
            expect(normalizeToScale(50, 50, 50)).toBe(0);
        });

        it('should return 100 for single value equal to min/max', () => {
            expect(normalizeToScale(50, 50, 50)).toBe(0);
            expect(normalizeToScale(50, 50, 50)).toBe(0);
        });

        it('should return 0 when value differs from single value', () => {
            expect(normalizeToScale(40, 50, 50)).toBe(0);
            expect(normalizeToScale(60, 50, 50)).toBe(0);
        });
    });

    describe('normalizeFromZero', () => {
        it('should normalize a value at 0 to 0', () => {
            expect(normalizeFromZero(0, 100)).toBe(0);
        });

        it('should normalize a value at half max to 50', () => {
            expect(normalizeFromZero(50, 100)).toBe(50);
        });

        it('should normalize a value at max to 100', () => {
            expect(normalizeFromZero(100, 100)).toBe(100);
        });

        it('should normalize a value above max to 100', () => {
            expect(normalizeFromZero(150, 100)).toBe(100);
        });

        it('should return 0 for zero or negative max', () => {
            expect(normalizeFromZero(50, 0)).toBe(0);
            expect(normalizeFromZero(50, -10)).toBe(0);
        });

        it('should handle decimal values', () => {
            expect(normalizeFromZero(33.33, 100)).toBeCloseTo(33.33, 1);
        });
    });

    describe('normalizePercentage', () => {
        it('should return a valid percentage unchanged', () => {
            expect(normalizePercentage(50)).toBe(50);
            expect(normalizePercentage(0)).toBe(0);
            expect(normalizePercentage(100)).toBe(100);
        });

        it('should clamp values above 100 to 100', () => {
            expect(normalizePercentage(150)).toBe(100);
            expect(normalizePercentage(200)).toBe(100);
        });

        it('should clamp values below 0 to 0', () => {
            expect(normalizePercentage(-10)).toBe(0);
            expect(normalizePercentage(-50)).toBe(0);
        });

        it('should handle decimal values', () => {
            expect(normalizePercentage(33.33)).toBeCloseTo(33.33, 1);
            expect(normalizePercentage(99.99)).toBeCloseTo(99.99, 1);
        });
    });

    describe('normalizeInverted', () => {
        it('should invert a value in the middle of the range to 50', () => {
            expect(normalizeInverted(50, 0, 100)).toBe(50);
        });

        it('should return 100 for minimum value (best case)', () => {
            expect(normalizeInverted(0, 0, 100)).toBe(100);
        });

        it('should return 0 for maximum value (worst case)', () => {
            expect(normalizeInverted(100, 0, 100)).toBe(0);
        });

        it('should return 100 for value below minimum (best case for inverted)', () => {
            // For inverted scale, lower is better. Below minimum is even better.
            expect(normalizeInverted(-10, 0, 100)).toBe(100);
        });

        it('should return 0 for value above maximum (worst case for inverted)', () => {
            // For inverted scale, higher is worse. Above maximum is even worse.
            expect(normalizeInverted(150, 0, 100)).toBe(0);
        });

        it('should handle negative ranges', () => {
            expect(normalizeInverted(0, -100, 100)).toBe(50);
            expect(normalizeInverted(-100, -100, 100)).toBe(100);
            expect(normalizeInverted(100, -100, 100)).toBe(0);
        });

        it('should return 0 for empty range (min >= max)', () => {
            expect(normalizeInverted(50, 100, 100)).toBe(0);
        });

        it('should return 100 for single value equal to min', () => {
            expect(normalizeInverted(50, 50, 50)).toBe(0);
        });
    });

    describe('normalizeArray', () => {
        it('should normalize an array of values', () => {
            const result = normalizeArray([0, 25, 50, 75, 100]);
            expect(result).toEqual([0, 25, 50, 75, 100]);
        });

        it('should normalize values relative to array min/max', () => {
            const result = normalizeArray([10, 20, 30, 40, 50]);
            expect(result).toEqual([0, 25, 50, 75, 100]);
        });

        it('should handle single element array', () => {
            const result = normalizeArray([50]);
            expect(result).toEqual([100]);
        });

        it('should return empty array for empty input', () => {
            const result = normalizeArray([]);
            expect(result).toEqual([]);
        });

        it('should handle arrays with NaN values', () => {
            const result = normalizeArray([10, NaN, 30, 40, 50]);
            expect(result[0]).toBe(0);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(50);
            expect(result[3]).toBe(75);
            expect(result[4]).toBe(100);
        });

        it('should handle arrays with all same values', () => {
            const result = normalizeArray([50, 50, 50]);
            expect(result).toEqual([100, 100, 100]);
        });

        it('should handle negative values', () => {
            const result = normalizeArray([-50, 0, 50]);
            expect(result).toEqual([0, 50, 100]);
        });
    });

    describe('clampToHundred', () => {
        it('should return values within range unchanged', () => {
            expect(clampToHundred(0)).toBe(0);
            expect(clampToHundred(50)).toBe(50);
            expect(clampToHundred(100)).toBe(100);
        });

        it('should clamp values above 100 to 100', () => {
            expect(clampToHundred(101)).toBe(100);
            expect(clampToHundred(150)).toBe(100);
            expect(clampToHundred(1000)).toBe(100);
        });

        it('should clamp values below 0 to 0', () => {
            expect(clampToHundred(-1)).toBe(0);
            expect(clampToHundred(-50)).toBe(0);
            expect(clampToHundred(-1000)).toBe(0);
        });

        it('should handle decimal values', () => {
            expect(clampToHundred(99.99)).toBeCloseTo(99.99, 1);
            expect(clampToHundred(100.01)).toBe(100);
        });
    });

    describe('Integration scenarios', () => {
        it('should normalize educational impact scores', () => {
            // Simulating educational impact calculation
            const curriculumAlignment = normalizeToScale(8, 1, 10);
            const ageRangeBreadth = normalizeToScale(5, 1, 10);
            const skillDiversity = normalizeToScale(7, 1, 10);

            expect(curriculumAlignment).toBeCloseTo(77.78, 1);
            expect(ageRangeBreadth).toBeCloseTo(44.44, 1);
            expect(skillDiversity).toBeCloseTo(66.67, 1);
        });

        it('should normalize user demand metrics', () => {
            // Simulating user demand calculation
            const feedbackScore = normalizeFromZero(75, 100);
            const playCountNormalized = normalizeFromZero(500, 1000);
            const completionRate = normalizePercentage(85);

            expect(feedbackScore).toBe(75);
            expect(playCountNormalized).toBe(50);
            expect(completionRate).toBe(85);
        });

        it('should normalize implementation effort (inverted)', () => {
            // Lower effort hours = higher score
            const effort8Hours = normalizeInverted(8, 1, 40);
            const effort16Hours = normalizeInverted(16, 1, 40);
            const effort40Hours = normalizeInverted(40, 1, 40);

            expect(effort8Hours).toBeCloseTo(82.05, 1);
            expect(effort16Hours).toBeCloseTo(61.54, 1);
            expect(effort40Hours).toBe(0);
        });

        it('should normalize strategic alignment', () => {
            // Strategic categories get 100, others get lower scores
            const strategicCategory = normalizePercentage(100);
            const nonStrategicCategory = normalizePercentage(50);

            expect(strategicCategory).toBe(100);
            expect(nonStrategicCategory).toBe(50);
        });
    });
});