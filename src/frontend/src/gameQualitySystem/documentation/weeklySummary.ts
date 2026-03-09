// Weekly Summary Generation Module for Game Quality System

import type { Game, AuditReport, PriorityScore } from '../types';

/**
 * Represents a game that was improved during the week
 */
export interface GameImproved {
    gameId: string;
    gameName: string;
    preAuditScore: number;
    postAuditScore: number;
    improvementPercentage: number;
    dimensionsImproved: string[];
    effortHours: number;
}

/**
 * Represents a game that was implemented during the week
 */
export interface GameImplemented {
    gameId: string;
    gameName: string;
    category: string;
    difficulty: string;
    estimatedTime: number;
    educationalObjectives: string[];
    priorityLevel: PriorityScore['priorityLevel'];
    effortHours: number;
}

/**
 * Represents a weekly summary payload
 */
export interface WeeklySummaryData {
    weekStartDate: string;
    weekEndDate: string;
    gamesImproved: GameImproved[];
    gamesImplemented: GameImplemented[];
    totalEffortHours: number;
    impactScore: number;
    keyAchievements: string[];
    challenges: string[];
    nextWeekGoals: string[];
}

/**
 * Configuration for weekly summary generation
 */
export interface WeeklySummaryConfig {
    weekStartDay: number; // 0 = Sunday, 1 = Monday, etc.
    impactScoreWeights: {
        gamesImproved: number;
        gamesImplemented: number;
        effortEfficiency: number;
    };
    includeDetailedBreakdown: boolean;
}

/**
 * Default configuration for weekly summary generation
 */
export const DEFAULT_WEEKLY_SUMMARY_CONFIG: WeeklySummaryConfig = {
    weekStartDay: 1, // Monday
    impactScoreWeights: {
        gamesImproved: 0.4,
        gamesImplemented: 0.4,
        effortEfficiency: 0.2,
    },
    includeDetailedBreakdown: true,
};

/**
 * WeeklySummary class for generating weekly summary reports
 * Requirement 8.5: Generate Weekly_Summary with Games_Improved, Games_Implemented,
 * Total_Effort_Hours, Impact_Score
 */
export class WeeklySummary {
    private readonly config: WeeklySummaryConfig;
    private gamesImproved: GameImproved[];
    private gamesImplemented: GameImplemented[];
    private effortLog: Map<string, number>; // gameId -> hours spent

    constructor(config: Partial<WeeklySummaryConfig> = {}) {
        this.config = { ...DEFAULT_WEEKLY_SUMMARY_CONFIG, ...config };
        this.gamesImproved = [];
        this.gamesImplemented = [];
        this.effortLog = new Map();
    }

    /**
     * Add a game that was improved
     * @param game - The game that was improved
     * @param preAudit - Pre-improvement audit
     * @param postAudit - Post-improvement audit
     * @param effortHours - Hours spent on improvement
     */
    public addGameImproved(
        game: Game,
        preAudit: AuditReport,
        postAudit: AuditReport,
        effortHours: number
    ): void {
        const dimensionsImproved = postAudit.scores
            .filter(post => {
                const pre = preAudit.scores.find(s => s.dimension === post.dimension);
                return pre && post.score > pre.score;
            })
            .map(s => s.dimension);

        const improvementPercentage = preAudit.totalScore !== 0
            ? ((postAudit.totalScore - preAudit.totalScore) / preAudit.totalScore) * 100
            : 0;

        const entry: GameImproved = {
            gameId: game.id,
            gameName: game.name,
            preAuditScore: preAudit.totalScore,
            postAuditScore: postAudit.totalScore,
            improvementPercentage,
            dimensionsImproved,
            effortHours,
        };

        this.gamesImproved.push(entry);
        this.effortLog.set(game.id, (this.effortLog.get(game.id) || 0) + effortHours);
    }

