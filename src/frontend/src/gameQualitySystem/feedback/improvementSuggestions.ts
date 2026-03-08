// Improvement Suggestions Generation for Feedback Module
// Generates actionable improvement suggestions with supporting data
// Validates: Requirement 10.4 - "WHEN feedback analysis is complete, THE Feedback_Module SHALL generate improvement suggestions with supporting data"

import type { GameMetrics } from '../types';
import type { GameBenchmark, BenchmarkComparisonResult, MetricComparison } from './benchmarkComparator';
import type { ReviewRecommendation } from './reviewRecommendation';

/**
 * Improvement suggestion with supporting evidence
 */
export interface ImprovementSuggestion {
    id: string;
    category: ImprovementCategory;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    supportingData: SuggestionSupportingData;
    suggestedActions: string[];
    estimatedImpact: 'high' | 'medium' | 'low';
    relatedMetrics: string[];
}

/**
 * Categories for improvement suggestions
 */
export type ImprovementCategory =
    | 'completion_rate'
    | 'user_engagement'
    | 'accessibility'
    | 'content_quality'
    | 'technical_performance'
    | 'user_experience'
    | 'educational_value';

/**
 * Supporting data for an improvement suggestion
 */
export interface SuggestionSupportingData {
    currentValue: number;
    benchmarkTarget: number;
    deviationPercentage: number;
    evidence: string[];
    metricName: string;
    severity: 'critical' | 'warning' | 'info';
}

/**
 * Configuration for improvement suggestions generation
 */
export interface ImprovementSuggestionsConfig {
    /** Minimum deviation percentage to trigger a suggestion (default: 10%) */
    minDeviationPercent?: number;
    /** Maximum number of suggestions to generate (default: 10) */
    maxSuggestions?: number;
    /** Include estimated impact assessment (default: true) */
    includeEstimatedImpact?: boolean;
    /** Include suggested actions (default: true) */
    includeSuggestedActions?: boolean;
}

/**
 * Default configuration for improvement suggestions
 */
export const DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG: ImprovementSuggestionsConfig = {
    minDeviationPercent: 10,
    maxSuggestions: 10,
    includeEstimatedImpact: true,
    includeSuggestedActions: true,
};

/**
 * Result of improvement suggestions generation
 */
export interface ImprovementSuggestionsResult {
    gameId: string;
    totalSuggestions: number;
    suggestions: ImprovementSuggestion[];
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    generatedAt: string;
    basedOnBenchmark: string;
}

/**
 * Gets the priority level based on deviation percentage
 */
function getPriority(deviationPercentage: number): 'high' | 'medium' | 'low' {
    if (Math.abs(deviationPercentage) >= 30) {
        return 'high';
    } else if (Math.abs(deviationPercentage) >= 20) {
        return 'medium';
    }
    return 'low';
}

/**
 * Gets the severity level based on deviation percentage
 */
function getSeverity(deviationPercentage: number): 'critical' | 'warning' | 'info' {
    if (deviationPercentage <= -40) {
        return 'critical';
    } else if (deviationPercentage <= -25) {
        return 'warning';
    }
    return 'info';
}

/**
 * Maps metric name to improvement category
 */
function getCategory(metricName: string): ImprovementCategory {
    const categoryMap: Record<string, ImprovementCategory> = {
        'Play_Count': 'user_engagement',
        'Completion_Rate': 'completion_rate',
        'Average_Score': 'content_quality',
        'Time_On_Task': 'user_experience',
        'Error_Rate': 'technical_performance',
    };
    return categoryMap[metricName] || 'user_experience';
}

/**
 * Generates evidence strings based on metric comparison
 */
function generateEvidence(comparison: MetricComparison): string[] {
    const evidence: string[] = [];

    if (comparison.status === 'below_minimum') {
        evidence.push(`${comparison.metricName} is ${Math.abs(comparison.deviationPercentage).toFixed(1)}% below minimum acceptable value`);
    } else if (comparison.status === 'above_maximum') {
        evidence.push(`${comparison.metricName} is ${comparison.deviationPercentage.toFixed(1)}% above maximum expected value`);
    } else if (comparison.deviationPercentage < 0) {
        evidence.push(`${comparison.metricName} is ${Math.abs(comparison.deviationPercentage).toFixed(1)}% below target`);
    } else {
        evidence.push(`${comparison.metricName} is ${comparison.deviationPercentage.toFixed(1)}% above target`);
    }

    evidence.push(`Current value: ${comparison.actualValue.toFixed(2)}`);
    evidence.push(`Benchmark target: ${comparison.benchmarkTarget.toFixed(2)}`);
    evidence.push(`Acceptable range: ${comparison.benchmarkMinimum.toFixed(2)} - ${comparison.benchmarkMaximum.toFixed(2)}`);

    return evidence;
}

