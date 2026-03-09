// Change Log Tests for Game Quality System

import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeLog, createChangeLog, DEFAULT_CHANGE_LOG_CONFIG } from './changeLog';
import type { AuditReport, Game } from '../types';

describe('ChangeLog', () => {
    let changeLog: ChangeLog;
    const mockGame: Game = {
        id: 'game-001',
        name: 'Math Blaster',
        description: 'A math learning game',
        category: 'Educational',
        ageRange: '6-10',
        difficulty: 'Medium',
        estimatedTime: 30,
        requiredTechnologies: ['React', 'TypeScript'],
        successCriteria: ['Complete 10 problems', 'Score 80% or higher'],
        isImplemented: true,
        implementationStatus: 'completed',
        lastUpdated: new Date().toISOString(),
    };

    const mockAuditReport: AuditReport = {
        gameId: 'game-001',
        gameName: 'Math Blaster',
        auditDate: '2024-01-15',
        auditor: 'Test Auditor',
        scores: [
            { dimension: 'Educational_Value', score: 4, comments: 'Good', issues: [] },
            { dimension: 'User_Experience', score: 2, comments: 'Needs improvement', issues: ['UI is confusing'] },
            { dimension: 'Technical_Quality', score: 3, comments: 'Acceptable', issues: [] },
            { dimension: 'Accessibility', score: 3, comments: 'Acceptable', issues: [] },
            { dimension: 'Content_Completeness', score: 4, comments: 'Good', issues: [] },
        ],
        totalScore: 16,
        isFlaggedForImprovement: true,
        improvementRecommendations: ['Improve UI navigation', 'Add more feedback'],
    };

    beforeEach(() => {
        changeLog = new ChangeLog();
    });

    describe('Constructor', () => {
        it('should create with default config', () => {
            const cl = new ChangeLog();
            expect(cl).toBeDefined();
        });

        it('should create with custom config', () => {
            const cl = new ChangeLog({ dateFormat: 'LOCAL', includeGameName: false });
            expect(cl).toBeDefined();
        });

        it('should use default config values', () => {
            const cl = new ChangeLog({});
            expect(DEFAULT_CHANGE_LOG_CONFIG).toEqual({
                dateFormat: 'ISO',
                includeGameName: true,
                includeAuditReference: true,
            });
        });
    });

    describe('generateFromAudit', () => {
        it('should generate a change log entry from an audit report', () => {
            const entry = changeLog.generateFromAudit(mockAuditReport, mockGame);

            expect(entry.gameId).toBe('game-001');
            expect(entry.gameName).toBe('Math Blaster');
            expect(entry.improvementType).toBe('audit');
            expect(entry.affectedDimensions).toContain('User_Experience');
            expect(entry.relatedAuditId).toBe('2024-01-15');
        });

        it('should add entry to internal list', () => {
            changeLog.generateFromAudit(mockAuditReport, mockGame);
            const entries = changeLog.getEntries();

            expect(entries.length).toBe(1);
        });

        it('should include affected dimensions from low scores', () => {
            const entry = changeLog.generateFromAudit(mockAuditReport, mockGame);

            expect(entry.affectedDimensions).toEqual(['User_Experience']);
        });
    });

    describe('generateFromImplementation', () => {
        it('should generate a change log entry from an implementation', () => {
            const entry = changeLog.generateFromImplementation(
                'game-002',
                'Science Quest',
                {
                    category: 'Science',
                    technologies: ['React', 'Canvas'],
                    estimatedTime: 45,
                }
            );

            expect(entry.gameId).toBe('game-002');
            expect(entry.gameName).toBe('Science Quest');
            expect(entry.improvementType).toBe('implementation');
            expect(entry.description).toContain('Science');
            expect(entry.description).toContain('React, Canvas');
        });
    });

    describe('generateFromEnhancement', () => {
        it('should generate a change log entry from an enhancement', () => {
            const entry = changeLog.generateFromEnhancement(
                mockGame,
                'UI Improvement',
                ['Added animations', 'Improved color scheme']
            );

            expect(entry.gameId).toBe('game-001');
            expect(entry.improvementType).toBe('enhancement');
            expect(entry.description).toContain('UI Improvement');
        });
    });

    describe('generateFromFix', () => {
        it('should generate a change log entry from a fix', () => {
            const entry = changeLog.generateFromFix(
                mockGame,
                'Bug Fix',
                'Fixed memory leak in game loop'
            );

            expect(entry.gameId).toBe('game-001');
            expect(entry.improvementType).toBe('fix');
            expect(entry.description).toContain('Bug Fix');
        });
    });

    describe('getEntries', () => {
        it('should return all entries', () => {
            changeLog.generateFromAudit(mockAuditReport, mockGame);
            changeLog.generateFromImplementation('game-002', 'Science Quest', { category: 'Science', technologies: [], estimatedTime: 30 });

            const entries = changeLog.getEntries();
            expect(entries.length).toBe(2);
        });

        it('should return a copy of entries', () => {
            changeLog.generateFromAudit(mockAuditReport, mockGame);
            const entries1 = changeLog.getEntries();
            const entries2 = changeLog.getEntries();

            expect(entries1).not.toBe(entries2);
            expect(entries1).toEqual(entries2);
        });
    });

    describe('getEntriesForGame', () => {
        it('should return entries for a specific game', () => {
            changeLog.generateFromAudit(mockAuditReport, mockGame);
            changeLog.generateFromImplementation('game-002', 'Science Quest', { category: 'Science', technologies: [], estimatedTime: 30 });
            changeLog.generateFromEnhancement(mockGame, 'UI', ['Added button']);

            const game1Entries = changeLog.getEntriesForGame('game-001');
            expect(game1Entries.length).toBe(2);

            const game2Entries = changeLog.getEntriesForGame('game-002');
            expect(game2Entries.length).toBe(1);
        });
    });

    describe('getEntriesInDateRange', () => {
        it('should return entries within date range', () => {
            const entry1 = changeLog.generateFromAudit(mockAuditReport, mockGame);
            const entry2 = changeLog.generateFromImplementation('game-002', 'Science Quest', { category: 'Science', technologies: [], estimatedTime: 30 });

            // Manually set timestamps for testing
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            const entries = changeLog.getEntriesInDateRange(
                yesterday.toISOString(),
                tomorrow.toISOString()
            );

            expect(entries.length).toBe(2);
        });
    });

    describe('formatAsMarkdown', () => {
        it('should format entries as markdown', () => {
            changeLog.generateFromAudit(mockAuditReport, mockGame);
            const markdown = changeLog.formatAsMarkdown();

            expect(markdown).toContain('# Change Log');
            expect(markdown).toContain('Math Blaster');
            expect(markdown).toContain('audit');
        });

        it('should handle empty entries', () => {
            const emptyLog = new ChangeLog();
            const markdown = emptyLog.formatAsMarkdown();

            expect(markdown).toContain('No changes recorded');
        });

        it('should sort entries by timestamp descending', () => {
            const entry1 = changeLog.generateFromImplementation('game-001', 'Game 1', { category: 'A', technologies: [], estimatedTime: 30 });
            const entry2 = changeLog.generateFromImplementation('game-002', 'Game 2', { category: 'B', technologies: [], estimatedTime: 30 });

            const markdown = changeLog.formatAsMarkdown();
            const game1Index = markdown.indexOf('Game 1');
            const game2Index = markdown.indexOf('Game 2');

            expect(game2Index).toBeLessThan(game1Index);
        });
    });

    describe('clear', () => {
        it('should clear all entries', () => {
            changeLog.generateFromAudit(mockAuditReport, mockGame);
            changeLog.generateFromImplementation('game-002', 'Science Quest', { category: 'Science', technologies: [], estimatedTime: 30 });

            changeLog.clear();

            expect(changeLog.getEntries().length).toBe(0);
        });
    });

    describe('factory function', () => {
        it('should create ChangeLog instance', () => {
            const cl = createChangeLog();
            expect(cl).toBeInstanceOf(ChangeLog);
        });

        it('should create with config', () => {
            const cl = createChangeLog({ dateFormat: 'UTC' });
            expect(cl).toBeDefined();
        });
    });
});

