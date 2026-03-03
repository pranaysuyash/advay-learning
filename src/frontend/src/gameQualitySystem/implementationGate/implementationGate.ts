// Implementation Gate for Game Quality System

import { ImplementationPlan, ImplementationTask } from '../types';

export interface ImplementationGateConfig {
    requiredFields: string[];
    minTaskCount: number;
    requireTests: boolean;
    requireAccessibility: boolean;
    requireDocumentation: boolean;
}

export class ImplementationGate {
    private readonly DEFAULT_CONFIG: ImplementationGateConfig = {
        requiredFields: [
            'name',
            'educationalObjectives',
            'difficulty',
            'estimatedTime',
            'requiredTechnologies',
            'successCriteria',
        ],
        minTaskCount: 5,
        requireTests: true,
        requireAccessibility: true,
        requireDocumentation: true,
    };

    private config: ImplementationGateConfig;

    constructor(config: Partial<ImplementationGateConfig> = {}) {
        this.config = { ...this.DEFAULT_CONFIG, ...config };
    }

    public verifyRequiredFields(gameData: any): { passed: boolean; missing: string[] } {
        const missing: string[] = [];

        for (const field of this.config.requiredFields) {
            if (!gameData[field] || (Array.isArray(gameData[field]) && gameData[field].length === 0)) {
                missing.push(field);
            }
        }

        return {
            passed: missing.length === 0,
            missing,
        };
    }

    public verifyAssets(gameData: any): { passed: boolean; issues: string[] } {
        const issues: string[] = [];

        if (gameData.externalAssets) {
            for (const asset of gameData.externalAssets) {
                if (!asset.source || !asset.accessible) {
                    issues.push(`Asset ${asset.name || 'unnamed'} missing source or accessibility info`);
                }
            }
        }

        return {
            passed: issues.length === 0,
            issues,
        };
    }

    public generateImplementationPlan(gameId: string, gameData: any): ImplementationPlan {
        const tasks: ImplementationTask[] = [];
        let estimatedEffort = 0;

        // Core implementation tasks
        tasks.push({
            id: 'impl-1',
            description: 'Set up project structure and base components',
            estimatedHours: 8,
            dependencies: [],
            isTestTask: false,
            requirementRefs: ['2.4', '2.5'],
        });
        estimatedEffort += 8;

        tasks.push({
            id: 'impl-2',
            description: 'Implement core game mechanics',
            estimatedHours: gameData.estimatedTime || 40,
            dependencies: ['impl-1'],
            isTestTask: false,
            requirementRefs: ['2.4'],
        });
        estimatedEffort += (gameData.estimatedTime || 40);

        // Test tasks
        if (this.config.requireTests) {
            tasks.push({
                id: 'test-1',
                description: 'Write unit tests for core mechanics',
                estimatedHours: 16,
                dependencies: ['impl-2'],
                isTestTask: true,
                propertyNumber: 1,
                requirementRefs: ['2.5'],
            });
            estimatedEffort += 16;

            tasks.push({
                id: 'test-2',
                description: 'Write integration tests',
                estimatedHours: 12,
                dependencies: ['test-1'],
                isTestTask: true,
                propertyNumber: 2,
                requirementRefs: ['2.5'],
            });
            estimatedEffort += 12;
        }

        // Accessibility tasks
        if (this.config.requireAccessibility) {
            tasks.push({
                id: 'a11y-1',
                description: 'Implement accessibility features',
                estimatedHours: 8,
                dependencies: ['impl-2'],
                isTestTask: false,
                requirementRefs: ['2.5'],
            });
            estimatedEffort += 8;
        }

        // Documentation tasks
        if (this.config.requireDocumentation) {
            tasks.push({
                id: 'docs-1',
                description: 'Write user documentation',
                estimatedHours: 4,
                dependencies: ['impl-2'],
                isTestTask: false,
                requirementRefs: ['2.5'],
            });
            estimatedEffort += 4;

            tasks.push({
                id: 'docs-2',
                description: 'Write developer documentation',
                estimatedHours: 4,
                dependencies: ['docs-1'],
                isTestTask: false,
                requirementRefs: ['2.5'],
            });
            estimatedEffort += 4;
        }

        return {
            gameId,
            tasks,
            estimatedEffortHours: estimatedEffort,
            dependencies: [],
            requiredAssets: gameData.externalAssets?.map((a: any) => a.name) || [],
            testRequirements: this.config.requireTests ? ['unit', 'integration'] : [],
        };
    }

    public verifyImplementationPlan(plan: ImplementationPlan): { passed: boolean; issues: string[] } {
        const issues: string[] = [];

        if (plan.tasks.length < this.config.minTaskCount) {
            issues.push(`Plan has ${plan.tasks.length} tasks, minimum required is ${this.config.minTaskCount}`);
        }

        if (this.config.requireTests) {
            const testTasks = plan.tasks.filter(t => t.isTestTask);
            if (testTasks.length < 2) {
                issues.push('Plan should include at least 2 test tasks (unit and integration tests)');
            }
        }

        if (this.config.requireAccessibility) {
            const a11yTasks = plan.tasks.filter(t => t.description.toLowerCase().includes('accessibility'));
            if (a11yTasks.length === 0) {
                issues.push('Plan should include accessibility implementation tasks');
            }
        }

        if (this.config.requireDocumentation) {
            const docTasks = plan.tasks.filter(t => t.description.toLowerCase().includes('document'));
            if (docTasks.length < 2) {
                issues.push('Plan should include at least 2 documentation tasks');
            }
        }

        return {
            passed: issues.length === 0,
            issues,
        };
    }

    public gateGame(gameId: string, gameData: any): { passed: boolean; issues: string[] } {
        const fieldCheck = this.verifyRequiredFields(gameData);
        const assetCheck = this.verifyAssets(gameData);
        const plan = this.generateImplementationPlan(gameId, gameData);
        const planCheck = this.verifyImplementationPlan(plan);

        const allIssues = [
            ...fieldCheck.missing.map(f => `Missing required field: ${f}`),
            ...assetCheck.issues,
            ...planCheck.issues,
        ];

        return {
            passed: allIssues.length === 0,
            issues: allIssues,
        };
    }
}
