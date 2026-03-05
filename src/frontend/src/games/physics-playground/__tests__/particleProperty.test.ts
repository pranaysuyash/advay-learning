import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ParticleType } from '../../../features/physics-playground/types';
import { ParticleClass, PARTICLE_CONFIGS } from '../particle';

describe('ParticleProperty Tests', () => {
    it('should correctly initialize properties based on ParticleType configs', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    ParticleType.SAND,
                    ParticleType.WATER,
                    ParticleType.FIRE,
                    ParticleType.BUBBLE,
                    ParticleType.STAR,
                    ParticleType.LEAF
                ),
                (type) => {
                    const particle = new ParticleClass(type, 100, 100);
                    const config = PARTICLE_CONFIGS[type];

                    expect(particle.type).toBe(type);
                    expect(particle.properties.gravity).toBe(config.gravity);
                    expect(particle.properties.friction).toBe(config.friction);
                    expect(particle.properties.restitution).toBe(config.restitution);
                    expect(particle.color).toBe(config.specific.color || '#000');
                }
            )
        );
    });

    it('should correctly apply friction and gravity across simulated frames', () => {
        const particle = new ParticleClass(ParticleType.SAND, 0, 0, 10, 0);
        const originalVx = particle.vx;
        const config = PARTICLE_CONFIGS[ParticleType.SAND];

        particle.update(1);

        expect(particle.vx).toBe(originalVx * config.friction);
        expect(particle.vy).toBe(config.gravity);
    });
});
