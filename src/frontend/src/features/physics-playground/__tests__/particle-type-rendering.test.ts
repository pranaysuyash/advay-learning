import * as fc from 'fast-check';
import { Particle } from '../particles/Particle';
import { ParticleType } from '../types';

/**
 * Property 1: Particle Type Rendering
 * For any particle type, when that type is selected, the system shall render and simulate
 * particles with the correct physical properties for that type.
 * 
 * Validates: Requirements 1.1, 2.1-2.7
 */
describe('Physics Playground - Property 1: Particle Type Rendering', () => {
    it('should render and simulate particles with correct properties for each type', () => {
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
                (particleType) => {
                    // Create a particle of the selected type
                    const particle = Particle.create(particleType, 100, 100);

                    // Verify particle type is correct
                    expect(particle.type).toBe(particleType);

                    // Verify particle has valid properties
                    expect(particle.properties).toBeDefined();
                    expect(particle.properties.gravity).toBeDefined();
                    expect(particle.properties.friction).toBeDefined();
                    expect(particle.properties.restitution).toBeDefined();
                    expect(particle.properties.density).toBeDefined();

                    // Verify particle has valid initial state
                    expect(particle.x).toBe(100);
                    expect(particle.y).toBe(100);
                    expect(particle.radius).toBeGreaterThan(0);
                    expect(particle.radius).toBeLessThan(20);
                    expect(particle.color).toBeDefined();
                    expect(particle.life).toBeGreaterThan(0);

                    // Verify specific properties for each particle type
                    switch (particleType) {
                        case ParticleType.SAND:
                            expect(particle.properties.gravity).toBeCloseTo(0.5);
                            expect(particle.properties.friction).toBeCloseTo(0.9);
                            expect(particle.properties.specific.color).toBe('#e6c229');
                            break;
                        case ParticleType.WATER:
                            expect(particle.properties.gravity).toBeCloseTo(0.3);
                            expect(particle.properties.friction).toBeCloseTo(0.98);
                            expect(particle.properties.specific.color).toBe('#4da6ff');
                            break;
                        case ParticleType.FIRE:
                            expect(particle.properties.gravity).toBeLessThan(0); // Fire rises
                            expect(particle.properties.friction).toBeCloseTo(0.95);
                            expect(particle.properties.specific.color).toBe('#ff6b35');
                            expect(particle.properties.specific.glow).toBe(true);
                            break;
                        case ParticleType.BUBBLE:
                            expect(particle.properties.gravity).toBeLessThan(0); // Bubbles float up
                            expect(particle.properties.friction).toBeCloseTo(0.99);
                            expect(particle.properties.specific.color).toBe('#ffffff');
                            expect(particle.properties.specific.glow).toBe(true);
                            break;
                        case ParticleType.STAR:
                            expect(particle.properties.gravity).toBeCloseTo(0.3);
                            expect(particle.properties.friction).toBeCloseTo(0.98);
                            expect(particle.properties.specific.color).toBe('#ffd700');
                            expect(particle.properties.specific.glow).toBe(true);
                            break;
                        case ParticleType.LEAF:
                            expect(particle.properties.gravity).toBeCloseTo(0.2);
                            expect(particle.properties.friction).toBeCloseTo(0.97);
                            expect(particle.properties.specific.color).toBe('#90ee90');
                            break;
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should update particle position based on physics properties', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(ParticleType.SAND),
                    fc.constant(ParticleType.WATER),
                    fc.constant(ParticleType.FIRE)
                ),
                fc.integer({ min: 1, max: 10 }),
                (particleType, numUpdates) => {
                    const particle = Particle.create(particleType, 100, 100);
                    const initialVy = particle.vy;

                    // Update particle multiple times
                    for (let i = 0; i < numUpdates; i++) {
                        particle.update();
                    }

                    // Verify particle moved
                    expect(particle.x).not.toBe(100);
                    expect(particle.y).not.toBe(100);

                    // Verify velocity changed based on gravity
                    if (particleType === ParticleType.FIRE) {
                        // Fire should have negative gravity (rises)
                        expect(particle.vy).toBeLessThan(initialVy);
                    } else {
                        // Sand and water should have positive gravity (falls)
                        expect(particle.vy).toBeGreaterThan(initialVy);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle particle life cycle correctly', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(ParticleType.FIRE),
                    fc.constant(ParticleType.BUBBLE)
                ),
                (particleType) => {
                    const particle = Particle.create(particleType, 100, 100);
                    const _initialLife = particle.life;

                    // Update particle until it dies
                    while (!particle.isDead()) {
                        particle.update();
                    }

                    // Verify particle is dead
                    expect(particle.isDead()).toBe(true);
                    expect(particle.life).toBeLessThanOrEqual(0);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
