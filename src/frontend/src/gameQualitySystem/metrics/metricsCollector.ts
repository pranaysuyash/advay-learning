// Metrics Collector for Game Quality System

import type { MetricsConfig, MetricsData } from '../types';

export type { MetricsConfig };

export class MetricsCollector {
    private readonly DEFAULT_CONFIG: MetricsConfig = {
        trackingPeriods: ['launchWeek', 'thirtyDay', 'ninetyDay'],
        requiredMetrics: ['qualityScore', 'engagementRate', 'completionRate', 'bugCount'],
        statisticalThreshold: 0.05,
    };

    private config: MetricsConfig;

    constructor(config: Partial<MetricsConfig> = {}) {
        this.config = { ...this.DEFAULT_CONFIG, ...config };
        void this.config;
    }

    public collectMetrics(gameId: string, metricsData: any): MetricsData {
        const preImprovement = this.extractPreImprovement(metricsData);
        const postImprovement = this.extractPostImprovement(metricsData);

        const changePercentage = this.calculateChangePercentage(
            preImprovement?.qualityScore || 0,
            postImprovement?.qualityScore || 0
        );

        return {
            gameId,
            preImprovement,
            postImprovement,
            changePercentage,
            statisticalSignificance: this.determineStatisticalSignificance(changePercentage),
            lastUpdated: new Date().toISOString(),
        };
    }

    public collectLaunchMetrics(gameId: string, launchData: any): MetricsData {
        const { week1, month1, month3 } = launchData;
        void month1;
        void month3;

        return {
            gameId,
            postImprovement: {
                qualityScore: week1.qualityScore,
                engagementRate: week1.engagementRate,
                completionRate: week1.completionRate,
                bugCount: week1.bugCount,
            },
            changePercentage: 0,
            statisticalSignificance: 'insufficient',
            lastUpdated: new Date().toISOString(),
        };
    }

    public collectImprovementMetrics(gameId: string, before: any, after: any): MetricsData {
        const changePercentage = this.calculateChangePercentage(
            before.qualityScore,
            after.qualityScore
        );

        return {
            gameId,
            preImprovement: before,
            postImprovement: after,
            changePercentage,
            statisticalSignificance: this.determineStatisticalSignificance(changePercentage),
            lastUpdated: new Date().toISOString(),
        };
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

    public calculateEngagementRate(uniquePlayers: number, totalUsers: number): number {
        if (totalUsers === 0) return 0;
        return (uniquePlayers / totalUsers) * 100;
    }

    public calculateCompletionRate(completed: number, total: number): number {
        if (total === 0) return 0;
        return completed / total;
    }

    public extractPreImprovement(metricsData: any): any {
        if (!metricsData) return undefined;
        return metricsData.preImprovement || metricsData.before || undefined;
    }

    public extractPostImprovement(metricsData: any): any {
        if (!metricsData) return undefined;
        return metricsData.postImprovement || metricsData.after || metricsData.current || undefined;
    }

    public calculateROI(preMetrics: MetricsData, postMetrics: MetricsData, implementationCost: number): any {
        const qualityImprovement = postMetrics.changePercentage;
        const engagementImprovement = this.calculateChangePercentage(
            preMetrics.postImprovement?.engagementRate || 0,
            postMetrics.postImprovement?.engagementRate || 0
        );

        const estimatedValue = (qualityImprovement + engagementImprovement) * 100;
        const roi = (estimatedValue - implementationCost) / implementationCost;

        return {
            qualityImprovement,
            engagementImprovement,
            implementationCost,
            estimatedValue,
            roi,
            breakEvenPeriod: roi > 0 ? `${(implementationCost / estimatedValue).toFixed(1)} weeks` : 'Not achievable',
        };
    }

    public generateReport(metrics: MetricsData[]): any {
        const totalGames = metrics.length;
        const avgQualityImprovement = metrics.reduce((sum, m) => sum + m.changePercentage, 0) / totalGames;
        const highImpactGames = metrics.filter(m => m.statisticalSignificance === 'high').length;
        const lowImpactGames = metrics.filter(m => m.statisticalSignificance === 'insufficient').length;

        return {
            totalGames,
            avgQualityImprovement,
            highImpactGames,
            lowImpactGames,
            metricsByGame: metrics.reduce((acc, m) => {
                acc[m.gameId] = {
                    changePercentage: m.changePercentage,
                    statisticalSignificance: m.statisticalSignificance,
                };
                return acc;
            }, {} as Record<string, any>),
        };
    }

    public trackProgress(metricsHistory: MetricsData[]): any {
        if (metricsHistory.length === 0) return {};

        const latest = metricsHistory[metricsHistory.length - 1];
        const previous = metricsHistory.length > 1 ? metricsHistory[metricsHistory.length - 2] : latest;

        return {
            current: latest,
            previous,
            change: this.calculateChangePercentage(
                previous.changePercentage,
                latest.changePercentage
            ),
        };
    }
}
