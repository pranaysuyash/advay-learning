import { Particle } from '../particles/Particle';
import { AccessibilityMode, ParticleType } from '../types';

/**
 * CanvasRenderer - Renders particles to HTML5 Canvas
 *
 * This class provides rendering functionality for the physics playground,
 * drawing particles with appropriate visual styles and effects.
 *
 * Supports multiple accessibility modes:
 * - HIGH_CONTRAST: Uses high contrast colors and patterns
 * - COLORBLIND: Adds shape/pattern distinctions to particles
 * - SCREEN_READER: Provides ARIA labels (handled at component level)
 */
export class CanvasRenderer {
    private context: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private backgroundGradient: CanvasGradient | null = null;
    private animationFrameId: number | null = null;
    private isPaused: boolean = false;
    private accessibilityMode: AccessibilityMode = AccessibilityMode.NONE;

    // High contrast color palette
    private static readonly HIGH_CONTRAST_COLORS = {
        [ParticleType.SAND]: '#FFFF00',      // Yellow
        [ParticleType.WATER]: '#00FFFF',     // Cyan
        [ParticleType.FIRE]: '#FF0000',      // Red
        [ParticleType.BUBBLE]: '#FFFFFF',    // White
        [ParticleType.STAR]: '#FF00FF',      // Magenta
        [ParticleType.LEAF]: '#00FF00',      // Green
        [ParticleType.SEED]: '#FF6600',      // Orange
        [ParticleType.GAS]: '#999999',       // Gray
        [ParticleType.STEAM]: '#CCCCCC',     // Light Gray
        [ParticleType.PLANT]: '#008000',     // Dark Green
    };

    // Colorblind mode patterns (for shape differentiation)
    private colorblindPatternCanvas: HTMLCanvasElement | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.width = canvas.width;
        this.height = canvas.height;

