// Accessibility Verification Module
// Verifies games meet WCAG accessibility standards before release

import type { AccessibilityCheck, QualityGateCheck } from '../types';

/**
 * WCAG Contrast ratio thresholds
 */
export const CONTRAST_THRESHOLDS = {
    WCAG_AA_NORMAL: 4.5,
    WCAG_AA_LARGE: 3.0,
    WCAG_AAA_NORMAL: 7.0,
    WCAG_AAA_LARGE: 4.5,
};

/**
 * Result of a single accessibility verification check
 */
export interface AccessibilityVerificationResult {
    checkName: string;
    passed: boolean;
    details: string;
    recommendation?: string;
}

/**
 * Comprehensive accessibility verification result
 */
export interface AccessibilityVerificationReport {
    overallPassed: boolean;
    colorContrast: AccessibilityVerificationResult;
    keyboardNavigation: AccessibilityVerificationResult;
    screenReaderSupport: AccessibilityVerificationResult;
    timeoutOptions: AccessibilityVerificationResult;
    summary: string;
}

/**
 * Color contrast verification input
 */
export interface ColorContrastInput {
    foregroundColor: string; // Hex color code (e.g., "#FFFFFF")
    backgroundColor: string; // Hex color code (e.g., "#000000")
    fontSize: number; // Font size in pixels
    isBold?: boolean; // Whether text is bold (affects threshold)
    isLargeText?: boolean; // Whether text is considered "large" (18pt+ or 14pt+ bold)
}

/**
 * Keyboard navigation verification input
 */
export interface KeyboardNavigationInput {
    hasTabIndex: boolean;
    hasVisibleFocus: boolean;
    hasSkipLinks: boolean;
    hasKeyboardShortcuts: boolean;
    keyboardShortcutsDocumented?: boolean;
    focusOrderLogical: boolean;
    noKeyboardTraps: boolean;
}

/**
 * Screen reader verification input
 */
export interface ScreenReaderInput {
    hasAriaLabels: boolean;
    hasAriaDescriptions: boolean;
    hasAriaLiveRegions: boolean;
    hasAltText: boolean;
    hasProperHeadingStructure: boolean;
    hasLandmarkRegions: boolean;
    hasFormLabels: boolean;
    noOrphanedAriaReferences: boolean;
}

/**
 * Timeout options verification input
 */
export interface TimeoutOptionsInput {
    hasTimeoutWarning: boolean;
    hasTimeoutExtension: boolean;
    timeoutDurationConfigurable: boolean;
    timeoutDurationDisplayed: boolean;
    userCanExtendTimeout: boolean;
    warningBeforeTimeout?: number; // Seconds before timeout that warning appears
}

/**
 * Verifies color contrast ratio meets WCAG requirements
 */
export function verifyColorContrast(input: ColorContrastInput): AccessibilityVerificationResult {
    const { foregroundColor, backgroundColor, fontSize, isBold, isLargeText } = input;

    // Parse hex colors to RGB
    const fgRgb = hexToRgb(foregroundColor);
    const bgRgb = hexToRgb(backgroundColor);

    if (!fgRgb || !bgRgb) {
        return {
            checkName: 'colorContrast',
            passed: false,
            details: 'Invalid color format provided',
            recommendation: 'Use valid hex color codes (e.g., "#FFFFFF")',
        };
    }

    // Calculate relative luminance
    const fgLuminance = calculateRelativeLuminance(fgRgb);
    const bgLuminance = calculateRelativeLuminance(bgRgb);

    // Calculate contrast ratio
    const contrastRatio = calculateContrastRatio(fgLuminance, bgLuminance);

    // Determine required threshold
    const isLarge = isLargeText || fontSize >= 18 || (fontSize >= 14 && isBold);
    const requiredThreshold = isLarge ? CONTRAST_THRESHOLDS.WCAG_AA_LARGE : CONTRAST_THRESHOLDS.WCAG_AA_NORMAL;

    const passed = contrastRatio >= requiredThreshold;

    return {
        checkName: 'colorContrast',
        passed,
        details: `Contrast ratio: ${contrastRatio.toFixed(2)}:1 (required: ${requiredThreshold}:1 for ${isLarge ? 'large' : 'normal'} text)`,
        recommendation: passed
            ? undefined
            : `Increase contrast to at least ${requiredThreshold}:1 by adjusting foreground/background colors`,
    };
}

