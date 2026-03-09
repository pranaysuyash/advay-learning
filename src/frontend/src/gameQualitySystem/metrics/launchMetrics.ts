/**
 * Launch Metrics Tracking Module
 * 
 * Tracks launch metrics for new game implementations:
 * - Launch_Week_Metrics
 * - 30-Day_Metrics
 * - 90-Day_Metrics
 * 
 * Requirement 5.1: Track Launch_Week_Metrics, 30-Day_Metrics, and 90-Day_Metrics
 */

import type { GameId } from '../types';

/**
 * Launch week metrics (first 7 days)
 */
export interface LaunchWeekMetrics {
    userAcquisition: number; // New users acquired
    engagementRate: number; // Percentage of users who engaged
    completionRate: number; // Percentage of sessions completed
    feedbackScore: number; // Average feedback score (1-5)
    bugCount: number; // Number of bugs reported
    crashRate: number; // Percentage of sessions that crashed
    avgSessionDuration: number; // Average session length in seconds
    dailyActiveUsers: number[]; // DAU for each of the 7 days
}

/**
 * 30-day metrics
 */
export interface ThirtyDayMetrics {
    userAcquisition: number; // Total new users acquired
    engagementRate: number; // Overall engagement rate
    completionRate: number; // Overall completion rate
    feedbackScore: number; // Average feedback score
    bugCount: number; // Total bugs reported
    retentionRate: number; // Day 30 retention percentage
    avgSessionDuration: number; // Average session length
    weeklyActiveUsers: number[]; // WAU for each week
    churnRate: number; // Percentage of users who stopped playing
}

/**
 * 90-day metrics
 */
export interface NinetyDayMetrics {
    userAcquisition: number; // Total new users acquired
    engagementRate: number; // Overall engagement rate
    completionRate: number; // Overall completion rate
    feedbackScore: number; // Average feedback score
    bugCount: number; // Total bugs reported
    retentionRate: number; // Day 90 retention percentage
    avgSessionDuration: number; // Average session length
    monthlyActiveUsers: number[]; // MAU for each month
    churnRate: number; // Cumulative churn rate
    ltvEstimate: number; // Lifetime value estimate
}

/**
 * Combined launch metrics for all time periods
 */
export interface LaunchMetrics {
    gameId: GameId;
    launchWeek: LaunchWeekMetrics;
    thirtyDay: ThirtyDayMetrics;
    ninetyDay: NinetyDayMetrics;
    launchDate: string;
    calculatedAt: string;
}

/**
 * Raw data for launch metrics calculation
 */
export interface LaunchDataInput {
    launchDate: string;
    dailyData: {
        date: string;
        newUsers: number;
        activeUsers: number;
        sessions: number;
        completedSessions: number;
        avgSessionDuration: number;
        bugReports: number;
        crashes: number;
        feedbackSum: number;
        feedbackCount: number;
    }[];
}

/**
 * Configuration for launch metrics calculation
 */
export interface LaunchMetricsConfig {
    launchWeekDays: number;
    thirtyDayDays: number;
    ninetyDayDays: number;
    retentionCalculationDays: number[];
    minDataPointsForCalculation: number;
}

/**
 * Default configuration for launch metrics
 */
export const DEFAULT_LAUNCH_METRICS_CONFIG: LaunchMetricsConfig = {
    launchWeekDays: 7,
    thirtyDayDays: 30,
    ninetyDayDays: 90,
    retentionCalculationDays: [1, 7, 14, 30, 60, 90],
    minDataPointsForCalculation: 3,
};

/**
 * Calculate average of an array
 */
function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate sum of an array
 */
function sum(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0);
}

/**
 * Launch Metrics Calculator
 * 
 * Tracks and calculates launch metrics for new game implementations.
 * Validates: Requirement 5.1
 */
export class LaunchMetricsCalculator {
    private readonly config: LaunchMetricsConfig;