describe('ChangeLog - Property Tests', () => {
    let changeLog: ChangeLog;

    beforeEach(() => {
        changeLog = new ChangeLog();
    });

    it('should always generate entries with valid timestamps', () => {
        const game: Game = {
            id: 'test-game',
            name: 'Test Game',
            description: 'Test',
            category: 'Test',
            ageRange: '5-10',
            difficulty: 'Easy',
            estimatedTime: 15,
            requiredTechnologies: [],
            successCriteria: [],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        };

        const auditReport: AuditReport = {
            gameId: 'test-game',
            gameName: 'Test Game',
            auditDate: '2024-01-15',
            auditor: 'Test',
            scores: [
                { dimension: 'Educational_Value', score: 3, comments: '', issues: [] },
                { dimension: 'User_Experience', score: 3, comments: '', issues: [] },
                { dimension: 'Technical_Quality', score: 3, comments: '', issues: [] },
                { dimension: 'Accessibility', score: 3, comments: '', issues: [] },
                { dimension: 'Content_Completeness', score: 3, comments: '', issues: [] },
            ],
            totalScore: 15,
            isFlaggedForImprovement: false,
            improvementRecommendations: [],
        };

        const entry = changeLog.generateFromAudit(auditReport, game);

        expect(entry.timestamp).toBeDefined();
        expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
    });

    it('should include game ID in all generated entries', () => {
        const game: Game = {
            id: 'unique-game-id',
            name: 'Test Game',
            description: 'Test',
            category: 'Test',
            ageRange: '5-10',
            difficulty: 'Easy',
            estimatedTime: 15,
            requiredTechnologies: [],
            successCriteria: [],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        };

        changeLog.generateFromAudit({
            gameId: 'unique-game-id',
            gameName: 'Test Game',
            auditDate: '2024-01-15',
            auditor: 'Test',
            scores: [],
            totalScore: 0,
            isFlaggedForImprovement: false,
            improvementRecommendations: [],
        }, game);

        changeLog.generateFromImplementation('unique-game-id', 'Test Game', { category: 'Test', technologies: [], estimatedTime: 15 });

        const entries = changeLog.getEntries();
        for (const entry of entries) {
            expect(entry.gameId).toBe('unique-game-id');
        }
    });
});