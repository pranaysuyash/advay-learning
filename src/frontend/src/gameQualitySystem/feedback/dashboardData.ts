// Dashboard Data Generation for Feedback Module
// Generates comprehensive dashboard data including Game_Health_Score, Recent_Changes, and Recommended_Actions
// Validates: Requirement 10.5 - "THE Feedback_Module SHALL provide a dashboard showing: Game_Health_Score, Recent_Changes, and Recommended_Actions"

import type {
    GameMetrics,
    FeedbackAnalysis,
} from '../types';
import {
    compareAgainstBenchmark,
    createGameBenchmark,
    type BenchmarkComparisonResult,
    type GameType,
} from './benchmarkComparator';
import { shouldRecommendReview, type ReviewRecommendationConfig } from './reviewRecommendation';
import type { ReviewRecommendation } from './reviewRecommendation';
import {
    generateImprovementSuggestions,
    type ImprovementSuggestion,
    type ImprovementSuggestionsConfig,
} from './improvementSuggestions';

/**
 * Recent change entry for the dashboard
 */
export interface RecentChange {
    id: string;
    type: 'improvement' | 'fix' | 'feature' | 'content_update' | 'configuration';
    description: string;
    timestamp: string;
    impact: 'high' | 'medium' | 'low';
    relatedMetrics: string[];
}

/**
 * Recommended action for the dashboard
 */
export interface RecommendedAction {
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    estimatedEffort: 'small' | 'medium' | 'large';
    potentialImpact: number;
    relatedMetrics: string[];
    suggestedSteps: string[];
}

/**
 * Game health score breakdown
 */
export interface GameHealthScoreBreakdown {
    overall: number;
    completionRate: { score: number; weight: number; contribution: number };
    userEngagement: { score: number; weight: number; contribution: number };
    performance: { score: number; weight: number; contribution: number };
    accessibility: { score: number; weight: number; contribution: number };
    contentQuality: { score: number; weight: number; contribution: number };
}

/**
 * Complete dashboard data structure
 */
export interface DashboardData {
    gameId: string;
    generatedAt: string;
    gameHealthScore: number;
    healthScoreBreakdown: GameHealthScoreBreakdown;
    recentChanges: RecentChange[];
    recommendedActions: RecommendedAction[];
    healthStatus: 'excellent' | 'good' | 'needs_attention' | 'critical';
    benchmarkComparison: BenchmarkComparisonResult | null;
    improvementSuggestions: ImprovementSuggestion[];
    reviewRecommendation: ReviewRecommendation | null;
}

/**
 * Configuration for dashboard data generation
 */
export interface DashboardDataConfig {
    /** Weights for health score calculation */
    healthScoreWeights?: {
        completionRate: number;
        userEngagement: number;
        performance: number;
        accessibility: number;
        contentQuality: number;
    };
    /** Maximum number of recent changes to include */
    maxRecentChanges?: number;
    /** Maximum number of recommended actions to include */
    maxRecommendedActions?: number;
    /** Benchmark type to use */
    benchmarkType?: GameType;
    /** Configuration for improvement suggestions */
    improvementSuggestionsConfig?: ImprovementSuggestionsConfig;
    /** Configuration for review recommendations */
    reviewRecommendationConfig?: ReviewRecommendationConfig;
}

/**
 * Default configuration for dashboard data generation
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardDataConfig = {
    healthScoreWeights: {
        completionRate: 0.30,
        userEngagement: 0.25,
        performance: 0.20,
        accessibility: 0.15,
        contentQuality: 0.10,
    },
    maxRecentChanges: 10,
    maxRecommendedActions: 5,
    benchmarkType: 'puzzle',
    improvementSuggestionsConfig: {
        minDeviationPercent: 10,
        maxSuggestions: 5,
        includeEstimatedImpact: true,
        includeSuggestedActions: true,
    },
    reviewRecommendationConfig: {
        completionRateThresholdPercent: 20,
        includeSuggestedActions: true,
    },
};

/**
 * Health status thresholds
 */
const HEALTH_STATUS_THRESHOLDS = {
    excellent: 85,
    good: 70,
    needs_attention: 50,
    critical: 0,
};

/**
 * Determines health status based on score
 */
function getHealthStatus(score: number): 'excellent' | 'good' | 'needs_attention' | 'critical' {
    if (score >= HEALTH_STATUS_THRESHOLDS.excellent) return 'excellent';
    if (score >= HEALTH_STATUS_THRESHOLDS.good) return 'good';
    if (score >= HEALTH_STATUS_THRESHOLDS.critical) return 'needs_attention';
    return 'critical';
}