    constructor(config: Partial<LaunchMetricsConfig> = {}) {
        this.config = { ...DEFAULT_LAUNCH_METRICS_CONFIG, ...config };
    }

    /**
     * Calculate all launch metrics from raw data
     */
    public calculateLaunchMetrics(
        gameId: GameId,
        data: LaunchDataInput
    ): LaunchMetrics {
        const launchWeek = this.calculateLaunchWeekMetrics(data);
        const thirtyDay = this.calculateThirtyDayMetrics(data);
        const ninetyDay = this.calculateNinetyDayMetrics(data);

        return {
            gameId,
            launchWeek,
            thirtyDay,
            ninetyDay,
            launchDate: data.launchDate,
            calculatedAt: new Date().toISOString(),
        };
    }

    /**
     * Calculate launch week metrics (first 7 days)
     */
    public calculateLaunchWeekMetrics(data: LaunchDataInput): LaunchWeekMetrics {
        const weekData = data.dailyData.slice(0, this.config.launchWeekDays);

        if (weekData.length === 0) {
            return this.getEmptyLaunchWeekMetrics();
        }

        const userAcquisition = sum(weekData.map(d => d.newUsers));
        const totalSessions = sum(weekData.map(d => d.sessions));
        const completedSessions = sum(weekData.map(d => d.completedSessions));
        const totalFeedback = sum(weekData.map(d => d.feedbackSum));
        const feedbackCount = sum(weekData.map(d => d.feedbackCount));
        const totalBugs = sum(weekData.map(d => d.bugReports));
        const totalCrashes = sum(weekData.map(d => d.crashes));
        const avgDuration = average(weekData.map(d => d.avgSessionDuration));

        return {
            userAcquisition,
            engagementRate: totalSessions > 0 ? (totalSessions / userAcquisition) * 100 : 0,
            completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
            feedbackScore: feedbackCount > 0 ? totalFeedback / feedbackCount : 0,
            bugCount: totalBugs,
            crashRate: totalSessions > 0 ? (totalCrashes / totalSessions) * 100 : 0,
            avgSessionDuration: avgDuration,
            dailyActiveUsers: weekData.map(d => d.activeUsers),
        };
    }

    /**
     * Calculate 30-day metrics
     */
    public calculateThirtyDayMetrics(data: LaunchDataInput): ThirtyDayMetrics {
        const monthData = data.dailyData.slice(0, this.config.thirtyDayDays);

        if (monthData.length < this.config.minDataPointsForCalculation) {
            return this.getEmptyThirtyDayMetrics();
        }

        const userAcquisition = sum(monthData.map(d => d.newUsers));
        const totalSessions = sum(monthData.map(d => d.sessions));
        const completedSessions = sum(monthData.map(d => d.completedSessions));
        const totalFeedback = sum(monthData.map(d => d.feedbackSum));
        const feedbackCount = sum(monthData.map(d => d.feedbackCount));
        const totalBugs = sum(monthData.map(d => d.bugReports));
        const avgDuration = average(monthData.map(d => d.avgSessionDuration));

        // Calculate weekly active users
        const weeklyActiveUsers: number[] = [];
        for (let i = 0; i < 4; i++) {
            const weekData = monthData.slice(i * 7, (i + 1) * 7);
            const uniqueUsers = new Set(weekData.flatMap(d =>
                Array(d.activeUsers).fill('user') // Simplified
            ).map((_, idx) => `week${i}-${idx}`)).size;
            weeklyActiveUsers.push(uniqueUsers);
        }

        // Calculate retention (simplified - based on returning users)
        const day1Users = monthData[0]?.newUsers || 1;
        const day30Users = monthData[monthData.length - 1]?.activeUsers || 0;
        const retentionRate = day1Users > 0 ? (day30Users / day1Users) * 100 : 0;

        // Calculate churn (users who stopped playing)
        const churnRate = 100 - retentionRate;

        return {
            userAcquisition,
            engagementRate: userAcquisition > 0 ? (totalSessions / userAcquisition) * 100 : 0,
            completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
            feedbackScore: feedbackCount > 0 ? totalFeedback / feedbackCount : 0,
            bugCount: totalBugs,
            retentionRate,
            avgSessionDuration: avgDuration,
            weeklyActiveUsers,
            churnRate,
        };
    }

