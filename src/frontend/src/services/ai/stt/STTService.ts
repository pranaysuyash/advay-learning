/**
 * STTService - Three-tier Speech-to-Text Service
 *
 * Provides speech recognition for children to talk to Pip using a three-tier strategy:
 *   1. Whisper (Transformers.js) - Local, privacy-first, offline capable - PRIMARY
 *   2. Web Speech API - Browser native fallback
 *   3. Cloud APIs - Last resort with parent consent
 *
 * @see docs/research/STT_PROVIDER_SURVEY_2026-03-05.md
 * @see speech_experiments/model-lab/ASR_MODEL_RESEARCH_2026-02.md
 */

import type {
  STTProvider,
  STTProviderOptions,
  STTTranscript,
  STTProviderStatus,
} from './STTProvider';
import { WhisperSTTProvider } from './WhisperSTTProvider';
import { WebSpeechSTTProvider } from './WebSpeechSTTProvider';

export interface STTServiceOptions {
  /** Preferred provider: 'auto' | 'whisper' | 'web-speech' | 'cloud' */
  provider?: 'auto' | 'whisper' | 'web-speech' | 'cloud';
  /** Default language */
  language?: string;
  /** Enable continuous mode */
  continuous?: boolean;
  /** Return interim results */
  interimResults?: boolean;
}

export type STTServiceStatus =
  | 'unavailable'
  | 'ready'
  | 'listening'
  | 'processing'
  | 'error';

const DEFAULT_OPTIONS: Required<STTServiceOptions> = {
  provider: 'auto',
  language: 'en-US',
  continuous: false,
  interimResults: true,
};

export interface STTServiceDependencies {
  createWhisperProvider?: () => STTProvider;
  createWebSpeechProvider?: () => STTProvider;
}

export class STTService {
  private provider: STTProvider | null = null;
  private fallbackProvider: STTProvider | null = null;
  private options: Required<STTServiceOptions>;
  private _status: STTServiceStatus = 'unavailable';
  private statusListeners: Set<(status: STTServiceStatus) => void> = new Set();
  private transcriptListeners: Set<(transcript: STTTranscript) => void> =
    new Set();
  private readonly deps: Required<STTServiceDependencies>;

  constructor(deps: STTServiceDependencies = {}) {
    this.options = { ...DEFAULT_OPTIONS };
    this.deps = {
      createWhisperProvider:
        deps.createWhisperProvider ?? (() => new WhisperSTTProvider()),
      createWebSpeechProvider:
        deps.createWebSpeechProvider ?? (() => new WebSpeechSTTProvider()),
    };
  }

  async init(options?: STTServiceOptions): Promise<boolean> {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    if (this.options.provider === 'auto') {
      // delegate to shared runtime utility which encapsulates the
      // whisper/web‑speech/cloud decision logic used across the project
      const { detectBestSTTProvider } =
        await import('../../../utils/runtimeUtils');
      this.options.provider = await detectBestSTTProvider();
    }

    await this.initializeProvider();

    if (this._status === 'unavailable' && this.options.provider === 'whisper') {
      console.log(
        '[STTService] Whisper unavailable, trying Web Speech fallback...',
      );
      this.options.provider = 'web-speech';
      await this.initializeProvider();
    }

    return this._status !== 'unavailable';
  }

  // `detectBestProvider` logic has been moved into the shared
  // runtimeUtils module. The old implementation is left here as a
  // comment for historical reference and will be removed once all
  // callers are updated.

  /*
  private async detectBestProvider(): Promise<
    'whisper' | 'web-speech' | 'cloud'
  > {
    if (typeof window === 'undefined') {
      return 'cloud';
    }

    // delegate to shared runtime utility
    const { hasWebGPU, isMobile } = await import('../../utils/runtimeUtils').then(m => ({
      hasWebGPU: m.hasWebGPU(),
      isMobile: m.isMobile(),
    }));

    if (await hasWebGPU) {
      return 'whisper';
    }

    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };

    if (win.SpeechRecognition || win.webkitSpeechRecognition) {
      return 'web-speech';
    }

    return 'cloud';
  }
  */

  private async initializeProvider(): Promise<void> {
    switch (this.options.provider) {
      case 'whisper':
        this.provider = this.deps.createWhisperProvider();
        break;
      case 'web-speech':
        this.provider = this.deps.createWebSpeechProvider();
        break;
      case 'cloud':
        console.warn('[STTService] Cloud STT requires parent consent');
        this._status = 'unavailable';
        return;
      default:
        console.error('[STTService] Unknown provider:', this.options.provider);
        this._status = 'unavailable';
        return;
    }

    this.provider.onStatusChange((status) => {
      this.updateStatus(status);
    });

    this.provider.onTranscript((transcript) => {
      this.transcriptListeners.forEach((cb) => cb(transcript));
    });

    this.provider.onError((error) => {
      console.error('[STTService] Provider error:', error);
      this._status = 'error';
    });

    const ready = await this.provider.init();

    if (ready) {
      this._status = 'ready';
    } else {
      this._status = 'unavailable';
    }
  }

  private updateStatus(providerStatus: STTProviderStatus): void {
    switch (providerStatus) {
      case 'inactive':
        this._status = 'ready';
        break;
      case 'listening':
        this._status = 'listening';
        break;
      case 'processing':
        this._status = 'processing';
        break;
      case 'error':
        this._status = 'error';
        break;
    }

    this.statusListeners.forEach((cb) => cb(this._status));
  }

  startListening(options?: STTProviderOptions): void {
    if (!this.provider || this._status === 'unavailable') {
      console.warn('[STTService] Not ready, call init() first');
      return;
    }

    const mergedOptions: STTProviderOptions = {
      language: this.options.language,
      continuous: this.options.continuous,
      interimResults: this.options.interimResults,
      ...options,
    };

    this.provider.startListening(mergedOptions);
  }

  stopListening(): void {
    this.provider?.stopListening();
  }

  isListening(): boolean {
    return this.provider?.isListening() ?? false;
  }

  get status(): STTServiceStatus {
    return this._status;
  }

  get providerName(): string {
    return this.provider?.name ?? 'none';
  }

  onStatusChange(callback: (status: STTServiceStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this._status);
    return () => this.statusListeners.delete(callback);
  }

  onTranscript(callback: (transcript: STTTranscript) => void): () => void {
    this.transcriptListeners.add(callback);
    return () => this.transcriptListeners.delete(callback);
  }

  dispose(): void {
    this.provider?.dispose();
    this.fallbackProvider?.dispose();
    this.provider = null;
    this.fallbackProvider = null;
    this.statusListeners.clear();
    this.transcriptListeners.clear();
    this._status = 'unavailable';
  }
}

export const sttService = new STTService();
