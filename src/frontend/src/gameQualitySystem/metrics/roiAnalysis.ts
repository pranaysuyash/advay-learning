/**
 * ROI Analysis Generation Module
 *
 * Compares 90-day metrics against baseline projections and generates ROI analysis.
 *
 * Requirement 5.5: Compare 90-day metrics against baseline projections and generate ROI_analysis
 */

import type { GameId } from '../types';
import type { NinetyDayMetrics } from './launchMetrics';
import {
    createImprovementMetricsCalculator,
    type ImprovementBaseline,
    type ImprovementOutcome,
} from './improvementMetrics';

/**
 * Baseline projections for ROI comparison
 */
export interface BaselineProjections {
    targetEngagementRate: number; // Target engagement rate (%)
    targetCompletionRate: number; // Target completion rate (%)
    targetFeedbackScore: number; // Target feedback score (1-5)
    targetRetentionRate: number; // Target retention rate (%)
    maxBugCount: number; // Maximum acceptable bugs
    estimatedImplementationCost: number; // Estimated cost to implement
    expectedLTV: number; // Expected lifetime value per user
    projectedUserAcquisition: number; // Expected users acquired
}

/**
 * Actual 90-day metrics for comparison
 */
export interface NinetyDayMetricsInput {
    gameId: GameId;
    gameName: string;
    metrics: NinetyDayMetrics;
    implementationCost: number;
}

/**
 * ROI analysis result
 */
export interface ROIAnalysis {
    gameId: GameId;
    gameName: string;

    // Engagement metrics comparison
    engagementRate: {
        actual: number;
        projected: number;
        variance: number; // percentage points
        status: 'exceeded' | 'met' | 'below';
    };

    // Completion rate comparison
    completionRate: {
        actual: number;
        projected: number;
        variance: number;
        status: 'exceeded' | 'met' | 'below';
    };

    // Feedback score comparison
    feedbackScore: {
        actual: number;
        projected: number;
        variance: number;
        status: 'exceeded' | 'met' | 'below';
    };

    // Retention rate comparison
    retentionRate: {
        actual: number;
        projected: number;
        variance: number;
        status: 'exceeded' | 'met' | 'below';
    };

    // Bug count comparison
    bugCount: {
        actual: number;
        projected: number;
        variance: number;
        status: 'exceeded' | 'met' | 'below'; // exceeded = more bugs = bad
    };

    // User acquisition comparison
    userAcquisition: {
        actual: number;
        projected: number;
        variance: number;
        status: 'exceeded' | 'met' | 'below';
    };

    // Financial analysis
    financial: {
        implementationCost: number;
        actualLTV: number;
        projectedLTV: number;
        roi: number; // (actualLTV - cost) / cost * 100
        projectedROI: number;
        breakEvenAchieved: boolean;
        breakEvenDate?: string;
        netValue: number;
    };

    // Overall assessment
    overallScore: number; // 0-100
    overallStatus: 'successful' | 'marginal' | 'unsuccessful';
    recommendations: string[];
    analyzedAt: string;
}

/**
 * Configuration for ROI analysis
 */
export interface ROIAnalysisConfig {
    varianceThreshold: number; // +/- percentage for "met" status
    successThreshold: number; // Overall score for "successful" status
    marginalThreshold: number; // Overall score for "marginal" status
    ltvMultiplier: number; // Multiplier for LTV calculation
}

/**
 * Default configuration for ROI analysis
 */
export const DEFAULT_ROI_ANALYSIS_CONFIG: ROIAnalysisConfig = {
    varianceThreshold: 10, // Within 10% = met
    successThreshold: 70, // 70% overall score = successful
    marginalThreshold: 40, // 40% overall score = marginal
    ltvMultiplier: 1,
};

/**
 * ROI Analysis Generator
 *
 * Compares 90-day metrics against baseline projections and generates ROI analysis.
 * Validates: Requirement 5.5
 */
export class ROIAnalysisGenerator {
    private readonly config: ROIAnalysisConfig;

    constructor(config: Partial<ROIAnalysisConfig> = {}) {
        this.config = { ...DEFAULT_ROI_ANALYSIS_CONFIG, ...config };
    }

