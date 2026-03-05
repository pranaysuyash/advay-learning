import { Particle } from '../particles/Particle';
import { PhysicsWorld } from './PhysicsWorld';

/**
 * BoundaryHandler - Handles particle boundary collisions and constraints
 * 
 * This class manages boundary constraints for the physics world, implementing
 * bounce and friction effects when particles hit the edges of the canvas.
 */
export class BoundaryHandler {
    private physicsWorld: PhysicsWorld;
    private width: number;
    private height: number;
    private boundaryCallbacks: Map<string, (particle: Particle, boundary: string) => void> = new Map();

    constructor(physicsWorld: PhysicsWorld, width: number, height: number) {
        this.physicsWorld = physicsWorld;
        this.width = width;
        this.height = height;

        // Add physical boundaries to Matter.js world
        this.addBoundaries();
    }

    /**
     * Add physical boundaries to the physics world
     */
    private addBoundaries(): void {
        this.physicsWorld.addBoundaries(this.width, this.height);
    }

    /**
     * Check if particle is at boundary
     */
    checkBoundary(particle: Particle): string | null {
        const radius = particle.radius;

        // Check bottom boundary
        if (particle.y + radius > this.height) {
            return 'bottom';
        }

        // Check top boundary
        if (particle.y - radius < 0) {
            return 'top';
        }

        // Check right boundary
        if (particle.x + radius > this.width) {
            return 'right';
        }

        // Check left boundary
        if (particle.x - radius < 0) {
            return 'left';
        }

        return null;
    }

    /**
     * Handle boundary collision for particle
     */
    handleBoundaryCollision(particle: Particle, boundary: string): void {
        const restitution = particle.properties.restitution;
        const friction = particle.properties.friction;

        switch (boundary) {
            case 'bottom':
                // Bounce off bottom
                particle.vy = -Math.abs(particle.vy) * restitution;

                // Apply friction on bottom boundary
                particle.vx *= friction;

                // Position correction
                particle.y = this.height - particle.radius;

                // Call callback if registered
                this.callCallback(particle, 'bottom');
                break;

            case 'top':
                // Bounce off top
                particle.vy = -Math.abs(particle.vy) * restitution;

                // Position correction
                particle.y = particle.radius;
                break;

            case 'right':
                // Bounce off right
                particle.vx = -Math.abs(particle.vx) * restitution;

                // Position correction
                particle.x = this.width - particle.radius;
                break;

            case 'left':
                // Bounce off left
                particle.vx = -Math.abs(particle.vx) * restitution;

                // Position correction
                particle.x = particle.radius;
                break;
        }
    }

    /**
     * Get boundary position for particle
     */
    getBoundaryPosition(particle: Particle, boundary: string): number {
        const radius = particle.radius;

        switch (boundary) {
            case 'bottom':
                return this.height - radius;
            case 'top':
                return radius;
            case 'right':
                return this.width - radius;
            case 'left':
                return radius;
            default:
                return particle.x;
        }
    }

    /**
     * Register boundary collision callback
     */
    onBoundaryCollision(
        callback: (particle: Particle, boundary: string) => void
    ): void {
        this.boundaryCallbacks.set('default', callback);
    }

    /**
     * Call registered callback
     */
    private callCallback(particle: Particle, boundary: string): void {
        const callback = this.boundaryCallbacks.get('default');
        if (callback) {
            callback(particle, boundary);
        }
    }

    /**
     * Check and handle all particles for boundary collisions
     */
    checkAllParticles(particles: Particle[]): void {
        for (const particle of particles) {
            const boundary = this.checkBoundary(particle);
            if (boundary) {
                this.handleBoundaryCollision(particle, boundary);
            }
        }
    }

    /**
     * Get boundary dimensions
     */
    getDimensions(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    /**
     * Update boundary dimensions
     */
    updateDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.addBoundaries();
    }
}
