/**
 * Low Engagement Flagging Module
 *
 * Flags games with engagement rate below 15% after 30 days.
 *
 * Requirement 5.4: Flag games with engagement rate below 15% after 30 days
 */

import type { GameId } from '../types';
import { EngagementRateCalculator, createEngagementRateCalculator } from './engagementRate';

/**
 * Game data for low engagement check
 */
export interface GameEngagementData {
    gameId: GameId;
    gameName: string;
    launchDate: string;
    uniquePlayers30Day: number;
    totalUsers30Day: number;
    currentEngagementRate: number;
    daysSinceLaunch: number;
}

/**
 * Low engagement flag result
 */
export interface LowEngagementFlag {
    gameId: GameId;
    gameName: string;
    isFlagged: boolean;
    engagementRate: number;
    threshold: number;
    daysSinceLaunch: number;
    severity: 'warning' | 'critical' | 'none';
    reason: string;
    recommendedActions: string[];
    flaggedAt: string;
}

/**
 * Configuration for low engagement flagging
 */
export interface LowEngagementFlagConfig {
    lowEngagementThreshold: number; // Below this = flagged
    criticalThreshold: number; // Below this = critical
    minimumDaysForCheck: number; // Minimum days since launch before flagging
    gracePeriodDays: number; // Days after launch before strict enforcement
}

/**
 * Default configuration for low engagement flagging
 */
export const DEFAULT_LOW_ENGAGEMENT_FLAG_CONFIG: LowEngagementFlagConfig = {
    lowEngagementThreshold: 15, // 15% - Requirement 5.4
    criticalThreshold: 5, // 5% - Critical concern
    minimumDaysForCheck: 30, // Check after 30 days
    gracePeriodDays: 7, // First week is grace period
};

/**
 * Low Engagement Flagging Service
 *
 * Identifies and flags games with low engagement rates.
 * Validates: Requirement 5.4
 */
export class LowEngagementFlagService {
    private readonly config: LowEngagementFlagConfig;
    private readonly engagementCalculator: EngagementRateCalculator;

    constructor(config: Partial<LowEngagementFlagConfig> = {}) {
        this.config = { ...DEFAULT_LOW_ENGAGEMENT_FLAG_CONFIG, ...config };
        this.engagementCalculator = createEngagementRateCalculator({
            lowEngagementThreshold: this.config.lowEngagementThreshold,
            highEngagementThreshold: 50,
            minimumSampleSize: 10,
        });
    }

    /**
     * Check if a game should be flagged for low engagement
     */
    public checkLowEngagement(data: GameEngagementData): LowEngagementFlag {
        const { gameId, gameName, uniquePlayers30Day, totalUsers30Day, daysSinceLaunch } = data;

        // Calculate engagement rate
        const engagementResult = this.engagementCalculator.calculateEngagementRate({
            gameId,
            uniquePlayers: uniquePlayers30Day,
            totalUsers: totalUsers30Day,
            timePeriod: 'month',
        });

        const engagementRate = engagementResult.engagementRate;

        // Check if game is eligible for flagging
        // Check if in grace period
        if (daysSinceLaunch < this.config.gracePeriodDays) {
            return this.createFlag(gameId, gameName, engagementRate, false, daysSinceLaunch, 'grace_period');
        }

        if (daysSinceLaunch < this.config.minimumDaysForCheck) {
            return this.createFlag(gameId, gameName, engagementRate, false, daysSinceLaunch, 'insufficient_data');
        }

        // Determine if engagement is below threshold
        const isFlagged = engagementRate < this.config.lowEngagementThreshold;
        const isCritical = engagementRate < this.config.criticalThreshold;

        let severity: 'warning' | 'critical' | 'none';
        let reason: string;

        if (isCritical) {
            severity = 'critical';
            reason = `Critical: Engagement rate (${engagementRate.toFixed(1)}%) is significantly below the ${this.config.lowEngagementThreshold}% threshold`;
        } else if (isFlagged) {
            severity = 'warning';
            reason = `Engagement rate (${engagementRate.toFixed(1)}%) is below the ${this.config.lowEngagementThreshold}% threshold`;
        } else {
            severity = 'none';
            reason = `Engagement rate (${engagementRate.toFixed(1)}%) meets the ${this.config.lowEngagementThreshold}% threshold`;
        }

        const recommendedActions = this.getRecommendedActions(engagementRate, severity);

        return {
            gameId,
            gameName,
            isFlagged,
            engagementRate,
            threshold: this.config.lowEngagementThreshold,
            daysSinceLaunch,
            severity,
            reason,
            recommendedActions,
            flaggedAt: new Date().toISOString(),
        };
    }

    /**
     * Check multiple games for low engagement
     */
    public checkMultipleGames(games: GameEngagementData[]): LowEngagementFlag[] {
        return games.map(game => this.checkLowEngagement(game));
    }

