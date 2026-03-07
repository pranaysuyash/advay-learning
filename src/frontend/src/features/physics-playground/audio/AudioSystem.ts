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
        let frequency = 440; // A4 (default)
        const waveType: OscillatorType = 'sine';

        switch (particleType) {
            case ParticleType.FIRE:
                frequency = 660; // Higher pitch for fire
                break;
            case ParticleType.BUBBLE:
                frequency = 330; // Lower pitch for bubble
                break;
            case ParticleType.STAR:
                frequency = 880; // Even higher for star
                break;
            case ParticleType.SAND:
                frequency = 220; // Low rumble
                break;
            case ParticleType.WATER:
                frequency = 293; // Mid tone
                break;
            case ParticleType.LEAF:
                frequency = 349; // Natural tone
                break;
            case ParticleType.SEED:
                frequency = 392; // Small but solid
                break;
            case ParticleType.GAS:
                frequency = 196; // Very low, airy
                break;
            case ParticleType.STEAM:
                frequency = 262; // Hissing tone
                break;
            case ParticleType.PLANT:
                frequency = 330; // Growing tone
                break;
        }

        this.createOscillator(frequency, waveType, 0.15);
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

        switch (particleType) {
            case ParticleType.SAND:
                type = 'square';
                frequency = 110;
                break;
            case ParticleType.WATER:
                type = 'sine';
                frequency = 176;
                break;
            case ParticleType.FIRE:
                type = 'sawtooth';
                frequency = 294;
                break;
            case ParticleType.BUBBLE:
                type = 'sine';
                frequency = 352;
                break;
            case ParticleType.STAR:
                type = 'triangle';
                frequency = 440;
                break;
            case ParticleType.LEAF:
                type = 'sawtooth';
                frequency = 110;
                break;
            case ParticleType.SEED:
                type = 'triangle';
                frequency = 165;
                break;
            case ParticleType.GAS:
                type = 'sine';
                frequency = 98;
                break;
            case ParticleType.STEAM:
                type = 'triangle';
                frequency = 131;
                break;
            case ParticleType.PLANT:
                type = 'sawtooth';
                frequency = 143;
                break;
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

        switch (particleType) {
            case ParticleType.FIRE:
                frequency = 165;
                break;
            case ParticleType.BUBBLE:
                frequency = 88;
                break;
            case ParticleType.STAR:
                frequency = 220;
                break;
            case ParticleType.GAS:
                frequency = 73;
                break;
            case ParticleType.STEAM:
                frequency = 82;
                break;
            case ParticleType.PLANT:
                frequency = 98;
                break;
        }

        this.createOscillator(frequency, 'triangle', 0.2);
    }
}
