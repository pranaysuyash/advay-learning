import { describe, it, expect, beforeEach } from 'vitest';
import {
    AuditTrail,
    createAutomatedReviewer,
    createHumanReviewer,
    createSystemReviewer,
    type AuditTrailConfig,
} from './auditTrail';
import type { QualityGateResult, QualityGateStatus, QualityGateCheck } from '../types';

describe('AuditTrail', () => {
    let auditTrail: AuditTrail;

    beforeEach(() => {
        auditTrail = new AuditTrail();
    });

    describe('Basic Operations', () => {
        it('should create an empty audit trail', () => {
            expect(auditTrail.getEntryCount()).toBe(0);
            expect(auditTrail.getAllEntries()).toEqual([]);
        });

        it('should record a check with all required information', () => {
            const reviewer = createAutomatedReviewer('test-automation');
            const result = createMockResult('passed');
            const entry = auditTrail.recordCheck('game-1', result, reviewer, 'Test notes');

            expect(entry.id).toMatch(/^audit-[a-z0-9]+-[a-z0-9]+$/);
            expect(entry.gameId).toBe('game-1');
            expect(entry.reviewer.id).toBe('test-automation');
            expect(entry.reviewer.type).toBe('automated');
            expect(entry.notes).toBe('Test notes');
            expect(entry.timestamp).toBeDefined();
        });

        it('should record a single check', () => {
            const check = createMockCheck('auditPassed', 'passed', 'Audit check passed');
            const entry = auditTrail.recordSingleCheck(
                'game-2',
                check,
                'human',
                'user-123',
                'John Doe',
                'Manual review completed'
            );

            expect(entry.gameId).toBe('game-2');
            expect(entry.reviewer.type).toBe('human');
            expect(entry.reviewer.id).toBe('user-123');
            expect(entry.reviewer.name).toBe('John Doe');
            expect(entry.notes).toBe('Manual review completed');
        });

        it('should return entry count', () => {
            const reviewer = createAutomatedReviewer();
            const result = createMockResult('passed');

            auditTrail.recordCheck('game-1', result, reviewer);
            auditTrail.recordCheck('game-2', result, reviewer);
            auditTrail.recordCheck('game-3', result, reviewer);

            expect(auditTrail.getEntryCount()).toBe(3);
        });
    });

    describe('Query Operations', () => {
        beforeEach(() => {
            const reviewer = createAutomatedReviewer();
            auditTrail.recordCheck('game-1', createMockResult('passed'), reviewer);
            auditTrail.recordCheck('game-2', createMockResult('failed'), reviewer);
            auditTrail.recordCheck('game-1', createMockResult('passed'), reviewer);
        });

        it('should get entries for a specific game', () => {
            const entries = auditTrail.getEntriesForGame('game-1');
            expect(entries.length).toBe(2);
            expect(entries.every(e => e.gameId === 'game-1')).toBe(true);
        });

        it('should get latest entry for a game', () => {
            const latest = auditTrail.getLatestEntryForGame('game-1');
            expect(latest).toBeDefined();
            expect(latest?.gameId).toBe('game-1');
        });

        it('should return undefined for non-existent game', () => {
            const latest = auditTrail.getLatestEntryForGame('non-existent');
            expect(latest).toBeUndefined();
        });

        it('should get entries by status', () => {
            const passed = auditTrail.getEntriesByStatus('passed');
            const failed = auditTrail.getEntriesByStatus('failed');

            expect(passed.length).toBe(2);
            expect(failed.length).toBe(1);
        });

        it('should get entries by reviewer type', () => {
            const humanReviewer = createHumanReviewer('user-1', 'Jane Doe', 'QA Engineer');
            auditTrail.recordCheck('game-3', createMockResult('passed'), humanReviewer);

            const humanEntries = auditTrail.getEntriesByReviewerType('human');
            const automatedEntries = auditTrail.getEntriesByReviewerType('automated');

            expect(humanEntries.length).toBe(1);
            expect(automatedEntries.length).toBe(3);
        });

        it('should get entries by specific reviewer', () => {
            const reviewer = createAutomatedReviewer('specific-reviewer');
            auditTrail.recordCheck('game-4', createMockResult('passed'), reviewer);

            const entries = auditTrail.getEntriesByReviewer('specific-reviewer');
            expect(entries.length).toBe(1);
        });
    });

    describe('Date Range Queries', () => {
        it('should get entries within a date range', () => {
            const reviewer = createAutomatedReviewer();

            // Record entries with slight delays to ensure different timestamps
            auditTrail.recordCheck('game-1', createMockResult('passed'), reviewer);
            auditTrail.recordCheck('game-2', createMockResult('passed'), reviewer);
            auditTrail.recordCheck('game-3', createMockResult('passed'), reviewer);

            const entries = auditTrail.getAllEntries();
            const startDate = entries[0].timestamp;
            const endDate = entries[entries.length - 1].timestamp;

            const rangeEntries = auditTrail.getEntriesByDateRange(startDate, endDate);
            expect(rangeEntries.length).toBe(3);
        });
    });

    describe('Summary Generation', () => {
        it('should generate correct summary', () => {
            const reviewer = createAutomatedReviewer();

            auditTrail.recordCheck('game-1', createMockResult('passed'), reviewer);
            auditTrail.recordCheck('game-2', createMockResult('passed'), reviewer);
            auditTrail.recordCheck('game-3', createMockResult('failed'), reviewer);
            auditTrail.recordCheck('game-4', createMockResult('failed'), reviewer);
            auditTrail.recordCheck('game-5', createMockResult('pending'), reviewer);

            const summary = auditTrail.getSummary(3);

            expect(summary.totalChecks).toBe(5);
            expect(summary.passedChecks).toBe(2);
            expect(summary.failedChecks).toBe(2);
            expect(summary.pendingChecks).toBe(1);
            expect(summary.passRate).toBe(40);
            expect(summary.recentEntries.length).toBe(3);
        });

        it('should handle empty audit trail', () => {
            const summary = auditTrail.getSummary();

            expect(summary.totalChecks).toBe(0);
            expect(summary.passedChecks).toBe(0);
            expect(summary.failedChecks).toBe(0);
            expect(summary.passRate).toBe(0);
        });
    });

    describe('Export/Import', () => {
        it('should export to JSON', () => {
            const reviewer = createAutomatedReviewer();
            auditTrail.recordCheck('game-1', createMockResult('passed'), reviewer);

            const json = auditTrail.exportToJSON();
            expect(json).toContain('game-1');
            expect(json).toContain('passed');
        });

        it('should import from JSON', () => {
            const reviewer = createAutomatedReviewer();
            auditTrail.recordCheck('game-1', createMockResult('passed'), reviewer);

            const json = auditTrail.exportToJSON();
            const newTrail = new AuditTrail();
            newTrail.importFromJSON(json);

            expect(newTrail.getEntryCount()).toBe(1);
            expect(newTrail.getAllEntries()[0].gameId).toBe('game-1');
        });
    });

    describe('Clear Operations', () => {
        it('should clear all entries', () => {
            const reviewer = createAutomatedReviewer();
            auditTrail.recordCheck('game-1', createMockResult('passed'), reviewer);
            auditTrail.recordCheck('game-2', createMockResult('passed'), reviewer);

            expect(auditTrail.getEntryCount()).toBe(2);

            auditTrail.clear();

            expect(auditTrail.getEntryCount()).toBe(0);
        });
    });

    describe('Max Entries Limit', () => {
        it('should enforce max entries limit', () => {
            const config: AuditTrailConfig = { maxEntries: 3 };
            const limitedTrail = new AuditTrail(config);
            const reviewer = createAutomatedReviewer();

            for (let i = 0; i < 5; i++) {
                limitedTrail.recordCheck(`game-${i}`, createMockResult('passed'), reviewer);
            }

            expect(limitedTrail.getEntryCount()).toBe(3);
        });
    });
});

