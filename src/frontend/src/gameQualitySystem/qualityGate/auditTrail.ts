// Audit Trail for Quality Gate
// Maintains a record of all quality gate checks with timestamps and reviewer information

import type {
    QualityGateCheck,
    QualityGateResult,
    QualityGateStatus,
} from '../types';

/**
 * Represents a single entry in the audit trail
 */
export interface AuditTrailEntry {
    /** Unique identifier for this audit entry */
    id: string;
    /** The game that was checked */
    gameId: string;
    /** Timestamp of when the check was performed */
    timestamp: string;
    /** Reviewer information */
    reviewer: ReviewerInfo;
    /** The result of the quality gate check */
    result: QualityGateResult;
    /** Additional notes or comments from the reviewer */
    notes?: string;
}

/**
 * Information about the reviewer who performed the quality gate check
 */
export interface ReviewerInfo {
    /** Reviewer identifier (e.g., user ID, name, or "automated") */
    id: string;
    /** Display name of the reviewer */
    name: string;
    /** Type of reviewer */
    type: 'human' | 'automated' | 'system';
    /** Optional role or department */
    role?: string;
}

/**
 * Audit trail configuration
 */
export interface AuditTrailConfig {
    /** Maximum number of entries to keep (0 = unlimited) */
    maxEntries?: number;
    /** Whether to include detailed check information */
    includeDetails?: boolean;
    /** Whether to persist to storage */
    persistToStorage?: boolean;
}

/**
 * Audit trail summary for reporting
 */
export interface AuditTrailSummary {
    /** Total number of checks */
    totalChecks: number;
    /** Number of passed checks */
    passedChecks: number;
    /** Number of failed checks */
    failedChecks: number;
    /** Number of pending checks */
    pendingChecks: number;
    /** Pass rate percentage */
    passRate: number;
    /** Date range of entries */
    dateRange: {
        earliest: string;
        latest: string;
    };
    /** Most recent entries */
    recentEntries: AuditTrailEntry[];
}

/**
 * Audit Trail for Quality Gate
 * Maintains a comprehensive record of all quality gate checks
 */
export class AuditTrail {
    private entries: AuditTrailEntry[] = [];
    private config: Required<AuditTrailConfig>;

    constructor(config: AuditTrailConfig = {}) {
        this.config = {
            maxEntries: config.maxEntries ?? 1000,
            includeDetails: config.includeDetails ?? true,
            persistToStorage: config.persistToStorage ?? false,
        };
    }

    /**
     * Record a quality gate check result in the audit trail
     */
    public recordCheck(
        gameId: string,
        result: QualityGateResult,
        reviewer: ReviewerInfo,
        notes?: string
    ): AuditTrailEntry {
        const entry: AuditTrailEntry = {
            id: this.generateEntryId(),
            gameId,
            timestamp: new Date().toISOString(),
            reviewer,
            result,
            notes,
        };

        this.entries.push(entry);
        this.enforceMaxEntries();

        return entry;
    }

    /**
     * Record a single check with automatic reviewer info
     */
    public recordSingleCheck(
        gameId: string,
        check: QualityGateCheck,
        reviewerType: 'human' | 'automated' = 'automated',
        reviewerId: string = 'system',
        reviewerName: string = 'System',
        notes?: string
    ): AuditTrailEntry {
        const result: QualityGateResult = {
            gameId,
            status: check.status,
            checks: [check],
        };

        const reviewer: ReviewerInfo = {
            id: reviewerId,
            name: reviewerName,
            type: reviewerType,
        };

        return this.recordCheck(gameId, result, reviewer, notes);
    }

    /**
     * Get all entries for a specific game
     */
    public getEntriesForGame(gameId: string): AuditTrailEntry[] {
        return this.entries.filter(entry => entry.gameId === gameId);
    }

