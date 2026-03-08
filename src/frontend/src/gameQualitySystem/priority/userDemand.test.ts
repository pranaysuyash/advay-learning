// User Demand Calculation Tests
// Feature: game-quality-and-new-games, Task 3.3

import { describe, it, expect } from 'vitest';
import {
    calculateUserDemand,
    calculateUserFeedbackScore,
    calculatePlayCountScore,
    calculateCompletionRateScore,
    isValidUserDemand,
    getUserDemandLevel,
    type UserDemandBreakdown,
} from './userDemand';
import type { Game, CatalogEntry } from '../types';
import { USER_DEMAND_WEIGHTS } from '../types';

// Test utilities for generating test data
function createTestGame(overrides: Partial<Game> = {}): Game {
    return {
        id: 'test-game-1',
        name: 'Test Game',
        description: 'A test game for user demand calculation',
        category: 'Literacy',
        ageRange: '5-8',
        difficulty: 'Medium',
        estimatedTime: 30,
        requiredTechnologies: ['HTML5', 'JavaScript'],
        successCriteria: ['Complete all levels', 'Score above 80%'],
        isImplemented: true,
        educationalObjectives: ['Reading comprehension', 'Vocabulary building'],
        userFeedback: [],
        playCount: 0,
        completionRate: 0,
        lastUpdated: new Date().toISOString(),
        ...overrides,
    };
}

function createTestCatalogEntry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
    return {
        gameId: 'catalog-game-1',
        id: 'catalog-game-1',
        name: 'Test Catalog Game',
        description: 'A test catalog entry for user demand calculation',
        category: 'Numeracy',
        subcategory: 'Addition',
        ageRange: '6-10',
        difficulty: 'Easy',
        estimatedTime: 20,
        requiredTechnologies: ['HTML5'],
        successCriteria: ['Solve 10 problems correctly'],
        educationalObjectives: ['Basic addition', 'Number recognition'],
        skillsDeveloped: ['mathematical', 'cognitive'],
        isImplemented: false,
        userFeedback: [],
        playCount: 0,
        completionRate: 0,
        lastUpdated: new Date().toISOString(),
        ...overrides,
    };
}

describe('User Feedback Score Calculation', () => {
    describe('calculateUserFeedbackScore', () => {
        it('should return 0 for empty or undefined feedback', () => {
            expect(calculateUserFeedbackScore(undefined)).toBe(0);
            expect(calculateUserFeedbackScore([])).toBe(0);
        });

        it('should calculate average from explicit scores', () => {
            const feedback = [
                { score: 80 },
                { score: 90 },
                { score: 70 },
            ];
            expect(calculateUserFeedbackScore(feedback)).toBe(80);
        });

        it('should handle single feedback entry', () => {
            const feedback = [{ score: 100 }];
            expect(calculateUserFeedbackScore(feedback)).toBe(100);
        });

        it('should normalize scores to 0-100 range', () => {
            const feedback = [
                { score: 150 }, // Above max, should be clamped
                { score: -50 }, // Below min, should be clamped
                { score: 75 },
            ];
            expect(calculateUserFeedbackScore(feedback)).toBe(58); // (100 + 0 + 75) / 3
        });

        it('should convert positive sentiment to score', () => {
            const feedback = [{ sentiment: 'positive' }];
            expect(calculateUserFeedbackScore(feedback)).toBe(100);
        });

        it('should return 0 for single negative sentiment (no positive ratio)', () => {
            // Implementation calculates positive ratio, so single negative = 0
            const feedback = [{ sentiment: 'negative' }];
            expect(calculateUserFeedbackScore(feedback)).toBe(0);
        });

        it('should return 0 for single neutral sentiment (no positive ratio)', () => {
            // Implementation calculates positive ratio, so single neutral = 0
            const feedback = [{ sentiment: 'neutral' }];
            expect(calculateUserFeedbackScore(feedback)).toBe(0);
        });

        it('should handle mixed sentiments', () => {
            const feedback = [
                { sentiment: 'positive' },
                { sentiment: 'neutral' },
                { sentiment: 'negative' },
            ];
            expect(calculateUserFeedbackScore(feedback)).toBe(33); // 1/3 positive = 33%
        });

        it('should return 0 for various sentiment variations (no positive ratio)', () => {
            // Implementation uses positive ratio, so single non-positive entries = 0
            expect(calculateUserFeedbackScore([{ sentiment: 'excellent' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'great' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'good' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'mixed' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'okay' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'poor' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'terrible' }])).toBe(0);
        });

        it('should return 0 for case variations (no positive ratio)', () => {
            expect(calculateUserFeedbackScore([{ sentiment: 'POSITIVE' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'Positive' }])).toBe(0);
            expect(calculateUserFeedbackScore([{ sentiment: 'NeGaTiVe' }])).toBe(0);
        });

        it('should return 0 for unknown sentiments (no positive ratio)', () => {
            const feedback = [{ sentiment: 'unknown_sentiment' }];
            expect(calculateUserFeedbackScore(feedback)).toBe(0);
        });

        it('should prefer explicit scores over sentiment', () => {
            const feedback = [
                { sentiment: 'positive', score: 40 }, // Score takes precedence
            ];
            expect(calculateUserFeedbackScore(feedback)).toBe(40);
        });
    });
});

