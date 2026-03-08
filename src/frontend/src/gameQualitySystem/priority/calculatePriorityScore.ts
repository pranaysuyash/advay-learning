// Priority Score Calculation Module
// Calculates weighted priority score based on:
// - Educational_Impact: 40% weight
// - User_Demand: 30% weight
// - Implementation_Effort: 20% weight
// - Strategic_Alignment: 10% weight

import type { PriorityScore, PriorityLevel, PriorityFactors } from '../types';

/**
 * Weights for priority score components as specified in requirements
 */
export const PRIORITY_SCORE_WEIGHTS: PriorityFactors = {
    educationalImpact: 0.4,
    userDemand: 0.3,
    implementationEffort: 0.2,
    strategicAlignment: 0.1,
};

/**
 * Priority level thresholds as specified in requirements
 */
export const PRIORITY_LEVEL_THRESHOLDS: Record<PriorityLevel, [number, number]> = {
    P0: [90, 100],
    P1: [70, 89],
    P2: [50, 69],
    P3: [0, 49],
};

/**
 * Calculates the weighted priority score from priority factors.
 * 
 * Formula: Educational_Impact * 0.4 + User_Demand * 0.3 + Implementation_Effort * 0.2 + Strategic_Alignment * 0.1
 * 
 * All factors should be normalized to 0-100 scale before calling this function.
 * 
 * @param factors - The priority factors with values normalized to 0-100
 * @returns The calculated priority score (0-100)
 * 
 * @example
 * ```typescript
 * const score = calculatePriorityScore({
 *   educationalImpact: 100,
 *   userDemand: 80,
 *   implementationEffort: 60,
 *   strategicAlignment: 90
 * });
 * // score = 100 * 0.4 + 80 * 0.3 + 60 * 0.2 + 90 * 0.1 = 40 + 24 + 12 + 9 = 85
 * ```
 */
export function calculatePriorityScore(factors: PriorityFactors): number {
    const { educationalImpact, userDemand, implementationEffort, strategicAlignment } = factors;

    const totalScore =
        educationalImpact * PRIORITY_SCORE_WEIGHTS.educationalImpact +
        userDemand * PRIORITY_SCORE_WEIGHTS.userDemand +
        implementationEffort * PRIORITY_SCORE_WEIGHTS.implementationEffort +
        strategicAlignment * PRIORITY_SCORE_WEIGHTS.strategicAlignment;

    // Round to 2 decimal places for precision
    return Math.round(totalScore * 100) / 100;
}

/**
 * Determines the priority level based on a priority score.
 * 
 * Thresholds:
 * - P0: 90-100
 * - P1: 70-89
 * - P2: 50-69
 * - P3: 0-49
 * 
 * @param score - The priority score (0-100)
 * @returns The corresponding priority level
 */
export function determinePriorityLevel(score: number): PriorityLevel {
    if (score >= 90) return 'P0';
    if (score >= 70) return 'P1';
    if (score >= 50) return 'P2';
    return 'P3';
}

/**
 * Creates a complete PriorityScore object from priority factors.
 * 
 * @param gameId - The unique identifier for the game
 * @param factors - The priority factors with values normalized to 0-100
 * @returns A complete PriorityScore object
 */
export function createPriorityScore(gameId: string, factors: PriorityFactors): PriorityScore {
    const totalScore = calculatePriorityScore(factors);
    const priorityLevel = determinePriorityLevel(totalScore);

    return {
        gameId,
        totalScore,
        educationalImpact: factors.educationalImpact,
        userDemand: factors.userDemand,
        implementationEffort: factors.implementationEffort,
        strategicAlignment: factors.strategicAlignment,
        priorityLevel,
    };
}

/**
 * Validates that priority factors are within valid range (0-100).
 * 
 * @param factors - The priority factors to validate
 * @returns true if all factors are valid, false otherwise
 */
export function isValidPriorityFactors(factors: Partial<PriorityFactors>): factors is PriorityFactors {
    const requiredKeys: (keyof PriorityFactors)[] = [
        'educationalImpact',
        'userDemand',
        'implementationEffort',
        'strategicAlignment',
    ];

    for (const key of requiredKeys) {
        const value = factors[key];
        if (typeof value !== 'number' || value < 0 || value > 100) {
            return false;
        }
    }

    return true;
}

/**
 * Gets the weight for a specific priority factor.
 * 
 * @param factor - The priority factor name
 * @returns The weight for the factor
 */
export function getPriorityFactorWeight(factor: keyof PriorityFactors): number {
    return PRIORITY_SCORE_WEIGHTS[factor];
}

/**
 * Gets the priority range for a specific priority level.
 * 
 * @param level - The priority level
 * @returns The score range [min, max] for the level
 */
export function getPriorityRange(level: PriorityLevel): [number, number] {
    return PRIORITY_LEVEL_THRESHOLDS[level];
}