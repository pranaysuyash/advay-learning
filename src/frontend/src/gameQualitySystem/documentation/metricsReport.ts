// Metrics Reporting Module for Game Quality System

import type { Game, MetricsData } from '../types';

/**
 * Represents a single metric with its change information
 */
export interface MetricChange {
    name: string;
    before: number;
    after: number;
    absoluteChange: number;
    percentageChange: number;
    statisticalSignificance: 'high' | 'medium' | 'low' | 'insufficient';
    confidenceInterval?: {
        lower: number;
        upper: number;
        confidenceLevel: number;
    };
}

/**
 * Represents a complete metrics report payload
 */
export interface MetricsReportData {
    gameId: string;
    gameName: string;
    reportDate: string;
    metrics: MetricChange[];
    overallImpact: {
        totalAbsoluteChange: number;
        averagePercentageChange: number;
        overallSignificance: 'high' | 'medium' | 'low' | 'insufficient';
    };
    recommendations: string[];
    content?: string;
}

/**
 * Configuration for metrics reporting
 */
export interface MetricsReportConfig {
    significanceThresholds: {
        low: number;
        medium: number;
        high: number;
    };
    includeConfidenceIntervals: boolean;
    confidenceLevel: number;
    minSampleSize: number;
}

/**
 * Default configuration for metrics reporting
 */
export const DEFAULT_METRICS_REPORT_CONFIG: MetricsReportConfig = {
    significanceThresholds: {
        low: 5,
        medium: 15,
        high: 30,
    },
    includeConfidenceIntervals: true,
    confidenceLevel: 0.95,
    minSampleSize: 30,
};

/**
 * MetricsReport class for generating metrics reports
 * Requirement 8.3: Generate reports with Absolute_Change, Percentage_Change, Statistical_Significance
 */
export class MetricsReport {
    private readonly config: MetricsReportConfig;

    constructor(config: Partial<MetricsReportConfig> = {}) {
        this.config = { ...DEFAULT_METRICS_REPORT_CONFIG, ...config };
    }

    /**
     * Generate a metrics report for a game
     * @param game - The game being reported on
     * @param preMetrics - Pre-improvement metrics
     * @param postMetrics - Post-improvement metrics
     * @returns Complete metrics report
     */
    public generateReport(
        game: Game,
        preMetrics: MetricsData,
        postMetrics: MetricsData
    ): MetricsReportData {
        const metrics: MetricChange[] = [];

        // Quality Score
        if (preMetrics.preImprovement?.qualityScore !== undefined &&
            postMetrics.postImprovement?.qualityScore !== undefined) {
            metrics.push(this.calculateMetricChange(
                'Quality Score',
                preMetrics.preImprovement.qualityScore,
                postMetrics.postImprovement.qualityScore
            ));
        }

        // Engagement Rate
        if (preMetrics.preImprovement?.engagementRate !== undefined &&
            postMetrics.postImprovement?.engagementRate !== undefined) {
            metrics.push(this.calculateMetricChange(
                'Engagement Rate',
                preMetrics.preImprovement.engagementRate,
                postMetrics.postImprovement.engagementRate
            ));
        }

        // Completion Rate
        if (preMetrics.preImprovement?.completionRate !== undefined &&
            postMetrics.postImprovement?.completionRate !== undefined) {
            metrics.push(this.calculateMetricChange(
                'Completion Rate',
                preMetrics.preImprovement.completionRate,
                postMetrics.postImprovement.completionRate
            ));
        }

        // Bug Count (reduction is positive)
        if (preMetrics.preImprovement?.bugCount !== undefined &&
            postMetrics.postImprovement?.bugCount !== undefined) {
            const before = preMetrics.preImprovement.bugCount;
            const after = postMetrics.postImprovement.bugCount;
            const absoluteChange = before - after; // Positive means reduction
            const percentageChange = before !== 0 ? (absoluteChange / before) * 100 : 0;

            metrics.push({
                name: 'Bug Count Reduction',
                before,
                after,
                absoluteChange,
                percentageChange,
                statisticalSignificance: this.determineStatisticalSignificance(percentageChange),
            });
        }

        // Calculate overall impact
        const totalAbsoluteChange = metrics.reduce((sum, m) => sum + m.absoluteChange, 0);
        const avgPercentageChange = metrics.length > 0
            ? metrics.reduce((sum, m) => sum + m.percentageChange, 0) / metrics.length
            : 0;

        const significanceCounts = {
            high: metrics.filter(m => m.statisticalSignificance === 'high').length,
            medium: metrics.filter(m => m.statisticalSignificance === 'medium').length,
            low: metrics.filter(m => m.statisticalSignificance === 'low').length,
            insufficient: metrics.filter(m => m.statisticalSignificance === 'insufficient').length,
        };

        let overallSignificance: 'high' | 'medium' | 'low' | 'insufficient' = 'insufficient';
        if (significanceCounts.high >= 2 || (significanceCounts.high >= 1 && significanceCounts.medium >= 2)) {
            overallSignificance = 'high';
        } else if (significanceCounts.medium >= 2 || (significanceCounts.medium >= 1 && significanceCounts.low >= 2)) {
            overallSignificance = 'medium';
        } else if (significanceCounts.low >= 2) {
            overallSignificance = 'low';
        }

        // Generate recommendations
        const recommendations = this.generateRecommendations(metrics);

        return {
            gameId: game.id,
            gameName: game.name,
            reportDate: new Date().toISOString(),
            metrics,
            overallImpact: {
                totalAbsoluteChange,
                averagePercentageChange: avgPercentageChange,
                overallSignificance,
            },
            recommendations,
        };
    }

