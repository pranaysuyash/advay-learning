// Queue Generator for Game Quality System
// Generates priority-based work queues for game development

import type {
    PriorityScore,
    PriorityLevel,
    Game,
    CatalogEntry,
    QueueEntry,
} from '../types';
import type { UnifiedPriorityEntry } from '../integration/integrationEngine';

export interface DeveloperAvailability {
    developerId: string;
    availableHoursPerWeek: number;
    skills: string[];
    startDate: string;
}

export interface QueueConfig {
    maxEntries?: number;
    includeDependencies?: boolean;
    considerDeveloperAvailability?: boolean;
    developers?: DeveloperAvailability[];
}

export interface QueueChangeEvent {
    gameId: string;
    oldPriority: PriorityLevel | null;
    newPriority: PriorityLevel;
    timestamp: string;
    reason: string;
}

export interface QueueNotification {
    type: 'priority_change' | 'queue_reorder' | 'new_entry';
    message: string;
    timestamp: string;
    affectedGames: string[];
}

/**
 * Queue Generator for priority-based work queue management
 * 
 * Requirements addressed:
 * - 6.1: Sort games by priority score (P0 first, then P1, P2, P3)
 * - 6.3: P0 games sorted by Educational_Impact DESC, Implementation_Effort ASC
 * - 6.4: Queue entries include Game_Name, Priority, Estimated_Effort_Hours, Dependencies, Recommended_Start_Date
 * - 6.5: Automatically reorder queue on priority changes, notify development team
 */
export class QueueGenerator {
    private priorityOrder: Record<PriorityLevel, number> = {
        'P0': 0,
        'P1': 1,
        'P2': 2,
        'P3': 3,
    };

    private changeHistory: QueueChangeEvent[] = [];
    private notifications: QueueNotification[] = [];

    /**
     * Generate a work queue from priority scores
     * Requirements 6.1, 6.3, 6.4
     */
    public generateQueue(
        priorityScores: PriorityScore[],
        games: Map<string, Game | CatalogEntry>,
        config: QueueConfig = {}
    ): QueueEntry[] {
        const {
            maxEntries = 100,
            includeDependencies = true,
            considerDeveloperAvailability = false,
            developers = [],
        } = config;

        // Create unified entries from priority scores and game data
        const entries = this.createUnifiedEntries(priorityScores, games);

        // Sort by priority level (P0 first, then P1, P2, P3)
        const sortedEntries = this.sortByPriority(entries);

        // For P0 games, apply secondary sorting by Educational_Impact DESC, Implementation_Effort ASC
        const p0SortedEntries = this.sortP0GamesByImpactAndEffort(sortedEntries);

        // Consider developer availability if configured
        const availabilityAdjustedEntries = considerDeveloperAvailability
            ? this.considerDeveloperAvailability(p0SortedEntries, developers)
            : p0SortedEntries;

        // Generate queue entries with all required fields
        const queueEntries = this.generateQueueEntries(
            availabilityAdjustedEntries,
            games,
            includeDependencies
        );

        return queueEntries.slice(0, maxEntries);
    }

    /**
     * Generate queue from UnifiedPriorityEntry (from Integration Module)
     */
    public generateQueueFromUnifiedEntries(
        unifiedEntries: UnifiedPriorityEntry[],
        games: Map<string, Game | CatalogEntry>,
        config: QueueConfig = {}
    ): QueueEntry[] {
        const {
            maxEntries = 100,
            includeDependencies = true,
            considerDeveloperAvailability = false,
            developers = [],
        } = config;

        // Sort by priority level
        const sortedEntries = this.sortUnifiedEntriesByPriority(unifiedEntries);

        // Apply P0 secondary sorting
        const p0SortedEntries = this.sortP0UnifiedEntriesByImpactAndEffort(sortedEntries);

        // Consider developer availability if configured
        const availabilityAdjustedEntries = considerDeveloperAvailability
            ? this.considerDeveloperAvailability(p0SortedEntries, developers)
            : p0SortedEntries;

        // Generate queue entries
        const queueEntries = this.generateQueueEntriesFromUnified(
            availabilityAdjustedEntries,
            games,
            includeDependencies
        );

        return queueEntries.slice(0, maxEntries);
    }

    /**
     * Create unified entries from priority scores and game data
     */
    private createUnifiedEntries(
        priorityScores: PriorityScore[],
        games: Map<string, Game | CatalogEntry>
    ): UnifiedPriorityEntry[] {
        return priorityScores.map(score => {
            const game = games.get(score.gameId);
            return {
                gameId: score.gameId,
                gameName: game?.name || score.gameId,
                combinedScore: score.totalScore,
                auditScore: 0, // Will be populated from audit data if available
                catalogPriority: score.totalScore,
                priorityLevel: score.priorityLevel,
                educationalImpact: score.educationalImpact,
                implementationEffort: score.implementationEffort,
            };
        });
    }

