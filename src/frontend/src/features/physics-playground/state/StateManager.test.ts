import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { StateManager } from './StateManager';
import { ParticleType, Particle, Settings, AccessibilityMode } from '../types';

describe('Physics Playground - Property 10: State Persistence', () => {
    const stateManager = new StateManager();

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    /**
     * Property 10: State Persistence
     * For any saved state, the system shall accurately restore all particle positions, types, properties, and settings when loaded.
     * Validates: Requirements 10.1-10.5
     */

    it('should save and restore particles with correct positions and types', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.tuple(
                        fc.integer({ min: 0, max: 800 }),
                        fc.integer({ min: 0, max: 600 }),
                        fc.oneof(
                            fc.constant(ParticleType.SAND),
                            fc.constant(ParticleType.WATER),
                            fc.constant(ParticleType.FIRE),
                            fc.constant(ParticleType.BUBBLE),
                            fc.constant(ParticleType.STAR),
                            fc.constant(ParticleType.LEAF)
                        )
                    )
                ),
                (particleData) => {
                    const particles: Particle[] = particleData.map(([x, y, type], index) => ({
                        id: `particle-${index}`,
                        type,
                        x,
                        y,
                        vx: 0,
                        vy: 0,
                        radius: 5,
                        color: '#ff0000',
                        life: 100,
                        maxLife: 100,
                        properties: {
                            gravity: 0.5,
                            friction: 0.8,
                            restitution: 0.3,
                            density: 1.0,
                            specific: {},
                        },
                    }));

                    const settings: Settings = {
                        particleCountLimit: 500,
                        audioEnabled: true,
                        handTrackingEnabled: true,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };

                    // Save the state
                    stateManager.save(particles, settings);

                    // Load the state
                    const loaded = stateManager.load();

                    // Verify all particles were restored correctly
                    expect(loaded).not.toBeNull();
                    expect(loaded?.particles).toHaveLength(particles.length);

                    for (let i = 0; i < particles.length; i++) {
                        expect(loaded?.particles[i].id).toBe(particles[i].id);
                        expect(loaded?.particles[i].type).toBe(particles[i].type);
                        expect(loaded?.particles[i].x).toBe(particles[i].x);
                        expect(loaded?.particles[i].y).toBe(particles[i].y);
                        expect(loaded?.particles[i].radius).toBe(particles[i].radius);
                    }

                    // Verify settings were restored
                    expect(loaded?.settings.particleCountLimit).toBe(settings.particleCountLimit);
                    expect(loaded?.settings.audioEnabled).toBe(settings.audioEnabled);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should save and restore settings correctly', () => {
        fc.assert(
            fc.property(
                fc.boolean(),
                fc.boolean(),
                fc.oneof(
                    fc.constant('none'),
                    fc.constant('keyboard'),
                    fc.constant('screen_reader'),
                    fc.constant('high_contrast'),
                    fc.constant('colorblind')
                ),
                fc.oneof(fc.constant('pour'), fc.constant('draw')),
                (audioEnabled, handTrackingEnabled, accessibilityMode, interactionMode) => {
                    const settings: Settings = {
                        particleCountLimit: 500,
                        audioEnabled,
                        handTrackingEnabled,
                        accessibilityMode: accessibilityMode as AccessibilityMode,
                        interactionMode: interactionMode as 'pour' | 'draw',
                    };

                    // Update settings
                    stateManager.updateSettings(settings);

                    // Verify settings were updated
                    const currentSettings = stateManager.getSettings();
                    expect(currentSettings.audioEnabled).toBe(audioEnabled);
                    expect(currentSettings.handTrackingEnabled).toBe(handTrackingEnabled);
                    expect(currentSettings.accessibilityMode).toBe(accessibilityMode);
                    expect(currentSettings.interactionMode).toBe(interactionMode);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle empty state correctly', () => {
        // Test with no saved state
        const loaded = stateManager.load();
        expect(loaded).toBeNull();

        // Test with empty particles array
        const settings: Settings = {
            particleCountLimit: 500,
            audioEnabled: true,
            handTrackingEnabled: true,
            accessibilityMode: AccessibilityMode.NONE,
            interactionMode: 'pour',
        };

        stateManager.save([], settings);
        const loadedAfterSave = stateManager.load();

        expect(loadedAfterSave).not.toBeNull();
        expect(loadedAfterSave?.particles).toHaveLength(0);
        expect(loadedAfterSave?.settings).toEqual(settings);
    });

    it('should handle corrupted localStorage data gracefully', () => {
        // Simulate corrupted data
        localStorage.setItem('physics-playground-state-v1', 'corrupted data');

        const loaded = stateManager.load();
        expect(loaded).toBeNull();

        // Should still be able to save after corruption
        const settings: Settings = {
            particleCountLimit: 500,
            audioEnabled: true,
            handTrackingEnabled: true,
            accessibilityMode: AccessibilityMode.NONE,
            interactionMode: 'pour',
        };

        stateManager.save([], settings);
        const loadedAfter = stateManager.load();
        expect(loadedAfter).not.toBeNull();
    });

    it('should persist settings updates to localStorage', () => {
        const initialSettings: Settings = {
            particleCountLimit: 500,
            audioEnabled: true,
            handTrackingEnabled: true,
            accessibilityMode: AccessibilityMode.NONE,
            interactionMode: 'pour',
        };

        // Save initial state
        stateManager.save([], initialSettings);

        // Update settings
        const updatedSettings: Settings = {
            ...initialSettings,
            audioEnabled: false,
            particleCountLimit: 300,
        };

        stateManager.updateSettings(updatedSettings);

        // Verify settings were persisted
        const raw = localStorage.getItem('physics-playground-state-v1');
        expect(raw).not.toBeNull();

        const parsed = JSON.parse(raw!);
        expect(parsed.settings.audioEnabled).toBe(false);
        expect(parsed.settings.particleCountLimit).toBe(300);
    });

    it('should record interactions and reset auto-save timer', () => {
        const stateManager = new StateManager();

        // Record initial interaction
        stateManager.recordInteraction();
        const firstInteractionTime = stateManager['lastInteractionTime'];

        // Wait a tiny bit and record another interaction
        vi.useFakeTimers();
        vi.advanceTimersByTime(100);
        stateManager.recordInteraction();
        vi.useRealTimers();

        const secondInteractionTime = stateManager['lastInteractionTime'];

        // Second interaction should be later
        expect(secondInteractionTime).toBeGreaterThan(firstInteractionTime);
    });

    it('should clear auto-save timer correctly', () => {
        const stateManager = new StateManager();

        stateManager.recordInteraction();
        expect(stateManager['autoSaveTimer']).not.toBeNull();

        stateManager.clearAutoSaveTimer();
        expect(stateManager['autoSaveTimer']).toBeNull();
    });
});