        // Create background gradient
        this.createBackgroundGradient();
        this.createColorblindPatterns();
    }

    /**
     * Create background gradient
     */
    private createBackgroundGradient(): void {
        // Some test canvas mocks omit gradient APIs; fall back to flat fill.
        if (typeof this.context.createLinearGradient !== 'function') {
            this.backgroundGradient = null;
            return;
        }

        this.backgroundGradient = this.context.createLinearGradient(0, 0, 0, this.height);
        this.backgroundGradient.addColorStop(0, '#87CEEB'); // Sky blue
        this.backgroundGradient.addColorStop(1, '#E0F7FA'); // Light cyan
    }

    /**
     * Create colorblind-friendly patterns for particle differentiation
     */
    private createColorblindPatterns(): void {
        if (typeof document === 'undefined') return;

        this.colorblindPatternCanvas = document.createElement('canvas');
        this.colorblindPatternCanvas.width = 20;
        this.colorblindPatternCanvas.height = 20;
        const patternCtx = this.colorblindPatternCanvas.getContext('2d');
        if (!patternCtx) return;
    }

    /**
     * Set accessibility mode
     */
    setAccessibilityMode(mode: AccessibilityMode): void {
        this.accessibilityMode = mode;
        this.updateBackgroundForAccessibility();
    }

    /**
     * Get current accessibility mode
     */
    getAccessibilityMode(): AccessibilityMode {
        return this.accessibilityMode;
    }

    /**
     * Update background based on accessibility mode
     */
    private updateBackgroundForAccessibility(): void {
        if (typeof this.context.createLinearGradient !== 'function') {
            this.backgroundGradient = null;
            return;
        }

        this.backgroundGradient = this.context.createLinearGradient(0, 0, 0, this.height);

        if (this.accessibilityMode === AccessibilityMode.HIGH_CONTRAST) {
            this.backgroundGradient.addColorStop(0, '#000000');
            this.backgroundGradient.addColorStop(1, '#000000');
        } else {
            this.backgroundGradient.addColorStop(0, '#87CEEB');
            this.backgroundGradient.addColorStop(1, '#E0F7FA');
        }
    }

    /**
     * Get color for particle based on accessibility mode
     */
    private getParticleColor(particle: Particle): string {
        if (this.accessibilityMode === AccessibilityMode.HIGH_CONTRAST) {
            return CanvasRenderer.HIGH_CONTRAST_COLORS[particle.type] || particle.color;
        }
        return particle.color;
    }

    /**
     * Draw colorblind pattern for particle
     */
    private drawColorblindPattern(particle: Particle): void {
        if (this.accessibilityMode !== AccessibilityMode.COLORBLIND) {
            return;
        }

        const { x, y, radius } = particle;
        this.context.save();

        // Draw different patterns based on particle type
        switch (particle.type) {
            case ParticleType.SAND:
                // Dots pattern
                this.drawPatternDots(x, y, radius);
                break;
            case ParticleType.WATER:
                // Wave pattern
                this.drawPatternWave(x, y, radius);
                break;
            case ParticleType.FIRE:
                // Triangle pattern
                this.drawPatternTriangle(x, y, radius);
                break;
            case ParticleType.STAR:
                // Star shape (already drawn)
                break;
            case ParticleType.LEAF:
                // Leaf shape (already drawn)
                break;
            case ParticleType.SEED:
                // Circle outline
                this.context.strokeStyle = '#000';
                this.context.lineWidth = 2;
                this.context.beginPath();
                this.context.arc(x, y, radius * 0.6, 0, Math.PI * 2);
                this.context.stroke();
                break;
        }

        this.context.restore();
    }

    private drawPatternDots(x: number, y: number, radius: number): void {
        this.context.fillStyle = 'rgba(0,0,0,0.3)';
        this.context.beginPath();
        this.context.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        this.context.arc(x + radius * 0.3, y + radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        this.context.fill();
    }

    private drawPatternWave(x: number, y: number, radius: number): void {
        this.context.strokeStyle = 'rgba(0,0,0,0.3)';
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(x - radius * 0.6, y);
        // Fallback for canvas mocks that don't support quadraticCurveTo
        if (typeof this.context.quadraticCurveTo === 'function') {
            this.context.quadraticCurveTo(x - radius * 0.3, y - radius * 0.3, x, y);
            this.context.quadraticCurveTo(x + radius * 0.3, y + radius * 0.3, x + radius * 0.6, y);
        } else {
            // Simple line fallback
            this.context.lineTo(x + radius * 0.6, y);
        }
        this.context.stroke();
    }

    private drawPatternTriangle(x: number, y: number, radius: number): void {
        this.context.fillStyle = 'rgba(0,0,0,0.2)';
        this.context.beginPath();
        this.context.moveTo(x, y - radius * 0.5);
        this.context.lineTo(x + radius * 0.4, y + radius * 0.3);
        this.context.lineTo(x - radius * 0.4, y + radius * 0.3);
        this.context.closePath();
        this.context.fill();
    }

    /**
     * Set canvas dimensions
     */
    setDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.context.canvas.width = width;
        this.context.canvas.height = height;
        this.createBackgroundGradient();
    }

    /**
     * Get canvas dimensions
     */
    getDimensions(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    /**
     * Clear canvas
     */
    clear(): void {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Render background
     */
    renderBackground(): void {
        // Fill with gradient when available, otherwise use a stable fallback color.
        this.context.fillStyle = this.backgroundGradient ?? '#E0F7FA';
        this.context.fillRect(0, 0, this.width, this.height);

        // Draw decorative elements
        this.drawDecorativeElements();
    }

    /**
     * Draw decorative background elements
     */
    private drawDecorativeElements(): void {
        // Draw simple clouds
        this.context.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.drawCloud(100, 100, 60);
        this.drawCloud(300, 80, 50);
        this.drawCloud(500, 120, 70);
        this.drawCloud(700, 90, 55);
    }

    /**
     * Draw a cloud
     */
    private drawCloud(x: number, y: number, size: number): void {
        this.context.beginPath();
        this.context.arc(x, y, size, 0, Math.PI * 2);
        this.context.arc(x + size * 0.8, y - size * 0.2, size * 0.9, 0, Math.PI * 2);
        this.context.arc(x + size * 1.5, y + size * 0.1, size * 0.8, 0, Math.PI * 2);
        this.context.fill();
    }

    /**
     * Render particles
     */
    renderParticles(particles: Particle[]): void {
        // Canvas culling - only render particles within visible bounds
        for (const particle of particles) {
            // Skip particles that are far outside the canvas
            if (
                particle.x < -particle.radius * 2 ||
                particle.x > this.width + particle.radius * 2 ||
                particle.y < -particle.radius * 2 ||
                particle.y > this.height + particle.radius * 2
            ) {
                continue;
            }
            this.renderParticle(particle);
        }
    }

    /**
     * Render a single particle
     */
    private renderParticle(particle: Particle): void {
        this.context.save();

        // Apply particle-specific rendering
        this.applyParticleStyle(particle);

        // Draw particle
        this.drawParticleShape(particle);

        // Draw colorblind patterns if enabled
        this.drawColorblindPattern(particle);

        // Apply visual effects
        this.applyVisualEffects(particle);

        this.context.restore();
    }

    /**
     * Apply particle style
     */
    private applyParticleStyle(particle: Particle): void {
        const color = this.getParticleColor(particle);
        this.context.fillStyle = color;
        this.context.strokeStyle = color;
        this.context.lineWidth = 1;

        // Add glow effect for glowing particles (unless in high contrast mode)
        if (particle.properties.specific.glow && this.accessibilityMode !== AccessibilityMode.HIGH_CONTRAST) {
            this.context.shadowColor = color;
            this.context.shadowBlur = particle.radius * 2;
        } else {
            this.context.shadowBlur = 0;
        }
    }

    /**
     * Draw particle shape based on type
     */
    private drawParticleShape(particle: Particle): void {
        this.context.beginPath();

        switch (particle.properties.specific.shape) {
            case 'circle':
                this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                break;

            case 'star':
                this.drawStar(particle.x, particle.y, particle.radius, 5, particle.radius * 0.5);
                break;

            case 'leaf':
                this.drawLeaf(particle.x, particle.y, particle.radius);
                break;

            default:
                this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                break;
        }

        this.context.fill();
    }

    /**
     * Draw a star shape
     */
    private drawStar(cx: number, cy: number, outerRadius: number, points: number, innerRadius: number): void {
        const step = Math.PI / points;
        const rotate = -Math.PI / 2;

        this.context.moveTo(cx + Math.cos(rotate) * outerRadius, cy + Math.sin(rotate) * outerRadius);

        for (let i = 1; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step + rotate;
            this.context.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        }

        this.context.closePath();
    }

    /**
     * Draw a leaf shape
     */
    private drawLeaf(cx: number, cy: number, size: number): void {
        this.context.beginPath();
        // Use ellipse if available, otherwise fall back to circle
        if (typeof this.context.ellipse === 'function') {
            this.context.ellipse(cx, cy, size, size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        } else {
            // Fallback to a simple circle for compatibility
            this.context.arc(cx, cy, size * 0.8, 0, Math.PI * 2);
        }
        this.context.fill();
    }

    /**
     * Apply visual effects
     */
    private applyVisualEffects(particle: Particle): void {
        // Draw trail for fast-moving particles
        if (Math.abs(particle.vx) > 5 || Math.abs(particle.vy) > 5) {
            this.drawTrail(particle);
        }

        // Draw life indicator for fading particles
        if (particle.life < particle.maxLife) {
            this.drawLifeIndicator(particle);
        }
    }

    /**
     * Draw particle trail
     */
    private drawTrail(particle: Particle): void {
        const trailLength = 5;
        const trailAlpha = 0.3;

        for (let i = 0; i < trailLength; i++) {
            const alpha = trailAlpha * (1 - i / trailLength);
            const trailX = particle.x - particle.vx * i * 2;
            const trailY = particle.y - particle.vy * i * 2;
            const trailSize = particle.radius * (1 - i / trailLength);

            this.context.fillStyle = particle.color;
            this.context.globalAlpha = alpha;
            this.context.beginPath();
            this.context.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
            this.context.fill();
        }

        this.context.globalAlpha = 1;
    }

    /**
     * Draw life indicator
     */
    private drawLifeIndicator(particle: Particle): void {
        const lifePercent = particle.life / particle.maxLife;
        const indicatorRadius = particle.radius * 0.3;

        this.context.fillStyle = `rgba(255, 255, 255, ${lifePercent})`;
        this.context.beginPath();
        this.context.arc(particle.x, particle.y, indicatorRadius, 0, Math.PI * 2);
        this.context.fill();
    }

    /**
     * Render UI elements
     */
    renderUI(particles: Particle[]): void {
        // Draw particle count
        this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.context.fillRect(10, 10, 120, 40);

        this.context.fillStyle = '#FFFFFF';
        this.context.font = '14px Arial';
        this.context.fillText(`Particles: ${particles.length}`, 20, 35);
    }

    /**
     * Start animation loop
     */
    startAnimationLoop(callback: () => void): void {
        if (this.animationFrameId) {
            return;
        }

        const animate = (): void => {
            if (!this.isPaused) {
                callback();
            }
            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Stop animation loop
     */
    stopAnimationLoop(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Pause animation
     */
    pause(): void {
        this.isPaused = true;
    }

    /**
     * Resume animation
     */
    resume(): void {
        this.isPaused = false;
    }

    /**
     * Check if paused
     */
    isPausedAnimation(): boolean {
        return this.isPaused;
    }

    /**
     * Save canvas as image
     */
    saveAsImage(filename: string): void {
        const dataUrl = this.context.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    }

    /**
     * Get canvas context
     */
    getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    /**
     * Get canvas element
     */
    getCanvas(): HTMLCanvasElement {
        return this.context.canvas as HTMLCanvasElement;
    }
}
