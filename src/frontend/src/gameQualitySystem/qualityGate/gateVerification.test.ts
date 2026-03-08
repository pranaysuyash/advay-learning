// Property-based tests for Gate Verification Logic
// Feature: game-quality-and-new-games, Property 28: Quality gate verifies all required checks

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    GateVerificationLogic,
    verifyForRelease,
    canRelease,
    getFailureReasons,
    REQUIRED_CHECKS,
    type GateVerificationInput,
    type TestResultsInput,
    type DocumentationCheckInput,
} from './gateVerification';
import type { AuditReport, AccessibilityCheck } from '../types';

// Helper function to generate random audit report
function generateRandomAuditReport(overrides: Partial<AuditReport> = {}): AuditReport {
    const totalScore = Math.floor(Math.random() * 25) + 1; // 1-25
    const isFlaggedForImprovement = totalScore < 12;

    return {
        gameId: `game-${Math.random().toString(36).substring(7)}`,
        gameName: `Test Game ${Math.random().toString(36).substring(7)}`,
        auditDate: new Date().toISOString(),
        auditor: 'Test Auditor',
        scores: [],
        totalScore,
        isFlaggedForImprovement,
        improvementRecommendations: isFlaggedForImprovement ? ['Improve quality'] : [],
        ...overrides,
    };
}

// Helper function to generate random test results
function generateRandomTestResults(overrides: Partial<TestResultsInput> = {}): TestResultsInput {
    const passed = Math.floor(Math.random() * 100) + 1;
    const failed = Math.floor(Math.random() * 10);
    const skipped = Math.floor(Math.random() * 5);
    const coverage = Math.floor(Math.random() * 30) + 70; // 70-100

    return {
        passed,
        failed,
        skipped,
        coverage,
        ...overrides,
    };
}

// Helper function to generate random accessibility check
function generateRandomAccessibilityCheck(overrides: Partial<AccessibilityCheck> = {}): AccessibilityCheck {
    const colorContrastRatio = Math.random() * 3 + 3; // 3-6
    const keyboardNavigation = Math.random() > 0.2;
    const screenReaderSupport = Math.random() > 0.2;
    const timeoutOptions = Math.random() > 0.2;

    const allPassed = colorContrastRatio >= 4.5 && keyboardNavigation && screenReaderSupport && timeoutOptions;
    const complianceLevel = allPassed ? 'WCAG-AA' : (colorContrastRatio >= 4.5 ? 'partial' : 'none');

    return {
        colorContrastRatio,
        keyboardNavigation,
        screenReaderSupport,
        timeoutOptions,
        complianceLevel,
        ...overrides,
    };
}

// Helper function to generate random documentation check
function generateRandomDocumentationCheck(overrides: Partial<DocumentationCheckInput> = {}): DocumentationCheckInput {
    const hasChangeLog = Math.random() > 0.2;
    const hasImplementationReport = Math.random() > 0.2;
    const hasMetrics = Math.random() > 0.2;

    return {
        hasChangeLog,
        hasImplementationReport,
        hasMetrics,
        ...overrides,
    };
}

