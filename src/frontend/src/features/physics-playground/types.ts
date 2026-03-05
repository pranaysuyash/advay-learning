// Core types for Physics Playground

export type Vector2 = { x: number; y: number };

export enum ParticleType {
    SAND = 'sand',
    WATER = 'water',
    FIRE = 'fire',
    BUBBLE = 'bubble',
    STAR = 'star',
    LEAF = 'leaf',
    GAS = 'gas',
    STEAM = 'steam',
    SEED = 'seed',
    PLANT = 'plant'
}

export interface ParticleProperties {
    gravity: number;
    friction: number;
    restitution: number; // Bounciness
    density: number;
    specific: Record<string, any>;
}

export interface Particle {
    id: string;
    type: ParticleType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    life: number; // For particles that fade
    maxLife: number;
    properties: ParticleProperties;
}

export interface ParticleConfig {
    type: ParticleType;
    properties: ParticleProperties;
    spawnRate: number;
    maxParticles: number;
    initialVelocity: Vector2;
}

export interface HandTracking {
    isReady: boolean;
    handPosition: Vector2 | null;
    gestures: Gesture[];
    detectHand(): void;
    detectGesture(): Gesture | null;
}

export interface Gesture {
    type: 'tap' | 'pinch' | 'swipe' | 'hold';
    position: Vector2;
    direction?: Vector2;
    duration?: number;
}

export interface CanvasRenderer {
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    renderParticles(particles: Particle[]): void;
    renderBackground(): void;
    renderUI(): void;
}

export interface AudioSystem {
    playParticleAdd(): void;
    playCollision(particleType: ParticleType): void;
    playBoundaryCollision(particleType: ParticleType): void;
    setMuted(muted: boolean): void;
    isMuted: boolean;
}

export interface SavedState {
    id: string;
    timestamp: number;
    particles: Particle[];
    settings: Settings;
}

export interface Settings {
    particleCountLimit: number;
    audioEnabled: boolean;
    handTrackingEnabled: boolean;
    accessibilityMode: AccessibilityMode;
    interactionMode: 'pour' | 'draw';
}

export enum AccessibilityMode {
    NONE = 'none',
    KEYBOARD = 'keyboard',
    SCREEN_READER = 'screen_reader',
    HIGH_CONTRAST = 'high_contrast',
    COLORBLIND = 'colorblind',
    SWITCH_ACCESS = 'switch_access',
    VOICE_COMMANDS = 'voice_commands'
}
