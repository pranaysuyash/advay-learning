// Priority Change Logging Tests
// Tests for priority change logging functionality
// Validates: Requirement 3.6

import { describe, it, expect, beforeEach } from 'vitest';
import {
    PriorityChangeLogger,
    createPriorityChangeEvent,
    hasPriorityChanged,
    type PriorityChangeEvent,
} from './priorityChangeLog';
import type { PriorityScore, PriorityLevel } from '../types';

// Helper to create a PriorityScore
function createMockPriorityScore(
    gameId: string,
    totalScore: number,
    priorityLevel: PriorityLevel
): PriorityScore {
    return {
        gameId,
        totalScore,
        educationalImpact: 0,
        userDemand: 0,
        implementationEffort: 0,
        strategicAlignment: 0,
        priorityLevel,
    };
}

describe('PriorityChangeLogger', () => {
    let logger: PriorityChangeLogger;

    beforeEach(() => {
        logger = new PriorityChangeLogger({
            enableChangeDetection: true,
            logRetentionDays: 90,
            notifyOnPriorityChange: false,
        });
    });

    describe('logPriorityChange', () => {
        it('should log a priority change event', () => {
            const event = logger.logPriorityChange(
                'game-1',
                85, // previous score
                92, // new score
                'P1', // previous priority
                'P0', // new priority
                'Audit revealed high educational value',
                'audit'
            );

            expect(event.gameId).toBe('game-1');
            expect(event.previousPriority).toBe('P1');
            expect(event.newPriority).toBe('P0');
            expect(event.previousScore).toBe(85);
            expect(event.newScore).toBe(92);
            expect(event.reason).toBe('Audit revealed high educational value');
            expect(event.source).toBe('audit');
            expect(event.timestamp).toBeDefined();
        });

        it('should track game change history', () => {
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'First change', 'audit');
            logger.logPriorityChange('game-1', 92, 88, 'P0', 'P1', 'Score dropped', 'metrics_update');

            const history = logger.getGameChangeHistory('game-1');
            expect(history).toHaveLength(2);
            expect(history[0].reason).toBe('First change');
            expect(history[1].reason).toBe('Score dropped');
        });

        it('should update tracked game priority', () => {
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'Test change', 'manual');

            const tracked = logger.getTrackedGame('game-1');
            expect(tracked).toBeDefined();
            expect(tracked!.currentPriority).toBe('P0');
            expect(tracked!.currentScore).toBe(92);
        });
    });

    describe('calculateAndDetectChange', () => {
        it('should detect priority level changes', () => {
            const result = logger.calculateAndDetectChange(
                'game-1',
                85, // previous score (P1)
                92, // new score (P0)
                'User engagement increased',
                'user_feedback'
            );

            expect(result.success).toBe(true);
            expect(result.previousPriority).toBe('P1');
            expect(result.newPriority).toBe('P0');
            expect(result.changeLogged).toBe(true);
            expect(result.priorityListUpdated).toBe(true);
        });

        it('should not log when priority level is unchanged', () => {
            const result = logger.calculateAndDetectChange(
                'game-1',
                75, // previous score (P1)
                80, // new score (P1)
                'Minor score adjustment',
                'metrics_update'
            );

            expect(result.success).toBe(true);
            expect(result.previousPriority).toBe('P1');
            expect(result.newPriority).toBe('P1');
            expect(result.changeLogged).toBe(false);
            expect(result.priorityListUpdated).toBe(false);
        });

        it('should handle disabled change detection', () => {
            const disabledLogger = new PriorityChangeLogger({
                enableChangeDetection: false,
            });

            const result = disabledLogger.calculateAndDetectChange(
                'game-1',
                85,
                92,
                'Should not log',
                'manual'
            );

            expect(result.changeLogged).toBe(false);
            expect(result.priorityListUpdated).toBe(false);
        });
    });

    describe('priority list management', () => {
        it('should update priority list on change', () => {
            logger.calculateAndDetectChange('game-1', 85, 92, 'Change 1', 'audit');
            logger.calculateAndDetectChange('game-2', 60, 75, 'Change 2', 'audit');

            const list = logger.getPriorityList();
            expect(list.entries).toHaveLength(2);
            expect(list.totalGames).toBe(2);
        });

        it('should reorder priority list by priority level', () => {
            // Use logPriorityChange to always update the list
            logger.logPriorityChange('game-1', 55, 55, 'P2', 'P2', 'P2 game', 'audit');
            logger.logPriorityChange('game-2', 92, 92, 'P0', 'P0', 'P0 game', 'audit');
            logger.logPriorityChange('game-3', 78, 78, 'P1', 'P1', 'P1 game', 'audit');

            const list = logger.getPriorityList();
            expect(list.entries[0].gameId).toBe('game-2'); // P0 first
            expect(list.entries[1].gameId).toBe('game-3'); // P1 second
            expect(list.entries[2].gameId).toBe('game-1'); // P2 last
        });

        it('should sort by score within same priority level', () => {
            // Both result in P1, but game-2 has higher score
            logger.logPriorityChange('game-1', 72, 72, 'P1', 'P1', 'P1 game', 'audit');
            logger.logPriorityChange('game-2', 85, 85, 'P1', 'P1', 'P1 game higher score', 'audit');

            const list = logger.getPriorityList();
            expect(list.entries[0].gameId).toBe('game-2'); // Higher score first
            expect(list.entries[1].gameId).toBe('game-1');
        });

        it('should get games by priority level', () => {
            logger.calculateAndDetectChange('game-1', 85, 92, 'P0 game', 'audit');
            logger.calculateAndDetectChange('game-2', 60, 75, 'P1 game', 'audit');
            logger.calculateAndDetectChange('game-3', 40, 55, 'P2 game', 'audit');

            const p0Games = logger.getGamesByPriority('P0');
            const p1Games = logger.getGamesByPriority('P1');
            const p2Games = logger.getGamesByPriority('P2');

            expect(p0Games).toHaveLength(1);
            expect(p0Games[0].gameId).toBe('game-1');
            expect(p1Games).toHaveLength(1);
            expect(p1Games[0].gameId).toBe('game-2');
            expect(p2Games).toHaveLength(1);
            expect(p2Games[0].gameId).toBe('game-3');
        });

        it('should return priority distribution', () => {
            // Each game gets a different priority level
            logger.logPriorityChange('game-1', 92, 92, 'P0', 'P0', 'P0 game', 'audit');
            logger.logPriorityChange('game-2', 75, 75, 'P1', 'P1', 'P1 game', 'audit');
            logger.logPriorityChange('game-3', 55, 55, 'P2', 'P2', 'P2 game', 'audit');
            logger.logPriorityChange('game-4', 25, 25, 'P3', 'P3', 'P3 game', 'audit');

            const distribution = logger.getPriorityDistribution();
            expect(distribution.P0).toBe(1);
            expect(distribution.P1).toBe(1);
            expect(distribution.P2).toBe(1);
            expect(distribution.P3).toBe(1);
        });
    });

    describe('change statistics', () => {
        it('should track total changes', () => {
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'Change 1', 'audit');
            logger.logPriorityChange('game-2', 60, 75, 'P2', 'P1', 'Change 2', 'user_feedback');
            logger.logPriorityChange('game-3', 40, 55, 'P3', 'P2', 'Change 3', 'metrics_update');

            const stats = logger.getChangeStatistics();
            expect(stats.totalChanges).toBe(3);
        });

        it('should track changes by source', () => {
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'Change 1', 'audit');
            logger.logPriorityChange('game-2', 60, 75, 'P2', 'P1', 'Change 2', 'audit');
            logger.logPriorityChange('game-3', 40, 55, 'P3', 'P2', 'Change 3', 'user_feedback');

            const stats = logger.getChangeStatistics();
            expect(stats.changesBySource.audit).toBe(2);
            expect(stats.changesBySource.user_feedback).toBe(1);
        });

        it('should track changes by priority transition', () => {
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'Change 1', 'audit');
            logger.logPriorityChange('game-2', 60, 75, 'P2', 'P1', 'Change 2', 'audit');

            const stats = logger.getChangeStatistics();
            expect(stats.changesByPriority['P1->P0']).toBe(1);
            expect(stats.changesByPriority['P2->P1']).toBe(1);
        });

        it('should count recent changes', () => {
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'Change 1', 'audit');

            const stats = logger.getChangeStatistics();
            expect(stats.recentChangesCount).toBe(1);
        });
    });

    describe('export/import', () => {
        it('should export change log as JSON', () => {
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'Change 1', 'audit');

            const json = logger.exportChangeLog();
            const events = JSON.parse(json) as PriorityChangeEvent[];

            expect(events).toHaveLength(1);
            expect(events[0].gameId).toBe('game-1');
        });

        it('should import change log from JSON', () => {
            const events: PriorityChangeEvent[] = [
                {
                    gameId: 'imported-game',
                    previousPriority: 'P2',
                    newPriority: 'P1',
                    previousScore: 55,
                    newScore: 75,
                    timestamp: new Date().toISOString(),
                    reason: 'Imported change',
                    source: 'manual',
                },
            ];

            const importedCount = logger.importChangeLog(JSON.stringify(events));

            expect(importedCount).toBe(1);
            expect(logger.getGameChangeHistory('imported-game')).toHaveLength(1);
        });
    });

    describe('log management', () => {
        it('should clear old logs', () => {
            // Add a recent log
            logger.logPriorityChange('game-1', 85, 92, 'P1', 'P0', 'Recent', 'audit');

            // Create logger with very short retention
            const shortRetentionLogger = new PriorityChangeLogger({
                logRetentionDays: 0,
            });
            shortRetentionLogger.logPriorityChange('game-2', 60, 75, 'P2', 'P1', 'Old', 'audit');

            const cleared = shortRetentionLogger.clearOldLogs();
            expect(cleared).toBe(1);
            expect(shortRetentionLogger.getAllChangeEvents()).toHaveLength(0);
        });
    });
});

