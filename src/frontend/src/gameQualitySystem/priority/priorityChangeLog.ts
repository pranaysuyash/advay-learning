// Priority Change Logging Module
// Logs priority changes with timestamps and maintains priority list updates
// Validates: Requirement 3.6

import type { PriorityScore, PriorityLevel, GameId } from '../types';

/**
 * Represents a single priority change event
 */
export interface PriorityChangeEvent {
    gameId: GameId;
    previousPriority: PriorityLevel;
    newPriority: PriorityLevel;
    previousScore: number;
    newScore: number;
    timestamp: string;
    reason: string;
    source: 'audit' | 'user_feedback' | 'metrics_update' | 'manual' | 'catalog_update';
}

/**
 * Represents the current state of a game's priority tracking
 */
export interface TrackedGamePriority {
    gameId: GameId;
    currentPriority: PriorityLevel;
    currentScore: number;
    lastUpdated: string;
    changeHistory: PriorityChangeEvent[];
}

/**
 * Priority list entry for ordered priority tracking
 */
export interface PriorityListEntry {
    gameId: GameId;
    priority: PriorityLevel;
    score: number;
    lastUpdated: string;
}

/**
 * Complete priority list with metadata
 */
export interface PriorityList {
    entries: PriorityListEntry[];
    lastUpdated: string;
    totalGames: number;
}

/**
 * Configuration for priority change logging
 */
export interface PriorityChangeConfig {
    enableChangeDetection: boolean;
    logRetentionDays: number;
    notifyOnPriorityChange: boolean;
}

/**
 * Default configuration for priority change logging
 */
export const DEFAULT_PRIORITY_CHANGE_CONFIG: PriorityChangeConfig = {
    enableChangeDetection: true,
    logRetentionDays: 90,
    notifyOnPriorityChange: false,
};

/**
 * Result of a priority update operation
 */
export interface PriorityUpdateResult {
    success: boolean;
    gameId: GameId;
    previousPriority: PriorityLevel | null;
    newPriority: PriorityLevel;
    changeLogged: boolean;
    priorityListUpdated: boolean;
    error?: string;
}

/**
 * PriorityChangeLogger handles logging of priority changes and maintaining priority lists
 */
export class PriorityChangeLogger {
    private changeLog: PriorityChangeEvent[] = [];
    private trackedGames: Map<GameId, TrackedGamePriority> = new Map();
    private priorityList: PriorityList;
    private config: PriorityChangeConfig;

    constructor(config: Partial<PriorityChangeConfig> = {}) {
        this.config = { ...DEFAULT_PRIORITY_CHANGE_CONFIG, ...config };
        this.priorityList = {
            entries: [],
            lastUpdated: new Date().toISOString(),
            totalGames: 0,
        };
    }

    /**
     * Records a priority change for a game
     */
    public logPriorityChange(
        gameId: GameId,
        previousScore: number,
        newScore: number,
        previousPriority: PriorityLevel,
        newPriority: PriorityLevel,
        reason: string,
        source: PriorityChangeEvent['source'] = 'manual'
    ): PriorityChangeEvent {
        const event: PriorityChangeEvent = {
            gameId,
            previousPriority,
            newPriority,
            previousScore,
            newScore,
            timestamp: new Date().toISOString(),
            reason,
            source,
        };

        this.changeLog.push(event);
        this.updateTrackedGame(event);
        this.updatePriorityList(gameId, newPriority, newScore);

        return event;
    }

    /**
     * Updates the tracked game priority state
     */
    private updateTrackedGame(event: PriorityChangeEvent): void {
        const existing = this.trackedGames.get(event.gameId);

        if (existing) {
            existing.currentPriority = event.newPriority;
            existing.currentScore = event.newScore;
            existing.lastUpdated = event.timestamp;
            existing.changeHistory.push(event);
        } else {
            this.trackedGames.set(event.gameId, {
                gameId: event.gameId,
                currentPriority: event.newPriority,
                currentScore: event.newScore,
                lastUpdated: event.timestamp,
                changeHistory: [event],
            });
        }
    }

    /**
     * Updates the priority list when a game's priority changes
     */
    private updatePriorityList(gameId: GameId, priority: PriorityLevel, score: number): void {
        const existingIndex = this.priorityList.entries.findIndex(
            (entry) => entry.gameId === gameId
        );

        const entry: PriorityListEntry = {
            gameId,
            priority,
            score,
            lastUpdated: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
            this.priorityList.entries[existingIndex] = entry;
        } else {
            this.priorityList.entries.push(entry);
        }

        this.reorderPriorityList();
        this.priorityList.lastUpdated = new Date().toISOString();
        this.priorityList.totalGames = this.priorityList.entries.length;
    }