    /**
     * Add a game that was implemented
     * @param game - The game that was implemented
     * @param priorityScore - The priority score for the game
     * @param effortHours - Hours spent on implementation
     */
    public addGameImplemented(
        game: Game,
        priorityScore: PriorityScore,
        effortHours: number
    ): void {
        const entry: GameImplemented = {
            gameId: game.id,
            gameName: game.name,
            category: game.category,
            difficulty: game.difficulty,
            estimatedTime: game.estimatedTime,
            educationalObjectives: game.educationalObjectives || [],
            priorityLevel: priorityScore.priorityLevel,
            effortHours,
        };

        this.gamesImplemented.push(entry);
        this.effortLog.set(game.id, (this.effortLog.get(game.id) || 0) + effortHours);
    }

    /**
     * Generate the weekly summary report
     * @param weekStart - Start date of the week
     * @param weekEnd - End date of the week
     * @returns Complete weekly summary
     */
    public generateSummary(weekStart: string, weekEnd: string): WeeklySummaryData {
        const totalEffortHours = this.calculateTotalEffortHours();
        const impactScore = this.calculateImpactScore(totalEffortHours);
        const keyAchievements = this.generateKeyAchievements();
        const challenges = this.generateChallenges();
        const nextWeekGoals = this.generateNextWeekGoals();

        return {
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            gamesImproved: [...this.gamesImproved],
            gamesImplemented: [...this.gamesImplemented],
            totalEffortHours,
            impactScore,
            keyAchievements,
            challenges,
            nextWeekGoals,
        };
    }

