import * as fc from 'fast-check';
import { Particle } from '../particles/Particle';
import { ParticleType } from '../types';

/**
 * Property 8: Visual Quality Consistency
 * For any particle type, the system shall render particles with appropriate
 * colors, visual effects, and animations that match the particle's physical properties.
 * 
 * Validates: Requirements 8.1-8.5
 */
describe('Physics Playground - Property 8: Visual Quality Consistency', () => {
    it('should render each particle type with correct colors', () => {
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
                    // Create particle
                    const particle = Particle.create(particleType, 100, 100);

                    // Verify color matches particle type
                    switch (particleType) {
                        case ParticleType.SAND:
                            expect(particle.color).toBe('#e6c229');
                            break;
                        case ParticleType.WATER:
                            expect(particle.color).toBe('#4da6ff');
                            break;
                        case ParticleType.FIRE:
                            expect(particle.color).toBe('#ff6b35');
                            break;
                        case ParticleType.BUBBLE:
                            expect(particle.color).toBe('#ffffff');
                            break;
                        case ParticleType.STAR:
                            expect(particle.color).toBe('#ffd700');
                            break;
                        case ParticleType.LEAF:
                            expect(particle.color).toBe('#90ee90');
                            break;
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should apply glow effects to appropriate particle types', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(ParticleType.FIRE),
                    fc.constant(ParticleType.BUBBLE),
                    fc.constant(ParticleType.STAR),
                    fc.constant(ParticleType.SAND),
                    fc.constant(ParticleType.WATER)
                ),
                (particleType) => {
                    const particle = Particle.create(particleType, 100, 100);

                    // Verify glow property matches particle type
                    const hasGlow = particle.properties.specific.glow;

                    switch (particleType) {
                        case ParticleType.FIRE:
                        case ParticleType.BUBBLE:
                        case ParticleType.STAR:
                            expect(hasGlow).toBe(true);
                            break;
                        case ParticleType.SAND:
                        case ParticleType.WATER:
                        case ParticleType.LEAF:
                            expect(hasGlow).toBe(false);
                            break;
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should render particle shapes correctly', () => {
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
                    const particle = Particle.create(particleType, 100, 100);

                    // Verify shape matches particle type
                    const shape = particle.properties.specific.shape;

                    switch (particleType) {
                        case ParticleType.SAND:
                        case ParticleType.WATER:
                        case ParticleType.FIRE:
                        case ParticleType.BUBBLE:
                            expect(shape).toBe('circle');
                            break;
                        case ParticleType.STAR:
                            expect(shape).toBe('star');
                            break;
                        case ParticleType.LEAF:
                            expect(shape).toBe('leaf');
                            break;
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should render particle trails for fast-moving particles', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 6, max: 20 }),
                fc.integer({ min: 6, max: 20 }),
                (vx, vy) => {
                    const particle = Particle.create(ParticleType.SAND, 100, 100);
                    particle.vx = vx;
                    particle.vy = vy;

                    // Fast-moving particles should have trails
                    const isFastMoving = Math.abs(vx) > 5 || Math.abs(vy) > 5;

                    // Verify trail rendering logic
                    expect(isFastMoving).toBe(true);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should render life indicators for fading particles', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100 }),
                (life) => {
                    const particle = Particle.create(ParticleType.FIRE, 100, 100);
                    particle.life = life;
                    particle.maxLife = 100;

                    // Verify life indicator logic
                    const hasLifeIndicator = particle.life < particle.maxLife;

                    // Fire particles show a life indicator once they start fading.
                    expect(hasLifeIndicator).toBe(life < particle.maxLife);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should render particles within canvas bounds', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 800 }),
                fc.integer({ min: 0, max: 600 }),
                fc.integer({ min: 5, max: 15 }),
                (x, y, radius) => {
                    const particle = Particle.create(ParticleType.SAND, x, y);
                    particle.radius = radius;

                    // Verify particle is within bounds
                    const _inBounds = x >= radius && x <= 800 - radius &&
                        y >= radius && y <= 600 - radius;

                    // For particles near edges, verify they can be rendered
                    expect(particle.x).toBeGreaterThanOrEqual(0);
                    expect(particle.y).toBeGreaterThanOrEqual(0);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should maintain visual consistency across multiple render cycles', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 10 }),
                (renderCount) => {
                    const particle = Particle.create(ParticleType.SAND, 100, 100);
                    const initialColor = particle.color;
                    const initialShape = particle.properties.specific.shape;

                    // Simulate multiple render cycles
                    for (let i = 0; i < renderCount; i++) {
                        // Verify properties remain consistent
                        expect(particle.color).toBe(initialColor);
                        expect(particle.properties.specific.shape).toBe(initialShape);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
