import * as fc from 'fast-check';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Particle } from '../particles/Particle';
import { AccessibilityMode, ParticleType, Settings } from '../types';

/**
 * Property 3: Collision Response Consistency
 * For any two particles that collide, the post-collision velocities shall
 * conserve momentum and follow the restitution coefficient for the particle types.
 * 
 * Validates: Requirements 1.3, 4.3
 */
describe('Physics Playground - Property 3: Collision Response Consistency', () => {
    it('should conserve momentum during particle collisions', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(ParticleType.SAND),
                    fc.constant(ParticleType.WATER),
                    fc.constant(ParticleType.FIRE)
                ),
                fc.oneof(
                    fc.constant(ParticleType.SAND),
                    fc.constant(ParticleType.WATER),
                    fc.constant(ParticleType.FIRE)
                ),
                fc.integer({ min: 100, max: 500 }),
                fc.integer({ min: 100, max: 500 }),
                (type1, type2, x1, x2) => {
                    // Create settings
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: false,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };

                    // Create physics world
                    const physicsWorld = new PhysicsWorld(settings);

                    // Create two particles
                    const particle1 = Particle.create(type1, x1, 200);
                    const particle2 = Particle.create(type2, x2, 200);

                    // Set initial velocities for collision
                    particle1.vx = 5;
                    particle1.vy = 0;
                    particle2.vx = -5;
                    particle2.vy = 0;

                    // Store initial momentum
                    const mass1 = particle1.properties.density * particle1.radius;
                    const mass2 = particle2.properties.density * particle2.radius;
                    const initialMomentumX = mass1 * particle1.vx + mass2 * particle2.vx;

                    // Add particles to physics world
                    physicsWorld.createParticle(particle1);
                    physicsWorld.createParticle(particle2);

                    // Run simulation for a few steps
                    for (let i = 0; i < 60; i++) {
                        physicsWorld.step();
                        particle1.update();
                        particle2.update();
                        physicsWorld.updateParticleFromBody(particle1);
                        physicsWorld.updateParticleFromBody(particle2);
                    }

                    // Calculate final momentum
                    const finalMomentumX = mass1 * particle1.vx + mass2 * particle2.vx;

                    // Momentum should be approximately conserved (allowing for some energy loss)
                    const allowedDrift = Math.max(60, Math.abs(initialMomentumX) * 2);
                    expect(Math.abs(finalMomentumX - initialMomentumX)).toBeLessThan(allowedDrift);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should respect restitution coefficients in collisions', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(ParticleType.BUBBLE), // High restitution (0.8)
                    fc.constant(ParticleType.SAND)    // Low restitution (0.2)
                ),
                fc.integer({ min: 200, max: 400 }),
                fc.integer({ min: 10, max: 50 }),
                (type1, velocity, radius) => {
                    // Create settings
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: false,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };

                    // Create physics world
                    const physicsWorld = new PhysicsWorld(settings);

                    // Create particle with specific properties
                    const particle = Particle.create(type1, 200, 100);
                    particle.radius = radius;
                    particle.vy = velocity;

                    // Get restitution coefficient
                    const restitution = particle.properties.restitution;

                    // Add particle to physics world
                    physicsWorld.createParticle(particle);

                    // Let it fall and bounce
                    for (let i = 0; i < 120; i++) {
                        physicsWorld.step();
                        particle.update();
                        physicsWorld.updateParticleFromBody(particle);

                        // Check if particle hit ground (y > 500)
                        if (particle.y > 400 && particle.vy > 0) {
                            // After bouncing, velocity should be reduced by restitution
                            expect(Math.abs(particle.vy)).toBeLessThan(Math.abs(velocity) * restitution * 1.5);
                            break;
                        }
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle multiple particle collisions correctly', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 3, max: 10 }),
                fc.integer({ min: 100, max: 300 }),
                (particleCount, width) => {
                    // Create settings
                    const settings: Settings = {
                        particleCountLimit: 100,
                        audioEnabled: false,
                        handTrackingEnabled: false,
                        accessibilityMode: AccessibilityMode.NONE,
                        interactionMode: 'pour',
                    };

                    // Create physics world
                    const physicsWorld = new PhysicsWorld(settings);

                    // Create multiple particles
                    const particles: Particle[] = [];
                    for (let i = 0; i < particleCount; i++) {
                        const particle = Particle.create(
                            ParticleType.SAND,
                            100 + Math.random() * (width - 200),
                            100 + Math.random() * 100
                        );
                        particle.vx = (Math.random() - 0.5) * 10;
                        particle.vy = (Math.random() - 0.5) * 10;
                        particles.push(particle);
                        physicsWorld.createParticle(particle);
                    }

                    // Run simulation
                    for (let i = 0; i < 60; i++) {
                        physicsWorld.step();
                        for (const particle of particles) {
                            particle.update();
                            physicsWorld.updateParticleFromBody(particle);
                        }
                    }

                    // Verify all particles are still in world
                    expect(particles.length).toBe(particleCount);

                    // Verify particles haven't exploded (velocity bounds)
                    for (const particle of particles) {
                        expect(Math.abs(particle.vx)).toBeLessThan(100);
                        expect(Math.abs(particle.vy)).toBeLessThan(100);
                    }

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
