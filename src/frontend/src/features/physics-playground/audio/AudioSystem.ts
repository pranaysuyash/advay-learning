import { ParticleType } from '../types';

/**
 * AudioSystem - Manages audio effects for particle interactions
 * 
 * This class provides sound effects for particle addition, collision,
 * and boundary contact using the Web Audio API.
 */
export class AudioSystem {
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;
    private gainNode: GainNode | null = null;
    private particleAddSound: SoundEffect | null = null;
    private collisionSound: SoundEffect | null = null;
    private boundarySound: SoundEffect | null = null;

    constructor() {
        this.initAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    private initAudioContext(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0.3; // Default volume

            // Initialize sound effects
            this.particleAddSound = new ParticleAddSound(this.audioContext, this.gainNode);
            this.collisionSound = new CollisionSound(this.audioContext, this.gainNode);
            this.boundarySound = new BoundarySound(this.audioContext, this.gainNode);
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    /**
     * Play particle addition sound
     */
    playParticleAdd(): void {
        if (this.isMuted || !this.audioContext || !this.particleAddSound) {
            return;
        }

        this.particleAddSound.play();
    }

    /**
     * Play collision sound
     */
    playCollision(particleType: ParticleType): void {
        if (this.isMuted || !this.audioContext || !this.collisionSound) {
            return;
        }

        this.collisionSound.play(particleType);
    }

    /**
     * Play boundary collision sound
     */
    playBoundaryCollision(particleType: ParticleType): void {
        if (this.isMuted || !this.audioContext || !this.boundarySound) {
            return;
        }

        this.boundarySound.play(particleType);
    }

    /**
     * Set mute state
     */
    setMuted(muted: boolean): void {
        this.isMuted = muted;

        if (this.gainNode) {
            this.gainNode.gain.value = muted ? 0 : 0.3;
        }
    }

    /**
     * Get mute state
     */
    getMuted(): boolean {
        return this.isMuted;
    }

    /**
     * Resume audio context (required after user interaction)
     */
    resume(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Check if audio is available
     */
    isAvailable(): boolean {
        return this.audioContext !== null;
    }

    /**
     * Dispose of audio resources
     */
    dispose(): void {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

/**
 * Base sound effect class
 */
abstract class SoundEffect {
    protected audioContext: AudioContext;
    protected gainNode: GainNode;

    constructor(audioContext: AudioContext, gainNode: GainNode) {
        this.audioContext = audioContext;
        this.gainNode = gainNode;
    }

    abstract play(particleType?: ParticleType): void;

    /**
     * Create oscillator for sound
     */
    protected createOscillator(
        frequency: number,
        type: OscillatorType = 'sine',
        duration: number = 0.1
    ): void {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Envelope
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.connect(gain);
        gain.connect(this.gainNode);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

/**
 * Particle addition sound effect
 */
class ParticleAddSound extends SoundEffect {
    play(particleType?: ParticleType): void {
        // Different pitch for different particle types
        let frequency = 440; // A4

        if (particleType === ParticleType.FIRE) {
            frequency = 660; // Higher pitch for fire
        } else if (particleType === ParticleType.BUBBLE) {
            frequency = 330; // Lower pitch for bubble
        } else if (particleType === ParticleType.STAR) {
            frequency = 880; // Even higher for star
        }

        this.createOscillator(frequency, 'sine', 0.15);
    }
}

/**
 * Collision sound effect
 */
class CollisionSound extends SoundEffect {
    play(particleType?: ParticleType): void {
        // Different sound for different particle types
        let type: OscillatorType = 'triangle';
        let frequency = 220;

        if (particleType === ParticleType.SAND) {
            type = 'square';
            frequency = 110;
        } else if (particleType === ParticleType.WATER) {
            type = 'sine';
            frequency = 176;
        } else if (particleType === ParticleType.FIRE) {
            type = 'sawtooth';
            frequency = 294;
        } else if (particleType === ParticleType.BUBBLE) {
            type = 'sine';
            frequency = 352;
        } else if (particleType === ParticleType.STAR) {
            type = 'triangle';
            frequency = 440;
        } else if (particleType === ParticleType.LEAF) {
            type = 'sawtooth';
            frequency = 110;
        }

        this.createOscillator(frequency, type, 0.1);
    }
}

/**
 * Boundary collision sound effect
 */
class BoundarySound extends SoundEffect {
    play(particleType?: ParticleType): void {
        // Lower pitch for boundary collisions
        let frequency = 110;

        if (particleType === ParticleType.FIRE) {
            frequency = 165;
        } else if (particleType === ParticleType.BUBBLE) {
            frequency = 88;
        } else if (particleType === ParticleType.STAR) {
            frequency = 220;
        }

        this.createOscillator(frequency, 'triangle', 0.2);
    }
}