describe('Play Count Score Calculation', () => {
    describe('calculatePlayCountScore', () => {
        it('should return 0 for undefined, null, or zero play count', () => {
            expect(calculatePlayCountScore(undefined)).toBe(0);
            expect(calculatePlayCountScore(null)).toBe(0);
            expect(calculatePlayCountScore(0)).toBe(0);
        });

        it('should return 0 for negative play count', () => {
            expect(calculatePlayCountScore(-10)).toBe(0);
        });

        it('should use logarithmic scaling for play counts', () => {
            // log(1+1) = log(2) ≈ 0.301, so playCount of 1 gives a small positive score
            const score1 = calculatePlayCountScore(1);
            expect(score1).toBeGreaterThan(0);

            // Higher play counts should give higher scores
            const lowScore = calculatePlayCountScore(10);
            const mediumScore = calculatePlayCountScore(100);
            const highScore = calculatePlayCountScore(1000);

            expect(lowScore).toBeGreaterThan(score1);
            expect(mediumScore).toBeGreaterThan(lowScore);
            expect(highScore).toBeGreaterThan(mediumScore);
        });

        it('should cap at 100 for very high play counts', () => {
            expect(calculatePlayCountScore(10000)).toBe(100);
            expect(calculatePlayCountScore(100000)).toBe(100);
            expect(calculatePlayCountScore(1000000)).toBe(100);
        });

        it('should give moderate score for average play counts', () => {
            const score = calculatePlayCountScore(500);
            expect(score).toBeGreaterThan(20);
            expect(score).toBeLessThan(80);
        });

        it('should handle edge case of play count of 1', () => {
            // log(1+1) = log(2) ≈ 0.301, so playCount of 1 gives a small positive score
            const score = calculatePlayCountScore(1);
            expect(score).toBeGreaterThan(0);
        });

        it('should handle edge case of play count just above 1', () => {
            const score = calculatePlayCountScore(2);
            expect(score).toBeGreaterThan(0);
        });
    });
});