/**
 * Generates a unique ID for dashboard entries
 */
function generateDashboardId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculates the game health score with detailed breakdown
 */
function calculateHealthScore(
    metrics: GameMetrics,
    comparisonResult: BenchmarkComparisonResult | null,
    weights: DashboardDataConfig['healthScoreWeights']
): { overall: number; breakdown: GameHealthScoreBreakdown } {
    if (!weights) {
        weights = DEFAULT_DASHBOARD_CONFIG.healthScoreWeights!;
    }

    // Calculate individual component scores (0-100 scale)
    const completionRateScore = Math.min(100, metrics.completionRate);
    const userEngagementScore = Math.min(100, (metrics.playCount / 10) * 100); // Normalize: 10 plays = 100%
    const performanceScore = Math.max(0, (1 - metrics.errorRate) * 100);
    const contentQualityScore = metrics.averageScore;

    // Accessibility score (based on error rate and time on task)
    const accessibilityScore = Math.min(100, performanceScore * 0.7 + (metrics.timeOnTask > 60 ? 30 : 0));

    // Calculate contributions
    const completionContribution = completionRateScore * weights.completionRate;
    const engagementContribution = userEngagementScore * weights.userEngagement;
    const performanceContribution = performanceScore * weights.performance;
    const accessibilityContribution = accessibilityScore * weights.accessibility;
    const contentContribution = contentQualityScore * weights.contentQuality;

    // Calculate overall score
    const overall = completionContribution + engagementContribution +
        performanceContribution + accessibilityContribution + contentContribution;

    // Apply benchmark adjustments if available
    let adjustedOverall = overall;
    if (comparisonResult) {
        // Use metricsWithinBenchmark to adjust score - more metrics in benchmark = higher score
        const benchmarkRatio = comparisonResult.metricsWithinBenchmark / comparisonResult.totalMetrics;
        // Adjust by up to 10% based on how many metrics are within benchmark
        const benchmarkAdjustment = (benchmarkRatio - 0.5) * 20; // Range: -10 to +10
        adjustedOverall = Math.max(0, Math.min(100, overall + benchmarkAdjustment));
    }

    const breakdown: GameHealthScoreBreakdown = {
        overall: Math.round(adjustedOverall * 100) / 100,
        completionRate: {
            score: Math.round(completionRateScore * 100) / 100,
            weight: weights.completionRate,
            contribution: Math.round(completionContribution * 100) / 100,
        },
        userEngagement: {
            score: Math.round(userEngagementScore * 100) / 100,
            weight: weights.userEngagement,
            contribution: Math.round(engagementContribution * 100) / 100,
        },
        performance: {
            score: Math.round(performanceScore * 100) / 100,
            weight: weights.performance,
            contribution: Math.round(performanceContribution * 100) / 100,
        },
        accessibility: {
            score: Math.round(accessibilityScore * 100) / 100,
            weight: weights.accessibility,
            contribution: Math.round(accessibilityContribution * 100) / 100,
        },
        contentQuality: {
            score: Math.round(contentQualityScore * 100) / 100,
            weight: weights.contentQuality,
            contribution: Math.round(contentContribution * 100) / 100,
        },
    };

    return { overall: adjustedOverall, breakdown };
}

/**
 * Generates recent changes from metrics history and events
 */
function generateRecentChanges(
    _metrics: GameMetrics,
    comparisonResult: BenchmarkComparisonResult | null,
    config: DashboardDataConfig
): RecentChange[] {
    const changes: RecentChange[] = [];
    const maxChanges = config.maxRecentChanges || DEFAULT_DASHBOARD_CONFIG.maxRecentChanges!;

    // Generate changes based on benchmark comparisons
    if (comparisonResult) {
        for (const comparison of Object.values(comparisonResult.metricsComparison)) {
            if (Math.abs(comparison.deviationPercentage) > 15) {
                const isImprovement = comparison.deviationPercentage > 0;
                changes.push({
                    id: generateDashboardId('CHANGE'),
                    type: isImprovement ? 'improvement' : 'fix',
                    description: `${comparison.metricName} ${isImprovement ? 'improved' : 'declined'} by ${Math.abs(comparison.deviationPercentage).toFixed(1)}%`,
                    timestamp: new Date().toISOString(),
                    impact: Math.abs(comparison.deviationPercentage) > 25 ? 'high' : 'medium',
                    relatedMetrics: [comparison.metricName],
                });
            }
        }
    }

    // Sort by impact and timestamp, then limit
    const sortedChanges = changes
        .sort((a, b) => {
            const impactOrder = { high: 0, medium: 1, low: 2 };
            if (impactOrder[a.impact] !== impactOrder[b.impact]) {
                return impactOrder[a.impact] - impactOrder[b.impact];
            }
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        })
        .slice(0, maxChanges);

    return sortedChanges;
}

