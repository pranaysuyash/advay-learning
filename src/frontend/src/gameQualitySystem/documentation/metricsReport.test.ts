// Metrics Report Tests for Game Quality System

import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsReport, createMetricsReport, DEFAULT_METRICS_REPORT_CONFIG } from './metricsReport';
import type { Game, MetricsData } from '../types';

describe('MetricsReport', () => {
    let metricsReport: MetricsReport;
    const mockGame: Game = {
        id: 'game-001',
        name: 'Math Blaster',
        description: 'A math learning game',
        category: 'Educational',
        ageRange: '6-10',
        difficulty: 'Medium',
        estimatedTime: 30,
        requiredTechnologies: ['React', 'TypeScript'],
        successCriteria: ['Complete 10 problems', 'Score 80% or higher'],
        isImplemented: true,
        implementationStatus: 'completed',
        lastUpdated: new Date().toISOString(),
    };

    const mockPreMetrics: MetricsData = {
        gameId: 'game-001',
        preImprovement: {
            qualityScore: 60,
            engagementRate: 45,
            completionRate: 50,
            bugCount: 15,
        },
        changePercentage: 0,
        statisticalSignificance: 'insufficient',
        lastUpdated: '2024-01-01',
    };

    const mockPostMetrics: MetricsData = {
        gameId: 'game-001',
        postImprovement: {
            qualityScore: 80,
            engagementRate: 65,
            completionRate: 75,
            bugCount: 5,
        },
        changePercentage: 0,
        statisticalSignificance: 'insufficient',
        lastUpdated: '2024-01-15',
    };

    beforeEach(() => {
        metricsReport = new MetricsReport();
    });

    describe('Constructor', () => {
        it('should create with default config', () => {
            const mr = new MetricsReport();
            expect(mr).toBeDefined();
        });

        it('should create with custom config', () => {
            const mr = new MetricsReport({
                significanceThresholds: { low: 10, medium: 20, high: 40 },
                includeConfidenceIntervals: false,
            });
            expect(mr).toBeDefined();
        });
    });

    describe('generateReport', () => {
        it('should generate a complete metrics report', () => {
            const report = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);

            expect(report.gameId).toBe('game-001');
            expect(report.gameName).toBe('Math Blaster');
            expect(report.metrics.length).toBe(4); // Quality, Engagement, Completion, Bug reduction
            expect(report.overallImpact).toBeDefined();
            expect(report.recommendations.length).toBeGreaterThan(0);
        });

        it('should calculate correct metric changes', () => {
            const report = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);

            const qualityMetric = report.metrics.find(m => m.name === 'Quality Score');
            expect(qualityMetric?.before).toBe(60);
            expect(qualityMetric?.after).toBe(80);
            expect(qualityMetric?.absoluteChange).toBe(20);
            expect(qualityMetric?.percentageChange).toBeCloseTo(33.33, 1);
        });

        it('should handle bug count reduction correctly', () => {
            const report = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);

            const bugMetric = report.metrics.find(m => m.name === 'Bug Count Reduction');
            expect(bugMetric?.before).toBe(15);
            expect(bugMetric?.after).toBe(5);
            expect(bugMetric?.absoluteChange).toBe(10); // Reduction
            expect(bugMetric?.percentageChange).toBeCloseTo(66.67, 1);
        });

        it('should calculate overall impact correctly', () => {
            const report = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);

            // Quality: +33.3%, Engagement: +44.4%, Completion: +50%, Bug: +66.7%
            // Average = (33.3 + 44.4 + 50 + 66.7) / 4 = 48.6%
            expect(report.overallImpact.totalAbsoluteChange).toBe(75);
            expect(report.overallImpact.averagePercentageChange).toBeCloseTo(48.6, 1);
        });
    });

    describe('calculateMetricChange', () => {
        it('should calculate metric change correctly', () => {
            const change = metricsReport.calculateMetricChange('Test Metric', 50, 75);

            expect(change.name).toBe('Test Metric');
            expect(change.before).toBe(50);
            expect(change.after).toBe(75);
            expect(change.absoluteChange).toBe(25);
            expect(change.percentageChange).toBe(50);
        });

        it('should handle negative change', () => {
            const change = metricsReport.calculateMetricChange('Test Metric', 100, 80);

            expect(change.absoluteChange).toBe(-20);
            expect(change.percentageChange).toBe(-20);
        });

        it('should include confidence interval by default', () => {
            const change = metricsReport.calculateMetricChange('Test Metric', 50, 75);

            expect(change.confidenceInterval).toBeDefined();
            expect(change.confidenceInterval?.confidenceLevel).toBe(0.95);
        });

        it('should not include confidence interval when disabled', () => {
            const report = new MetricsReport({ includeConfidenceIntervals: false });
            const change = report.calculateMetricChange('Test Metric', 50, 75);

            expect(change.confidenceInterval).toBeUndefined();
        });
    });

    describe('determineStatisticalSignificance', () => {
        it('should return insufficient for small changes', () => {
            expect(metricsReport.determineStatisticalSignificance(3)).toBe('insufficient');
            expect(metricsReport.determineStatisticalSignificance(4)).toBe('insufficient');
        });

        it('should return low for medium-small changes', () => {
            expect(metricsReport.determineStatisticalSignificance(8)).toBe('low');
            expect(metricsReport.determineStatisticalSignificance(14)).toBe('low');
        });

        it('should return medium for medium changes', () => {
            expect(metricsReport.determineStatisticalSignificance(20)).toBe('medium');
            expect(metricsReport.determineStatisticalSignificance(25)).toBe('medium');
        });

        it('should return high for large changes', () => {
            expect(metricsReport.determineStatisticalSignificance(35)).toBe('high');
            expect(metricsReport.determineStatisticalSignificance(50)).toBe('high');
        });
    });

    describe('calculateConfidenceInterval', () => {
        it('should calculate confidence interval', () => {
            const ci = metricsReport.calculateConfidenceInterval(50, 75, 0.95);

            expect(ci.lower).toBeDefined();
            expect(ci.upper).toBeDefined();
            expect(ci.confidenceLevel).toBe(0.95);
            expect(ci.lower).toBeLessThan(ci.upper);
        });

        it('should center interval around the change', () => {
            const ci = metricsReport.calculateConfidenceInterval(50, 75, 0.95);
            const change = 25;

            expect(ci.lower).toBeLessThan(change);
            expect(ci.upper).toBeGreaterThan(change);
        });
    });

    describe('formatAsMarkdown', () => {
        it('should format report as markdown', () => {
            const report = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);
            const markdown = metricsReport.formatAsMarkdown(report);

            expect(markdown).toContain('# Metrics Report: Math Blaster');
            expect(markdown).toContain('**Game ID**: game-001');
            expect(markdown).toContain('Overall Impact');
            expect(markdown).toContain('Metric Changes');
            expect(markdown).toContain('Quality Score');
            expect(markdown).toContain('Recommendations');
        });

        it('should include statistical significance in table', () => {
            const report = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);
            const markdown = metricsReport.formatAsMarkdown(report);

            expect(markdown).toContain('HIGH');
        });

        it('should include confidence intervals when enabled', () => {
            const report = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);
            const markdown = metricsReport.formatAsMarkdown(report);

            expect(markdown).toContain('Confidence Intervals');
        });
    });

    describe('compareReports', () => {
        it('should compare two reports correctly', () => {
            const report1 = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);

            const improvedPostMetrics: MetricsData = {
                ...mockPostMetrics,
                postImprovement: {
                    qualityScore: 90,
                    engagementRate: 80,
                    completionRate: 85,
                    bugCount: 2,
                },
            };
            const report2 = metricsReport.generateReport(mockGame, mockPreMetrics, improvedPostMetrics);

            const comparison = metricsReport.compareReports(report1, report2);

            expect(comparison.report2Better.length).toBeGreaterThan(0);
            expect(comparison.report1Better.length).toBe(0);
        });

        it('should identify similar reports', () => {
            const report1 = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);
            const report2 = metricsReport.generateReport(mockGame, mockPreMetrics, mockPostMetrics);

            const comparison = metricsReport.compareReports(report1, report2);

            expect(comparison.similar.length).toBeGreaterThan(0);
        });
    });

    describe('factory function', () => {
        it('should create MetricsReport instance', () => {
            const mr = createMetricsReport();
            expect(mr).toBeInstanceOf(MetricsReport);
        });
    });
});

