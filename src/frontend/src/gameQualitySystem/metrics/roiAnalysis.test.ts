/**
 * Tests for ROI Analysis Module
 * 
 * Tests ROI analysis generation:
 * - Compare 90-day metrics against baseline projections
 * - Generate ROI_analysis
 * 
 * Requirement 5.5
 */

import { describe, it, expect } from 'vitest';
import {
    ROIAnalysisGenerator,
    createROIAnalysisGenerator,
    type NinetyDayMetricsInput,
    type BaselineProjections,
    DEFAULT_ROI_ANALYSIS_CONFIG,
} from './roiAnalysis';

describe('ROIAnalysisGenerator', () => {
    describe('generateROIAnalysis', () => {
        it('should generate ROI analysis with exceeded metrics', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Successful Game',
                metrics: {
                    userAcquisition: 1500,
                    engagementRate: 70,
                    completionRate: 85,
                    feedbackScore: 4.5,
                    bugCount: 5,
                    retentionRate: 45,
                    avgSessionDuration: 350,
                    monthlyActiveUsers: [1000, 1200, 1500],
                    churnRate: 55,
                    ltvEstimate: 8,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            expect(result.gameId).toBe('game-1');
            expect(result.gameName).toBe('Successful Game');
            expect(result.engagementRate.status).toBe('exceeded');
            expect(result.completionRate.status).toBe('exceeded');
            expect(result.feedbackScore.status).toBe('exceeded');
            expect(result.retentionRate.status).toBe('exceeded');
            expect(result.bugCount.status).toBe('exceeded'); // Fewer bugs than max
            expect(result.userAcquisition.status).toBe('exceeded');
            expect(result.overallStatus).toBe('successful');
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        it('should generate ROI analysis with met metrics', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Average Game',
                metrics: {
                    userAcquisition: 1000,
                    engagementRate: 50,
                    completionRate: 70,
                    feedbackScore: 4,
                    bugCount: 15,
                    retentionRate: 30,
                    avgSessionDuration: 300,
                    monthlyActiveUsers: [800, 900, 1000],
                    churnRate: 70,
                    ltvEstimate: 5,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            expect(result.engagementRate.status).toBe('met');
            expect(result.completionRate.status).toBe('met');
            expect(result.feedbackScore.status).toBe('met');
            expect(result.retentionRate.status).toBe('met');
            expect(result.bugCount.status).toBe('met');
            expect(result.userAcquisition.status).toBe('met');
        });

        it('should generate ROI analysis with below metrics', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Struggling Game',
                metrics: {
                    userAcquisition: 300,
                    engagementRate: 20,
                    completionRate: 40,
                    feedbackScore: 2.5,
                    bugCount: 50,
                    retentionRate: 10,
                    avgSessionDuration: 150,
                    monthlyActiveUsers: [200, 250, 300],
                    churnRate: 90,
                    ltvEstimate: 2,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            expect(result.engagementRate.status).toBe('below');
            expect(result.completionRate.status).toBe('below');
            expect(result.feedbackScore.status).toBe('below');
            expect(result.retentionRate.status).toBe('below');
            expect(result.bugCount.status).toBe('below'); // More bugs than max
            expect(result.userAcquisition.status).toBe('below');
            expect(result.overallStatus).toBe('unsuccessful');
        });

        it('should calculate financial metrics correctly', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Test Game',
                metrics: {
                    userAcquisition: 1000,
                    engagementRate: 50,
                    completionRate: 70,
                    feedbackScore: 4,
                    bugCount: 10,
                    retentionRate: 30,
                    avgSessionDuration: 300,
                    monthlyActiveUsers: [800, 900, 1000],
                    churnRate: 70,
                    ltvEstimate: 5,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            expect(result.financial.implementationCost).toBe(5000);
            expect(result.financial.actualLTV).toBeGreaterThan(0);
            expect(result.financial.roi).toBeDefined();
            expect(result.financial.netValue).toBeDefined();
        });

        it('should calculate ROI correctly for profitable game', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Profitable Game',
                metrics: {
                    userAcquisition: 2000,
                    engagementRate: 80,
                    completionRate: 90,
                    feedbackScore: 4.8,
                    bugCount: 5,
                    retentionRate: 60,
                    avgSessionDuration: 400,
                    monthlyActiveUsers: [1500, 1800, 2000],
                    churnRate: 40,
                    ltvEstimate: 12,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            expect(result.financial.roi).toBeGreaterThan(0);
            expect(result.financial.breakEvenAchieved).toBe(true);
            expect(result.financial.netValue).toBeGreaterThan(0);
        });

        it('should calculate ROI correctly for unprofitable game', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Unprofitable Game',
                metrics: {
                    userAcquisition: 200,
                    engagementRate: 15,
                    completionRate: 30,
                    feedbackScore: 2,
                    bugCount: 50,
                    retentionRate: 5,
                    avgSessionDuration: 100,
                    monthlyActiveUsers: [150, 180, 200],
                    churnRate: 95,
                    ltvEstimate: 1,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            expect(result.financial.roi).toBeLessThan(0);
            expect(result.financial.breakEvenAchieved).toBe(false);
            expect(result.financial.netValue).toBeLessThan(0);
        });

        it('should include variance calculations', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Test Game',
                metrics: {
                    userAcquisition: 1500,
                    engagementRate: 75,
                    completionRate: 87.5,
                    feedbackScore: 5,
                    bugCount: 5,
                    retentionRate: 45,
                    avgSessionDuration: 375,
                    monthlyActiveUsers: [1000, 1250, 1500],
                    churnRate: 55,
                    ltvEstimate: 7.5,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            // 75 vs 50 = 50% variance
            expect(result.engagementRate.variance).toBeCloseTo(50, 0);
            // 87.5 vs 70 = 25% variance
            expect(result.completionRate.variance).toBeCloseTo(25, 0);
            // 5 vs 4 = 25% variance
            expect(result.feedbackScore.variance).toBeCloseTo(25, 0);
            // 45 vs 30 = 50% variance
            expect(result.retentionRate.variance).toBeCloseTo(50, 0);
            // 5 vs 20 = -75% variance (fewer bugs)
            expect(result.bugCount.variance).toBeCloseTo(-75, 0);
            // 1500 vs 1000 = 50% variance
            expect(result.userAcquisition.variance).toBeCloseTo(50, 0);
        });

        it('should include timestamp in result', () => {
            const generator = createROIAnalysisGenerator();
            const metrics: NinetyDayMetricsInput = {
                gameId: 'game-1',
                gameName: 'Test Game',
                metrics: {
                    userAcquisition: 1000,
                    engagementRate: 50,
                    completionRate: 70,
                    feedbackScore: 4,
                    bugCount: 10,
                    retentionRate: 30,
                    avgSessionDuration: 300,
                    monthlyActiveUsers: [800, 900, 1000],
                    churnRate: 70,
                    ltvEstimate: 5,
                },
                implementationCost: 5000,
            };
            const baseline: BaselineProjections = {
                targetEngagementRate: 50,
                targetCompletionRate: 70,
                targetFeedbackScore: 4,
                targetRetentionRate: 30,
                maxBugCount: 20,
                estimatedImplementationCost: 5000,
                expectedLTV: 5,
                projectedUserAcquisition: 1000,
            };

            const result = generator.generateROIAnalysis(metrics, baseline);

            expect(result.analyzedAt).toBeDefined();
            expect(new Date(result.analyzedAt).getTime()).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('generateImprovementROIAnalysis', () => {
        it('should analyze improvement ROI correctly', () => {
            const generator = createROIAnalysisGenerator();
            const baseline = {
                qualityScore: 50,
                userEngagement: 40,
                completionRate: 60,
                bugCount: 20,
                timestamp: '2024-01-01',
            };
            const outcome = {
                qualityScore: 75,
                userEngagement: 50,
                completionRate: 75,
                bugCount: 10,
                timestamp: '2024-02-01',
            };

            const result = generator.generateImprovementROIAnalysis(
                'game-1',
                'Improved Game',
                baseline,
                outcome,
                1000
            );

            expect(result.qualityImprovement).toBe(50); // (75-50)/50 * 100
            expect(result.engagementImprovement).toBe(25); // (50-40)/40 * 100
            expect(result.completionImprovement).toBe(25); // (75-60)/60 * 100
            expect(result.bugReduction).toBe(50); // (10-20)/20 * 100
            expect(result.overallScore).toBeGreaterThan(0);
            expect(result.status).toBeDefined();
        });

        it('should calculate ROI for improvement', () => {
            const generator = createROIAnalysisGenerator();
            const baseline = {
                qualityScore: 50,
                userEngagement: 40,
                completionRate: 60,
                bugCount: 20,
                timestamp: '2024-01-01',
            };
            const outcome = {
                qualityScore: 100,
                userEngagement: 80,
                completionRate: 90,
                bugCount: 5,
                timestamp: '2024-02-01',
            };

            const result = generator.generateImprovementROIAnalysis(
                'game-1',
                'Greatly Improved Game',
                baseline,
                outcome,
                500
            );

            // High improvements should result in positive ROI
            expect(result.roi).toBeGreaterThan(0);
            expect(result.status).toBe('successful');
        });
    });

    describe('getConfig', () => {
        it('should return the configuration', () => {
            const generator = createROIAnalysisGenerator({ successThreshold: 80 });
            const config = generator.getConfig();

            expect(config.successThreshold).toBe(80);
            expect(config).toEqual({ ...DEFAULT_ROI_ANALYSIS_CONFIG, successThreshold: 80 });
        });
    });
});

describe('createROIAnalysisGenerator', () => {
    it('should create a generator with default config', () => {
        const generator = createROIAnalysisGenerator();

        expect(generator).toBeInstanceOf(ROIAnalysisGenerator);
    });

    it('should create a generator with custom config', () => {
        const generator = createROIAnalysisGenerator({
            varianceThreshold: 15,
            successThreshold: 80,
            marginalThreshold: 50,
        });

        expect(generator.getConfig().varianceThreshold).toBe(15);
        expect(generator.getConfig().successThreshold).toBe(80);
        expect(generator.getConfig().marginalThreshold).toBe(50);
    });
});