    /**
     * Calculate the change for a single metric
     * @param name - Name of the metric
     * @param before - Pre-improvement value
     * @param after - Post-improvement value
     * @returns MetricChange with all calculated values
     */
    public calculateMetricChange(
        name: string,
        before: number,
        after: number
    ): MetricChange {
        const absoluteChange = after - before;
        const isBugMetric = name.toLowerCase().includes('bug');
        const percentageChange = before !== 0
            ? (isBugMetric ? ((before - after) / before) * 100 : (absoluteChange / before) * 100)
            : 0;

        const change: MetricChange = {
            name,
            before,
            after,
            absoluteChange,
            percentageChange,
            statisticalSignificance: this.determineStatisticalSignificance(percentageChange),
        };

        // Add confidence interval if configured
        if (this.config.includeConfidenceIntervals) {
            change.confidenceInterval = this.calculateConfidenceInterval(
                before,
                after,
                this.config.confidenceLevel
            );
        }

        return change;
    }

    /**
     * Determine statistical significance of a percentage change
     * @param percentageChange - The percentage change to evaluate
     * @returns Statistical significance level
     */
    public determineStatisticalSignificance(percentageChange: number): 'high' | 'medium' | 'low' | 'insufficient' {
        const absChange = Math.abs(percentageChange);

        if (absChange < this.config.significanceThresholds.low) {
            return 'insufficient';
        }
        if (absChange < this.config.significanceThresholds.medium) {
            return 'low';
        }
        if (absChange < this.config.significanceThresholds.high) {
            return 'medium';
        }
        return 'high';
    }

    /**
     * Calculate confidence interval for a change
     * @param before - Pre-improvement value
     * @param after - Post-improvement value
     * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
     * @returns Confidence interval bounds
     */
    public calculateConfidenceInterval(
        before: number,
        after: number,
        confidenceLevel: number
    ): { lower: number; upper: number; confidenceLevel: number } {
        // Simplified confidence interval calculation
        // In a real implementation, this would use standard error and sample size
        const change = after - before;
        const standardError = Math.abs(change) * 0.1; // Simplified assumption
        const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;

        return {
            lower: change - zScore * standardError,
            upper: change + zScore * standardError,
            confidenceLevel,
        };
    }