/**
 * Verifies keyboard navigation support
 */
export function verifyKeyboardNavigation(input: KeyboardNavigationInput): AccessibilityVerificationResult {
    const issues: string[] = [];
    const passed = input.hasTabIndex && input.hasVisibleFocus && input.noKeyboardTraps;

    if (!input.hasTabIndex) {
        issues.push('Missing tabindex for interactive elements');
    }

    if (!input.hasVisibleFocus) {
        issues.push('No visible focus indicator for keyboard users');
    }

    if (!input.hasSkipLinks) {
        issues.push('Missing skip links to bypass repetitive content');
    }

    if (!input.hasKeyboardShortcuts) {
        issues.push('No keyboard shortcuts documented for game actions');
    }

    if (!input.focusOrderLogical) {
        issues.push('Focus order is not logical/sequential');
    }

    if (!input.noKeyboardTraps) {
        issues.push('Keyboard trap detected - user cannot escape interactive element');
    }

    return {
        checkName: 'keyboardNavigation',
        passed,
        details: passed
            ? 'All keyboard navigation requirements met'
            : `Keyboard navigation issues: ${issues.join('; ')}`,
        recommendation: passed
            ? undefined
            : 'Implement proper keyboard navigation with visible focus indicators and logical tab order',
    };
}

/**
 * Verifies screen reader support
 */
export function verifyScreenReaderSupport(input: ScreenReaderInput): AccessibilityVerificationResult {
    const issues: string[] = [];
    const passed =
        input.hasAriaLabels &&
        input.hasAltText &&
        input.hasFormLabels &&
        input.noOrphanedAriaReferences;

    if (!input.hasAriaLabels) {
        issues.push('Missing ARIA labels for interactive elements');
    }

    if (!input.hasAriaDescriptions) {
        issues.push('Missing ARIA descriptions for complex interactions');
    }

    if (!input.hasAriaLiveRegions) {
        issues.push('Missing ARIA live regions for dynamic content');
    }

    if (!input.hasAltText) {
        issues.push('Missing alt text for images and icons');
    }

    if (!input.hasProperHeadingStructure) {
        issues.push('Improper heading structure (missing or skipped levels)');
    }

    if (!input.hasLandmarkRegions) {
        issues.push('Missing landmark regions (main, nav, contentinfo, etc.)');
    }

    if (!input.hasFormLabels) {
        issues.push('Form inputs missing labels');
    }

    if (!input.noOrphanedAriaReferences) {
        issues.push('Orphaned ARIA references detected (references non-existent IDs)');
    }

    return {
        checkName: 'screenReaderSupport',
        passed,
        details: passed
            ? 'All screen reader support requirements met'
            : `Screen reader issues: ${issues.join('; ')}`,
        recommendation: passed
            ? undefined
            : 'Add ARIA labels, alt text, proper heading structure, and landmark regions',
    };
}

/**
 * Verifies timeout options availability
 */
