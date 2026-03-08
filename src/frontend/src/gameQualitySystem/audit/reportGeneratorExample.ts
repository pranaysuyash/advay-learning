// Example usage of Report Generator
// This file demonstrates how to use the report generation functionality

import { AuditEngine, AuditContext } from './auditEngine';
import type { Game } from '../types';

/**
 * Example: Generate a detailed audit report for a game
 */
export function exampleGenerateDetailedReport() {
    const engine = new AuditEngine();

    // Create a sample game
    const game: Game = {
        id: 'math-addition-game',
        name: 'Math Addition Adventure',
        description: 'A game to practice addition skills',
        category: 'Math',
        ageRange: '5-7',
        difficulty: 'Easy',
        estimatedTime: 30,
        requiredTechnologies: ['React', 'TypeScript'],
        successCriteria: ['Complete 10 addition problems', 'Achieve 80% accuracy'],
        isImplemented: true,
        lastUpdated: new Date().toISOString(),
    };

    // Create audit context with game data
    const context: AuditContext = {
        gameData: {
            // Educational Value data
            educationalObjectives: ['Practice addition', 'Improve mental math'],
            skillsDeveloped: ['Addition', 'Problem solving'],
            ageRange: '5-7',

            // User Experience data
            userFeedback: [
                { sentiment: 'positive', comment: 'Fun game!' },
                { sentiment: 'negative', comment: 'Too difficult' },
            ],
            completionRate: 0.45, // 45% completion rate
            averageSessionDuration: 120, // 2 minutes

            // Technical Quality data
            bugCount: 15,
            crashRate: 0.01,
            performanceScore: 75,

            // Accessibility data
            accessibilityChecks: {
                colorContrastRatio: 3.8, // Below WCAG AA standard
                keyboardNavigation: false,
                screenReaderSupport: false,
                timeoutOptions: true,
            },

            // Content Completeness data
            contentItems: Array(25).fill('problem'), // 25 problems
            variations: ['easy', 'medium'], // 2 variations
            levels: ['level1', 'level2'], // 2 levels
        },
    };

    // Step 1: Run the audit
    const auditReport = engine.auditGame(game, context);

    console.log('=== Basic Audit Report ===');
    console.log(`Game: ${auditReport.gameName}`);
    console.log(`Total Score: ${auditReport.totalScore}/25`);
    console.log(`Flagged for Improvement: ${auditReport.isFlaggedForImprovement}`);
    console.log('\nDimension Scores:');
    for (const score of auditReport.scores) {
        console.log(`  ${score.dimension}: ${score.score}/5`);
    }

    // Step 2: Generate detailed report with recommendations
    const detailedReport = engine.generateDetailedReport(auditReport);

    console.log('\n=== Detailed Report ===');
    console.log('\nExecutive Summary:');
    console.log(detailedReport.executiveSummary);

    console.log('\nPriority Actions:');
    for (const action of detailedReport.priorityActions) {
        console.log(`  • ${action}`);
    }

    console.log('\nDetailed Recommendations:');
    for (const rec of detailedReport.detailedRecommendations) {
        console.log(`\n  Dimension: ${rec.dimension}`);
        console.log(`  Current Score: ${rec.currentScore}/5 → Target: ${rec.targetScore}/5`);
        console.log(`  Priority: ${rec.priority} | Effort: ${rec.estimatedEffort} | Impact: ${rec.expectedImpact}`);
        console.log('  Action Items:');
        for (let i = 0; i < rec.actionItems.length; i++) {
            console.log(`    ${i + 1}. ${rec.actionItems[i]}`);
        }
    }

    console.log(`\nEstimated Improvement Time: ${detailedReport.estimatedImprovementTime}`);

    // Step 3: Generate formatted text report
    const textReport = engine.generateTextReport(detailedReport);

    console.log('\n=== Formatted Text Report ===');
    console.log(textReport);

    return detailedReport;
}

/**
 * Example: Generate reports for multiple games and compare
 */
