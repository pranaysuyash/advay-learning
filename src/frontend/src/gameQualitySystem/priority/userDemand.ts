// User Demand Calculation Module
// Calculates weighted user demand score based on:
// - User_Feedback_Score: Aggregate score from user feedback
// - Play_Count: Number of times the game has been played
// - Completion_Rate: Percentage of users who complete the game

import type { Game, CatalogEntry, UserDemandBreakdown } from '../types';
import { USER_DEMAND_WEIGHTS } from '../types';

/**
 * Maximum play count for normalization (used as reference point for scoring)
 */
const MAX_PLAY_COUNT_REFERENCE = 10000;

/**
 * Calculates the user feedback score from feedback entries.
 * 
 * @param feedback - Array of user feedback entries
 * @returns A score from 0-100 representing user feedback
 */
export function calculateUserFeedbackScore(
    feedback?: Array<{ sentiment?: string; score?: number;[key: string]: unknown }>
): number {
    if (!feedback || feedback.length === 0) {
        return 0;
    }

    let totalScore = 0;
    let hasExplicitScore = false;
    let explicitScoreCount = 0;

    for (const entry of feedback) {
        // If entry has an explicit score, use it directly
        if (typeof entry.score === 'number') {
            hasExplicitScore = true;
            explicitScoreCount += 1;
            // Normalize score to 0-100 if needed
            const normalizedScore = Math.min(100, Math.max(0, entry.score));
            totalScore += normalizedScore;
        } else if (!hasExplicitScore && entry.sentiment) {
            // Convert sentiment to score
            const sentimentScore = sentimentToScore(entry.sentiment);
            totalScore += sentimentScore;
        }
    }

    if (feedback.length === 0) {
        return 0;
    }

    // If we have explicit scores, use the average
    if (hasExplicitScore) {
        return explicitScoreCount > 0 ? Math.round(totalScore / explicitScoreCount) : 0;
    }

    // Otherwise, calculate based on positive/negative sentiment ratio
    const positiveFeedback = feedback.filter(
        (f) => f.sentiment === 'positive'
    ).length;
    const totalFeedback = feedback.length;

    // Score based on positive feedback percentage (0-100)
    return Math.round((positiveFeedback / totalFeedback) * 100);
}

/**
 * Converts sentiment string to a numeric score.
 * 
 * @param sentiment - The sentiment string
 * @returns A score from 0-100
 */
function sentimentToScore(sentiment: string): number {
    const normalized = sentiment.toLowerCase().trim();

    switch (normalized) {
        case 'positive':
        case 'excellent':
        case 'love':
            return 100;
        case 'very positive':
        case 'great':
            return 90;
        case 'somewhat positive':
        case 'good':
            return 75;
        case 'neutral':
        case 'mixed':
            return 50;
        case 'somewhat negative':
        case 'okay':
        case 'fine':
            return 40;
        case 'negative':
        case 'poor':
            return 25;
        case 'very negative':
        case 'terrible':
        case 'hate':
            return 0;
        default:
            return 50; // Default to neutral for unknown sentiments
    }
}

/**
 * Calculates the play count score for a game.
 * Uses logarithmic scaling to handle wide range of play counts.
 * 
 * @param playCount - The number of times the game has been played
 * @returns A score from 0-100 representing play count
 */
export function calculatePlayCountScore(playCount?: number): number {
    if (playCount === undefined || playCount === null || playCount <= 0) {
        return 0;
    }

    // Use logarithmic scaling for better distribution
    // log(1) = 0, log(10000) = 9.21, so we scale accordingly
    const logPlayCount = Math.log10(playCount + 1);
    const maxLog = Math.log10(MAX_PLAY_COUNT_REFERENCE + 1);

    // Scale to 0-100
    return Math.min(100, Math.round((logPlayCount / maxLog) * 100));
}

/**
 * Calculates the completion rate score for a game.
 * 
 * @param completionRate - The percentage of users who complete the game (0-100)
 * @returns A score from 0-100 representing completion rate
 */
export function calculateCompletionRateScore(completionRate?: number): number {
    if (completionRate === undefined || completionRate === null) {
        return 0;
    }

    // Clamp to valid range
    const rate = Math.min(100, Math.max(0, completionRate));

    // Score based on completion rate tiers:
    // 0-20%: 0-25 points (very low engagement)
    // 21-40%: 25-50 points (below average)
    // 41-60%: 50-70 points (average)
    // 61-80%: 70-90 points (good)
    // 81-100%: 90-100 points (excellent)

    if (rate <= 20) {
        return Math.round(rate * 1.25); // 0-25
    } else if (rate <= 40) {
        return 25 + Math.round((rate - 20) * 1.25); // 25-50
    } else if (rate <= 60) {
        return 50 + Math.round((rate - 40) * 1); // 50-70
    } else if (rate <= 80) {
        return 70 + Math.round((rate - 60) * 1); // 70-90
    } else {
        return 90 + Math.round((rate - 80) * 0.5); // 90-100
    }
}

/**
 * Calculates the complete user demand breakdown for a game.
 * 
 * @param game - The game to evaluate
 * @returns UserDemandBreakdown with individual components and total score
 */
export function calculateUserDemand(game: Game | CatalogEntry): UserDemandBreakdown {
    const userFeedbackScore = calculateUserFeedbackScore(game.userFeedback);
    const playCountScore = calculatePlayCountScore(game.playCount);
    const completionRateScore = calculateCompletionRateScore(game.completionRate);

    // Calculate weighted total score
    const totalScore =
        userFeedbackScore * USER_DEMAND_WEIGHTS.userFeedbackScore +
        playCountScore * USER_DEMAND_WEIGHTS.playCount +
        completionRateScore * USER_DEMAND_WEIGHTS.completionRate;

    return {
        userFeedbackScore,
        playCount: playCountScore,
        completionRate: completionRateScore,
        totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    };
}

/**
 * Validates that user demand scores are within valid range (0-100).
 * 
 * @param breakdown - The user demand breakdown to validate
 * @returns true if all scores are valid, false otherwise
 */
export function isValidUserDemand(breakdown: UserDemandBreakdown): boolean {
    return (
        breakdown.userFeedbackScore >= 0 &&
        breakdown.userFeedbackScore <= 100 &&
        breakdown.playCount >= 0 &&
        breakdown.playCount <= 100 &&
        breakdown.completionRate >= 0 &&
        breakdown.completionRate <= 100 &&
        breakdown.totalScore >= 0 &&
        breakdown.totalScore <= 100
    );
}

/**
 * Gets a human-readable description of the user demand level.
 * 
 * @param totalScore - The total user demand score
 * @returns A description string
 */
export function getUserDemandLevel(totalScore: number): string {
    if (totalScore >= 80) return 'Very High';
    if (totalScore >= 60) return 'High';
    if (totalScore >= 40) return 'Moderate';
    if (totalScore >= 20) return 'Low';
    return 'Very Low';
}