    /**
     * Sort entries by priority level (P0 first, then P1, P2, P3)
     * Requirement 6.1
     */
    public sortByPriority(entries: UnifiedPriorityEntry[]): UnifiedPriorityEntry[] {
        return [...entries].sort((a, b) => {
            const priorityA = this.priorityOrder[a.priorityLevel as PriorityLevel] ?? 4;
            const priorityB = this.priorityOrder[b.priorityLevel as PriorityLevel] ?? 4;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // Secondary sort by combined score descending
            return b.combinedScore - a.combinedScore;
        });
    }

    /**
     * Sort unified entries by priority level
     */
    private sortUnifiedEntriesByPriority(entries: UnifiedPriorityEntry[]): UnifiedPriorityEntry[] {
        return [...entries].sort((a, b) => {
            const priorityA = this.priorityOrder[a.priorityLevel as PriorityLevel] ?? 4;
            const priorityB = this.priorityOrder[b.priorityLevel as PriorityLevel] ?? 4;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // Secondary sort by combined score descending
            return b.combinedScore - a.combinedScore;
        });
    }

    /**
     * Sort P0 games by Educational_Impact DESC, Implementation_Effort ASC
     * Requirement 6.3
     */
    public sortP0GamesByImpactAndEffort(entries: UnifiedPriorityEntry[]): UnifiedPriorityEntry[] {
        const p0Entries = entries.filter(e => e.priorityLevel === 'P0');
        const otherEntries = entries.filter(e => e.priorityLevel !== 'P0');

        // Sort P0 by Educational_Impact DESC, then Implementation_Effort ASC
        p0Entries.sort((a, b) => {
            // Primary: Educational_Impact DESC
            const impactA = a.educationalImpact ?? 0;
            const impactB = b.educationalImpact ?? 0;
            if (impactB !== impactA) {
                return impactB - impactA;
            }

            // Secondary: Implementation_Effort ASC (lower effort first)
            const effortA = a.implementationEffort ?? 0;
            const effortB = b.implementationEffort ?? 0;
            return effortA - effortB;
        });

        // Sort non-P0 entries by priority (P1, P2, P3)
        otherEntries.sort((a, b) => {
            const priorityA = this.priorityOrder[a.priorityLevel as PriorityLevel] ?? 4;
            const priorityB = this.priorityOrder[b.priorityLevel as PriorityLevel] ?? 4;
            return priorityA - priorityB;
        });

        return [...p0Entries, ...otherEntries];
    }

    /**
     * Sort P0 unified entries by Educational_Impact DESC, Implementation_Effort ASC
     */
    private sortP0UnifiedEntriesByImpactAndEffort(entries: UnifiedPriorityEntry[]): UnifiedPriorityEntry[] {
        const p0Entries = entries.filter(e => e.priorityLevel === 'P0');
        const otherEntries = entries.filter(e => e.priorityLevel !== 'P0');

        p0Entries.sort((a, b) => {
            const impactA = a.educationalImpact ?? 0;
            const impactB = b.educationalImpact ?? 0;
            if (impactB !== impactA) {
                return impactB - impactA;
            }

            const effortA = a.implementationEffort ?? 0;
            const effortB = b.implementationEffort ?? 0;
            return effortA - effortB;
        });

        // Sort non-P0 entries by priority (P1, P2, P3)
        otherEntries.sort((a, b) => {
            const priorityA = this.priorityOrder[a.priorityLevel as PriorityLevel] ?? 4;
            const priorityB = this.priorityOrder[b.priorityLevel as PriorityLevel] ?? 4;
            return priorityA - priorityB;
        });

        return [...p0Entries, ...otherEntries];
    }

    /**
     * Consider developer availability when ordering queue
     */
    private considerDeveloperAvailability(
        entries: UnifiedPriorityEntry[],
        developers: DeveloperAvailability[]
    ): UnifiedPriorityEntry[] {
        if (developers.length === 0) {
            return entries;
        }

        // Calculate total available hours
        const totalAvailableHours = developers.reduce(
            (sum, dev) => sum + dev.availableHoursPerWeek,
            0
        );

        // Adjust order based on available capacity
        return [...entries].sort((a, b) => {
            const effortA = a.implementationEffort ?? 50;
            const effortB = b.implementationEffort ?? 50;

            // Games requiring less effort get priority when capacity is limited
            const capacityRatio = totalAvailableHours / 100;
            const adjustedEffortA = effortA * (1 - capacityRatio * 0.3);
            const adjustedEffortB = effortB * (1 - capacityRatio * 0.3);

            return adjustedEffortA - adjustedEffortB;
        });
    }