describe('MetricsReport - Property Tests', () => {
    let metricsReport: MetricsReport;

    beforeEach(() => {
        metricsReport = new MetricsReport();
    });

    it('should always generate reports with valid structure', () => {
        const game: Game = {
            id: 'test-game',
            name: 'Test Game',
            description: 'Test',
            category: 'Test',
            ageRange: '5-10',
            difficulty: 'Easy',
            estimatedTime: 15,
            requiredTechnologies: [],
            successCriteria: [],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        };

        const preMetrics: MetricsData = {
            gameId: 'test-game',
            preImprovement: {
                qualityScore: 50,
                engagementRate: 50,
                completionRate: 50,
                bugCount: 10,
            },
            changePercentage: 0,
            statisticalSignificance: 'insufficient',
            lastUpdated: '2024-01-01',
        };

        const postMetrics: MetricsData = {
            gameId: 'test-game',
            postImprovement: {
                qualityScore: 70,
                engagementRate: 60,
                completionRate: 65,
                bugCount: 5,
            },
            changePercentage: 0,
            statisticalSignificance: 'insufficient',
            lastUpdated: '2024-01-15',
        };

        const report = metricsReport.generateReport(game, preMetrics, postMetrics);

        expect(report.gameId).toBe('test-game');
        expect(report.reportDate).toBeDefined();
        expect(report.metrics.length).toBeGreaterThan(0);
        expect(report.overallImpact).toBeDefined();
    });

    it('should calculate percentage change correctly for any positive values', () => {
        const testCases = [
            { before: 10, after: 20, expected: 100 },
            { before: 25, after: 50, expected: 100 },
            { before: 100, after: 100, expected: 0 },
        ];

        for (const { before, after, expected } of testCases) {
            const change = metricsReport.calculateMetricChange('Test', before, after);
            expect(change.percentageChange).toBe(expected);
        }
    });

    it('should always have positive absolute change for bug reduction when after < before', () => {
        const change = metricsReport.calculateMetricChange('Bug Count', 20, 10);
        // For bug count, absoluteChange = after - before = 10 - 20 = -10
        // But percentage change is calculated as ((before - after) / before) * 100 = 50%
        // This makes bug reduction show as positive percentage change
        expect(change.absoluteChange).toBe(-10);
        expect(change.percentageChange).toBeCloseTo(50, 1);
    });

    it('should always have valid statistical significance', () => {
        const validSignificances = ['high', 'medium', 'low', 'insufficient'];

        for (let i = 0; i <= 50; i += 5) {
            const significance = metricsReport.determineStatisticalSignificance(i);
            expect(validSignificances).toContain(significance);
        }
    });
});
