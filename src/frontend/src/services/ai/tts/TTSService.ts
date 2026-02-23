/**
 * TTSService - Three-tier Text-to-Speech Service
 *
 * Provides a friendly voice for Pip the mascot using a three-tier strategy:
 *   1. Pre-generated audio (instant .wav playback for static phrases)
 *   2. Kokoro-82M in-browser neural TTS (for dynamic phrases)
 *   3. Web Speech API fallback (always available)
 *
 * Game components don't need to know which tier is active — the
 * speak() API is identical regardless of engine.
 *
 * @see docs/TTS_EVALUATION.md
 * @see docs/research/LOCAL_TTS_STRATEGY.md
 */

import { PregenAudioCache } from './PregenAudioCache';
import { KokoroTTSEngine, KokoroStatus } from './KokoroTTSEngine';

export interface TTSOptions {
  /** Speech rate: 0.1 to 10 (default: 1.0) */
  rate?: number;
  /** Voice pitch: 0 to 2 (default: 1.0) */
  pitch?: number;
  /** Volume: 0 to 1 (default: 1.0) */
  volume?: number;
  /** Language code (e.g., 'en-US', 'hi-IN') */
  lang?: string;
  /** Preferred voice name (browser-specific) */
  voiceName?: string;
  /** Kokoro voice preset (e.g. 'af_heart', 'af_bella') */
  kokoroVoice?: string;
}

export interface TTSVoiceInfo {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

export type TTSEngine = 'auto' | 'kokoro' | 'web-speech';
export type ActiveEngine = 'pregen' | 'kokoro' | 'web-speech';

// Pip's default voice settings - friendly and slightly higher pitched
const PIP_VOICE_DEFAULTS: TTSOptions = {
  rate: 1.0,
  pitch: 1.2,
  volume: 1.0,
  lang: 'en-US',
};

// Language code mapping for multi-language support
const LANGUAGE_VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  kn: 'kn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
};

/**
 * TTSService class — three-tier TTS strategy
 *
 * Usage (unchanged from before):
 * ```typescript
 * import { ttsService } from '@/services/ai/tts/TTSService';
 *
 * await ttsService.speak("Hello! I'm Pip!");           // auto-selects best engine
 * await ttsService.speak("Great job!", { rate: 1.2 }); // options still work
 * ```
 */
export class TTSService {
  private readonly isTestEnv: boolean = (import.meta as any).env?.MODE === 'test';

  // Tier 3: Web Speech API (always available)
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  // Tier 2: Kokoro-82M engine
  private kokoroEngine: KokoroTTSEngine;

  // General state
  private enabled: boolean = true;
  private volume: number = 1.0;
  private enginePreference: TTSEngine = 'auto';
  private defaultOptions: TTSOptions = { ...PIP_VOICE_DEFAULTS };
  private _lastActiveEngine: ActiveEngine = 'web-speech';

  constructor() {
    // Initialize Web Speech API (Tier 3)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }

    // Initialize Kokoro engine instance (Tier 2) — doesn't load model yet
    this.kokoroEngine = new KokoroTTSEngine();

    // Preload pre-generated audio cache (Tier 1). Skip in unit tests to reduce
    // noise and avoid media setup work in jsdom.
    if (typeof window !== 'undefined' && !this.isTestEnv) {
      PregenAudioCache.preloadAll();
    }
  }

