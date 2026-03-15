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
import type { KokoroTTSEngine, KokoroStatus } from './KokoroTTSEngine';

declare const __BETA_LOCAL_AI_ENABLED__: boolean;

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
  private readonly isTestEnv: boolean =
    (import.meta as any).env?.MODE === 'test';

  // Tier 3: Web Speech API (always available)
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  // Tier 2: Kokoro-82M engine
  private kokoroEngine: KokoroTTSEngine | null = null;
  private kokoroImportPromise: Promise<KokoroTTSEngine | null> | null = null;

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

    // Preload pre-generated audio cache (Tier 1). Skip in unit tests to reduce
    // noise and avoid media setup work in jsdom.
    // preloadAll() is now async (fetches manifest.json) but we fire-and-forget
    // since the cache degrades gracefully to Tier 2/3 until ready.
    if (typeof window !== 'undefined' && !this.isTestEnv) {
      void PregenAudioCache.preloadAll('en');
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
      console.log(
        `[TTSService] Loaded ${this.voices.length} Web Speech voices`,
      );
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

      // Use specified voice name if provided, otherwise find by language
      let voice: SpeechSynthesisVoice | null = null;
      if (options.voiceName) {
        voice = this.voices.find((v) => v.name === options.voiceName) ?? null;
      }
      if (!voice) {
        voice = this.findVoiceForLanguage(lang);
      }
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        if (event.error === 'interrupted' || event.error === 'not-allowed') {
          // 'not-allowed' happens if the browser blocks autoplay without user interaction.
          // We resolve gracefully to prevent uncaught promise rejections in game loops.
          if (event.error === 'not-allowed') {
            console.warn('[TTSService] Web Speech blocked (not-allowed). Requires user interaction.');
          }
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
    void this.ensureKokoroEngine().then((engine) => {
      if (!engine) return;
      engine.init().catch((err) => {
        console.warn(
          '[TTSService] Kokoro init failed, will use fallback:',
          err,
        );
      });
    });
  }

  /**
   * Get Kokoro model status
   */
  getKokoroStatus(): KokoroStatus {
    return this.kokoroEngine?.getStatus() ?? 'idle';
  }

  /**
   * Get Kokoro model loading progress (0-100)
   */
  getKokoroProgress(): number {
    return this.kokoroEngine?.getLoadProgress() ?? 0;
  }

  /**
   * Subscribe to Kokoro engine events
   */
  onKokoroEvent(callback: Parameters<KokoroTTSEngine['on']>[0]): () => void {
    if (this.kokoroEngine) {
      return this.kokoroEngine.on(callback);
    }
    void this.ensureKokoroEngine().then((engine) => {
      engine?.on(callback);
    });
    return () => {};
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
    return this.synth !== null || this.kokoroEngine?.isReady() === true;
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

    // Always attempt pre-generated audio first (Tier 1).
    // PregenAudioCache.play() rejects immediately if the text is not in the
    // manifest, so we fall through to Tier 2/3 with no extra latency.
    return PregenAudioCache.play(text, effectiveVolume)
      .then(() => {
        this._lastActiveEngine = 'pregen';
        console.log('[TTSService] Engine: pregen');
      })
      .catch(() => this.speakWithFallback(text, mergedOptions));
  }

  /**
   * Try Kokoro, then Web Speech API
   */
  private speakWithFallback(text: string, options: TTSOptions): Promise<void> {
    const kokoroStatus = this.kokoroEngine?.getStatus() ?? 'idle';
    const useKokoro =
      this.enginePreference !== 'web-speech' && kokoroStatus === 'ready';

    if (useKokoro) {
      this._lastActiveEngine = 'kokoro';
      console.log('[TTSService] Engine: kokoro');
      const effectiveVolume = Math.min(options.volume ?? 1.0, this.volume);
      return this.kokoroEngine!.speak(
        text,
        effectiveVolume,
        options.kokoroVoice,
      ).catch((err) => {
        console.warn(
          '[TTSService] Kokoro failed, falling back to Web Speech:',
          err,
        );
        this._lastActiveEngine = 'web-speech';
        return this.webSpeechSpeak(text, options);
      });
    } else if (
      this.enginePreference !== 'web-speech' &&
      kokoroStatus === 'loading'
    ) {
      // We are still loading the Kokoro model, let's gracefully fall back to web speech for now
      console.log(
        '[TTSService] Kokoro is still loading, falling back to Web Speech temporarily',
      );
    } else if (kokoroStatus === 'error') {
      // Kokoro failed to load - log but continue to fallback
      console.log(
        '[TTSService] Kokoro failed to load, falling back to Web Speech',
      );
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

  /**
   * Speak a phoneme letter using pre-generated audio when available.
   * Falls back to speak(ttsText) via Tier 2/3 if not pre-generated.
   *
   * @param letter  - Letter or blend (e.g. 'A', 'BL')
   * @param ttsText - The rich description text (e.g. 'Ah! Like in Apple!')
   *                  Passed as fallback for Tier 2/3 if no pre-gen file exists.
   */
  speakLetter(_letter: string, ttsText: string): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    this.stop();
    // ttsText is the primary key in the manifest (e.g. "Ah! Like in Apple!")
    return this.speak(ttsText);
  }

  stop(): void {
    // Stop all engines
    if (this.synth) {
      // Browser bug fix: cancel() occasionally fails to clear the queue if speech is paused
      // or if it was interrupted mid-word. Pausing, resuming, then waiting a tick before cancel
      // is the most reliable way to clear sticky queues in Chrome/Safari.
      if (typeof this.synth.pause === 'function') {
        this.synth.pause();
      }
      if (typeof this.synth.resume === 'function') {
        this.synth.resume();
      }
      if (typeof this.synth.cancel === 'function') {
        this.synth.cancel();
      }
    }
    PregenAudioCache.stop();
    this.kokoroEngine?.stop();
  }

  pause(): void {
    if (this.synth && typeof this.synth.pause === 'function') {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth && typeof this.synth.resume === 'function') {
      this.synth.resume();
    }
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
    this.kokoroEngine?.dispose();
  }

  private async ensureKokoroEngine(): Promise<KokoroTTSEngine | null> {
    if (this.kokoroEngine) {
      return this.kokoroEngine;
    }
    if (!this.kokoroImportPromise) {
      this.kokoroImportPromise = import('./KokoroTTSEngine')
        .then((module) => {
          this.kokoroEngine = new module.KokoroTTSEngine();
          return this.kokoroEngine;
        })
        .catch((error) => {
          console.warn('[TTSService] Failed to load Kokoro runtime:', error);
          return null;
        });
    }
    return this.kokoroImportPromise;
  }
}

// Singleton instance
export const ttsService = new TTSService();

// Default export for convenience
export default ttsService;