/**
 * Generates suggested actions for a metric improvement
 */
function generateSuggestedActions(
    metricName: string,
    category: ImprovementCategory,
    currentValue: number,
    targetValue: number
): string[] {
    const actions: string[] = [];

    switch (metricName) {
        case 'Play_Count':
            actions.push('Consider marketing or promotional activities');
            actions.push('Review game visibility in the catalog');
            actions.push('Add social sharing features');
            actions.push('Implement referral program');
            break;

        case 'Completion_Rate':
            actions.push('Review game flow and identify friction points');
            actions.push('Add or improve tutorial/onboarding');
            actions.push('Implement save/resume functionality');
            actions.push('Review difficulty curve and adjust if needed');
            actions.push('Add hints or help system');
            break;

        case 'Average_Score':
            actions.push('Review scoring system balance');
            actions.push('Adjust difficulty to match target audience');
            actions.push('Add progressive difficulty levels');
            actions.push('Review and improve feedback mechanisms');
            break;

        case 'Time_On_Task':
            if (currentValue < targetValue) {
                actions.push('Add engaging content to increase session length');
                actions.push('Review if game is too short for engagement');
                actions.push('Add progression systems or achievements');
            } else {
                actions.push('Consider breaking into shorter sessions');
                actions.push('Add natural pause/checkpoint points');
                actions.push('Review if game is too long');
            }
            break;

        case 'Error_Rate':
            actions.push('Identify and fix common error sources');
            actions.push('Improve input validation and error handling');
            actions.push('Add better error messages and recovery');
            actions.push('Review and improve UI/UX clarity');
            actions.push('Test on different devices and browsers');
            break;
    }

    // Add category-specific actions
    switch (category) {
        case 'accessibility':
            actions.push('Review color contrast ratios');
            actions.push('Add keyboard navigation support');
            actions.push('Implement screen reader compatibility');
            actions.push('Add timeout and pause options');
            break;

        case 'educational_value':
            actions.push('Review and clarify learning objectives');
            actions.push('Add educational feedback and explanations');
            actions.push('Align content with curriculum standards');
            actions.push('Add progress tracking for learning outcomes');
            break;
    }

    return actions;
}

/**
 * Estimates the impact level of implementing the suggestion
 */
function estimateImpact(
    metricName: string,
    deviationPercentage: number,
    category: ImprovementCategory
): 'high' | 'medium' | 'low' {
    // High impact metrics
    const highImpactMetrics = ['Completion_Rate', 'Error_Rate'];
    const mediumImpactMetrics = ['Average_Score', 'Time_On_Task'];
    const lowImpactMetrics = ['Play_Count'];

    if (highImpactMetrics.includes(metricName)) {
        return Math.abs(deviationPercentage) >= 20 ? 'high' : 'medium';
    } else if (mediumImpactMetrics.includes(metricName)) {
        return Math.abs(deviationPercentage) >= 25 ? 'medium' : 'low';
    } else if (lowImpactMetrics.includes(metricName)) {
        return 'low';
    }

    // Category-based fallback
    if (category === 'completion_rate' || category === 'technical_performance') {
        return 'high';
    } else if (category === 'user_experience' || category === 'content_quality') {
        return 'medium';
    }
    return 'low';
}

/**
 * Generates a unique suggestion ID
 */
function generateSuggestionId(metricName: string, index: number): string {
    const timestamp = Date.now().toString(36);
    return `SUGGEST-${metricName.toUpperCase().replace(/\s/g, '_')}-${timestamp}-${index}`;
}

/**
 * Creates a title for the improvement suggestion
 */