/**
 * Generates recommended actions from improvement suggestions
 */
function generateRecommendedActions(
    suggestions: ImprovementSuggestion[],
    reviewRecommendation: ReviewRecommendation | null,
    config: DashboardDataConfig
): RecommendedAction[] {
    const actions: RecommendedAction[] = [];
    const maxActions = config.maxRecommendedActions || DEFAULT_DASHBOARD_CONFIG.maxRecommendedActions!;

    // Convert improvement suggestions to recommended actions
    for (const suggestion of suggestions) {
        actions.push({
            id: suggestion.id,
            priority: suggestion.priority,
            category: suggestion.category,
            title: suggestion.title,
            description: suggestion.description,
            estimatedEffort: suggestion.estimatedImpact === 'high' ? 'medium' :
                suggestion.estimatedImpact === 'medium' ? 'small' : 'small',
            potentialImpact: Math.abs(suggestion.supportingData.deviationPercentage),
            relatedMetrics: suggestion.relatedMetrics,
            suggestedSteps: suggestion.suggestedActions.slice(0, 3),
        });
    }

    // Add review recommendation as high priority action if applicable
    if (reviewRecommendation?.shouldRecommendReview) {
        actions.unshift({
            id: generateDashboardId('REVIEW'),
            priority: 'high',
            category: 'review',
            title: 'Review Recommended',
            description: reviewRecommendation.message,
            estimatedEffort: 'medium',
            potentialImpact: Math.abs(reviewRecommendation.deviationPercentage),
            relatedMetrics: ['Completion_Rate'],
            suggestedSteps: reviewRecommendation.suggestedActions,
        });
    }

    // Sort by priority and limit
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedActions = actions
        .sort((a, b) => {
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.potentialImpact - a.potentialImpact;
        })
        .slice(0, maxActions);

    return sortedActions;
}

/**
 * Generates comprehensive dashboard data for a game
 * Validates: Requirement 10.5 - "THE Feedback_Module SHALL provide a dashboard showing: Game_Health_Score, Recent_Changes, and Recommended_Actions"
 */
export function generateDashboardData(
    gameId: string,
    metrics: GameMetrics,
    config: DashboardDataConfig = {}
): DashboardData {
    const effectiveConfig = { ...DEFAULT_DASHBOARD_CONFIG, ...config };

    // Create benchmark and compare metrics
    const benchmarkType = effectiveConfig.benchmarkType || 'puzzle';
    const benchmark = createGameBenchmark(gameId, benchmarkType);
    const comparisonResult = compareAgainstBenchmark(metrics, benchmark);

    // Calculate health score
    const { overall, breakdown } = calculateHealthScore(
        metrics,
        comparisonResult,
        effectiveConfig.healthScoreWeights
    );

    // Generate improvement suggestions
    const suggestionsResult = generateImprovementSuggestions(
        metrics,
        benchmark,
        comparisonResult,
        effectiveConfig.improvementSuggestionsConfig
    );

    // Check for review recommendation
    const reviewRecommendation = shouldRecommendReview(
        metrics,
        benchmark,
        effectiveConfig.reviewRecommendationConfig
    );

    // Generate recent changes
    const recentChanges = generateRecentChanges(
        metrics,
        comparisonResult,
        effectiveConfig
    );

    // Generate recommended actions
    const recommendedActions = generateRecommendedActions(
        suggestionsResult.suggestions,
        reviewRecommendation,
        effectiveConfig
    );

    // Determine health status
    const healthStatus = getHealthStatus(overall);

    return {
        gameId,
        generatedAt: new Date().toISOString(),
        gameHealthScore: overall,
        healthScoreBreakdown: breakdown,
        recentChanges,
        recommendedActions,
        healthStatus,
        benchmarkComparison: comparisonResult,
        improvementSuggestions: suggestionsResult.suggestions,
        reviewRecommendation,
    };
}

/**
 * Generates dashboard data with full analysis including feedback engine
 */
