// Feedback Engine for Game Quality System

import type { FeedbackAnalysis, FeedbackData, MetricsData } from '../types';

export type { FeedbackAnalysis };

export class FeedbackEngine {
    private readonly HEALTH_SCORE_WEIGHTS = {
        playCount: 0.2,
        completionRate: 0.3,
        averageScore: 0.2,
        timeOnTask: 0.15,
        errorRate: 0.15,
    };

    private readonly BENCHMARKS = {
        completionRate: 0.5,
        averageSessionDuration: 120,
        errorRate: 0.1,
    };

    public analyzeFeedback(_gameId: string, feedbackData: FeedbackData): FeedbackAnalysis {
        const issues: string[] = [];
        const recommendedActions: string[] = [];
        const recentChanges: string[] = [];

        const healthScore = this.calculateHealthScore(feedbackData);

        if (feedbackData.completionRate < this.BENCHMARKS.completionRate) {
            issues.push(`Completion rate ${feedbackData.completionRate * 100}% is below benchmark ${this.BENCHMARKS.completionRate * 100}%`);
            recommendedActions.push('Review game flow and reduce friction points');
        }

        if (feedbackData.errorRate > this.BENCHMARKS.errorRate) {
            issues.push(`Error rate ${feedbackData.errorRate * 100}% is above benchmark ${this.BENCHMARKS.errorRate * 100}%`);
            recommendedActions.push('Investigate and fix common errors');
        }

        if (feedbackData.timeOnTask < this.BENCHMARKS.averageSessionDuration) {
            issues.push(`Average session ${feedbackData.timeOnTask}s is below benchmark ${this.BENCHMARKS.averageSessionDuration}s`);
            recommendedActions.push('Add engaging content or reduce task duration');
        }

        if (feedbackData.userFeedback && feedbackData.userFeedback.length > 0) {
            const negativeFeedback = feedbackData.userFeedback.filter((f: any) => f.sentiment === 'negative');
            if (negativeFeedback.length > 0) {
                issues.push(`${negativeFeedback.length} negative feedback items`);
                recommendedActions.push('Review negative feedback and address common issues');
            }
        }

        if (issues.length === 0) {
            recommendedActions.push('Continue monitoring and maintain quality');
        }

        return {
            gameHealthScore: healthScore,
            recentChanges,
            recommendedActions,
            issues,
        };
    }

    public compareMetrics(preMetrics: MetricsData, postMetrics: MetricsData): MetricsData {
        const changePercentage = this.calculateChangePercentage(
            preMetrics.postImprovement?.qualityScore || 0,
            postMetrics.postImprovement?.qualityScore || 0
        );

        return {
            gameId: preMetrics.gameId,
            preImprovement: preMetrics.postImprovement,
            postImprovement: postMetrics.postImprovement,
            changePercentage,
            statisticalSignificance: this.determineStatisticalSignificance(changePercentage),
            lastUpdated: new Date().toISOString(),
        };
    }

    public calculateHealthScore(feedbackData: FeedbackData): number {
        const {
            playCount,
            completionRate,
            averageScore,
            timeOnTask,
            errorRate,
        } = feedbackData;

        const playCountScore = this.normalizeScore(playCount, 0, 1000, 0, 100);
        const completionRateScore = completionRate * 100;
        const averageScoreScore = averageScore * 20;
        const timeOnTaskScore = this.normalizeScore(timeOnTask, 0, 300, 0, 100);
        const errorRateScore = (1 - errorRate) * 100;

        return (
            playCountScore * this.HEALTH_SCORE_WEIGHTS.playCount +
            completionRateScore * this.HEALTH_SCORE_WEIGHTS.completionRate +
            averageScoreScore * this.HEALTH_SCORE_WEIGHTS.averageScore +
            timeOnTaskScore * this.HEALTH_SCORE_WEIGHTS.timeOnTask +
            errorRateScore * this.HEALTH_SCORE_WEIGHTS.errorRate
        );
    }

    public calculateChangePercentage(before: number, after: number): number {
        if (before === 0) return after > 0 ? 100 : 0;
        return ((after - before) / before) * 100;
    }

    public determineStatisticalSignificance(changePercentage: number): 'high' | 'medium' | 'low' | 'insufficient' {
        if (Math.abs(changePercentage) < 5) return 'insufficient';
        if (Math.abs(changePercentage) < 15) return 'low';
        if (Math.abs(changePercentage) < 30) return 'medium';
        return 'high';
    }

    public normalizeScore(value: number, min: number, max: number, newMin: number, newMax: number): number {
        if (min === max) return newMin;
        return ((value - min) / (max - min)) * (newMax - newMin) + newMin;
    }

    public analyzeTrend(feedbackHistory: FeedbackData[]): string[] {
        const trends: string[] = [];

        if (feedbackHistory.length < 2) {
            trends.push('Insufficient data for trend analysis');
            return trends;
        }

        const recent = feedbackHistory.slice(-3);
        const averageCompletionRate = recent.reduce((sum, f) => sum + f.completionRate, 0) / recent.length;
        const previousCompletionRate = feedbackHistory[feedbackHistory.length - 4]?.completionRate || 0;

        if (averageCompletionRate > previousCompletionRate) {
            trends.push('Completion rate is improving');
        } else if (averageCompletionRate < previousCompletionRate) {
            trends.push('Completion rate is declining');
        } else {
            trends.push('Completion rate is stable');
        }

        const averageErrorRate = recent.reduce((sum, f) => sum + f.errorRate, 0) / recent.length;
        const previousErrorRate = feedbackHistory[feedbackHistory.length - 4]?.errorRate || 0;

        if (averageErrorRate < previousErrorRate) {
            trends.push('Error rate is decreasing');
        } else if (averageErrorRate > previousErrorRate) {
            trends.push('Error rate is increasing');
        } else {
            trends.push('Error rate is stable');
        }

        return trends;
    }

    public generateRecommendations(analysis: FeedbackAnalysis): string[] {
        const recommendations: string[] = [];

        if (analysis.issues.length > 0) {
            recommendations.push('Address the following issues:', ...analysis.issues);
        }

        if (analysis.recommendedActions.length > 0) {
            recommendations.push('Recommended actions:', ...analysis.recommendedActions);
        }

        if (recommendations.length === 0) {
            recommendations.push('Game is performing well. Continue monitoring.');
        }

        return recommendations;
    }
}
