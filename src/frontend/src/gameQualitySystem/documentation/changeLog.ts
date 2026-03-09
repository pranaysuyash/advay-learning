// Change Log Generation Module for Game Quality System

import type { AuditReport, Game } from '../types';

/**
 * Represents a single change log entry
 */
export interface ChangeLogEntry {
    timestamp: string;
    gameId: string;
    gameName: string;
    improvementType: 'audit' | 'implementation' | 'enhancement' | 'fix';
    description: string;
    relatedAuditId?: string;
    affectedDimensions?: string[];
}

/**
 * Configuration for change log generation
 */
export interface ChangeLogConfig {
    dateFormat: 'ISO' | 'LOCAL' | 'UTC';
    includeGameName: boolean;
    includeAuditReference: boolean;
}

/**
 * Default configuration for change log generation
 */
export const DEFAULT_CHANGE_LOG_CONFIG: ChangeLogConfig = {
    dateFormat: 'ISO',
    includeGameName: true,
    includeAuditReference: true,
};

/**
 * ChangeLog class for generating and managing change logs
 * Requirement 8.1: Generate Change_Log for improvements and implementations
 */
export class ChangeLog {
    private readonly config: ChangeLogConfig;
    private entries: ChangeLogEntry[];

    constructor(config: Partial<ChangeLogConfig> = {}) {
        this.config = { ...DEFAULT_CHANGE_LOG_CONFIG, ...config };
        this.entries = [];
    }

    /**
     * Generate a change log entry from an audit report
     * @param auditReport - The audit report containing improvement recommendations
     * @param game - The game that was audited
     * @returns ChangeLogEntry for the audit
     */
    public generateFromAudit(auditReport: AuditReport, game: Game): ChangeLogEntry {
        const timestamp = this.getCurrentTimestamp();
        const affectedDimensions = auditReport.scores
            .filter((s) => s.score < 3)
            .map((s) => s.dimension);

        const entry: ChangeLogEntry = {
            timestamp,
            gameId: game.id,
            gameName: game.name,
            improvementType: 'audit',
            description: `Audit completed with total score ${auditReport.totalScore}/25. ` +
                `Flagged for improvement: ${auditReport.isFlaggedForImprovement}. ` +
                `Affected dimensions: ${affectedDimensions.join(', ') || 'none'}`,
            relatedAuditId: auditReport.auditDate,
            affectedDimensions,
        };

        this.entries.push(entry);
        return entry;
    }

    /**
     * Generate a change log entry from an implementation
     * @param gameId - The ID of the implemented game
     * @param gameName - The name of the implemented game
     * @param implementationDetails - Details about the implementation
     * @returns ChangeLogEntry for the implementation
     */
    public generateFromImplementation(
        gameId: string,
        gameName: string,
        implementationDetails: {
            category: string;
            technologies: string[];
            estimatedTime: number;
        }
    ): ChangeLogEntry {
        const timestamp = this.getCurrentTimestamp();

        const entry: ChangeLogEntry = {
            timestamp,
            gameId,
            gameName,
            improvementType: 'implementation',
            description: `Game implemented: ${gameName}. ` +
                `Category: ${implementationDetails.category}. ` +
                `Technologies: ${implementationDetails.technologies.join(', ')}. ` +
                `Estimated time: ${implementationDetails.estimatedTime} hours`,
        };

        this.entries.push(entry);
        return entry;
    }

    /**
     * Generate a change log entry from an enhancement
     * @param game - The game that was enhanced
     * @param enhancementType - Type of enhancement made
     * @param changes - Description of changes made
     * @returns ChangeLogEntry for the enhancement
     */
    public generateFromEnhancement(
        game: Game,
        enhancementType: string,
        changes: string[]
    ): ChangeLogEntry {
        const timestamp = this.getCurrentTimestamp();

        const entry: ChangeLogEntry = {
            timestamp,
            gameId: game.id,
            gameName: game.name,
            improvementType: 'enhancement',
            description: `Enhancement (${enhancementType}): ${changes.join('; ')}`,
        };

        this.entries.push(entry);
        return entry;
    }

