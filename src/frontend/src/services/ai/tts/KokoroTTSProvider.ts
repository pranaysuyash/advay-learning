/**
 * KokoroTTSProvider — Primary SOTA TTS using Kokoro-82M via kokoro-js.
 *
 * Runs 100% on-device using ONNX + WebGPU (with WASM fallback).
 * Model: onnx-community/Kokoro-82M-v1.0-ONNX (~45MB quantized)
 * Voice: "af_heart" (Grade A, friendly female — ideal for Pip mascot)
 *
 * @see https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
 */

import type { TTSProvider, TTSProviderOptions } from './TTSProvider';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const DEFAULT_VOICE = 'af_heart'; // Grade A, friendly female voice
const DEFAULT_DTYPE = 'q8'; // Good quality-to-size ratio (~45MB)
const SAMPLE_RATE = 24000; // Kokoro outputs 24kHz audio

export class KokoroTTSProvider implements TTSProvider {
    readonly name = 'Kokoro 82M (On-Device)';

    private tts: any = null; // KokoroTTS instance
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private ready = false;
    private loading = false;
    private speaking = false;

    async init(): Promise<boolean> {
        if (this.ready) return true;
        if (this.loading) return false;

        this.loading = true;

        try {
            // Dynamic import to avoid loading the heavy module at startup
            const { KokoroTTS } = await import('kokoro-js');

            // Detect WebGPU support
            const hasWebGPU =
                typeof navigator !== 'undefined' &&
                'gpu' in navigator &&
                !!(await (navigator as any).gpu?.requestAdapter?.());

            const device = hasWebGPU ? 'webgpu' : 'wasm';
            // Use fp32 for WebGPU (recommended), q8 for WASM (smaller/faster)
            const dtype = hasWebGPU ? 'fp32' : DEFAULT_DTYPE;

            console.log(`[KokoroTTS] Loading model (device=${device}, dtype=${dtype})...`);
            const startTime = performance.now();

            this.tts = await KokoroTTS.from_pretrained(MODEL_ID, {
                dtype,
                device,
            });

            const loadTime = ((performance.now() - startTime) / 1000).toFixed(1);
            console.log(`[KokoroTTS] Model loaded in ${loadTime}s (device=${device})`);

            // List available voices for debugging
            const voices = this.tts.list_voices?.();
            if (voices) {
                console.log(`[KokoroTTS] Available voices: ${voices.length}`);
            }

            this.ready = true;
            return true;
        } catch (error) {
            console.warn('[KokoroTTS] Failed to initialize:', error);
            return false;
        } finally {
            this.loading = false;
        }
    }

    isReady(): boolean {
        return this.ready;
    }

    async speak(text: string, options?: TTSProviderOptions): Promise<void> {
        if (!this.tts || !this.ready) return;

        // Stop any ongoing playback
        this.stop();

        try {
            this.speaking = true;

            // Generate audio waveform
            const voice = options?.voiceId || DEFAULT_VOICE;
            const result = await this.tts.generate(text, { voice });

            if (!result) {
                console.warn('[KokoroTTS] No audio generated');
                this.speaking = false;
                return;
            }

            // Play the generated audio via Web Audio API
            await this.playAudio(result, options?.volume ?? 1.0);
        } catch (error) {
            console.error('[KokoroTTS] Speech generation error:', error);
        } finally {
            this.speaking = false;
        }
    }

    private async playAudio(
        audioResult: any,
        volume: number,
    ): Promise<void> {
        return new Promise((resolve) => {
            try {
                // Create/reuse AudioContext
                if (!this.audioContext || this.audioContext.state === 'closed') {
                    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
                }

                // Resume if suspended (browser autoplay policy)
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                // Get the raw audio data from Kokoro result
                // kokoro-js generate() returns a RawAudio-like object
                let audioData: Float32Array;
                if (audioResult instanceof Float32Array) {
                    audioData = audioResult;
                } else if (audioResult?.audio instanceof Float32Array) {
                    audioData = audioResult.audio;
                } else if (audioResult?.data instanceof Float32Array) {
                    audioData = audioResult.data;
                } else if (audioResult?.audio?.data instanceof Float32Array) {
                    audioData = audioResult.audio.data;
                } else {
                    console.warn('[KokoroTTS] Unknown audio format:', typeof audioResult);
                    resolve();
                    return;
                }

                // Create audio buffer
                const buffer = this.audioContext.createBuffer(
                    1, // mono
                    audioData.length,
                    SAMPLE_RATE,
                );
                buffer.getChannelData(0).set(audioData);

                // Create gain node for volume control
                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = volume;
                gainNode.connect(this.audioContext.destination);

                // Create and start source
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(gainNode);

                source.onended = () => {
                    this.currentSource = null;
                    resolve();
                };

                this.currentSource = source;
                source.start(0);
            } catch (error) {
                console.error('[KokoroTTS] Audio playback error:', error);
                resolve();
            }
        });
    }

    stop(): void {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch {
                // Already stopped
            }
            this.currentSource = null;
        }
        this.speaking = false;
    }

    isSpeaking(): boolean {
        return this.speaking;
    }

    dispose(): void {
        this.stop();
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
        this.tts = null;
        this.ready = false;
    }
}
