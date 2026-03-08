// Property tests for Review Recommendation Logic
// Validates: Requirement 10.3 - Low completion rate triggers review recommendation

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { GameMetrics } from '../types';
import type { GameBenchmark, GameType } from './benchmarkComparator';
import {
    shouldRecommendReview,
    batchReviewRecommendations,
    filterGamesNeedingReview,
    getReviewPriority,
    sortByReviewPriority,
    DEFAULT_REVIEW_RECOMMENDATION_CONFIG,
    type ReviewRecommendation,
} from './reviewRecommendation';

// Helper to generate valid game metrics
function genGameMetrics(): fc.Arbitrary<GameMetrics> {
    return fc.record({
        gameId: fc.string({ minLength: 1 }),
        playCount: fc.nat({ max: 10000 }),
        completionRate: fc.nat({ max: 100 }),
        averageScore: fc.nat({ max: 100 }),
        timeOnTask: fc.nat({ max: 3600 }),
        errorRate: fc.nat({ max: 100 }).map(n => n / 100), // 0-1 scale
        lastUpdated: fc.string(),
    });
}

// Helper to generate valid game benchmark
function genGameBenchmark(gameType?: GameType): fc.Arbitrary<GameBenchmark> {
    const types: GameType[] = ['puzzle', 'action', 'educational', 'quiz', 'simulation', 'adventure'];
    const selectedType = gameType ?? fc.oneof(...types.map(fc.constant));

    return fc.record({
        gameId: fc.string({ minLength: 1 }),
        gameType: selectedType,
        playCount: fc.record({
            target: fc.nat({ max: 5000 }),
            minimum: fc.nat({ max: 100 }),
            maximum: fc.nat({ max: 10000 }),
        }),
        completionRate: fc.record({
            target: fc.nat({ min: 10, max: 95 }),
            minimum: fc.nat({ min: 5, max: 50 }),
            maximum: fc.nat({ min: 60, max: 100 }),
        }),
        averageScore: fc.record({
            target: fc.nat({ min: 30, max: 95 }),
            minimum: fc.nat({ min: 10, max: 50 }),
            maximum: fc.nat({ min: 60, max: 100 }),
        }),
        timeOnTask: fc.record({
            target: fc.nat({ min: 60, max: 1800 }),
            minimum: fc.nat({ min: 30, max: 300 }),
            maximum: fc.nat({ min: 600, max: 3600 }),
        }),
        errorRate: fc.record({
            target: fc.nat({ min: 1, max: 20 }).map(n => n / 100), // 0.01-0.2
            minimum: fc.nat({ max: 5 }).map(n => n / 100), // 0-0.05
            maximum: fc.nat({ min: 10, max: 50 }).map(n => n / 100), // 0.1-0.5
        }),
    });
}

