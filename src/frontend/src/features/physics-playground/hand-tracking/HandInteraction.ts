import { HandTracker, Gesture } from './HandTracker';
import { Particle } from '../particles/Particle';
import { ParticleType } from '../types';
import { ParticleSystem } from '../particles/ParticleSystem';

/**
 * HandInteraction - Handles particle interaction through hand gestures
 * 
 * This class bridges hand tracking with particle system, allowing users
 * to spawn and manipulate particles using hand gestures.
 */
export class HandInteraction {
    private handTracker: HandTracker;
    private particleSystem: ParticleSystem;
    private lastGestureTime: Map<string, number> = new Map();
    private gestureCooldown: number = 100; // ms
    private spawnRate: number = 5; // particles per second
    private lastSpawnTime: number = 0;
    private currentParticleType: ParticleType = ParticleType.SAND;

    constructor(handTracker: HandTracker, particleSystem: ParticleSystem) {
        this.handTracker = handTracker;
        this.particleSystem = particleSystem;
    }

    /**
     * Set current particle type for spawning
     */
    setParticleType(type: ParticleType): void {
        this.currentParticleType = type;
    }

    /**
     * Get current particle type
     */
    getParticleType(): ParticleType {
        return this.currentParticleType;
    }

    /**
     * Process hand gestures and interact with particles
     */
    processGestures(): void {
        const gestures = this.handTracker.getGestures();
        const handPosition = this.handTracker.getHandPosition();

        if (!handPosition) {
            return;
        }

        for (const gesture of gestures) {
            this.handleGesture(gesture, handPosition);
        }

        // Handle continuous spawn for hold gesture
        this.handleContinuousSpawn(handPosition);
    }

    /**
     * Handle specific gesture
     */
    private handleGesture(gesture: Gesture, position: { x: number; y: number }): void {
        const now = Date.now();
        const lastTime = this.lastGestureTime.get(gesture.type) || 0;

        // Check cooldown
        if (now - lastTime < this.gestureCooldown) {
            return;
        }

        this.lastGestureTime.set(gesture.type, now);

        switch (gesture.type) {
            case 'tap':
                this.handleTap(position);
                break;
            case 'pinch':
                this.handlePinch(position);
                break;
            case 'swipe':
                this.handleSwipe(position, gesture.direction);
                break;
            case 'hold':
                // Handled by continuous spawn
                break;
        }
    }

    /**
     * Handle tap gesture
     */
    private handleTap(position: { x: number; y: number }): void {
        // Spawn a single particle at tap position
        this.spawnParticle(position.x, position.y);
    }

    /**
     * Handle pinch gesture
     */
    private handlePinch(position: { x: number; y: number }): void {
        // Spawn multiple particles in a small cluster
        this.spawnCluster(position.x, position.y, 5);
    }

    /**
     * Handle swipe gesture
     */
    private handleSwipe(position: { x: number; y: number }, direction?: 'left' | 'right' | 'up' | 'down'): void {
        // Apply force to particles in swipe direction
        if (direction) {
            this.applySwipeForce(position, direction);
        }

        // Spawn particles along swipe path
        this.spawnTrail(position.x, position.y, direction);
    }

    /**
     * Handle continuous spawn for hold gesture
     */
    private handleContinuousSpawn(position: { x: number; y: number }): void {
        const now = Date.now();

        // Spawn particles at regular intervals
        if (now - this.lastSpawnTime > 1000 / this.spawnRate) {
            this.spawnParticle(position.x, position.y);
            this.lastSpawnTime = now;
        }
    }

    /**
     * Spawn a single particle
     */
    private spawnParticle(x: number, y: number): void {
        const particle = Particle.create(this.currentParticleType, x, y);

        // Add some random velocity
        particle.vx = (Math.random() - 0.5) * 4;
        particle.vy = (Math.random() - 0.5) * 4;

        this.particleSystem.addParticle(particle);
    }

    /**
     * Spawn a cluster of particles
     */
    private spawnCluster(x: number, y: number, count: number): void {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            this.spawnParticle(x + offsetX, y + offsetY);
        }
    }

    /**
     * Spawn a trail of particles
     */
    private spawnTrail(x: number, y: number, direction?: 'left' | 'right' | 'up' | 'down'): void {
        const trailLength = 5;

        for (let i = 0; i < trailLength; i++) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;

            // Offset in swipe direction
            let trailX = x;
            let trailY = y;

            if (direction === 'left') trailX -= i * 10;
            if (direction === 'right') trailX += i * 10;
            if (direction === 'up') trailY -= i * 10;
            if (direction === 'down') trailY += i * 10;

            this.spawnParticle(trailX + offsetX, trailY + offsetY);
        }
    }

    /**
     * Apply force from swipe to particles
     */
    private applySwipeForce(position: { x: number; y: number }, direction: 'left' | 'right' | 'up' | 'down'): void {
        const particles = this.particleSystem.getParticles();
        const forceMagnitude = 2;

        for (const particle of particles) {
            // Check if particle is near swipe position
            const dx = particle.x - position.x;
            const dy = particle.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                // Apply force in swipe direction
                let forceX = 0;
                let forceY = 0;

                if (direction === 'left') forceX = -forceMagnitude;
                if (direction === 'right') forceX = forceMagnitude;
                if (direction === 'up') forceY = -forceMagnitude;
                if (direction === 'down') forceY = forceMagnitude;

                (particle as Particle).applyForce({ x: forceX, y: forceY });
            }
        }
    }

    /**
     * Get particle count from hand interaction
     */
    getSpawnedParticleCount(): number {
        // This would track particles spawned via hand interaction
        return 0; // Placeholder
    }

    /**
     * Reset gesture tracking
     */
    reset(): void {
        this.lastGestureTime.clear();
        this.lastSpawnTime = 0;
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.reset();
    }
}