    /**
     * Calculate 90-day metrics
     */
    public calculateNinetyDayMetrics(data: LaunchDataInput): NinetyDayMetrics {
        const periodData = data.dailyData.slice(0, this.config.ninetyDayDays);

        if (periodData.length < this.config.minDataPointsForCalculation) {
            return this.getEmptyNinetyDayMetrics();
        }

        const userAcquisition = sum(periodData.map(d => d.newUsers));
        const totalSessions = sum(periodData.map(d => d.sessions));
        const completedSessions = sum(periodData.map(d => d.completedSessions));
        const totalFeedback = sum(periodData.map(d => d.feedbackSum));
        const feedbackCount = sum(periodData.map(d => d.feedbackCount));
        const totalBugs = sum(periodData.map(d => d.bugReports));
        const avgDuration = average(periodData.map(d => d.avgSessionDuration));

        // Calculate monthly active users
        const monthlyActiveUsers: number[] = [];
        for (let i = 0; i < 3; i++) {
            const monthData = periodData.slice(i * 30, (i + 1) * 30);
            const totalMAU = sum(monthData.map(d => d.activeUsers));
            monthlyActiveUsers.push(totalMAU);
        }

        // Calculate retention
        const day1Users = periodData[0]?.newUsers || 1;
        const day90Users = periodData[periodData.length - 1]?.activeUsers || 0;
        const retentionRate = day1Users > 0 ? (day90Users / day1Users) * 100 : 0;

        // Calculate churn
        const churnRate = 100 - retentionRate;

        // Estimate LTV (simplified calculation)
        const ltvEstimate = this.estimateLTV(userAcquisition, retentionRate, avgDuration);

        return {
            userAcquisition,
            engagementRate: userAcquisition > 0 ? (totalSessions / userAcquisition) * 100 : 0,
            completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
            feedbackScore: feedbackCount > 0 ? totalFeedback / feedbackCount : 0,
            bugCount: totalBugs,
            retentionRate,
            avgSessionDuration: avgDuration,
            monthlyActiveUsers,
            churnRate,
            ltvEstimate,
        };
    }

    /**
     * Estimate lifetime value based on retention and engagement
     */
    public estimateLTV(
        userAcquisition: number,
        retentionRate: number,
        avgSessionDuration: number
    ): number {
        if (userAcquisition === 0) return 0;

        // Simplified LTV estimation based on engagement
        // In a real system, this would consider monetization data
        const engagementFactor = avgSessionDuration / 300; // Normalize to 5-minute sessions
        const retentionFactor = retentionRate / 100;

        // Base LTV estimate (arbitrary units for educational games)
        const baseLTV = 10; // $10 base value per retained user
        return baseLTV * engagementFactor * retentionFactor;
    }

    /**
     * Compare metrics across time periods
     */
    public compareTimePeriods(metrics: LaunchMetrics): {
        weekToMonthChange: number;
        monthToQuarterChange: number;
        overallTrend: 'improving' | 'stable' | 'declining';
    } {
        const engagementChange = metrics.thirtyDay.engagementRate - metrics.launchWeek.engagementRate;
        const weekToMonthChange = metrics.launchWeek.engagementRate > 0
            ? (engagementChange / metrics.launchWeek.engagementRate) * 100
            : 0;

        const quarterEngagement = metrics.ninetyDay.engagementRate;
        const monthEngagement = metrics.thirtyDay.engagementRate;
        const monthToQuarterChange = monthEngagement > 0
            ? ((quarterEngagement - monthEngagement) / monthEngagement) * 100
            : 0;

        let overallTrend: 'improving' | 'stable' | 'declining';
        if (weekToMonthChange > 10 && monthToQuarterChange > 5) {
            overallTrend = 'improving';
        } else if (weekToMonthChange < -10 || monthToQuarterChange < -5) {
            overallTrend = 'declining';
        } else {
            overallTrend = 'stable';
        }

        return {
            weekToMonthChange,
            monthToQuarterChange,
            overallTrend,
        };
    }