  // ---------------------------------------------------------------------------
  // Web Speech API helpers (Tier 3)
  // ---------------------------------------------------------------------------

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.voicesLoaded = this.voices.length > 0;
    if (this.voicesLoaded) {
      console.log(`[TTSService] Loaded ${this.voices.length} Web Speech voices`);
    }
  }

  private findVoiceForLanguage(lang: string): SpeechSynthesisVoice | null {
    if (!this.voices.length) return null;
    let voice = this.voices.find((v) => v.lang === lang);
    if (voice) return voice;
    const langPrefix = lang.split('-')[0];
    voice = this.voices.find((v) => v.lang.startsWith(langPrefix));
    if (voice) return voice;
    return this.voices.find((v) => v.default) || this.voices[0] || null;
  }

  private webSpeechSpeak(text: string, options: TTSOptions): Promise<void> {
    if (!this.synth) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = Math.min(options.volume ?? 1.0, this.volume);
      const lang = options.lang || PIP_VOICE_DEFAULTS.lang!;
      utterance.lang = lang;
      const voice = this.findVoiceForLanguage(lang);
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        if (event.error === 'interrupted') {
          resolve();
        } else {
          console.error('[TTSService] Web Speech error:', event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      this.synth!.speak(utterance);
    });
  }

  // ---------------------------------------------------------------------------
  // Kokoro engine management (Tier 2)
  // ---------------------------------------------------------------------------

  /**
   * Initialize the Kokoro neural TTS engine.
   * Call this early (e.g. on app mount) to begin model download.
   * Safe to call multiple times.
   */
  initKokoro(): void {
    if (this.isTestEnv) return;
    if (this.enginePreference === 'web-speech') return;
    this.kokoroEngine.init().catch((err) => {
      console.warn('[TTSService] Kokoro init failed, will use fallback:', err);
    });
  }

  /**
   * Get Kokoro model status
   */
  getKokoroStatus(): KokoroStatus {
    return this.kokoroEngine.getStatus();
  }

  /**
   * Get Kokoro model loading progress (0-100)
   */
  getKokoroProgress(): number {
    return this.kokoroEngine.getLoadProgress();
  }

  /**
   * Subscribe to Kokoro engine events
   */
  onKokoroEvent(callback: Parameters<KokoroTTSEngine['on']>[0]): () => void {
    return this.kokoroEngine.on(callback);
  }

  /**
   * Get which engine was last used
   */
  get lastActiveEngine(): ActiveEngine {
    return this._lastActiveEngine;
  }

  // ---------------------------------------------------------------------------
  // Public API (identical interface as before)
  // ---------------------------------------------------------------------------

  isAvailable(): boolean {
    return this.synth !== null || this.kokoroEngine.isReady();
  }

  isEnabled(): boolean {
    return this.enabled && this.isAvailable();
  }

  getVoices(): TTSVoiceInfo[] {
    return this.voices.map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService,
    }));
  }

  /**
   * Speak text with optional configuration.
   *
   * Uses three-tier strategy:
   *   1. Check pre-generated audio cache → instant playback
   *   2. If Kokoro ready → neural TTS
   *   3. Fallback → Web Speech API
   */
  speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.enabled) return Promise.resolve();

    // Stop any ongoing speech across all engines
    this.stop();

    const mergedOptions = { ...this.defaultOptions, ...options };
    const effectiveVolume = Math.min(mergedOptions.volume ?? 1.0, this.volume);

    // Tier 1: Pre-generated audio (instant, highest quality)
    if (PregenAudioCache.has(text)) {
      this._lastActiveEngine = 'pregen';
      console.log('[TTSService] Engine: pregen');
      return PregenAudioCache.play(text, effectiveVolume).catch((err) => {
        console.warn('[TTSService] Pregen playback failed, falling back:', err);
        return this.speakWithFallback(text, mergedOptions);
      });
    }

    return this.speakWithFallback(text, mergedOptions);
  }

  /**
   * Try Kokoro, then Web Speech API
   */
  private speakWithFallback(text: string, options: TTSOptions): Promise<void> {
    const useKokoro =
      this.enginePreference !== 'web-speech' && this.kokoroEngine.isReady();

    if (useKokoro) {
      this._lastActiveEngine = 'kokoro';
      console.log('[TTSService] Engine: kokoro');
      const effectiveVolume = Math.min(options.volume ?? 1.0, this.volume);
      return this.kokoroEngine
        .speak(text, effectiveVolume, options.kokoroVoice)
        .catch((err) => {
          console.warn('[TTSService] Kokoro failed, falling back to Web Speech:', err);
          this._lastActiveEngine = 'web-speech';
          return this.webSpeechSpeak(text, options);
        });
    }

    // Tier 3: Web Speech API
    this._lastActiveEngine = 'web-speech';
    console.log('[TTSService] Engine: web-speech');
    return this.webSpeechSpeak(text, options);
  }

  speakInLanguage(text: string, languageCode: string): Promise<void> {
    const lang = LANGUAGE_VOICE_MAP[languageCode] || 'en-US';
    return this.speak(text, { lang });
  }

  stop(): void {
    // Stop all engines
    if (this.synth) this.synth.cancel();
    PregenAudioCache.stop();
    this.kokoroEngine.stop();
  }

  pause(): void {
    if (this.synth) this.synth.pause();
  }

  resume(): void {
    if (this.synth) this.synth.resume();
  }

  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  /**
   * Set the preferred TTS engine
   */
  setEnginePreference(engine: TTSEngine): void {
    this.enginePreference = engine;
    if (engine === 'kokoro' || engine === 'auto') {
      this.initKokoro();
    }
  }

  getEnginePreference(): TTSEngine {
    return this.enginePreference;
  }

  setDefaultOptions(options: Partial<TTSOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  resetToDefaults(): void {
    this.defaultOptions = { ...PIP_VOICE_DEFAULTS };
  }

  /**
   * Dispose of all engines (call on app unmount)
   */
  dispose(): void {
    this.stop();
    this.kokoroEngine.dispose();
  }
}

// Singleton instance
export const ttsService = new TTSService();

// Default export for convenience
export default ttsService;
