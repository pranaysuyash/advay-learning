// Educational Impact Calculation Tests
// Feature: game-quality-and-new-games, Task 3.2

import { describe, it, expect } from 'vitest';
import {
    calculateEducationalImpact,
    calculateCurriculumAlignment,
    calculateAgeRangeBreadth,
    calculateSkillDiversity,
    isValidEducationalImpact,
    EDUCATIONAL_IMPACT_WEIGHTS,
    type EducationalImpactBreakdown,
} from './educationalImpact';
import type { Game, CatalogEntry } from '../types';

// Test utilities for generating test data
function createTestGame(overrides: Partial<Game> = {}): Game {
    return {
        id: 'test-game-1',
        name: 'Test Game',
        description: 'A test game for educational impact calculation',
        category: 'Literacy',
        ageRange: '5-8',
        difficulty: 'Medium',
        estimatedTime: 30,
        requiredTechnologies: ['HTML5', 'JavaScript'],
        successCriteria: ['Complete all levels', 'Score above 80%'],
        isImplemented: true,
        educationalObjectives: ['Reading comprehension', 'Vocabulary building'],
        userFeedback: [],
        playCount: 100,
        lastUpdated: new Date().toISOString(),
        ...overrides,
    };
}

function createTestCatalogEntry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
    return {
        gameId: 'catalog-game-1',
        id: 'catalog-game-1',
        name: 'Test Catalog Game',
        description: 'A test catalog entry for educational impact calculation',
        category: 'Numeracy',
        subcategory: 'Addition',
        ageRange: '6-10',
        difficulty: 'Easy',
        estimatedTime: 20,
        requiredTechnologies: ['HTML5'],
        successCriteria: ['Solve 10 problems correctly'],
        educationalObjectives: ['Basic addition', 'Number recognition'],
        skillsDeveloped: ['mathematical', 'cognitive'],
        isImplemented: false,
        lastUpdated: new Date().toISOString(),
        ...overrides,
    };
}

