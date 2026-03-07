import { Particle, particlePool } from './Particle';
import { Particle as ParticleShape, ParticleType, Vector2, Settings } from '../types';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { CollisionHandler } from '../physics/CollisionHandler';
import { AudioSystem } from '../audio/AudioSystem';

export class ParticleSystem {
    private particles: Particle[] = [];
    private physicsWorld: PhysicsWorld;
    private collisionHandler: CollisionHandler;
    private maxParticles: number;
    private audioSystem: AudioSystem | null = null;

    constructor(settings: Settings) {
        this.maxParticles = settings.particleCountLimit;
        this.physicsWorld = new PhysicsWorld(settings);

        // Setup collision handler
        this.collisionHandler = new CollisionHandler(this.physicsWorld);

        // Ensure boundaries are set (assuming default canvas size for now, will be updated)
        this.physicsWorld.addBoundaries(960, 540);

        // Start engine
        this.physicsWorld.start();

        this.setupElementalReactions();
    }

    /**
     * Set audio system for sound effects
     */
    setAudioSystem(audioSystem: AudioSystem): void {
        this.audioSystem = audioSystem;
    }

    private setupElementalReactions() {
        // Bi-directional registration helper
        const registerReaction = (typeA: ParticleType, typeB: ParticleType, effect: (pA: Particle, pB: Particle) => void) => {
            this.collisionHandler.onCollision(typeA, typeB, effect);
            this.collisionHandler.onCollision(typeB, typeA, (pB, pA) => effect(pA, pB));
        };

        // Fire + Leaf = More Fire + Gas
        registerReaction(ParticleType.FIRE, ParticleType.LEAF, (fire, leaf) => {
            if (leaf.life > 0 && fire.life > 0 && Math.random() < 0.2) { // 20% chance to catch fire each tick
                leaf.life = 0; // Destroy leaf
                this.addParticleAt(ParticleType.FIRE, leaf.x, leaf.y);
                this.addParticleAt(ParticleType.GAS, leaf.x, leaf.y - 10);
            }
        });

        // Fire + Water = Steam
        registerReaction(ParticleType.FIRE, ParticleType.WATER, (fire, water) => {
            if (fire.life > 0 && water.life > 0 && Math.random() < 0.5) {
                fire.life = 0;
                water.life = 0;
                this.addParticleAt(ParticleType.STEAM, water.x, water.y - 10);
            }
        });

        // Water + Seed = Plant
        registerReaction(ParticleType.WATER, ParticleType.SEED, (water, seed) => {
            if (water.life > 0 && seed.life > 0 && Math.random() < 0.3) {
                water.life = 0;
                seed.life = 0;
                this.addParticleAt(ParticleType.PLANT, seed.x, Math.max(0, seed.y - 10)); // Sprouts upward
            }
        });
    }

    addParticle(particle: Particle): boolean {
        if (this.particles.length >= this.maxParticles) {
            return false;
        }
        this.particles.push(particle);
        this.physicsWorld.createParticle(particle);
        // Play sound when particle is added
        this.audioSystem?.playParticleAdd();
        return true;
    }

    addParticleAt(type: ParticleType, x: number, y: number): boolean {
        if (this.particles.length >= this.maxParticles) {
            return false;
        }
        const particle = particlePool.get(type, x, y);
        this.particles.push(particle);
        this.physicsWorld.createParticle(particle);
        // Play sound when particle is added
        this.audioSystem?.playParticleAdd();
        return true;
    }

    addMultipleParticles(type: ParticleType, x: number, y: number, count: number): number {
        let added = 0;
        for (let i = 0; i < count; i++) {
            if (this.addParticleAt(type, x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10)) {
                added++;
            }
        }
        return added;
    }

    /** Adds a custom drawn Chalk line to the physics world */
    addChalkOutline(points: { x: number, y: number }[], color: string): void {
        this.physicsWorld.addDrawnBody(points, color);
    }

    update(): void {
        // Matter.js engine runs independently, but we need to sync states
        for (const particle of this.particles) {
            this.physicsWorld.updateParticleFromBody(particle);

            // Age out bubbles/fire
            if (particle.type === ParticleType.FIRE || particle.type === ParticleType.BUBBLE) {
                particle.life -= 1;
            }
        }

        // Handle dead particles
        const deadParticles = this.particles.filter(p => p.isDead());
        for (const dead of deadParticles) {
            this.physicsWorld.removeParticle(dead);
            particlePool.release(dead);
        }
        this.particles = this.particles.filter(p => !p.isDead());
    }

    getParticles(): Particle[] {
        return this.particles;
    }

    getStaticBodies(): import('matter-js').Body[] {
        // Return only bodies that are static (like boundaries and chalk lines)
        // Note: Ground boundaries are also static, but their render visibility is usually false, or we can just draw them.
        return this.physicsWorld.getBodies().filter(b => b.isStatic);
    }

    getParticlesByType(type: ParticleType): Particle[] {
        return this.particles.filter(p => p.type === type);
    }

    restoreParticles(particles: ParticleShape[]): void {
        this.clear();

        for (const source of particles) {
            if (this.particles.length >= this.maxParticles) {
                break;
            }
            const particle = Particle.create(source.type, source.x, source.y);
            particle.vx = source.vx;
            particle.vy = source.vy;
            particle.radius = source.radius;
            particle.color = source.color;
            particle.life = source.life;
            particle.maxLife = source.maxLife;
            particle.properties = source.properties;
            this.addParticle(particle);
        }
    }

    getSerializableParticles(): ParticleShape[] {
        return this.particles.map((particle) => ({
            id: particle.id,
            type: particle.type,
            x: particle.x,
            y: particle.y,
            vx: particle.vx,
            vy: particle.vy,
            radius: particle.radius,
            color: particle.color,
            life: particle.life,
            maxLife: particle.maxLife,
            properties: particle.properties,
        }));
    }

    clear(): void {
        this.particles.forEach(p => particlePool.release(p));
        this.particles = [];
        this.physicsWorld.clear();
        this.physicsWorld.addBoundaries(960, 540); // Need to re-add boundaries after clear
    }

    getParticleCount(): number {
        return this.particles.length;
    }

    applyForceToAll(force: Vector2): void {
        const bodies = this.physicsWorld.getBodies();
        bodies.forEach(body => {
            if (!body.isStatic) {
                const particle = this.physicsWorld.findParticleByBody(body);
                if (particle) {
                    particle.applyForce(force);
                    this.physicsWorld.updateParticleBody(particle);
                }
            }
        });
    }

    // Save/Load omitted to keep minimal
}
