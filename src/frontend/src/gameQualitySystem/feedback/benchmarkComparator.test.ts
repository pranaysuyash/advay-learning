// Benchmark Comparison Tests for Feedback Module
// Tests for comparing metrics against game-specific benchmarks
// Validates: Requirement 10.2

import { describe, it, expect } from 'vitest';
import {
    compareAgainstBenchmark,
    createGameBenchmark,
    calculateDeviation,
    isWithinBenchmark,
    getMetricStatus,
    DEFAULT_BENCHMARKS,
    type GameMetrics,
    type GameBenchmark,
} from './benchmarkComparator';

describe('Benchmark Comparison', () => {
    describe('createGameBenchmark', () => {
        it('should create a benchmark with default values for puzzle game type', () => {
            const benchmark = createGameBenchmark('game-1', 'puzzle');

            expect(benchmark.gameId).toBe('game-1');
            expect(benchmark.gameType).toBe('puzzle');
            expect(benchmark.playCount.target).toBe(500);
            expect(benchmark.completionRate.target).toBe(70);
            expect(benchmark.averageScore.target).toBe(75);
            expect(benchmark.timeOnTask.target).toBe(300);
            expect(benchmark.errorRate.target).toBe(0.05);
        });

        it('should create a benchmark with default values for educational game type', () => {
            const benchmark = createGameBenchmark('game-2', 'educational');

            expect(benchmark.gameId).toBe('game-2');
            expect(benchmark.gameType).toBe('educational');
            expect(benchmark.completionRate.target).toBe(80); // Educational games have higher target
            expect(benchmark.errorRate.target).toBe(0.03); // Educational games have lower error rate target
        });

        it('should allow overriding specific benchmark values', () => {
            const benchmark = createGameBenchmark('game-3', 'puzzle', {
                playCount: { target: 1000, minimum: 500, maximum: 2000 },
                completionRate: { target: 90, minimum: 70, maximum: 100 },
            });

            expect(benchmark.playCount.target).toBe(1000);
            expect(benchmark.completionRate.target).toBe(90);
            // Other values should remain default
            expect(benchmark.averageScore.target).toBe(75);
        });
    });

    describe('DEFAULT_BENCHMARKS', () => {
        it('should have benchmarks for all game types', () => {
            const gameTypes: Array<'puzzle' | 'action' | 'educational' | 'quiz' | 'simulation' | 'adventure'> = [
                'puzzle', 'action', 'educational', 'quiz', 'simulation', 'adventure'
            ];

            for (const gameType of gameTypes) {
                expect(DEFAULT_BENCHMARKS[gameType]).toBeDefined();
                expect(DEFAULT_BENCHMARKS[gameType].playCount.target).toBeGreaterThan(0);
                expect(DEFAULT_BENCHMARKS[gameType].completionRate.target).toBeGreaterThan(0);
                expect(DEFAULT_BENCHMARKS[gameType].averageScore.target).toBeGreaterThan(0);
            }
        });

        it('should have educational games with highest completion rate target', () => {
            expect(DEFAULT_BENCHMARKS.educational.completionRate.target).toBe(80);
            expect(DEFAULT_BENCHMARKS.educational.completionRate.target).toBeGreaterThan(
                DEFAULT_BENCHMARKS.action.completionRate.target
            );
        });

        it('should have action games with highest play count target', () => {
            expect(DEFAULT_BENCHMARKS.action.playCount.target).toBe(800);
            expect(DEFAULT_BENCHMARKS.action.playCount.target).toBeGreaterThan(
                DEFAULT_BENCHMARKS.simulation.playCount.target
            );
        });
    });

    describe('compareAgainstBenchmark', () => {
        const createTestMetrics = (overrides: Partial<GameMetrics> = {}): GameMetrics => ({
            gameId: 'test-game',
            playCount: 500,
            completionRate: 70,
            averageScore: 75,
            timeOnTask: 300,
            errorRate: 0.05,
            lastUpdated: new Date().toISOString(),
            ...overrides,
        });

        it('should return meets_benchmark when all metrics are within range', () => {
            const metrics = createTestMetrics();
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.overallStatus).toBe('meets_benchmark');
            expect(result.metricsWithinBenchmark).toBe(5);
            expect(result.totalMetrics).toBe(5);
        });

        it('should return needs_attention when some metrics are below minimum', () => {
            const metrics = createTestMetrics({
                playCount: 50, // Below minimum of 100
                completionRate: 35, // Below minimum of 40
            });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.overallStatus).toBe('below_standard');
            expect(result.metricsWithinBenchmark).toBeLessThan(5);
        });

        it('should correctly compare play count metric', () => {
            const metrics = createTestMetrics({ playCount: 600 });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.metricsComparison.playCount.actualValue).toBe(600);
            expect(result.metricsComparison.playCount.benchmarkTarget).toBe(500);
            expect(result.metricsComparison.playCount.deviation).toBe(100);
            expect(result.metricsComparison.playCount.deviationPercentage).toBe(20);
            expect(result.metricsComparison.playCount.status).toBe('above_target');
        });

        it('should correctly compare completion rate metric', () => {
            const metrics = createTestMetrics({ completionRate: 50 });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.metricsComparison.completionRate.actualValue).toBe(50);
            expect(result.metricsComparison.completionRate.benchmarkTarget).toBe(70);
            expect(result.metricsComparison.completionRate.deviation).toBe(-20);
            expect(result.metricsComparison.completionRate.deviationPercentage).toBeCloseTo(-28.57, 1);
            expect(result.metricsComparison.completionRate.status).toBe('within_range');
        });

        it('should correctly identify below_minimum status', () => {
            const metrics = createTestMetrics({ completionRate: 30 });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.metricsComparison.completionRate.status).toBe('below_minimum');
            expect(result.metricsComparison.completionRate.isWithinRange).toBe(false);
        });

        it('should correctly identify above_maximum status', () => {
            const metrics = createTestMetrics({ playCount: 2500 });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.metricsComparison.playCount.status).toBe('above_maximum');
            expect(result.metricsComparison.playCount.isWithinRange).toBe(false);
        });

        it('should calculate total deviation correctly', () => {
            const metrics = createTestMetrics({
                playCount: 600, // +20% deviation
                completionRate: 60, // -14.29% deviation
            });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            // Total deviation should be sum of absolute deviations
            expect(result.totalDeviation).toBeCloseTo(34.29, 1);
        });

        it('should generate recommendations for below_minimum metrics', () => {
            const metrics = createTestMetrics({
                playCount: 50, // Below minimum
                errorRate: 0.2, // Above maximum
            });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations.some(r => r.includes('marketing'))).toBe(true);
            expect(result.recommendations.some(r => r.includes('error rate'))).toBe(true);
        });

        it('should include review recommendation when completion rate is >20% below benchmark', () => {
            // 70 target, 55 actual = 21.4% below = should trigger review recommendation
            const metrics = createTestMetrics({ completionRate: 55 });
            const benchmark = createGameBenchmark('test-game', 'puzzle');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.recommendations.some(r =>
                r.includes('20%') && r.includes('review')
            )).toBe(true);
        });

        it('should handle educational game type with appropriate benchmarks', () => {
            const metrics: GameMetrics = {
                gameId: 'edu-game',
                playCount: 400,
                completionRate: 80,
                averageScore: 80,
                timeOnTask: 420,
                errorRate: 0.03,
                lastUpdated: new Date().toISOString(),
            };
            const benchmark = createGameBenchmark('edu-game', 'educational');

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.gameType).toBe('educational');
            expect(result.overallStatus).toBe('meets_benchmark');
        });

        it('should include comparison date in result', () => {
            const metrics = createTestMetrics();
            const benchmark = createGameBenchmark('test-game', 'puzzle');
            const beforeTime = new Date().toISOString();

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.comparisonDate).toBeDefined();
            expect(result.comparisonDate >= beforeTime).toBe(true);
        });
    });

    describe('calculateDeviation', () => {
        it('should calculate positive deviation correctly', () => {
            expect(calculateDeviation(120, 100)).toBe(20);
        });

        it('should calculate negative deviation correctly', () => {
            expect(calculateDeviation(80, 100)).toBe(-20);
        });

        it('should return 0 when target is 0 and actual is 0', () => {
            expect(calculateDeviation(0, 0)).toBe(0);
        });

        it('should return 100 when target is 0 and actual is positive', () => {
            expect(calculateDeviation(50, 0)).toBe(100);
        });
    });

    describe('isWithinBenchmark', () => {
        it('should return true when value is within range', () => {
            expect(isWithinBenchmark(500, 100, 2000)).toBe(true);
            expect(isWithinBenchmark(100, 100, 2000)).toBe(true);
            expect(isWithinBenchmark(2000, 100, 2000)).toBe(true);
        });

        it('should return false when value is below minimum', () => {
            expect(isWithinBenchmark(50, 100, 2000)).toBe(false);
        });

        it('should return false when value is above maximum', () => {
            expect(isWithinBenchmark(2500, 100, 2000)).toBe(false);
        });
    });

    describe('getMetricStatus', () => {
        it('should return below_minimum when value is below minimum', () => {
            expect(getMetricStatus(50, 100, 100, 2000)).toBe('below_minimum');
        });

        it('should return above_maximum when value is above maximum', () => {
            expect(getMetricStatus(2500, 100, 100, 2000)).toBe('above_maximum');
        });

        it('should return above_target when value is at or above target', () => {
            expect(getMetricStatus(100, 100, 50, 2000)).toBe('above_target');
            expect(getMetricStatus(150, 100, 50, 2000)).toBe('above_target');
        });

        it('should return within_range when value is between minimum and target', () => {
            expect(getMetricStatus(75, 100, 50, 2000)).toBe('within_range');
        });
    });
});