function createTitle(metricName: string, _category: ImprovementCategory): string {
    const titleMap: Record<string, string> = {
        'Play_Count': 'Increase User Engagement',
        'Completion_Rate': 'Improve Game Completion',
        'Average_Score': 'Enhance Scoring Performance',
        'Time_On_Task': 'Optimize Session Duration',
        'Error_Rate': 'Reduce Error Rate',
    };

    return titleMap[metricName] || `Improve ${metricName.replace(/_/g, ' ')}`;
}

/**
 * Creates a description for the improvement suggestion
 */
function createDescription(
    metricName: string,
    currentValue: number,
    targetValue: number,
    deviationPercentage: number
): string {
    const direction = deviationPercentage < 0 ? 'below' : 'above';
    return `${metricName.replace(/_/g, ' ')} is currently ${Math.abs(deviationPercentage).toFixed(1)}% ${direction} the benchmark target. ` +
        `Current value: ${currentValue.toFixed(2)}, Target: ${targetValue.toFixed(2)}. ` +
        `Improvement in this area could significantly enhance the overall game quality and user experience.`;
}

/**
 * Generates improvement suggestions based on benchmark comparison
 * Validates: Requirement 10.4 - "WHEN feedback analysis is complete, THE Feedback_Module SHALL generate improvement suggestions with supporting data"
 */
export function generateImprovementSuggestions(
    metrics: GameMetrics,
    benchmark: GameBenchmark,
    comparisonResult: BenchmarkComparisonResult,
    config: ImprovementSuggestionsConfig = DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG
): ImprovementSuggestionsResult {
    const effectiveConfig = { ...DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG, ...config };
    const suggestions: ImprovementSuggestion[] = [];

    // Process each metric comparison
    for (const [metricKey, comparison] of Object.entries(comparisonResult.metricsComparison)) {
        // Skip if deviation is below threshold
        if (Math.abs(comparison.deviationPercentage) < effectiveConfig.minDeviationPercent!) {
            continue;
        }

        const category = getCategory(metricKey);
        const priority = getPriority(comparison.deviationPercentage);
        const severity = getSeverity(comparison.deviationPercentage);

        // Generate supporting data
        const supportingData: SuggestionSupportingData = {
            currentValue: comparison.actualValue,
            benchmarkTarget: comparison.benchmarkTarget,
            deviationPercentage: comparison.deviationPercentage,
            evidence: generateEvidence(comparison),
            metricName: comparison.metricName,
            severity,
        };

        // Generate suggested actions
        const suggestedActions = effectiveConfig.includeSuggestedActions
            ? generateSuggestedActions(
                comparison.metricName,
                category,
                comparison.actualValue,
                comparison.benchmarkTarget
            )
            : [];

        // Estimate impact
        const estimatedImpact = effectiveConfig.includeEstimatedImpact
            ? estimateImpact(comparison.metricName, comparison.deviationPercentage, category)
            : 'medium';

        const suggestion: ImprovementSuggestion = {
            id: generateSuggestionId(metricKey, suggestions.length),
            category,
            priority,
            title: createTitle(comparison.metricName, category),
            description: createDescription(
                comparison.metricName,
                comparison.actualValue,
                comparison.benchmarkTarget,
                comparison.deviationPercentage
            ),
            supportingData,
            suggestedActions,
            estimatedImpact,
            relatedMetrics: [comparison.metricName],
        };

        suggestions.push(suggestion);
    }

    // Sort suggestions by priority (high first, then medium, then low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Limit to max suggestions
    const limitedSuggestions = suggestions.slice(0, effectiveConfig.maxSuggestions!);

    // Count by priority
    const highPriorityCount = limitedSuggestions.filter(s => s.priority === 'high').length;
    const mediumPriorityCount = limitedSuggestions.filter(s => s.priority === 'medium').length;
    const lowPriorityCount = limitedSuggestions.filter(s => s.priority === 'low').length;

    return {
        gameId: metrics.gameId,
        totalSuggestions: limitedSuggestions.length,
        suggestions: limitedSuggestions,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
        generatedAt: new Date().toISOString(),
        basedOnBenchmark: benchmark.gameType,
    };
}

/**
 * Generates improvement suggestions incorporating review recommendations
 */
