// Release Certificate Generation for Game Quality System
// Validates: Requirement 9.4 - Generate Release_Certificate and update game status to "Production"

import type { Game, AccessibilityCheck } from '../types';
import type { GateVerificationResult, CheckVerificationResult } from './gateVerification';

/**
 * Release Certificate interface
 * Contains all information required for a production release certificate
 */
export interface ReleaseCertificate {
    certificateId: string;
    gameId: string;
    gameName: string;
    releaseDate: string;
    releaseVersion: string;
    verificationResult: {
        allChecksPassed: boolean;
        gateStatus: 'passed' | 'failed' | 'pending';
        passedChecks: string[];
        failedChecks: string[];
    };
    auditSummary: {
        totalScore: number;
        minScoreRequired: number;
        isFlaggedForImprovement: boolean;
    };
    accessibilityCompliance: {
        colorContrastRatio: number;
        keyboardNavigation: boolean;
        screenReaderSupport: boolean;
        timeoutOptions: boolean;
        complianceLevel: string;
    };
    testSummary: {
        passed: number;
        failed: number;
        skipped: number;
        coverage: number | null;
    };
    documentationStatus: {
        changeLogComplete: boolean;
        implementationReportComplete: boolean;
        metricsComplete: boolean;
    };
    issuedAt: string;
    issuedBy: string;
    validUntil: string;
}

/**
 * Input for certificate generation
 */
export interface CertificateGenerationInput {
    game: Game;
    verificationResult: GateVerificationResult;
    testResults?: {
        passed: number;
        failed: number;
        skipped: number;
        coverage?: number;
    };
    accessibilityCheck?: AccessibilityCheck;
    documentationCheck?: {
        hasChangeLog: boolean;
        hasImplementationReport: boolean;
        hasMetrics: boolean;
    };
    reviewer?: string;
    releaseVersion?: string;
}

/**
 * Configuration for certificate generation
 */
export interface CertificateConfig {
    certificateValidityDays: number;
    defaultReleaseVersion: string;
    issuerName: string;
}

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
    certificateValidityDays: 365,
    defaultReleaseVersion: '1.0.0',
    issuerName: 'Quality Gate System',
};

/**
 * Release Certificate Generator Class
 * Generates comprehensive release certificates for games that pass all quality gate checks
 */
export class ReleaseCertificateGenerator {
    private readonly config: CertificateConfig;

    constructor(config: Partial<CertificateConfig> = {}) {
        this.config = { ...DEFAULT_CERTIFICATE_CONFIG, ...config };
    }

    /**
     * Generates a release certificate for a game that has passed all quality gate checks
     * Validates: Requirement 9.4 - Generate Release_Certificate and update game status to "Production"
     */
    public generateCertificate(input: CertificateGenerationInput): ReleaseCertificate {
        const { game, verificationResult, testResults, accessibilityCheck, documentationCheck, reviewer, releaseVersion } = input;

        // Validate that all checks passed before generating certificate
        if (!verificationResult.allChecksPassed) {
            throw new Error(`Cannot generate release certificate: game ${game.id} did not pass all quality gate checks`);
        }

        const releaseDate = new Date().toISOString().split('T')[0];
        const certificateId = this.generateCertificateId(game.id, releaseDate);
        const issuedAt = new Date().toISOString();
        const validUntil = this.calculateValidUntil(this.config.certificateValidityDays);

        // Extract audit summary from verification result
        const auditResult = verificationResult.verificationResults.find((r: CheckVerificationResult) => r.check === 'All_Audit_Checks_Passed');
        const testsResult = verificationResult.verificationResults.find((r: CheckVerificationResult) => r.check === 'All_Tests_Passed');
        const accessibilityResult = verificationResult.verificationResults.find((r: CheckVerificationResult) => r.check === 'Accessibility_Compliance');
        const documentationResult = verificationResult.verificationResults.find((r: CheckVerificationResult) => r.check === 'Documentation_Complete');

        // Use extracted values
        void testsResult;
        void accessibilityResult;
        void documentationResult;

        return {
            certificateId,
            gameId: game.id,
            gameName: game.name,
            releaseDate,
            releaseVersion: releaseVersion || this.config.defaultReleaseVersion,
            verificationResult: {
                allChecksPassed: verificationResult.allChecksPassed,
                gateStatus: verificationResult.gateStatus,
                passedChecks: verificationResult.passedChecks,
                failedChecks: verificationResult.failedChecks,
            },
            auditSummary: {
                totalScore: auditResult?.evidence?.totalScore as number ?? 0,
                minScoreRequired: 12,
                isFlaggedForImprovement: auditResult?.evidence?.isFlaggedForImprovement as boolean ?? false,
            },
            accessibilityCompliance: {
                colorContrastRatio: accessibilityCheck?.colorContrastRatio ?? 0,
                keyboardNavigation: accessibilityCheck?.keyboardNavigation ?? false,
                screenReaderSupport: accessibilityCheck?.screenReaderSupport ?? false,
                timeoutOptions: accessibilityCheck?.timeoutOptions ?? false,
                complianceLevel: accessibilityCheck?.complianceLevel ?? 'none',
            },
            testSummary: {
                passed: testResults?.passed ?? 0,
                failed: testResults?.failed ?? 0,
                skipped: testResults?.skipped ?? 0,
                coverage: testResults?.coverage ?? null,
            },
            documentationStatus: {
                changeLogComplete: documentationCheck?.hasChangeLog ?? false,
                implementationReportComplete: documentationCheck?.hasImplementationReport ?? false,
                metricsComplete: documentationCheck?.hasMetrics ?? false,
            },
            issuedAt,
            issuedBy: reviewer || this.config.issuerName,
            validUntil,
        };
    }