describe('Review Recommendation Logic', () => {
    describe('Unit Tests', () => {
        it('should recommend review when completion rate is 25% below benchmark', () => {
            const metrics: GameMetrics = {
                gameId: 'game-1',
                playCount: 100,
                completionRate: 50, // 50% when benchmark is 75%
                averageScore: 75,
                timeOnTask: 300,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const benchmark: GameBenchmark = {
                gameId: 'game-1',
                gameType: 'puzzle',
                playCount: { target: 500, minimum: 100, maximum: 2000 },
                completionRate: { target: 75, minimum: 40, maximum: 95 },
                averageScore: { target: 75, minimum: 50, maximum: 95 },
                timeOnTask: { target: 300, minimum: 60, maximum: 600 },
                errorRate: { target: 0.05, minimum: 0, maximum: 0.15 },
            };

            const result = shouldRecommendReview(metrics, benchmark);

            expect(result.shouldRecommendReview).toBe(true);
            expect(result.reason).toBe('completion_rate_review');
            expect(result.deviationPercentage).toBeCloseTo(-33.33, 1);
            expect(result.severity).toBe('warning');
        });

        it('should NOT recommend review when completion rate is within 20% of benchmark', () => {
            const metrics: GameMetrics = {
                gameId: 'game-2',
                playCount: 100,
                completionRate: 65, // 65% when benchmark is 75% (13.3% below)
                averageScore: 75,
                timeOnTask: 300,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const benchmark: GameBenchmark = {
                gameId: 'game-2',
                gameType: 'puzzle',
                playCount: { target: 500, minimum: 100, maximum: 2000 },
                completionRate: { target: 75, minimum: 40, maximum: 95 },
                averageScore: { target: 75, minimum: 50, maximum: 95 },
                timeOnTask: { target: 300, minimum: 60, maximum: 600 },
                errorRate: { target: 0.05, minimum: 0, maximum: 0.15 },
            };

            const result = shouldRecommendReview(metrics, benchmark);

            expect(result.shouldRecommendReview).toBe(false);
            expect(result.reason).toBe('no_action');
            expect(result.severity).toBe('info');
        });

        it('should recommend review with critical severity when completion rate is 50% below benchmark', () => {
            const metrics: GameMetrics = {
                gameId: 'game-3',
                playCount: 50,
                completionRate: 30, // 30% when benchmark is 60%
                averageScore: 70,
                timeOnTask: 200,
                errorRate: 0.15,
                lastUpdated: new Date().toISOString(),
            };

            const benchmark: GameBenchmark = {
                gameId: 'game-3',
                gameType: 'action',
                playCount: { target: 800, minimum: 200, maximum: 3000 },
                completionRate: { target: 60, minimum: 30, maximum: 90 },
                averageScore: { target: 70, minimum: 45, maximum: 90 },
                timeOnTask: { target: 180, minimum: 30, maximum: 400 },
                errorRate: { target: 0.08, minimum: 0, maximum: 0.2 },
            };

            const result = shouldRecommendReview(metrics, benchmark);

            expect(result.shouldRecommendReview).toBe(true);
            expect(result.severity).toBe('critical');
            expect(result.deviationPercentage).toBeCloseTo(-50, 1);
        });

        it('should NOT recommend review when completion rate is above benchmark', () => {
            const metrics: GameMetrics = {
                gameId: 'game-4',
                playCount: 500,
                completionRate: 85, // 85% when benchmark is 75%
                averageScore: 80,
                timeOnTask: 350,
                errorRate: 0.03,
                lastUpdated: new Date().toISOString(),
            };

            const benchmark: GameBenchmark = {
                gameId: 'game-4',
                gameType: 'educational',
                playCount: { target: 400, minimum: 80, maximum: 1500 },
                completionRate: { target: 80, minimum: 50, maximum: 98 },
                averageScore: { target: 80, minimum: 55, maximum: 95 },
                timeOnTask: { target: 420, minimum: 120, maximum: 900 },
                errorRate: { target: 0.03, minimum: 0, maximum: 0.1 },
            };

            const result = shouldRecommendReview(metrics, benchmark);

            expect(result.shouldRecommendReview).toBe(false);
            expect(result.reason).toBe('no_action');
        });

        it('should include suggested actions when configured', () => {
            const metrics: GameMetrics = {
                gameId: 'game-5',
                playCount: 100,
                completionRate: 40,
                averageScore: 65,
                timeOnTask: 250,
                errorRate: 0.08,
                lastUpdated: new Date().toISOString(),
            };

            const benchmark: GameBenchmark = {
                gameId: 'game-5',
                gameType: 'quiz',
                playCount: { target: 600, minimum: 150, maximum: 2500 },
                completionRate: { target: 85, minimum: 60, maximum: 99 },
                averageScore: { target: 72, minimum: 50, maximum: 90 },
                timeOnTask: { target: 240, minimum: 60, maximum: 480 },
                errorRate: { target: 0.04, minimum: 0, maximum: 0.12 },
            };

            const result = shouldRecommendReview(metrics, benchmark, {
                includeSuggestedActions: true,
            });

            expect(result.suggestedActions.length).toBeGreaterThan(0);
        });

        it('should not include suggested actions when disabled', () => {
            const metrics: GameMetrics = {
                gameId: 'game-6',
                playCount: 100,
                completionRate: 40,
                averageScore: 65,
                timeOnTask: 250,
                errorRate: 0.08,
                lastUpdated: new Date().toISOString(),
            };

            const benchmark: GameBenchmark = {
                gameId: 'game-6',
                gameType: 'quiz',
                playCount: { target: 600, minimum: 150, maximum: 2500 },
                completionRate: { target: 85, minimum: 60, maximum: 99 },
                averageScore: { target: 72, minimum: 50, maximum: 90 },
                timeOnTask: { target: 240, minimum: 60, maximum: 480 },
                errorRate: { target: 0.04, minimum: 0, maximum: 0.12 },
            };

            const result = shouldRecommendReview(metrics, benchmark, {
                includeSuggestedActions: false,
            });

            expect(result.suggestedActions.length).toBe(0);
        });

        it('should handle edge case with zero benchmark target', () => {
            const metrics: GameMetrics = {
                gameId: 'game-7',
                playCount: 100,
                completionRate: 50,
                averageScore: 75,
                timeOnTask: 300,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const benchmark: GameBenchmark = {
                gameId: 'game-7',
                gameType: 'puzzle',
                playCount: { target: 500, minimum: 100, maximum: 2000 },
                completionRate: { target: 0, minimum: 0, maximum: 100 }, // Zero target
                averageScore: { target: 75, minimum: 50, maximum: 95 },
                timeOnTask: { target: 300, minimum: 60, maximum: 600 },
                errorRate: { target: 0.05, minimum: 0, maximum: 0.15 },
            };

            const result = shouldRecommendReview(metrics, benchmark);

            // Should not crash and should return reasonable default
            expect(result.deviationPercentage).toBe(0);
        });

        it('should batch review recommendations correctly', () => {
            const games = [
                {
                    metrics: { gameId: 'g1', playCount: 100, completionRate: 50, averageScore: 75, timeOnTask: 300, errorRate: 0.05, lastUpdated: '' },
                    benchmark: { gameId: 'g1', gameType: 'puzzle' as GameType, playCount: { target: 500, minimum: 100, maximum: 2000 }, completionRate: { target: 75, minimum: 40, maximum: 95 }, averageScore: { target: 75, minimum: 50, maximum: 95 }, timeOnTask: { target: 300, minimum: 60, maximum: 600 }, errorRate: { target: 0.05, minimum: 0, maximum: 0.15 } },
                },
                {
                    metrics: { gameId: 'g2', playCount: 200, completionRate: 70, averageScore: 80, timeOnTask: 350, errorRate: 0.04, lastUpdated: '' },
                    benchmark: { gameId: 'g2', gameType: 'action' as GameType, playCount: { target: 800, minimum: 200, maximum: 3000 }, completionRate: { target: 60, minimum: 30, maximum: 90 }, averageScore: { target: 70, minimum: 45, maximum: 90 }, timeOnTask: { target: 180, minimum: 30, maximum: 400 }, errorRate: { target: 0.08, minimum: 0, maximum: 0.2 } },
                },
            ];

            const results = batchReviewRecommendations(games);

            expect(results).toHaveLength(2);
            expect(results[0].shouldRecommendReview).toBe(true);
            expect(results[1].shouldRecommendReview).toBe(false);
        });

        it('should filter games needing review correctly', () => {
            const games = [
                {
                    metrics: { gameId: 'g1', playCount: 100, completionRate: 50, averageScore: 75, timeOnTask: 300, errorRate: 0.05, lastUpdated: '' },
                    benchmark: { gameId: 'g1', gameType: 'puzzle' as GameType, playCount: { target: 500, minimum: 100, maximum: 2000 }, completionRate: { target: 75, minimum: 40, maximum: 95 }, averageScore: { target: 75, minimum: 50, maximum: 95 }, timeOnTask: { target: 300, minimum: 60, maximum: 600 }, errorRate: { target: 0.05, minimum: 0, maximum: 0.15 } },
                },
                {
                    metrics: { gameId: 'g2', playCount: 200, completionRate: 70, averageScore: 80, timeOnTask: 350, errorRate: 0.04, lastUpdated: '' },
                    benchmark: { gameId: 'g2', gameType: 'action' as GameType, playCount: { target: 800, minimum: 200, maximum: 3000 }, completionRate: { target: 60, minimum: 30, maximum: 90 }, averageScore: { target: 70, minimum: 45, maximum: 90 }, timeOnTask: { target: 180, minimum: 30, maximum: 400 }, errorRate: { target: 0.08, minimum: 0, maximum: 0.2 } },
                },
            ];

            const filtered = filterGamesNeedingReview(games);

            expect(filtered).toHaveLength(1);
            expect(filtered[0].metrics.gameId).toBe('g1');
        });

        it('should sort by review priority correctly', () => {
            const games = [
                {
                    metrics: { gameId: 'g1', playCount: 100, completionRate: 30, averageScore: 75, timeOnTask: 300, errorRate: 0.05, lastUpdated: '' },
                    benchmark: { gameId: 'g1', gameType: 'puzzle' as GameType, playCount: { target: 500, minimum: 100, maximum: 2000 }, completionRate: { target: 75, minimum: 40, maximum: 95 }, averageScore: { target: 75, minimum: 50, maximum: 95 }, timeOnTask: { target: 300, minimum: 60, maximum: 600 }, errorRate: { target: 0.05, minimum: 0, maximum: 0.15 } },
                },
                {
                    metrics: { gameId: 'g2', playCount: 200, completionRate: 45, averageScore: 80, timeOnTask: 350, errorRate: 0.04, lastUpdated: '' },
                    benchmark: { gameId: 'g2', gameType: 'action' as GameType, playCount: { target: 800, minimum: 200, maximum: 3000 }, completionRate: { target: 60, minimum: 30, maximum: 90 }, averageScore: { target: 70, minimum: 45, maximum: 90 }, timeOnTask: { target: 180, minimum: 30, maximum: 400 }, errorRate: { target: 0.08, minimum: 0, maximum: 0.2 } },
                },
            ];

            const withRecommendations = filterGamesNeedingReview(games);
            const sorted = sortByReviewPriority(withRecommendations);

            expect(sorted[0].metrics.gameId).toBe('g1'); // Critical severity
            expect(sorted[1].metrics.gameId).toBe('g2'); // Warning severity
        });

        it('should return correct priority levels', () => {
            expect(getReviewPriority({ severity: 'critical' } as ReviewRecommendation)).toBe(1);
            expect(getReviewPriority({ severity: 'warning' } as ReviewRecommendation)).toBe(2);
            expect(getReviewPriority({ severity: 'info' } as ReviewRecommendation)).toBe(3);
        });
    });

    /**
     * Property 35: Low completion rate triggers review recommendation
     * For any game where the completion rate is below benchmark by more than 20%,
     * the Feedback_Module SHALL recommend review.
     * Validates: Requirements 10.3
     */
    describe('Property 35: Low completion rate triggers review recommendation', () => {
        it('should recommend review when completion rate is more than 20% below benchmark', () => {
            fc.assert(
                fc.property(genGameMetrics(), genGameBenchmark(), (metrics, benchmark) => {
                    // Ensure completion rate is more than 20% below benchmark
                    const deviation = ((metrics.completionRate - benchmark.completionRate.target) / benchmark.completionRate.target) * 100;

                    // Only test when completion rate is significantly below benchmark
                    if (deviation < -20) {
                        const result = shouldRecommendReview(metrics, benchmark);

                        // Property: If completion rate is below benchmark by more than 20%, recommend review
                        expect(result.shouldRecommendReview).toBe(true);
                        expect(result.reason).toBe('completion_rate_review');
                    }
                }),
                { verbose: 0 }
            );
        });

        it('should NOT recommend review when completion rate is within 20% of benchmark', () => {
            fc.assert(
                fc.property(genGameMetrics(), genGameBenchmark(), (metrics, benchmark) => {
                    // Ensure completion rate is within 20% of benchmark (above or equal to -20% deviation)
                    const deviation = ((metrics.completionRate - benchmark.completionRate.target) / benchmark.completionRate.target) * 100;

                    // Only test when completion rate is within acceptable range
                    if (deviation >= -20) {
                        const result = shouldRecommendReview(metrics, benchmark);

                        // Property: If completion rate is within 20% of benchmark, do not recommend review
                        expect(result.shouldRecommendReview).toBe(false);
                        expect(result.reason).toBe('no_action');
                    }
                }),
                { verbose: 0 }
            );
        });

        it('should calculate deviation percentage correctly', () => {
            fc.assert(
                fc.property(genGameMetrics(), genGameBenchmark(), (metrics, benchmark) => {
                    const result = shouldRecommendReview(metrics, benchmark);

                    // Calculate expected deviation
                    const expectedDeviation = benchmark.completionRate.target !== 0
                        ? ((metrics.completionRate - benchmark.completionRate.target) / benchmark.completionRate.target) * 100
                        : 0;

                    expect(result.deviationPercentage).toBeCloseTo(expectedDeviation, 4);
                }),
                { verbose: 0 }
            );
        });

        it('should set severity based on deviation percentage', () => {
            fc.assert(
                fc.property(genGameMetrics(), genGameBenchmark(), (metrics, benchmark) => {
                    const result = shouldRecommendReview(metrics, benchmark);
                    const deviation = result.deviationPercentage;

                    // Verify severity mapping
                    if (deviation <= -40) {
                        expect(result.severity).toBe('critical');
                    } else if (deviation <= -30) {
                        expect(result.severity).toBe('warning');
                    } else {
                        expect(result.severity).toBe('info');
                    }
                }),
                { verbose: 0 }
            );
        });

        it('should include completion rate and benchmark in result', () => {
            fc.assert(
                fc.property(genGameMetrics(), genGameBenchmark(), (metrics, benchmark) => {
                    const result = shouldRecommendReview(metrics, benchmark);

                    expect(result.completionRate).toBe(metrics.completionRate);
                    expect(result.benchmarkTarget).toBe(benchmark.completionRate.target);
                }),
                { verbose: 0 }
            );
        });

        it('should include message in result', () => {
            fc.assert(
                fc.property(genGameMetrics(), genGameBenchmark(), (metrics, benchmark) => {
                    const result = shouldRecommendReview(metrics, benchmark);

                    expect(result.message.length).toBeGreaterThan(0);
                    expect(result.message).toContain(metrics.completionRate.toFixed(1));
                    expect(result.message).toContain(benchmark.completionRate.target.toString());
                }),
                { verbose: 0 }
            );
        });

        it('should handle all game types without errors', () => {
            fc.assert(
                fc.property(genGameMetrics(), genGameBenchmark(), (metrics, benchmark) => {
                    // This test ensures the function doesn't throw for any game type
                    expect(() => shouldRecommendReview(metrics, benchmark)).not.toThrow();
                }),
                { verbose: 0 }
            );
        });

        it('batchReviewRecommendations should return one result per game', () => {
            fc.assert(
                fc.property(fc.array(fc.record({
                    metrics: genGameMetrics(),
                    benchmark: genGameBenchmark(),
                })), (games) => {
                    const results = batchReviewRecommendations(games);

                    expect(results.length).toBe(games.length);
                }),
                { verbose: 0 }
            );
        });

        it('filterGamesNeedingReview should only return games needing review', () => {
            fc.assert(
                fc.property(fc.array(fc.record({
                    metrics: genGameMetrics(),
                    benchmark: genGameBenchmark(),
                })), (games) => {
                    const filtered = filterGamesNeedingReview(games);

                    for (const game of filtered) {
                        expect(game.recommendation.shouldRecommendReview).toBe(true);
                    }
                }),
                { verbose: 0 }
            );
        });
    });
});