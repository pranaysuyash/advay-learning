// Report Storage Tests for Game Quality System

import { describe, it, expect, beforeEach } from 'vitest';
import { ReportStorage, createReportStorage, DEFAULT_REPORT_STORAGE_CONFIG } from './reportStorage';
import type { DocumentationEntry } from '../types';
import type { MetricsReportData } from './metricsReport';

describe('ReportStorage', () => {
    let storage: ReportStorage;

    beforeEach(() => {
        storage = new ReportStorage();
    });

    describe('Constructor', () => {
        it('should create with default config', () => {
            const s = new ReportStorage();
            expect(s).toBeDefined();
        });

        it('should create with custom config', () => {
            const s = new ReportStorage({
                improvementDirectory: 'custom/improvements',
                implementationDirectory: 'custom/implementations',
                maxStoredReports: 50,
            });
            expect(s).toBeDefined();
        });
    });

    describe('storeImprovementReport', () => {
        it('should store an improvement report', () => {
            const entry: DocumentationEntry = {
                gameId: 'game-001',
                changeLog: ['Added new feature'],
                implementationReport: 'Report content',
                metricsSummary: {
                    gameId: 'game-001',
                    changePercentage: 25,
                    statisticalSignificance: 'medium',
                    lastUpdated: new Date().toISOString(),
                },
                beforeAfterComparisons: {
                    qualityScore: { before: 60, after: 80, change: 20 },
                    engagementRate: { before: 50, after: 70, change: 20 },
                    completionRate: { before: 55, after: 75, change: 20 },
                },
                keyDecisions: [],
                lessonsLearned: [],
                nextSteps: [],
                timestamp: new Date().toISOString(),
            };

            const stored = storage.storeImprovementReport(entry, '# Improvement Report\n\nContent');

            expect(stored.id).toBeDefined();
            expect(stored.type).toBe('improvement');
            expect(stored.gameId).toBe('game-001');
            expect(stored.filePath).toContain('game-001');
            expect(stored.filePath).toContain('improvement');
        });

        it('should add to internal storage', () => {
            const entry: DocumentationEntry = {
                gameId: 'game-001',
                changeLog: [],
                implementationReport: '',
                metricsSummary: {
                    gameId: 'game-001',
                    changePercentage: 0,
                    statisticalSignificance: 'insufficient',
                    lastUpdated: new Date().toISOString(),
                },
                beforeAfterComparisons: {
                    qualityScore: { before: 0, after: 0, change: 0 },
                    engagementRate: { before: 0, after: 0, change: 0 },
                    completionRate: { before: 0, after: 0, change: 0 },
                },
                keyDecisions: [],
                lessonsLearned: [],
                nextSteps: [],
                timestamp: new Date().toISOString(),
            };

            storage.storeImprovementReport(entry, 'Content');

            const allReports = storage.getAllReports();
            expect(allReports.length).toBe(1);
        });
    });

    describe('storeImplementationReport', () => {
        it('should store an implementation report', () => {
            const stored = storage.storeImplementationReport(
                'game-002',
                'Science Quest',
                '# Implementation Report\n\nContent'
            );

            expect(stored.id).toBeDefined();
            expect(stored.type).toBe('implementation');
            expect(stored.gameId).toBe('game-002');
            expect(stored.gameName).toBe('Science Quest');
            expect(stored.filePath).toContain('game-002');
            expect(stored.filePath).toContain('implementation');
        });

        it('should add to internal storage', () => {
            storage.storeImplementationReport('game-002', 'Science Quest', 'Content');

            const allReports = storage.getAllReports();
            expect(allReports.length).toBe(1);
        });
    });

    describe('storeMetricsReport', () => {
        it('should store a metrics report', () => {
            const mockReport: MetricsReportData = {
                gameId: 'game-003',
                gameName: 'History Game',
                reportDate: new Date().toISOString(),
                metrics: [
                    {
                        name: 'Quality Score',
                        before: 60,
                        after: 80,
                        absoluteChange: 20,
                        percentageChange: 33.33,
                        statisticalSignificance: 'medium',
                    },
                ],
                overallImpact: {
                    totalAbsoluteChange: 20,
                    averagePercentageChange: 33.33,
                    overallSignificance: 'medium',
                },
                recommendations: ['Continue monitoring'],
                content: '# Metrics Report\n\nContent',
            };

            const stored = storage.storeMetricsReport(mockReport, 'improvement');

            expect(stored.id).toBeDefined();
            expect(stored.type).toBe('improvement');
            expect(stored.gameId).toBe('game-003');
        });

        it('should store with implementation type', () => {
            const mockReport: MetricsReportData = {
                gameId: 'game-004',
                gameName: 'Art Game',
                reportDate: new Date().toISOString(),
                metrics: [],
                overallImpact: {
                    totalAbsoluteChange: 0,
                    averagePercentageChange: 0,
                    overallSignificance: 'insufficient',
                },
                recommendations: [],
                content: '',
            };

            const stored = storage.storeMetricsReport(mockReport, 'implementation');

            expect(stored.type).toBe('implementation');
        });
    });

    describe('getReport', () => {
        it('should retrieve a stored report by ID', () => {
            const stored = storage.storeImplementationReport('game-002', 'Science Quest', 'Content');

            const retrieved = storage.getReport(stored.id);

            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe(stored.id);
            expect(retrieved?.gameId).toBe('game-002');
        });

        it('should return undefined for non-existent report', () => {
            const retrieved = storage.getReport('non-existent-id');

            expect(retrieved).toBeUndefined();
        });
    });

    describe('getReportsForGame', () => {
        it('should return all reports for a specific game', () => {
            storage.storeImplementationReport('game-001', 'Game 1', 'Content 1');
            storage.storeImprovementReport(
                {
                    gameId: 'game-001',
                    changeLog: [],
                    implementationReport: '',
                    metricsSummary: { gameId: 'game-001', changePercentage: 0, statisticalSignificance: 'insufficient', lastUpdated: '' },
                    beforeAfterComparisons: { qualityScore: { before: 0, after: 0, change: 0 }, engagementRate: { before: 0, after: 0, change: 0 }, completionRate: { before: 0, after: 0, change: 0 } },
                    keyDecisions: [],
                    lessonsLearned: [],
                    nextSteps: [],
                    timestamp: '',
                },
                'Content 2'
            );
            storage.storeImplementationReport('game-002', 'Game 2', 'Content 3');

            const game1Reports = storage.getReportsForGame('game-001');
            expect(game1Reports.length).toBe(2);

            const game2Reports = storage.getReportsForGame('game-002');
            expect(game2Reports.length).toBe(1);
        });
    });

    describe('getReportsByType', () => {
        it('should return all reports of a specific type', () => {
            storage.storeImplementationReport('game-001', 'Game 1', 'Content 1');
            storage.storeImplementationReport('game-002', 'Game 2', 'Content 2');
            storage.storeImprovementReport(
                {
                    gameId: 'game-003',
                    changeLog: [],
                    implementationReport: '',
                    metricsSummary: { gameId: 'game-003', changePercentage: 0, statisticalSignificance: 'insufficient', lastUpdated: '' },
                    beforeAfterComparisons: { qualityScore: { before: 0, after: 0, change: 0 }, engagementRate: { before: 0, after: 0, change: 0 }, completionRate: { before: 0, after: 0, change: 0 } },
                    keyDecisions: [],
                    lessonsLearned: [],
                    nextSteps: [],
                    timestamp: '',
                },
                'Content 3'
            );

            const implementationReports = storage.getReportsByType('implementation');
            expect(implementationReports.length).toBe(2);
            expect(implementationReports.every(r => r.type === 'implementation')).toBe(true);

            const improvementReports = storage.getReportsByType('improvement');
            expect(improvementReports.length).toBe(1);
            expect(improvementReports.every(r => r.type === 'improvement')).toBe(true);
        });
    });

    describe('getAllReports', () => {
        it('should return all stored reports', () => {
            storage.storeImplementationReport('game-001', 'Game 1', 'Content 1');
            storage.storeImplementationReport('game-002', 'Game 2', 'Content 2');

            const allReports = storage.getAllReports();
            expect(allReports.length).toBe(2);
        });

        it('should return empty array when no reports stored', () => {
            const allReports = storage.getAllReports();
            expect(allReports.length).toBe(0);
        });
    });

    describe('deleteReport', () => {
        it('should delete a stored report', () => {
            const stored = storage.storeImplementationReport('game-001', 'Game 1', 'Content');

            expect(storage.getReport(stored.id)).toBeDefined();

            const deleted = storage.deleteReport(stored.id);
            expect(deleted).toBe(true);

            expect(storage.getReport(stored.id)).toBeUndefined();
        });

        it('should return false when deleting non-existent report', () => {
            const deleted = storage.deleteReport('non-existent-id');
            expect(deleted).toBe(false);
        });
    });

    describe('clear', () => {
        it('should clear all stored reports', () => {
            storage.storeImplementationReport('game-001', 'Game 1', 'Content 1');
            storage.storeImplementationReport('game-002', 'Game 2', 'Content 2');

            storage.clear();

            expect(storage.getAllReports().length).toBe(0);
        });
    });

    describe('getDirectoryForType', () => {
        it('should return improvement directory', () => {
            const dir = storage.getDirectoryForType('improvement');
            expect(dir).toBe('docs/game_improvements');
        });

        it('should return implementation directory', () => {
            const dir = storage.getDirectoryForType('implementation');
            expect(dir).toBe('docs/game_implementations');
        });
    });

    describe('generateFilePath', () => {
        it('should generate file path with timestamp', () => {
            const path = storage.generateFilePath('game-001', 'improvement');

            expect(path).toContain('game-001');
            expect(path).toContain('improvement');
            expect(path).toContain('.md');
        });

        it('should include date in filename', () => {
            const path = storage.generateFilePath('game-001', 'implementation');
            const today = new Date().toISOString().split('T')[0];

            expect(path).toContain(today);
        });
    });

    describe('exportAsJson', () => {
        it('should export all reports as JSON', () => {
            storage.storeImplementationReport('game-001', 'Game 1', 'Content 1');
            storage.storeImplementationReport('game-002', 'Game 2', 'Content 2');

            const json = storage.exportAsJson();
            const parsed = JSON.parse(json);

            expect(parsed.exportDate).toBeDefined();
            expect(parsed.totalReports).toBe(2);
            expect(parsed.reports).toHaveLength(2);
        });

        it('should export empty array when no reports', () => {
            const json = storage.exportAsJson();
            const parsed = JSON.parse(json);

            expect(parsed.totalReports).toBe(0);
            expect(parsed.reports).toHaveLength(0);
        });
    });

    describe('maxStoredReports enforcement', () => {
        it('should remove oldest reports when limit exceeded', () => {
            const limitedStorage = new ReportStorage({ maxStoredReports: 3 });

            limitedStorage.storeImplementationReport('game-001', 'Game 1', 'Content 1');
            limitedStorage.storeImplementationReport('game-002', 'Game 2', 'Content 2');
            limitedStorage.storeImplementationReport('game-003', 'Game 3', 'Content 3');
            limitedStorage.storeImplementationReport('game-004', 'Game 4', 'Content 4');

            const allReports = limitedStorage.getAllReports();
            expect(allReports.length).toBe(3);

            // Oldest report (game-001) should be removed
            const game001Reports = limitedStorage.getReportsForGame('game-001');
            expect(game001Reports.length).toBe(0);
        });
    });

    describe('factory function', () => {
        it('should create ReportStorage instance', () => {
            const s = createReportStorage();
            expect(s).toBeInstanceOf(ReportStorage);
        });
    });
});

