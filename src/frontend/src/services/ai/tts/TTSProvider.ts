/**
 * TTSProvider Interface
 *
 * Defines the contract for TTS providers. Allows strategy-pattern
 * switching between Kokoro (WebGPU) and Web Speech API (browser fallback).
 */

export interface TTSProviderOptions {
    /** Speech rate: 0.1 to 10 (default: 1.0) */
    rate?: number;
    /** Voice pitch: 0 to 2 (default: 1.0) */
    pitch?: number;
    /** Volume: 0 to 1 (default: 1.0) */
    volume?: number;
    /** Language code (e.g., 'en-US', 'hi-IN') */
    lang?: string;
    /** Preferred voice/speaker ID */
    voiceId?: string;
}

export interface TTSProvider {
    /** Human-readable name of this provider */
    readonly name: string;

    /** Initialize the provider (load model, etc). Returns true if ready. */
    init(): Promise<boolean>;

    /** Whether the provider is ready to speak */
    isReady(): boolean;

    /** Speak text. Resolves when speech completes or is cancelled. */
    speak(text: string, options?: TTSProviderOptions): Promise<void>;

    /** Stop any ongoing speech */
    stop(): void;

    /** Whether the provider is currently speaking */
    isSpeaking(): boolean;

    /** Dispose of resources (model, audio context, etc) */
    dispose(): void;
}
