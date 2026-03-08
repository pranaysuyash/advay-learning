// Property-based tests for Release Certificate Generation
// Feature: game-quality-and-new-games, Property 31: Passed quality gate generates certificate

import { describe, it, expect, beforeEach } from 'vitest';
import {
    ReleaseCertificateGenerator,
    GameStatusUpdater,
    ReleaseManager,
    generateReleaseCertificate,
    updateGameToProduction,
    releaseGame,
    DEFAULT_CERTIFICATE_CONFIG,
    type CertificateGenerationInput,
} from './releaseCertificate';
import type { Game } from '../types';
import type { GateVerificationResult } from './gateVerification';

// Helper function to generate a passing verification result
function generatePassingVerificationResult(): GateVerificationResult {
    return {
        gameId: 'test-game',
        allChecksPassed: true,
        verificationResults: [
            {
                check: 'All_Audit_Checks_Passed',
                passed: true,
                details: 'Audit passed (score: 20, minimum: 12)',
                evidence: { totalScore: 20, minScoreRequired: 12, isFlaggedForImprovement: false },
            },
            {
                check: 'All_Tests_Passed',
                passed: true,
                details: 'All tests passed (50 passed, 0 skipped, 85% coverage)',
                evidence: { passed: 50, failed: 0, skipped: 0, coverage: 85 },
            },
            {
                check: 'Accessibility_Compliance',
                passed: true,
                details: 'Accessibility compliant (WCAG AA, contrast: 7.0:1)',
                evidence: { colorContrastRatio: 7.0, keyboardNavigation: true, screenReaderSupport: true, timeoutOptions: true },
            },
            {
                check: 'Documentation_Complete',
                passed: true,
                details: 'All documentation complete',
                evidence: { hasChangeLog: true, hasImplementationReport: true, hasMetrics: true },
            },
        ],
        failedChecks: [],
        passedChecks: ['All_Audit_Checks_Passed', 'All_Tests_Passed', 'Accessibility_Compliance', 'Documentation_Complete'],
        gateStatus: 'passed',
        releaseReady: true,
        auditTrail: [],
        timestamp: new Date().toISOString(),
    };
}

// Helper function to generate a failing verification result
function generateFailingVerificationResult(): GateVerificationResult {
    return {
        gameId: 'test-game',
        allChecksPassed: false,
        verificationResults: [
            {
                check: 'All_Audit_Checks_Passed',
                passed: false,
                details: 'Audit failed: Audit score 8 is below minimum 12',
                evidence: { totalScore: 8, minScoreRequired: 12, isFlaggedForImprovement: true },
            },
            {
                check: 'All_Tests_Passed',
                passed: true,
                details: 'All tests passed',
                evidence: { passed: 50, failed: 0, skipped: 0, coverage: 85 },
            },
            {
                check: 'Accessibility_Compliance',
                passed: true,
                details: 'Accessibility compliant',
                evidence: { colorContrastRatio: 7.0, keyboardNavigation: true, screenReaderSupport: true, timeoutOptions: true },
            },
            {
                check: 'Documentation_Complete',
                passed: true,
                details: 'All documentation complete',
                evidence: { hasChangeLog: true, hasImplementationReport: true, hasMetrics: true },
            },
        ],
        failedChecks: ['All_Audit_Checks_Passed'],
        passedChecks: ['All_Tests_Passed', 'Accessibility_Compliance', 'Documentation_Complete'],
        gateStatus: 'failed',
        releaseReady: false,
        auditTrail: [],
        timestamp: new Date().toISOString(),
    };
}

// Helper function to create a test game
function createTestGame(overrides: Partial<Game> = {}): Game {
    return {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game for quality gate verification',
        category: 'Educational',
        ageRange: '6-10',
        difficulty: 'Medium',
        estimatedTime: 15,
        requiredTechnologies: ['TypeScript', 'React'],
        successCriteria: ['Complete all levels', 'Score above 80%'],
        isImplemented: true,
        implementationStatus: 'completed',
        lastUpdated: new Date().toISOString(),
        ...overrides,
    };
}

