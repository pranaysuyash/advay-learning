/**
 * STTProvider Interface
 *
 * Defines the contract for Speech-to-Text providers. Allows strategy-pattern
 * switching between Whisper.cpp (WASM) and Web Speech API (browser fallback).
 */

export interface STTProviderOptions {
    /** Language code (e.g., 'en-US', 'hi-IN') */
    language?: string;
    /** Enable continuous recognition */
    continuous?: boolean;
    /** Return interim results */
    interimResults?: boolean;
    /** Maximum silence duration in ms */
    maxSilenceDuration?: number;
    /** Maximum recording duration in seconds */
    maxDuration?: number;
}

export interface STTTranscript {
    /** The transcribed text */
    text: string;
    /** Whether this is a final result or interim */
    isFinal: boolean;
    /** Confidence score 0-1 */
    confidence: number;
    /** Word-level timestamps (if available) */
    words?: Array<{
        word: string;
        start: number;
        end: number;
    }>;
}

export type STTProviderStatus = 'inactive' | 'listening' | 'processing' | 'error';

export interface STTProvider {
    /** Human-readable name of this provider */
    readonly name: string;

    /** Initialize the provider (load model, etc). Returns true if ready. */
    init(): Promise<boolean>;

    /** Whether the provider is ready to recognize */
    isReady(): boolean;

    /** Current status of the provider */
    getStatus(): STTProviderStatus;

    /** Start listening for speech */
    startListening(options?: STTProviderOptions): void;

    /** Stop listening */
    stopListening(): void;

    /** Whether the provider is currently listening */
    isListening(): boolean;

    /** Register callback for transcript results */
    onTranscript(callback: (transcript: STTTranscript) => void): void;

    /** Register callback for status changes */
    onStatusChange(callback: (status: STTProviderStatus) => void): void;

    /** Register callback for errors */
    onError(callback: (error: Error) => void): void;

    /** Dispose of resources */
    dispose(): void;
}
