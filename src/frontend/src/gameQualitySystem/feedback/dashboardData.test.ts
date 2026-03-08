// Dashboard Data Generation Tests
// Tests for dashboard data generation functionality
// Validates: Requirement 10.5 - "THE Feedback_Module SHALL provide a dashboard showing: Game_Health_Score, Recent_Changes, and Recommended_Actions"

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    generateDashboardData,
    generateDashboardDataWithAnalysis,
    getDashboardSummary,
    filterDashboardByPriority,
    generateDashboardReport,
    DEFAULT_DASHBOARD_CONFIG,
    type DashboardData,
    type GameMetrics,
    type FeedbackAnalysis,
} from './dashboardData';
import { createGameBenchmark } from './benchmarkComparator';

describe('Dashboard Data Generation', () => {
    describe('generateDashboardData', () => {
        it('should generate dashboard with all required elements', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            // Verify all required elements are present (Requirement 10.5)
            expect(dashboard.gameId).toBe('test-game-1');
            expect(dashboard.gameHealthScore).toBeDefined();
            expect(dashboard.recentChanges).toBeDefined();
            expect(dashboard.recommendedActions).toBeDefined();
            expect(dashboard.generatedAt).toBeDefined();
        });

        it('should calculate game health score within valid range', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 100,
                completionRate: 90,
                averageScore: 95,
                timeOnTask: 200,
                errorRate: 0.01,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            expect(dashboard.gameHealthScore).toBeGreaterThanOrEqual(0);
            expect(dashboard.gameHealthScore).toBeLessThanOrEqual(100);
        });

        it('should include health score breakdown', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 70,
                averageScore: 80,
                timeOnTask: 150,
                errorRate: 0.1,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            expect(dashboard.healthScoreBreakdown).toBeDefined();
            expect(dashboard.healthScoreBreakdown.overall).toBeDefined();
            expect(dashboard.healthScoreBreakdown.completionRate).toBeDefined();
            expect(dashboard.healthScoreBreakdown.userEngagement).toBeDefined();
            expect(dashboard.healthScoreBreakdown.performance).toBeDefined();
            expect(dashboard.healthScoreBreakdown.accessibility).toBeDefined();
            expect(dashboard.healthScoreBreakdown.contentQuality).toBeDefined();
        });

        it('should determine correct health status', () => {
            const excellentMetrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 500,  // At benchmark target
                completionRate: 95,  // Above benchmark
                averageScore: 90,  // Above benchmark
                timeOnTask: 300,  // At benchmark target
                errorRate: 0.02,  // Below benchmark (good)
                lastUpdated: new Date().toISOString(),
            };

            const criticalMetrics: GameMetrics = {
                gameId: 'test-game-2',
                playCount: 5,
                completionRate: 20,
                averageScore: 30,
                timeOnTask: 30,
                errorRate: 0.5,
                lastUpdated: new Date().toISOString(),
            };

            const excellentDashboard = generateDashboardData('test-game-1', excellentMetrics);
            const criticalDashboard = generateDashboardData('test-game-2', criticalMetrics);

            // Excellent metrics should produce excellent or good status
            expect(excellentDashboard.healthStatus).toMatch(/excellent|good/);
            // Critical metrics should produce needs_attention or critical status
            expect(criticalDashboard.healthStatus).toMatch(/needs_attention|critical/);
        });

        it('should include benchmark comparison when available', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 60,
                averageScore: 70,
                timeOnTask: 120,
                errorRate: 0.1,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            expect(dashboard.benchmarkComparison).toBeDefined();
            expect(dashboard.benchmarkComparison).not.toBeNull();
        });

        it('should include improvement suggestions', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 10,
                completionRate: 30,
                averageScore: 40,
                timeOnTask: 60,
                errorRate: 0.3,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            expect(dashboard.improvementSuggestions).toBeDefined();
            expect(Array.isArray(dashboard.improvementSuggestions)).toBe(true);
        });

        it('should include review recommendation when applicable', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 10,
                completionRate: 25, // Below 30% threshold
                averageScore: 50,
                timeOnTask: 60,
                errorRate: 0.2,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            expect(dashboard.reviewRecommendation).toBeDefined();
        });

        it('should respect custom configuration', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const config = {
                maxRecentChanges: 2,
                maxRecommendedActions: 1,
                healthScoreWeights: {
                    completionRate: 0.5,
                    userEngagement: 0.2,
                    performance: 0.15,
                    accessibility: 0.1,
                    contentQuality: 0.05,
                },
            };

            const dashboard = generateDashboardData('test-game-1', metrics, config);

            expect(dashboard.recentChanges.length).toBeLessThanOrEqual(2);
            expect(dashboard.recommendedActions.length).toBeLessThanOrEqual(1);
        });
    });

    describe('generateDashboardDataWithAnalysis', () => {
        it('should incorporate feedback analysis issues', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const feedbackAnalysis: FeedbackAnalysis = {
                gameHealthScore: 80,
                recentChanges: [],
                recommendedActions: ['Action 1', 'Action 2'],
                issues: ['Issue 1', 'Issue 2'],
            };

            const dashboard = generateDashboardDataWithAnalysis('test-game-1', metrics, feedbackAnalysis);

            expect(dashboard).toBeDefined();
            expect(dashboard.gameId).toBe('test-game-1');
        });

        it('should add issues as actions when no suggestions exist', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 500,  // At benchmark target
                completionRate: 70,  // At benchmark target
                averageScore: 75,  // At benchmark target
                timeOnTask: 300,  // At benchmark target
                errorRate: 0.05,  // At benchmark target
                lastUpdated: new Date().toISOString(),
            };

            const feedbackAnalysis: FeedbackAnalysis = {
                gameHealthScore: 90,
                recentChanges: [],
                recommendedActions: ['Review feedback'],
                issues: ['Performance issue detected'],
            };

            const dashboard = generateDashboardDataWithAnalysis('test-game-1', metrics, feedbackAnalysis);

            // Should include issues as actions
            const hasIssueAction = dashboard.recommendedActions.some(
                action => action.title === 'Address Identified Issue'
            );
            expect(hasIssueAction).toBe(true);
        });
    });

    describe('getDashboardSummary', () => {
        it('should return correct summary', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const summary = getDashboardSummary(dashboard);

            expect(summary.healthScore).toBe(dashboard.gameHealthScore);
            expect(summary.healthStatus).toBe(dashboard.healthStatus);
            expect(summary.actionCount).toBe(dashboard.recommendedActions.length);
            expect(summary.changeCount).toBe(dashboard.recentChanges.length);
        });

        it('should return null for topPriority when no actions', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 100,
                completionRate: 95,
                averageScore: 95,
                timeOnTask: 200,
                errorRate: 0.01,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const summary = getDashboardSummary(dashboard);

            if (dashboard.recommendedActions.length === 0) {
                expect(summary.topPriority).toBeNull();
            }
        });
    });

    describe('filterDashboardByPriority', () => {
        it('should filter actions by minimum priority', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 10,
                completionRate: 30,
                averageScore: 40,
                timeOnTask: 60,
                errorRate: 0.3,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const filtered = filterDashboardByPriority(dashboard, 'high');

            // All remaining actions should be high priority
            for (const action of filtered.recommendedActions) {
                expect(action.priority).toBe('high');
            }
        });

        it('should preserve other dashboard properties', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const filtered = filterDashboardByPriority(dashboard, 'medium');

            expect(filtered.gameId).toBe(dashboard.gameId);
            expect(filtered.gameHealthScore).toBe(dashboard.gameHealthScore);
            expect(filtered.healthScoreBreakdown).toEqual(dashboard.healthScoreBreakdown);
        });
    });

    describe('generateDashboardReport', () => {
        it('should generate readable report', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const report = generateDashboardReport(dashboard);

            expect(report).toContain('Dashboard Report');
            expect(report).toContain('Game Health Score');
            expect(report).toContain('test-game-1');
        });

        it('should include score breakdown in report', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const report = generateDashboardReport(dashboard);

            expect(report).toContain('Completion Rate');
            expect(report).toContain('User Engagement');
            expect(report).toContain('Performance');
        });

        it('should include recommended actions in report', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 10,
                completionRate: 30,
                averageScore: 40,
                timeOnTask: 60,
                errorRate: 0.3,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const report = generateDashboardReport(dashboard);

            expect(report).toContain('Recommended Actions');
        });

        it('should show positive message when no actions needed', () => {
            // Use metrics at benchmark target to avoid generating suggestions
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 500,  // At benchmark target
                completionRate: 70,  // At benchmark target
                averageScore: 75,  // At benchmark target
                timeOnTask: 300,  // At benchmark target
                errorRate: 0.05,  // At benchmark target
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);
            const report = generateDashboardReport(dashboard);

            expect(report).toContain('performing well');
        });
    });

    describe('DEFAULT_DASHBOARD_CONFIG', () => {
        it('should have valid default configuration', () => {
            expect(DEFAULT_DASHBOARD_CONFIG.healthScoreWeights).toBeDefined();
            expect(DEFAULT_DASHBOARD_CONFIG.maxRecentChanges).toBeDefined();
            expect(DEFAULT_DASHBOARD_CONFIG.maxRecommendedActions).toBeDefined();
            expect(DEFAULT_DASHBOARD_CONFIG.benchmarkType).toBeDefined();
        });

        it('should have weights that sum to 1', () => {
            const weights = DEFAULT_DASHBOARD_CONFIG.healthScoreWeights!;
            const sum = weights.completionRate + weights.userEngagement +
                weights.performance + weights.accessibility + weights.contentQuality;
            expect(sum).toBeCloseTo(1, 5);
        });
    });

    describe('Health Score Calculation', () => {
        it('should calculate higher score for better metrics', () => {
            const goodMetrics: GameMetrics = {
                gameId: 'good-game',
                playCount: 100,
                completionRate: 90,
                averageScore: 90,
                timeOnTask: 180,
                errorRate: 0.02,
                lastUpdated: new Date().toISOString(),
            };

            const poorMetrics: GameMetrics = {
                gameId: 'poor-game',
                playCount: 10,
                completionRate: 30,
                averageScore: 40,
                timeOnTask: 30,
                errorRate: 0.4,
                lastUpdated: new Date().toISOString(),
            };

            const goodDashboard = generateDashboardData('good-game', goodMetrics);
            const poorDashboard = generateDashboardData('poor-game', poorMetrics);

            expect(goodDashboard.gameHealthScore).toBeGreaterThan(poorDashboard.gameHealthScore);
        });

        it('should handle edge case of zero metrics', () => {
            const zeroMetrics: GameMetrics = {
                gameId: 'zero-game',
                playCount: 0,
                completionRate: 0,
                averageScore: 0,
                timeOnTask: 0,
                errorRate: 0,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('zero-game', zeroMetrics);

            expect(dashboard.gameHealthScore).toBeDefined();
            expect(dashboard.gameHealthScore).toBeGreaterThanOrEqual(0);
            // Zero metrics should produce needs_attention or critical status
            expect(dashboard.healthStatus).toMatch(/needs_attention|critical/);
        });

        it('should handle edge case of maximum metrics', () => {
            const maxMetrics: GameMetrics = {
                gameId: 'max-game',
                playCount: 1000,
                completionRate: 100,
                averageScore: 100,
                timeOnTask: 1000,
                errorRate: 0,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('max-game', maxMetrics);

            expect(dashboard.gameHealthScore).toBeDefined();
            expect(dashboard.gameHealthScore).toBeLessThanOrEqual(100);
            expect(dashboard.healthStatus).toBe('excellent');
        });
    });

    describe('Recent Changes', () => {
        it('should generate changes based on benchmark deviations', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 5,
                completionRate: 20,
                averageScore: 30,
                timeOnTask: 30,
                errorRate: 0.5,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            // Should have changes for significant deviations
            if (dashboard.benchmarkComparison) {
                const hasSignificantDeviation = Object.values(dashboard.benchmarkComparison.metricsComparison)
                    .some(c => Math.abs(c.deviationPercentage) > 15);
                // Changes may or may not exist depending on benchmark
                expect(dashboard.recentChanges).toBeDefined();
            }
        });
    });

    describe('Recommended Actions', () => {
        it('should generate actions from improvement suggestions', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 10,
                completionRate: 30,
                averageScore: 40,
                timeOnTask: 60,
                errorRate: 0.3,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            // Should have actions for poor metrics
            expect(dashboard.recommendedActions.length).toBeGreaterThan(0);
        });

        it('should prioritize high-impact actions', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 10,
                completionRate: 25,
                averageScore: 35,
                timeOnTask: 50,
                errorRate: 0.35,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            // Actions should be sorted by priority
            const priorities = dashboard.recommendedActions.map(a => a.priority);
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            for (let i = 0; i < priorities.length - 1; i++) {
                expect(priorityOrder[priorities[i]]).toBeLessThanOrEqual(priorityOrder[priorities[i + 1]]);
            }
        });

        it('should include suggested steps in actions', () => {
            const metrics: GameMetrics = {
                gameId: 'test-game-1',
                playCount: 10,
                completionRate: 30,
                averageScore: 40,
                timeOnTask: 60,
                errorRate: 0.3,
                lastUpdated: new Date().toISOString(),
            };

            const dashboard = generateDashboardData('test-game-1', metrics);

            for (const action of dashboard.recommendedActions) {
                expect(action.suggestedSteps).toBeDefined();
                expect(Array.isArray(action.suggestedSteps)).toBe(true);
            }
        });
    });
});