export function exampleCompareMultipleGames() {
    const engine = new AuditEngine();

    const games: Game[] = [
        {
            id: 'game1',
            name: 'Math Addition',
            description: 'Addition practice',
            category: 'Math',
            ageRange: '5-7',
            difficulty: 'Easy',
            estimatedTime: 30,
            requiredTechnologies: ['React'],
            successCriteria: ['Complete tasks'],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        },
        {
            id: 'game2',
            name: 'Reading Adventure',
            description: 'Reading comprehension',
            category: 'Reading',
            ageRange: '6-8',
            difficulty: 'Medium',
            estimatedTime: 45,
            requiredTechnologies: ['React'],
            successCriteria: ['Complete tasks'],
            isImplemented: true,
            lastUpdated: new Date().toISOString(),
        },
    ];

    const contexts: Record<string, AuditContext> = {
        game1: {
            gameData: {
                educationalObjectives: ['obj1', 'obj2'],
                skillsDeveloped: ['skill1'],
                ageRange: '5-7',
                userFeedback: [{ sentiment: 'positive' }],
                completionRate: 0.6,
                averageSessionDuration: 150,
                bugCount: 10,
                performanceScore: 80,
                accessibilityChecks: {
                    colorContrastRatio: 4.2,
                    keyboardNavigation: true,
                    screenReaderSupport: false,
                    timeoutOptions: true,
                },
                contentItems: Array(30).fill('item'),
                variations: ['var1', 'var2'],
                levels: ['level1', 'level2'],
            },
        },
        game2: {
            gameData: {
                educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                ageRange: '6-8',
                userFeedback: [{ sentiment: 'positive' }],
                completionRate: 0.8,
                averageSessionDuration: 200,
                bugCount: 2,
                performanceScore: 95,
                accessibilityChecks: {
                    colorContrastRatio: 4.8,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                },
                contentItems: Array(60).fill('item'),
                variations: ['var1', 'var2', 'var3'],
                levels: ['level1', 'level2', 'level3'],
            },
        },
    };

    // Audit all games
    const reports = engine.auditMultipleGames(games, contexts);

    // Get flagged games
    const flaggedGames = engine.getFlaggedGames(reports);

    console.log('=== Multiple Games Comparison ===');
    console.log(`Total games audited: ${games.length}`);
    console.log(`Games flagged for improvement: ${flaggedGames.length}`);

    // Generate detailed reports for flagged games
    console.log('\n=== Flagged Games Detailed Reports ===');
    for (const flaggedReport of flaggedGames) {
        const detailedReport = engine.generateDetailedReport(flaggedReport);
        console.log(`\n--- ${detailedReport.gameName} ---`);
        console.log(`Total Score: ${detailedReport.totalScore}/25`);
        console.log(`Recommendations: ${detailedReport.detailedRecommendations.length}`);
        console.log(`Estimated Improvement Time: ${detailedReport.estimatedImprovementTime}`);
        console.log('\nTop Priority Actions:');
        for (const action of detailedReport.priorityActions.slice(0, 3)) {
            console.log(`  • ${action}`);
        }
    }

    // Get top improvement candidates
    const topCandidates = engine.getTopImprovementCandidates(reports, 5);
    console.log('\n=== Top Improvement Candidates ===');
    for (const candidate of topCandidates) {
        console.log(`${candidate.gameName}: ${candidate.totalScore}/25`);
    }

    return { reports, flaggedGames, topCandidates };
}

/**
 * Example: Focus on specific dimension improvements
 */
export function exampleFocusOnDimension(dimension: string) {
    const engine = new AuditEngine();

    const game: Game = {
        id: 'test-game',
        name: 'Test Game',
        description: 'Test',
        category: 'Test',
        ageRange: '5-7',
        difficulty: 'Easy',
        estimatedTime: 30,
        requiredTechnologies: ['React'],
        successCriteria: ['Complete tasks'],
        isImplemented: true,
        lastUpdated: new Date().toISOString(),
    };

    const context: AuditContext = {
        gameData: {
            educationalObjectives: ['obj1'],
            skillsDeveloped: ['skill1'],
            ageRange: '5-7',
            userFeedback: [{ sentiment: 'positive' }],
            completionRate: 0.5,
            averageSessionDuration: 120,
            bugCount: 10,
            performanceScore: 75,
            accessibilityChecks: {
                colorContrastRatio: 3.5,
                keyboardNavigation: false,
                screenReaderSupport: false,
                timeoutOptions: false,
            },
            contentItems: Array(20).fill('item'),
            variations: ['var1'],
            levels: ['level1'],
        },
    };

    const auditReport = engine.auditGame(game, context);
    const detailedReport = engine.generateDetailedReport(auditReport);

    // Find recommendations for specific dimension
    const dimensionRec = detailedReport.detailedRecommendations.find(
        rec => rec.dimension === dimension
    );

    if (dimensionRec) {
        console.log(`=== ${dimension} Improvement Plan ===`);
        console.log(`Current Score: ${dimensionRec.currentScore}/5`);
        console.log(`Target Score: ${dimensionRec.targetScore}/5`);
        console.log(`Priority: ${dimensionRec.priority}`);
        console.log(`Estimated Effort: ${dimensionRec.estimatedEffort}`);
        console.log(`Expected Impact: ${dimensionRec.expectedImpact}`);
        console.log('\nAction Items:');
        for (let i = 0; i < dimensionRec.actionItems.length; i++) {
            console.log(`  ${i + 1}. ${dimensionRec.actionItems[i]}`);
        }
    } else {
        console.log(`No improvements needed for ${dimension} (score is 5/5)`);
    }

    return dimensionRec;
}

// Uncomment to run examples:
// exampleGenerateDetailedReport();
// exampleCompareMultipleGames();
// exampleFocusOnDimension('Accessibility');
