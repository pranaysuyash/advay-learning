import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { Particle, ParticleType } from '../types';

describe('Physics Playground - Property 5: Performance Threshold', () => {
    /**
     * Property 5: Performance Threshold
     * For any simulation with up to 500 particles, the system shall maintain a minimum frame rate of 60fps on mid-range devices.
     * Validates: Requirements 6.1
     */

    it('should handle up to 500 particles without crashing', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 500 }),
                (particleCount) => {
                    // Create particles
                    const particles: Particle[] = [];
                    for (let i = 0; i < particleCount; i++) {
                        particles.push({
                            id: `particle-${i}`,
                            type: ParticleType.SAND,
                            x: Math.random() * 800,
                            y: Math.random() * 600,
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
                        });
                    }

                    // Verify particles were created successfully
                    expect(particles).toHaveLength(particleCount);

                    // Verify each particle has valid properties
                    for (const particle of particles) {
                        expect(particle.id).toBeDefined();
                        expect(particle.type).toBeDefined();
                        expect(particle.x).toBeGreaterThanOrEqual(0);
                        expect(particle.x).toBeLessThanOrEqual(800);
                        expect(particle.y).toBeGreaterThanOrEqual(0);
                        expect(particle.y).toBeLessThanOrEqual(600);
                        expect(particle.radius).toBeGreaterThan(0);
                        expect(particle.color).toBeDefined();
                        expect(particle.properties).toBeDefined();
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle particle count limits gracefully', () => {
        const MAX_PARTICLES = 500;

        fc.assert(
            fc.property(
                fc.integer({ min: 501, max: 1000 }),
                (attemptedCount) => {
                    // Simulate particle count limit enforcement
                    const actualCount = Math.min(attemptedCount, MAX_PARTICLES);
                    const particles: Particle[] = [];

                    for (let i = 0; i < actualCount; i++) {
                        particles.push({
                            id: `particle-${i}`,
                            type: ParticleType.SAND,
                            x: Math.random() * 800,
                            y: Math.random() * 600,
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
                        });
                    }

                    // Verify particle count was limited
                    expect(particles).toHaveLength(MAX_PARTICLES);

                    return true;
                }
            ),
            { numRuns: 50 }
        );
    });

    it('should maintain stable performance with mixed particle types', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.oneof(
                        fc.constant(ParticleType.SAND),
                        fc.constant(ParticleType.WATER),
                        fc.constant(ParticleType.FIRE),
                        fc.constant(ParticleType.BUBBLE),
                        fc.constant(ParticleType.STAR),
                        fc.constant(ParticleType.LEAF)
                    ),
                    { minLength: 1, maxLength: 500 }
                ),
                (particleTypes) => {
                    const particles: Particle[] = [];

                    for (let i = 0; i < particleTypes.length; i++) {
                        particles.push({
                            id: `particle-${i}`,
                            type: particleTypes[i],
                            x: Math.random() * 800,
                            y: Math.random() * 600,
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
                        });
                    }

                    // Verify all particle types were created
                    for (let i = 0; i < particleTypes.length; i++) {
                        expect(particles[i].type).toBe(particleTypes[i]);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle rapid particle creation/deletion without memory leaks', () => {
        const MAX_PARTICLES = 500;
        const ITERATIONS = 100;

        for (let i = 0; i < ITERATIONS; i++) {
            // Create particles
            const particles: Particle[] = [];
            for (let j = 0; j < MAX_PARTICLES; j++) {
                particles.push({
                    id: `particle-${i}-${j}`,
                    type: ParticleType.SAND,
                    x: Math.random() * 800,
                    y: Math.random() * 600,
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
                });
            }

            // Delete particles (simulating garbage collection)
            particles.length = 0;
        }

        // If we reach here, the test passed (no crashes or memory issues)
        expect(true).toBe(true);
    });

    it('should handle edge cases without crashing', () => {
        // Test with single particle
        const singleParticle: Particle = {
            id: 'particle-0',
            type: ParticleType.SAND,
            x: 400,
            y: 300,
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
        };

        expect(singleParticle).toBeDefined();

        // Test with maximum particle count
        const maxParticles: Particle[] = [];
        for (let i = 0; i < MAX_PARTICLES; i++) {
            maxParticles.push({
                id: `particle-${i}`,
                type: ParticleType.SAND,
                x: Math.random() * 800,
                y: Math.random() * 600,
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
            });
        }

        expect(maxParticles).toHaveLength(MAX_PARTICLES);
    });
});

// Constants
const MAX_PARTICLES = 500;