describe('Educational Impact Calculation', () => {
    describe('calculateCurriculumAlignment', () => {
        it('should return 100 for strategic curriculum categories', () => {
            const strategicCategories = ['Literacy', 'Numeracy', 'Science', 'Motor Skills', 'Social-Emotional'];

            for (const category of strategicCategories) {
                const game = createTestGame({ category });
                const score = calculateCurriculumAlignment(game);
                expect(score).toBe(100);
            }
        });

        it('should return 50 base score for non-strategic categories', () => {
            const game = createTestGame({ category: 'Entertainment' });
            const score = calculateCurriculumAlignment(game);
            expect(score).toBe(50);
        });

        it('should return 0 for empty category', () => {
            const game = createTestGame({ category: '' });
            const score = calculateCurriculumAlignment(game);
            expect(score).toBe(0);
        });

        it('should add bonus points for curriculum-related keywords in objectives', () => {
            const game = createTestGame({
                category: 'Entertainment',
                educationalObjectives: [
                    'Aligned with state curriculum standards for grade 2',
                    'Supports common core learning objectives',
                ],
            });
            const score = calculateCurriculumAlignment(game);
            expect(score).toBe(90); // 50 base + 40 (2 matches * 20)
        });

        it('should cap keyword bonus at 60 points', () => {
            const game = createTestGame({
                category: 'Entertainment',
                educationalObjectives: [
                    'curriculum aligned',
                    'meets educational standards',
                    'grade level appropriate',
                    'learning outcomes covered',
                ],
            });
            const score = calculateCurriculumAlignment(game);
            expect(score).toBe(100); // 50 base + 60 (capped at 100)
        });
    });

    describe('calculateAgeRangeBreadth', () => {
        it('should return 60 for narrow age ranges (0-2 years)', () => {
            const game = createTestGame({ ageRange: '5-7' });
            const score = calculateAgeRangeBreadth(game);
            expect(score).toBe(60);
        });

        it('should return 80 for medium age ranges (3-5 years)', () => {
            const game = createTestGame({ ageRange: '5-10' });
            const score = calculateAgeRangeBreadth(game);
            expect(score).toBe(80);
        });

        it('should return 100 for broad age ranges (6-8 years)', () => {
            const game = createTestGame({ ageRange: '4-12' });
            const score = calculateAgeRangeBreadth(game);
            expect(score).toBe(100);
        });

        it('should return 90 for very broad age ranges (9+ years)', () => {
            const game = createTestGame({ ageRange: '3-15' });
            const score = calculateAgeRangeBreadth(game);
            expect(score).toBe(90);
        });

        it('should return 0 for empty age range', () => {
            const game = createTestGame({ ageRange: '' });
            const score = calculateAgeRangeBreadth(game);
            expect(score).toBe(0);
        });

        it('should return 50 for invalid format', () => {
            const game = createTestGame({ ageRange: 'invalid' });
            const score = calculateAgeRangeBreadth(game);
            expect(score).toBe(50);
        });

        it('should return 30 for min >= max', () => {
            const game = createTestGame({ ageRange: '10-5' });
            const score = calculateAgeRangeBreadth(game);
            expect(score).toBe(30);
        });
    });

    describe('calculateSkillDiversity', () => {
        it('should return 0 for game with no educational objectives', () => {
            const game = createTestGame({ educationalObjectives: [] });
            const score = calculateSkillDiversity(game);
            expect(score).toBe(0);
        });

        it('should calculate score based on skill categories in objectives', () => {
            const game = createTestGame({
                educationalObjectives: [
                    'Improve cognitive thinking',
                    'Develop motor coordination',
                    'Build language skills',
                ],
            });
            const score = calculateSkillDiversity(game);
            expect(score).toBe(45); // 3 categories * 15
        });

        it('should cap at 100 points for 7+ categories', () => {
            const game = createTestGame({
                educationalObjectives: [
                    'cognitive skill',
                    'motor skill',
                    'social skill',
                    'emotional skill',
                    'language skill',
                    'mathematical skill',
                    'scientific skill',
                    'creative skill',
                ],
            });
            const score = calculateSkillDiversity(game);
            expect(score).toBe(100); // capped at 7 * 15 = 105, but max is 100
        });

        it('should use skillsDeveloped for catalog entries', () => {
            const entry = createTestCatalogEntry({
                skillsDeveloped: ['mathematical', 'cognitive', 'motor'],
            });
            const score = calculateSkillDiversity(entry);
            expect(score).toBe(45); // 3 categories * 15
        });
    });

    describe('calculateEducationalImpact', () => {
        it('should return valid breakdown for a complete game', () => {
            const game = createTestGame();
            const result = calculateEducationalImpact(game);

            expect(result).toHaveProperty('curriculumAlignment');
            expect(result).toHaveProperty('ageRangeBreadth');
            expect(result).toHaveProperty('skillDiversity');
            expect(result).toHaveProperty('totalScore');
        });

        it('should calculate weighted total score correctly', () => {
            const game = createTestGame({
                category: 'Literacy',
                ageRange: '5-10',
                educationalObjectives: [
                    'cognitive skill development',
                    'language skill building',
                ],
            });
            const result = calculateEducationalImpact(game);

            // Expected: 100 * 0.4 + 80 * 0.3 + 30 * 0.3 = 40 + 24 + 9 = 73
            const expected =
                100 * EDUCATIONAL_IMPACT_WEIGHTS.curriculumAlignment +
                80 * EDUCATIONAL_IMPACT_WEIGHTS.ageRangeBreadth +
                30 * EDUCATIONAL_IMPACT_WEIGHTS.skillDiversity;

            expect(result.totalScore).toBeCloseTo(expected, 2);
        });

        it('should handle catalog entries correctly', () => {
            const entry = createTestCatalogEntry({
                category: 'Numeracy',
                ageRange: '6-9',
                skillsDeveloped: ['mathematical', 'cognitive'],
            });
            const result = calculateEducationalImpact(entry);

            expect(result.curriculumAlignment).toBe(100);
            expect(result.ageRangeBreadth).toBe(80);
            expect(result.skillDiversity).toBe(30);
        });

        it('should return 0 for completely empty game', () => {
            const emptyGame: Game = {
                id: 'empty',
                name: 'Empty',
                description: '',
                category: '',
                ageRange: '',
                difficulty: 'Easy',
                estimatedTime: 0,
                requiredTechnologies: [],
                successCriteria: [],
                isImplemented: false,
                lastUpdated: new Date().toISOString(),
            };
            const result = calculateEducationalImpact(emptyGame);

            expect(result.totalScore).toBe(0);
        });
    });

    describe('isValidEducationalImpact', () => {
        it('should return true for valid breakdown', () => {
            const validBreakdown: EducationalImpactBreakdown = {
                curriculumAlignment: 50,
                ageRangeBreadth: 60,
                skillDiversity: 70,
                totalScore: 60,
            };
            expect(isValidEducationalImpact(validBreakdown)).toBe(true);
        });

        it('should return false for scores below 0', () => {
            const invalidBreakdown: EducationalImpactBreakdown = {
                curriculumAlignment: -10,
                ageRangeBreadth: 50,
                skillDiversity: 50,
                totalScore: 30,
            };
            expect(isValidEducationalImpact(invalidBreakdown)).toBe(false);
        });

        it('should return false for scores above 100', () => {
            const invalidBreakdown: EducationalImpactBreakdown = {
                curriculumAlignment: 150,
                ageRangeBreadth: 50,
                skillDiversity: 50,
                totalScore: 83,
            };
            expect(isValidEducationalImpact(invalidBreakdown)).toBe(false);
        });

        it('should return true for boundary values (0 and 100)', () => {
            const zeroBreakdown: EducationalImpactBreakdown = {
                curriculumAlignment: 0,
                ageRangeBreadth: 0,
                skillDiversity: 0,
                totalScore: 0,
            };
            expect(isValidEducationalImpact(zeroBreakdown)).toBe(true);

            const maxBreakdown: EducationalImpactBreakdown = {
                curriculumAlignment: 100,
                ageRangeBreadth: 100,
                skillDiversity: 100,
                totalScore: 100,
            };
            expect(isValidEducationalImpact(maxBreakdown)).toBe(true);
        });
    });

    describe('EDUCATIONAL_IMPACT_WEIGHTS', () => {
        it('should have correct weight values', () => {
            expect(EDUCATIONAL_IMPACT_WEIGHTS.curriculumAlignment).toBe(0.4);
            expect(EDUCATIONAL_IMPACT_WEIGHTS.ageRangeBreadth).toBe(0.3);
            expect(EDUCATIONAL_IMPACT_WEIGHTS.skillDiversity).toBe(0.3);
        });

        it('should sum to 1.0', () => {
            const sum =
                EDUCATIONAL_IMPACT_WEIGHTS.curriculumAlignment +
                EDUCATIONAL_IMPACT_WEIGHTS.ageRangeBreadth +
                EDUCATIONAL_IMPACT_WEIGHTS.skillDiversity;
            expect(sum).toBe(1.0);
        });
    });
});