    /**
     * Generate queue entries with all required fields
     * Requirement 6.4
     */
    private generateQueueEntries(
        entries: UnifiedPriorityEntry[],
        games: Map<string, Game | CatalogEntry>,
        includeDependencies: boolean
    ): QueueEntry[] {
        return entries.map((entry, index) => {
            const estimatedEffortHours = this.estimateEffortHours(entry);
            const dependencies = this.getDependencies(entry.gameId, games, includeDependencies);
            const recommendedStartDate = this.calculateRecommendedStartDate(index, dependencies);

            return {
                gameId: entry.gameId,
                gameName: entry.gameName,
                priority: entry.priorityLevel as PriorityLevel,
                estimatedEffortHours,
                dependencies,
                recommendedStartDate,
                status: 'pending',
            };
        });
    }

    /**
     * Generate queue entries from unified entries
     */
    private generateQueueEntriesFromUnified(
        entries: UnifiedPriorityEntry[],
        games: Map<string, Game | CatalogEntry>,
        includeDependencies: boolean
    ): QueueEntry[] {
        return entries.map((entry, index) => {
            const estimatedEffortHours = this.estimateEffortHours(entry);
            const dependencies = this.getDependencies(entry.gameId, games, includeDependencies);
            const recommendedStartDate = this.calculateRecommendedStartDate(index, dependencies);

            return {
                gameId: entry.gameId,
                gameName: entry.gameName,
                priority: entry.priorityLevel as PriorityLevel,
                estimatedEffortHours,
                dependencies,
                recommendedStartDate,
                status: 'pending',
            };
        });
    }

    /**
     * Estimate effort hours based on implementation effort score
     */
    private estimateEffortHours(entry: UnifiedPriorityEntry): number {
        // Convert implementation effort score to hours (inverse relationship)
        // Higher effort score = lower hours (easier to implement)
        const effortScore = entry.implementationEffort ?? 50;

        // Effort score 100 = 2 hours, effort score 0 = 40 hours
        const hours = Math.round(40 - (effortScore / 100) * 38);
        return Math.max(2, Math.min(40, hours));
    }

    /**
     * Get dependencies for a game
     */
    private getDependencies(
        gameId: string,
        games: Map<string, Game | CatalogEntry>,
        includeDependencies: boolean
    ): string[] {
        if (!includeDependencies) {
            return [];
        }

        const game = games.get(gameId);
        if (!game) {
            return [];
        }

        // Extract dependencies from game data
        const dependencies: string[] = [];

        if ('requiredTechnologies' in game) {
            const techDeps = game.requiredTechnologies
                ?.filter((tech: string) => tech.includes('dependency'))
                .map((tech: string) => tech.replace('dependency:', '')) || [];
            dependencies.push(...techDeps);
        }

        return dependencies;
    }

    /**
     * Calculate recommended start date based on queue position and dependencies
     */
    private calculateRecommendedStartDate(
        queuePosition: number,
        dependencies: string[]
    ): string {
        const startDate = new Date();

        // Add days based on queue position (1 week per game ahead)
        const daysToAdd = queuePosition * 7;
        startDate.setDate(startDate.getDate() + daysToAdd);

        // If there are dependencies, add additional time
        if (dependencies.length > 0) {
            startDate.setDate(startDate.getDate() + dependencies.length * 3);
        }

        return startDate.toISOString().split('T')[0];
    }

    /**
     * Handle priority change and automatically reorder queue
     * Requirement 6.5
     */
    public handlePriorityChange(
        gameId: string,
        oldPriority: PriorityLevel | null,
        newPriority: PriorityLevel,
        reason: string,
        currentQueue: QueueEntry[],
        games: Map<string, Game | CatalogEntry>
    ): QueueEntry[] {
        // Log the change
        const changeEvent: QueueChangeEvent = {
            gameId,
            oldPriority,
            newPriority,
            timestamp: new Date().toISOString(),
            reason,
        };
        this.changeHistory.push(changeEvent);

        // Find and update the entry in the queue
        const updatedQueue = currentQueue.map(entry => {
            if (entry.gameId === gameId) {
                return { ...entry, priority: newPriority };
            }
            return entry;
        });

        // Re-sort the queue based on new priority
        const priorityScores = updatedQueue.map(entry => this.queueEntryToPriorityScore(entry));
        const gamesMap = this.queueEntriesToGameMap(updatedQueue, games);
        const sortedEntries = this.createUnifiedEntries(priorityScores, gamesMap);
        const reorderedEntries = this.sortByPriority(sortedEntries);
        const p0Sorted = this.sortP0GamesByImpactAndEffort(reorderedEntries);

        // Generate new queue entries
        const newQueue = this.generateQueueEntries(p0Sorted, gamesMap, true);

        // Notify development team
        this.sendNotification({
            type: 'priority_change',
            message: `Priority changed for ${gameId}: ${oldPriority || 'N/A'} -> ${newPriority}`,
            timestamp: new Date().toISOString(),
            affectedGames: [gameId],
        });

        return newQueue;
    }

