// Queue Generator for Game Quality System

import type { QueueEntry, PriorityLevel, PriorityScore, Game, CatalogEntry } from '../types';

export interface QueueConfig {
    maxQueueSize: number;
    includeDependencies: boolean;
    considerAvailability: boolean;
}

export class QueueGenerator {
    private readonly DEFAULT_CONFIG: QueueConfig = {
        maxQueueSize: 100,
        includeDependencies: true,
        considerAvailability: true,
    };

    private config: QueueConfig;

    constructor(config: Partial<QueueConfig> = {}) {
        this.config = { ...this.DEFAULT_CONFIG, ...config };
    }

    public generateQueue(
        scores: PriorityScore[],
        games: Record<string, Game | CatalogEntry>,
        developerAvailability: number = 40
    ): QueueEntry[] {
        void developerAvailability;
        const queue: QueueEntry[] = [];

        for (const score of scores) {
            const game = games[score.gameId];
            if (!game) continue;

            const entry: QueueEntry = {
                gameId: score.gameId,
                gameName: game.name,
                priority: score.priorityLevel,
                estimatedEffortHours: game.estimatedTime || 20,
                dependencies: [],
                recommendedStartDate: this.calculateStartDate(queue),
                status: 'pending',
            };

            queue.push(entry);
        }

        return queue.slice(0, this.config.maxQueueSize);
    }

    public generateQueueFromGames(
        games: (Game | CatalogEntry)[],
        priorityScores: Record<string, PriorityScore>
    ): QueueEntry[] {
        const sortedGames = [...games].sort((a, b) => {
            const scoreA = priorityScores[this.getEntityId(a)]?.totalScore || 0;
            const scoreB = priorityScores[this.getEntityId(b)]?.totalScore || 0;
            return scoreB - scoreA;
        });

        return sortedGames.map((game, index) => {
            const gameId = this.getEntityId(game);

            return {
                gameId,
                gameName: game.name,
                priority: priorityScores[gameId]?.priorityLevel || 'P3',
                estimatedEffortHours: game.estimatedTime || 20,
                dependencies: [],
                recommendedStartDate: this.calculateStartDateFromIndex(index),
                status: 'pending',
            };
        });
    }

    public prioritizeQueue(queue: QueueEntry[]): QueueEntry[] {
        const priorityOrder: Record<PriorityLevel, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

        return queue.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return a.estimatedEffortHours - b.estimatedEffortHours;
        });
    }

    public filterByPriority(queue: QueueEntry[], level: PriorityLevel): QueueEntry[] {
        return queue.filter(entry => entry.priority === level);
    }

    public calculateStartDate(queue: QueueEntry[]): string {
        const totalEffort = queue.reduce((sum, e) => sum + e.estimatedEffortHours, 0);
        const weeks = Math.ceil(totalEffort / 40);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + weeks * 7);
        return startDate.toISOString().split('T')[0];
    }

    public calculateStartDateFromIndex(index: number): string {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + index * 7);
        return startDate.toISOString().split('T')[0];
    }

    public updateQueueStatus(queue: QueueEntry[], gameId: string, status: 'pending' | 'in-progress' | 'completed'): QueueEntry[] {
        return queue.map(entry => {
            if (entry.gameId === gameId) {
                return { ...entry, status };
            }
            return entry;
        });
    }

    public getQueueStats(queue: QueueEntry[]): any {
        const totalEffort = queue.reduce((sum, e) => sum + e.estimatedEffortHours, 0);
        const p0Count = queue.filter(e => e.priority === 'P0').length;
        const p1Count = queue.filter(e => e.priority === 'P1').length;
        const p2Count = queue.filter(e => e.priority === 'P2').length;
        const p3Count = queue.filter(e => e.priority === 'P3').length;
        const pendingCount = queue.filter(e => e.status === 'pending').length;
        const inProgressCount = queue.filter(e => e.status === 'in-progress').length;
        const completedCount = queue.filter(e => e.status === 'completed').length;

        return {
            totalGames: queue.length,
            totalEffort,
            byPriority: { P0: p0Count, P1: p1Count, P2: p2Count, P3: p3Count },
            byStatus: { pending: pendingCount, 'in-progress': inProgressCount, completed: completedCount },
        };
    }

    public getWeeklyCapacity(queue: QueueEntry[], weeklyCapacity: number = 40): any {
        let currentWeek = 0;
        let currentCapacity = weeklyCapacity;
        const weeklyBreakdown: Record<number, QueueEntry[]> = {};

        for (const entry of queue) {
            if (entry.estimatedEffortHours > currentCapacity) {
                currentWeek++;
                currentCapacity = weeklyCapacity;
            }

            if (!weeklyBreakdown[currentWeek]) {
                weeklyBreakdown[currentWeek] = [];
            }

            weeklyBreakdown[currentWeek].push(entry);
            currentCapacity -= entry.estimatedEffortHours;
        }

        return weeklyBreakdown;
    }

    private getEntityId(game: Game | CatalogEntry): string {
        return game.id ?? ('gameId' in game ? game.gameId : '');
    }
}
