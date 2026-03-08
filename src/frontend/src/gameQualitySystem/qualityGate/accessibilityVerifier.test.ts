// Accessibility Verifier Tests

import {
    verifyColorContrast,
    verifyKeyboardNavigation,
    verifyScreenReaderSupport,
    verifyTimeoutOptions,
    verifyAccessibility,
    createAccessibilityQualityGateCheck,
    validateAccessibilityCheck,
    CONTRAST_THRESHOLDS,
} from './accessibilityVerifier';

describe('Accessibility Verifier', () => {
    describe('Color Contrast Verification', () => {
        it('should pass for valid high contrast colors', () => {
            const result = verifyColorContrast({
                foregroundColor: '#FFFFFF',
                backgroundColor: '#000000',
                fontSize: 16,
            });

            expect(result.passed).toBe(true);
            expect(result.checkName).toBe('colorContrast');
            expect(result.details).toContain('Contrast ratio');
        });

        it('should fail for low contrast colors', () => {
            const result = verifyColorContrast({
                foregroundColor: '#CCCCCC',
                backgroundColor: '#DDDDDD',
                fontSize: 16,
            });

            expect(result.passed).toBe(false);
            expect(result.recommendation).toBeDefined();
        });

        it('should handle large text with lower threshold', () => {
            const result = verifyColorContrast({
                foregroundColor: '#FFFFFF',
                backgroundColor: '#7F0000',
                fontSize: 24,
                isLargeText: true,
            });

            // 7F0000 on white has ratio ~5.5:1, which passes for large text (3.0:1)
            expect(result.passed).toBe(true);
        });

        it('should handle invalid hex colors', () => {
            const result = verifyColorContrast({
                foregroundColor: 'invalid',
                backgroundColor: '#000000',
                fontSize: 16,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('Invalid color format');
        });

        it('should calculate correct contrast ratio for known colors', () => {
            // White on black should be 21:1
            const result = verifyColorContrast({
                foregroundColor: '#FFFFFF',
                backgroundColor: '#000000',
                fontSize: 16,
            });

            expect(result.passed).toBe(true);
            expect(result.details).toContain('21');
        });
    });

    describe('Keyboard Navigation Verification', () => {
        it('should pass when all requirements are met', () => {
            const result = verifyKeyboardNavigation({
                hasTabIndex: true,
                hasVisibleFocus: true,
                hasSkipLinks: true,
                hasKeyboardShortcuts: true,
                focusOrderLogical: true,
                noKeyboardTraps: true,
            });

            expect(result.passed).toBe(true);
            expect(result.details).toBe('All keyboard navigation requirements met');
        });

        it('should fail when tabindex is missing', () => {
            const result = verifyKeyboardNavigation({
                hasTabIndex: false,
                hasVisibleFocus: true,
                hasSkipLinks: true,
                hasKeyboardShortcuts: true,
                focusOrderLogical: true,
                noKeyboardTraps: true,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('tabindex');
        });

        it('should fail when keyboard trap is detected', () => {
            const result = verifyKeyboardNavigation({
                hasTabIndex: true,
                hasVisibleFocus: true,
                hasSkipLinks: true,
                hasKeyboardShortcuts: true,
                focusOrderLogical: true,
                noKeyboardTraps: false,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('Keyboard trap');
        });
    });

    describe('Screen Reader Support Verification', () => {
        it('should pass when all requirements are met', () => {
            const result = verifyScreenReaderSupport({
                hasAriaLabels: true,
                hasAriaDescriptions: true,
                hasAriaLiveRegions: true,
                hasAltText: true,
                hasProperHeadingStructure: true,
                hasLandmarkRegions: true,
                hasFormLabels: true,
                noOrphanedAriaReferences: true,
            });

            expect(result.passed).toBe(true);
            expect(result.details).toBe('All screen reader support requirements met');
        });

        it('should fail when ARIA labels are missing', () => {
            const result = verifyScreenReaderSupport({
                hasAriaLabels: false,
                hasAriaDescriptions: true,
                hasAriaLiveRegions: true,
                hasAltText: true,
                hasProperHeadingStructure: true,
                hasLandmarkRegions: true,
                hasFormLabels: true,
                noOrphanedAriaReferences: true,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('ARIA labels');
        });

        it('should fail when alt text is missing', () => {
            const result = verifyScreenReaderSupport({
                hasAriaLabels: true,
                hasAriaDescriptions: true,
                hasAriaLiveRegions: true,
                hasAltText: false,
                hasProperHeadingStructure: true,
                hasLandmarkRegions: true,
                hasFormLabels: true,
                noOrphanedAriaReferences: true,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('alt text');
        });
    });

    describe('Timeout Options Verification', () => {
        it('should pass when all requirements are met', () => {
            const result = verifyTimeoutOptions({
                hasTimeoutWarning: true,
                hasTimeoutExtension: true,
                timeoutDurationConfigurable: true,
                timeoutDurationDisplayed: true,
                userCanExtendTimeout: true,
                warningBeforeTimeout: 60,
            });

            expect(result.passed).toBe(true);
            expect(result.details).toBe('All timeout option requirements met');
        });

        it('should fail when timeout warning is missing', () => {
            const result = verifyTimeoutOptions({
                hasTimeoutWarning: false,
                hasTimeoutExtension: true,
                timeoutDurationConfigurable: true,
                timeoutDurationDisplayed: true,
                userCanExtendTimeout: true,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('warning');
        });

        it('should fail when user cannot extend timeout', () => {
            const result = verifyTimeoutOptions({
                hasTimeoutWarning: true,
                hasTimeoutExtension: true,
                timeoutDurationConfigurable: true,
                timeoutDurationDisplayed: true,
                userCanExtendTimeout: false,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('extend');
        });

        it('should warn if warning time is less than 30 seconds', () => {
            const result = verifyTimeoutOptions({
                hasTimeoutWarning: true,
                hasTimeoutExtension: true,
                timeoutDurationConfigurable: true,
                timeoutDurationDisplayed: true,
                userCanExtendTimeout: true,
                warningBeforeTimeout: 10,
            });

            expect(result.passed).toBe(false);
            expect(result.details).toContain('30 seconds');
        });
    });

    describe('Full Accessibility Verification', () => {
        it('should pass when all checks pass', () => {
            const report = verifyAccessibility(
                { foregroundColor: '#FFFFFF', backgroundColor: '#000000', fontSize: 16 },
                {
                    hasTabIndex: true,
                    hasVisibleFocus: true,
                    hasSkipLinks: true,
                    hasKeyboardShortcuts: true,
                    focusOrderLogical: true,
                    noKeyboardTraps: true,
                },
                {
                    hasAriaLabels: true,
                    hasAriaDescriptions: true,
                    hasAriaLiveRegions: true,
                    hasAltText: true,
                    hasProperHeadingStructure: true,
                    hasLandmarkRegions: true,
                    hasFormLabels: true,
                    noOrphanedAriaReferences: true,
                },
                {
                    hasTimeoutWarning: true,
                    hasTimeoutExtension: true,
                    timeoutDurationConfigurable: true,
                    timeoutDurationDisplayed: true,
                    userCanExtendTimeout: true,
                }
            );

            expect(report.overallPassed).toBe(true);
            expect(report.summary).toContain('WCAG AA compliant');
        });

        it('should fail when any check fails', () => {
            const report = verifyAccessibility(
                { foregroundColor: '#CCCCCC', backgroundColor: '#DDDDDD', fontSize: 16 },
                {
                    hasTabIndex: true,
                    hasVisibleFocus: true,
                    hasSkipLinks: true,
                    hasKeyboardShortcuts: true,
                    focusOrderLogical: true,
                    noKeyboardTraps: true,
                },
                {
                    hasAriaLabels: true,
                    hasAriaDescriptions: true,
                    hasAriaLiveRegions: true,
                    hasAltText: true,
                    hasProperHeadingStructure: true,
                    hasLandmarkRegions: true,
                    hasFormLabels: true,
                    noOrphanedAriaReferences: true,
                },
                {
                    hasTimeoutWarning: true,
                    hasTimeoutExtension: true,
                    timeoutDurationConfigurable: true,
                    timeoutDurationDisplayed: true,
                    userCanExtendTimeout: true,
                }
            );

            expect(report.overallPassed).toBe(false);
            expect(report.summary).toContain('Failed checks');
            expect(report.colorContrast.passed).toBe(false);
        });
    });

    describe('Quality Gate Check Creation', () => {
        it('should create passed check when all verifications pass', () => {
            const report = verifyAccessibility(
                { foregroundColor: '#FFFFFF', backgroundColor: '#000000', fontSize: 16 },
                {
                    hasTabIndex: true,
                    hasVisibleFocus: true,
                    hasSkipLinks: true,
                    hasKeyboardShortcuts: true,
                    focusOrderLogical: true,
                    noKeyboardTraps: true,
                },
                {
                    hasAriaLabels: true,
                    hasAriaDescriptions: true,
                    hasAriaLiveRegions: true,
                    hasAltText: true,
                    hasProperHeadingStructure: true,
                    hasLandmarkRegions: true,
                    hasFormLabels: true,
                    noOrphanedAriaReferences: true,
                },
                {
                    hasTimeoutWarning: true,
                    hasTimeoutExtension: true,
                    timeoutDurationConfigurable: true,
                    timeoutDurationDisplayed: true,
                    userCanExtendTimeout: true,
                }
            );

            const check = createAccessibilityQualityGateCheck(report);

            expect(check.checkName).toBe('accessibilityCompliant');
            expect(check.status).toBe('passed');
            expect(check.timestamp).toBeDefined();
        });

        it('should create failed check with details when verifications fail', () => {
            const report = verifyAccessibility(
                { foregroundColor: '#CCCCCC', backgroundColor: '#DDDDDD', fontSize: 16 },
                {
                    hasTabIndex: true,
                    hasVisibleFocus: true,
                    hasSkipLinks: true,
                    hasKeyboardShortcuts: true,
                    focusOrderLogical: true,
                    noKeyboardTraps: true,
                },
                {
                    hasAriaLabels: true,
                    hasAriaDescriptions: true,
                    hasAriaLiveRegions: true,
                    hasAltText: true,
                    hasProperHeadingStructure: true,
                    hasLandmarkRegions: true,
                    hasFormLabels: true,
                    noOrphanedAriaReferences: true,
                },
                {
                    hasTimeoutWarning: true,
                    hasTimeoutExtension: true,
                    timeoutDurationConfigurable: true,
                    timeoutDurationDisplayed: true,
                    userCanExtendTimeout: true,
                }
            );

            const check = createAccessibilityQualityGateCheck(report);

            expect(check.checkName).toBe('accessibilityCompliant');
            expect(check.status).toBe('failed');
            expect(check.details).toContain('Contrast ratio');
        });
    });

    describe('validateAccessibilityCheck', () => {
        it('should return true for compliant accessibility check', () => {
            const check = {
                colorContrastRatio: 7.5,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
                complianceLevel: 'WCAG-AA' as const,
            };

            expect(validateAccessibilityCheck(check)).toBe(true);
        });

        it('should return true for minimum compliant accessibility check', () => {
            const check = {
                colorContrastRatio: 4.5,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
                complianceLevel: 'WCAG-AA' as const,
            };

            expect(validateAccessibilityCheck(check)).toBe(true);
        });

        it('should return false when contrast ratio is below threshold', () => {
            const check = {
                colorContrastRatio: 4.0,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: true,
                complianceLevel: 'partial' as const,
            };

            expect(validateAccessibilityCheck(check)).toBe(false);
        });

        it('should return false when keyboard navigation is missing', () => {
            const check = {
                colorContrastRatio: 5.0,
                keyboardNavigation: false,
                screenReaderSupport: true,
                timeoutOptions: true,
                complianceLevel: 'partial' as const,
            };

            expect(validateAccessibilityCheck(check)).toBe(false);
        });

        it('should return false when screen reader support is missing', () => {
            const check = {
                colorContrastRatio: 5.0,
                keyboardNavigation: true,
                screenReaderSupport: false,
                timeoutOptions: true,
                complianceLevel: 'partial' as const,
            };

            expect(validateAccessibilityCheck(check)).toBe(false);
        });

        it('should return false when timeout options are missing', () => {
            const check = {
                colorContrastRatio: 5.0,
                keyboardNavigation: true,
                screenReaderSupport: true,
                timeoutOptions: false,
                complianceLevel: 'partial' as const,
            };

            expect(validateAccessibilityCheck(check)).toBe(false);
        });
    });

    describe('Contrast Thresholds', () => {
        it('should have correct WCAG AA thresholds', () => {
            expect(CONTRAST_THRESHOLDS.WCAG_AA_NORMAL).toBe(4.5);
            expect(CONTRAST_THRESHOLDS.WCAG_AA_LARGE).toBe(3.0);
        });

        it('should have correct WCAG AAA thresholds', () => {
            expect(CONTRAST_THRESHOLDS.WCAG_AAA_NORMAL).toBe(7.0);
            expect(CONTRAST_THRESHOLDS.WCAG_AAA_LARGE).toBe(4.5);
        });
    });
});