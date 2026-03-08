import { describe, it, expect } from 'vitest';
import { scoreDimension, AUDIT_CRITERIA } from './auditDimensions';
import type { AuditDimension } from '../types';

describe('auditDimensions - Dimension Scoring Logic', () => {
    describe('Educational_Value scoring', () => {
        it('should return score 1 for games with no educational objectives', () => {
            const gameData = {
                educationalObjectives: [],
                skillsDeveloped: ['skill1'],
                ageRange: '5-7',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result.score).toBe(1);
            expect(result.dimension).toBe('Educational_Value');
            expect(result.issues).toContain('No educational objectives defined');
        });

        it('should return score 2 for games with no skills developed', () => {
            const gameData = {
                educationalObjectives: ['objective1'],
                skillsDeveloped: [],
                ageRange: '5-7',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('No skills developed documented');
        });

        it('should return score 2 for games with no age range', () => {
            const gameData = {
                educationalObjectives: ['objective1'],
                skillsDeveloped: ['skill1'],
                ageRange: '',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('No age range specified');
        });

        it('should return score 3 for games with insufficient educational objectives', () => {
            const gameData = {
                educationalObjectives: ['objective1'],
                skillsDeveloped: ['skill1', 'skill2'],
                ageRange: '5-7',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result.score).toBe(3);
            expect(result.issues).toContain('Insufficient educational objectives');
        });

        it('should return score 4 for games with good educational content', () => {
            const gameData = {
                educationalObjectives: ['obj1', 'obj2', 'obj3'],
                skillsDeveloped: ['skill1', 'skill2'],
                ageRange: '5-7',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result.score).toBe(4);
            expect(result.issues).toHaveLength(0);
        });

        it('should return score 5 for games with excellent educational content', () => {
            const gameData = {
                educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                ageRange: '5-7',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result.score).toBe(5);
            expect(result.issues).toHaveLength(0);
        });
    });

    describe('User_Experience scoring', () => {
        it('should return score 2 for games with no user feedback', () => {
            const gameData = {
                userFeedback: [],
                completionRate: 0.5,
                averageSessionDuration: 120,
            };
            const result = scoreDimension('User_Experience', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('No user feedback data available');
        });

        it('should return score 2 for games with low completion rate', () => {
            const gameData = {
                userFeedback: [{ sentiment: 'positive' }],
                completionRate: 0.2,
                averageSessionDuration: 120,
            };
            const result = scoreDimension('User_Experience', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('Low completion rate: 20%');
        });

        it('should return score 3 for games with short average session', () => {
            const gameData = {
                userFeedback: [{ sentiment: 'positive' }],
                completionRate: 0.5,
                averageSessionDuration: 50,
            };
            const result = scoreDimension('User_Experience', gameData, {});

            expect(result.score).toBe(3);
            expect(result.issues).toContain('Short average session: 50s');
        });

        it('should return score 4 for games with good user experience', () => {
            const gameData = {
                userFeedback: [{ sentiment: 'positive' }],
                completionRate: 0.6,
                averageSessionDuration: 150,
            };
            const result = scoreDimension('User_Experience', gameData, {});

            expect(result.score).toBe(4);
            expect(result.issues).toHaveLength(0);
        });

        it('should return score 5 for games with excellent user experience', () => {
            const gameData = {
                userFeedback: [{ sentiment: 'positive' }],
                completionRate: 0.8,
                averageSessionDuration: 200,
            };
            const result = scoreDimension('User_Experience', gameData, {});

            expect(result.score).toBe(5);
            expect(result.issues).toHaveLength(0);
        });
    });

    describe('Technical_Quality scoring', () => {
        it('should return score 1 for games with high bug count', () => {
            const gameData = {
                bugCount: 60,
                crashRate: 0.01,
                performanceScore: 80,
            };
            const result = scoreDimension('Technical_Quality', gameData, {});

            expect(result.score).toBe(1);
            expect(result.issues).toContain('High bug count: 60');
        });

        it('should return score 1 for games with high crash rate', () => {
            const gameData = {
                bugCount: 10,
                crashRate: 0.06,
                performanceScore: 80,
            };
            const result = scoreDimension('Technical_Quality', gameData, {});

            expect(result.score).toBe(1);
            expect(result.issues).toContain('High crash rate: 6%');
        });

        it('should return score 2 for games with moderate bug count', () => {
            const gameData = {
                bugCount: 25,
                crashRate: 0.01,
                performanceScore: 80,
            };
            const result = scoreDimension('Technical_Quality', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('Moderate bug count: 25');
        });

        it('should return score 3 for games with low performance score', () => {
            const gameData = {
                bugCount: 5,
                crashRate: 0.01,
                performanceScore: 65,
            };
            const result = scoreDimension('Technical_Quality', gameData, {});

            expect(result.score).toBe(3);
            expect(result.issues).toContain('Low performance score: 65');
        });

        it('should return score 4 for games with good technical quality', () => {
            const gameData = {
                bugCount: 5,
                crashRate: 0.01,
                performanceScore: 85,
            };
            const result = scoreDimension('Technical_Quality', gameData, {});

            expect(result.score).toBe(4);
            expect(result.issues).toHaveLength(0);
        });

        it('should return score 5 for games with excellent technical quality', () => {
            const gameData = {
                bugCount: 0,
                performanceScore: 95,
            };
            const result = scoreDimension('Technical_Quality', gameData, {});

            expect(result.score).toBe(5);
            expect(result.issues).toHaveLength(0);
        });
    });

    describe('Accessibility scoring', () => {
        it('should return score 1 for games with no accessibility checks', () => {
            const gameData = {};
            const result = scoreDimension('Accessibility', gameData, {});

            expect(result.score).toBe(1);
            expect(result.issues).toContain('No accessibility checks performed');
        });

        it('should return score 2 for games with insufficient color contrast', () => {
            const gameData = {
                accessibilityChecks: {
                    colorContrastRatio: 2.5,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                },
            };
            const result = scoreDimension('Accessibility', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('Insufficient color contrast');
        });

        it('should return score 2 for games without keyboard navigation', () => {
            const gameData = {
                accessibilityChecks: {
                    colorContrastRatio: 4.5,
                    keyboardNavigation: false,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                },
            };
            const result = scoreDimension('Accessibility', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('No keyboard navigation');
        });

        it('should return score 3 for games without timeout options', () => {
            const gameData = {
                accessibilityChecks: {
                    colorContrastRatio: 4.5,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: false,
                },
            };
            const result = scoreDimension('Accessibility', gameData, {});

            expect(result.score).toBe(3);
            expect(result.issues).toContain('No timeout options');
        });

        it('should return score 4 for games with good accessibility', () => {
            const gameData = {
                accessibilityChecks: {
                    colorContrastRatio: 4.0,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                },
            };
            const result = scoreDimension('Accessibility', gameData, {});

            expect(result.score).toBe(4);
            expect(result.issues).toHaveLength(0);
        });

        it('should return score 5 for games with excellent accessibility', () => {
            const gameData = {
                accessibilityChecks: {
                    colorContrastRatio: 4.5,
                    keyboardNavigation: true,
                    screenReaderSupport: true,
                    timeoutOptions: true,
                },
            };
            const result = scoreDimension('Accessibility', gameData, {});

            expect(result.score).toBe(5);
            expect(result.issues).toHaveLength(0);
        });
    });

    describe('Content_Completeness scoring', () => {
        it('should return score 1 for games with no content items', () => {
            const gameData = {
                contentItems: [],
                variations: ['var1'],
                levels: ['level1'],
            };
            const result = scoreDimension('Content_Completeness', gameData, {});

            expect(result.score).toBe(1);
            expect(result.issues).toContain('No content items defined');
        });

        it('should return score 2 for games with insufficient content items', () => {
            const gameData = {
                contentItems: ['item1', 'item2', 'item3'],
                variations: ['var1'],
                levels: ['level1'],
            };
            const result = scoreDimension('Content_Completeness', gameData, {});

            expect(result.score).toBe(2);
            expect(result.issues).toContain('Insufficient content items: 3');
        });

        it('should return score 3 for games with no variations', () => {
            const gameData = {
                contentItems: Array(15).fill('item'),
                variations: [],
                levels: ['level1'],
            };
            const result = scoreDimension('Content_Completeness', gameData, {});

            expect(result.score).toBe(3);
            expect(result.issues).toContain('No content variations defined');
        });

        it('should return score 3 for games with no difficulty levels', () => {
            const gameData = {
                contentItems: Array(15).fill('item'),
                variations: ['var1'],
                levels: [],
            };
            const result = scoreDimension('Content_Completeness', gameData, {});

            expect(result.score).toBe(3);
            expect(result.issues).toContain('No difficulty levels defined');
        });

        it('should return score 4 for games with good content completeness', () => {
            const gameData = {
                contentItems: Array(30).fill('item'),
                variations: ['var1', 'var2'],
                levels: ['level1', 'level2'],
            };
            const result = scoreDimension('Content_Completeness', gameData, {});

            expect(result.score).toBe(4);
            expect(result.issues).toHaveLength(0);
        });

        it('should return score 5 for games with excellent content completeness', () => {
            const gameData = {
                contentItems: Array(50).fill('item'),
                variations: ['var1', 'var2', 'var3'],
                levels: ['level1', 'level2', 'level3'],
            };
            const result = scoreDimension('Content_Completeness', gameData, {});

            expect(result.score).toBe(5);
            expect(result.issues).toHaveLength(0);
        });
    });

    describe('Score range validation', () => {
        const dimensions: AuditDimension[] = [
            'Educational_Value',
            'User_Experience',
            'Technical_Quality',
            'Accessibility',
            'Content_Completeness',
        ];

        dimensions.forEach((dimension) => {
            it(`should return scores between 1 and 5 for ${dimension}`, () => {
                const testCases = [
                    {}, // Minimal data
                    { educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'], skillsDeveloped: ['skill1', 'skill2', 'skill3'], ageRange: '5-7' },
                    { userFeedback: [{ sentiment: 'positive' }], completionRate: 0.8, averageSessionDuration: 200 },
                    { bugCount: 0, performanceScore: 95 },
                    { accessibilityChecks: { colorContrastRatio: 4.5, keyboardNavigation: true, screenReaderSupport: true, timeoutOptions: true } },
                    { contentItems: Array(50).fill('item'), variations: ['var1', 'var2', 'var3'], levels: ['level1', 'level2', 'level3'] },
                ];

                testCases.forEach((gameData) => {
                    const result = scoreDimension(dimension, gameData, {});
                    expect(result.score).toBeGreaterThanOrEqual(1);
                    expect(result.score).toBeLessThanOrEqual(5);
                    expect(Number.isInteger(result.score)).toBe(true);
                });
            });
        });
    });

    describe('AUDIT_CRITERIA structure', () => {
        it('should have criteria for all five dimensions', () => {
            expect(AUDIT_CRITERIA).toHaveProperty('Educational_Value');
            expect(AUDIT_CRITERIA).toHaveProperty('User_Experience');
            expect(AUDIT_CRITERIA).toHaveProperty('Technical_Quality');
            expect(AUDIT_CRITERIA).toHaveProperty('Accessibility');
            expect(AUDIT_CRITERIA).toHaveProperty('Content_Completeness');
        });

        it('should have score descriptions for all levels (1-5)', () => {
            const dimensions: AuditDimension[] = [
                'Educational_Value',
                'User_Experience',
                'Technical_Quality',
                'Accessibility',
                'Content_Completeness',
            ];

            dimensions.forEach((dimension) => {
                const criteria = AUDIT_CRITERIA[dimension];
                expect(criteria.score1).toBeTruthy();
                expect(criteria.score2).toBeTruthy();
                expect(criteria.score3).toBeTruthy();
                expect(criteria.score4).toBeTruthy();
                expect(criteria.score5).toBeTruthy();
            });
        });
    });

    describe('Return value structure', () => {
        it('should return AuditScore with all required fields', () => {
            const gameData = {
                educationalObjectives: ['obj1', 'obj2'],
                skillsDeveloped: ['skill1', 'skill2'],
                ageRange: '5-7',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result).toHaveProperty('dimension');
            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('comments');
            expect(result).toHaveProperty('issues');
            expect(Array.isArray(result.issues)).toBe(true);
        });

        it('should include appropriate comments from criteria', () => {
            const gameData = {
                educationalObjectives: ['obj1', 'obj2', 'obj3', 'obj4'],
                skillsDeveloped: ['skill1', 'skill2', 'skill3'],
                ageRange: '5-7',
            };
            const result = scoreDimension('Educational_Value', gameData, {});

            expect(result.comments).toBe(AUDIT_CRITERIA.Educational_Value.score5);
        });
    });
});