describe('ReleaseCertificateGenerator', () => {
    let generator: ReleaseCertificateGenerator;

    beforeEach(() => {
        generator = new ReleaseCertificateGenerator();
    });

    describe('Property 31: Passed quality gate generates certificate', () => {
        it('should generate a certificate when all checks pass', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
                testResults: { passed: 50, failed: 0, skipped: 0, coverage: 85 },
                accessibilityCheck: {
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                    complianceLevel: 'WCAG-AA',
                },
                documentationCheck: {
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                },
                reviewer: 'QA Engineer',
            };

            const certificate = generator.generateCertificate(input);

            expect(certificate.certificateId).toMatch(/^RELEASE-TEST-GAME-\d{4}-\d{2}-\d{2}-[A-Z0-9]+$/);
            expect(certificate.gameId).toBe('test-game');
            expect(certificate.gameName).toBe('Test Game');
            expect(certificate.verificationResult.allChecksPassed).toBe(true);
            expect(certificate.verificationResult.gateStatus).toBe('passed');
            expect(certificate.auditSummary.totalScore).toBe(20);
            expect(certificate.accessibilityCompliance.colorContrastRatio).toBe(7.0);
            expect(certificate.testSummary.passed).toBe(50);
            expect(certificate.documentationStatus.changeLogComplete).toBe(true);
            expect(certificate.issuedBy).toBe('QA Engineer');
        });

        it('should throw error when not all checks pass', () => {
            const game = createTestGame();
            const verificationResult = generateFailingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            expect(() => generator.generateCertificate(input)).toThrow('Cannot generate release certificate');
        });

        it('should include correct certificate ID format', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const certificate = generator.generateCertificate(input);

            // Certificate ID format: RELEASE-{GAME_ID}-{DATE}-{TIMESTAMP}
            expect(certificate.certificateId).toMatch(/^RELEASE-[A-Z0-9-]+-\d{4}-\d{2}-\d{2}-[A-Z0-9]+$/);
            expect(certificate.certificateId).toContain('TEST-GAME');
            expect(certificate.certificateId).toContain(new Date().toISOString().split('T')[0]);
        });

        it('should set valid until date based on config', () => {
            const customConfig = { ...DEFAULT_CERTIFICATE_CONFIG, certificateValidityDays: 30 };
            const customGenerator = new ReleaseCertificateGenerator(customConfig);

            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const certificate = customGenerator.generateCertificate(input);
            const validUntil = new Date(certificate.validUntil);
            const today = new Date();
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() + 30);

            expect(validUntil.toISOString().split('T')[0]).toBe(expectedDate.toISOString().split('T')[0]);
        });

        it('should use custom release version when provided', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
                releaseVersion: '2.5.0',
            };

            const certificate = generator.generateCertificate(input);

            expect(certificate.releaseVersion).toBe('2.5.0');
        });

        it('should use default release version when not provided', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const certificate = generator.generateCertificate(input);

            expect(certificate.releaseVersion).toBe(DEFAULT_CERTIFICATE_CONFIG.defaultReleaseVersion);
        });
    });

    describe('Certificate ID generation', () => {
        it('should generate unique IDs for different games', () => {
            const game1 = createTestGame({ id: 'game-1' });
            const game2 = createTestGame({ id: 'game-2' });
            const verificationResult = generatePassingVerificationResult();

            const cert1 = generator.generateCertificate({ game: game1, verificationResult });
            const cert2 = generator.generateCertificate({ game: game2, verificationResult });

            expect(cert1.certificateId).not.toBe(cert2.certificateId);
        });

        it('should include game ID in uppercase in certificate ID', () => {
            const game = createTestGame({ id: 'my-game' });
            const verificationResult = generatePassingVerificationResult();

            const certificate = generator.generateCertificate({ game, verificationResult });

            expect(certificate.certificateId).toContain('MY-GAME');
        });
    });

    describe('Certificate validation', () => {
        it('should validate certificate as valid when not expired', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const certificate = generator.generateCertificate({ game, verificationResult });

            expect(generator.isCertificateValid(certificate)).toBe(true);
        });

        it('should validate certificate as invalid when expired', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const certificate = generator.generateCertificate({ game, verificationResult });
            certificate.validUntil = '2020-01-01'; // Past date

            expect(generator.isCertificateValid(certificate)).toBe(false);
        });
    });
});