describe('Reviewer Factory Functions', () => {
    it('should create automated reviewer', () => {
        const reviewer = createAutomatedReviewer('auto-1');

        expect(reviewer.id).toBe('auto-1');
        expect(reviewer.name).toBe('Automated Quality Gate');
        expect(reviewer.type).toBe('automated');
        expect(reviewer.role).toBe('CI/CD Pipeline');
    });

    it('should create human reviewer', () => {
        const reviewer = createHumanReviewer('user-123', 'John Doe', 'QA Engineer');

        expect(reviewer.id).toBe('user-123');
        expect(reviewer.name).toBe('John Doe');
        expect(reviewer.type).toBe('human');
        expect(reviewer.role).toBe('QA Engineer');
    });

    it('should create system reviewer', () => {
        const reviewer = createSystemReviewer();

        expect(reviewer.id).toBe('system');
        expect(reviewer.name).toBe('System');
        expect(reviewer.type).toBe('system');
        expect(reviewer.role).toBe('Quality Gate System');
    });
});

// Helper functions
function createMockResult(status: QualityGateStatus): QualityGateResult {
    return {
        gameId: 'test-game',
        status,
        checks: [createMockCheck('test', status, 'Test check')],
    };
}

function createMockCheck(name: string, status: QualityGateStatus, details: string): QualityGateCheck {
    return {
        checkName: name,
        status,
        details,
        timestamp: new Date().toISOString(),
    };
}