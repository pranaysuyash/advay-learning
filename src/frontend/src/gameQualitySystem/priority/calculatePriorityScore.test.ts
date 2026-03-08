// Unit tests for Priority Score Calculation
// Tests the weighted priority score calculation: Educational_Impact * 0.4 + User_Demand * 0.3 + Implementation_Effort * 0.2 + Strategic_Alignment * 0.1

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
    calculatePriorityScore,
    determinePriorityLevel,
    createPriorityScore,
    isValidPriorityFactors,
    getPriorityFactorWeight,
    getPriorityRange,
    PRIORITY_SCORE_WEIGHTS,
    PRIORITY_LEVEL_THRESHOLDS,
} from './calculatePriorityScore';
import type { PriorityFactors, PriorityLevel } from '../types';

describe('Priority Score Calculation', () => {
    describe('calculatePriorityScore', () => {
        it('should calculate correct weighted total with all maximum values', () => {
            const factors: PriorityFactors = {
                educationalImpact: 100,
                userDemand: 100,
                implementationEffort: 100,
                strategicAlignment: 100,
            };

            const score = calculatePriorityScore(factors);
            // 100 * 0.4 + 100 * 0.3 + 100 * 0.2 + 100 * 0.1 = 40 + 30 + 20 + 10 = 100
            expect(score).toBe(100);
        });

        it('should calculate correct weighted total with all minimum values', () => {
            const factors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 0,
                implementationEffort: 0,
                strategicAlignment: 0,
            };

            const score = calculatePriorityScore(factors);
            // 0 * 0.4 + 0 * 0.3 + 0 * 0.2 + 0 * 0.1 = 0
            expect(score).toBe(0);
        });

        it('should calculate correct weighted total with mixed values', () => {
            const factors: PriorityFactors = {
                educationalImpact: 100,
                userDemand: 80,
                implementationEffort: 60,
                strategicAlignment: 90,
            };

            const score = calculatePriorityScore(factors);
            // 100 * 0.4 + 80 * 0.3 + 60 * 0.2 + 90 * 0.1 = 40 + 24 + 12 + 9 = 85
            expect(score).toBe(85);
        });

        it('should calculate correct weighted total with educational impact only', () => {
            const factors: PriorityFactors = {
                educationalImpact: 100,
                userDemand: 0,
                implementationEffort: 0,
                strategicAlignment: 0,
            };

            const score = calculatePriorityScore(factors);
            // 100 * 0.4 + 0 + 0 + 0 = 40
            expect(score).toBe(40);
        });

        it('should calculate correct weighted total with user demand only', () => {
            const factors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 100,
                implementationEffort: 0,
                strategicAlignment: 0,
            };

            const score = calculatePriorityScore(factors);
            // 0 + 100 * 0.3 + 0 + 0 = 30
            expect(score).toBe(30);
        });

        it('should calculate correct weighted total with implementation effort only', () => {
            const factors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 0,
                implementationEffort: 100,
                strategicAlignment: 0,
            };

            const score = calculatePriorityScore(factors);
            // 0 + 0 + 100 * 0.2 + 0 = 20
            expect(score).toBe(20);
        });

        it('should calculate correct weighted total with strategic alignment only', () => {
            const factors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 0,
                implementationEffort: 0,
                strategicAlignment: 100,
            };

            const score = calculatePriorityScore(factors);
            // 0 + 0 + 0 + 100 * 0.1 = 10
            expect(score).toBe(10);
        });

        it('should handle decimal values correctly', () => {
            const factors: PriorityFactors = {
                educationalImpact: 75.5,
                userDemand: 82.3,
                implementationEffort: 45.7,
                strategicAlignment: 91.2,
            };

            const score = calculatePriorityScore(factors);
            // 75.5 * 0.4 + 82.3 * 0.3 + 45.7 * 0.2 + 91.2 * 0.1
            // = 30.2 + 24.69 + 9.14 + 9.12 = 73.15
            expect(score).toBe(73.15);
        });

        it('should round to 2 decimal places', () => {
            const factors: PriorityFactors = {
                educationalImpact: 33.33,
                userDemand: 33.33,
                implementationEffort: 33.33,
                strategicAlignment: 33.33,
            };

            const score = calculatePriorityScore(factors);
            // 33.33 * 0.4 + 33.33 * 0.3 + 33.33 * 0.2 + 33.33 * 0.1
            // = 13.332 + 9.999 + 6.666 + 3.333 = 33.33
            expect(score).toBe(33.33);
        });

        it('should handle boundary values at 0 and 100', () => {
            const factors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 100,
                implementationEffort: 0,
                strategicAlignment: 100,
            };

            const score = calculatePriorityScore(factors);
            // 0 + 100 * 0.3 + 0 + 100 * 0.1 = 30 + 10 = 40
            expect(score).toBe(40);
        });
    });

    describe('determinePriorityLevel', () => {
        it('should return P0 for scores 90-100', () => {
            expect(determinePriorityLevel(90)).toBe('P0');
            expect(determinePriorityLevel(95)).toBe('P0');
            expect(determinePriorityLevel(100)).toBe('P0');
        });

        it('should return P1 for scores 70-89', () => {
            expect(determinePriorityLevel(70)).toBe('P1');
            expect(determinePriorityLevel(80)).toBe('P1');
            expect(determinePriorityLevel(89)).toBe('P1');
        });

        it('should return P2 for scores 50-69', () => {
            expect(determinePriorityLevel(50)).toBe('P2');
            expect(determinePriorityLevel(60)).toBe('P2');
            expect(determinePriorityLevel(69)).toBe('P2');
        });

        it('should return P3 for scores 0-49', () => {
            expect(determinePriorityLevel(0)).toBe('P3');
            expect(determinePriorityLevel(25)).toBe('P3');
            expect(determinePriorityLevel(49)).toBe('P3');
        });

        it('should handle boundary cases correctly', () => {
            expect(determinePriorityLevel(89.99)).toBe('P1');
            expect(determinePriorityLevel(69.99)).toBe('P2');
            expect(determinePriorityLevel(49.99)).toBe('P3');
        });
    });

    describe('createPriorityScore', () => {
        it('should create a complete PriorityScore object', () => {
            const factors: PriorityFactors = {
                educationalImpact: 100,
                userDemand: 80,
                implementationEffort: 60,
                strategicAlignment: 90,
            };

            const result = createPriorityScore('game-123', factors);

            expect(result.gameId).toBe('game-123');
            expect(result.totalScore).toBe(85);
            expect(result.educationalImpact).toBe(100);
            expect(result.userDemand).toBe(80);
            expect(result.implementationEffort).toBe(60);
            expect(result.strategicAlignment).toBe(90);
            expect(result.priorityLevel).toBe('P1');
        });

        it('should correctly categorize P0 priority', () => {
            const factors: PriorityFactors = {
                educationalImpact: 100,
                userDemand: 100,
                implementationEffort: 100,
                strategicAlignment: 100,
            };

            const result = createPriorityScore('game-p0', factors);
            expect(result.priorityLevel).toBe('P0');
        });

        it('should correctly categorize P3 priority', () => {
            const factors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 0,
                implementationEffort: 0,
                strategicAlignment: 0,
            };

            const result = createPriorityScore('game-p3', factors);
            expect(result.priorityLevel).toBe('P3');
        });
    });

    describe('isValidPriorityFactors', () => {
        it('should return true for valid factors', () => {
            const factors: PriorityFactors = {
                educationalImpact: 50,
                userDemand: 50,
                implementationEffort: 50,
                strategicAlignment: 50,
            };

            expect(isValidPriorityFactors(factors)).toBe(true);
        });

        it('should return true for boundary values', () => {
            const minFactors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 0,
                implementationEffort: 0,
                strategicAlignment: 0,
            };

            const maxFactors: PriorityFactors = {
                educationalImpact: 100,
                userDemand: 100,
                implementationEffort: 100,
                strategicAlignment: 100,
            };

            expect(isValidPriorityFactors(minFactors)).toBe(true);
            expect(isValidPriorityFactors(maxFactors)).toBe(true);
        });

        it('should return false for negative values', () => {
            const factors: Partial<PriorityFactors> = {
                educationalImpact: -10,
                userDemand: 50,
                implementationEffort: 50,
                strategicAlignment: 50,
            };

            expect(isValidPriorityFactors(factors)).toBe(false);
        });

        it('should return false for values over 100', () => {
            const factors: Partial<PriorityFactors> = {
                educationalImpact: 50,
                userDemand: 150,
                implementationEffort: 50,
                strategicAlignment: 50,
            };

            expect(isValidPriorityFactors(factors)).toBe(false);
        });

        it('should return false for missing factors', () => {
            const factors: Partial<PriorityFactors> = {
                educationalImpact: 50,
                userDemand: 50,
                // implementationEffort and strategicAlignment missing
            };

            expect(isValidPriorityFactors(factors)).toBe(false);
        });
    });

    describe('getPriorityFactorWeight', () => {
        it('should return correct weight for educationalImpact', () => {
            expect(getPriorityFactorWeight('educationalImpact')).toBe(0.4);
        });

        it('should return correct weight for userDemand', () => {
            expect(getPriorityFactorWeight('userDemand')).toBe(0.3);
        });

        it('should return correct weight for implementationEffort', () => {
            expect(getPriorityFactorWeight('implementationEffort')).toBe(0.2);
        });

        it('should return correct weight for strategicAlignment', () => {
            expect(getPriorityFactorWeight('strategicAlignment')).toBe(0.1);
        });
    });

    describe('getPriorityRange', () => {
        it('should return correct range for P0', () => {
            expect(getPriorityRange('P0')).toEqual([90, 100]);
        });

        it('should return correct range for P1', () => {
            expect(getPriorityRange('P1')).toEqual([70, 89]);
        });

        it('should return correct range for P2', () => {
            expect(getPriorityRange('P2')).toEqual([50, 69]);
        });

        it('should return correct range for P3', () => {
            expect(getPriorityRange('P3')).toEqual([0, 49]);
        });
    });

    describe('PRIORITY_SCORE_WEIGHTS constant', () => {
        it('should have correct weights defined', () => {
            expect(PRIORITY_SCORE_WEIGHTS.educationalImpact).toBe(0.4);
            expect(PRIORITY_SCORE_WEIGHTS.userDemand).toBe(0.3);
            expect(PRIORITY_SCORE_WEIGHTS.implementationEffort).toBe(0.2);
            expect(PRIORITY_SCORE_WEIGHTS.strategicAlignment).toBe(0.1);
        });

        it('should sum to 1.0', () => {
            const sum =
                PRIORITY_SCORE_WEIGHTS.educationalImpact +
                PRIORITY_SCORE_WEIGHTS.userDemand +
                PRIORITY_SCORE_WEIGHTS.implementationEffort +
                PRIORITY_SCORE_WEIGHTS.strategicAlignment;
            // Use closeTo for floating point comparison
            expect(sum).toBeCloseTo(1.0, 10);
        });
    });
});

