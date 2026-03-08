import { describe, expect, it } from 'vitest';

import { STTService } from './STTService';
import type {
  STTProvider,
  STTProviderOptions,
  STTProviderStatus,
  STTTranscript,
} from './STTProvider';

class FakeSTTProvider implements STTProvider {
  readonly name = 'FakeSTT';
  private ready = false;
  private listening = false;
  private status: STTProviderStatus = 'inactive';
  private statusCb: ((status: STTProviderStatus) => void) | null = null;
  private transcriptCb: ((transcript: STTTranscript) => void) | null = null;
  private errorCb: ((error: Error) => void) | null = null;

  async init(): Promise<boolean> {
    this.ready = true;
    return true;
  }

  isReady(): boolean {
    return this.ready;
  }

  getStatus(): STTProviderStatus {
    return this.status;
  }

  startListening(_options?: STTProviderOptions): void {
    this.listening = true;
    this.status = 'listening';
    this.statusCb?.(this.status);
    this.transcriptCb?.({ text: 'hello pip', isFinal: true, confidence: 0.95 });
  }

  stopListening(): void {
    this.listening = false;
    this.status = 'inactive';
    this.statusCb?.(this.status);
  }

  isListening(): boolean {
    return this.listening;
  }

  onTranscript(callback: (transcript: STTTranscript) => void): void {
    this.transcriptCb = callback;
  }

  onStatusChange(callback: (status: STTProviderStatus) => void): void {
    this.statusCb = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCb = callback;
    void this.errorCb;
  }

  dispose(): void {
    this.stopListening();
    this.ready = false;
  }
}

describe('STTService', () => {
  it('initializes provider and returns transcripts', async () => {
    const service = new STTService({
      createWebSpeechProvider: () => new FakeSTTProvider(),
    });

    const ready = await service.init({ provider: 'web-speech' });
    expect(ready).toBe(true);
    expect(service.status).toBe('ready');

    let transcriptText = '';
    service.onTranscript((t) => {
      transcriptText = t.text;
    });

    service.startListening();
    expect(service.isListening()).toBe(true);
    expect(service.status).toBe('listening');
    expect(transcriptText).toBe('hello pip');

    service.stopListening();
    expect(service.isListening()).toBe(false);
    expect(service.status).toBe('ready');

    service.dispose();
  });

  it('auto provider option queries runtimeUtils helper', async () => {
    // spy on the shared utility to ensure STTService delegates
    const runtime = await import('../../../utils/runtimeUtils');
    const spy = vi
      .spyOn(runtime, 'detectBestSTTProvider')
      .mockResolvedValue('web-speech');

    const service = new STTService({
      createWebSpeechProvider: () => new FakeSTTProvider(),
    });

    await service.init({ provider: 'auto' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('cloud provider without consent stays unavailable', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const service = new STTService({
      createWebSpeechProvider: () => new FakeSTTProvider(),
    });

    // force cloud; parent consent is always false by default
    const ready = await service.init({ provider: 'cloud' });
    expect(ready).toBe(false);
    expect(service.status).toBe('unavailable');
    expect(warnSpy).toHaveBeenCalledWith(
      '[STTService] Cloud STT requires parent consent',
    );
    warnSpy.mockRestore();
  });
});