describe('GateVerificationLogic', () => {
    let verifier: GateVerificationLogic;

    beforeEach(() => {
        verifier = new GateVerificationLogic();
    });

    describe('Property 28: Quality gate verifies all required checks', () => {
        it('should verify all four required checks exist in verification results', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 15, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 85 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 5.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            // Verify all required checks are present
            const checkNames = result.verificationResults.map(r => r.check);
            expect(checkNames).toContain('All_Audit_Checks_Passed');
            expect(checkNames).toContain('All_Tests_Passed');
            expect(checkNames).toContain('Accessibility_Compliance');
            expect(checkNames).toContain('Documentation_Complete');
            expect(checkNames).toHaveLength(4);
        });

        it('should pass when all checks pass', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(true);
            expect(result.gateStatus).toBe('passed');
            expect(result.releaseReady).toBe(true);
            expect(result.failedChecks).toHaveLength(0);
            expect(result.passedChecks).toHaveLength(4);
        });

        it('should fail when any single check fails', () => {
            // Test audit failure
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 8, isFlaggedForImprovement: true }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.gateStatus).toBe('failed');
            expect(result.releaseReady).toBe(false);
            expect(result.failedChecks).toContain('All_Audit_Checks_Passed');
        });

        it('should fail when test results have failures', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 5, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.failedChecks).toContain('All_Tests_Passed');
        });

        it('should fail when accessibility check fails', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 3.5,
                    keyboardNavigation: false,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.failedChecks).toContain('Accessibility_Compliance');
        });

        it('should fail when documentation is incomplete', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: false,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.failedChecks).toContain('Documentation_Complete');
        });

        it('should fail when no audit report is provided', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: null,
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.failedChecks).toContain('All_Audit_Checks_Passed');
        });

        it('should fail when no test results are provided', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: null,
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.failedChecks).toContain('All_Tests_Passed');
        });

        it('should fail when no accessibility check is provided', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: null,
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.failedChecks).toContain('Accessibility_Compliance');
        });

        it('should fail when no documentation is provided', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: null,
            };

            const result = verifier.verify(input);

            expect(result.allChecksPassed).toBe(false);
            expect(result.failedChecks).toContain('Documentation_Complete');
        });
    });

    describe('Audit trail', () => {
        it('should create audit trail entries for all checks', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
                reviewer: 'Test Reviewer',
            };

            const result = verifier.verify(input);

            expect(result.auditTrail).toHaveLength(4);
            result.auditTrail.forEach(entry => {
                expect(entry.timestamp).toBeDefined();
                expect(entry.reviewer).toBe('Test Reviewer');
                expect(entry.status).toBeDefined();
                expect(entry.details).toBeDefined();
            });
        });
    });

    describe('Required checks list', () => {
        it('should return all required checks', () => {
            const checks = verifier.getRequiredChecks();

            expect(checks).toEqual(REQUIRED_CHECKS);
            expect(checks).toContain('All_Audit_Checks_Passed');
            expect(checks).toContain('All_Tests_Passed');
            expect(checks).toContain('Accessibility_Compliance');
            expect(checks).toContain('Documentation_Complete');
        });
    });

    describe('Release certificate generation', () => {
        it('should generate certificate when all checks pass', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);
            const certificate = verifier.generateReleaseCertificate(input.gameId, result);

            expect(certificate).toMatch(/^RELEASE-test-game-\d{4}-\d{2}-\d{2}$/);
        });

        it('should throw error when generating certificate for failed verification', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 8, isFlaggedForImprovement: true }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifier.verify(input);

            expect(() => verifier.generateReleaseCertificate(input.gameId, result)).toThrow();
        });
    });
});

describe('Convenience functions', () => {
    describe('verifyForRelease', () => {
        it('should verify game for release with default config', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifyForRelease(input);

            expect(result.gameId).toBe('test-game');
            expect(result.allChecksPassed).toBe(true);
        });
    });

    describe('canRelease', () => {
        it('should return true when all checks pass', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifyForRelease(input);

            expect(canRelease(result)).toBe(true);
        });

        it('should return false when any check fails', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 8, isFlaggedForImprovement: true }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifyForRelease(input);

            expect(canRelease(result)).toBe(false);
        });
    });

    describe('getFailureReasons', () => {
        it('should return empty array when all checks pass', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
                testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
                accessibilityCheck: generateRandomAccessibilityCheck({
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                }),
                documentation: generateRandomDocumentationCheck({
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                }),
            };

            const result = verifyForRelease(input);

            expect(getFailureReasons(result)).toHaveLength(0);
        });

        it('should return failure reasons when checks fail', () => {
            const input: GateVerificationInput = {
                gameId: 'test-game',
                auditReport: generateRandomAuditReport({ totalScore: 8, isFlaggedForImprovement: true }),
                testResults: null,
                accessibilityCheck: null,
                documentation: null,
            };

            const result = verifyForRelease(input);
            const reasons = getFailureReasons(result);

            expect(reasons.length).toBeGreaterThan(0);
            reasons.forEach(reason => {
                expect(typeof reason).toBe('string');
                expect(reason.length).toBeGreaterThan(0);
            });
        });
    });
});