export function verifyTimeoutOptions(input: TimeoutOptionsInput): AccessibilityVerificationResult {
    const issues: string[] = [];
    const warningLeadTimeValid = input.warningBeforeTimeout === undefined || input.warningBeforeTimeout >= 30;
    const passed =
        input.hasTimeoutWarning &&
        input.hasTimeoutExtension &&
        input.userCanExtendTimeout &&
        warningLeadTimeValid;

    if (!input.hasTimeoutWarning) {
        issues.push('No warning before session timeout');
    }

    if (!input.hasTimeoutExtension) {
        issues.push('No timeout extension option available');
    }

    if (!input.timeoutDurationConfigurable) {
        issues.push('Timeout duration not configurable by users');
    }

    if (!input.timeoutDurationDisplayed) {
        issues.push('Timeout duration not displayed to users');
    }

    if (!input.userCanExtendTimeout) {
        issues.push('Users cannot extend their session timeout');
    }

    if (input.warningBeforeTimeout !== undefined && input.warningBeforeTimeout < 30) {
        issues.push('Timeout warning should appear at least 30 seconds before timeout');
    }

    return {
        checkName: 'timeoutOptions',
        passed,
        details: passed
            ? 'All timeout option requirements met'
            : `Timeout option issues: ${issues.join('; ')}`,
        recommendation: passed
            ? undefined
            : 'Implement configurable timeout with warning and extension options',
    };
}

/**
 * Runs all accessibility verifications and returns a comprehensive report
 */
export function verifyAccessibility(
    colorContrast: ColorContrastInput,
    keyboardNavigation: KeyboardNavigationInput,
    screenReader: ScreenReaderInput,
    timeoutOptions: TimeoutOptionsInput
): AccessibilityVerificationReport {
    const colorContrastResult = verifyColorContrast(colorContrast);
    const keyboardResult = verifyKeyboardNavigation(keyboardNavigation);
    const screenReaderResult = verifyScreenReaderSupport(screenReader);
    const timeoutResult = verifyTimeoutOptions(timeoutOptions);

    const allPassed = colorContrastResult.passed &&
        keyboardResult.passed &&
        screenReaderResult.passed &&
        timeoutResult.passed;

    const failedChecks = [
        colorContrastResult.passed ? null : 'Color Contrast',
        keyboardResult.passed ? null : 'Keyboard Navigation',
        screenReaderResult.passed ? null : 'Screen Reader Support',
        timeoutResult.passed ? null : 'Timeout Options',
    ].filter(Boolean) as string[];

    return {
        overallPassed: allPassed,
        colorContrast: colorContrastResult,
        keyboardNavigation: keyboardResult,
        screenReaderSupport: screenReaderResult,
        timeoutOptions: timeoutResult,
        summary: allPassed
            ? 'All accessibility requirements met (WCAG AA compliant)'
            : `Failed checks: ${failedChecks.join(', ')}`,
    };
}

/**
 * Converts a hex color code to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Calculates relative luminance for a color
 * Based on WCAG 2.1 specification
 */
function calculateRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
        const sRGB = c / 255;
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two colors
 * Based on WCAG 2.1 specification
 */
function calculateContrastRatio(luminance1: number, luminance2: number): number {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Creates a QualityGateCheck from accessibility verification results
 */
export function createAccessibilityQualityGateCheck(report: AccessibilityVerificationReport): QualityGateCheck {
    const issues: string[] = [];

    if (!report.colorContrast.passed) {
        issues.push(report.colorContrast.details);
    }
    if (!report.keyboardNavigation.passed) {
        issues.push(report.keyboardNavigation.details);
    }
    if (!report.screenReaderSupport.passed) {
        issues.push(report.screenReaderSupport.details);
    }
    if (!report.timeoutOptions.passed) {
        issues.push(report.timeoutOptions.details);
    }

    return {
        checkName: 'accessibilityCompliant',
        status: report.overallPassed ? 'passed' : 'failed',
        details: issues.length > 0 ? issues.join('; ') : 'Accessibility requirements met',
        timestamp: new Date().toISOString(),
    };
}

/**
 * Validates AccessibilityCheck type from types/index.ts against requirements
 * Returns true if all WCAG AA requirements are met
 */
export function validateAccessibilityCheck(check: AccessibilityCheck): boolean {
    const passed =
        check.colorContrastRatio >= CONTRAST_THRESHOLDS.WCAG_AA_NORMAL &&
        check.keyboardNavigation &&
        check.screenReaderSupport &&
        check.timeoutOptions;

    return passed;
}