describe('ReportStorage - Property Tests', () => {
    let storage: ReportStorage;

    beforeEach(() => {
        storage = new ReportStorage();
    });

    it('should always generate valid file paths', () => {
        const gameIds = ['game-001', 'game-002', 'game-003'];

        for (const gameId of gameIds) {
            const improvementPath = storage.generateFilePath(gameId, 'improvement');
            const implementationPath = storage.generateFilePath(gameId, 'implementation');

            expect(improvementPath).toContain(gameId);
            expect(implementationPath).toContain(gameId);
            expect(improvementPath.endsWith('.md')).toBe(true);
            expect(implementationPath.endsWith('.md')).toBe(true);
        }
    });

    it('should always return valid directories', () => {
        const improvementDir = storage.getDirectoryForType('improvement');
        const implementationDir = storage.getDirectoryForType('implementation');

        expect(improvementDir).toBe('docs/game_improvements');
        expect(implementationDir).toBe('docs/game_implementations');
    });

    it('should maintain report count consistency', () => {
        storage.storeImplementationReport('game-001', 'Game 1', 'Content');
        storage.storeImplementationReport('game-002', 'Game 2', 'Content');
        storage.storeImplementationReport('game-003', 'Game 3', 'Content');

        const allReports = storage.getAllReports();
        const implReports = storage.getReportsByType('implementation');
        const impReports = storage.getReportsByType('improvement');

        expect(allReports.length).toBe(implReports.length + impReports.length);
    });
});
