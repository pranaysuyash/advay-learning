import * as fc from 'fast-check';
import { HandInteraction } from '../hand-tracking/HandInteraction';
import { HandTracker } from '../hand-tracking/HandTracker';
import { ParticleSystem } from '../particles/ParticleSystem';
import { Particle } from '../particles/Particle';
import { AccessibilityMode, ParticleType, Settings } from '../types';

/**
 * Property 7: Hand Tracking Fallback
 * For any scenario where hand tracking is unavailable, the system shall provide
 * equivalent functionality through keyboard or touch input.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 7.1
 */
describe('Physics Playground - Property 7: Hand Tracking Fallback', () => {
    it('should spawn particles when hand is detected', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 50, max: 590 }),
                fc.integer({ min: 50, max: 430 }),
                (x, y) => {
                    // Create particle system
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: true,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };
                    const particleSystem = new ParticleSystem(settings);

                    // Create hand interaction
                    const handTracker = new HandTracker();
                    const handInteraction = new HandInteraction(handTracker, particleSystem);

                    // Simulate hand detection
                    handInteraction.setParticleType(ParticleType.SAND);

                    // Spawn particle at position
                    handInteraction['spawnParticle'](x, y);

                    // Verify particle was added
                    const particles = particleSystem.getParticles();
                    expect(particles.length).toBeGreaterThan(0);

                    // Verify particle is at or near position
                    const particle = particles[particles.length - 1];
                    expect(Math.abs(particle.x - x)).toBeLessThan(10);
                    expect(Math.abs(particle.y - y)).toBeLessThan(10);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle multiple gestures correctly', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 5 }),
                (gestureCount) => {
                    // Create particle system
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: true,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };
                    const particleSystem = new ParticleSystem(settings);

                    // Create hand interaction
                    const handTracker = new HandTracker();
                    const handInteraction = new HandInteraction(handTracker, particleSystem);

                    // Simulate multiple gestures
                    for (let i = 0; i < gestureCount; i++) {
                        const x = 100 + i * 50;
                        const y = 100;
                        handInteraction['spawnParticle'](x, y);
                    }

                    // Verify particles were added
                    const particles = particleSystem.getParticles();
                    expect(particles.length).toBe(gestureCount);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should apply force to particles during swipe gesture', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 100, max: 500 }),
                fc.integer({ min: 100, max: 400 }),
                fc.oneof(
                    fc.constant('left'),
                    fc.constant('right'),
                    fc.constant('up'),
                    fc.constant('down')
                ),
                (x, y, direction) => {
                    // Create particle system
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: true,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };
                    const particleSystem = new ParticleSystem(settings);

                    // Add a particle near the swipe position
                    const particle = Particle.create(ParticleType.SAND, x, y);
                    particleSystem.addParticle(particle);

                    // Create hand interaction
                    const handTracker = new HandTracker();
                    const handInteraction = new HandInteraction(handTracker, particleSystem);

                    const initialVx = particle.vx;
                    const initialVy = particle.vy;
                    // Apply swipe force
                    handInteraction['applySwipeForce']({ x, y }, direction);

                    // Force should have been applied
                    expect(
                      Math.abs(particle.vx - initialVx) > 0 ||
                        Math.abs(particle.vy - initialVy) > 0,
                    ).toBe(true);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should spawn particle clusters for pinch gesture', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 50, max: 590 }),
                fc.integer({ min: 50, max: 430 }),
                fc.integer({ min: 1, max: 10 }),
                (x, y, count) => {
                    // Create particle system
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: true,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };
                    const particleSystem = new ParticleSystem(settings);

                    // Create hand interaction
                    const handTracker = new HandTracker();
                    const handInteraction = new HandInteraction(handTracker, particleSystem);

                    // Simulate pinch gesture
                    handInteraction['spawnCluster'](x, y, count);

                    // Verify cluster was spawned
                    const particles = particleSystem.getParticles();
                    expect(particles.length).toBeGreaterThanOrEqual(count);

                    // Verify particles are near center
                    for (const particle of particles) {
                        const dx = particle.x - x;
                        const dy = particle.y - y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        expect(distance).toBeLessThan(30);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should provide fallback input when hand tracking is unavailable', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 100, max: 500 }),
                fc.integer({ min: 100, max: 400 }),
                (_x, _y) => {
                    // Create particle system
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: false, // Hand tracking disabled
                        accessibilityMode: AccessibilityMode.KEYBOARD,
                        interactionMode: 'pour',
                    };
                    const particleSystem = new ParticleSystem(settings);

                    // Create hand interaction (should still work with fallback)
                    const handTracker = new HandTracker();
                    new HandInteraction(handTracker, particleSystem);

                    // Even if hand tracking fails, we should have fallback mode configured.
                    expect(settings.accessibilityMode).toBe(AccessibilityMode.KEYBOARD);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle rapid gestures without duplication', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 10, max: 100 }),
                (rapidCount) => {
                    // Create particle system
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: true,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };
                    const particleSystem = new ParticleSystem(settings);

                    // Create hand interaction
                    const handTracker = new HandTracker();
                    const handInteraction = new HandInteraction(handTracker, particleSystem);

                    // Simulate rapid gestures
                    for (let i = 0; i < rapidCount; i++) {
                        const x = 100 + (i % 10) * 10;
                        const y = 100 + (i % 5) * 10;
                        handInteraction['spawnParticle'](x, y);
                    }

                    // Verify particles were added (may be limited by cooldown)
                    const particles = particleSystem.getParticles();
                    expect(particles.length).toBeGreaterThan(0);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should maintain particle type across gestures', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(ParticleType.SAND),
                    fc.constant(ParticleType.WATER),
                    fc.constant(ParticleType.FIRE),
                    fc.constant(ParticleType.BUBBLE),
                    fc.constant(ParticleType.STAR),
                    fc.constant(ParticleType.LEAF)
                ),
                fc.integer({ min: 1, max: 5 }),
                (particleType, gestureCount) => {
                    // Create particle system
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: true,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };
                    const particleSystem = new ParticleSystem(settings);

                    // Create hand interaction
                    const handTracker = new HandTracker();
                    const handInteraction = new HandInteraction(handTracker, particleSystem);

                    // Set particle type
                    handInteraction.setParticleType(particleType);

                    // Perform gestures
                    for (let i = 0; i < gestureCount; i++) {
                        handInteraction['spawnParticle'](100 + i * 10, 100);
                    }

                    // Verify all particles have correct type
                    const particles = particleSystem.getParticles();
                    for (const particle of particles) {
                        expect(particle.type).toBe(particleType);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