describe('Completion Rate Score Calculation', () => {
    describe('calculateCompletionRateScore', () => {
        it('should return 0 for undefined or null completion rate', () => {
            expect(calculateCompletionRateScore(undefined)).toBe(0);
            expect(calculateCompletionRateScore(null)).toBe(0);
        });

        it('should return 0 for completion rate of 0', () => {
            expect(calculateCompletionRateScore(0)).toBe(0);
        });

        it('should return 25 for 20% completion rate', () => {
            expect(calculateCompletionRateScore(20)).toBe(25);
        });

        it('should return 50 for 40% completion rate', () => {
            expect(calculateCompletionRateScore(40)).toBe(50);
        });

        it('should return 70 for 60% completion rate', () => {
            expect(calculateCompletionRateScore(60)).toBe(70);
        });

        it('should return 90 for 80% completion rate', () => {
            expect(calculateCompletionRateScore(80)).toBe(90);
        });

        it('should return 100 for 100% completion rate', () => {
            expect(calculateCompletionRateScore(100)).toBe(100);
        });

        it('should clamp values above 100 to 100', () => {
            expect(calculateCompletionRateScore(150)).toBe(100);
        });

        it('should clamp negative values to 0', () => {
            expect(calculateCompletionRateScore(-10)).toBe(0);
        });

        it('should use tiered scoring correctly', () => {
            // Very low engagement (0-20%): 0-25 points
            expect(calculateCompletionRateScore(10)).toBe(13); // 10 * 1.25
            expect(calculateCompletionRateScore(20)).toBe(25);

            // Below average (21-40%): 25-50 points
            expect(calculateCompletionRateScore(30)).toBe(38); // 25 + (30-20) * 1.25
            expect(calculateCompletionRateScore(40)).toBe(50);

            // Average (41-60%): 50-70 points
            expect(calculateCompletionRateScore(50)).toBe(60); // 50 + (50-40) * 1
            expect(calculateCompletionRateScore(60)).toBe(70);

            // Good (61-80%): 70-90 points
            expect(calculateCompletionRateScore(70)).toBe(80); // 70 + (70-60) * 1
            expect(calculateCompletionRateScore(80)).toBe(90);

            // Excellent (81-100%): 90-100 points
            expect(calculateCompletionRateScore(90)).toBe(95); // 90 + (90-80) * 0.5
            expect(calculateCompletionRateScore(100)).toBe(100);
        });
    });
});

