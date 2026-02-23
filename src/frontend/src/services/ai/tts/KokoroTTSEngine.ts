/**
 * KokoroTTSEngine — In-browser neural TTS using Kokoro-82M
 *
 * Tier 2 of the three-tier TTS strategy. Uses kokoro-js in a Web Worker
 * for off-main-thread inference. Generates natural-sounding speech
 * using the 82M-parameter Kokoro model running via ONNX Runtime Web.
 *
 * @see docs/TTS_EVALUATION.md
 * @see docs/research/LOCAL_TTS_STRATEGY.md
 */

export type KokoroStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface KokoroLoadProgress {
    percent: number;
}

export type KokoroEventCallback = (event: {
    type: 'progress' | 'ready' | 'error';
    percent?: number;
    message?: string;
}) => void;

export class KokoroTTSEngine {
    private worker: Worker | null = null;
    private status: KokoroStatus = 'idle';
    private loadProgress: number = 0;
    private listeners: Set<KokoroEventCallback> = new Set();
    private audioContext: AudioContext | null = null;

    /**
     * Get current engine status
     */
    getStatus(): KokoroStatus {
        return this.status;
    }

    /**
     * Get model loading progress (0-100)
     */
    getLoadProgress(): number {
        return this.loadProgress;
    }

    /**
     * Whether the engine is ready for speech generation
     */
    isReady(): boolean {
        return this.status === 'ready';
    }

    /**
     * Subscribe to engine events (progress, ready, error)
     */
    on(callback: KokoroEventCallback): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private emit(event: Parameters<KokoroEventCallback>[0]): void {
        for (const cb of this.listeners) {
            try {
                cb(event);
            } catch {
                // Don't let listener errors break the engine
            }
        }
    }

    /**
     * Initialize the Kokoro model in a Web Worker.
     * Safe to call multiple times — subsequent calls are no-ops.
     */
    async init(): Promise<void> {
        if (this.status === 'loading' || this.status === 'ready') return;

        // Check for basic compatibility
        if (typeof Worker === 'undefined') {
            this.status = 'error';
            console.warn('[KokoroTTS] Web Workers not supported');
            return;
        }

        this.status = 'loading';
        this.loadProgress = 0;

        try {
            // Create Web Worker using Vite's worker import syntax
            this.worker = new Worker(
                new URL('./tts.worker.ts', import.meta.url),
                { type: 'module' },
            );

            // Listen for worker messages
            this.worker.onmessage = (e: MessageEvent) => {
                const { type, percent, message } = e.data;

                switch (type) {
                    case 'progress':
                        this.loadProgress = percent;
                        this.emit({ type: 'progress', percent });
                        break;
                    case 'ready':
                        this.status = 'ready';
                        this.loadProgress = 100;
                        this.emit({ type: 'ready' });
                        console.log('[KokoroTTS] Model ready');
                        break;
                    case 'error':
                        this.status = 'error';
                        this.emit({ type: 'error', message });
                        console.error('[KokoroTTS] Error:', message);
                        break;
                }
            };

            this.worker.onerror = (err) => {
                this.status = 'error';
                this.emit({ type: 'error', message: err.message });
                console.error('[KokoroTTS] Worker error:', err);
            };

            // Start model loading
            this.worker.postMessage({ type: 'init' });
        } catch (err) {
            this.status = 'error';
            console.error('[KokoroTTS] Failed to create worker:', err);
        }
    }

    /**
     * Generate speech audio for the given text.
     * Resolves when audio has been played.
     */
    async speak(text: string, volume: number = 1.0, voice?: string): Promise<void> {
        if (!this.worker || this.status !== 'ready') {
            throw new Error('[KokoroTTS] Engine not ready');
        }

        return new Promise<void>((resolve, reject) => {
            const handler = (e: MessageEvent) => {
                const { type, audioData, sampleRate, message } = e.data;

                if (type === 'audio') {
                    this.worker!.removeEventListener('message', handler);
                    this.playAudioBuffer(audioData, sampleRate, volume)
                        .then(resolve)
                        .catch(reject);
                } else if (type === 'error') {
                    this.worker!.removeEventListener('message', handler);
                    reject(new Error(message));
                }
            };

            this.worker!.addEventListener('message', handler);
            this.worker!.postMessage({ type: 'generate', text, voice });
        });
    }

    /**
     * Play a Float32Array audio buffer through the Web Audio API
     */
    private async playAudioBuffer(
        audioData: Float32Array,
        sampleRate: number,
        volume: number,
    ): Promise<void> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const buffer = this.audioContext.createBuffer(1, audioData.length, sampleRate);
        buffer.copyToChannel(new Float32Array(audioData), 0);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // Volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = Math.max(0, Math.min(1, volume));

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        return new Promise<void>((resolve) => {
            source.onended = () => resolve();
            source.start();
        });
    }

    /**
     * Stop playback (closes audio context)
     */
    stop(): void {
        if (this.audioContext) {
            this.audioContext.close().catch(() => { });
            this.audioContext = null;
        }
    }

    /**
     * Dispose of the engine and worker
     */
    dispose(): void {
        this.stop();
        if (this.worker) {
            this.worker.postMessage({ type: 'dispose' });
            this.worker.terminate();
            this.worker = null;
        }
        this.status = 'idle';
        this.loadProgress = 0;
        this.listeners.clear();
    }
}

export default KokoroTTSEngine;