describe('createPriorityChangeEvent', () => {
    it('should create a valid priority change event from PriorityScores', () => {
        const previousScore = createMockPriorityScore('game-1', 85, 'P1');
        const newScore = createMockPriorityScore('game-1', 92, 'P0');

        const event = createPriorityChangeEvent(
            'game-1',
            previousScore,
            newScore,
            'User engagement increased significantly',
            'user_feedback'
        );

        expect(event.gameId).toBe('game-1');
        expect(event.previousPriority).toBe('P1');
        expect(event.newPriority).toBe('P0');
        expect(event.previousScore).toBe(85);
        expect(event.newScore).toBe(92);
        expect(event.reason).toBe('User engagement increased significantly');
        expect(event.source).toBe('user_feedback');
    });
});

describe('hasPriorityChanged', () => {
    it('should return true when priority levels differ', () => {
        const previousScore = createMockPriorityScore('game-1', 85, 'P1');
        const newScore = createMockPriorityScore('game-1', 92, 'P0');

        expect(hasPriorityChanged(previousScore, newScore)).toBe(true);
    });

    it('should return false when priority levels are the same', () => {
        const previousScore = createMockPriorityScore('game-1', 75, 'P1');
        const newScore = createMockPriorityScore('game-1', 80, 'P1');

        expect(hasPriorityChanged(previousScore, newScore)).toBe(false);
    });
});