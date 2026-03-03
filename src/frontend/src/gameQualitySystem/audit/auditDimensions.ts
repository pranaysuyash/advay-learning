// Audit dimension scoring logic for Game Quality System

import { AuditDimension, AuditScore } from '../types';

export interface ScoringCriteria {
    dimension: AuditDimension;
    score1: string;
    score2: string;
    score3: string;
    score4: string;
    score5: string;
}

export const AUDIT_CRITERIA: Record<AuditDimension, ScoringCriteria> = {
    Educational_Value: {
        dimension: 'Educational_Value',
        score1: 'No educational value or completely off-target',
        score2: 'Minimal educational value, unclear learning objectives',
        score3: 'Acceptable educational value, meets basic learning objectives',
        score4: 'Good educational value, clear learning objectives, age-appropriate',
        score5: 'Excellent educational value, exceeds learning objectives, highly engaging',
    },
    User_Experience: {
        dimension: 'User_Experience',
        score1: 'Frustrating user experience, confusing navigation, frequent errors',
        score2: 'Poor user experience, difficult to use, many usability issues',
        score3: 'Acceptable user experience, functional but not intuitive',
        score4: 'Good user experience, intuitive, few friction points',
        score5: 'Excellent user experience, delightful, intuitive for target age',
    },
    Technical_Quality: {
        dimension: 'Technical_Quality',
        score1: 'Frequent crashes, major bugs, performance issues',
        score2: 'Unstable, noticeable bugs, performance problems',
        score3: 'Stable, minor bugs, acceptable performance',
        score4: 'High quality, few bugs, good performance',
        score5: 'Excellent quality, no bugs, optimal performance',
    },
    Accessibility: {
        dimension: 'Accessibility',
        score1: 'Not accessible, no accommodations for diverse needs',
        score2: 'Limited accessibility, some accommodations present',
        score3: 'Acceptable accessibility, basic accommodations',
        score4: 'Good accessibility, comprehensive accommodations',
        score5: 'Excellent accessibility, exceeds WCAG AA standards',
    },
    Content_Completeness: {
        dimension: 'Content_Completeness',
        score1: 'Incomplete content, missing key features',
        score2: 'Partially complete, missing some features',
        score3: 'Complete content, all core features present',
        score4: 'Well-rounded content, additional features included',
        score5: 'Comprehensive content, extensive features and variations',
    },
};

export function scoreDimension(
    dimension: AuditDimension,
    gameData: any,
    _auditContext: any
): AuditScore {
    const criteria = AUDIT_CRITERIA[dimension];
    let score = 1;
    let comments = '';
    const issues: string[] = [];

    switch (dimension) {
        case 'Educational_Value':
            score = scoreEducationalValue(gameData, issues);
            break;
        case 'User_Experience':
            score = scoreUserExperience(gameData, issues);
            break;
        case 'Technical_Quality':
            score = scoreTechnicalQuality(gameData, issues);
            break;
        case 'Accessibility':
            score = scoreAccessibility(gameData, issues);
            break;
        case 'Content_Completeness':
            score = scoreContentCompleteness(gameData, issues);
            break;
    }

    comments = criteria[`score${score}` as keyof ScoringCriteria] as string;

    return {
        dimension,
        score,
        comments,
        issues,
    };
}

function scoreEducationalValue(gameData: any, issues: string[]): number {
    const { educationalObjectives, skillsDeveloped, ageRange } = gameData;

    if (!educationalObjectives || educationalObjectives.length === 0) {
        issues.push('No educational objectives defined');
        return 1;
    }

    if (!skillsDeveloped || skillsDeveloped.length === 0) {
        issues.push('No skills developed documented');
        return 2;
    }

    if (!ageRange || ageRange === '') {
        issues.push('No age range specified');
        return 2;
    }

    if (educationalObjectives.length < 2) {
        issues.push('Insufficient educational objectives');
        return 3;
    }

    if (skillsDeveloped.length < 2) {
        issues.push('Insufficient skills documented');
        return 3;
    }

    if (educationalObjectives.length >= 4 && skillsDeveloped.length >= 3) {
        return 5;
    }

    return 4;
}

function scoreUserExperience(gameData: any, issues: string[]): number {
    const { userFeedback, completionRate, averageSessionDuration } = gameData;

    if (!userFeedback || userFeedback.length === 0) {
        issues.push('No user feedback data available');
        return 2;
    }

    if (completionRate !== undefined && completionRate < 0.3) {
        issues.push(`Low completion rate: ${completionRate * 100}%`);
        return 2;
    }

    if (averageSessionDuration !== undefined && averageSessionDuration < 60) {
        issues.push(`Short average session: ${averageSessionDuration}s`);
        return 3;
    }

    if (userFeedback.filter((f: any) => f.sentiment === 'negative').length > 0.2) {
        issues.push('High negative feedback rate');
        return 3;
    }

    if (completionRate !== undefined && completionRate >= 0.7 && averageSessionDuration !== undefined && averageSessionDuration >= 180) {
        return 5;
    }

    return 4;
}

function scoreTechnicalQuality(gameData: any, issues: string[]): number {
    const { bugCount, crashRate, performanceScore } = gameData;

    if (bugCount !== undefined && bugCount > 50) {
        issues.push(`High bug count: ${bugCount}`);
        return 1;
    }

    if (crashRate !== undefined && crashRate > 0.05) {
        issues.push(`High crash rate: ${crashRate * 100}%`);
        return 1;
    }

    if (bugCount !== undefined && bugCount > 20) {
        issues.push(`Moderate bug count: ${bugCount}`);
        return 2;
    }

    if (crashRate !== undefined && crashRate > 0.02) {
        issues.push(`Moderate crash rate: ${crashRate * 100}%`);
        return 2;
    }

    if (performanceScore !== undefined && performanceScore < 70) {
        issues.push(`Low performance score: ${performanceScore}`);
        return 3;
    }

    if (bugCount === undefined || bugCount === 0 && crashRate === undefined && performanceScore !== undefined && performanceScore >= 90) {
        return 5;
    }

    return 4;
}

function scoreAccessibility(gameData: any, issues: string[]): number {
    const { accessibilityChecks } = gameData;

    if (!accessibilityChecks) {
        issues.push('No accessibility checks performed');
        return 1;
    }

    const { colorContrastRatio, keyboardNavigation, screenReaderSupport, timeoutOptions } = accessibilityChecks;

    if (colorContrastRatio === undefined || colorContrastRatio < 3) {
        issues.push('Insufficient color contrast');
        return 2;
    }

    if (!keyboardNavigation) {
        issues.push('No keyboard navigation');
        return 2;
    }

    if (!screenReaderSupport) {
        issues.push('No screen reader support');
        return 2;
    }

    if (!timeoutOptions) {
        issues.push('No timeout options');
        return 3;
    }

    if (colorContrastRatio >= 4.5 && keyboardNavigation && screenReaderSupport && timeoutOptions) {
        return 5;
    }

    return 4;
}

function scoreContentCompleteness(gameData: any, issues: string[]): number {
    const { contentItems, variations, levels } = gameData;

    if (!contentItems || contentItems.length === 0) {
        issues.push('No content items defined');
        return 1;
    }

    if (contentItems.length < 10) {
        issues.push(`Insufficient content items: ${contentItems.length}`);
        return 2;
    }

    if (!variations || variations.length === 0) {
        issues.push('No content variations defined');
        return 3;
    }

    if (!levels || levels.length === 0) {
        issues.push('No difficulty levels defined');
        return 3;
    }

    if (contentItems.length >= 50 && variations.length >= 3 && levels.length >= 3) {
        return 5;
    }

    return 4;
}