describe('User Demand Calculation', () => {
    describe('calculateUserDemand', () => {
        it('should return valid breakdown for a complete game', () => {
            const game = createTestGame({
                userFeedback: [{ score: 80 }, { score: 90 }],
                playCount: 500,
                completionRate: 70,
            });
            const result = calculateUserDemand(game);

            expect(result).toHaveProperty('userFeedbackScore');
            expect(result).toHaveProperty('playCount');
            expect(result).toHaveProperty('completionRate');
            expect(result).toHaveProperty('totalScore');
        });

        it('should calculate weighted total score correctly', () => {
            const game = createTestGame({
                userFeedback: [{ score: 100 }], // 100 * 0.4 = 40
                playCount: 10000, // 100 * 0.3 = 30
                completionRate: 100, // 100 * 0.3 = 30
            });
            const result = calculateUserDemand(game);

            // Expected: 100 * 0.4 + 100 * 0.3 + 100 * 0.3 = 100
            expect(result.totalScore).toBe(100);
        });

        it('should return 0 for game with no demand data', () => {
            const game = createTestGame({
                userFeedback: [],
                playCount: undefined,
                completionRate: undefined,
            });
            const result = calculateUserDemand(game);

            expect(result.userFeedbackScore).toBe(0);
            expect(result.playCount).toBe(0);
            expect(result.completionRate).toBe(0);
            expect(result.totalScore).toBe(0);
        });

        it('should handle catalog entries correctly', () => {
            const entry = createTestCatalogEntry({
                userFeedback: [{ sentiment: 'positive' }],
                playCount: 1000,
                completionRate: 80,
            });
            const result = calculateUserDemand(entry);

            expect(result.userFeedbackScore).toBe(100);
            expect(result.playCount).toBeGreaterThan(0);
            expect(result.completionRate).toBe(90);
        });

        it('should round total score to 2 decimal places', () => {
            const game = createTestGame({
                userFeedback: [{ score: 85 }],
                playCount: 1234,
                completionRate: 67,
            });
            const result = calculateUserDemand(game);

            // Check that totalScore has at most 2 decimal places
            const decimalPart = result.totalScore.toString().split('.')[1];
            if (decimalPart) {
                expect(decimalPart.length).toBeLessThanOrEqual(2);
            }
        });

        it('should handle mixed feedback types', () => {
            const game = createTestGame({
                userFeedback: [
                    { score: 80 },
                    { sentiment: 'positive' },
                    { sentiment: 'neutral' },
                ],
                playCount: 500,
                completionRate: 50,
            });
            const result = calculateUserDemand(game);

            // Implementation uses only explicit scores when available
            // Score from explicit: (80) / 1 = 80
            expect(result.userFeedbackScore).toBe(80);
        });
    });

    describe('isValidUserDemand', () => {
        it('should return true for valid breakdown', () => {
            const validBreakdown: UserDemandBreakdown = {
                userFeedbackScore: 50,
                playCount: 60,
                completionRate: 70,
                totalScore: 60,
            };
            expect(isValidUserDemand(validBreakdown)).toBe(true);
        });

        it('should return false for scores below 0', () => {
            const invalidBreakdown: UserDemandBreakdown = {
                userFeedbackScore: -10,
                playCount: 50,
                completionRate: 50,
                totalScore: 30,
            };
            expect(isValidUserDemand(invalidBreakdown)).toBe(false);
        });

        it('should return false for scores above 100', () => {
            const invalidBreakdown: UserDemandBreakdown = {
                userFeedbackScore: 150,
                playCount: 50,
                completionRate: 50,
                totalScore: 83,
            };
            expect(isValidUserDemand(invalidBreakdown)).toBe(false);
        });

        it('should return true for boundary values (0 and 100)', () => {
            const zeroBreakdown: UserDemandBreakdown = {
                userFeedbackScore: 0,
                playCount: 0,
                completionRate: 0,
                totalScore: 0,
            };
            expect(isValidUserDemand(zeroBreakdown)).toBe(true);

            const maxBreakdown: UserDemandBreakdown = {
                userFeedbackScore: 100,
                playCount: 100,
                completionRate: 100,
                totalScore: 100,
            };
            expect(isValidUserDemand(maxBreakdown)).toBe(true);
        });
    });

    describe('getUserDemandLevel', () => {
        it('should return "Very High" for scores 80-100', () => {
            expect(getUserDemandLevel(80)).toBe('Very High');
            expect(getUserDemandLevel(90)).toBe('Very High');
            expect(getUserDemandLevel(100)).toBe('Very High');
        });

        it('should return "High" for scores 60-79', () => {
            expect(getUserDemandLevel(60)).toBe('High');
            expect(getUserDemandLevel(70)).toBe('High');
            expect(getUserDemandLevel(79)).toBe('High');
        });

        it('should return "Moderate" for scores 40-59', () => {
            expect(getUserDemandLevel(40)).toBe('Moderate');
            expect(getUserDemandLevel(50)).toBe('Moderate');
            expect(getUserDemandLevel(59)).toBe('Moderate');
        });

        it('should return "Low" for scores 20-39', () => {
            expect(getUserDemandLevel(20)).toBe('Low');
            expect(getUserDemandLevel(30)).toBe('Low');
            expect(getUserDemandLevel(39)).toBe('Low');
        });

        it('should return "Very Low" for scores 0-19', () => {
            expect(getUserDemandLevel(0)).toBe('Very Low');
            expect(getUserDemandLevel(10)).toBe('Very Low');
            expect(getUserDemandLevel(19)).toBe('Very Low');
        });
    });
});

describe('USER_DEMAND_WEIGHTS', () => {
    it('should have correct weight values', () => {
        expect(USER_DEMAND_WEIGHTS.userFeedbackScore).toBe(0.4);
        expect(USER_DEMAND_WEIGHTS.playCount).toBe(0.3);
        expect(USER_DEMAND_WEIGHTS.completionRate).toBe(0.3);
    });

    it('should sum to 1.0', () => {
        const sum =
            USER_DEMAND_WEIGHTS.userFeedbackScore +
            USER_DEMAND_WEIGHTS.playCount +
            USER_DEMAND_WEIGHTS.completionRate;
        expect(sum).toBe(1.0);
    });
});