describe('Educational Impact - Edge Cases', () => {
    it('should handle games with undefined educationalObjectives', () => {
        const game = createTestGame({ educationalObjectives: undefined });
        const result = calculateEducationalImpact(game);
        expect(result.skillDiversity).toBe(0);
    });

    it('should handle catalog entries with undefined skillsDeveloped', () => {
        const entry = createTestCatalogEntry({ skillsDeveloped: undefined });
        const result = calculateEducationalImpact(entry);
        expect(result.skillDiversity).toBe(0);
    });

    it('should handle case-insensitive category matching', () => {
        const game = createTestGame({ category: 'LITERACY' });
        const score = calculateCurriculumAlignment(game);
        expect(score).toBe(100);
    });

    it('should handle case-insensitive skill category matching', () => {
        const entry = createTestCatalogEntry({
            skillsDeveloped: ['COGNITIVE', 'MOTOR'],
        });
        const score = calculateSkillDiversity(entry);
        expect(score).toBe(30);
    });
});

describe('Educational Impact - Integration with PriorityEngine', () => {
    it('should produce scores compatible with priority calculation', () => {
        const game = createTestGame({
            category: 'Literacy',
            ageRange: '5-8',
            educationalObjectives: ['Reading', 'Writing', 'Spelling'],
        });
        const impact = calculateEducationalImpact(game);

        // Educational impact should be in 0-100 range for priority calculation
        expect(impact.totalScore).toBeGreaterThanOrEqual(0);
        expect(impact.totalScore).toBeLessThanOrEqual(100);
    });

    it('should provide individual components for detailed analysis', () => {
        const game = createTestGame({
            category: 'Science',
            ageRange: '7-12',
            educationalObjectives: ['Scientific method', 'Observation skills'],
        });
        const impact = calculateEducationalImpact(game);

        // All components should be available for reporting
        expect(typeof impact.curriculumAlignment).toBe('number');
        expect(typeof impact.ageRangeBreadth).toBe('number');
        expect(typeof impact.skillDiversity).toBe('number');
    });
});