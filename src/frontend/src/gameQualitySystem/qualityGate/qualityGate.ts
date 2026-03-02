// Quality Gate for Game Quality System

import { QualityGateResult, QualityGateCheck, QualityGateStatus, AccessibilityCheck } from '../types';

export interface QualityGateConfig {
    requiredChecks: string[];
    minAccessibilityScore: number;
    minTestCoverage: number;
    requireDocumentation: boolean;
}

export class QualityGate {
    private readonly DEFAULT_CONFIG: QualityGateConfig = {
        requiredChecks: ['auditPassed', 'testsPassed', 'accessibilityCompliant', 'documentationComplete'],
        minAccessibilityScore: 4.5,
        minTestCoverage: 80,
        requireDocumentation: true,
    };

    private config: QualityGateConfig;

    constructor(config: Partial<QualityGateConfig> = {}) {
        this.config = { ...this.DEFAULT_CONFIG, ...config };
    }

    public checkGame(gameId: string, gameData: any, context: any): QualityGateResult {
        const checks: QualityGateCheck[] = [];
        let allPassed = true;

        for (const checkName of this.config.requiredChecks) {
            const result = this.runCheck(checkName, gameId, gameData, context);
            checks.push(result);

            if (result.status === 'failed') {
                allPassed = false;
            }
        }

        const status: QualityGateStatus = allPassed ? 'passed' : 'failed';

        return {
            gameId,
            status,
            checks,
            releaseCertificate: allPassed ? this.generateReleaseCertificate(gameId) : undefined,
            failureReasons: allPassed ? undefined : checks.filter(c => c.status === 'failed').map(c => c.details),
        };
    }

    public checkAccessibility(accessibilityData: AccessibilityCheck): QualityGateCheck {
        const issues: string[] = [];

        if (accessibilityData.colorContrastRatio < this.config.minAccessibilityScore) {
            issues.push(`Color contrast ratio ${accessibilityData.colorContrastRatio} is below minimum ${this.config.minAccessibilityScore}`);
        }

        if (!accessibilityData.keyboardNavigation) {
            issues.push('Keyboard navigation not implemented');
        }

        if (!accessibilityData.screenReaderSupport) {
            issues.push('Screen reader support not implemented');
        }

        if (!accessibilityData.timeoutOptions) {
            issues.push('Timeout options not implemented');
        }

        const status: QualityGateStatus = issues.length === 0 ? 'passed' : 'failed';

        return {
            checkName: 'accessibilityCompliant',
            status,
            details: issues.length > 0 ? issues.join('; ') : 'Accessibility requirements met',
            timestamp: new Date().toISOString(),
        };
    }

    public checkTests(testResults: any): QualityGateCheck {
        const { passed, failed, skipped, coverage } = testResults;

        const issues: string[] = [];

        if (failed > 0) {
            issues.push(`${failed} tests failed`);
        }

        if (coverage !== undefined && coverage < this.config.minTestCoverage) {
            issues.push(`Test coverage ${coverage}% is below minimum ${this.config.minTestCoverage}%`);
        }

        const status: QualityGateStatus = issues.length === 0 ? 'passed' : 'failed';

        return {
            checkName: 'testsPassed',
            status,
            details: issues.length > 0 ? issues.join('; ') : `All tests passed (${passed} passed, ${skipped} skipped)`,
            timestamp: new Date().toISOString(),
        };
    }

    public checkAudit(auditReport: any): QualityGateCheck {
        if (!auditReport) {
            return {
                checkName: 'auditPassed',
                status: 'failed',
                details: 'No audit report available',
                timestamp: new Date().toISOString(),
            };
        }

        const { totalScore, isFlaggedForImprovement } = auditReport;

        const issues: string[] = [];

        if (isFlaggedForImprovement) {
            issues.push('Game flagged for improvement');
        }

        if (totalScore !== undefined && totalScore < 12) {
            issues.push(`Audit score ${totalScore} is below minimum 12`);
        }

        const status: QualityGateStatus = issues.length === 0 ? 'passed' : 'failed';

        return {
            checkName: 'auditPassed',
            status,
            details: issues.length > 0 ? issues.join('; ') : `Audit passed (score: ${totalScore})`,
            timestamp: new Date().toISOString(),
        };
    }

    public checkDocumentation(documentation: any): QualityGateCheck {
        if (!this.config.requireDocumentation) {
            return {
                checkName: 'documentationComplete',
                status: 'passed',
                details: 'Documentation check disabled',
                timestamp: new Date().toISOString(),
            };
        }

        const { hasChangeLog, hasImplementationReport, hasMetrics } = documentation;

        const issues: string[] = [];

        if (!hasChangeLog) {
            issues.push('Change log missing');
        }

        if (!hasImplementationReport) {
            issues.push('Implementation report missing');
        }

        if (!hasMetrics) {
            issues.push('Metrics summary missing');
        }

        const status: QualityGateStatus = issues.length === 0 ? 'passed' : 'failed';

        return {
            checkName: 'documentationComplete',
            status,
            details: issues.length > 0 ? issues.join('; ') : 'All documentation complete',
            timestamp: new Date().toISOString(),
        };
    }

    public runCheck(checkName: string, gameId: string, gameData: any, context: any): QualityGateCheck {
        switch (checkName) {
            case 'auditPassed':
                return this.checkAudit(context.auditReport);
            case 'testsPassed':
                return this.checkTests(context.testResults);
            case 'accessibilityCompliant':
                return this.checkAccessibility(context.accessibilityData);
            case 'documentationComplete':
                return this.checkDocumentation(context.documentation);
            default:
                return {
                    checkName,
                    status: 'pending',
                    details: `Unknown check: ${checkName}`,
                    timestamp: new Date().toISOString(),
                };
        }
    }

    public generateReleaseCertificate(gameId: string): string {
        return `RELEASE-${gameId}-${new Date().toISOString().split('T')[0]}`;
    }

    public getFailedChecks(result: QualityGateResult): QualityGateCheck[] {
        return result.checks.filter(check => check.status === 'failed');
    }

    public getPassedChecks(result: QualityGateResult): QualityGateCheck[] {
        return result.checks.filter(check => check.status === 'passed');
    }

    public canRelease(result: QualityGateResult): boolean {
        return result.status === 'passed';
    }
}