    /**
     * Format the weekly summary as markdown
     * @param summary - The weekly summary to format
     * @returns Formatted markdown string
     */
    public formatAsMarkdown(summary: WeeklySummaryData): string {
        const sections: string[] = [];

        // Header
        sections.push('# Weekly Summary Report');
        sections.push('');
        sections.push(`**Week**: ${this.formatDate(summary.weekStartDate)} - ${this.formatDate(summary.weekEndDate)}`);
        sections.push(`**Generated**: ${new Date().toLocaleString()}`);
        sections.push('');

        // Overview
        sections.push('## Overview');
        sections.push('');
        sections.push('| Metric | Value |');
        sections.push('|--------|-------|');
        sections.push(`| Games Improved | ${summary.gamesImproved.length} |`);
        sections.push(`| Games Implemented | ${summary.gamesImplemented.length} |`);
        sections.push(`| Total Effort Hours | ${summary.totalEffortHours} |`);
        sections.push(`| Impact Score | ${summary.impactScore.toFixed(1)}/100 |`);
        sections.push('');

        // Games Improved
        if (summary.gamesImproved.length > 0) {
            sections.push('## Games Improved');
            sections.push('');

            for (const game of summary.gamesImproved) {
                sections.push(`### ${game.gameName}`);
                sections.push(`- **Game ID**: ${game.gameId}`);
                sections.push(`- **Score Change**: ${game.preAuditScore} → ${game.postAuditScore} ` +
                    `(${game.improvementPercentage >= 0 ? '+' : ''}${game.improvementPercentage.toFixed(1)}%)`);
                sections.push(`- **Dimensions Improved**: ${game.dimensionsImproved.join(', ') || 'None'}`);
                sections.push(`- **Effort**: ${game.effortHours} hours`);
                sections.push('');
            }
        }

        // Games Implemented
        if (summary.gamesImplemented.length > 0) {
            sections.push('## Games Implemented');
            sections.push('');

            for (const game of summary.gamesImplemented) {
                sections.push(`### ${game.gameName}`);
                sections.push(`- **Game ID**: ${game.gameId}`);
                sections.push(`- **Category**: ${game.category}`);
                sections.push(`- **Difficulty**: ${game.difficulty}`);
                sections.push(`- **Priority**: ${game.priorityLevel}`);
                sections.push(`- **Estimated Time**: ${game.estimatedTime} hours`);
                sections.push(`- **Effort**: ${game.effortHours} hours`);
                sections.push('');
            }
        }

        // Detailed Breakdown
        if (this.config.includeDetailedBreakdown) {
            sections.push('## Detailed Breakdown');
            sections.push('');

            // Effort Distribution
            sections.push('### Effort Distribution');
            sections.push('');
            sections.push('| Game | Type | Effort (hours) |');
            sections.push('|------|------|----------------|');

            for (const game of summary.gamesImproved) {
                sections.push(`| ${game.gameName} | Improvement | ${game.effortHours} |`);
            }

            for (const game of summary.gamesImplemented) {
                sections.push(`| ${game.gameName} | Implementation | ${game.effortHours} |`);
            }

            sections.push(`| **Total** | | **${summary.totalEffortHours}** |`);
            sections.push('');

            // Priority Distribution
            sections.push('### Priority Distribution');
            sections.push('');
            const priorityCounts = {
                P0: summary.gamesImplemented.filter(g => g.priorityLevel === 'P0').length,
                P1: summary.gamesImplemented.filter(g => g.priorityLevel === 'P1').length,
                P2: summary.gamesImplemented.filter(g => g.priorityLevel === 'P2').length,
                P3: summary.gamesImplemented.filter(g => g.priorityLevel === 'P3').length,
            };

            sections.push(`- **P0 (Critical)**: ${priorityCounts.P0} games`);
            sections.push(`- **P1 (High)**: ${priorityCounts.P1} games`);
            sections.push(`- **P2 (Medium)**: ${priorityCounts.P2} games`);
            sections.push(`- **P3 (Low)**: ${priorityCounts.P3} games`);
            sections.push('');
        }

        // Key Achievements
        if (summary.keyAchievements.length > 0) {
            sections.push('## Key Achievements');
            sections.push('');

            for (const [i, achievement] of summary.keyAchievements.entries()) {
                sections.push(`${i + 1}. ${achievement}`);
            }

            sections.push('');
        }

        // Challenges
        if (summary.challenges.length > 0) {
            sections.push('## Challenges');
            sections.push('');

            for (const [i, challenge] of summary.challenges.entries()) {
                sections.push(`${i + 1}. ${challenge}`);
            }

            sections.push('');
        }

        // Next Week Goals
        if (summary.nextWeekGoals.length > 0) {
            sections.push('## Next Week Goals');
            sections.push('');

            for (const [i, goal] of summary.nextWeekGoals.entries()) {
                sections.push(`${i + 1}. ${goal}`);
            }

            sections.push('');
        }

        // Footer
        sections.push('---');
        sections.push(`*Report generated on ${new Date().toISOString()}*`);

        return sections.join('\n');
    }

    /**
     * Calculate total effort hours
     * @returns Total hours spent
     */
    public calculateTotalEffortHours(): number {
        let total = 0;

        for (const game of this.gamesImproved) {
            total += game.effortHours;
        }

        for (const game of this.gamesImplemented) {
            total += game.effortHours;
        }

        return total;
    }

    /**
     * Calculate impact score
     * @param totalEffortHours - Total effort hours for the week
     * @returns Impact score (0-100)
     */
    public calculateImpactScore(totalEffortHours: number): number {
        const weights = this.config.impactScoreWeights;

        // Games improved score (max 40 points)
        const improvedScore = Math.min(this.gamesImproved.length * 10, 40);

        // Games implemented score (max 40 points)
        const implementedScore = Math.min(this.gamesImplemented.length * 10, 40);

        // Effort efficiency score (max 20 points)
        // Higher efficiency = more impact per hour
        let efficiencyScore = 20;
        if (totalEffortHours > 0) {
            const totalImpact = this.gamesImproved.length + this.gamesImplemented.length;
            const efficiency = totalImpact / totalEffortHours;
            efficiencyScore = Math.min(efficiency * 10, 20);
        }

        return improvedScore * weights.gamesImproved +
            implementedScore * weights.gamesImplemented +
            efficiencyScore * weights.effortEfficiency;
    }