describe('GameStatusUpdater', () => {
    let updater: GameStatusUpdater;

    beforeEach(() => {
        updater = new GameStatusUpdater();
    });

    describe('Update to Production', () => {
        it('should update game status to production', () => {
            const game = createTestGame({ implementationStatus: 'completed' });
            const verificationResult = generatePassingVerificationResult();

            const certificate = new ReleaseCertificateGenerator().generateCertificate({
                game,
                verificationResult,
            });

            const updatedGame = updater.updateToProduction(game, certificate);

            expect(updatedGame.implementationStatus).toBe('production');
            expect(updatedGame.lastUpdated).toBeDefined();
        });

        it('should preserve other game properties when updating', () => {
            const game = createTestGame({
                implementationStatus: 'completed',
                description: 'Original description',
                category: 'Educational',
            });
            const verificationResult = generatePassingVerificationResult();

            const certificate = new ReleaseCertificateGenerator().generateCertificate({
                game,
                verificationResult,
            });

            const updatedGame = updater.updateToProduction(game, certificate);

            expect(updatedGame.id).toBe(game.id);
            expect(updatedGame.name).toBe(game.name);
            expect(updatedGame.description).toBe('Original description');
            expect(updatedGame.category).toBe('Educational');
        });
    });

    describe('Can Update Validation', () => {
        it('should allow update when game is not in production', () => {
            const game = createTestGame({ implementationStatus: 'completed' });
            const verificationResult = generatePassingVerificationResult();

            const certificate = new ReleaseCertificateGenerator().generateCertificate({
                game,
                verificationResult,
            });

            const result = updater.canUpdateToProduction(game, certificate);

            expect(result.canUpdate).toBe(true);
        });

        it('should deny update when game is already in production', () => {
            const game = createTestGame({ implementationStatus: 'production' });
            const verificationResult = generatePassingVerificationResult();

            const certificate = new ReleaseCertificateGenerator().generateCertificate({
                game,
                verificationResult,
            });

            const result = updater.canUpdateToProduction(game, certificate);

            expect(result.canUpdate).toBe(false);
            expect(result.reason).toBe('Game is already in production');
        });

        it('should deny update when certificate is not valid', () => {
            const game = createTestGame({ implementationStatus: 'completed' });
            const verificationResult = generatePassingVerificationResult();

            const certificate = new ReleaseCertificateGenerator().generateCertificate({
                game,
                verificationResult,
            });
            certificate.validUntil = '2020-01-01'; // Expired

            const result = updater.canUpdateToProduction(game, certificate);

            expect(result.canUpdate).toBe(false);
            expect(result.reason).toContain('expired');
        });
    });
});

describe('ReleaseManager', () => {
    let manager: ReleaseManager;

    beforeEach(() => {
        manager = new ReleaseManager();
    });

    describe('Release Game', () => {
        it('should generate certificate and update game status', () => {
            const game = createTestGame({ implementationStatus: 'completed' });
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
                testResults: { passed: 50, failed: 0, skipped: 0, coverage: 85 },
                accessibilityCheck: {
                    colorContrastRatio: 7.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                    complianceLevel: 'WCAG-AA',
                },
                documentationCheck: {
                    hasChangeLog: true,
                    hasImplementationReport: true,
                    hasMetrics: true,
                },
            };

            const { certificate, updatedGame } = manager.releaseGame(input);

            expect(certificate.verificationResult.allChecksPassed).toBe(true);
            expect(updatedGame.implementationStatus).toBe('production');
        });

        it('should return both certificate and updated game', () => {
            const game = createTestGame({ implementationStatus: 'in-progress' });
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const { certificate, updatedGame } = manager.releaseGame(input);

            expect(certificate).toBeDefined();
            expect(updatedGame).toBeDefined();
            expect(certificate.gameId).toBe(updatedGame.id);
        });
    });

    describe('Can Release', () => {
        it('should return true when all checks pass', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const result = manager.canRelease(input);

            expect(result.canRelease).toBe(true);
        });

        it('should return false when checks fail', () => {
            const game = createTestGame();
            const verificationResult = generateFailingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const result = manager.canRelease(input);

            expect(result.canRelease).toBe(false);
            expect(result.reason).toContain('Not all quality gate checks passed');
        });
    });
});

