/**
 * WhisperSTTProvider - Local Whisper ASR using Transformers.js
 *
 * Runs Whisper locally in the browser using WebGPU for acceleration.
 * Primary STT provider - privacy-first, works offline after model download.
 *
 * Model: Xenova/distil-whisper-tiny (39M params, ~75MB download)
 * Better accuracy than Web Speech API, especially on child voices.
 */

import type {
  STTProvider,
  STTProviderOptions,
  STTTranscript,
  STTProviderStatus,
} from './STTProvider';

type WhisperPipelineInstance = {
  audio: (audio: Float32Array) => Promise<{ text: string }>;
};

type PipelineFactory = (
  task: string,
  model: string,
  options?: Record<string, unknown>,
) => Promise<WhisperPipelineInstance>;

let transformersPipeline: PipelineFactory | null = null;

async function loadPipeline(): Promise<PipelineFactory> {
  if (!transformersPipeline) {
    const transformers = await import('@huggingface/transformers');
    transformersPipeline = (transformers as any).pipeline as PipelineFactory;
  }
  return transformersPipeline;
}

export class WhisperSTTProvider implements STTProvider {
  readonly name = 'Whisper';

  private pipeline: WhisperPipelineInstance | null = null;
  private _isReady = false;
  private _isListening = false;
  private _status: STTProviderStatus = 'inactive';
  private transcriptCallback: ((transcript: STTTranscript) => void) | null =
    null;
  private statusChangeCallback: ((status: STTProviderStatus) => void) | null =
    null;
  private errorCallback: ((error: Error) => void) | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async init(): Promise<boolean> {
    try {
      this._status = 'inactive';
      console.log('[WhisperSTT] Loading Whisper model...');

      const pipeline = await loadPipeline();

      this.pipeline = await pipeline(
        'automatic-speech-recognition',
        'Xenova/distil-whisper-tiny.en',
        {
          device: 'webgpu',
          dtype: 'q4',
          progress_callback: (progress: { progress: number; unit: string }) => {
            console.log(
              `[WhisperSTT] Loading: ${Math.round(progress.progress)}% ${progress.unit}`,
            );
          },
        },
      );

      this._isReady = true;
      this._status = 'inactive';
      console.log('[WhisperSTT] Model loaded successfully');
      return true;
    } catch (e) {
      console.error('[WhisperSTT] Failed to load model:', e);
      this._status = 'error';
      this.errorCallback?.(e instanceof Error ? e : new Error(String(e)));
      return false;
    }
  }

  isReady(): boolean {
    return this._isReady && !!this.pipeline;
  }

  getStatus(): STTProviderStatus {
    return this._status;
  }

  private setStatus(status: STTProviderStatus): void {
    this._status = status;
    this.statusChangeCallback?.(status);
  }

  startListening(_options?: STTProviderOptions): void {
    if (!this.isReady()) {
      this.errorCallback?.(new Error('Whisper not ready'));
      return;
    }

    this._isListening = true;
    this.audioChunks = [];
    this.setStatus('listening');

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.stream = stream;
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          await this.processAudio();
        };

        this.mediaRecorder.start(1000);
      })
      .catch((e) => {
        console.error('[WhisperSTT] Mic error:', e);
        this._isListening = false;
        this.setStatus('error');
        this.errorCallback?.(e instanceof Error ? e : new Error(String(e)));
      });
  }

  private async processAudio(): Promise<void> {
    if (!this.pipeline || this.audioChunks.length === 0) return;

    this.setStatus('processing');

    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const float32Array = new Float32Array(channelData);

      const result = await this.pipeline.audio(float32Array);

      this.transcriptCallback?.({
        text: result.text.trim(),
        isFinal: true,
        confidence: 0.8,
      });

      this.setStatus('inactive');
    } catch (e) {
      console.error('[WhisperSTT] Processing error:', e);
      this.setStatus('error');
    }

    this.audioChunks = [];
  }

  stopListening(): void {
    this._isListening = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.setStatus('inactive');
  }

  isListening(): boolean {
    return this._isListening;
  }

  onTranscript(callback: (transcript: STTTranscript) => void): void {
    this.transcriptCallback = callback;
  }

  onStatusChange(callback: (status: STTProviderStatus) => void): void {
    this.statusChangeCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  dispose(): void {
    this.stopListening();
    this.transcriptCallback = null;
    this.statusChangeCallback = null;
    this.errorCallback = null;
    this.pipeline = null;
    this._isReady = false;
  }
}