    /**
     * Get games that need review (flagged games)
     */
    public getGamesNeedingReview(games: GameEngagementData[]): LowEngagementFlag[] {
        return this.checkMultipleGames(games).filter(flag => flag.isFlagged);
    }

    /**
     * Get critical cases (severity = critical)
     */
    public getCriticalCases(games: GameEngagementData[]): LowEngagementFlag[] {
        return this.checkMultipleGames(games).filter(flag => flag.severity === 'critical');
    }

    /**
     * Generate summary of low engagement flags
     */
    public generateSummary(flags: LowEngagementFlag[]): {
        totalGames: number;
        flaggedGames: number;
        criticalCases: number;
        warningCases: number;
        healthyGames: number;
        avgEngagementRate: number;
        gamesBySeverity: { critical: string[]; warning: string[]; healthy: string[] };
    } {
        if (flags.length === 0) {
            return {
                totalGames: 0,
                flaggedGames: 0,
                criticalCases: 0,
                warningCases: 0,
                healthyGames: 0,
                avgEngagementRate: 0,
                gamesBySeverity: { critical: [], warning: [], healthy: [] },
            };
        }

        const totalGames = flags.length;
        const flaggedGames = flags.filter(f => f.isFlagged).length;
        const criticalCases = flags.filter(f => f.severity === 'critical').length;
        const warningCases = flags.filter(f => f.severity === 'warning').length;
        const healthyGames = flags.filter(f => f.severity === 'none').length;
        const avgEngagementRate = flags.reduce((sum, f) => sum + f.engagementRate, 0) / totalGames;

        const gamesBySeverity = {
            critical: flags.filter(f => f.severity === 'critical').map(f => f.gameId),
            warning: flags.filter(f => f.severity === 'warning').map(f => f.gameId),
            healthy: flags.filter(f => f.severity === 'none').map(f => f.gameId),
        };

        return {
            totalGames,
            flaggedGames,
            criticalCases,
            warningCases,
            healthyGames,
            avgEngagementRate,
            gamesBySeverity,
        };
    }

    /**
     * Create a flag result
     */
    private createFlag(
        gameId: GameId,
        gameName: string,
        engagementRate: number,
        isFlagged: boolean,
        daysSinceLaunch: number,
        reason: string
    ): LowEngagementFlag {
        let severity: 'warning' | 'critical' | 'none' = 'none';
        let recommendedActions: string[] = [];

        if (reason === 'insufficient_data') {
            severity = 'none';
            recommendedActions = ['Continue monitoring - insufficient data for assessment'];
        } else if (reason === 'grace_period') {
            severity = 'none';
            recommendedActions = ['Game is in grace period - continue monitoring'];
        } else if (isFlagged) {
            if (engagementRate < this.config.criticalThreshold) {
                severity = 'critical';
            } else {
                severity = 'warning';
            }
            recommendedActions = this.getRecommendedActions(engagementRate, severity);
        }

        return {
            gameId,
            gameName,
            isFlagged,
            engagementRate,
            threshold: this.config.lowEngagementThreshold,
            daysSinceLaunch,
            severity,
            reason: reason === 'insufficient_data'
                ? `Insufficient data - only ${daysSinceLaunch} days since launch`
                : reason === 'grace_period'
                    ? `Game is in grace period (${daysSinceLaunch}/${this.config.gracePeriodDays} days)`
                    : `Engagement rate (${engagementRate.toFixed(1)}%) meets threshold`,
            recommendedActions,
            flaggedAt: new Date().toISOString(),
        };
    }

    /**
     * Get recommended actions based on engagement rate and severity
     */
    private getRecommendedActions(_engagementRate: number, severity: 'warning' | 'critical' | 'none'): string[] {
        if (severity === 'none') {
            return ['Continue monitoring engagement trends'];
        }

        const actions: string[] = [];

        if (severity === 'critical') {
            actions.push('URGENT: Schedule immediate review meeting');
            actions.push('Analyze user feedback for specific issues');
            actions.push('Consider game redesign or major updates');
            actions.push('Review marketing and onboarding flow');
        }

        actions.push('Review user feedback and comments');
        actions.push('Analyze session data to identify drop-off points');
        actions.push('Consider gameplay improvements or new features');
        actions.push('Evaluate marketing and promotion strategies');
        actions.push('Check for technical issues affecting user experience');
        actions.push('Schedule follow-up review in 14 days');

        return actions;
    }

    /**
     * Get the configuration
     */
    public getConfig(): LowEngagementFlagConfig {
        return { ...this.config };
    }
}

/**
 * Create a default low engagement flag service
 */
export function createLowEngagementFlagService(
    config?: Partial<LowEngagementFlagConfig>
): LowEngagementFlagService {
    return new LowEngagementFlagService(config);
}