    /**
     * Generate ROI analysis from 90-day metrics and baseline projections
     */
    public generateROIAnalysis(
        metrics: NinetyDayMetricsInput,
        baseline: BaselineProjections
    ): ROIAnalysis {
        const { gameId, gameName, metrics: ninetyDayMetrics, implementationCost } =
            metrics;

        // Calculate variances and status for each metric
        const engagementRate = this.compareMetric(
            ninetyDayMetrics.engagementRate,
            baseline.targetEngagementRate,
            true // higher is better
        );

        const completionRate = this.compareMetric(
            ninetyDayMetrics.completionRate,
            baseline.targetCompletionRate,
            true
        );

        const feedbackScore = this.compareMetric(
            ninetyDayMetrics.feedbackScore,
            baseline.targetFeedbackScore,
            true
        );

        const retentionRate = this.compareMetric(
            ninetyDayMetrics.retentionRate,
            baseline.targetRetentionRate,
            true
        );

        const bugCount = this.compareBugCount(
            ninetyDayMetrics.bugCount,
            baseline.maxBugCount
        );

        const userAcquisition = this.compareMetric(
            ninetyDayMetrics.userAcquisition,
            baseline.projectedUserAcquisition,
            true
        );

        // Calculate financial metrics
        const actualLTV = this.calculateActualLTV(ninetyDayMetrics, baseline);
        const projectedLTV = baseline.expectedLTV * baseline.projectedUserAcquisition;
        const roi = implementationCost > 0 ? ((actualLTV - implementationCost) / implementationCost) * 100 : 0;
        const projectedROI = implementationCost > 0 ? ((projectedLTV - implementationCost) / implementationCost) * 100 : 0;
        const netValue = actualLTV - implementationCost;
        const breakEvenAchieved = actualLTV >= implementationCost;

        // Calculate break-even date (simplified)
        const breakEvenDate = this.estimateBreakEvenDate(
            ninetyDayMetrics.userAcquisition,
            actualLTV,
            implementationCost
        );

        // Calculate overall score
        const overallScore = this.calculateOverallScore([
            engagementRate,
            completionRate,
            feedbackScore,
            retentionRate,
            bugCount,
            userAcquisition,
        ]);

        // Determine overall status
        const overallStatus = this.determineOverallStatus(overallScore);

        // Generate recommendations
        const recommendations = this.generateRecommendations(
            engagementRate,
            completionRate,
            feedbackScore,
            retentionRate,
            bugCount,
            userAcquisition,
            overallStatus
        );

        return {
            gameId,
            gameName,
            engagementRate,
            completionRate,
            feedbackScore,
            retentionRate,
            bugCount,
            userAcquisition,
            financial: {
                implementationCost,
                actualLTV,
                projectedLTV,
                roi,
                projectedROI,
                breakEvenAchieved,
                breakEvenDate,
                netValue,
            },
            overallScore,
            overallStatus,
            recommendations,
            analyzedAt: new Date().toISOString(),
        };
    }

    /**
     * Compare actual vs projected metric
     */
    private compareMetric(
        actual: number,
        projected: number,
        higherIsBetter: boolean
    ): { actual: number; projected: number; variance: number; status: 'exceeded' | 'met' | 'below' } {
        const variance = projected > 0 ? ((actual - projected) / projected) * 100 : 0;

        let status: 'exceeded' | 'met' | 'below';
        if (higherIsBetter) {
            if (variance >= this.config.varianceThreshold) {
                status = 'exceeded';
            } else if (variance <= -this.config.varianceThreshold) {
                status = 'below';
            } else {
                status = 'met';
            }
        } else {
            // For metrics where lower is better (like bugs)
            if (variance <= -this.config.varianceThreshold) {
                status = 'exceeded';
            } else if (variance >= this.config.varianceThreshold) {
                status = 'below';
            } else {
                status = 'met';
            }
        }

        return { actual, projected, variance, status };
    }

    /**
     * Compare bug count against a maximum acceptable ceiling.
     *
     * `maxBugCount` is a guardrail, not a target to beat by tiny margins.
     * Treat results at or below the ceiling as `met`, with `exceeded` reserved
     * for materially outperforming the ceiling.
     */
    private compareBugCount(
        actual: number,
        maxBugCount: number
    ): { actual: number; projected: number; variance: number; status: 'exceeded' | 'met' | 'below' } {
        const variance = maxBugCount > 0 ? ((actual - maxBugCount) / maxBugCount) * 100 : 0;

        if (actual > maxBugCount) {
            return { actual, projected: maxBugCount, variance, status: 'below' };
        }

        if (actual <= maxBugCount / 2) {
            return { actual, projected: maxBugCount, variance, status: 'exceeded' };
        }

        return { actual, projected: maxBugCount, variance, status: 'met' };
    }

    /**
     * Calculate actual LTV based on 90-day metrics
     */
    private calculateActualLTV(
        metrics: NinetyDayMetricsInput['metrics'],
        _baseline: BaselineProjections
    ): number {
        // LTV = users * retention * engagement * base value
        const retentionFactor = metrics.retentionRate / 100;
        const engagementFactor = metrics.engagementRate / 100;
        const qualityFactor = metrics.feedbackScore / 5; // Normalize to 0-1

        const baseValuePerUser = 10; // Base value per retained, engaged user
        return metrics.userAcquisition * retentionFactor * engagementFactor * qualityFactor * baseValuePerUser * this.config.ltvMultiplier;
    }

    /**
     * Estimate break-even date
     */
    private estimateBreakEvenDate(
        userAcquisition: number,
        actualLTV: number,
        implementationCost: number
    ): string | undefined {
        if (userAcquisition === 0 || actualLTV === 0) {
            return undefined;
        }

        const ltvPerUser = actualLTV / userAcquisition;
        if (ltvPerUser <= 0) {
            return undefined;
        }

        const daysToBreakEven = implementationCost / ltvPerUser;
        const breakEvenDate = new Date();
        breakEvenDate.setDate(breakEvenDate.getDate() + daysToBreakEven);

        return breakEvenDate.toISOString().split('T')[0];
    }

