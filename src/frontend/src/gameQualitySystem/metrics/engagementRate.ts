/**
 * Engagement Rate Calculation Module
 * 
 * Calculates engagement rate as: (Unique_Players / Total_Users) * 100
 * 
 * Requirement 5.3: Calculate engagement rate as (Unique_Players / Total_Users) * 100
 */

import type { GameId } from '../types';

/**
 * Input data for engagement rate calculation
 */
export interface EngagementRateInput {
    gameId: GameId;
    uniquePlayers: number;
    totalUsers: number;
    timePeriod?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
    periodStart?: string;
    periodEnd?: string;
}

/**
 * Calculated engagement rate result
 */
export interface EngagementRateResult {
    gameId: GameId;
    engagementRate: number; // Percentage (0-100)
    uniquePlayers: number;
    totalUsers: number;
    isValid: boolean;
    timePeriod: string;
    calculatedAt: string;
}

/**
 * Configuration for engagement rate calculation
 */
export interface EngagementRateConfig {
    lowEngagementThreshold: number; // Below this = low engagement
    highEngagementThreshold: number; // Above this = high engagement
    minimumSampleSize: number; // Minimum users for valid calculation
}

/**
 * Default configuration for engagement rate
 */
export const DEFAULT_ENGAGEMENT_RATE_CONFIG: EngagementRateConfig = {
    lowEngagementThreshold: 15, // 15% - games below this need review (Requirement 5.4)
    highEngagementThreshold: 50, // 50% - above this is considered high engagement
    minimumSampleSize: 10, // Minimum users for statistically valid result
};

/**
 * Engagement Rate Calculator
 * 
 * Calculates and validates engagement rate metrics.
 * Validates: Requirement 5.3
 */
export class EngagementRateCalculator {
    private readonly config: EngagementRateConfig;

    constructor(config: Partial<EngagementRateConfig> = {}) {
        this.config = { ...DEFAULT_ENGAGEMENT_RATE_CONFIG, ...config };
    }

    /**
     * Calculate engagement rate from input data
     */
    public calculateEngagementRate(input: EngagementRateInput): EngagementRateResult {
        const { gameId, uniquePlayers, totalUsers, timePeriod = 'all' } = input;

        // Handle edge cases
        if (totalUsers === 0) {
            return {
                gameId,
                engagementRate: 0,
                uniquePlayers,
                totalUsers,
                isValid: false,
                timePeriod,
                calculatedAt: new Date().toISOString(),
            };
        }

        // Calculate engagement rate: (Unique_Players / Total_Users) * 100
        const engagementRate = (uniquePlayers / totalUsers) * 100;

        // Check if sample size is sufficient for valid calculation
        const isValid = totalUsers > this.config.minimumSampleSize;

        return {
            gameId,
            engagementRate,
            uniquePlayers,
            totalUsers,
            isValid,
            timePeriod,
            calculatedAt: new Date().toISOString(),
        };
    }

    /**
     * Calculate engagement rate from session data
     */
    public calculateFromSessions(
        gameId: GameId,
        totalUsers: number,
        sessionUserIds: string[],
        timePeriod: string = 'all'
    ): EngagementRateResult {
        const uniquePlayers = new Set(sessionUserIds).size;
        return this.calculateEngagementRate({
            gameId,
            uniquePlayers,
            totalUsers,
            timePeriod: timePeriod as EngagementRateInput['timePeriod'],
        });
    }

    /**
     * Determine engagement level based on rate
     */
    public getEngagementLevel(engagementRate: number): 'low' | 'medium' | 'high' {
        if (engagementRate < this.config.lowEngagementThreshold) {
            return 'low';
        }
        if (engagementRate >= this.config.highEngagementThreshold) {
            return 'high';
        }
        return 'medium';
    }

    /**
     * Check if engagement is below threshold (for flagging)
     */
    public isLowEngagement(engagementRate: number): boolean {
        return engagementRate < this.config.lowEngagementThreshold;
    }

    /**
     * Check if engagement is above threshold
     */
    public isHighEngagement(engagementRate: number): boolean {
        return engagementRate > this.config.highEngagementThreshold;
    }

    /**
     * Compare engagement rates across multiple games
     */
    public compareEngagementRates(
        results: EngagementRateResult[]
    ): {
        highest: string | null;
        lowest: string | null;
        average: number;
        belowThreshold: string[];
        aboveThreshold: string[];
    } {
        if (results.length === 0) {
            return {
                highest: null,
                lowest: null,
                average: 0,
                belowThreshold: [],
                aboveThreshold: [],
            };
        }

        const sorted = [...results].sort((a, b) => b.engagementRate - a.engagementRate);
        const average = results.reduce((sum, r) => sum + r.engagementRate, 0) / results.length;
        const belowThreshold = results.filter(r => this.isLowEngagement(r.engagementRate)).map(r => r.gameId);
        const aboveThreshold = results.filter(r => this.isHighEngagement(r.engagementRate)).map(r => r.gameId);

        return {
            highest: sorted[0]?.gameId || null,
            lowest: sorted[sorted.length - 1]?.gameId || null,
            average,
            belowThreshold,
            aboveThreshold,
        };
    }

    /**
     * Generate engagement rate summary
     */
    public generateSummary(results: EngagementRateResult[]): {
        totalGames: number;
        avgEngagementRate: number;
        lowEngagementGames: number;
        highEngagementGames: number;
        validCalculations: number;
        invalidCalculations: number;
    } {
        if (results.length === 0) {
            return {
                totalGames: 0,
                avgEngagementRate: 0,
                lowEngagementGames: 0,
                highEngagementGames: 0,
                validCalculations: 0,
                invalidCalculations: 0,
            };
        }

        const totalGames = results.length;
        const avgEngagementRate = results.reduce((sum, r) => sum + r.engagementRate, 0) / totalGames;
        const lowEngagementGames = results.filter(r => this.isLowEngagement(r.engagementRate)).length;
        const highEngagementGames = results.filter(r => this.isHighEngagement(r.engagementRate)).length;
        const validCalculations = results.filter(r => r.isValid).length;
        const invalidCalculations = results.filter(r => !r.isValid).length;

        return {
            totalGames,
            avgEngagementRate,
            lowEngagementGames,
            highEngagementGames,
            validCalculations,
            invalidCalculations,
        };
    }

    /**
     * Get the configuration
     */
    public getConfig(): EngagementRateConfig {
        return { ...this.config };
    }
}

/**
 * Create a default engagement rate calculator
 */
export function createEngagementRateCalculator(
    config?: Partial<EngagementRateConfig>
): EngagementRateCalculator {
    return new EngagementRateCalculator(config);
}
