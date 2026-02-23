/**
 * tts.worker.ts — Web Worker for Kokoro-82M TTS inference
 *
 * Runs model loading and audio generation off the main thread
 * to avoid blocking the UI. Communicates via postMessage.
 *
 * Messages IN:
 *   { type: 'init', voice?: string }         → Load model
 *   { type: 'generate', text: string, voice?: string } → Synthesize
 *   { type: 'dispose' }                      → Cleanup
 *
 * Messages OUT:
 *   { type: 'ready' }
 *   { type: 'progress', percent: number }
 *   { type: 'audio', audioData: Float32Array, sampleRate: number }
 *   { type: 'error', message: string }
 */

// Kokoro-js provides the KokoroTTS class
import { KokoroTTS } from 'kokoro-js';

let ttsInstance: any = null;

self.onmessage = async (e: MessageEvent) => {
    const { type, text, voice } = e.data;

    switch (type) {
        case 'init': {
            try {
                self.postMessage({ type: 'progress', percent: 10 });

                // Load Kokoro model — kokoro-js handles ONNX/WASM/WebGPU automatically
                // Uses "onnx-community/Kokoro-82M-v1.0-ONNX" by default
                ttsInstance = await KokoroTTS.from_pretrained(
                    'onnx-community/Kokoro-82M-v1.0-ONNX',
                    {
                        dtype: 'q8',  // INT8 quantisation for smaller download
                    },
                );

                self.postMessage({ type: 'progress', percent: 100 });
                self.postMessage({ type: 'ready' });
            } catch (err) {
                self.postMessage({
                    type: 'error',
                    message: `Model load failed: ${(err as Error).message}`,
                });
            }
            break;
        }

        case 'generate': {
            if (!ttsInstance) {
                self.postMessage({ type: 'error', message: 'Model not loaded' });
                return;
            }

            try {
                // Generate audio — kokoro-js returns an object with audio data
                const result = await ttsInstance.generate(text, {
                    voice: voice || 'af_heart', // Default: friendly female voice
                });

                // result.audio is a Float32Array, result.sampling_rate is the sample rate
                self.postMessage(
                    {
                        type: 'audio',
                        audioData: result.audio,
                        sampleRate: result.sampling_rate || 24000,
                    },
                    // Transfer the buffer for zero-copy performance
                    [result.audio.buffer],
                );
            } catch (err) {
                self.postMessage({
                    type: 'error',
                    message: `Generation failed: ${(err as Error).message}`,
                });
            }
            break;
        }

        case 'dispose': {
            ttsInstance = null;
            self.postMessage({ type: 'disposed' });
            break;
        }
    }
};