    /**
     * Reorders the priority list by priority level (P0 first, then P1, P2, P3)
     * Within the same priority level, orders by score descending
     */
    private reorderPriorityList(): void {
        const priorityOrder: Record<PriorityLevel, number> = {
            P0: 0,
            P1: 1,
            P2: 2,
            P3: 3,
        };

        this.priorityList.entries.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) {
                return priorityDiff;
            }
            return b.score - a.score;
        });
    }

    /**
     * Calculates a new priority score and detects if it changed
     * Returns null if change detection is disabled
     */
    public calculateAndDetectChange(
        gameId: GameId,
        previousScore: number,
        newScore: number,
        reason: string,
        source: PriorityChangeEvent['source'] = 'manual'
    ): PriorityUpdateResult {
        if (!this.config.enableChangeDetection) {
            return {
                success: true,
                gameId,
                previousPriority: null,
                newPriority: this.determinePriorityLevel(newScore),
                changeLogged: false,
                priorityListUpdated: false,
            };
        }

        const previousPriority = this.determinePriorityLevel(previousScore);
        const newPriority = this.determinePriorityLevel(newScore);

        if (previousPriority === newPriority) {
            return {
                success: true,
                gameId,
                previousPriority,
                newPriority,
                changeLogged: false,
                priorityListUpdated: false,
            };
        }

        this.logPriorityChange(
            gameId,
            previousScore,
            newScore,
            previousPriority,
            newPriority,
            reason,
            source
        );

        return {
            success: true,
            gameId,
            previousPriority,
            newPriority,
            changeLogged: true,
            priorityListUpdated: true,
        };
    }

    /**
     * Determines the priority level from a score
     */
    private determinePriorityLevel(score: number): PriorityLevel {
        if (score >= 90) return 'P0';
        if (score >= 70) return 'P1';
        if (score >= 50) return 'P2';
        return 'P3';
    }

    /**
     * Gets the change log for a specific game
     */
    public getGameChangeHistory(gameId: GameId): PriorityChangeEvent[] {
        const tracked = this.trackedGames.get(gameId);
        return tracked?.changeHistory || [];
    }

    /**
     * Gets all change events
     */
    public getAllChangeEvents(): PriorityChangeEvent[] {
        return [...this.changeLog];
    }

    /**
     * Gets the current priority list
     */
    public getPriorityList(): PriorityList {
        return { ...this.priorityList };
    }

    /**
     * Gets games by priority level
     */
    public getGamesByPriority(priority: PriorityLevel): PriorityListEntry[] {
        return this.priorityList.entries.filter((entry) => entry.priority === priority);
    }

    /**
     * Gets the current tracked state for a game
     */
    public getTrackedGame(gameId: GameId): TrackedGamePriority | undefined {
        return this.trackedGames.get(gameId);
    }

    /**
     * Gets the count of games by priority level
     */
    public getPriorityDistribution(): Record<PriorityLevel, number> {
        const distribution: Record<PriorityLevel, number> = {
            P0: 0,
            P1: 0,
            P2: 0,
            P3: 0,
        };

        for (const entry of this.priorityList.entries) {
            distribution[entry.priority]++;
        }

        return distribution;
    }

    /**
     * Clears all change logs (respects retention policy)
     */
    public clearOldLogs(): number {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.logRetentionDays);

        const beforeCount = this.changeLog.length;
        this.changeLog = this.changeLog.filter(
            (event) => new Date(event.timestamp) > cutoffDate
        );

        return beforeCount - this.changeLog.length;
    }

    /**
     * Gets statistics about priority changes
     */
    public getChangeStatistics(): {
        totalChanges: number;
        changesBySource: Record<string, number>;
        changesByPriority: Record<string, number>;
        recentChangesCount: number;
    } {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const changesBySource: Record<string, number> = {};
        const changesByPriority: Record<string, number> = {};

        for (const event of this.changeLog) {
            changesBySource[event.source] = (changesBySource[event.source] || 0) + 1;

            const changeKey = `${event.previousPriority}->${event.newPriority}`;
            changesByPriority[changeKey] = (changesByPriority[changeKey] || 0) + 1;
        }

        const recentChangesCount = this.changeLog.filter(
            (event) => new Date(event.timestamp) > oneDayAgo
        ).length;

        return {
            totalChanges: this.changeLog.length,
            changesBySource,
            changesByPriority,
            recentChangesCount,
        };
    }

    /**
     * Exports the change log as a JSON string
     */
    public exportChangeLog(): string {
        return JSON.stringify(this.changeLog, null, 2);
    }

    /**
     * Imports a change log from JSON
     */
    public importChangeLog(json: string): number {
        try {
            const events = JSON.parse(json) as PriorityChangeEvent[];
            let importedCount = 0;

            for (const event of events) {
                if (this.isValidEvent(event)) {
                    this.changeLog.push(event);
                    this.updateTrackedGame(event);
                    importedCount++;
                }
            }

            return importedCount;
        } catch {
            return 0;
        }
    }

    /**
     * Validates a priority change event
     */
    private isValidEvent(event: PriorityChangeEvent): boolean {
        return !!(
            event.gameId &&
            event.previousPriority &&
            event.newPriority &&
            typeof event.previousScore === 'number' &&
            typeof event.newScore === 'number' &&
            event.timestamp &&
            event.reason
        );
    }
}

/**
 * Creates a priority change event from a PriorityScore
 */
export function createPriorityChangeEvent(
    gameId: GameId,
    previousScore: PriorityScore,
    newScore: PriorityScore,
    reason: string,
    source: PriorityChangeEvent['source'] = 'manual'
): PriorityChangeEvent {
    return {
        gameId,
        previousPriority: previousScore.priorityLevel,
        newPriority: newScore.priorityLevel,
        previousScore: previousScore.totalScore,
        newScore: newScore.totalScore,
        timestamp: new Date().toISOString(),
        reason,
        source,
    };
}

/**
 * Determines if a priority level change occurred
 */
export function hasPriorityChanged(
    previousScore: PriorityScore,
    newScore: PriorityScore
): boolean {
    return previousScore.priorityLevel !== newScore.priorityLevel;
}
