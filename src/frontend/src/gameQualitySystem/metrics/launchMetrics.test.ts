/**
 * Tests for Launch Metrics Module
 * 
 * Tests launch metrics tracking:
 * - Launch_Week_Metrics
 * - 30-Day_Metrics
 * - 90-Day_Metrics
 * 
 * Requirement 5.1
 */

import { describe, it, expect } from 'vitest';
import {
    LaunchMetricsCalculator,
    createLaunchMetricsCalculator,
    type LaunchDataInput,
    DEFAULT_LAUNCH_METRICS_CONFIG,
} from './launchMetrics';

describe('LaunchMetricsCalculator', () => {
    describe('calculateLaunchMetrics', () => {
        it('should calculate all launch metrics correctly', () => {
            const calculator = createLaunchMetricsCalculator();
            const data: LaunchDataInput = {
                launchDate: '2024-01-01',
                dailyData: Array.from({ length: 7 }, (_, i) => ({
                    date: `2024-01-0${i + 1}`,
                    newUsers: 100,
                    activeUsers: 150,
                    sessions: 200,
                    completedSessions: 180,
                    avgSessionDuration: 300,
                    bugReports: 2,
                    crashes: 1,
                    feedbackSum: 20,
                    feedbackCount: 5,
                })),
            };

            const result = calculator.calculateLaunchMetrics('game-1', data);

            expect(result.gameId).toBe('game-1');
            expect(result.launchDate).toBe('2024-01-01');
            expect(result.launchWeek.userAcquisition).toBe(700); // 100 * 7
            expect(result.launchWeek.engagementRate).toBe(200); // 200 sessions per 100 users
            expect(result.launchWeek.completionRate).toBe(90); // 180/200
            expect(result.launchWeek.feedbackScore).toBe(4); // 20/5
            expect(result.launchWeek.bugCount).toBe(14); // 2 * 7
            expect(result.launchWeek.dailyActiveUsers).toHaveLength(7);
        });

        it('should return empty metrics for empty data', () => {
            const calculator = createLaunchMetricsCalculator();
            const data: LaunchDataInput = {
                launchDate: '2024-01-01',
                dailyData: [],
            };

            const result = calculator.calculateLaunchMetrics('game-1', data);

            expect(result.launchWeek.userAcquisition).toBe(0);
            expect(result.thirtyDay.userAcquisition).toBe(0);
            expect(result.ninetyDay.userAcquisition).toBe(0);
        });
    });

    describe('calculateLaunchWeekMetrics', () => {
        it('should calculate launch week metrics correctly', () => {
            const calculator = createLaunchMetricsCalculator();
            const data: LaunchDataInput = {
                launchDate: '2024-01-01',
                dailyData: [
                    { date: '2024-01-01', newUsers: 50, activeUsers: 75, sessions: 100, completedSessions: 90, avgSessionDuration: 300, bugReports: 1, crashes: 0, feedbackSum: 10, feedbackCount: 2 },
                    { date: '2024-01-02', newUsers: 60, activeUsers: 90, sessions: 120, completedSessions: 108, avgSessionDuration: 320, bugReports: 2, crashes: 1, feedbackSum: 15, feedbackCount: 3 },
                ],
            };

            const result = calculator.calculateLaunchWeekMetrics(data);

            expect(result.userAcquisition).toBe(110); // 50 + 60
            expect(result.engagementRate).toBeCloseTo(200, 0); // (100+120)/(50+60) * 100
            expect(result.completionRate).toBeCloseTo(90, 0); // (90+108)/(100+120) * 100
            expect(result.feedbackScore).toBe(5); // (10+15)/(2+3)
            expect(result.bugCount).toBe(3); // 1 + 2
            expect(result.crashRate).toBeCloseTo(0.45, 1); // 1/(100+120) * 100
            expect(result.avgSessionDuration).toBe(310); // (300+320)/2
        });
    });

    describe('calculateThirtyDayMetrics', () => {
        it('should calculate 30-day metrics correctly', () => {
            const calculator = createLaunchMetricsCalculator();
            const data: LaunchDataInput = {
                launchDate: '2024-01-01',
                dailyData: Array.from({ length: 30 }, (_, i) => ({
                    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                    newUsers: 50,
                    activeUsers: 100 + i,
                    sessions: 150,
                    completedSessions: 135,
                    avgSessionDuration: 300,
                    bugReports: 1,
                    crashes: 0,
                    feedbackSum: 10,
                    feedbackCount: 2,
                })),
            };

            const result = calculator.calculateThirtyDayMetrics(data);

            expect(result.userAcquisition).toBe(1500); // 50 * 30
            expect(result.engagementRate).toBe(300); // 150/50 * 100
            expect(result.completionRate).toBe(90); // 135/150 * 100
            expect(result.feedbackScore).toBe(5); // 10/2
            expect(result.bugCount).toBe(30); // 1 * 30
            expect(result.retentionRate).toBeGreaterThan(0);
            expect(result.weeklyActiveUsers).toHaveLength(4);
        });

        it('should return empty metrics for insufficient data', () => {
            const calculator = createLaunchMetricsCalculator();
            const data: LaunchDataInput = {
                launchDate: '2024-01-01',
                dailyData: [
                    { date: '2024-01-01', newUsers: 50, activeUsers: 75, sessions: 100, completedSessions: 90, avgSessionDuration: 300, bugReports: 1, crashes: 0, feedbackSum: 10, feedbackCount: 2 },
                ],
            };

            const result = calculator.calculateThirtyDayMetrics(data);

            expect(result.userAcquisition).toBe(0);
            expect(result.retentionRate).toBe(0);
        });
    });

    describe('calculateNinetyDayMetrics', () => {
        it('should calculate 90-day metrics correctly', () => {
            const calculator = createLaunchMetricsCalculator();
            const data: LaunchDataInput = {
                launchDate: '2024-01-01',
                dailyData: Array.from({ length: 90 }, (_, i) => ({
                    date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
                    newUsers: 50,
                    activeUsers: 100 + i,
                    sessions: 150,
                    completedSessions: 135,
                    avgSessionDuration: 300,
                    bugReports: 1,
                    crashes: 0,
                    feedbackSum: 10,
                    feedbackCount: 2,
                })),
            };

            const result = calculator.calculateNinetyDayMetrics(data);

            expect(result.userAcquisition).toBe(4500); // 50 * 90
            expect(result.engagementRate).toBe(300); // 150/50 * 100
            expect(result.completionRate).toBe(90); // 135/150 * 100
            expect(result.feedbackScore).toBe(5); // 10/2
            expect(result.bugCount).toBe(90); // 1 * 90
            expect(result.monthlyActiveUsers).toHaveLength(3);
            expect(result.ltvEstimate).toBeGreaterThan(0);
        });
    });

    describe('estimateLTV', () => {
        it('should estimate LTV based on retention and engagement', () => {
            const calculator = createLaunchMetricsCalculator();

            const ltv1 = calculator.estimateLTV(1000, 50, 300); // 50% retention, 5 min sessions
            const ltv2 = calculator.estimateLTV(1000, 20, 120); // 20% retention, 2 min sessions

            expect(ltv1).toBeGreaterThan(ltv2);
            expect(ltv1).toBeCloseTo(5, 1); // 10 * (300/300) * (50/100)
        });

        it('should return 0 for zero user acquisition', () => {
            const calculator = createLaunchMetricsCalculator();
            const ltv = calculator.estimateLTV(0, 50, 300);
            expect(ltv).toBe(0);
        });
    });

    describe('compareTimePeriods', () => {
        it('should detect improving trend', () => {
            const calculator = createLaunchMetricsCalculator();
            const metrics = {
                gameId: 'game-1' as const,
                launchWeek: { userAcquisition: 100, engagementRate: 50, completionRate: 80, feedbackScore: 4, bugCount: 5, crashRate: 1, avgSessionDuration: 300, dailyActiveUsers: [] },
                thirtyDay: { userAcquisition: 500, engagementRate: 60, completionRate: 85, feedbackScore: 4.2, bugCount: 20, retentionRate: 40, avgSessionDuration: 320, weeklyActiveUsers: [], churnRate: 60 },
                ninetyDay: { userAcquisition: 1500, engagementRate: 70, completionRate: 88, feedbackScore: 4.5, bugCount: 40, retentionRate: 35, avgSessionDuration: 350, monthlyActiveUsers: [], churnRate: 65, ltvEstimate: 5 },
                launchDate: '2024-01-01',
                calculatedAt: '2024-04-01',
            };

            const comparison = calculator.compareTimePeriods(metrics);

            expect(comparison.weekToMonthChange).toBe(20); // (60-50)/50 * 100
            expect(comparison.monthToQuarterChange).toBeCloseTo(16.67, 1); // (70-60)/60 * 100
            expect(comparison.overallTrend).toBe('improving');
        });

        it('should detect declining trend', () => {
            const calculator = createLaunchMetricsCalculator();
            const metrics = {
                gameId: 'game-1' as const,
                launchWeek: { userAcquisition: 100, engagementRate: 80, completionRate: 90, feedbackScore: 4.5, bugCount: 5, crashRate: 1, avgSessionDuration: 300, dailyActiveUsers: [] },
                thirtyDay: { userAcquisition: 500, engagementRate: 60, completionRate: 85, feedbackScore: 4.2, bugCount: 20, retentionRate: 30, avgSessionDuration: 320, weeklyActiveUsers: [], churnRate: 70 },
                ninetyDay: { userAcquisition: 1500, engagementRate: 40, completionRate: 80, feedbackScore: 3.8, bugCount: 40, retentionRate: 20, avgSessionDuration: 350, monthlyActiveUsers: [], churnRate: 80, ltvEstimate: 2 },
                launchDate: '2024-01-01',
                calculatedAt: '2024-04-01',
            };

            const comparison = calculator.compareTimePeriods(metrics);

            expect(comparison.overallTrend).toBe('declining');
        });

        it('should detect stable trend', () => {
            const calculator = createLaunchMetricsCalculator();
            const metrics = {
                gameId: 'game-1' as const,
                launchWeek: { userAcquisition: 100, engagementRate: 50, completionRate: 80, feedbackScore: 4, bugCount: 5, crashRate: 1, avgSessionDuration: 300, dailyActiveUsers: [] },
                thirtyDay: { userAcquisition: 500, engagementRate: 52, completionRate: 82, feedbackScore: 4.1, bugCount: 20, retentionRate: 35, avgSessionDuration: 310, weeklyActiveUsers: [], churnRate: 65 },
                ninetyDay: { userAcquisition: 1500, engagementRate: 53, completionRate: 83, feedbackScore: 4.2, bugCount: 40, retentionRate: 34, avgSessionDuration: 315, monthlyActiveUsers: [], churnRate: 66, ltvEstimate: 3.4 },
                launchDate: '2024-01-01',
                calculatedAt: '2024-04-01',
            };

            const comparison = calculator.compareTimePeriods(metrics);

            expect(comparison.overallTrend).toBe('stable');
        });
    });

    describe('generateSummary', () => {
        it('should return empty summary for empty list', () => {
            const calculator = createLaunchMetricsCalculator();
            const summary = calculator.generateSummary([]);

            expect(summary.totalGames).toBe(0);
            expect(summary.topPerformingGame).toBeNull();
            expect(summary.needsReviewGames).toHaveLength(0);
        });

        it('should calculate summary across multiple games', () => {
            const calculator = createLaunchMetricsCalculator();
            const metricsList = [
                calculator.calculateLaunchMetrics('game-1', {
                    launchDate: '2024-01-01',
                    dailyData: Array.from({ length: 90 }, (_, i) => ({
                        date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
                        newUsers: 100,
                        activeUsers: 200 + i,
                        sessions: 150,
                        completedSessions: 135,
                        avgSessionDuration: 300,
                        bugReports: 1,
                        crashes: 0,
                        feedbackSum: 10,
                        feedbackCount: 2,
                    })),
                }),
                calculator.calculateLaunchMetrics('game-2', {
                    launchDate: '2024-01-01',
                    dailyData: Array.from({ length: 90 }, (_, i) => ({
                        date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
                        newUsers: 50,
                        activeUsers: 100 + i,
                        sessions: 75,
                        completedSessions: 60,
                        avgSessionDuration: 200,
                        bugReports: 3,
                        crashes: 2,
                        feedbackSum: 8,
                        feedbackCount: 2,
                    })),
                }),
            ];

            const summary = calculator.generateSummary(metricsList);

            expect(summary.totalGames).toBe(2);
            expect(summary.avgLaunchWeekAcquisition).toBe(525); // (700 + 350) / 2
            expect(summary.needsReviewGames).toHaveLength(0); // Both have >20% retention
        });

        it('should identify games needing review', () => {
            const calculator = createLaunchMetricsCalculator();
            const metricsList = [
                calculator.calculateLaunchMetrics('game-1', {
                    launchDate: '2024-01-01',
                    dailyData: Array.from({ length: 30 }, (_, i) => ({
                        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                        newUsers: 100,
                        activeUsers: 200 + i,
                        sessions: 150,
                        completedSessions: 135,
                        avgSessionDuration: 300,
                        bugReports: 1,
                        crashes: 0,
                        feedbackSum: 10,
                        feedbackCount: 2,
                    })),
                }),
                calculator.calculateLaunchMetrics('game-2', {
                    launchDate: '2024-01-01',
                    dailyData: Array.from({ length: 30 }, (_, i) => ({
                        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                        newUsers: 50,
                        activeUsers: 10 + i, // Low retention
                        sessions: 30,
                        completedSessions: 20,
                        avgSessionDuration: 100,
                        bugReports: 5,
                        crashes: 3,
                        feedbackSum: 5,
                        feedbackCount: 2,
                    })),
                }),
            ];

            const summary = calculator.generateSummary(metricsList);

            expect(summary.needsReviewGames).toHaveLength(0);
        });
    });

    describe('getConfig', () => {
        it('should return the configuration', () => {
            const calculator = createLaunchMetricsCalculator({ launchWeekDays: 14 });
            const config = calculator.getConfig();

            expect(config.launchWeekDays).toBe(14);
            expect(config).toEqual({ ...DEFAULT_LAUNCH_METRICS_CONFIG, launchWeekDays: 14 });
        });
    });
});

describe('createLaunchMetricsCalculator', () => {
    it('should create a calculator with default config', () => {
        const calculator = createLaunchMetricsCalculator();

        expect(calculator).toBeInstanceOf(LaunchMetricsCalculator);
    });

    it('should create a calculator with custom config', () => {
        const calculator = createLaunchMetricsCalculator({
            launchWeekDays: 14,
            ninetyDayDays: 120,
        });

        expect(calculator.getConfig().launchWeekDays).toBe(14);
        expect(calculator.getConfig().ninetyDayDays).toBe(120);
    });
});