    /**
     * Generates a unique certificate ID
     */
    public generateCertificateId(gameId: string, releaseDate: string): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        return `RELEASE-${gameId.toUpperCase()}-${releaseDate}-${timestamp}`;
    }

    /**
     * Calculates the valid until date based on validity period
     */
    public calculateValidUntil(daysFromNow: number): string {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + daysFromNow);
        return validUntil.toISOString().split('T')[0];
    }

    /**
     * Validates a certificate is still valid
     */
    public isCertificateValid(certificate: ReleaseCertificate): boolean {
        const today = new Date().toISOString().split('T')[0];
        return certificate.validUntil >= today && certificate.verificationResult.allChecksPassed;
    }

    /**
     * Gets the configuration
     */
    public getConfig(): CertificateConfig {
        return { ...this.config };
    }
}

/**
 * Game Status Updater
 * Updates game status to "Production" after successful release
 */
export class GameStatusUpdater {
    /**
     * Updates a game's implementation status to "Production"
     * Validates: Requirement 9.4 - Update game status to "Production"
     */
    public updateToProduction(game: Game, _certificate: ReleaseCertificate): Game {
        return {
            ...game,
            implementationStatus: 'production',
            lastUpdated: new Date().toISOString(),
        };
    }

    /**
     * Validates that a game can be updated to production status
     */
    public canUpdateToProduction(game: Game, certificate: ReleaseCertificate): { canUpdate: boolean; reason?: string } {
        if (game.implementationStatus === 'production') {
            return { canUpdate: false, reason: 'Game is already in production' };
        }

        if (!certificate.verificationResult.allChecksPassed) {
            return { canUpdate: false, reason: 'Certificate is not valid - not all checks passed' };
        }

        if (!this.isCertificateValid(certificate)) {
            return { canUpdate: false, reason: 'Certificate has expired' };
        }

        return { canUpdate: true };
    }

    /**
     * Checks if a certificate is valid
     */
    public isCertificateValid(certificate: ReleaseCertificate): boolean {
        const today = new Date().toISOString().split('T')[0];
        return certificate.validUntil >= today;
    }
}

/**
 * Combined Release Manager
 * Handles both certificate generation and status updates
 */
export class ReleaseManager {
    private readonly certificateGenerator: ReleaseCertificateGenerator;
    private readonly statusUpdater: GameStatusUpdater;

    constructor(certificateConfig?: Partial<CertificateConfig>) {
        this.certificateGenerator = new ReleaseCertificateGenerator(certificateConfig);
        this.statusUpdater = new GameStatusUpdater();
    }

    /**
     * Generates a release certificate and updates game status to production
     * Validates: Requirement 9.4 - Generate Release_Certificate and update game status to "Production"
     */
    public releaseGame(input: CertificateGenerationInput): { certificate: ReleaseCertificate; updatedGame: Game } {
        // Generate the certificate
        const certificate = this.certificateGenerator.generateCertificate(input);

        // Update the game status
        const updatedGame = this.statusUpdater.updateToProduction(input.game, certificate);

        return { certificate, updatedGame };
    }

    /**
     * Validates if a game can be released
     */
    public canRelease(input: CertificateGenerationInput): { canRelease: boolean; reason?: string } {
        if (!input.verificationResult.allChecksPassed) {
            return { canRelease: false, reason: 'Not all quality gate checks passed' };
        }

        return { canRelease: true };
    }

    /**
     * Gets the certificate generator
     */
    public getCertificateGenerator(): ReleaseCertificateGenerator {
        return this.certificateGenerator;
    }

    /**
     * Gets the status updater
     */
    public getStatusUpdater(): GameStatusUpdater {
        return this.statusUpdater;
    }
}

/**
 * Convenience function to generate a release certificate
 */
export function generateReleaseCertificate(input: CertificateGenerationInput): ReleaseCertificate {
    const generator = new ReleaseCertificateGenerator();
    return generator.generateCertificate(input);
}

/**
 * Convenience function to update game status to production
 */
export function updateGameToProduction(game: Game, certificate: ReleaseCertificate): Game {
    const updater = new GameStatusUpdater();
    return updater.updateToProduction(game, certificate);
}

/**
 * Convenience function to release a game (generate certificate + update status)
 */
export function releaseGame(input: CertificateGenerationInput): { certificate: ReleaseCertificate; updatedGame: Game } {
    const manager = new ReleaseManager();
    return manager.releaseGame(input);
}