    /**
     * Generate a summary of launch metrics
     */
    public generateSummary(metricsList: LaunchMetrics[]): {
        totalGames: number;
        avgLaunchWeekAcquisition: number;
        avg30DayRetention: number;
        avg90DayRetention: number;
        avgBugCount: number;
        topPerformingGame: string | null;
        needsReviewGames: string[];
    } {
        if (metricsList.length === 0) {
            return {
                totalGames: 0,
                avgLaunchWeekAcquisition: 0,
                avg30DayRetention: 0,
                avg90DayRetention: 0,
                avgBugCount: 0,
                topPerformingGame: null,
                needsReviewGames: [],
            };
        }

        const totalGames = metricsList.length;
        const avgLaunchWeekAcquisition = average(metricsList.map(m => m.launchWeek.userAcquisition));
        const avg30DayRetention = average(metricsList.map(m => m.thirtyDay.retentionRate));
        const avg90DayRetention = average(metricsList.map(m => m.ninetyDay.retentionRate));
        const avgBugCount = average(metricsList.map(m => m.launchWeek.bugCount));

        // Find top performer and games needing review
        const sorted = [...metricsList].sort((a, b) =>
            b.ninetyDay.retentionRate - a.ninetyDay.retentionRate
        );

        const needsReviewGames = metricsList
            .filter(m => m.thirtyDay.retentionRate < 20) // Less than 20% retention
            .map(m => m.gameId);

        return {
            totalGames,
            avgLaunchWeekAcquisition,
            avg30DayRetention,
            avg90DayRetention,
            avgBugCount,
            topPerformingGame: sorted[0]?.gameId || null,
            needsReviewGames,
        };
    }

    /**
     * Get empty launch week metrics
     */
    private getEmptyLaunchWeekMetrics(): LaunchWeekMetrics {
        return {
            userAcquisition: 0,
            engagementRate: 0,
            completionRate: 0,
            feedbackScore: 0,
            bugCount: 0,
            crashRate: 0,
            avgSessionDuration: 0,
            dailyActiveUsers: [],
        };
    }

    /**
     * Get empty 30-day metrics
     */
    private getEmptyThirtyDayMetrics(): ThirtyDayMetrics {
        return {
            userAcquisition: 0,
            engagementRate: 0,
            completionRate: 0,
            feedbackScore: 0,
            bugCount: 0,
            retentionRate: 0,
            avgSessionDuration: 0,
            weeklyActiveUsers: [],
            churnRate: 100,
        };
    }

    /**
     * Get empty 90-day metrics
     */
    private getEmptyNinetyDayMetrics(): NinetyDayMetrics {
        return {
            userAcquisition: 0,
            engagementRate: 0,
            completionRate: 0,
            feedbackScore: 0,
            bugCount: 0,
            retentionRate: 0,
            avgSessionDuration: 0,
            monthlyActiveUsers: [],
            churnRate: 100,
            ltvEstimate: 0,
        };
    }

    /**
     * Get the configuration
     */
    public getConfig(): LaunchMetricsConfig {
        return { ...this.config };
    }
}

/**
 * Create a default launch metrics calculator
 */
export function createLaunchMetricsCalculator(
    config?: Partial<LaunchMetricsConfig>
): LaunchMetricsCalculator {
    return new LaunchMetricsCalculator(config);
}