// Queue Generator Tests for Game Quality System

import { describe, it, expect, beforeEach } from 'vitest';
import { QueueGenerator, QueueConfig } from './queueGenerator';
import type { PriorityScore, Game, CatalogEntry, QueueEntry, PriorityLevel } from '../types';
import type { UnifiedPriorityEntry } from '../integration/integrationEngine';

describe('QueueGenerator', () => {
    let queueGenerator: QueueGenerator;

    beforeEach(() => {
        queueGenerator = new QueueGenerator();
    });

    // Helper function to create test games
    const createTestGame = (id: string, name: string, priority: PriorityLevel): Game => ({
        id,
        name,
        description: `Description for ${name}`,
        category: 'Literacy',
        ageRange: '5-7',
        difficulty: 'Medium' as const,
        estimatedTime: 8,
        requiredTechnologies: ['React', 'TypeScript'],
        successCriteria: ['Complete all levels', 'Score above 80%'],
        isImplemented: false,
        educationalObjectives: ['Learn letters', 'Practice spelling'],
        lastUpdated: new Date().toISOString(),
    });

    // Helper function to create test priority scores
    const createTestPriorityScore = (
        gameId: string,
        totalScore: number,
        priorityLevel: PriorityLevel,
        educationalImpact: number = 50,
        implementationEffort: number = 50
    ): PriorityScore => ({
        gameId,
        totalScore,
        educationalImpact,
        userDemand: 50,
        implementationEffort,
        strategicAlignment: 50,
        priorityLevel,
    });

    // ============================================
    // 7.1 Sorting Logic Tests
    // ============================================

    describe('7.1: Sorting Logic', () => {
        it('should sort games by priority score (P0 first, then P1, P2, P3)', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 30, 'P3'),
                createTestPriorityScore('game2', 95, 'P0'),
                createTestPriorityScore('game3', 60, 'P2'),
                createTestPriorityScore('game4', 80, 'P1'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P3'));
            games.set('game2', createTestGame('game2', 'Game 2', 'P0'));
            games.set('game3', createTestGame('game3', 'Game 3', 'P2'));
            games.set('game4', createTestGame('game4', 'Game 4', 'P1'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            expect(queue[0].priority).toBe('P0');
            expect(queue[1].priority).toBe('P1');
            expect(queue[2].priority).toBe('P2');
            expect(queue[3].priority).toBe('P3');
        });

        it('should maintain relative order within same priority level', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0', 80, 30),
                createTestPriorityScore('game2', 92, 'P0', 70, 20),
                createTestPriorityScore('game3', 98, 'P0', 90, 40),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P0'));
            games.set('game2', createTestGame('game2', 'Game 2', 'P0'));
            games.set('game3', createTestGame('game3', 'Game 3', 'P0'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            // Within P0, should be sorted by Educational_Impact DESC
            expect(queue[0].gameId).toBe('game3'); // Highest impact (90)
            expect(queue[1].gameId).toBe('game1'); // Medium impact (80)
            expect(queue[2].gameId).toBe('game2'); // Lowest impact (70)
        });

        it('should handle empty priority scores', () => {
            const games = new Map<string, Game | CatalogEntry>();
            const queue = queueGenerator.generateQueue([], games);

            expect(queue).toHaveLength(0);
        });

        it('should handle single game', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P0'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            expect(queue).toHaveLength(1);
            expect(queue[0].gameId).toBe('game1');
        });

        it('should respect maxEntries configuration', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0'),
                createTestPriorityScore('game2', 85, 'P1'),
                createTestPriorityScore('game3', 75, 'P1'),
                createTestPriorityScore('game4', 65, 'P2'),
                createTestPriorityScore('game5', 55, 'P2'),
                createTestPriorityScore('game6', 45, 'P3'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            for (let i = 1; i <= 6; i++) {
                games.set(`game${i}`, createTestGame(`game${i}`, `Game ${i}`, 'P0'));
            }

            const config: QueueConfig = { maxEntries: 3 };
            const queue = queueGenerator.generateQueue(priorityScores, games, config);

            expect(queue).toHaveLength(3);
        });
    });

    // ============================================
    // 7.2: P0 Sorting Logic Tests
    // ============================================

    describe('7.2: P0 Sorting Logic', () => {
        it('should sort P0 games by Educational_Impact DESC', () => {
            const entries: UnifiedPriorityEntry[] = [
                { gameId: 'g1', gameName: 'Game 1', combinedScore: 95, auditScore: 20, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 60, implementationEffort: 50 },
                { gameId: 'g2', gameName: 'Game 2', combinedScore: 95, auditScore: 20, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 90, implementationEffort: 50 },
                { gameId: 'g3', gameName: 'Game 3', combinedScore: 95, auditScore: 20, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 75, implementationEffort: 50 },
            ];

            const sorted = queueGenerator.sortP0GamesByImpactAndEffort(entries);

            expect(sorted[0].gameId).toBe('g2'); // Highest impact (90)
            expect(sorted[1].gameId).toBe('g3'); // Medium impact (75)
            expect(sorted[2].gameId).toBe('g1'); // Lowest impact (60)
        });

        it('should sort P0 games by Implementation_Effort ASC when Educational_Impact is equal', () => {
            const entries: UnifiedPriorityEntry[] = [
                { gameId: 'g1', gameName: 'Game 1', combinedScore: 95, auditScore: 20, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 80, implementationEffort: 60 },
                { gameId: 'g2', gameName: 'Game 2', combinedScore: 95, auditScore: 20, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 80, implementationEffort: 30 },
                { gameId: 'g3', gameName: 'Game 3', combinedScore: 95, auditScore: 20, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 80, implementationEffort: 45 },
            ];

            const sorted = queueGenerator.sortP0GamesByImpactAndEffort(entries);

            // Same impact, sorted by effort ASC (lower effort first)
            expect(sorted[0].gameId).toBe('g2'); // Effort 30 (lowest)
            expect(sorted[1].gameId).toBe('g3'); // Effort 45
            expect(sorted[2].gameId).toBe('g1'); // Effort 60 (highest)
        });

        it('should not affect non-P0 games order', () => {
            const entries: UnifiedPriorityEntry[] = [
                { gameId: 'g1', gameName: 'Game 1', combinedScore: 30, auditScore: 10, catalogPriority: 30, priorityLevel: 'P3', educationalImpact: 40, implementationEffort: 80 },
                { gameId: 'g2', gameName: 'Game 2', combinedScore: 95, auditScore: 20, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 90, implementationEffort: 50 },
                { gameId: 'g3', gameName: 'Game 3', combinedScore: 60, auditScore: 15, catalogPriority: 60, priorityLevel: 'P2', educationalImpact: 50, implementationEffort: 60 },
                { gameId: 'g4', gameName: 'Game 4', combinedScore: 80, auditScore: 18, catalogPriority: 80, priorityLevel: 'P1', educationalImpact: 70, implementationEffort: 40 },
            ];

            const sorted = queueGenerator.sortP0GamesByImpactAndEffort(entries);

            // P0 games should be first, sorted by impact DESC
            expect(sorted[0].priorityLevel).toBe('P0');
            expect(sorted[1].priorityLevel).toBe('P1');
            expect(sorted[2].priorityLevel).toBe('P2');
            expect(sorted[3].priorityLevel).toBe('P3');
        });

        it('should handle mixed priority levels correctly', () => {
            const entries: UnifiedPriorityEntry[] = [
                { gameId: 'p3_1', gameName: 'P3 Game', combinedScore: 30, auditScore: 10, catalogPriority: 30, priorityLevel: 'P3', educationalImpact: 30, implementationEffort: 90 },
                { gameId: 'p0_1', gameName: 'P0 Game 1', combinedScore: 95, auditScore: 22, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 85, implementationEffort: 40 },
                { gameId: 'p1_1', gameName: 'P1 Game', combinedScore: 80, auditScore: 18, catalogPriority: 80, priorityLevel: 'P1', educationalImpact: 70, implementationEffort: 50 },
                { gameId: 'p0_2', gameName: 'P0 Game 2', combinedScore: 92, auditScore: 21, catalogPriority: 92, priorityLevel: 'P0', educationalImpact: 95, implementationEffort: 30 },
                { gameId: 'p2_1', gameName: 'P2 Game', combinedScore: 55, auditScore: 14, catalogPriority: 55, priorityLevel: 'P2', educationalImpact: 45, implementationEffort: 70 },
            ];

            const sorted = queueGenerator.sortP0GamesByImpactAndEffort(entries);

            // All P0 games should be first
            const p0Games = sorted.filter(e => e.priorityLevel === 'P0');
            expect(p0Games).toHaveLength(2);

            // P0 games sorted by impact DESC
            expect(p0Games[0].gameId).toBe('p0_2'); // Impact 95
            expect(p0Games[1].gameId).toBe('p0_1'); // Impact 85

            // Then P1, P2, P3
            expect(sorted[2].priorityLevel).toBe('P1');
            expect(sorted[3].priorityLevel).toBe('P2');
            expect(sorted[4].priorityLevel).toBe('P3');
        });
    });

    // ============================================
    // 7.3: Queue Entry Generation Tests
    // ============================================

    describe('7.3: Queue Entry Generation', () => {
        it('should generate entries with Game_Name', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Test Game Name', 'P0'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            expect(queue[0].gameName).toBe('Test Game Name');
        });

        it('should generate entries with Priority', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0'),
                createTestPriorityScore('game2', 80, 'P1'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P0'));
            games.set('game2', createTestGame('game2', 'Game 2', 'P1'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            expect(queue[0].priority).toBe('P0');
            expect(queue[1].priority).toBe('P1');
        });

        it('should generate entries with Estimated_Effort_Hours', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0', 50, 80), // High effort score = low hours
                createTestPriorityScore('game2', 50, 'P3', 50, 20), // Low effort score = high hours
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P0'));
            games.set('game2', createTestGame('game2', 'Game 2', 'P3'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            // Higher implementation effort score should result in lower hours
            expect(queue[0].estimatedEffortHours).toBeLessThan(queue[1].estimatedEffortHours);
        });

        it('should generate entries with Dependencies', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', {
                ...createTestGame('game1', 'Game 1', 'P0'),
                requiredTechnologies: ['dependency:game2', 'dependency:game3'],
            });

            const queue = queueGenerator.generateQueue(priorityScores, games, { includeDependencies: true });

            expect(queue[0].dependencies).toContain('game2');
            expect(queue[0].dependencies).toContain('game3');
        });

        it('should generate entries with Recommended_Start_Date', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P0'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            // Should have a valid date string
            expect(queue[0].recommendedStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should set default status to pending', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 95, 'P0'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P0'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            expect(queue[0].status).toBe('pending');
        });

        it('should handle missing game data gracefully', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('missing_game', 95, 'P0'),
            ];

            const games = new Map<string, Game | CatalogEntry>();

            const queue = queueGenerator.generateQueue(priorityScores, games);

            expect(queue[0].gameName).toBe('missing_game'); // Falls back to gameId
            expect(queue[0].estimatedEffortHours).toBeGreaterThan(0);
        });
    });

    // ============================================
    // 7.6: Priority Change Handling Tests
    // ============================================

    describe('7.6: Priority Change Handling', () => {
        it('should automatically reorder queue on priority changes', () => {
            const initialPriorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 80, 'P1'),
                createTestPriorityScore('game2', 60, 'P2'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P1'));
            games.set('game2', createTestGame('game2', 'Game 2', 'P2'));

            const initialQueue = queueGenerator.generateQueue(initialPriorityScores, games);

            // Change game2 to P0
            const updatedQueue = queueGenerator.handlePriorityChange(
                'game2',
                'P2',
                'P0',
                'Increased priority due to user demand',
                initialQueue,
                games
            );

            // game2 should now be first
            expect(updatedQueue[0].gameId).toBe('game2');
            expect(updatedQueue[0].priority).toBe('P0');
        });

        it('should log priority changes in change history', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 80, 'P1'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P1'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            queueGenerator.handlePriorityChange(
                'game1',
                'P1',
                'P0',
                'Urgent requirement',
                queue,
                games
            );

            const history = queueGenerator.getChangeHistory();
            expect(history).toHaveLength(1);
            expect(history[0].gameId).toBe('game1');
            expect(history[0].oldPriority).toBe('P1');
            expect(history[0].newPriority).toBe('P0');
            expect(history[0].reason).toBe('Urgent requirement');
        });

        it('should send notification on priority change', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 80, 'P1'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P1'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            queueGenerator.handlePriorityChange(
                'game1',
                'P1',
                'P0',
                'Strategic priority',
                queue,
                games
            );

            const notifications = queueGenerator.getNotifications();
            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('priority_change');
            expect(notifications[0].affectedGames).toContain('game1');
        });

        it('should handle null old priority for new entries', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 80, 'P1'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P1'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            queueGenerator.handlePriorityChange(
                'game1',
                null,
                'P0',
                'New high priority',
                queue,
                games
            );

            const history = queueGenerator.getChangeHistory();
            expect(history[0].oldPriority).toBeNull();
        });

        it('should reorder queue when reorderQueue is called', () => {
            const initialQueue: QueueEntry[] = [
                { gameId: 'g1', gameName: 'Game 1', priority: 'P2', estimatedEffortHours: 20, dependencies: [], recommendedStartDate: '2024-01-01', status: 'pending' },
                { gameId: 'g2', gameName: 'Game 2', priority: 'P0', estimatedEffortHours: 10, dependencies: [], recommendedStartDate: '2024-01-08', status: 'pending' },
                { gameId: 'g3', gameName: 'Game 3', priority: 'P1', estimatedEffortHours: 15, dependencies: [], recommendedStartDate: '2024-01-15', status: 'pending' },
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('g1', createTestGame('g1', 'Game 1', 'P2'));
            games.set('g2', createTestGame('g2', 'Game 2', 'P0'));
            games.set('g3', createTestGame('g3', 'Game 3', 'P1'));

            const reorderedQueue = queueGenerator.reorderQueue(initialQueue, games);

            expect(reorderedQueue[0].priority).toBe('P0');
            expect(reorderedQueue[1].priority).toBe('P1');
            expect(reorderedQueue[2].priority).toBe('P2');
        });

        it('should clear change history', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 80, 'P1'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P1'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            queueGenerator.handlePriorityChange('game1', 'P1', 'P0', 'Test', queue, games);
            expect(queueGenerator.getChangeHistory()).toHaveLength(1);

            queueGenerator.clearChangeHistory();
            expect(queueGenerator.getChangeHistory()).toHaveLength(0);
        });

        it('should clear notifications', () => {
            const priorityScores: PriorityScore[] = [
                createTestPriorityScore('game1', 80, 'P1'),
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('game1', createTestGame('game1', 'Game 1', 'P1'));

            const queue = queueGenerator.generateQueue(priorityScores, games);

            queueGenerator.handlePriorityChange('game1', 'P1', 'P0', 'Test', queue, games);
            expect(queueGenerator.getNotifications()).toHaveLength(1);

            queueGenerator.clearNotifications();
            expect(queueGenerator.getNotifications()).toHaveLength(0);
        });
    });

    // ============================================
    // Queue Statistics Tests
    // ============================================

    describe('Queue Statistics', () => {
        it('should return correct queue statistics', () => {
            const queue: QueueEntry[] = [
                { gameId: 'g1', gameName: 'Game 1', priority: 'P0', estimatedEffortHours: 10, dependencies: [], recommendedStartDate: '2024-01-01', status: 'pending' },
                { gameId: 'g2', gameName: 'Game 2', priority: 'P0', estimatedEffortHours: 15, dependencies: [], recommendedStartDate: '2024-01-08', status: 'pending' },
                { gameId: 'g3', gameName: 'Game 3', priority: 'P1', estimatedEffortHours: 20, dependencies: [], recommendedStartDate: '2024-01-15', status: 'pending' },
            ];

            const stats = queueGenerator.getQueueStatistics(queue);

            expect(stats.totalEntries).toBe(3);
            expect(stats.byPriority.P0).toBe(2);
            expect(stats.byPriority.P1).toBe(1);
            expect(stats.byPriority.P2).toBe(0);
            expect(stats.byPriority.P3).toBe(0);
            expect(stats.totalEstimatedHours).toBe(45);
            expect(stats.averageEffortHours).toBe(15);
        });

        it('should handle empty queue statistics', () => {
            const stats = queueGenerator.getQueueStatistics([]);

            expect(stats.totalEntries).toBe(0);
            expect(stats.averageEffortHours).toBe(0);
        });
    });

    // ============================================
    // Integration with UnifiedPriorityEntry Tests
    // ============================================

    describe('Integration with UnifiedPriorityEntry', () => {
        it('should generate queue from unified entries', () => {
            const unifiedEntries: UnifiedPriorityEntry[] = [
                { gameId: 'g1', gameName: 'Game 1', combinedScore: 60, auditScore: 15, catalogPriority: 60, priorityLevel: 'P2', educationalImpact: 50, implementationEffort: 50 },
                { gameId: 'g2', gameName: 'Game 2', combinedScore: 95, auditScore: 22, catalogPriority: 95, priorityLevel: 'P0', educationalImpact: 90, implementationEffort: 40 },
                { gameId: 'g3', gameName: 'Game 3', combinedScore: 80, auditScore: 18, catalogPriority: 80, priorityLevel: 'P1', educationalImpact: 70, implementationEffort: 60 },
            ];

            const games = new Map<string, Game | CatalogEntry>();
            games.set('g1', createTestGame('g1', 'Game 1', 'P2'));
            games.set('g2', createTestGame('g2', 'Game 2', 'P0'));
            games.set('g3', createTestGame('g3', 'Game 3', 'P1'));

            const queue = queueGenerator.generateQueueFromUnifiedEntries(unifiedEntries, games);

            expect(queue[0].priority).toBe('P0');
            expect(queue[1].priority).toBe('P1');
            expect(queue[2].priority).toBe('P2');
        });
    });
});
