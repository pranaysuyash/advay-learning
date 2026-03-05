import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { LLMService, buildDefaultRuntimeConfigFromEnv } from './LLMService';

describe('LLMService', () => {
  it('selects primary browser plan when WebGPU is available', () => {
    const service = new LLMService();
    const plan = service.selectRuntimePlan({
      isBrowser: true,
      hasWebGPU: true,
      isMobile: false,
      hasLocalOllama: false,
      cloudFallbackEnabled: false,
      parentConsent: false,
    });

    expect(plan.provider).toBe('transformers-js');
    expect(plan.model).toBe('qwen3.5-1.5b-instruct');
  });

  it('selects lightweight mobile model on browser mobile profile', () => {
    const service = new LLMService();
    const plan = service.selectRuntimePlan({
      isBrowser: true,
      hasWebGPU: true,
      isMobile: true,
      hasLocalOllama: false,
      cloudFallbackEnabled: false,
      parentConsent: false,
    });

    expect(plan.provider).toBe('transformers-js');
    expect(plan.model).toBe('qwen3.5-0.5b-instruct');
  });

  it('selects cloud fallback only with parent consent', () => {
    const service = new LLMService();
    const plan = service.selectRuntimePlan({
      isBrowser: false,
      hasWebGPU: false,
      isMobile: false,
      hasLocalOllama: false,
      cloudFallbackEnabled: true,
      parentConsent: true,
    });

    expect(plan.provider).toBe('hf-inference');
    expect(plan.model).toBe('qwen3.5-3b-instruct');
  });

  it('returns child-safe mock response text through contract', async () => {
    const service = new LLMService({ enabled: true, provider: 'mock' });

    const response = await service.generateText({
      prompt: 'hello pip',
      category: 'greeting',
    });

    expect(response.text.length).toBeGreaterThan(0);
    expect(response.source).toBe('mock');
    expect(response.provider).toBe('mock');
    expect(response.model).toBe('qwen3.5-1.5b-instruct');
  });

  it('falls back to mock when configured provider is unavailable', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const service = new LLMService({
      enabled: true,
      provider: 'web-llm',
      model: 'qwen3.5-3b-instruct',
      fallbackModel: 'qwen3.5-0.5b-instruct',
    });

    const response = await service.generateText({
      prompt: 'tell me a fun story',
    });

    expect(response.provider).toBe('mock');
    expect(response.source).toBe('mock');
    expect(response.text.length).toBeGreaterThan(0);

    warnSpy.mockRestore();
  });

  it('uses environment variables to enable service via feature flag', () => {
    // provide a custom env object instead of relying on import.meta.env
    const cfg: any = buildDefaultRuntimeConfigFromEnv({
      VITE_FEATURE_AI_LLM_RESPONSES_V1: 'true',
      VITE_AI_LLM_ENABLED: 'false',
    });
    expect(cfg.enabled).toBe(true);
  });

  // WebLLM provider tests
  describe('WebLLMLLMProvider', () => {
    it('is not ready if runtime cannot be imported', async () => {
      const { WebLLMLLMProvider } =
        await import('./providers/WebLLMLLMProvider');
      const provider = new WebLLMLLMProvider('qwen3.5-1.5b-instruct');
      expect(provider.isReady()).toBe(false);
      const ready = await provider.init();
      expect(ready).toBe(false);
      expect(provider.isReady()).toBe(false);
    });
  });
});