describe('Benchmark Comparison - Edge Cases', () => {
    it('should handle zero play count', () => {
        const metrics: GameMetrics = {
            gameId: 'test-game',
            playCount: 0,
            completionRate: 0,
            averageScore: 0,
            timeOnTask: 0,
            errorRate: 0,
            lastUpdated: new Date().toISOString(),
        };
        const benchmark = createGameBenchmark('test-game', 'puzzle');

        const result = compareAgainstBenchmark(metrics, benchmark);

        expect(result.metricsComparison.playCount.status).toBe('below_minimum');
        expect(result.overallStatus).toBe('below_standard');
    });

    it('should handle maximum values without overflow', () => {
        const metrics: GameMetrics = {
            gameId: 'test-game',
            playCount: 10000,
            completionRate: 100,
            averageScore: 100,
            timeOnTask: 10000,
            errorRate: 1,
            lastUpdated: new Date().toISOString(),
        };
        const benchmark = createGameBenchmark('test-game', 'puzzle');

        const result = compareAgainstBenchmark(metrics, benchmark);

        expect(result.metricsComparison.playCount.status).toBe('above_maximum');
        expect(result.metricsComparison.errorRate.status).toBe('above_maximum');
    });

    it('should handle all game types consistently', () => {
        const gameTypes = ['puzzle', 'action', 'educational', 'quiz', 'simulation', 'adventure'] as const;

        for (const gameType of gameTypes) {
            const metrics: GameMetrics = {
                gameId: `test-${gameType}`,
                playCount: DEFAULT_BENCHMARKS[gameType].playCount.target,
                completionRate: DEFAULT_BENCHMARKS[gameType].completionRate.target,
                averageScore: DEFAULT_BENCHMARKS[gameType].averageScore.target,
                timeOnTask: DEFAULT_BENCHMARKS[gameType].timeOnTask.target,
                errorRate: DEFAULT_BENCHMARKS[gameType].errorRate.target,
                lastUpdated: new Date().toISOString(),
            };
            const benchmark = createGameBenchmark(`test-${gameType}`, gameType);

            const result = compareAgainstBenchmark(metrics, benchmark);

            expect(result.overallStatus).toBe('meets_benchmark');
            expect(result.metricsWithinBenchmark).toBe(5);
        }
    });
});