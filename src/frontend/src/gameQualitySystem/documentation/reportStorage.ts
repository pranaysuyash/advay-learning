// Report Storage Module for Game Quality System

import type { DocumentationEntry } from '../types';
import type { MetricsReportData } from './metricsReport';

/**
 * Represents a stored report with metadata
 */
export interface StoredReport {
    id: string;
    type: 'improvement' | 'implementation';
    gameId: string;
    gameName: string;
    filePath: string;
    timestamp: string;
    content: string;
}

/**
 * Configuration for report storage
 */
export interface ReportStorageConfig {
    improvementDirectory: string;
    implementationDirectory: string;
    fileExtension: string;
    includeTimestamp: boolean;
    maxStoredReports: number;
}

/**
 * Default configuration for report storage
 */
export const DEFAULT_REPORT_STORAGE_CONFIG: ReportStorageConfig = {
    improvementDirectory: 'docs/game_improvements',
    implementationDirectory: 'docs/game_implementations',
    fileExtension: 'md',
    includeTimestamp: true,
    maxStoredReports: 100,
};

/**
 * ReportStorage class for storing and managing reports
 * Requirement 8.4: Store improvement reports in docs/game_improvements/ and
 * implementation reports in docs/game_implementations/
 */
export class ReportStorage {
    private readonly config: ReportStorageConfig;
    private storedReports: Map<string, StoredReport>;
    private idCounter = 0;

    constructor(config: Partial<ReportStorageConfig> = {}) {
        this.config = { ...DEFAULT_REPORT_STORAGE_CONFIG, ...config };
        this.storedReports = new Map();
    }

    /**
     * Store an improvement report
     * @param entry - The documentation entry to store
     * @param content - The report content as markdown
     * @returns The stored report metadata
     */
    public storeImprovementReport(entry: DocumentationEntry, content: string): StoredReport {
        const filePath = this.generateFilePath(entry.gameId, 'improvement');

        const report: StoredReport = {
            id: this.generateReportId('IMP'),
            type: 'improvement',
            gameId: entry.gameId,
            gameName: entry.gameId, // Use gameId as identifier
            filePath,
            timestamp: entry.timestamp,
            content,
        };

        this.storedReports.set(report.id, report);
        this.enforceMaxReports();

        return report;
    }

    /**
     * Store an implementation report
     * @param gameId - The ID of the implemented game
     * @param gameName - The name of the implemented game
     * @param content - The report content as markdown
     * @returns The stored report metadata
     */
    public storeImplementationReport(
        gameId: string,
        gameName: string,
        content: string
    ): StoredReport {
        const filePath = this.generateFilePath(gameId, 'implementation');

        const report: StoredReport = {
            id: this.generateReportId('IMPL'),
            type: 'implementation',
            gameId,
            gameName,
            filePath,
            timestamp: new Date().toISOString(),
            content,
        };

        this.storedReports.set(report.id, report);
        this.enforceMaxReports();

        return report;
    }

    /**
     * Store a metrics report
     * @param report - The metrics report to store
     * @param type - Type of report (improvement or implementation)
     * @returns The stored report metadata
     */
    public storeMetricsReport(report: MetricsReportData, type: 'improvement' | 'implementation'): StoredReport {
        const filePath = this.generateFilePath(report.gameId, type);

        const storedReport: StoredReport = {
            id: this.generateReportId('MET'),
            type,
            gameId: report.gameId,
            gameName: report.gameName,
            filePath,
            timestamp: report.reportDate,
            content: report.content ?? '',
        };

        this.storedReports.set(storedReport.id, storedReport);
        this.enforceMaxReports();

        return storedReport;
    }

    /**
     * Get a stored report by ID
     * @param id - The report ID
     * @returns The stored report or undefined if not found
     */
    public getReport(id: string): StoredReport | undefined {
        return this.storedReports.get(id);
    }

    /**
     * Get all reports for a specific game
     * @param gameId - The game ID
     * @returns Array of stored reports for the game
     */
    public getReportsForGame(gameId: string): StoredReport[] {
        return Array.from(this.storedReports.values())
            .filter(report => report.gameId === gameId);
    }

    /**
     * Get all reports of a specific type
     * @param type - The report type
     * @returns Array of stored reports of the specified type
     */
    public getReportsByType(type: 'improvement' | 'implementation'): StoredReport[] {
        return Array.from(this.storedReports.values())
            .filter(report => report.type === type);
    }

    /**
     * Get all stored reports
     * @returns Array of all stored reports
     */
    public getAllReports(): StoredReport[] {
        return Array.from(this.storedReports.values());
    }

    /**
     * Delete a stored report
     * @param id - The report ID to delete
     * @returns True if the report was deleted, false if not found
     */
    public deleteReport(id: string): boolean {
        return this.storedReports.delete(id);
    }

    /**
     * Clear all stored reports
     */
    public clear(): void {
        this.storedReports.clear();
    }

    /**
     * Get the directory path for a report type
     * @param type - The report type
     * @returns The directory path
     */
    public getDirectoryForType(type: 'improvement' | 'implementation'): string {
        return type === 'improvement'
            ? this.config.improvementDirectory
            : this.config.implementationDirectory;
    }

    /**
     * Generate a file path for a report
     * @param gameId - The game ID
     * @param type - The report type
     * @returns The generated file path
     */
    public generateFilePath(gameId: string, type: 'improvement' | 'implementation'): string {
        const directory = this.getDirectoryForType(type);
        const date = new Date().toISOString().split('T')[0];
        const baseName = type === 'improvement' ? 'improvement' : 'implementation';

        if (this.config.includeTimestamp) {
            return `${directory}/${baseName}-${gameId}-${date}.${this.config.fileExtension}`;
        }

        return `${directory}/${baseName}-${gameId}.${this.config.fileExtension}`;
    }

    /**
     * Export all reports as a JSON structure
     * @returns JSON string of all stored reports
     */
    public exportAsJson(): string {
        const reports = Array.from(this.storedReports.values()).map(report => ({
            id: report.id,
            type: report.type,
            gameId: report.gameId,
            gameName: report.gameName,
            filePath: report.filePath,
            timestamp: report.timestamp,
        }));

        return JSON.stringify({
            exportDate: new Date().toISOString(),
            totalReports: reports.length,
            reports,
        }, null, 2);
    }

    /**
     * Enforce maximum number of stored reports
     * Removes oldest reports when limit is exceeded
     */
    private enforceMaxReports(): void {
        if (this.storedReports.size > this.config.maxStoredReports) {
            const sortedReports = Array.from(this.storedReports.entries())
                .sort((a, b) => new Date(a[1].timestamp).getTime() - new Date(b[1].timestamp).getTime());

            const toRemove = sortedReports.slice(0, this.storedReports.size - this.config.maxStoredReports);

            for (const [id] of toRemove) {
                this.storedReports.delete(id);
            }
        }
    }

    private generateReportId(prefix: 'IMP' | 'IMPL' | 'MET'): string {
        this.idCounter += 1;
        return `${prefix}-${Date.now()}-${this.idCounter}`;
    }
}

/**
 * Factory function to create a ReportStorage instance
 * @param config - Optional configuration
 * @returns New ReportStorage instance
 */
export function createReportStorage(config?: Partial<ReportStorageConfig>): ReportStorage {
    return new ReportStorage(config);
}
