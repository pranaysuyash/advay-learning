/**
 * TTSService - Text-to-Speech Service using Web Speech API
 *
 * This service provides a friendly voice for Pip the mascot.
 * Uses the browser's built-in speech synthesis for zero-latency,
 * privacy-friendly TTS without external API calls.
 *
 * @see docs/audit/ai-phase1-readiness-audit.md
 * @see docs/ai-native/ARCHITECTURE.md
 */

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
}

export interface TTSVoiceInfo {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

// Pip's default voice settings - friendly and slightly higher pitched
const PIP_VOICE_DEFAULTS: TTSOptions = {
  rate: 1.0,      // Normal speed for clarity
  pitch: 1.2,     // Slightly higher = friendlier for kids
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
 * TTSService class
 *
 * Usage:
 * ```typescript
 * import { ttsService } from '@/services/ai/tts/TTSService';
 *
 * // Simple usage
 * await ttsService.speak("Hello! I'm Pip!");
 *
 * // With options
 * await ttsService.speak("Great job!", { rate: 1.2, pitch: 1.3 });
 *
 * // Check if available
 * if (ttsService.isAvailable()) {
 *   await ttsService.speak("TTS is working!");
 * }
 * ```
 */
export class TTSService {
  private synth: SpeechSynthesis | null = null;
  private enabled: boolean = true;
  private volume: number = 1.0;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private defaultOptions: TTSOptions = { ...PIP_VOICE_DEFAULTS };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      // Chrome loads voices asynchronously
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  /**
   * Load available voices from the browser
   */
  private loadVoices(): void {
    if (!this.synth) return;

    this.voices = this.synth.getVoices();
    this.voicesLoaded = this.voices.length > 0;

    if (this.voicesLoaded) {
      console.log(`[TTSService] Loaded ${this.voices.length} voices`);
    }
  }

  /**
   * Check if TTS is available in this browser
   */
  isAvailable(): boolean {
    return this.synth !== null;
  }

  /**
   * Check if TTS is enabled (user setting)
   */
  isEnabled(): boolean {
    return this.enabled && this.isAvailable();
  }

  /**
   * Get list of available voices
   */
  getVoices(): TTSVoiceInfo[] {
    return this.voices.map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService,
    }));
  }

  /**
   * Find the best voice for a given language
   */
  private findVoiceForLanguage(lang: string): SpeechSynthesisVoice | null {
    if (!this.voices.length) return null;

    // Try exact match first
    let voice = this.voices.find((v) => v.lang === lang);
    if (voice) return voice;

    // Try language prefix (e.g., 'en' for 'en-US')
    const langPrefix = lang.split('-')[0];
    voice = this.voices.find((v) => v.lang.startsWith(langPrefix));
    if (voice) return voice;

    // Fall back to default or first available
    return this.voices.find((v) => v.default) || this.voices[0] || null;
  }

  /**
   * Speak text with optional configuration
   *
   * @param text - The text to speak
   * @param options - Optional TTS configuration
   * @returns Promise that resolves when speech completes
   */
  speak(text: string, options?: TTSOptions): Promise<void> {
    // Don't speak if disabled or unavailable
    if (!this.enabled || !this.synth) {
      return Promise.resolve();
    }

    // Cancel any ongoing speech
    this.stop();

    return new Promise((resolve, reject) => {
      const mergedOptions = { ...this.defaultOptions, ...options };

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = mergedOptions.rate ?? 1.0;
      utterance.pitch = mergedOptions.pitch ?? 1.0;
      utterance.volume = Math.min(mergedOptions.volume ?? 1.0, this.volume);

      // Set language
      const lang = mergedOptions.lang || PIP_VOICE_DEFAULTS.lang!;
      utterance.lang = lang;

      // Try to find a matching voice
      const voice = this.findVoiceForLanguage(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        // Don't reject on 'interrupted' - that's expected when we call stop()
        if (event.error === 'interrupted') {
          resolve();
        } else {
          console.error('[TTSService] Speech error:', event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      this.synth!.speak(utterance);
    });
  }

  /**
   * Speak text in a specific language (convenience method)
   *
   * @param text - The text to speak
   * @param languageCode - Language code ('en', 'hi', 'kn', 'te', 'ta')
   */
  speakInLanguage(text: string, languageCode: string): Promise<void> {
    const lang = LANGUAGE_VOICE_MAP[languageCode] || 'en-US';
    return this.speak(text, { lang });
  }

  /**
   * Stop any ongoing speech
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Pause speech
   */
  pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }

  /**
   * Enable or disable TTS
   *
   * @param enabled - Whether TTS should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Set the master volume
   *
   * @param volume - Volume level from 0 to 1
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Set default options for all speech
   */
  setDefaultOptions(options: Partial<TTSOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Reset to Pip's default voice settings
   */
  resetToDefaults(): void {
    this.defaultOptions = { ...PIP_VOICE_DEFAULTS };
  }
}

// Singleton instance
export const ttsService = new TTSService();

// Default export for convenience
export default ttsService;