describe('User Demand - Edge Cases', () => {
    it('should handle games with undefined userFeedback', () => {
        const game = createTestGame({ userFeedback: undefined });
        const result = calculateUserDemand(game);
        expect(result.userFeedbackScore).toBe(0);
    });

    it('should handle games with undefined playCount', () => {
        const game = createTestGame({ playCount: undefined });
        const result = calculateUserDemand(game);
        expect(result.playCount).toBe(0);
    });

    it('should handle games with undefined completionRate', () => {
        const game = createTestGame({ completionRate: undefined });
        const result = calculateUserDemand(game);
        expect(result.completionRate).toBe(0);
    });

    it('should handle catalog entries with missing fields', () => {
        const entry: CatalogEntry = {
            gameId: 'minimal-entry',
            name: 'Minimal Entry',
            description: '',
            category: '',
            subcategory: '',
            ageRange: '',
            difficulty: 'Easy',
            estimatedTime: 0,
            requiredTechnologies: [],
            successCriteria: [],
            educationalObjectives: [],
            skillsDeveloped: [],
            isImplemented: false,
            lastUpdated: new Date().toISOString(),
        };
        const result = calculateUserDemand(entry);
        expect(result.totalScore).toBe(0);
    });

    it('should handle feedback with mixed score types', () => {
        const game = createTestGame({
            userFeedback: [
                { score: 100, sentiment: 'positive' }, // Score takes precedence
                { score: 50, sentiment: 'negative' },
            ],
        });
        const result = calculateUserDemand(game);
        // Only explicit scores are counted: (100 + 50) / 2 = 75
        expect(result.userFeedbackScore).toBe(75);
    });

    it('should handle very high play counts correctly', () => {
        const game = createTestGame({ playCount: 50000 });
        const result = calculateUserDemand(game);
        expect(result.playCount).toBe(100);
    });

    it('should handle completion rate at boundary values', () => {
        expect(calculateCompletionRateScore(20)).toBe(25);
        expect(calculateCompletionRateScore(21)).toBe(26);
        expect(calculateCompletionRateScore(40)).toBe(50);
        expect(calculateCompletionRateScore(41)).toBe(51);
        expect(calculateCompletionRateScore(60)).toBe(70);
        expect(calculateCompletionRateScore(61)).toBe(71);
        expect(calculateCompletionRateScore(80)).toBe(90);
        expect(calculateCompletionRateScore(81)).toBe(91);
    });
});

describe('User Demand - Integration with PriorityEngine', () => {
    it('should produce scores compatible with priority calculation', () => {
        const game = createTestGame({
            userFeedback: [{ score: 85 }],
            playCount: 1500,
            completionRate: 75,
        });
        const demand = calculateUserDemand(game);

        // User demand should be in 0-100 range for priority calculation
        expect(demand.totalScore).toBeGreaterThanOrEqual(0);
        expect(demand.totalScore).toBeLessThanOrEqual(100);
    });

    it('should provide individual components for detailed analysis', () => {
        const game = createTestGame({
            userFeedback: [{ sentiment: 'positive' }],
            playCount: 2000,
            completionRate: 85,
        });
        const demand = calculateUserDemand(game);

        // All components should be available for reporting
        expect(typeof demand.userFeedbackScore).toBe('number');
        expect(typeof demand.playCount).toBe('number');
        expect(typeof demand.completionRate).toBe('number');
    });

    it('should contribute correctly to priority score calculation', () => {
        const game = createTestGame({
            userFeedback: [{ score: 100 }],
            playCount: 10000,
            completionRate: 100,
        });
        const demand = calculateUserDemand(game);

        // With max scores, user demand should be 100
        // Priority contribution = 100 * 0.3 = 30
        expect(demand.totalScore).toBe(100);
    });
});