/**
 * TTSService — Text-to-Speech Service (Strategy Pattern)
 *
 * Manages TTS providers with automatic fallback:
 *   1. Kokoro 82M (on-device, natural voice, WebGPU/WASM)
 *   2. Web Speech API (browser built-in, robotic but universal)
 *
 * The service initializes Kokoro asynchronously. While loading (or if
 * it fails), all speak() calls are routed to the Web Speech fallback.
 *
 * @see TTSProvider.ts for the provider interface
 * @see KokoroTTSProvider.ts for the primary SOTA provider
 * @see WebSpeechTTSProvider.ts for the browser fallback
 */

import type { TTSProvider, TTSProviderOptions } from './TTSProvider';
import { KokoroTTSProvider } from './KokoroTTSProvider';
import { WebSpeechTTSProvider } from './WebSpeechTTSProvider';

// Re-export for backward compatibility
export type TTSOptions = TTSProviderOptions;

export class TTSService {
  private primary: TTSProvider;
  private fallback: TTSProvider;
  private activeProvider: TTSProvider | null = null;
  private enabled = true;
  private volume = 1.0;
  private initPromise: Promise<void> | null = null;
  private _isReady = false;

  constructor() {
    this.fallback = new WebSpeechTTSProvider();
    this.primary = new KokoroTTSProvider();

    const mode = String((import.meta as any).env?.MODE ?? '').toLowerCase();
    const isVitest =
      typeof process !== 'undefined' &&
      typeof process.env !== 'undefined' &&
      (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test');
    const isTestRuntime = mode === 'test' || isVitest;

    if (isTestRuntime) {
      // Prevent heavy model startup inside test workers.
      void this.fallback.init().then((ready) => {
        if (ready) this.activeProvider = this.fallback;
      });
      this._isReady = true;
      return;
    }

    // Start initialization immediately
    this.initPromise = this.initialize();
  }

  /**
   * Initialize providers: try Kokoro first, fall back to Web Speech.
   * This runs in the background — speak() works immediately via fallback.
   */
  private async initialize(): Promise<void> {
    // Always init the fallback first (instant, no model download)
    const fallbackReady = await this.fallback.init();
    if (fallbackReady) {
      this.activeProvider = this.fallback;
      this._isReady = true;
      console.log(`[TTSService] Fallback ready: ${this.fallback.name}`);
    }

    // Then try to load Kokoro (may take seconds on first load due to model download)
    try {
      const primaryReady = await this.primary.init();
      if (primaryReady) {
        this.activeProvider = this.primary;
        console.log(`[TTSService] ✨ Primary ready: ${this.primary.name}`);
      } else {
        console.log('[TTSService] Primary unavailable, using fallback');
      }
    } catch (error) {
      console.warn('[TTSService] Primary init failed, using fallback:', error);
    }

    this._isReady = true;
  }

  /** Whether any TTS provider is ready */
  isAvailable(): boolean {
    return this._isReady && this.activeProvider !== null;
  }

  /** Whether TTS is enabled (user setting) */
  isEnabled(): boolean {
    return this.enabled && this.isAvailable();
  }

  /** Whether TTS is currently speaking */
  isSpeaking(): boolean {
    return this.activeProvider?.isSpeaking() ?? false;
  }

  /** Name of the active provider ("Kokoro 82M (On-Device)" or "Web Speech API (Browser)") */
  getProviderName(): string {
    return this.activeProvider?.name ?? 'None';
  }

  /** Whether the primary (Kokoro) provider is active (not the fallback) */
  isPrimaryActive(): boolean {
    return this.activeProvider === this.primary && this.primary.isReady();
  }

  /**
   * Speak text with optional configuration.
   * Routes to the best available provider.
   * Automatically cancels any in-progress speech first.
   */
  async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.enabled) return;

    // Always cancel previous speech to prevent overlap
    this.stop();

    // Wait for initialization if still pending
    if (this.initPromise) {
      await this.initPromise;
    }

    if (!this.activeProvider) return;

    const mergedOptions: TTSProviderOptions = {
      ...options,
      volume: Math.min(options?.volume ?? 1.0, this.volume),
    };

    try {
      await this.activeProvider.speak(text, mergedOptions);
    } catch (error) {
      // If primary fails, try fallback
      if (this.activeProvider === this.primary && this.fallback.isReady()) {
        console.warn('[TTSService] Primary failed, falling back:', error);
        await this.fallback.speak(text, mergedOptions);
      }
    }
  }

  /**
   * Speak text in a specific language (convenience method).
   */
  async speakInLanguage(text: string, languageCode: string): Promise<void> {
    const langMap: Record<string, string> = {
      en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', te: 'te-IN', ta: 'ta-IN',
    };
    return this.speak(text, { lang: langMap[languageCode] || 'en-US' });
  }

  /** Stop any ongoing speech */
  stop(): void {
    this.activeProvider?.stop();
  }

  /** Pause speech (Web Speech only) */
  pause(): void {
    // Only Web Speech API supports pause/resume natively
    if (this.activeProvider === this.fallback) {
      (this.fallback as any).synth?.pause?.();
    }
  }

  /** Resume paused speech */
  resume(): void {
    if (this.activeProvider === this.fallback) {
      (this.fallback as any).synth?.resume?.();
    }
  }

  /** Enable or disable TTS */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  /** Set master volume (0 to 1) */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /** Get current volume */
  getVolume(): number {
    return this.volume;
  }

  /** Set default TTS options (backward compatibility) */
  setDefaultOptions(_options: Partial<TTSOptions>): void {
    // No-op for backward compat — options are per-call now
  }

  /** Get available voices (backward compatibility) */
  getVoices(): Array<{ name: string; lang: string; default: boolean; localService: boolean }> {
    // Return Web Speech voices for backward compat
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.getVoices().map((v) => ({
        name: v.name,
        lang: v.lang,
        default: v.default,
        localService: v.localService,
      }));
    }
    return [];
  }

  /** Reset to defaults (backward compatibility) */
  resetToDefaults(): void {
    this.volume = 1.0;
  }

  /** Clean up all resources */
  dispose(): void {
    this.primary.dispose();
    this.fallback.dispose();
    this.activeProvider = null;
  }
}

// Singleton instance
export const ttsService = new TTSService();

// Default export for convenience
export default ttsService;