export function generateImprovementSuggestionsWithReview(
    metrics: GameMetrics,
    benchmark: GameBenchmark,
    comparisonResult: BenchmarkComparisonResult,
    reviewRecommendation: ReviewRecommendation,
    config: ImprovementSuggestionsConfig = DEFAULT_IMPROVEMENT_SUGGESTIONS_CONFIG
): ImprovementSuggestionsResult {
    // Generate base suggestions
    const result = generateImprovementSuggestions(metrics, benchmark, comparisonResult, config);

    // If review is recommended, add a high-priority completion rate suggestion
    if (reviewRecommendation.shouldRecommendReview && reviewRecommendation.severity === 'critical') {
        const completionSuggestion: ImprovementSuggestion = {
            id: generateSuggestionId('REVIEW_TRIGGERED', result.suggestions.length),
            category: 'completion_rate',
            priority: 'high',
            title: 'Critical: Review Recommended for Completion Rate',
            description: reviewRecommendation.message,
            supportingData: {
                currentValue: reviewRecommendation.completionRate,
                benchmarkTarget: reviewRecommendation.benchmarkTarget,
                deviationPercentage: reviewRecommendation.deviationPercentage,
                evidence: [
                    `Completion rate is ${Math.abs(reviewRecommendation.deviationPercentage).toFixed(1)}% below benchmark`,
                    `Review was triggered based on ${reviewRecommendation.severity} severity`,
                    `Target completion rate: ${reviewRecommendation.benchmarkTarget}%`,
                ],
                metricName: 'Completion_Rate',
                severity: reviewRecommendation.severity,
            },
            suggestedActions: reviewRecommendation.suggestedActions,
            estimatedImpact: 'high',
            relatedMetrics: ['Completion_Rate'],
        };

        // Insert at the beginning (highest priority)
        result.suggestions.unshift(completionSuggestion);
        result.totalSuggestions = result.suggestions.length;
        result.highPriorityCount++;
    }

    return result;
}

/**
 * Filters suggestions by category
 */
export function filterSuggestionsByCategory(
    suggestions: ImprovementSuggestion[],
    category: ImprovementCategory
): ImprovementSuggestion[] {
    return suggestions.filter(s => s.category === category);
}

/**
 * Filters suggestions by priority
 */
export function filterSuggestionsByPriority(
    suggestions: ImprovementSuggestion[],
    priority: 'high' | 'medium' | 'low'
): ImprovementSuggestion[] {
    return suggestions.filter(s => s.priority === priority);
}

/**
 * Gets the most impactful suggestion
 */
export function getMostImpactfulSuggestion(
    suggestions: ImprovementSuggestion[]
): ImprovementSuggestion | null {
    if (suggestions.length === 0) return null;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const impactOrder = { high: 0, medium: 1, low: 2 };

    return [...suggestions].sort((a, b) => {
        // First sort by priority
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Then by estimated impact
        return impactOrder[a.estimatedImpact] - impactOrder[b.estimatedImpact];
    })[0];
}

/**
 * Generates a summary of improvement suggestions
 */
export function generateSuggestionsSummary(result: ImprovementSuggestionsResult): string {
    const lines: string[] = [];

    lines.push(`## Improvement Suggestions for Game ${result.gameId}`);
    lines.push(`Generated: ${result.generatedAt}`);
    lines.push(`Based on benchmark: ${result.basedOnBenchmark}`);
    lines.push('');
    lines.push(`### Summary`);
    lines.push(`- Total suggestions: ${result.totalSuggestions}`);
    lines.push(`- High priority: ${result.highPriorityCount}`);
    lines.push(`- Medium priority: ${result.mediumPriorityCount}`);
    lines.push(`- Low priority: ${result.lowPriorityCount}`);
    lines.push('');

    if (result.suggestions.length > 0) {
        lines.push(`### Suggestions`);
        for (const suggestion of result.suggestions) {
            lines.push('');
            lines.push(`#### ${suggestion.title} [${suggestion.priority.toUpperCase()}]`);
            lines.push(suggestion.description);
            lines.push('');
            lines.push(`**Supporting Data:**`);
            for (const evidence of suggestion.supportingData.evidence) {
                lines.push(`- ${evidence}`);
            }
            lines.push('');
            lines.push(`**Suggested Actions:**`);
            for (const action of suggestion.suggestedActions) {
                lines.push(`- ${action}`);
            }
        }
    } else {
        lines.push('No improvement suggestions - all metrics are within acceptable range.');
    }

    return lines.join('\n');
}
