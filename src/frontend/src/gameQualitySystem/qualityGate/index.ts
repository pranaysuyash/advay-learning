// Quality Gate module exports

export { QualityGate } from './qualityGate';
export {
    verifyColorContrast,
    verifyKeyboardNavigation,
    verifyScreenReaderSupport,
    verifyTimeoutOptions,
    verifyAccessibility,
    createAccessibilityQualityGateCheck,
    validateAccessibilityCheck,
    CONTRAST_THRESHOLDS,
} from './accessibilityVerifier';
export {
    GateVerificationLogic,
    verifyForRelease,
    canRelease,
    getFailureReasons,
    REQUIRED_CHECKS,
    type GateVerificationResult,
    type CheckVerificationResult,
    type AuditTrailEntry as GateVerificationAuditTrailEntry,
    type GateVerificationInput,
    type TestResultsInput,
    type DocumentationCheckInput,
    type GateVerificationConfig,
    DEFAULT_GATE_VERIFICATION_CONFIG,
} from './gateVerification';
export {
    ReleaseCertificateGenerator,
    GameStatusUpdater,
    ReleaseManager,
    generateReleaseCertificate,
    updateGameToProduction,
    releaseGame,
    DEFAULT_CERTIFICATE_CONFIG,
    type ReleaseCertificate,
    type CertificateGenerationInput,
    type CertificateConfig,
} from './releaseCertificate';
export {
    AuditTrail,
    createAutomatedReviewer,
    createHumanReviewer,
    createSystemReviewer,
    type AuditTrailEntry,
    type ReviewerInfo,
    type AuditTrailConfig,
    type AuditTrailSummary,
} from './auditTrail';
export type {
    AccessibilityVerificationResult,
    AccessibilityVerificationReport,
    ColorContrastInput,
    KeyboardNavigationInput,
    ScreenReaderInput,
    TimeoutOptionsInput,
} from './accessibilityVerifier';
export type { QualityGateResult, QualityGateCheck, QualityGateStatus, QualityGateConfig } from '../types';