describe('Priority Score Calculation - Edge Cases', () => {
    it('should handle all factors at 50 correctly', () => {
        const factors: PriorityFactors = {
            educationalImpact: 50,
            userDemand: 50,
            implementationEffort: 50,
            strategicAlignment: 50,
        };

        const score = calculatePriorityScore(factors);
        // 50 * 0.4 + 50 * 0.3 + 50 * 0.2 + 50 * 0.1 = 20 + 15 + 10 + 5 = 50
        expect(score).toBe(50);
    });

    it('should handle asymmetric factor values', () => {
        const factors: PriorityFactors = {
            educationalImpact: 100,
            userDemand: 0,
            implementationEffort: 100,
            strategicAlignment: 0,
        };

        const score = calculatePriorityScore(factors);
        // 100 * 0.4 + 0 + 100 * 0.2 + 0 = 40 + 20 = 60
        expect(score).toBe(60);
    });

    it('should handle single factor at maximum', () => {
        const factors: PriorityFactors = {
            educationalImpact: 100,
            userDemand: 0,
            implementationEffort: 0,
            strategicAlignment: 0,
        };

        const score = calculatePriorityScore(factors);
        expect(score).toBe(40);
    });

    it('should handle very small decimal values', () => {
        const factors: PriorityFactors = {
            educationalImpact: 0.01,
            userDemand: 0.01,
            implementationEffort: 0.01,
            strategicAlignment: 0.01,
        };

        const score = calculatePriorityScore(factors);
        // 0.01 * 0.4 + 0.01 * 0.3 + 0.01 * 0.2 + 0.01 * 0.1 = 0.01
        expect(score).toBe(0.01);
    });

    it('should handle very large decimal values', () => {
        const factors: PriorityFactors = {
            educationalImpact: 99.99,
            userDemand: 99.99,
            implementationEffort: 99.99,
            strategicAlignment: 99.99,
        };

        const score = calculatePriorityScore(factors);
        // 99.99 * 0.4 + 99.99 * 0.3 + 99.99 * 0.2 + 99.99 * 0.1 = 99.99
        expect(score).toBeCloseTo(99.99, 2);
    });
});