export function generateDashboardDataWithAnalysis(
    gameId: string,
    metrics: GameMetrics,
    feedbackAnalysis: FeedbackAnalysis,
    config: DashboardDataConfig = {}
): DashboardData {
    // Generate base dashboard data
    const dashboard = generateDashboardData(gameId, metrics, config);

    // Add issues from feedback analysis as recommended actions if no actions exist
    if (dashboard.recommendedActions.length === 0 && feedbackAnalysis.issues.length > 0) {
        for (const issue of feedbackAnalysis.issues.slice(0, 3)) {
            dashboard.recommendedActions.push({
                id: generateDashboardId('ISSUE'),
                priority: 'medium',
                category: 'general',
                title: 'Address Identified Issue',
                description: issue,
                estimatedEffort: 'medium',
                potentialImpact: 15,
                relatedMetrics: [],
                suggestedSteps: feedbackAnalysis.recommendedActions.slice(0, 3),
            });
        }
    }

    // Add recent changes from feedback analysis
    if (feedbackAnalysis.recentChanges.length > 0) {
        dashboard.recentChanges = feedbackAnalysis.recentChanges
            .slice(0, dashboard.recentChanges.length)
            .map((change) => ({
                id: generateDashboardId('CHANGE'),
                type: 'improvement' as const,
                description: change,
                timestamp: new Date().toISOString(),
                impact: 'medium' as const,
                relatedMetrics: [],
            }));
    }

    return dashboard;
}

/**
 * Gets a summary of dashboard data for quick viewing
 */
export function getDashboardSummary(dashboard: DashboardData): {
    healthScore: number;
    healthStatus: string;
    actionCount: number;
    changeCount: number;
    topPriority: string | null;
} {
    return {
        healthScore: dashboard.gameHealthScore,
        healthStatus: dashboard.healthStatus,
        actionCount: dashboard.recommendedActions.length,
        changeCount: dashboard.recentChanges.length,
        topPriority: dashboard.recommendedActions[0]?.title || null,
    };
}

/**
 * Filters dashboard data by priority
 */
export function filterDashboardByPriority(
    dashboard: DashboardData,
    minPriority: 'high' | 'medium' | 'low'
): DashboardData {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const minPriorityValue = priorityOrder[minPriority];

    return {
        ...dashboard,
        recommendedActions: dashboard.recommendedActions.filter(
            action => priorityOrder[action.priority] <= minPriorityValue
        ),
    };
}

/**
 * Generates a human-readable dashboard report
 */
export function generateDashboardReport(dashboard: DashboardData): string {
    const lines: string[] = [];

    lines.push(`# Dashboard Report for Game: ${dashboard.gameId}`);
    lines.push(`Generated: ${dashboard.generatedAt}`);
    lines.push('');
    lines.push('## Game Health Score');
    lines.push(`**Overall Score:** ${dashboard.gameHealthScore.toFixed(1)}/100`);
    lines.push(`**Status:** ${dashboard.healthStatus.toUpperCase()}`);
    lines.push('');
    lines.push('### Score Breakdown');
    lines.push(`- Completion Rate: ${dashboard.healthScoreBreakdown.completionRate.score.toFixed(1)} (contribution: ${dashboard.healthScoreBreakdown.completionRate.contribution.toFixed(1)})`);
    lines.push(`- User Engagement: ${dashboard.healthScoreBreakdown.userEngagement.score.toFixed(1)} (contribution: ${dashboard.healthScoreBreakdown.userEngagement.contribution.toFixed(1)})`);
    lines.push(`- Performance: ${dashboard.healthScoreBreakdown.performance.score.toFixed(1)} (contribution: ${dashboard.healthScoreBreakdown.performance.contribution.toFixed(1)})`);
    lines.push(`- Accessibility: ${dashboard.healthScoreBreakdown.accessibility.score.toFixed(1)} (contribution: ${dashboard.healthScoreBreakdown.accessibility.contribution.toFixed(1)})`);
    lines.push(`- Content Quality: ${dashboard.healthScoreBreakdown.contentQuality.score.toFixed(1)} (contribution: ${dashboard.healthScoreBreakdown.contentQuality.contribution.toFixed(1)})`);

    if (dashboard.recentChanges.length > 0) {
        lines.push('');
        lines.push('## Recent Changes');
        for (const change of dashboard.recentChanges) {
            lines.push(`- [${change.impact.toUpperCase()}] ${change.description} (${change.type})`);
        }
    }

    if (dashboard.recommendedActions.length > 0) {
        lines.push('');
        lines.push('## Recommended Actions');
        for (const action of dashboard.recommendedActions) {
            lines.push(`- [${action.priority.toUpperCase()}] ${action.title}`);
            lines.push(`  - ${action.description}`);
            lines.push(`  - Estimated Effort: ${action.estimatedEffort}`);
            lines.push(`  - Potential Impact: ${action.potentialImpact.toFixed(1)}%`);
        }
    } else {
        lines.push('');
        lines.push('## Recommended Actions');
        lines.push('No actions recommended - game is performing well!');
    }

    return lines.join('\n');
}
