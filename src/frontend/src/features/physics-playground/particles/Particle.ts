import { Particle as ParticleInterface, ParticleType, ParticleProperties, Vector2 } from '../types';

// Re-export ParticleType for convenience
export { ParticleType } from '../types';

// Default properties for each particle type
const particleTypeConfigs: Record<ParticleType, ParticleProperties> = {
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
        gravity: -0.8, // Floats up quickly
        friction: 0.9,
        restitution: 0.1,
        density: 0.1,
        specific: {
            color: '#c2b280',
            shape: 'circle',
            glow: false
        }
    },
    [ParticleType.STEAM]: {
        gravity: -0.5, // Floats up
        friction: 0.9,
        restitution: 0.1,
        density: 0.2,
        specific: {
            color: '#d0d0d0',
            shape: 'circle',
            glow: false
        }
    },
    [ParticleType.SEED]: {
        gravity: 0.4,
        friction: 0.9,
        restitution: 0.2,
        density: 1.5,
        specific: {
            color: '#8B4513',
            shape: 'circle',
            glow: false
        }
    },
    [ParticleType.PLANT]: {
        gravity: 0, // Static/anchored initially
        friction: 1.0,
        restitution: 0.1,
        density: 2.0,
        specific: {
            color: '#228B22',
            shape: 'leaf',
            glow: false
        }
    }
};

// Object pool for particles to reduce garbage collection
class ParticlePool {
    private pool: Particle[] = [];
    private maxSize: number = 500;

    constructor(maxSize: number = 500) {
        this.maxSize = maxSize;
    }

    get(type: ParticleType, x: number, y: number): Particle {
        if (this.pool.length > 0) {
            const particle = this.pool.pop()!;
            particle.resetPosition(x, y);
            particle.type = type;
            return particle;
        }
        return Particle.create(type, x, y);
    }

    release(particle: Particle): void {
        if (this.pool.length < this.maxSize) {
            this.pool.push(particle);
        }
    }

    clear(): void {
        this.pool = [];
    }
}

export class Particle implements ParticleInterface {
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

    constructor(type: ParticleType, x: number, y: number, properties?: Partial<ParticleProperties>) {
        this.id = `particle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 5 + Math.random() * 5;
        this.life = 100;
        this.maxLife = 100;

        // Get base properties for this particle type
        const baseProperties = particleTypeConfigs[type];

        // Merge with any custom properties
        this.properties = {
            ...baseProperties,
            ...properties
        };

        // Update color from properties
        this.color = this.properties.specific.color || baseProperties.specific.color;
    }

    update(): void {
        // Apply gravity
        this.vy += this.properties.gravity;

        // Apply friction
        this.vx *= this.properties.friction;
        this.vy *= this.properties.friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Update life for particles that fade
        if (this.type === ParticleType.FIRE || this.type === ParticleType.BUBBLE) {
            this.life -= 1;
        }
    }

    isDead(): boolean {
        return this.life <= 0;
    }

    resetPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = this.maxLife;
    }

    applyForce(force: Vector2): void {
        this.vx += force.x / this.properties.density;
        this.vy += force.y / this.properties.density;
    }

    static create(type: ParticleType, x: number, y: number, properties?: Partial<ParticleProperties>): Particle {
        return new Particle(type, x, y, properties);
    }

    static createRandom(type: ParticleType, bounds: { x: number; y: number; width: number; height: number }): Particle {
        const x = bounds.x + Math.random() * bounds.width;
        const y = bounds.y + Math.random() * bounds.height;
        return new Particle(type, x, y);
    }
}

// Export the pool for use in ParticleSystem
export const particlePool = new ParticlePool(500);
