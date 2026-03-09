/**
 * Improvement Metrics Tracking Module
 * 
 * Tracks improvement metrics for game quality improvements:
 * - Quality_Score_Improvement
 * - User_Engagement_Change
 * - Completion_Rate_Change
 * - Bug_Report_Reduction
 * 
 * Requirement 4.1: Track Quality_Score_Improvement, User_Engagement_Change, Completion_Rate_Change, and Bug_Report_Reduction
 */

import type { GameId, AuditReport } from '../types';

/**
 * Pre-improvement baseline metrics
 */
export interface ImprovementBaseline {
    qualityScore: number;
    userEngagement: number;
    completionRate: number;
    bugCount: number;
    timestamp: string;
}

/**
 * Post-improvement metrics
 */
export interface ImprovementOutcome {
    qualityScore: number;
    userEngagement: number;
    completionRate: number;
    bugCount: number;
    timestamp: string;
}

/**
 * Calculated improvement metrics
 */
export interface ImprovementMetrics {
    gameId: GameId;
    qualityScoreImprovement: number;
    userEngagementChange: number;
    completionRateChange: number;
    bugReportReduction: number;
    overallImprovementScore: number;
    isStatisticallySignificant: boolean;
    baseline: ImprovementBaseline;
    outcome: ImprovementOutcome;
    calculatedAt: string;
}

/**
 * Configuration for improvement metrics calculation
 */
export interface ImprovementMetricsConfig {
    statisticalThreshold: number; // Minimum percentage change to be considered significant
    bugReductionPositive: boolean; // Whether bug reduction is considered positive
    minSampleSize: number; // Minimum data points required
}

/**
 * Default configuration for improvement metrics
 */
export const DEFAULT_IMPROVEMENT_METRICS_CONFIG: ImprovementMetricsConfig = {
    statisticalThreshold: 5, // 5% minimum change
    bugReductionPositive: true,
    minSampleSize: 10,
};

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(before: number, after: number): number {
    if (before === 0) {
        return after > 0 ? 100 : 0;
    }
    return ((after - before) / before) * 100;
}

/**
 * Calculate bug report reduction (positive when bugs decrease)
 */
function calculateBugReduction(before: number, after: number): number {
    if (before === 0) {
        return after === 0 ? 0 : 0; // Can't calculate reduction from 0
    }
    // Return positive value when bugs decrease (after < before)
    return ((before - after) / before) * 100;
}

/**
 * Determine if improvement is statistically significant
 */
function isSignificant(change: number, threshold: number): boolean {
    return Math.abs(change) >= threshold;
}

/**
 * Improvement Metrics Calculator
 * 
 * Tracks and calculates improvement metrics for game quality improvements.
 * Validates: Requirement 4.1
 */
export class ImprovementMetricsCalculator {
    private readonly config: ImprovementMetricsConfig;

    constructor(config: Partial<ImprovementMetricsConfig> = {}) {
        this.config = { ...DEFAULT_IMPROVEMENT_METRICS_CONFIG, ...config };
    }

    /**
     * Calculate all improvement metrics from baseline to outcome
     */
    public calculateImprovementMetrics(
        gameId: GameId,
        baseline: ImprovementBaseline,
        outcome: ImprovementOutcome
    ): ImprovementMetrics {
        const qualityScoreImprovement = calculatePercentageChange(
            baseline.qualityScore,
            outcome.qualityScore
        );

        const userEngagementChange = calculatePercentageChange(
            baseline.userEngagement,
            outcome.userEngagement
        );

        const completionRateChange = calculatePercentageChange(
            baseline.completionRate,
            outcome.completionRate
        );

        // Bug reduction is positive when bugs decrease
        const rawBugReportReduction = calculateBugReduction(
            baseline.bugCount,
            outcome.bugCount
        );
        const bugReportReduction = this.config.bugReductionPositive
            ? rawBugReportReduction
            : -rawBugReportReduction;

        // Calculate overall improvement score (weighted average)
        const overallImprovementScore = (
            qualityScoreImprovement * 0.35 +
            userEngagementChange * 0.30 +
            completionRateChange * 0.25 +
            bugReportReduction * 0.10
        );

        // Check if any metric is significant
        const isStatisticallySignificant =
            isSignificant(qualityScoreImprovement, this.config.statisticalThreshold) ||
            isSignificant(userEngagementChange, this.config.statisticalThreshold) ||
            isSignificant(completionRateChange, this.config.statisticalThreshold) ||
            isSignificant(bugReportReduction, this.config.statisticalThreshold);

        return {
            gameId,
            qualityScoreImprovement,
            userEngagementChange,
            completionRateChange,
            bugReportReduction,
            overallImprovementScore,
            isStatisticallySignificant,
            baseline,
            outcome,
            calculatedAt: new Date().toISOString(),
        };
    }

    /**
     * Calculate improvement metrics from audit reports (before/after)
     */
    public calculateFromAuditReports(
        gameId: GameId,
        beforeAudit: AuditReport,
        afterAudit: AuditReport
    ): ImprovementMetrics {
        const baseline: ImprovementBaseline = {
            qualityScore: beforeAudit.totalScore,
            userEngagement: 0, // Not available in audit report
            completionRate: 0, // Not available in audit report
            bugCount: 0, // Not available in audit report
            timestamp: beforeAudit.auditDate,
        };

        const outcome: ImprovementOutcome = {
            qualityScore: afterAudit.totalScore,
            userEngagement: 0,
            completionRate: 0,
            bugCount: 0,
            timestamp: afterAudit.auditDate,
        };

        return this.calculateImprovementMetrics(gameId, baseline, outcome);
    }

    /**
     * Generate a summary of improvement metrics
     */
    public generateSummary(metrics: ImprovementMetrics[]): {
        totalGames: number;
        avgQualityImprovement: number;
        avgEngagementChange: number;
        avgCompletionRateChange: number;
        avgBugReduction: number;
        significantImprovements: number;
        gamesNeedingReview: number;
    } {
        if (metrics.length === 0) {
            return {
                totalGames: 0,
                avgQualityImprovement: 0,
                avgEngagementChange: 0,
                avgCompletionRateChange: 0,
                avgBugReduction: 0,
                significantImprovements: 0,
                gamesNeedingReview: 0,
            };
        }

        const totalGames = metrics.length;
        const avgQualityImprovement = metrics.reduce((sum, m) => sum + m.qualityScoreImprovement, 0) / totalGames;
        const avgEngagementChange = metrics.reduce((sum, m) => sum + m.userEngagementChange, 0) / totalGames;
        const avgCompletionRateChange = metrics.reduce((sum, m) => sum + m.completionRateChange, 0) / totalGames;
        const avgBugReduction = metrics.reduce((sum, m) => sum + m.bugReportReduction, 0) / totalGames;
        const significantImprovements = metrics.filter(m => m.isStatisticallySignificant).length;
        const gamesNeedingReview = metrics.filter(m => !m.isStatisticallySignificant).length;

        return {
            totalGames,
            avgQualityImprovement,
            avgEngagementChange,
            avgCompletionRateChange,
            avgBugReduction,
            significantImprovements,
            gamesNeedingReview,
        };
    }

    /**
     * Get the configuration
     */
    public getConfig(): ImprovementMetricsConfig {
        return { ...this.config };
    }
}

/**
 * Create a default improvement metrics calculator
 */
export function createImprovementMetricsCalculator(
    config?: Partial<ImprovementMetricsConfig>
): ImprovementMetricsCalculator {
    return new ImprovementMetricsCalculator(config);
}
