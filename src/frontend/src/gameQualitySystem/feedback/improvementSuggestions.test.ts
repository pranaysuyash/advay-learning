// Improvement Suggestions Tests
// Validates: Requirement 10.4 - "WHEN feedback analysis is complete, THE Feedback_Module SHALL generate improvement suggestions with supporting data"

import { describe, it, expect } from 'vitest';
import {
    generateImprovementSuggestions,
    generateImprovementSuggestionsWithReview,
    filterSuggestionsByCategory,
    filterSuggestionsByPriority,
    getMostImpactfulSuggestion,
    generateSuggestionsSummary,
    DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG,
    type ImprovementSuggestion,
    type ImprovementCategory,
    type ImprovementSuggestionsResult,
} from './improvementSuggestions';
import type { GameMetrics } from '../types';
import type { GameBenchmark, BenchmarkComparisonResult } from './benchmarkComparator';
import type { ReviewRecommendation } from './reviewRecommendation';

// Helper function to create test game metrics
function createTestMetrics(overrides: Partial<GameMetrics> = {}): GameMetrics {
    return {
        gameId: 'game-001',
        playCount: 100,
        completionRate: 45,
        averageScore: 60,
        timeOnTask: 200,
        errorRate: 0.15,
        lastUpdated: new Date().toISOString(),
        ...overrides,
    };
}

// Helper function to create test benchmark
function createTestBenchmark(overrides: Partial<GameBenchmark> = {}): GameBenchmark {
    return {
        gameId: 'game-001',
        gameType: 'puzzle',
        playCount: { target: 500, minimum: 100, maximum: 2000 },
        completionRate: { target: 70, minimum: 40, maximum: 95 },
        averageScore: { target: 75, minimum: 50, maximum: 95 },
        timeOnTask: { target: 300, minimum: 60, maximum: 600 },
        errorRate: { target: 0.05, minimum: 0, maximum: 0.15 },
        ...overrides,
    };
}

// Helper function to create test comparison result
function createTestComparisonResult(overrides: Partial<BenchmarkComparisonResult> = {}): BenchmarkComparisonResult {
    return {
        gameId: 'game-001',
        gameType: 'puzzle',
        comparisonDate: new Date().toISOString(),
        overallStatus: 'needs_attention',
        metricsComparison: {
            playCount: {
                metricName: 'Play_Count',
                actualValue: 100,
                benchmarkTarget: 500,
                benchmarkMinimum: 100,
                benchmarkMaximum: 2000,
                deviation: -400,
                deviationPercentage: -80,
                isWithinRange: true,
                status: 'below_minimum',
            },
            completionRate: {
                metricName: 'Completion_Rate',
                actualValue: 45,
                benchmarkTarget: 70,
                benchmarkMinimum: 40,
                benchmarkMaximum: 95,
                deviation: -25,
                deviationPercentage: -35.71,
                isWithinRange: true,
                status: 'within_range',
            },
            averageScore: {
                metricName: 'Average_Score',
                actualValue: 60,
                benchmarkTarget: 75,
                benchmarkMinimum: 50,
                benchmarkMaximum: 95,
                deviation: -15,
                deviationPercentage: -20,
                isWithinRange: true,
                status: 'within_range',
            },
            timeOnTask: {
                metricName: 'Time_On_Task',
                actualValue: 200,
                benchmarkTarget: 300,
                benchmarkMinimum: 60,
                benchmarkMaximum: 600,
                deviation: -100,
                deviationPercentage: -33.33,
                isWithinRange: true,
                status: 'within_range',
            },
            errorRate: {
                metricName: 'Error_Rate',
                actualValue: 0.15,
                benchmarkTarget: 0.05,
                benchmarkMinimum: 0,
                benchmarkMaximum: 0.15,
                deviation: 0.1,
                deviationPercentage: 200,
                isWithinRange: true,
                status: 'above_maximum',
            },
        },
        totalDeviation: 468.04,
        metricsWithinBenchmark: 5,
        totalMetrics: 5,
        recommendations: ['Consider marketing to increase play count'],
    };
}