    /**
     * Calculate overall score from individual metric scores
     */
    private calculateOverallScore(
        metrics: Array<{ actual: number; projected: number; variance: number; status: 'exceeded' | 'met' | 'below' }>
    ): number {
        if (metrics.length === 0) return 0;

        const statusScores = {
            exceeded: 100,
            met: 75,
            below: 25,
        };

        const totalScore = metrics.reduce((sum, m) => sum + statusScores[m.status], 0);
        return totalScore / metrics.length;
    }

    /**
     * Determine overall status based on score
     */
    private determineOverallStatus(score: number): 'successful' | 'marginal' | 'unsuccessful' {
        if (score >= this.config.successThreshold) {
            return 'successful';
        }
        if (score >= this.config.marginalThreshold) {
            return 'marginal';
        }
        return 'unsuccessful';
    }

    /**
     * Generate recommendations based on metric comparisons
     */
    private generateRecommendations(
        engagementRate: { status: string },
        completionRate: { status: string },
        feedbackScore: { status: string },
        retentionRate: { status: string },
        bugCount: { status: string },
        userAcquisition: { status: string },
        overallStatus: string
    ): string[] {
        const recommendations: string[] = [];

        if (overallStatus === 'successful') {
            recommendations.push('Congratulations on a successful launch!');
            recommendations.push('Consider scaling marketing efforts to acquire more users.');
            recommendations.push('Document best practices for future game launches.');
        } else if (overallStatus === 'marginal') {
            recommendations.push('Review underperforming metrics and create improvement plan.');
            recommendations.push('Gather user feedback to identify specific issues.');
            recommendations.push('Consider A/B testing for key features.');
        } else {
            recommendations.push('URGENT: Schedule immediate review meeting.');
            recommendations.push('Conduct thorough user research to understand disengagement.');
            recommendations.push('Consider major game improvements or redesign.');
            recommendations.push('Review and optimize user acquisition strategy.');
        }

        if (engagementRate.status === 'below') {
            recommendations.push('Focus on improving user engagement through better gameplay mechanics.');
        }

        if (completionRate.status === 'below') {
            recommendations.push('Analyze drop-off points to improve completion rates.');
            recommendations.push('Consider simplifying difficult levels or adding hints.');
        }

        if (feedbackScore.status === 'below') {
            recommendations.push('Review user feedback comments for specific improvement areas.');
            recommendations.push('Address common complaints identified in feedback.');
        }

        if (retentionRate.status === 'below') {
            recommendations.push('Implement retention features like achievements or daily rewards.');
            recommendations.push('Improve onboarding experience for new users.');
        }

        if (bugCount.status === 'below') {
            recommendations.push('Prioritize bug fixes in next sprint.');
            recommendations.push('Implement additional testing to prevent regressions.');
        }

        if (userAcquisition.status === 'below') {
            recommendations.push('Review and optimize marketing strategy.');
            recommendations.push('Consider partnerships or promotional campaigns.');
        }

        return recommendations;
    }

    /**
     * Generate ROI analysis for improvement metrics
     */
    public generateImprovementROIAnalysis(
        gameId: GameId,
        __gameName: string,
        baseline: ImprovementBaseline,
        outcome: ImprovementOutcome,
        implementationCost: number
    ): {
        qualityImprovement: number;
        engagementImprovement: number;
        completionImprovement: number;
        bugReduction: number;
        overallScore: number;
        roi: number;
        status: 'successful' | 'marginal' | 'unsuccessful';
    } {
        const improvementCalculator = createImprovementMetricsCalculator();
        const metrics = improvementCalculator.calculateImprovementMetrics(gameId, baseline, outcome);

        // Calculate ROI based on improvements
        const improvementValue = (
            metrics.qualityScoreImprovement * 0.3 +
            metrics.userEngagementChange * 0.3 +
            metrics.completionRateChange * 0.2 +
            Math.abs(metrics.bugReportReduction) * 0.2
        ) * 100;

        const roi = implementationCost > 0 ? ((improvementValue - implementationCost) / implementationCost) * 100 : 0;

        let status: 'successful' | 'marginal' | 'unsuccessful';
        if (metrics.overallImprovementScore >= 50 && roi >= 0) {
            status = 'successful';
        } else if (metrics.overallImprovementScore >= 20 && roi >= -50) {
            status = 'marginal';
        } else {
            status = 'unsuccessful';
        }

        return {
            qualityImprovement: metrics.qualityScoreImprovement,
            engagementImprovement: metrics.userEngagementChange,
            completionImprovement: metrics.completionRateChange,
            bugReduction: metrics.bugReportReduction,
            overallScore: metrics.overallImprovementScore,
            roi,
            status,
        };
    }

    /**
     * Get the configuration
     */
    public getConfig(): ROIAnalysisConfig {
        return { ...this.config };
    }
}

/**
 * Create a default ROI analysis generator
 */
export function createROIAnalysisGenerator(
    config?: Partial<ROIAnalysisConfig>
): ROIAnalysisGenerator {
    return new ROIAnalysisGenerator(config);
}
