// Gate Verification Logic for Quality Gate
// Verifies all required checks before production release

import type {
    QualityGateStatus,
    AuditReport,
    AccessibilityCheck,
} from '../types';

/**
 * Required checks for production release as per Requirement 9.1
 */
export const REQUIRED_CHECKS = [
    'All_Audit_Checks_Passed',
    'All_Tests_Passed',
    'Accessibility_Compliance',
    'Documentation_Complete',
] as const;

export type RequiredCheck = typeof REQUIRED_CHECKS[number];

/**
 * Verification result for a single required check
 */
export interface CheckVerificationResult {
    check: RequiredCheck;
    passed: boolean;
    details: string;
    evidence?: Record<string, unknown>;
}

/**
 * Comprehensive gate verification result
 */
export interface GateVerificationResult {
    gameId: string;
    allChecksPassed: boolean;
    verificationResults: CheckVerificationResult[];
    failedChecks: RequiredCheck[];
    passedChecks: RequiredCheck[];
    gateStatus: QualityGateStatus;
    releaseReady: boolean;
    auditTrail: AuditTrailEntry[];
    timestamp: string;
}

/**
 * Audit trail entry for tracking verification history
 */
export interface AuditTrailEntry {
    check: RequiredCheck;
    status: 'passed' | 'failed' | 'pending';
    timestamp: string;
    reviewer?: string;
    details: string;
    evidence?: Record<string, unknown>;
}

/**
 * Input data for gate verification
 */
export interface GateVerificationInput {
    gameId: string;
    auditReport?: AuditReport | null;
    testResults?: TestResultsInput | null;
    accessibilityCheck?: AccessibilityCheck | null;
    documentation?: DocumentationCheckInput | null;
    reviewer?: string;
}

/**
 * Test results input for verification
 */
export interface TestResultsInput {
    passed: number;
    failed: number;
    skipped: number;
    coverage?: number;
}

/**
 * Documentation check input
 */
export interface DocumentationCheckInput {
    hasChangeLog: boolean;
    hasImplementationReport: boolean;
    hasMetrics: boolean;
    changeLogPath?: string;
    implementationReportPath?: string;
    metricsPath?: string;
}

/**
 * Default configuration for gate verification
 */
export const DEFAULT_GATE_VERIFICATION_CONFIG: GateVerificationConfig = {
    minAuditScore: 12,
    minTestCoverage: 80,
    minAccessibilityScore: 4.5,
    requireAllDocumentation: true,
    requireReviewer: false,
};

export interface GateVerificationConfig {
    minAuditScore: number;
    minTestCoverage: number;
    minAccessibilityScore: number;
    requireAllDocumentation: boolean;
    requireReviewer: boolean;
}

/**
 * Gate Verification Logic Class
 * Verifies all required checks before production release per Requirement 9.1
 */
export class GateVerificationLogic {
    private readonly config: GateVerificationConfig;

    constructor(config: Partial<GateVerificationConfig> = {}) {
        this.config = { ...DEFAULT_GATE_VERIFICATION_CONFIG, ...config };
    }

    /**
     * Verifies all required checks for production release
     * Validates: Requirement 9.1 - All_Audit_Checks_Passed, All_Tests_Passed, Accessibility_Compliance, Documentation_Complete
     */
    public verify(input: GateVerificationInput): GateVerificationResult {
        const { gameId, auditReport, testResults, accessibilityCheck, documentation, reviewer } = input;
        const timestamp = new Date().toISOString();

        // Run all verifications
        const auditResult = this.verifyAuditChecks(auditReport);
        const testsResult = this.verifyTestsPassed(testResults);
        const accessibilityResult = this.verifyAccessibilityCompliance(accessibilityCheck);
        const documentationResult = this.verifyDocumentationComplete(documentation);

        const verificationResults: CheckVerificationResult[] = [
            auditResult,
            testsResult,
            accessibilityResult,
            documentationResult,
        ];

        const passedChecks = verificationResults
            .filter(r => r.passed)
            .map(r => r.check);
        const failedChecks = verificationResults
            .filter(r => !r.passed)
            .map(r => r.check);

        const allChecksPassed = failedChecks.length === 0;
        const gateStatus: QualityGateStatus = allChecksPassed ? 'passed' : 'failed';
        const releaseReady = allChecksPassed;

        // Build audit trail
        const auditTrail: AuditTrailEntry[] = verificationResults.map(result => ({
            check: result.check,
            status: result.passed ? 'passed' : 'failed',
            timestamp,
            reviewer,
            details: result.details,
            evidence: result.evidence,
        }));

        return {
            gameId,
            allChecksPassed,
            verificationResults,
            failedChecks,
            passedChecks,
            gateStatus,
            releaseReady,
            auditTrail,
            timestamp,
        };
    }