describe('Improvement Suggestions', () => {
    describe('generateImprovementSuggestions', () => {
        it('should generate suggestions for metrics below benchmark', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            expect(result.gameId).toBe('game-001');
            expect(result.totalSuggestions).toBeGreaterThan(0);
            expect(result.suggestions.length).toBe(result.totalSuggestions);
        });

        it('should include supporting data with each suggestion', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            for (const suggestion of result.suggestions) {
                expect(suggestion.supportingData).toBeDefined();
                expect(suggestion.supportingData.currentValue).toBeDefined();
                expect(suggestion.supportingData.benchmarkTarget).toBeDefined();
                expect(suggestion.supportingData.deviationPercentage).toBeDefined();
                expect(suggestion.supportingData.evidence).toBeInstanceOf(Array);
                expect(suggestion.supportingData.evidence.length).toBeGreaterThan(0);
                expect(suggestion.supportingData.metricName).toBeDefined();
                expect(suggestion.supportingData.severity).toBeDefined();
            }
        });

        it('should prioritize suggestions by deviation magnitude', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            if (result.suggestions.length >= 2) {
                const highDeviationSuggestion = result.suggestions.find(s =>
                    s.supportingData.deviationPercentage <= -40 || s.supportingData.deviationPercentage >= 100
                );
                if (highDeviationSuggestion) {
                    const highDeviationIndex = result.suggestions.indexOf(highDeviationSuggestion);
                    expect(highDeviationIndex).toBeLessThanOrEqual(1);
                }
            }
        });

        it('should include suggested actions for each suggestion', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            for (const suggestion of result.suggestions) {
                expect(suggestion.suggestedActions).toBeInstanceOf(Array);
                expect(suggestion.suggestedActions.length).toBeGreaterThan(0);
            }
        });

        it('should include estimated impact for each suggestion', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            for (const suggestion of result.suggestions) {
                expect(suggestion.estimatedImpact).toBeDefined();
                expect(['high', 'medium', 'low']).toContain(suggestion.estimatedImpact);
            }
        });

        it('should respect maxSuggestions configuration', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const config = { ...DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG, maxSuggestions: 2 };
            const result = generateImprovementSuggestions(metrics, benchmark, comparison, config);

            expect(result.suggestions.length).toBeLessThanOrEqual(2);
        });

        it('should respect minDeviationPercent configuration', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const config = { ...DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG, minDeviationPercent: 50 };
            const result = generateImprovementSuggestions(metrics, benchmark, comparison, config);

            for (const suggestion of result.suggestions) {
                expect(Math.abs(suggestion.supportingData.deviationPercentage)).toBeGreaterThanOrEqual(50);
            }
        });

        it('should return empty suggestions when all metrics are within acceptable range', () => {
            const metrics = createTestMetrics({
                playCount: 500,
                completionRate: 70,
                averageScore: 75,
                timeOnTask: 300,
                errorRate: 0.05,
            });
            const benchmark = createTestBenchmark();
            const baseComparison = createTestComparisonResult();
            const comparison: BenchmarkComparisonResult = {
                ...baseComparison,
                metricsComparison: {
                    playCount: { ...baseComparison.metricsComparison.playCount, actualValue: 500, deviationPercentage: 0 },
                    completionRate: { ...baseComparison.metricsComparison.completionRate, actualValue: 70, deviationPercentage: 0 },
                    averageScore: { ...baseComparison.metricsComparison.averageScore, actualValue: 75, deviationPercentage: 0 },
                    timeOnTask: { ...baseComparison.metricsComparison.timeOnTask, actualValue: 300, deviationPercentage: 0 },
                    errorRate: { ...baseComparison.metricsComparison.errorRate, actualValue: 0.05, deviationPercentage: 0 },
                },
            };

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            expect(result.totalSuggestions).toBe(0);
            expect(result.suggestions.length).toBe(0);
        });

        it('should include game ID and benchmark type in result', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark({ gameType: 'action' });
            const comparison = createTestComparisonResult({ gameType: 'action' });

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            expect(result.gameId).toBe(metrics.gameId);
            expect(result.basedOnBenchmark).toBe(benchmark.gameType);
        });

        it('should include generation timestamp', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            expect(result.generatedAt).toBeDefined();
            expect(new Date(result.generatedAt).getTime()).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('generateImprovementSuggestionsWithReview', () => {
        it('should include review recommendation when critical', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const reviewRecommendation: ReviewRecommendation = {
                shouldRecommendReview: true,
                reason: 'completion_rate_review',
                completionRate: 30,
                benchmarkTarget: 70,
                deviationPercentage: -57.14,
                severity: 'critical',
                message: 'Completion rate is critically low',
                suggestedActions: ['Review game flow'],
            };

            const result = generateImprovementSuggestionsWithReview(
                metrics,
                benchmark,
                comparison,
                reviewRecommendation
            );

            const highPrioritySuggestions = result.suggestions.filter(s => s.priority === 'high');
            expect(highPrioritySuggestions.length).toBeGreaterThan(0);
        });

        it('should not add extra suggestion when review is not critical', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const reviewRecommendation: ReviewRecommendation = {
                shouldRecommendReview: true,
                reason: 'completion_rate_review',
                completionRate: 55,
                benchmarkTarget: 70,
                deviationPercentage: -21.43,
                severity: 'warning',
                message: 'Completion rate is below benchmark',
                suggestedActions: ['Review game flow'],
            };

            const result = generateImprovementSuggestionsWithReview(
                metrics,
                benchmark,
                comparison,
                reviewRecommendation
            );

            const criticalSuggestions = result.suggestions.filter(
                s => s.priority === 'high' && s.title.includes('Critical')
            );
            expect(criticalSuggestions.length).toBe(0);
        });
    });

    describe('filterSuggestionsByCategory', () => {
        it('should filter suggestions by category', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);
            const completionSuggestions = filterSuggestionsByCategory(result.suggestions, 'completion_rate');

            for (const suggestion of completionSuggestions) {
                expect(suggestion.category).toBe('completion_rate');
            }
        });

        it('should return empty array when no suggestions match category', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);
            const accessibilitySuggestions = filterSuggestionsByCategory(result.suggestions, 'accessibility');

            expect(accessibilitySuggestions.length).toBe(0);
        });
    });

    describe('filterSuggestionsByPriority', () => {
        it('should filter suggestions by priority', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);
            const highPrioritySuggestions = filterSuggestionsByPriority(result.suggestions, 'high');

            for (const suggestion of highPrioritySuggestions) {
                expect(suggestion.priority).toBe('high');
            }
        });
    });

    describe('getMostImpactfulSuggestion', () => {
        it('should return the most impactful suggestion', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);
            const mostImpactful = getMostImpactfulSuggestion(result.suggestions);

            if (result.suggestions.length > 0) {
                expect(mostImpactful).not.toBeNull();
            } else {
                expect(mostImpactful).toBeNull();
            }
        });

        it('should return null for empty suggestions array', () => {
            const result = getMostImpactfulSuggestion([]);
            expect(result).toBeNull();
        });
    });

    describe('generateSuggestionsSummary', () => {
        it('should generate a readable summary', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);
            const summary = generateSuggestionsSummary(result);

            expect(summary).toContain('Improvement Suggestions');
            expect(summary).toContain('game-001');
            expect(summary).toContain('Summary');
            expect(summary).toContain('Total suggestions');
        });

        it('should include supporting data in summary', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);
            const summary = generateSuggestionsSummary(result);

            if (result.suggestions.length > 0) {
                expect(summary).toContain('Supporting Data');
                expect(summary).toContain('Suggested Actions');
            }
        });

        it('should handle empty suggestions', () => {
            const result: ImprovementSuggestionsResult = {
                gameId: 'game-001',
                totalSuggestions: 0,
                suggestions: [],
                highPriorityCount: 0,
                mediumPriorityCount: 0,
                lowPriorityCount: 0,
                generatedAt: new Date().toISOString(),
                basedOnBenchmark: 'puzzle',
            };

            const summary = generateSuggestionsSummary(result);
            expect(summary).toContain('No improvement suggestions');
        });
    });

    describe('Priority counts', () => {
        it('should correctly count suggestions by priority', () => {
            const metrics = createTestMetrics();
            const benchmark = createTestBenchmark();
            const comparison = createTestComparisonResult();

            const result = generateImprovementSuggestions(metrics, benchmark, comparison);

            expect(result.highPriorityCount).toBe(
                result.suggestions.filter(s => s.priority === 'high').length
            );
            expect(result.mediumPriorityCount).toBe(
                result.suggestions.filter(s => s.priority === 'medium').length
            );
            expect(result.lowPriorityCount).toBe(
                result.suggestions.filter(s => s.priority === 'low').length
            );
        });
    });
});

describe('Property 36: Feedback analysis generates improvement suggestions', () => {
    it('WHEN feedback analysis is complete, THE Feedback_Module SHALL generate improvement suggestions with supporting data', () => {
        const metrics = createTestMetrics();
        const benchmark = createTestBenchmark();
        const comparison = createTestComparisonResult();

        const result = generateImprovementSuggestions(metrics, benchmark, comparison);

        expect(result.suggestions.length).toBeGreaterThan(0);

        for (const suggestion of result.suggestions) {
            expect(suggestion.supportingData).toBeDefined();
            expect(suggestion.supportingData.evidence.length).toBeGreaterThan(0);
            expect(suggestion.supportingData.currentValue).toBeDefined();
            expect(suggestion.supportingData.benchmarkTarget).toBeDefined();
            expect(suggestion.supportingData.deviationPercentage).toBeDefined();
        }
    });
});