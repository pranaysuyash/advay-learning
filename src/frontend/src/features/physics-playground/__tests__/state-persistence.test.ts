// Property tests for State Persistence
// Validates: Requirements 10.1-10.5

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateManager } from '../state/StateManager';
import { ParticleType, Settings, AccessibilityMode } from '../types';

describe('State Persistence', () => {
    const stateManager = new StateManager();
    const _TEST_KEY = 'physics-playground-test-state';

    // Backup original localStorage
    const originalLocalStorage = window.localStorage;

    beforeEach(() => {
        // Mock localStorage for testing
        (window as any).localStorage = {
            store: {} as Record<string, string>,
            getItem(key: string): string | null {
                return this.store[key] || null;
            },
            setItem(key: string, value: string): void {
                this.store[key] = value;
            },
            removeItem(key: string): void {
                delete this.store[key];
            },
            clear(): void {
                this.store = {};
            },
        };
    });

    afterEach(() => {
        // Restore original localStorage
        window.localStorage = originalLocalStorage;
    });

    it('should save and restore particle configuration', () => {
        // Property: State persistence saves and restores particle configuration
        const particles = [
            {
                id: '1',
                type: ParticleType.SAND,
                x: 100,
                y: 200,
                vx: 0,
                vy: 0,
                radius: 10,
                color: '#e6c229',
                life: 100,
                maxLife: 100,
                properties: {
                    gravity: 0.5,
                    friction: 0.9,
                    restitution: 0.2,
                    density: 1.5,
                    specific: { color: '#e6c229', shape: 'circle', glow: false },
                },
            },
        ];

        const settings: Settings = {
            particleCountLimit: 500,
            audioEnabled: true,
            handTrackingEnabled: true,
            accessibilityMode: AccessibilityMode.NONE,
            interactionMode: 'pour',
        };

        stateManager.save(particles, settings);

        const restored = stateManager.load();
        expect(restored).not.toBeNull();
        expect(restored?.particles).toHaveLength(1);
        expect(restored?.particles[0].id).toBe('1');
        expect(restored?.particles[0].type).toBe(ParticleType.SAND);
        expect(restored?.settings.audioEnabled).toBe(true);
    });

    it('should handle empty particle list', () => {
        // Property: State persistence handles empty particle list
        const particles: any[] = [];
        const settings: Settings = {
            particleCountLimit: 500,
            audioEnabled: true,
            handTrackingEnabled: true,
            accessibilityMode: AccessibilityMode.NONE,
            interactionMode: 'pour',
        };

        stateManager.save(particles, settings);

        const restored = stateManager.load();
        expect(restored).not.toBeNull();
        expect(restored?.particles).toHaveLength(0);
    });

    it('should return null for invalid saved state', () => {
        // Property: State persistence handles invalid data gracefully
        (window as any).localStorage.setItem('physics-playground-test-state', 'invalid json');

        const restored = stateManager.load();
        expect(restored).toBeNull();
    });

    it('should return null for missing saved state', () => {
        // Property: State persistence handles missing data gracefully
        (window as any).localStorage.removeItem('physics-playground-test-state');

        const restored = stateManager.load();
        expect(restored).toBeNull();
    });

    it('should restore all particle properties', () => {
        // Property: State persistence restores all particle properties
        const particles = [
            {
                id: '1',
                type: ParticleType.WATER,
                x: 150,
                y: 250,
                vx: 5,
                vy: 3,
                radius: 15,
                color: '#4da6ff',
                life: 80,
                maxLife: 100,
                properties: {
                    gravity: 0.3,
                    friction: 0.98,
                    restitution: 0.5,
                    density: 1.0,
                    specific: { color: '#4da6ff', shape: 'circle', glow: false },
                },
            },
        ];

        const settings: Settings = {
            particleCountLimit: 500,
            audioEnabled: false,
            handTrackingEnabled: true,
            accessibilityMode: AccessibilityMode.HIGH_CONTRAST,
            interactionMode: 'draw',
        };

        stateManager.save(particles, settings);

        const restored = stateManager.load();
        expect(restored).not.toBeNull();
        expect(restored?.particles[0].x).toBe(150);
        expect(restored?.particles[0].y).toBe(250);
        expect(restored?.particles[0].vx).toBe(5);
        expect(restored?.particles[0].vy).toBe(3);
        expect(restored?.settings.interactionMode).toBe('draw');
        expect(restored?.settings.accessibilityMode).toBe(AccessibilityMode.HIGH_CONTRAST);
    });

    it('should record user interactions', () => {
        // Property: State persistence records user interactions
        stateManager.recordInteraction();
        expect(stateManager.shouldAutoSave()).toBe(false);
    });

    it('should clear auto-save timer', () => {
        // Property: State persistence clears auto-save timer
        stateManager.clearAutoSaveTimer();
        expect(stateManager['autoSaveTimer']).toBeNull();
    });
});
