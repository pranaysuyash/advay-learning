import { describe, expect, it } from 'vitest';

import {
  isBrowser,
  isMobile,
  detectBestSTTProvider,
  selectLLMRuntimePlan,
  RuntimeEnv,
  isTestEnv,
} from './runtimeUtils';

// basic sanity tests for the helpers that don't require a DOM

describe('runtimeUtils generic helpers', () => {
  it('isTestEnv returns true when MODE=test', () => {
    const original = (import.meta as any).env.MODE;
    (import.meta as any).env.MODE = 'test';
    expect(isTestEnv()).toBe(true);
    (import.meta as any).env.MODE = original;
  });

  it('isBrowser is false in node-like environment', () => {
    // make doubly sure no browser globals are present
    delete (globalThis as any).window;
    delete (globalThis as any).navigator;
    expect(isBrowser()).toBe(false);
  });
});

// STT provider selection rules

describe('STT provider detection', () => {
  afterEach(() => {
    // clear any accidental browser globals that might have been added by other tests
    delete (globalThis as any).window;
    delete (globalThis as any).navigator;
  });

  it('prefers whisper when GPU available on desktop', async () => {
    const provider = await detectBestSTTProvider({
      isBrowser: true,
      hasWebGPU: true,
      isMobile: false,
    });
    expect(provider).toBe('whisper');
  });

  it('chooses web-speech when browser without GPU', async () => {
    const provider = await detectBestSTTProvider({
      isBrowser: true,
      hasWebGPU: false,
      isMobile: false,
      hasWebSpeech: true,
    });
    expect(provider).toBe('web-speech');
  });

  it('falls back to cloud in non-browser env', async () => {
    const provider = await detectBestSTTProvider({
      isBrowser: false,
    });
    expect(provider).toBe('cloud');
  });
});

// LLM runtime plan rules

describe('LLM runtime plan selection', () => {
  const baseEnv: RuntimeEnv = {
    isBrowser: false,
    hasWebGPU: false,
    isMobile: false,
    hasLocalOllama: false,
    cloudFallbackEnabled: false,
    parentConsent: false,
  };

  it('returns mock when nothing available', () => {
    const plan = selectLLMRuntimePlan(baseEnv);
    expect(plan.provider).toBe('mock');
  });

  it('returns transformers-js primary model on desktop browser with GPU', () => {
    const plan = selectLLMRuntimePlan({
      ...baseEnv,
      isBrowser: true,
      hasWebGPU: true,
    });
    expect(plan.provider).toBe('transformers-js');
    expect(plan.model).toBe('qwen3.5-1.5b-instruct');
  });

  it('returns cloud when fallback enabled and consent given', () => {
    const plan = selectLLMRuntimePlan({
      ...baseEnv,
      cloudFallbackEnabled: true,
      parentConsent: true,
    });
    expect(plan.provider).toBe('hf-inference');
  });
});