    /**
     * Get the most recent entry for a game
     */
    public getLatestEntryForGame(gameId: string): AuditTrailEntry | undefined {
        const gameEntries = this.getEntriesForGame(gameId);
        if (gameEntries.length === 0) {
            return undefined;
        }
        return gameEntries[gameEntries.length - 1];
    }

    /**
     * Get all entries within a date range
     */
    public getEntriesByDateRange(startDate: string, endDate: string): AuditTrailEntry[] {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return this.entries.filter(entry => {
            const entryTime = new Date(entry.timestamp).getTime();
            return entryTime >= start && entryTime <= end;
        });
    }

    /**
     * Get all entries by a specific reviewer
     */
    public getEntriesByReviewer(reviewerId: string): AuditTrailEntry[] {
        return this.entries.filter(entry => entry.reviewer.id === reviewerId);
    }

    /**
     * Get all entries by reviewer type
     */
    public getEntriesByReviewerType(type: 'human' | 'automated' | 'system'): AuditTrailEntry[] {
        return this.entries.filter(entry => entry.reviewer.type === type);
    }

    /**
     * Get entries with a specific status
     */
    public getEntriesByStatus(status: QualityGateStatus): AuditTrailEntry[] {
        return this.entries.filter(entry => entry.result.status === status);
    }

    /**
     * Get all entries
     */
    public getAllEntries(): AuditTrailEntry[] {
        return [...this.entries];
    }

    /**
     * Get a summary of the audit trail
     */
    public getSummary(limit: number = 10): AuditTrailSummary {
        const totalChecks = this.entries.length;
        const passedChecks = this.entries.filter(e => e.result.status === 'passed').length;
        const failedChecks = this.entries.filter(e => e.result.status === 'failed').length;
        const pendingChecks = this.entries.filter(e => e.result.status === 'pending').length;

        const passRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

        const sortedByDate = [...this.entries].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const dateRange = this.entries.length > 0
            ? {
                earliest: sortedByDate[sortedByDate.length - 1].timestamp,
                latest: sortedByDate[0].timestamp,
            }
            : { earliest: '', latest: '' };

        return {
            totalChecks,
            passedChecks,
            failedChecks,
            pendingChecks,
            passRate: Math.round(passRate * 100) / 100,
            dateRange,
            recentEntries: sortedByDate.slice(0, limit),
        };
    }

    /**
     * Get the total number of entries
     */
    public getEntryCount(): number {
        return this.entries.length;
    }

    /**
     * Clear all entries
     */
    public clear(): void {
        this.entries = [];
    }

    /**
     * Export audit trail to JSON
     */
    public exportToJSON(): string {
        return JSON.stringify(this.entries, null, 2);
    }

    /**
     * Import audit trail from JSON
     */
    public importFromJSON(json: string): void {
        const imported = JSON.parse(json);
        if (Array.isArray(imported)) {
            this.entries = imported;
        }
    }

    /**
     * Generate a unique entry ID
     */
    private generateEntryId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `audit-${timestamp}-${random}`;
    }

    /**
     * Enforce maximum entries limit
     */
    private enforceMaxEntries(): void {
        if (this.entries.length > this.config.maxEntries) {
            this.entries = this.entries.slice(-this.config.maxEntries);
        }
    }
}

/**
 * Create a default reviewer for automated checks
 */
export function createAutomatedReviewer(reviewerId: string = 'automated'): ReviewerInfo {
    return {
        id: reviewerId,
        name: 'Automated Quality Gate',
        type: 'automated',
        role: 'CI/CD Pipeline',
    };
}

/**
 * Create a default reviewer for human checks
 */
export function createHumanReviewer(id: string, name: string, role?: string): ReviewerInfo {
    return {
        id,
        name,
        type: 'human',
        role,
    };
}

/**
 * Create a system reviewer
 */
export function createSystemReviewer(): ReviewerInfo {
    return {
        id: 'system',
        name: 'System',
        type: 'system',
        role: 'Quality Gate System',
    };
}