    /**
     * Reorder queue when priorities change
     */
    public reorderQueue(
        currentQueue: QueueEntry[],
        games: Map<string, Game | CatalogEntry>
    ): QueueEntry[] {
        // Convert queue entries to priority scores
        const priorityScores = currentQueue.map(entry => this.queueEntryToPriorityScore(entry));
        const gamesMap = this.queueEntriesToGameMap(currentQueue, games);

        // Re-sort the queue
        const sortedEntries = this.createUnifiedEntries(priorityScores, gamesMap);
        const reorderedEntries = this.sortByPriority(sortedEntries);
        const p0Sorted = this.sortP0GamesByImpactAndEffort(reorderedEntries);

        // Generate new queue entries
        return this.generateQueueEntries(p0Sorted, gamesMap, true);
    }

    /**
     * Convert queue entry to priority score
     */
    private queueEntryToPriorityScore(entry: QueueEntry): PriorityScore {
        return {
            gameId: entry.gameId,
            totalScore: this.priorityToScore(entry.priority),
            educationalImpact: 50,
            userDemand: 50,
            implementationEffort: this.hoursToEffortScore(entry.estimatedEffortHours),
            strategicAlignment: 50,
            priorityLevel: entry.priority,
        };
    }

    /**
     * Convert queue entries to game map
     */
    private queueEntriesToGameMap(
        queueEntries: QueueEntry[],
        existingGames: Map<string, Game | CatalogEntry>
    ): Map<string, Game | CatalogEntry> {
        const gameMap = new Map<string, Game | CatalogEntry>(existingGames);

        for (const entry of queueEntries) {
            if (!gameMap.has(entry.gameId)) {
                gameMap.set(entry.gameId, {
                    id: entry.gameId,
                    name: entry.gameName,
                    description: '',
                    category: '',
                    ageRange: '',
                    difficulty: 'Medium' as const,
                    estimatedTime: entry.estimatedEffortHours,
                    requiredTechnologies: [],
                    successCriteria: [],
                    educationalObjectives: [],
                    skillsDeveloped: [],
                    isImplemented: false,
                    lastUpdated: new Date().toISOString(),
                });
            }
        }

        return gameMap;
    }

    /**
     * Convert priority level to score
     */
    private priorityToScore(priority: PriorityLevel): number {
        switch (priority) {
            case 'P0': return 95;
            case 'P1': return 80;
            case 'P2': return 60;
            case 'P3': return 30;
            default: return 50;
        }
    }

    /**
     * Convert hours to effort score
     */
    private hoursToEffortScore(hours: number): number {
        // Inverse relationship: more hours = lower effort score
        return Math.max(0, Math.min(100, 100 - (hours * 2.5)));
    }

    /**
     * Send notification to development team
     */
    private sendNotification(notification: QueueNotification): void {
        this.notifications.push(notification);
    }

    /**
     * Get change history
     */
    public getChangeHistory(): QueueChangeEvent[] {
        return [...this.changeHistory];
    }

    /**
     * Get notifications
     */
    public getNotifications(): QueueNotification[] {
        return [...this.notifications];
    }

    /**
     * Clear change history
     */
    public clearChangeHistory(): void {
        this.changeHistory = [];
    }

    /**
     * Clear notifications
     */
    public clearNotifications(): void {
        this.notifications = [];
    }

    /**
     * Get queue statistics
     */
    public getQueueStatistics(queue: QueueEntry[]): {
        totalEntries: number;
        byPriority: Record<PriorityLevel, number>;
        totalEstimatedHours: number;
        averageEffortHours: number;
    } {
        const byPriority: Record<PriorityLevel, number> = {
            'P0': 0,
            'P1': 0,
            'P2': 0,
            'P3': 0,
        };

        let totalHours = 0;

        for (const entry of queue) {
            byPriority[entry.priority]++;
            totalHours += entry.estimatedEffortHours;
        }

        return {
            totalEntries: queue.length,
            byPriority,
            totalEstimatedHours: totalHours,
            averageEffortHours: queue.length > 0 ? totalHours / queue.length : 0,
        };
    }
}
