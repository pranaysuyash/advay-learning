/**
 * WebSpeechTTSProvider — Fallback TTS using the browser's built-in
 * Web Speech API (window.speechSynthesis).
 *
 * Used when Kokoro/WebGPU is unavailable (older devices, Firefox, etc).
 */

import type { TTSProvider, TTSProviderOptions } from './TTSProvider';

// Pip's default voice settings — friendly and slightly higher pitched
const DEFAULT_RATE = 1.0;
const DEFAULT_PITCH = 1.2;

const LANGUAGE_VOICE_MAP: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    kn: 'kn-IN',
    te: 'te-IN',
    ta: 'ta-IN',
};

export class WebSpeechTTSProvider implements TTSProvider {
    readonly name = 'Web Speech API (Browser)';
    private synth: SpeechSynthesis | null = null;
    private voices: SpeechSynthesisVoice[] = [];
    private ready = false;

    async init(): Promise<boolean> {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return false;
        }

        this.synth = window.speechSynthesis;
        this.loadVoices();

        // Chrome loads voices asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }

        this.ready = true;
        return true;
    }

    private loadVoices(): void {
        if (!this.synth) return;
        this.voices = this.synth.getVoices();
        if (this.voices.length > 0) {
            console.log(`[WebSpeechTTS] Loaded ${this.voices.length} voices`);
        }
    }

    private findVoice(lang: string): SpeechSynthesisVoice | null {
        if (!this.voices.length) return null;

        // Exact match
        let voice = this.voices.find((v) => v.lang === lang);
        if (voice) return voice;

        // Prefix match
        const prefix = lang.split('-')[0];
        voice = this.voices.find((v) => v.lang.startsWith(prefix));
        if (voice) return voice;

        return this.voices.find((v) => v.default) || this.voices[0] || null;
    }

    isReady(): boolean {
        return this.ready;
    }

    speak(text: string, options?: TTSProviderOptions): Promise<void> {
        if (!this.synth) return Promise.resolve();

        this.stop();

        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options?.rate ?? DEFAULT_RATE;
            utterance.pitch = options?.pitch ?? DEFAULT_PITCH;
            utterance.volume = options?.volume ?? 1.0;

            const langCode = options?.lang || 'en-US';
            utterance.lang = LANGUAGE_VOICE_MAP[langCode] || langCode;

            const voice = this.findVoice(utterance.lang);
            if (voice) utterance.voice = voice;

            utterance.onend = () => resolve();
            utterance.onerror = (event) => {
                if (event.error !== 'interrupted') {
                    console.error('[WebSpeechTTS] Error:', event.error);
                }
                resolve(); // Always resolve — never block the game
            };

            this.synth!.speak(utterance);
        });
    }

    stop(): void {
        this.synth?.cancel();
    }

    isSpeaking(): boolean {
        return this.synth?.speaking ?? false;
    }

    dispose(): void {
        this.stop();
        this.synth = null;
        this.ready = false;
    }
}