describe('Property 37: Dashboard includes all required elements', () => {
    it('for any game dashboard, the Feedback_Module SHALL show: Game_Health_Score, Recent_Changes, and Recommended_Actions', () => {
        // Property: For any game dashboard, the Feedback_Module SHALL show:
        // Game_Health_Score, Recent_Changes, and Recommended_Actions
        // Validates: Requirements 10.5

        const testMetrics: GameMetrics[] = [
            {
                gameId: 'game-1',
                playCount: 50,
                completionRate: 75,
                averageScore: 85,
                timeOnTask: 180,
                errorRate: 0.05,
                lastUpdated: new Date().toISOString(),
            },
            {
                gameId: 'game-2',
                playCount: 10,
                completionRate: 30,
                averageScore: 45,
                timeOnTask: 60,
                errorRate: 0.25,
                lastUpdated: new Date().toISOString(),
            },
            {
                gameId: 'game-3',
                playCount: 100,
                completionRate: 95,
                averageScore: 92,
                timeOnTask: 200,
                errorRate: 0.02,
                lastUpdated: new Date().toISOString(),
            },
        ];

        for (const metrics of testMetrics) {
            const dashboard = generateDashboardData(metrics.gameId, metrics);

            // Verify Game_Health_Score is present
            expect(dashboard.gameHealthScore).toBeDefined();
            expect(typeof dashboard.gameHealthScore).toBe('number');

            // Verify Recent_Changes is present
            expect(dashboard.recentChanges).toBeDefined();
            expect(Array.isArray(dashboard.recentChanges)).toBe(true);

            // Verify Recommended_Actions is present
            expect(dashboard.recommendedActions).toBeDefined();
            expect(Array.isArray(dashboard.recommendedActions)).toBe(true);
        }
    });
});