    /**
     * Generate a change log entry from a fix
     * @param game - The game that was fixed
     * @param issueType - Type of issue fixed
     * @param fixDescription - Description of the fix
     * @returns ChangeLogEntry for the fix
     */
    public generateFromFix(
        game: Game,
        issueType: string,
        fixDescription: string
    ): ChangeLogEntry {
        const timestamp = this.getCurrentTimestamp();

        const entry: ChangeLogEntry = {
            timestamp,
            gameId: game.id,
            gameName: game.name,
            improvementType: 'fix',
            description: `Fix (${issueType}): ${fixDescription}`,
        };

        this.entries.push(entry);
        return entry;
    }

    /**
     * Get all change log entries
     * @returns Array of all change log entries
     */
    public getEntries(): ChangeLogEntry[] {
        return [...this.entries];
    }

    /**
     * Get change log entries for a specific game
     * @param gameId - The ID of the game
     * @returns Array of change log entries for the game
     */
    public getEntriesForGame(gameId: string): ChangeLogEntry[] {
        return this.entries.filter((entry) => entry.gameId === gameId);
    }

    /**
     * Get change log entries within a date range
     * @param startDate - Start of the date range
     * @param endDate - End of the date range
     * @returns Array of change log entries within the range
     */
    public getEntriesInDateRange(startDate: string, endDate: string): ChangeLogEntry[] {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return this.entries.filter((entry) => {
            const entryTime = new Date(entry.timestamp).getTime();
            return entryTime >= start && entryTime <= end;
        });
    }

    /**
     * Format change log entries as a markdown string
     * @param entries - Entries to format (defaults to all)
     * @returns Formatted markdown string
     */
    public formatAsMarkdown(entries?: ChangeLogEntry[]): string {
        const targetEntries = entries || this.entries;

        if (targetEntries.length === 0) {
            return '# Change Log\n\nNo changes recorded.';
        }

        const sortedEntries = [...targetEntries].sort((a, b) => {
            const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            if (timeDiff !== 0) {
                return timeDiff;
            }
            return b.gameId.localeCompare(a.gameId);
        });

        const lines = ['# Change Log\n'];

        for (const entry of sortedEntries) {
            const date = this.formatDate(entry.timestamp);
            lines.push(`## ${date}`);
            lines.push(`- **Game**: ${entry.gameName} (${entry.gameId})`);
            lines.push(`- **Type**: ${entry.improvementType}`);
            lines.push(`- **Description**: ${entry.description}`);

            if (entry.affectedDimensions && entry.affectedDimensions.length > 0) {
                lines.push(`- **Affected Dimensions**: ${entry.affectedDimensions.join(', ')}`);
            }

            if (entry.relatedAuditId) {
                lines.push(`- **Audit Reference**: ${entry.relatedAuditId}`);
            }

            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * Clear all change log entries
     */
    public clear(): void {
        this.entries = [];
    }

    /**
     * Get the current timestamp in the configured format
     * @returns Formatted timestamp string
     */
    private getCurrentTimestamp(): string {
        const now = new Date();

        switch (this.config.dateFormat) {
            case 'ISO':
                return now.toISOString();
            case 'LOCAL':
                return now.toLocaleString();
            case 'UTC':
                return now.toUTCString();
            default:
                return now.toISOString();
        }
    }

    /**
     * Format a date string for display
     * @param timestamp - The timestamp to format
     * @returns Formatted date string
     */
    private formatDate(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}

/**
 * Factory function to create a ChangeLog instance
 * @param config - Optional configuration
 * @returns New ChangeLog instance
 */
export function createChangeLog(config?: Partial<ChangeLogConfig>): ChangeLog {
    return new ChangeLog(config);
}