describe('Edge cases', () => {
    it('should handle audit score exactly at minimum (12)', () => {
        const input: GateVerificationInput = {
            gameId: 'test-game',
            auditReport: generateRandomAuditReport({ totalScore: 12, isFlaggedForImprovement: false }),
            testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
            accessibilityCheck: generateRandomAccessibilityCheck({
                colorContrastRatio: 7.0,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
            }),
            documentation: generateRandomDocumentationCheck({
                hasChangeLog: true,
                hasImplementationReport: true,
                hasMetrics: true,
            }),
        };

        const result = verifyForRelease(input);

        expect(result.verificationResults.find(r => r.check === 'All_Audit_Checks_Passed')?.passed).toBe(true);
    });

    it('should handle audit score just below minimum (11)', () => {
        const input: GateVerificationInput = {
            gameId: 'test-game',
            auditReport: generateRandomAuditReport({ totalScore: 11, isFlaggedForImprovement: true }),
            testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
            accessibilityCheck: generateRandomAccessibilityCheck({
                colorContrastRatio: 7.0,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
            }),
            documentation: generateRandomDocumentationCheck({
                hasChangeLog: true,
                hasImplementationReport: true,
                hasMetrics: true,
            }),
        };

        const result = verifyForRelease(input);

        expect(result.verificationResults.find(r => r.check === 'All_Audit_Checks_Passed')?.passed).toBe(false);
    });

    it('should handle test coverage exactly at minimum (80%)', () => {
        const input: GateVerificationInput = {
            gameId: 'test-game',
            auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
            testResults: generateRandomTestResults({ failed: 0, coverage: 80 }),
            accessibilityCheck: generateRandomAccessibilityCheck({
                colorContrastRatio: 7.0,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
            }),
            documentation: generateRandomDocumentationCheck({
                hasChangeLog: true,
                hasImplementationReport: true,
                hasMetrics: true,
            }),
        };

        const result = verifyForRelease(input);

        expect(result.verificationResults.find(r => r.check === 'All_Tests_Passed')?.passed).toBe(true);
    });

    it('should handle test coverage just below minimum (79%)', () => {
        const input: GateVerificationInput = {
            gameId: 'test-game',
            auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
            testResults: generateRandomTestResults({ failed: 0, coverage: 79 }),
            accessibilityCheck: generateRandomAccessibilityCheck({
                colorContrastRatio: 7.0,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
            }),
            documentation: generateRandomDocumentationCheck({
                hasChangeLog: true,
                hasImplementationReport: true,
                hasMetrics: true,
            }),
        };

        const result = verifyForRelease(input);

        expect(result.verificationResults.find(r => r.check === 'All_Tests_Passed')?.passed).toBe(false);
    });

    it('should handle color contrast exactly at minimum (4.5:1)', () => {
        const input: GateVerificationInput = {
            gameId: 'test-game',
            auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
            testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
            accessibilityCheck: generateRandomAccessibilityCheck({
                colorContrastRatio: 4.5,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
            }),
            documentation: generateRandomDocumentationCheck({
                hasChangeLog: true,
                hasImplementationReport: true,
                hasMetrics: true,
            }),
        };

        const result = verifyForRelease(input);

        expect(result.verificationResults.find(r => r.check === 'Accessibility_Compliance')?.passed).toBe(true);
    });

    it('should handle color contrast just below minimum (4.49:1)', () => {
        const input: GateVerificationInput = {
            gameId: 'test-game',
            auditReport: generateRandomAuditReport({ totalScore: 20, isFlaggedForImprovement: false }),
            testResults: generateRandomTestResults({ failed: 0, coverage: 90 }),
            accessibilityCheck: generateRandomAccessibilityCheck({
                colorContrastRatio: 4.49,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
            }),
            documentation: generateRandomDocumentationCheck({
                hasChangeLog: true,
                hasImplementationReport: true,
                hasMetrics: true,
            }),
        };

        const result = verifyForRelease(input);

        expect(result.verificationResults.find(r => r.check === 'Accessibility_Compliance')?.passed).toBe(false);
    });
});

describe('Multiple failures', () => {
    it('should report all failed checks when multiple checks fail', () => {
        const input: GateVerificationInput = {
            gameId: 'test-game',
            auditReport: generateRandomAuditReport({ totalScore: 8, isFlaggedForImprovement: true }),
            testResults: generateRandomTestResults({ failed: 5, coverage: 60 }),
            accessibilityCheck: generateRandomAccessibilityCheck({
                colorContrastRatio: 3.0,
                keyboardNavigation: false,
                screenReaderSupport: false,
                timeoutOptions: false,
            }),
            documentation: generateRandomDocumentationCheck({
                hasChangeLog: false,
                hasImplementationReport: false,
                hasMetrics: false,
            }),
        };

        const result = verifyForRelease(input);

        expect(result.allChecksPassed).toBe(false);
        expect(result.failedChecks).toHaveLength(4);
        expect(result.failedChecks).toContain('All_Audit_Checks_Passed');
        expect(result.failedChecks).toContain('All_Tests_Passed');
        expect(result.failedChecks).toContain('Accessibility_Compliance');
        expect(result.failedChecks).toContain('Documentation_Complete');
    });
});