describe('Priority Score Calculation - Integration with PriorityEngine', () => {
    it('should produce scores compatible with priority calculation', () => {
        const factors: PriorityFactors = {
            educationalImpact: 85,
            userDemand: 72,
            implementationEffort: 60,
            strategicAlignment: 95,
        };
        const score = calculatePriorityScore(factors);

        // Priority score should be in 0-100 range
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('should provide individual components for detailed analysis', () => {
        const factors: PriorityFactors = {
            educationalImpact: 100,
            userDemand: 80,
            implementationEffort: 60,
            strategicAlignment: 90,
        };
        const result = createPriorityScore('test-game', factors);

        // All components should be available for reporting
        expect(typeof result.educationalImpact).toBe('number');
        expect(typeof result.userDemand).toBe('number');
        expect(typeof result.implementationEffort).toBe('number');
        expect(typeof result.strategicAlignment).toBe('number');
    });

    it('should contribute correctly to overall priority score', () => {
        const factors: PriorityFactors = {
            educationalImpact: 100,
            userDemand: 100,
            implementationEffort: 100,
            strategicAlignment: 100,
        };
        const score = calculatePriorityScore(factors);

        // With max scores, priority should be 100
        expect(score).toBe(100);
    });

    it('should correctly categorize edge case scores', () => {
        // Score of 89.5 should be P1
        expect(determinePriorityLevel(89.5)).toBe('P1');

        // Score of 69.5 should be P2
        expect(determinePriorityLevel(69.5)).toBe('P2');

        // Score of 49.5 should be P3
        expect(determinePriorityLevel(49.5)).toBe('P3');
    });
});

/**
 * Property 9: Priority categorization follows correct thresholds
 * Validates: Requirements 3.5
 * 
 * For any calculated priority score, the Priority_Engine SHALL categorize the game as:
 * - P0 (90-100)
 * - P1 (70-89)
 * - P2 (50-69)
 * - P3 (0-49)
 */
describe('Property 9: Priority categorization follows correct thresholds', () => {
    describe('determinePriorityLevel - Property-based tests', () => {
        it('should return P0 for scores 90-100', () => {
            fc.assert(
                fc.property(fc.float({ min: 90, max: 100 }), (score) => {
                    if (!Number.isFinite(score)) return true;
                    expect(determinePriorityLevel(score)).toBe('P0');
                }),
                { verbose: 0 }
            );
        });

        it('should return P1 for scores 70-89', () => {
            fc.assert(
                fc.property(fc.float({ min: 70, max: 89 }), (score) => {
                    if (!Number.isFinite(score)) return true;
                    expect(determinePriorityLevel(score)).toBe('P1');
                }),
                { verbose: 0 }
            );
        });

        it('should return P2 for scores 50-69', () => {
            fc.assert(
                fc.property(fc.float({ min: 50, max: 69 }), (score) => {
                    if (!Number.isFinite(score)) return true;
                    expect(determinePriorityLevel(score)).toBe('P2');
                }),
                { verbose: 0 }
            );
        });

        it('should return P3 for scores 0-49', () => {
            fc.assert(
                fc.property(fc.float({ min: 0, max: 49 }), (score) => {
                    if (!Number.isFinite(score)) return true;
                    expect(determinePriorityLevel(score)).toBe('P3');
                }),
                { verbose: 0 }
            );
        });

        it('should categorize all scores in valid range (0-100)', () => {
            fc.assert(
                fc.property(fc.float({ min: 0, max: 100 }), (score) => {
                    const level = determinePriorityLevel(score);
                    const validLevels: ('P0' | 'P1' | 'P2' | 'P3')[] = ['P0', 'P1', 'P2', 'P3'];
                    expect(validLevels).toContain(level);
                }),
                { verbose: 0 }
            );
        });

        it('should return P0 for boundary value 90', () => {
            expect(determinePriorityLevel(90)).toBe('P0');
        });

        it('should return P1 for boundary value 70', () => {
            expect(determinePriorityLevel(70)).toBe('P1');
        });

        it('should return P2 for boundary value 50', () => {
            expect(determinePriorityLevel(50)).toBe('P2');
        });

        it('should return P3 for boundary value 0', () => {
            expect(determinePriorityLevel(0)).toBe('P3');
        });

        it('should return P3 for boundary value 49', () => {
            expect(determinePriorityLevel(49)).toBe('P3');
        });

        it('should return P1 for boundary value 89', () => {
            expect(determinePriorityLevel(89)).toBe('P1');
        });

        it('should return P2 for boundary value 69', () => {
            expect(determinePriorityLevel(69)).toBe('P2');
        });

        it('should return P0 for boundary value 100', () => {
            expect(determinePriorityLevel(100)).toBe('P0');
        });
    });

    describe('createPriorityScore - Property-based tests', () => {
        it('should assign correct priority level based on calculated score', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        const factors: PriorityFactors = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        const result = createPriorityScore('test-game', factors);

                        // Verify priority level matches the score
                        const expectedLevel = determinePriorityLevel(result.totalScore);
                        expect(result.priorityLevel).toBe(expectedLevel);
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should produce P0 for high-scoring factors', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 90, max: 100 }),
                    fc.float({ min: 90, max: 100 }),
                    fc.float({ min: 90, max: 100 }),
                    fc.float({ min: 90, max: 100 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        // Skip NaN values which can be generated by fc.float
                        if (!Number.isFinite(educationalImpact) || !Number.isFinite(userDemand) ||
                            !Number.isFinite(implementationEffort) || !Number.isFinite(strategicAlignment)) {
                            return true;
                        }
                        const factors: PriorityFactors = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        const result = createPriorityScore('test-game', factors);
                        expect(result.priorityLevel).toBe('P0');
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should produce P3 for low-scoring factors', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 0, max: 30 }),
                    fc.float({ min: 0, max: 30 }),
                    fc.float({ min: 0, max: 30 }),
                    fc.float({ min: 0, max: 30 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        const factors: PriorityFactors = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        const result = createPriorityScore('test-game', factors);
                        expect(result.priorityLevel).toBe('P3');
                    }
                ),
                { verbose: 0 }
            );
        });
    });

    describe('getPriorityRange - Property-based tests', () => {
        it('should return correct ranges for all priority levels', () => {
            expect(getPriorityRange('P0')).toEqual([90, 100]);
            expect(getPriorityRange('P1')).toEqual([70, 89]);
            expect(getPriorityRange('P2')).toEqual([50, 69]);
            expect(getPriorityRange('P3')).toEqual([0, 49]);
        });

        it('should have non-overlapping ranges', () => {
            const p0 = getPriorityRange('P0');
            const p1 = getPriorityRange('P1');
            const p2 = getPriorityRange('P2');
            const p3 = getPriorityRange('P3');

            // P0 upper bound should equal P1 upper bound + 1
            expect(p0[0]).toBe(p1[1] + 1);
            // P1 upper bound should equal P2 upper bound + 1
            expect(p1[0]).toBe(p2[1] + 1);
            // P2 upper bound should equal P3 upper bound + 1
            expect(p2[0]).toBe(p3[1] + 1);
        });

        it('should cover the entire 0-100 range without gaps', () => {
            const p0 = getPriorityRange('P0');
            const p1 = getPriorityRange('P1');
            const p2 = getPriorityRange('P2');
            const p3 = getPriorityRange('P3');

            // P3 starts at 0
            expect(p3[0]).toBe(0);
            // P0 ends at 100
            expect(p0[1]).toBe(100);
        });
    });

    describe('PRIORITY_LEVEL_THRESHOLDS - Property-based tests', () => {
        it('should match the expected categorization thresholds', () => {
            expect(PRIORITY_LEVEL_THRESHOLDS.P0).toEqual([90, 100]);
            expect(PRIORITY_LEVEL_THRESHOLDS.P1).toEqual([70, 89]);
            expect(PRIORITY_LEVEL_THRESHOLDS.P2).toEqual([50, 69]);
            expect(PRIORITY_LEVEL_THRESHOLDS.P3).toEqual([0, 49]);
        });

        it('should have complete coverage of 0-100 range', () => {
            const allRanges = [
                PRIORITY_LEVEL_THRESHOLDS.P0,
                PRIORITY_LEVEL_THRESHOLDS.P1,
                PRIORITY_LEVEL_THRESHOLDS.P2,
                PRIORITY_LEVEL_THRESHOLDS.P3,
            ];

            const minValues = allRanges.map(r => r[0]);
            const maxValues = allRanges.map(r => r[1]);

            // All ranges should be valid
            minValues.forEach((min, i) => {
                expect(min).toBeLessThanOrEqual(maxValues[i]);
            });

            // P3 should start at 0
            expect(PRIORITY_LEVEL_THRESHOLDS.P3[0]).toBe(0);
            // P0 should end at 100
            expect(PRIORITY_LEVEL_THRESHOLDS.P0[1]).toBe(100);
        });
    });
});

/**
 * Additional property tests for priority score calculation
 */
describe('Priority Score Calculation - Additional Property Tests', () => {
    describe('calculatePriorityScore - Property-based tests', () => {
        it('should return score between 0 and 100 for valid factors', () => {
            fc.assert(
                fc.property(
                    fc.nat({ max: 100 }),
                    fc.nat({ max: 100 }),
                    fc.nat({ max: 100 }),
                    fc.nat({ max: 100 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        const factors: PriorityFactors = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        const score = calculatePriorityScore(factors);
                        expect(score).toBeGreaterThanOrEqual(0);
                        expect(score).toBeLessThanOrEqual(100);
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should return 100 for maximum factors', () => {
            const maxFactors: PriorityFactors = {
                educationalImpact: 100,
                userDemand: 100,
                implementationEffort: 100,
                strategicAlignment: 100,
            };
            expect(calculatePriorityScore(maxFactors)).toBe(100);
        });

        it('should return 0 for minimum factors', () => {
            const minFactors: PriorityFactors = {
                educationalImpact: 0,
                userDemand: 0,
                implementationEffort: 0,
                strategicAlignment: 0,
            };
            expect(calculatePriorityScore(minFactors)).toBe(0);
        });

        it('should be deterministic for same input', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        const factors: PriorityFactors = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        const score1 = calculatePriorityScore(factors);
                        const score2 = calculatePriorityScore(factors);
                        expect(score1).toBe(score2);
                    }
                ),
                { verbose: 0 }
            );
        });
    });

    describe('isValidPriorityFactors - Property-based tests', () => {
        it('should return true for valid factors in range 0-100', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        const factors: PriorityFactors = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        expect(isValidPriorityFactors(factors)).toBe(true);
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should return false for negative values', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: -100, max: -1 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        // Skip NaN/Infinity values which can be generated by fc.float
                        if (!Number.isFinite(educationalImpact)) return true;
                        const factors: Partial<PriorityFactors> = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        expect(isValidPriorityFactors(factors)).toBe(false);
                    }
                ),
                { verbose: 0 }
            );
        });

        it('should return false for values over 100', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 101, max: 200 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    fc.float({ min: 0, max: 100 }),
                    (educationalImpact, userDemand, implementationEffort, strategicAlignment) => {
                        // Skip NaN/Infinity values which can be generated by fc.float
                        if (!Number.isFinite(educationalImpact)) return true;
                        const factors: Partial<PriorityFactors> = {
                            educationalImpact,
                            userDemand,
                            implementationEffort,
                            strategicAlignment,
                        };
                        expect(isValidPriorityFactors(factors)).toBe(false);
                    }
                ),
                { verbose: 0 }
            );
        });
    });

    describe('getPriorityFactorWeight - Property-based tests', () => {
        it('should return correct weights for all factors', () => {
            expect(getPriorityFactorWeight('educationalImpact')).toBe(0.4);
            expect(getPriorityFactorWeight('userDemand')).toBe(0.3);
            expect(getPriorityFactorWeight('implementationEffort')).toBe(0.2);
            expect(getPriorityFactorWeight('strategicAlignment')).toBe(0.1);
        });

        it('should have weights that sum to 1.0', () => {
            const sum =
                getPriorityFactorWeight('educationalImpact') +
                getPriorityFactorWeight('userDemand') +
                getPriorityFactorWeight('implementationEffort') +
                getPriorityFactorWeight('strategicAlignment');
            expect(sum).toBeCloseTo(1.0, 10);
        });
    });
});
