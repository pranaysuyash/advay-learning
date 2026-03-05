import * as Matter from 'matter-js';
import { Particle } from '../particles/Particle';
import { ParticleType, Settings } from '../types';

/**
 * PhysicsWorld - Manages Matter.js physics simulation
 * 
 * This class wraps the Matter.js engine and provides particle-specific
 * functionality for the physics playground.
 */
export class PhysicsWorld {
    private engine: Matter.Engine;
    private render: Matter.Render | null = null;
    private runner: Matter.Runner;
    private world: Matter.World;
    private particles: Map<string, Matter.Body> = new Map();
    private bodyToParticle: Map<Matter.Body, Particle> = new Map();
    private isRunning: boolean = false;

    constructor(_settings: Settings) {
        // Create Matter.js engine
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;

        // Configure gravity
        this.engine.gravity.y = 1;

        // Create runner for 60fps simulation
        this.runner = Matter.Runner.create();
        // Runner uses fixed time step by default
    }

    /**
     * Start the physics simulation
     */
    start(): void {
        if (this.isRunning) {
            return;
        }

        Matter.Runner.run(this.runner, this.engine);
        this.isRunning = true;
    }

    /**
     * Stop the physics simulation
     */
    stop(): void {
        if (!this.isRunning) {
            return;
        }

        Matter.Runner.stop(this.runner);
        this.isRunning = false;
    }

    /**
     * Create a particle body in the physics world
     */
    createParticle(particle: Particle): Matter.Body {
        const body = Matter.Bodies.circle(
            particle.x,
            particle.y,
            particle.radius,
            {
                restitution: particle.properties.restitution,
                friction: particle.properties.friction,
                frictionAir: particle.properties.friction * 0.01,
                density: particle.properties.density,
                render: {
                    fillStyle: particle.color,
                    strokeStyle: particle.color,
                    lineWidth: 1
                }
            }
        );

        // Store mapping between particle and body
        this.particles.set(particle.id, body);
        this.bodyToParticle.set(body, particle);

        // Add to world
        Matter.World.add(this.world, body);

        return body;
    }

    /**
     * Remove a particle from the physics world
     */
    removeParticle(particle: Particle): void {
        const body = this.particles.get(particle.id);
        if (body) {
            Matter.World.remove(this.world, body);
            this.particles.delete(particle.id);
            this.bodyToParticle.delete(body);
        }
    }

    /**
     * Update particle body position from particle state
     */
    updateParticleBody(particle: Particle): void {
        const body = this.particles.get(particle.id);
        if (body) {
            Matter.Body.setPosition(body, { x: particle.x, y: particle.y });
            Matter.Body.setVelocity(body, { x: particle.vx, y: particle.vy });
        }
    }

    /**
     * Update particle state from physics body
     */
    updateParticleFromBody(particle: Particle): void {
        const body = this.particles.get(particle.id);
        if (body) {
            particle.x = body.position.x;
            particle.y = body.position.y;
            particle.vx = body.velocity.x;
            particle.vy = body.velocity.y;
        }
    }

    /**
     * Add boundary constraints to the world
     */
    addBoundaries(width: number, height: number): void {
        const wallOptions = {
            isStatic: true,
            render: { visible: false },
            friction: 0.5,
            restitution: 0.5
        };

        const thickness = 100;

        // Create walls
        const ground = Matter.Bodies.rectangle(
            width / 2,
            height + thickness / 2,
            width,
            thickness,
            wallOptions
        );

        const ceiling = Matter.Bodies.rectangle(
            width / 2,
            -thickness / 2,
            width,
            thickness,
            wallOptions
        );

        const leftWall = Matter.Bodies.rectangle(
            -thickness / 2,
            height / 2,
            thickness,
            height * 2,
            wallOptions
        );

        const rightWall = Matter.Bodies.rectangle(
            width + thickness / 2,
            height / 2,
            thickness,
            height * 2,
            wallOptions
        );

        Matter.World.add(this.world, [ground, ceiling, leftWall, rightWall]);
    }

    /**
     * Add a drawn line as a static physics body
     * Converts a series of drawn points into a concave hull or multiple segments
     */
    addDrawnBody(points: { x: number, y: number }[], color: string = '#FFFFFF'): Matter.Body | null {
        if (points.length < 2) return null;

        // For drawn lines, we create a chain of rectangles connecting the points
        // This is more robust than trying to make a complex concave hull for a simple stroke
        const parts: Matter.Body[] = [];

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            // Calculate distance and angle between points
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Skip points that are too close
            if (distance < 5) continue;

            const angle = Math.atan2(dy, dx);

            // Midpoint
            const mx = p1.x + dx / 2;
            const my = p1.y + dy / 2;

            // Create segment (width = distance, height = stroke thickness)
            const segment = Matter.Bodies.rectangle(mx, my, distance, 12, {
                angle: angle,
                isStatic: true,
                friction: 0.8,
                restitution: 0.2, // Chalk lines shouldn't be too bouncy
                render: {
                    fillStyle: color,
                    strokeStyle: color,
                    lineWidth: 1
                }
            });

            parts.push(segment);
        }

        if (parts.length === 0) return null;

        // Group the parts into a single Compound Body
        const chalkBody = Matter.Body.create({
            parts: parts,
            isStatic: true,
            friction: 0.8,
            restitution: 0.2
        });

        // We do *not* add this to `this.particles` map because it is not a Particle,
        // it is a static environmental object.
        Matter.World.add(this.world, chalkBody);

        return chalkBody;
    }

    /**
     * Set up collision events
     */
    onCollision(callback: (event: Matter.IEventCollision<Matter.Engine>) => void): void {
        Matter.Events.on(this.engine, 'collisionStart', callback);
    }

    /**
     * Get all bodies in the world
     */
    getBodies(): Matter.Body[] {
        return Matter.Composite.allBodies(this.world);
    }

    /**
     * Get particles by type
     */
    getParticlesByType(type: ParticleType): Matter.Body[] {
        const bodies = this.getBodies();
        return bodies.filter(body => {
            const particle = this.findParticleByBody(body);
            return particle && particle.type === type;
        });
    }

    /**
     * Find particle by body
     */
    findParticleByBody(body: Matter.Body): Particle | null {
        return this.bodyToParticle.get(body) || null;
    }

    /**
     * Step the physics engine
     */
    step(): void {
        Matter.Engine.update(this.engine, 1000 / 60);
    }

    /**
     * Clear all bodies from the world
     */
    clear(): void {
        const bodies = Matter.Composite.allBodies(this.world);
        Matter.World.remove(this.world, bodies.filter(b => !b.isStatic));
        this.particles.clear();
    }

    /**
     * Get engine stats
     */
    getStats(): { bodyCount: number; isRunning: boolean } {
        return {
            bodyCount: this.particles.size,
            isRunning: this.isRunning
        };
    }

    /**
     * Dispose of the physics world
     */
    dispose(): void {
        this.stop();
        Matter.Engine.clear(this.engine);
        if (this.render) {
            Matter.Render.stop(this.render);
            this.render.canvas.remove();
        }
    }
}
