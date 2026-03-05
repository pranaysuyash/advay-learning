import { describe, it, expect } from 'vitest';
import { ParticleType } from '../../../features/physics-playground/types';
import { ParticleClass } from '../particle';

describe('Particle Basic Methods Tests', () => {
    it('isAlive should return false if particle drops below height bounds', () => {
        const particle = new ParticleClass(ParticleType.WATER, 100, 100, 0, 0);
        particle.y = 9000;
        expect(particle.isAlive()).toBe(false);
        expect(particle.shouldRemove()).toBe(true);
    });

    it('isAlive should return false if life reaches 0', () => {
        const particle = new ParticleClass(ParticleType.FIRE, 100, 100);
        particle.life = 0;
        expect(particle.isAlive()).toBe(false);
    });

    it('getLifePercentage should calculate ratio correctly', () => {
        const particle = new ParticleClass(ParticleType.STAR, 100, 100);
        particle.maxLife = 100;
        particle.life = 50;
        expect(particle.getLifePercentage()).toBe(0.5);
    });
});