    /**
     * Get games improved count
     * @returns Number of games improved
     */
    public getGamesImprovedCount(): number {
        return this.gamesImproved.length;
    }

    /**
     * Get games implemented count
     * @returns Number of games implemented
     */
    public getGamesImplementedCount(): number {
        return this.gamesImplemented.length;
    }

    /**
     * Clear all data
     */
    public clear(): void {
        this.gamesImproved = [];
        this.gamesImplemented = [];
        this.effortLog.clear();
    }

    /**
     * Generate key achievements based on current data
     * @returns Array of key achievements
     */
    private generateKeyAchievements(): string[] {
        const achievements: string[] = [];

        if (this.gamesImproved.length > 0) {
            const totalImprovement = this.gamesImproved.reduce(
                (sum, g) => sum + g.improvementPercentage, 0
            );
            const avgImprovement = totalImprovement / this.gamesImproved.length;

            achievements.push(
                `Improved ${this.gamesImproved.length} game(s) with average score improvement of ${avgImprovement.toFixed(1)}%`
            );
        }

        if (this.gamesImplemented.length > 0) {
            const p0P1Count = this.gamesImplemented.filter(
                g => g.priorityLevel === 'P0' || g.priorityLevel === 'P1'
            ).length;

            achievements.push(
                `Implemented ${this.gamesImplemented.length} game(s), including ${p0P1Count} high-priority (P0/P1) game(s)`
            );
        }

        const totalEffort = this.calculateTotalEffortHours();
        if (totalEffort > 0) {
            achievements.push(`Total development effort: ${totalEffort} hours`);
        }

        return achievements;
    }

    /**
     * Generate challenges based on current data
     * @returns Array of challenges
     */
    private generateChallenges(): string[] {
        const challenges: string[] = [];

        // Check for low improvement games
        const lowImprovementGames = this.gamesImproved.filter(
            g => g.improvementPercentage < 10
        );

        if (lowImprovementGames.length > 0) {
            challenges.push(
                `${lowImprovementGames.length} game(s) showed minimal improvement (<10%)`
            );
        }

        // Check for high effort games
        const highEffortGames = [...this.gamesImproved, ...this.gamesImplemented]
            .filter(g => g.effortHours > 20);

        if (highEffortGames.length > 0) {
            challenges.push(
                `${highEffortGames.length} game(s) required significant effort (>20 hours)`
            );
        }

        return challenges;
    }

    /**
     * Generate next week goals based on current data
     * @returns Array of next week goals
     */
    private generateNextWeekGoals(): string[] {
        const goals: string[] = [];

        // Goal to continue improvement trend
        if (this.gamesImproved.length > 0) {
            goals.push(
                `Continue improving existing games with similar or better efficiency`
            );
        }

        // Goal to implement more high-priority games
        const p0P1Implemented = this.gamesImplemented.filter(
            g => g.priorityLevel === 'P0' || g.priorityLevel === 'P1'
        ).length;

        if (p0P1Implemented < 2) {
            goals.push(
                `Prioritize implementation of remaining P0/P1 games from catalog`
            );
        }

        // Goal to address low improvement games
        const lowImprovementCount = this.gamesImproved.filter(
            g => g.improvementPercentage < 10
        ).length;

        if (lowImprovementCount > 0) {
            goals.push(
                `Review and address games with minimal improvement`
            );
        }

        return goals;
    }

    /**
     * Format a date for display
     * @param dateString - The date string to format
     * @returns Formatted date string
     */
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}

/**
 * Factory function to create a WeeklySummary instance
 * @param config - Optional configuration
 * @returns New WeeklySummary instance
 */
export function createWeeklySummary(config?: Partial<WeeklySummaryConfig>): WeeklySummary {
    return new WeeklySummary(config);
}