    /**
     * Verifies All_Audit_Checks_Passed
     * A game passes audit checks if:
     * - Audit report exists
     * - Total score >= minimum (12)
     * - Not flagged for improvement
     */
    private verifyAuditChecks(auditReport: AuditReport | null | undefined): CheckVerificationResult {
        const check: RequiredCheck = 'All_Audit_Checks_Passed';

        if (!auditReport) {
            return {
                check,
                passed: false,
                details: 'No audit report available',
                evidence: { hasAuditReport: false },
            };
        }

        const issues: string[] = [];
        const evidence: Record<string, unknown> = {
            hasAuditReport: true,
            totalScore: auditReport.totalScore,
            minScoreRequired: this.config.minAuditScore,
            isFlaggedForImprovement: auditReport.isFlaggedForImprovement,
        };

        if (auditReport.totalScore < this.config.minAuditScore) {
            issues.push(`Audit score ${auditReport.totalScore} is below minimum ${this.config.minAuditScore}`);
        }

        if (auditReport.isFlaggedForImprovement) {
            issues.push('Game is flagged for improvement');
        }

        const passed = issues.length === 0;

        return {
            check,
            passed,
            details: passed
                ? `Audit passed (score: ${auditReport.totalScore}, minimum: ${this.config.minAuditScore})`
                : `Audit failed: ${issues.join('; ')}`,
            evidence,
        };
    }

    /**
     * Verifies All_Tests_Passed
     * Tests pass if:
     * - No failed tests
     * - Test coverage >= minimum (80%)
     */
    private verifyTestsPassed(testResults: TestResultsInput | null | undefined): CheckVerificationResult {
        const check: RequiredCheck = 'All_Tests_Passed';

        if (!testResults) {
            return {
                check,
                passed: false,
                details: 'No test results available',
                evidence: { hasTestResults: false },
            };
        }

        const issues: string[] = [];
        const evidence: Record<string, unknown> = {
            hasTestResults: true,
            passed: testResults.passed,
            failed: testResults.failed,
            skipped: testResults.skipped,
            coverage: testResults.coverage,
            minCoverageRequired: this.config.minTestCoverage,
        };

        if (testResults.failed > 0) {
            issues.push(`${testResults.failed} tests failed`);
        }

        if (testResults.coverage !== undefined && testResults.coverage < this.config.minTestCoverage) {
            issues.push(`Test coverage ${testResults.coverage}% is below minimum ${this.config.minTestCoverage}%`);
        }

        const passed = issues.length === 0;

        return {
            check,
            passed,
            details: passed
                ? `All tests passed (${testResults.passed} passed, ${testResults.skipped} skipped, ${testResults.coverage ?? 'N/A'}% coverage)`
                : `Tests failed: ${issues.join('; ')}`,
            evidence,
        };
    }

