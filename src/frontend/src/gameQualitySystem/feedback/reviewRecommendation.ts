// Review Recommendation Logic for Feedback Module
// Recommends review if completion rate is below benchmark by more than 20%
// Validates: Requirement 10.3

import type { GameMetrics } from '../types';
import type { GameBenchmark, GameType } from './benchmarkComparator';

/**
 * Review recommendation types
 */
export type ReviewRecommendationType = 'completion_rate_review' | 'no_action';

/**
 * Review recommendation result
 */
export interface ReviewRecommendation {
    shouldRecommendReview: boolean;
    reason: ReviewRecommendationType;
    completionRate: number;
    benchmarkTarget: number;
    deviationPercentage: number;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    suggestedActions: string[];
}

/**
 * Review recommendation configuration
 */
export interface ReviewRecommendationConfig {
    /** Threshold for triggering review recommendation (default: 20%) */
    completionRateThresholdPercent?: number;
    /** Whether to include suggested actions in the result */
    includeSuggestedActions?: boolean;
}

/**
 * Default configuration for review recommendations
 */
export const DEFAULT_REVIEW_RECOMMENDATION_CONFIG: ReviewRecommendationConfig = {
    completionRateThresholdPercent: 20,
    includeSuggestedActions: true,
};

/**
 * Determines the severity level based on deviation percentage
 */
function getSeverity(deviationPercentage: number): 'critical' | 'warning' | 'info' {
    if (deviationPercentage <= -40) {
        return 'critical';
    } else if (deviationPercentage <= -30) {
        return 'warning';
    }
    return 'info';
}

/**
 * Generates suggested actions based on the review recommendation
 */
function generateSuggestedActions(
    completionRate: number,
    benchmarkTarget: number,
    gameType: GameType
): string[] {
    const actions: string[] = [];
    const gap = benchmarkTarget - completionRate;

    // General action for significant gap
    if (gap > 30) {
        actions.push('Conduct a comprehensive game flow review');
    }

    // Game-type specific suggestions
    switch (gameType) {
        case 'puzzle':
            actions.push('Review puzzle difficulty progression');
            actions.push('Check if hints are available and helpful');
            actions.push('Consider adding intermediate difficulty levels');
            break;
        case 'action':
            actions.push('Review game pacing and difficulty curve');
            actions.push('Check for frustrating difficulty spikes');
            actions.push('Consider adding checkpoints or save points');
            break;
        case 'educational':
            actions.push('Review content engagement and relevance');
            actions.push('Check if learning objectives are clear');
            actions.push('Consider adding more interactive elements');
            break;
        case 'quiz':
            actions.push('Review question difficulty distribution');
            actions.push('Check if feedback explanations are clear');
            actions.push('Consider adjusting time limits');
            break;
        case 'simulation':
            actions.push('Review simulation complexity and learning curve');
            actions.push('Check if controls are intuitive');
            actions.push('Consider adding tutorial or guidance');
            break;
        case 'adventure':
            actions.push('Review narrative pacing and engagement');
            actions.push('Check for confusing gameplay sections');
            actions.push('Consider adding quest markers or guidance');
            break;
    }

    // Add general improvement suggestions
    actions.push('Analyze user drop-off points in the game');
    actions.push('Review user feedback for specific complaints');
    actions.push('Consider A/B testing simplified game flow');

    return actions;
}

/**
 * Determines if a review should be recommended based on completion rate deviation
 * Validates: Requirement 10.3 - "IF a game's completion rate is below benchmark by more than 20%, THEN THE Feedback_Module SHALL recommend review"
 */
export function shouldRecommendReview(
    metrics: GameMetrics,
    benchmark: GameBenchmark,
    config: ReviewRecommendationConfig = DEFAULT_REVIEW_RECOMMENDATION_CONFIG
): ReviewRecommendation {
    const effectiveConfig = { ...DEFAULT_REVIEW_RECOMMENDATION_CONFIG, ...config };

    // Calculate deviation from benchmark
    const deviationPercentage = benchmark.completionRate.target !== 0
        ? ((metrics.completionRate - benchmark.completionRate.target) / benchmark.completionRate.target) * 100
        : 0;

    // Check if completion rate is below benchmark by more than the threshold
    const threshold = effectiveConfig.completionRateThresholdPercent!;
    const isBelowThreshold = deviationPercentage < -threshold;

    // Determine severity
    const severity = getSeverity(deviationPercentage);

    // Generate message
    let message: string;
    if (isBelowThreshold) {
        message = `Completion rate (${metrics.completionRate.toFixed(1)}%) is ${Math.abs(deviationPercentage).toFixed(1)}% below benchmark (${benchmark.completionRate.target}%) - review recommended`;
    } else {
        message = `Completion rate (${metrics.completionRate.toFixed(1)}%) is within acceptable range of benchmark (${benchmark.completionRate.target}%)`;
    }

    // Generate suggested actions if enabled
    const suggestedActions = effectiveConfig.includeSuggestedActions
        ? generateSuggestedActions(metrics.completionRate, benchmark.completionRate.target, benchmark.gameType)
        : [];

    return {
        shouldRecommendReview: isBelowThreshold,
        reason: isBelowThreshold ? 'completion_rate_review' : 'no_action',
        completionRate: metrics.completionRate,
        benchmarkTarget: benchmark.completionRate.target,
        deviationPercentage,
        severity,
        message,
        suggestedActions,
    };
}

/**
 * Batch review recommendation for multiple games
 */
export function batchReviewRecommendations(
    games: Array<{ metrics: GameMetrics; benchmark: GameBenchmark }>,
    config?: ReviewRecommendationConfig
): ReviewRecommendation[] {
    return games.map(game => shouldRecommendReview(game.metrics, game.benchmark, config));
}

/**
 * Filter games that need review based on completion rate
 */
export function filterGamesNeedingReview(
    games: Array<{ metrics: GameMetrics; benchmark: GameBenchmark }>,
    config?: ReviewRecommendationConfig
): Array<{ metrics: GameMetrics; benchmark: GameBenchmark; recommendation: ReviewRecommendation }> {
    const recommendations = batchReviewRecommendations(games, config);

    return games
        .map((game, index) => ({
            ...game,
            recommendation: recommendations[index],
        }))
        .filter(item => item.recommendation.shouldRecommendReview);
}

/**
 * Get review priority based on severity
 */
export function getReviewPriority(recommendation: ReviewRecommendation): number {
    switch (recommendation.severity) {
        case 'critical':
            return 1;
        case 'warning':
            return 2;
        case 'info':
            return 3;
        default:
            return 4;
    }
}

/**
 * Sort games by review priority
 */
export function sortByReviewPriority(
    games: Array<{ metrics: GameMetrics; benchmark: GameBenchmark; recommendation: ReviewRecommendation }>
): Array<{ metrics: GameMetrics; benchmark: GameBenchmark; recommendation: ReviewRecommendation }> {
    return [...games].sort((a, b) =>
        getReviewPriority(a.recommendation) - getReviewPriority(b.recommendation)
    );
}