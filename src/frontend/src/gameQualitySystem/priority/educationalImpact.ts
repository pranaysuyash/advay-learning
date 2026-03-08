// Educational Impact Calculation Module
// Calculates weighted educational impact score based on:
// - Curriculum_Alignment: How well the game aligns with educational curricula
// - Age_Range_Breadth: The breadth of age groups the game serves
// - Skill_Diversity: The diversity of skills developed by the game

import type { Game, CatalogEntry } from '../types';

/**
 * Educational Impact breakdown with individual component scores
 */
export interface EducationalImpactBreakdown {
    curriculumAlignment: number;    // 0-100: How well game aligns with educational curricula
    ageRangeBreadth: number;        // 0-100: Breadth of age groups the game serves
    skillDiversity: number;         // 0-100: Diversity of skills developed by the game
    totalScore: number;             // 0-100: Weighted total educational impact score
}

/**
 * Weights for educational impact components
 */
export const EDUCATIONAL_IMPACT_WEIGHTS = {
    curriculumAlignment: 0.4,
    ageRangeBreadth: 0.3,
    skillDiversity: 0.3,
};

/**
 * Common curriculum categories for alignment scoring
 */
const STRATEGIC_CURRICULUM_CATEGORIES = [
    'Literacy',
    'Numeracy',
    'Science',
    'Motor Skills',
    'Social-Emotional',
    'Critical Thinking',
    'Problem Solving',
];

/**
 * Core skill categories for diversity scoring
 */
const CORE_SKILL_CATEGORIES = [
    'cognitive',
    'motor',
    'social',
    'emotional',
    'language',
    'mathematical',
    'scientific',
    'creative',
];

/**
 * Calculates the curriculum alignment score for a game.
 * 
 * @param game - The game to evaluate
 * @returns A score from 0-100 representing curriculum alignment
 */
export function calculateCurriculumAlignment(game: Game | CatalogEntry): number {
    if (!game.category || game.category === '') {
        return 0;
    }

    // Check if category is in strategic curriculum list
    const isStrategicCategory = STRATEGIC_CURRICULUM_CATEGORIES.some(
        (cat) => cat.toLowerCase() === game.category.toLowerCase()
    );

    if (isStrategicCategory) {
        return 100;
    }

    // Check educational objectives for curriculum keywords
    const objectives = game.educationalObjectives || [];
    const curriculumKeywords = ['curriculum', 'standards', 'grade', 'learning', 'educational'];

    let keywordMatches = 0;
    for (const objective of objectives) {
        const objectiveText = objective.toLowerCase();
        for (const keyword of curriculumKeywords) {
            if (objectiveText.includes(keyword)) {
                keywordMatches++;
                break;
            }
        }
    }

    // Score based on keyword matches (max 3 matches = 60 points)
    const keywordScore = Math.min(60, keywordMatches * 20);

    // Base score for having a category (50 points) + keyword bonus, capped at 100
    return Math.min(100, 50 + keywordScore);
}

/**
 * Calculates the age range breadth score for a game.
 * 
 * @param game - The game to evaluate
 * @returns A score from 0-100 representing age range breadth
 */
export function calculateAgeRangeBreadth(game: Game | CatalogEntry): number {
    if (!game.ageRange || game.ageRange === '') {
        return 0;
    }

    const ranges = game.ageRange.split('-');
    if (ranges.length !== 2) {
        return 50; // Default middle score for invalid format
    }

    const minAge = parseInt(ranges[0], 10);
    const maxAge = parseInt(ranges[1], 10);

    if (isNaN(minAge) || isNaN(maxAge)) {
        return 50;
    }

    if (minAge >= maxAge) {
        return 30; // Invalid range
    }

    const rangeSize = maxAge - minAge;

    // Score based on range size:
    // 0-2 years: 60 points (narrow but focused)
    // 3-5 years: 80 points (good breadth)
    // 6-8 years: 100 points (excellent breadth)
    // 9+ years: 90 points (very broad, may be too general)

    if (rangeSize <= 2) {
        return 60;
    } else if (rangeSize <= 5) {
        return 80;
    } else if (rangeSize <= 8) {
        return 100;
    } else {
        return 90;
    }
}