    /**
     * Verifies Accessibility_Compliance
     * Accessibility passes if:
     * - Color contrast ratio >= 4.5:1
     * - Keyboard navigation is supported
     * - Screen reader support is available
     * - Timeout options are available
     */
    private verifyAccessibilityCompliance(accessibilityCheck: AccessibilityCheck | null | undefined): CheckVerificationResult {
        const check: RequiredCheck = 'Accessibility_Compliance';

        if (!accessibilityCheck) {
            return {
                check,
                passed: false,
                details: 'No accessibility check available',
                evidence: { hasAccessibilityCheck: false },
            };
        }

        const issues: string[] = [];
        const evidence: Record<string, unknown> = {
            hasAccessibilityCheck: true,
            colorContrastRatio: accessibilityCheck.colorContrastRatio,
            keyboardNavigation: accessibilityCheck.keyboardNavigation,
            screenReaderSupport: accessibilityCheck.screenReaderSupport,
            timeoutOptions: accessibilityCheck.timeoutOptions,
            complianceLevel: accessibilityCheck.complianceLevel,
            minContrastRequired: this.config.minAccessibilityScore,
        };

        if (accessibilityCheck.colorContrastRatio < this.config.minAccessibilityScore) {
            issues.push(`Color contrast ratio ${accessibilityCheck.colorContrastRatio} is below minimum ${this.config.minAccessibilityScore}`);
        }

        if (!accessibilityCheck.keyboardNavigation) {
            issues.push('Keyboard navigation not implemented');
        }

        if (!accessibilityCheck.screenReaderSupport) {
            issues.push('Screen reader support not implemented');
        }

        if (!accessibilityCheck.timeoutOptions) {
            issues.push('Timeout options not implemented');
        }

        const passed = issues.length === 0;

        return {
            check,
            passed,
            details: passed
                ? `Accessibility compliant (WCAG ${accessibilityCheck.complianceLevel}, contrast: ${accessibilityCheck.colorContrastRatio}:1)`
                : `Accessibility failed: ${issues.join('; ')}`,
            evidence,
        };
    }

    /**
     * Verifies Documentation_Complete
     * Documentation passes if:
     * - Change log exists
     * - Implementation report exists
     * - Metrics summary exists
     */
    private verifyDocumentationComplete(documentation: DocumentationCheckInput | null | undefined): CheckVerificationResult {
        const check: RequiredCheck = 'Documentation_Complete';

        if (!documentation) {
            return {
                check,
                passed: false,
                details: 'No documentation check available',
                evidence: { hasDocumentation: false },
            };
        }

        const issues: string[] = [];
        const evidence: Record<string, unknown> = {
            hasDocumentation: true,
            hasChangeLog: documentation.hasChangeLog,
            hasImplementationReport: documentation.hasImplementationReport,
            hasMetrics: documentation.hasMetrics,
        };

        if (!documentation.hasChangeLog) {
            issues.push('Change log missing');
        }

        if (!documentation.hasImplementationReport) {
            issues.push('Implementation report missing');
        }

        if (!documentation.hasMetrics) {
            issues.push('Metrics summary missing');
        }

        const passed = issues.length === 0;

        return {
            check,
            passed,
            details: passed
                ? 'All documentation complete'
                : `Documentation incomplete: ${issues.join('; ')}`,
            evidence,
        };
    }

    /**
     * Generates a release certificate when all checks pass
     * Validates: Requirement 9.4 - Generate Release_Certificate and update game status
     */
    public generateReleaseCertificate(gameId: string, verificationResult: GateVerificationResult): string {
        if (!verificationResult.allChecksPassed) {
            throw new Error('Cannot generate release certificate: not all checks passed');
        }

        const date = new Date().toISOString().split('T')[0];
        const certificateId = `RELEASE-${gameId}-${date}`;

        return certificateId;
    }

    /**
     * Gets the list of required checks
     */
    public getRequiredChecks(): RequiredCheck[] {
        return [...REQUIRED_CHECKS];
    }

    /**
     * Gets the current configuration
     */
    public getConfig(): GateVerificationConfig {
        return { ...this.config };
    }
}

/**
 * Convenience function to run gate verification
 */
export function verifyForRelease(input: GateVerificationInput, config?: Partial<GateVerificationConfig>): GateVerificationResult {
    const verifier = new GateVerificationLogic(config);
    return verifier.verify(input);
}

/**
 * Checks if a game is ready for release based on verification result
 * Validates: Requirement 9.2 - Block release if any check fails
 */
export function canRelease(verificationResult: GateVerificationResult): boolean {
    return verificationResult.releaseReady;
}

/**
 * Gets detailed failure reasons for failed checks
 */
export function getFailureReasons(verificationResult: GateVerificationResult): string[] {
    return verificationResult.verificationResults
        .filter(r => !r.passed)
        .map(r => r.details);
}
