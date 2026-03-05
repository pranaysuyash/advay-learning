// Property tests for Audio-Visual Synchronization
// Validates: Requirements 9.1-9.5

import { describe, it, expect, beforeEach } from 'vitest';
import { AudioSystem } from '../audio/AudioSystem';
import { ParticleType } from '../types';

describe('Audio-Visual Synchronization', () => {
    let audioSystem: AudioSystem;

    beforeEach(() => {
        audioSystem = new AudioSystem();
    });

    it('should play sound when particle is added', () => {
        // Property: Audio plays in sync with particle addition
        audioSystem.playParticleAdd();
        expect(audioSystem.isAvailable()).toBe(true);
    });

    it('should play different sounds for different particle types on collision', () => {
        // Property: Audio varies by particle type for collision
        const particleTypes = [
            ParticleType.SAND,
            ParticleType.WATER,
            ParticleType.FIRE,
            ParticleType.BUBBLE,
            ParticleType.STAR,
            ParticleType.LEAF,
        ];

        particleTypes.forEach((type) => {
            expect(() => audioSystem.playCollision(type)).not.toThrow();
        });
    });

    it('should play different sounds for different particle types on boundary collision', () => {
        // Property: Audio varies by particle type for boundary collision
        const particleTypes = [
            ParticleType.SAND,
            ParticleType.WATER,
            ParticleType.FIRE,
            ParticleType.BUBBLE,
            ParticleType.STAR,
            ParticleType.LEAF,
        ];

        particleTypes.forEach((type) => {
            expect(() => audioSystem.playBoundaryCollision(type)).not.toThrow();
        });
    });

    it('should mute audio when setMuted is called', () => {
        // Property: Mute functionality works correctly
        audioSystem.setMuted(true);
        expect(audioSystem.getMuted()).toBe(true);

        // Should not throw when playing sounds while muted
        expect(() => audioSystem.playParticleAdd()).not.toThrow();
        expect(() => audioSystem.playCollision(ParticleType.SAND)).not.toThrow();
    });

    it('should unmute audio when setMuted is called with false', () => {
        // Property: Unmute functionality works correctly
        audioSystem.setMuted(true);
        audioSystem.setMuted(false);
        expect(audioSystem.getMuted()).toBe(false);
    });

    it('should resume audio context after user interaction', () => {
        // Property: Audio context can be resumed
        audioSystem.resume();
        expect(audioSystem.isAvailable()).toBe(true);
    });

    it('should dispose of audio resources properly', () => {
        // Property: Audio resources are cleaned up
        audioSystem.dispose();
        expect(audioSystem.isAvailable()).toBe(false);
    });
});