/**
 * Calculates the skill diversity score for a game.
 * 
 * @param game - The game to evaluate
 * @returns A score from 0-100 representing skill diversity
 */
export function calculateSkillDiversity(game: Game | CatalogEntry): number {
    // For CatalogEntry, use skillsDeveloped field
    if ('skillsDeveloped' in game && game.skillsDeveloped) {
        return calculateSkillDiversityFromArray(game.skillsDeveloped);
    }

    // For Game, use educationalObjectives to infer skills
    const objectives = game.educationalObjectives || [];
    if (objectives.length === 0) {
        return 0;
    }

    // Count unique skill categories covered by objectives
    const coveredCategories = new Set<string>();

    for (const objective of objectives) {
        const objectiveLower = objective.toLowerCase();

        for (const category of CORE_SKILL_CATEGORIES) {
            if (objectiveLower.includes(category)) {
                coveredCategories.add(category);
            }
        }
    }

    // Score based on number of unique skill categories (max 7 categories = 100 points)
    const uniqueCategories = coveredCategories.size;
    return Math.min(100, uniqueCategories * 15);
}

/**
 * Calculates skill diversity from an array of skill names.
 * 
 * @param skills - Array of skill names
 * @returns A score from 0-100 representing skill diversity
 */
function calculateSkillDiversityFromArray(skills: string[]): number {
    if (!skills || skills.length === 0) {
        return 0;
    }

    // Count unique skill categories covered
    const coveredCategories = new Set<string>();

    for (const skill of skills) {
        const skillLower = skill.toLowerCase();

        for (const category of CORE_SKILL_CATEGORIES) {
            if (skillLower.includes(category)) {
                coveredCategories.add(category);
            }
        }
    }

    // Score based on number of unique skill categories (max 7 categories = 100 points)
    const uniqueCategories = coveredCategories.size;
    return Math.min(100, uniqueCategories * 15);
}

/**
 * Calculates the complete educational impact breakdown for a game.
 * 
 * @param game - The game to evaluate
 * @returns EducationalImpactBreakdown with individual components and total score
 */
export function calculateEducationalImpact(game: Game | CatalogEntry): EducationalImpactBreakdown {
    const curriculumAlignment = calculateCurriculumAlignment(game);
    const ageRangeBreadth = calculateAgeRangeBreadth(game);
    const skillDiversity = calculateSkillDiversity(game);

    // Calculate weighted total score
    const totalScore =
        curriculumAlignment * EDUCATIONAL_IMPACT_WEIGHTS.curriculumAlignment +
        ageRangeBreadth * EDUCATIONAL_IMPACT_WEIGHTS.ageRangeBreadth +
        skillDiversity * EDUCATIONAL_IMPACT_WEIGHTS.skillDiversity;

    return {
        curriculumAlignment,
        ageRangeBreadth,
        skillDiversity,
        totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    };
}

/**
 * Validates that educational impact scores are within valid range (0-100).
 * 
 * @param breakdown - The educational impact breakdown to validate
 * @returns true if all scores are valid, false otherwise
 */
export function isValidEducationalImpact(breakdown: EducationalImpactBreakdown): boolean {
    return (
        breakdown.curriculumAlignment >= 0 &&
        breakdown.curriculumAlignment <= 100 &&
        breakdown.ageRangeBreadth >= 0 &&
        breakdown.ageRangeBreadth <= 100 &&
        breakdown.skillDiversity >= 0 &&
        breakdown.skillDiversity <= 100 &&
        breakdown.totalScore >= 0 &&
        breakdown.totalScore <= 100
    );
}