    /**
     * Format a metrics report as markdown
     * @param report - The metrics report to format
     * @returns Formatted markdown string
     */
    public formatAsMarkdown(report: MetricsReportData): string {
        const sections: string[] = [];

        // Header
        sections.push(`# Metrics Report: ${report.gameName}`);
        sections.push('');
        sections.push(`**Game ID**: ${report.gameId}`);
        sections.push(`**Report Date**: ${new Date(report.reportDate).toLocaleDateString()}`);
        sections.push('');

        // Overall Impact
        sections.push('## Overall Impact');
        sections.push('');
        sections.push(`| Metric | Value |`);
        sections.push(`|--------|-------|`);
        sections.push(`| Total Absolute Change | ${report.overallImpact.totalAbsoluteChange.toFixed(2)} |`);
        sections.push(`| Average % Change | ${report.overallImpact.averagePercentageChange.toFixed(1)}% |`);
        sections.push(`| Overall Significance | ${report.overallImpact.overallSignificance.toUpperCase()} |`);
        sections.push('');

        // Individual Metrics
        sections.push('## Metric Changes');
        sections.push('');
        sections.push('| Metric | Before | After | Absolute Change | % Change | Significance |');
        sections.push('|--------|--------|-------|-----------------|----------|--------------|');

        for (const metric of report.metrics) {
            const changeStr = metric.absoluteChange >= 0 ? `+${metric.absoluteChange.toFixed(2)}` : metric.absoluteChange.toFixed(2);
            const pctStr = metric.percentageChange >= 0 ? `+${metric.percentageChange.toFixed(1)}%` : `${metric.percentageChange.toFixed(1)}%`;

            sections.push(
                `| ${metric.name} | ${metric.before.toFixed(2)} | ${metric.after.toFixed(2)} | ` +
                `${changeStr} | ${pctStr} | ${metric.statisticalSignificance.toUpperCase()} |`
            );
        }

        sections.push('');

        // Confidence Intervals
        if (this.config.includeConfidenceIntervals) {
            const metricsWithCI = report.metrics.filter(m => m.confidenceInterval);

            if (metricsWithCI.length > 0) {
                sections.push('## Confidence Intervals (95%)');
                sections.push('');

                for (const metric of metricsWithCI) {
                    const ci = metric.confidenceInterval!;
                    sections.push(`### ${metric.name}`);
                    sections.push(`- Range: [${ci.lower.toFixed(2)}, ${ci.upper.toFixed(2)}]`);
                    sections.push(`- Confidence Level: ${(ci.confidenceLevel * 100).toFixed(0)}%`);
                    sections.push('');
                }
            }
        }

        // Recommendations
        if (report.recommendations.length > 0) {
            sections.push('## Recommendations');
            sections.push('');

            for (const [i, rec] of report.recommendations.entries()) {
                sections.push(`${i + 1}. ${rec}`);
            }

            sections.push('');
        }

        // Footer
        sections.push('---');
        sections.push(`*Report generated on ${new Date(report.reportDate).toISOString()}*`);

        return sections.join('\n');
    }

    /**
     * Generate recommendations based on metric changes
     * @param metrics - Array of metric changes
     * @returns Array of recommendations
     */
    private generateRecommendations(metrics: MetricChange[]): string[] {
        const recommendations: string[] = [];

        for (const metric of metrics) {
            if (metric.statisticalSignificance === 'insufficient') {
                recommendations.push(
                    `Collect more data for ${metric.name} to validate the change.`
                );
            } else if (metric.percentageChange < 0) {
                recommendations.push(
                    `Investigate negative change in ${metric.name} (${metric.percentageChange.toFixed(1)}%).`
                );
            } else if (metric.statisticalSignificance === 'high' && metric.percentageChange > 0) {
                recommendations.push(
                    `Consider applying successful ${metric.name} improvements to other games.`
                );
            }
        }

        return recommendations;
    }

    /**
     * Compare two metrics reports
     * @param report1 - First report
     * @param report2 - Second report
     * @returns Comparison result
     */
    public compareReports(
        report1: MetricsReportData,
        report2: MetricsReportData
    ): {
        report1Better: string[];
        report2Better: string[];
        similar: string[];
    } {
        const report1Better: string[] = [];
        const report2Better: string[] = [];
        const similar: string[] = [];

        const report1Map = new Map(report1.metrics.map(m => [m.name, m]));
        const report2Map = new Map(report2.metrics.map(m => [m.name, m]));

        const allNames = new Set([...report1Map.keys(), ...report2Map.keys()]);

        for (const name of allNames) {
            const m1 = report1Map.get(name);
            const m2 = report2Map.get(name);

            if (m1 && m2) {
                if (m1.percentageChange > m2.percentageChange + 5) {
                    report1Better.push(`${name}: ${m1.percentageChange.toFixed(1)}% vs ${m2.percentageChange.toFixed(1)}%`);
                } else if (m2.percentageChange > m1.percentageChange + 5) {
                    report2Better.push(`${name}: ${m2.percentageChange.toFixed(1)}% vs ${m1.percentageChange.toFixed(1)}%`);
                } else {
                    similar.push(`${name}: similar improvement (~${((m1.percentageChange + m2.percentageChange) / 2).toFixed(1)}%)`);
                }
            }
        }

        return { report1Better, report2Better, similar };
    }
}

/**
 * Factory function to create a MetricsReport instance
 * @param config - Optional configuration
 * @returns New MetricsReport instance
 */
export function createMetricsReport(config?: Partial<MetricsReportConfig>): MetricsReport {
    return new MetricsReport(config);
}
