import * as Matter from 'matter-js';
import { Particle } from '../particles/Particle';
import { ParticleType } from '../types';
import { PhysicsWorld } from './PhysicsWorld';
import { Vector2 } from '../types';

/**
 * CollisionHandler - Handles particle collisions and responses
 * 
 * This class provides collision detection and response logic for the physics
 * playground, applying appropriate behaviors based on particle types.
 */
export class CollisionHandler {
    private physicsWorld: PhysicsWorld;
    private collisionCallbacks: Map<string, (particle1: Particle, particle2: Particle) => void> = new Map();

    constructor(physicsWorld: PhysicsWorld) {
        this.physicsWorld = physicsWorld;

        // Set up collision events
        this.setupCollisionEvents();
    }

    /**
     * Set up collision event listeners
     */
    private setupCollisionEvents(): void {
        this.physicsWorld.onCollision((event: Matter.IEventCollision<Matter.Engine>) => {
            const pairs = event.pairs;

            for (const pair of pairs) {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                // Find particles associated with bodies
                const particleA = this.findParticleByBody(bodyA);
                const particleB = this.findParticleByBody(bodyB);

                if (particleA && particleB) {
                    // Apply collision response
                    this.handleCollision(particleA, particleB);

                    // Call registered callbacks
                    const callbackKey = `${particleA.type}-${particleB.type}`;
                    const callback = this.collisionCallbacks.get(callbackKey);
                    if (callback) {
                        callback(particleA, particleB);
                    }
                }
            }
        });
    }

    /**
     * Find particle by Matter.js body
     */
    private findParticleByBody(body: Matter.Body): Particle | null {
        return this.physicsWorld.findParticleByBody(body);
    }

    /**
     * Handle collision between two particles
     */
    private handleCollision(particle1: Particle, particle2: Particle): void {
        // Calculate collision response based on particle types
        const restitution = this.getEffectiveRestitution(particle1, particle2);

        // Apply impulse to separate particles
        const impulse = this.calculateImpulse(particle1, particle2, restitution);

        // Apply impulse to both particles
        this.applyImpulse(particle1, impulse);
        this.applyImpulse(particle2, { x: -impulse.x, y: -impulse.y });
    }

    /**
     * Calculate effective restitution for particle pair
     */
    private getEffectiveRestitution(particle1: Particle, particle2: Particle): number {
        // Use the higher restitution value of the two particles
        return Math.max(
            particle1.properties.restitution,
            particle2.properties.restitution
        );
    }

    /**
     * Calculate collision impulse
     */
    private calculateImpulse(
        particle1: Particle,
        particle2: Particle,
        restitution: number
    ): Vector2 {
        // Calculate relative velocity
        const relativeVelocity = {
            x: particle1.vx - particle2.vx,
            y: particle1.vy - particle2.vy
        };

        // Calculate normal vector (from particle2 to particle1)
        const normal = {
            x: particle1.x - particle2.x,
            y: particle1.y - particle2.y
        };

        // Normalize normal
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        if (length === 0) {
            return { x: 0, y: 0 };
        }
        normal.x /= length;
        normal.y /= length;

        // Calculate relative velocity along normal
        const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

        // Do not resolve if velocities are separating
        if (velocityAlongNormal > 0) {
            return { x: 0, y: 0 };
        }

        // Calculate impulse scalar
        const mass1 = particle1.properties.density * particle1.radius;
        const mass2 = particle2.properties.density * particle2.radius;
        const impulseScalar = -(1 + restitution) * velocityAlongNormal;
        const impulseMagnitude = impulseScalar / (1 / mass1 + 1 / mass2);

        // Apply impulse along normal
        return {
            x: impulseMagnitude * normal.x,
            y: impulseMagnitude * normal.y
        };
    }

    /**
     * Apply impulse to particle
     */
    private applyImpulse(particle: Particle, impulse: Vector2): void {
        const mass = particle.properties.density * particle.radius;
        particle.vx += impulse.x / mass;
        particle.vy += impulse.y / mass;
    }

    /**
     * Register collision callback
     */
    onCollision(
        type1: ParticleType,
        type2: ParticleType,
        callback: (particle1: Particle, particle2: Particle) => void
    ): void {
        const key = `${type1}-${type2}`;
        this.collisionCallbacks.set(key, callback);
    }

    /**
     * Handle particle-boundary collisions
     */
    handleBoundaryCollision(particle: Particle, boundary: 'top' | 'bottom' | 'left' | 'right'): void {
        const restitution = particle.properties.restitution;

        switch (boundary) {
            case 'top':
                particle.vy = Math.abs(particle.vy) * restitution;
                particle.y = particle.radius;
                break;
            case 'bottom':
                particle.vy = -Math.abs(particle.vy) * restitution;
                particle.y = 600 - particle.radius;
                break;
            case 'left':
                particle.vx = Math.abs(particle.vx) * restitution;
                particle.x = particle.radius;
                break;
            case 'right':
                particle.vx = -Math.abs(particle.vx) * restitution;
                particle.x = 800 - particle.radius;
                break;
        }
    }

    /**
     * Apply friction to particles
     */
    applyFriction(particle: Particle): void {
        particle.vx *= particle.properties.friction;
        particle.vy *= particle.properties.friction;
    }

    /**
     * Apply gravity to particles
     */
    applyGravity(particle: Particle): void {
        particle.vy += particle.properties.gravity;
    }

    /**
     * Check if particles are overlapping
     */
    areOverlapping(particle1: Particle, particle2: Particle): boolean {
        const dx = particle1.x - particle2.x;
        const dy = particle1.y - particle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < particle1.radius + particle2.radius;
    }

    /**
     * Separate overlapping particles
     */
    separateParticles(particle1: Particle, particle2: Particle): void {
        const dx = particle1.x - particle2.x;
        const dy = particle1.y - particle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            return;
        }

        const overlap = particle1.radius + particle2.radius - distance;
        const separation = {
            x: (dx / distance) * overlap * 0.5,
            y: (dy / distance) * overlap * 0.5
        };

        particle1.x += separation.x;
        particle1.y += separation.y;
        particle2.x -= separation.x;
        particle2.y -= separation.y;
    }
}