describe('Convenience Functions', () => {
    describe('generateReleaseCertificate', () => {
        it('should generate a certificate using convenience function', () => {
            const game = createTestGame();
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const certificate = generateReleaseCertificate(input);

            expect(certificate.certificateId).toMatch(/^RELEASE-TEST-GAME/);
            expect(certificate.verificationResult.allChecksPassed).toBe(true);
        });
    });

    describe('updateGameToProduction', () => {
        it('should update game status using convenience function', () => {
            const game = createTestGame({ implementationStatus: 'completed' });
            const verificationResult = generatePassingVerificationResult();

            const certificate = generateReleaseCertificate({
                game,
                verificationResult,
            });

            const updatedGame = updateGameToProduction(game, certificate);

            expect(updatedGame.implementationStatus).toBe('production');
        });
    });

    describe('releaseGame', () => {
        it('should release game using convenience function', () => {
            const game = createTestGame({ implementationStatus: 'review' });
            const verificationResult = generatePassingVerificationResult();

            const input: CertificateGenerationInput = {
                game,
                verificationResult,
            };

            const { certificate, updatedGame } = releaseGame(input);

            expect(certificate.verificationResult.allChecksPassed).toBe(true);
            expect(updatedGame.implementationStatus).toBe('production');
        });
    });
});

describe('Edge Cases', () => {
    it('should handle game with minimal properties', () => {
        const minimalGame: Game = {
            id: 'minimal',
            name: 'Minimal Game',
            description: '',
            category: '',
            ageRange: '',
            difficulty: 'Easy',
            estimatedTime: 0,
            requiredTechnologies: [],
            successCriteria: [],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        };
        const verificationResult = generatePassingVerificationResult();

        const certificate = generateReleaseCertificate({
            game: minimalGame,
            verificationResult,
        });

        expect(certificate.gameId).toBe('minimal');
        expect(certificate.gameName).toBe('Minimal Game');
    });

    it('should handle missing optional data gracefully', () => {
        const game = createTestGame();
        const verificationResult = generatePassingVerificationResult();

        const input: CertificateGenerationInput = {
            game,
            verificationResult,
            // No optional data provided
        };

        const certificate = generateReleaseCertificate(input);

        expect(certificate.testSummary.passed).toBe(0);
        expect(certificate.testSummary.failed).toBe(0);
        expect(certificate.accessibilityCompliance.colorContrastRatio).toBe(0);
    });

    it('should handle custom issuer name', () => {
        const game = createTestGame();
        const verificationResult = generatePassingVerificationResult();

        const customManager = new ReleaseManager({ issuerName: 'Custom QA Team' });
        const { certificate } = customManager.releaseGame({
            game,
            verificationResult,
        });

        expect(certificate.issuedBy).toBe('Custom QA Team');
    });
});

describe('Default Configuration', () => {
    it('should have correct default values', () => {
        expect(DEFAULT_CERTIFICATE_CONFIG.certificateValidityDays).toBe(365);
        expect(DEFAULT_CERTIFICATE_CONFIG.defaultReleaseVersion).toBe('1.0.0');
        expect(DEFAULT_CERTIFICATE_CONFIG.issuerName).toBe('Quality Gate System');
    });

    it('should use default issuer when no reviewer provided', () => {
        const game = createTestGame();
        const verificationResult = generatePassingVerificationResult();

        const certificate = generateReleaseCertificate({
            game,
            verificationResult,
            // No reviewer
        });

        expect(certificate.issuedBy).toBe('Quality Gate System');
    });
});