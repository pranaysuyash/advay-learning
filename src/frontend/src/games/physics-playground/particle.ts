import { Particle as ParticleInterface, ParticleType, ParticleProperties } from '../../features/physics-playground/types';

export const PARTICLE_CONFIGS: Record<ParticleType, ParticleProperties> = {
    [ParticleType.SAND]: {
        gravity: 0.5,
        friction: 0.9,
        restitution: 0.2,
        density: 1.5,
        specific: {
            color: '#e6c229',
            shape: 'circle',
            glow: false
        }
    },
    [ParticleType.WATER]: {
        gravity: 0.3,
        friction: 0.98,
        restitution: 0.5,
        density: 1.0,
        specific: {
            color: '#4da6ff',
            shape: 'circle',
            glow: false
        }
    },
    [ParticleType.FIRE]: {
        gravity: -0.2,
        friction: 0.95,
        restitution: 0.1,
        density: 0.5,
        specific: {
            color: '#ff6b35',
            shape: 'circle',
            glow: true
        }
    },
    [ParticleType.BUBBLE]: {
        gravity: -0.1,
        friction: 0.99,
        restitution: 0.8,
        density: 0.2,
        specific: {
            color: '#ffffff',
            shape: 'circle',
            glow: true
        }
    },
    [ParticleType.STAR]: {
        gravity: 0.3,
        friction: 0.98,
        restitution: 0.6,
        density: 0.8,
        specific: {
            color: '#ffd700',
            shape: 'star',
            glow: true
        }
    },
    [ParticleType.LEAF]: {
        gravity: 0.2,
        friction: 0.97,
        restitution: 0.4,
        density: 0.6,
        specific: {
            color: '#90ee90',
            shape: 'leaf',
            glow: false
        }
    },
    [ParticleType.GAS]: {
        gravity: -0.3,
        friction: 0.99,
        restitution: 0.9,
        density: 0.1,
        specific: {
            color: '#cccccc',
            shape: 'circle',
            glow: false
        }
    },
    [ParticleType.STEAM]: {
        gravity: -0.4,
        friction: 0.99,
        restitution: 0.95,
        density: 0.05,
        specific: {
            color: '#f0f0f0',
            shape: 'circle',
            glow: true
        }
    },
    [ParticleType.SEED]: {
        gravity: 0.4,
        friction: 0.9,
        restitution: 0.3,
        density: 0.7,
        specific: {
            color: '#8b4513',
            shape: 'circle',
            glow: false
        }
    },
    [ParticleType.PLANT]: {
        gravity: 0.0,
        friction: 0.95,
        restitution: 0.1,
        density: 0.5,
        specific: {
            color: '#228b22',
            shape: 'leaf',
            glow: false
        }
    }
};

/**
 * Particle class with base properties and update logic
 */
export class ParticleClass implements ParticleInterface {
    id: string;
    type: ParticleType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    life: number;
    maxLife: number;
    properties: ParticleProperties;
    rotation?: number;
    angularVelocity?: number;

    constructor(
        type: ParticleType,
        x: number,
        y: number,
        vx: number = 0,
        vy: number = 0
    ) {
        const config = PARTICLE_CONFIGS[type];

        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        // Map any required interface defaults that the old broken file missed
        this.radius = config.specific?.radius || 5;
        this.color = config.specific?.color || '#000';
        this.life = config.specific?.life || 100;
        this.maxLife = config.specific?.maxLife || 100;
        this.properties = { ...config };
        this.rotation = Math.random() * Math.PI * 2;
        this.angularVelocity = (Math.random() - 0.5) * 0.1;
    }

    /**
     * Update particle state based on physics simulation
     * @param deltaTime Time delta in frames
     * @returns Updated particle
     */
    update(deltaTime: number): ParticleClass {
        // Apply gravity to vertical velocity
        this.vy += this.properties.gravity * deltaTime;

        // Apply friction to horizontal velocity
        this.vx *= this.properties.friction;

        // Update position based on velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Update rotation for particles that rotate
        if (this.type === ParticleType.STAR || this.type === ParticleType.LEAF) {
            this.rotation = (this.rotation || 0) + (this.angularVelocity || 0) * deltaTime;
        }

        // Update life for particles that fade
        if (this.life !== undefined && this.maxLife !== undefined) {
            this.life = Math.max(0, this.life - deltaTime);
        }

        return this;
    }

    /**
     * Check if particle is still alive
     * @returns True if particle is alive, false otherwise
     */
    isAlive(): boolean {
        if (this.life !== undefined && this.life <= 0) {
            return false;
        }

        if (this.x < -this.radius || this.x > 1000 + this.radius ||
            this.y < -this.radius || this.y > 800 + this.radius) {
            return false;
        }

        return true;
    }

    /**
     * Get the remaining life percentage (0-1)
     */
    getLifePercentage(): number {
        if (this.life === undefined || this.maxLife === undefined || this.maxLife <= 0) {
            return 1;
        }
        return this.life / this.maxLife;
    }

    /**
     * Check if particle should be removed
     */
    shouldRemove(): boolean {
        return !this.isAlive();
    }
}
