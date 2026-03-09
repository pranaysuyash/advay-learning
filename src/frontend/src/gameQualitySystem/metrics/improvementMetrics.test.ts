/**
 * Tests for Improvement Metrics Module
 * 
 * Tests improvement metrics tracking:
 * - Quality_Score_Improvement
 * - User_Engagement_Change
 * - Completion_Rate_Change
 * - Bug_Report_Reduction
 * 
 * Requirement 4.1
 */

import { describe, it, expect } from 'vitest';
import {
    ImprovementMetricsCalculator,
    createImprovementMetricsCalculator,
    type ImprovementBaseline,
    type ImprovementOutcome,
    DEFAULT_IMPROVEMENT_METRICS_CONFIG,
} from './improvementMetrics';

describe('ImprovementMetricsCalculator', () => {
    describe('calculateImprovementMetrics', () => {
        it('should calculate quality score improvement correctly', () => {
            const calculator = createImprovementMetricsCalculator();
            const baseline: ImprovementBaseline = {
                qualityScore: 50,
                userEngagement: 0,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 75,
                userEngagement: 0,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.qualityScoreImprovement).toBe(50); // (75-50)/50 * 100 = 50%
        });

        it('should calculate user engagement change correctly', () => {
            const calculator = createImprovementMetricsCalculator();
            const baseline: ImprovementBaseline = {
                qualityScore: 0,
                userEngagement: 40,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 0,
                userEngagement: 50,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.userEngagementChange).toBe(25); // (50-40)/40 * 100 = 25%
        });

        it('should calculate completion rate change correctly', () => {
            const calculator = createImprovementMetricsCalculator();
            const baseline: ImprovementBaseline = {
                qualityScore: 0,
                userEngagement: 0,
                completionRate: 60,
                bugCount: 0,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 0,
                userEngagement: 0,
                completionRate: 75,
                bugCount: 0,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.completionRateChange).toBe(25); // (75-60)/60 * 100 = 25%
        });

        it('should calculate bug report reduction correctly (positive when bugs decrease)', () => {
            const calculator = createImprovementMetricsCalculator();
            const baseline: ImprovementBaseline = {
                qualityScore: 0,
                userEngagement: 0,
                completionRate: 0,
                bugCount: 20,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 0,
                userEngagement: 0,
                completionRate: 0,
                bugCount: 10,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.bugReportReduction).toBe(50); // (20-10)/20 * 100 = 50%
        });

        it('should handle zero baseline bug count', () => {
            const calculator = createImprovementMetricsCalculator();
            const baseline: ImprovementBaseline = {
                qualityScore: 0,
                userEngagement: 0,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 50,
                userEngagement: 50,
                completionRate: 50,
                bugCount: 10,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.qualityScoreImprovement).toBe(100); // From 0 to 50 = 100%
            expect(result.userEngagementChange).toBe(100); // From 0 to 50 = 100%
            expect(result.completionRateChange).toBe(100); // From 0 to 50 = 100%
            expect(result.bugReportReduction).toBe(0); // From 0 to 10 = 0% (can't calculate reduction from 0)
        });

        it('should calculate overall improvement score with weighted average', () => {
            const calculator = createImprovementMetricsCalculator();
            const baseline: ImprovementBaseline = {
                qualityScore: 50,
                userEngagement: 40,
                completionRate: 60,
                bugCount: 20,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 75, // +50%
                userEngagement: 50, // +25%
                completionRate: 75, // +25%
                bugCount: 10, // -50%
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            // Expected: 50*0.35 + 25*0.30 + 25*0.25 + 50*0.10 = 17.5 + 7.5 + 6.25 + 5 = 36.25
            expect(result.overallImprovementScore).toBeCloseTo(36.25, 1);
        });

        it('should honor bugReductionPositive when bug growth should count as positive', () => {
            const calculator = createImprovementMetricsCalculator({
                bugReductionPositive: false,
            });
            const baseline: ImprovementBaseline = {
                qualityScore: 50,
                userEngagement: 40,
                completionRate: 60,
                bugCount: 20,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 75,
                userEngagement: 50,
                completionRate: 75,
                bugCount: 10,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.bugReportReduction).toBe(-50);
            expect(result.overallImprovementScore).toBeCloseTo(26.25, 1);
        });

        it('should flag as statistically significant when change exceeds threshold', () => {
            const calculator = createImprovementMetricsCalculator({ statisticalThreshold: 10 });
            const baseline: ImprovementBaseline = {
                qualityScore: 50,
                userEngagement: 0,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 75, // +50% (exceeds 10% threshold)
                userEngagement: 0,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.isStatisticallySignificant).toBe(true);
        });

        it('should not flag as statistically significant when change is below threshold', () => {
            const calculator = createImprovementMetricsCalculator({ statisticalThreshold: 10 });
            const baseline: ImprovementBaseline = {
                qualityScore: 50,
                userEngagement: 0,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 52, // +4% (below 10% threshold)
                userEngagement: 0,
                completionRate: 0,
                bugCount: 0,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.isStatisticallySignificant).toBe(false);
        });

        it('should include baseline and outcome in result', () => {
            const calculator = createImprovementMetricsCalculator();
            const baseline: ImprovementBaseline = {
                qualityScore: 50,
                userEngagement: 40,
                completionRate: 60,
                bugCount: 20,
                timestamp: '2024-01-01T00:00:00Z',
            };
            const outcome: ImprovementOutcome = {
                qualityScore: 75,
                userEngagement: 50,
                completionRate: 75,
                bugCount: 10,
                timestamp: '2024-02-01T00:00:00Z',
            };

            const result = calculator.calculateImprovementMetrics('game-1', baseline, outcome);

            expect(result.baseline).toEqual(baseline);
            expect(result.outcome).toEqual(outcome);
            expect(result.gameId).toBe('game-1');
            expect(result.calculatedAt).toBeDefined();
        });
    });

    describe('calculateFromAuditReports', () => {
        it('should calculate metrics from audit reports', () => {
            const calculator = createImprovementMetricsCalculator();
            const beforeAudit = {
                gameId: 'game-1',
                gameName: 'Test Game',
                auditDate: '2024-01-01T00:00:00Z',
                auditor: 'test',
                scores: [],
                totalScore: 50,
                isFlaggedForImprovement: true,
                improvementRecommendations: [],
            };
            const afterAudit = {
                gameId: 'game-1',
                gameName: 'Test Game',
                auditDate: '2024-02-01T00:00:00Z',
                auditor: 'test',
                scores: [],
                totalScore: 75,
                isFlaggedForImprovement: false,
                improvementRecommendations: [],
            };

            const result = calculator.calculateFromAuditReports('game-1', beforeAudit, afterAudit);

            expect(result.qualityScoreImprovement).toBe(50);
            expect(result.gameId).toBe('game-1');
        });
    });

    describe('generateSummary', () => {
        it('should return empty summary for empty metrics array', () => {
            const calculator = createImprovementMetricsCalculator();
            const summary = calculator.generateSummary([]);

            expect(summary.totalGames).toBe(0);
            expect(summary.avgQualityImprovement).toBe(0);
            expect(summary.significantImprovements).toBe(0);
        });

        it('should calculate average metrics correctly', () => {
            const calculator = createImprovementMetricsCalculator();
            const metrics = [
                calculator.calculateImprovementMetrics('game-1', {
                    qualityScore: 50, userEngagement: 40, completionRate: 60, bugCount: 20, timestamp: '2024-01-01',
                }, {
                    qualityScore: 75, userEngagement: 50, completionRate: 75, bugCount: 10, timestamp: '2024-02-01',
                }),
                calculator.calculateImprovementMetrics('game-2', {
                    qualityScore: 40, userEngagement: 30, completionRate: 50, bugCount: 30, timestamp: '2024-01-01',
                }, {
                    qualityScore: 60, userEngagement: 45, completionRate: 70, bugCount: 15, timestamp: '2024-02-01',
                }),
            ];

            const summary = calculator.generateSummary(metrics);

            expect(summary.totalGames).toBe(2);
            expect(summary.avgQualityImprovement).toBeCloseTo(50, 1); // (50 + 50) / 2
            expect(summary.avgEngagementChange).toBeCloseTo(37.5, 1); // (25 + 50) / 2
            expect(summary.avgCompletionRateChange).toBeCloseTo(32.5, 1); // (25 + 40) / 2
            expect(summary.avgBugReduction).toBeCloseTo(50, 1); // (50 + 50) / 2
            expect(summary.significantImprovements).toBe(2);
            expect(summary.gamesNeedingReview).toBe(0);
        });

        it('should count games needing review correctly', () => {
            const calculator = createImprovementMetricsCalculator({ statisticalThreshold: 50 });
            const metrics = [
                calculator.calculateImprovementMetrics('game-1', {
                    qualityScore: 50, userEngagement: 40, completionRate: 60, bugCount: 20, timestamp: '2024-01-01',
                }, {
                    qualityScore: 75, userEngagement: 50, completionRate: 75, bugCount: 10, timestamp: '2024-02-01',
                }),
                calculator.calculateImprovementMetrics('game-2', {
                    qualityScore: 50, userEngagement: 40, completionRate: 60, bugCount: 20, timestamp: '2024-01-01',
                }, {
                    qualityScore: 52, userEngagement: 42, completionRate: 62, bugCount: 18, timestamp: '2024-02-01',
                }),
            ];

            const summary = calculator.generateSummary(metrics);

            expect(summary.significantImprovements).toBe(1);
            expect(summary.gamesNeedingReview).toBe(1);
        });
    });

    describe('getConfig', () => {
        it('should return the configuration', () => {
            const calculator = createImprovementMetricsCalculator({ statisticalThreshold: 15 });
            const config = calculator.getConfig();

            expect(config.statisticalThreshold).toBe(15);
            expect(config).toEqual({ ...DEFAULT_IMPROVEMENT_METRICS_CONFIG, statisticalThreshold: 15 });
        });
    });
});

describe('createImprovementMetricsCalculator', () => {
    it('should create a calculator with default config', () => {
        const calculator = createImprovementMetricsCalculator();

        expect(calculator).toBeInstanceOf(ImprovementMetricsCalculator);
    });

    it('should create a calculator with custom config', () => {
        const calculator = createImprovementMetricsCalculator({
            statisticalThreshold: 20,
            minSampleSize: 50,
        });

        expect(calculator.getConfig().statisticalThreshold).toBe(20);
        expect(calculator.getConfig().minSampleSize).toBe(50);
    });
});
