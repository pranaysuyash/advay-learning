import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { LLMService, buildDefaultRuntimeConfigFromEnv } from './LLMService';
import type { LLMUsageEvent } from './LLMService';

describe('LLMService', () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = (import.meta as any).env;

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    (import.meta as any).env = originalEnv;
  });

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

  it('selects ollama plan when local runtime exists and browser paths do not apply', () => {
    const service = new LLMService();
    const plan = service.selectRuntimePlan({
      isBrowser: false,
      hasWebGPU: false,
      isMobile: false,
      hasLocalOllama: true,
      cloudFallbackEnabled: false,
      parentConsent: false,
    });

    expect(plan.provider).toBe('ollama');
    expect(plan.model).toBe('qwen3.5-1.5b-instruct');
  });

  it('falls back to mock plan when no runtime is available', () => {
    const service = new LLMService();
    const plan = service.selectRuntimePlan({
      isBrowser: false,
      hasWebGPU: false,
      isMobile: false,
      hasLocalOllama: false,
      cloudFallbackEnabled: false,
      parentConsent: false,
    });

    expect(plan.provider).toBe('mock');
    expect(plan.model).toBe('qwen3.5-0.5b-instruct');
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

  it('blocks cloud fallback when consent is missing and falls back to mock', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const service = new LLMService({
      enabled: true,
      provider: 'hf-inference',
      model: 'qwen3.5-3b-instruct',
      cloudFallbackEnabled: true,
      parentConsent: false,
    });

    const response = await service.generateText({ prompt: 'cloud request' });

    expect(response.provider).toBe('mock');
    expect(response.source).toBe('mock');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('emits usage events with reason metadata', async () => {
    const service = new LLMService({
      enabled: true,
      provider: 'mock',
    });

    const events: LLMUsageEvent[] = [];
    const unsubscribe = service.subscribeUsage((event) => events.push(event));

    await service.generateText({ prompt: 'hello there', category: 'greeting' });

    unsubscribe();

    expect(events.length).toBe(1);
    expect(events[0].reason).toBe('category_mock');
    expect(events[0].provider).toBe('mock');
    expect(events[0].timestamp).toBeTruthy();
  });

  it('applyRuntimePlan updates service config', () => {
    const service = new LLMService({
      provider: 'mock',
      model: 'qwen3.5-0.5b-instruct',
    });

    service.applyRuntimePlan({
      provider: 'transformers-js',
      model: 'qwen3.5-1.5b-instruct',
      reason: 'test',
    });

    const cfg = service.getConfig();
    expect(cfg.provider).toBe('transformers-js');
    expect(cfg.model).toBe('qwen3.5-1.5b-instruct');
  });

  it('setEnabled and updateConfig mutate config contract safely', () => {
    const service = new LLMService({ enabled: false });
    expect(service.isEnabled()).toBe(false);

    service.setEnabled(true);
    expect(service.isEnabled()).toBe(true);

    service.updateConfig({ maxResponseLength: 77, fallbackModel: 'qwen3.5-3b-instruct' });
    const cfg = service.getConfig();
    expect(cfg.maxResponseLength).toBe(77);
    expect(cfg.fallbackModel).toBe('qwen3.5-3b-instruct');
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

  it('returns waiting response when service is disabled regardless of input category', async () => {
    const service = new LLMService({ enabled: false, provider: 'mock' });

    const response = await service.generateText({
      prompt: 'hello',
      category: 'greeting',
    });

    expect(response.provider).toBe('mock');
    expect(response.source).toBe('mock');
    expect(response.text.length).toBeGreaterThan(0);
    expect(response.cached).toBe(false);
  });

  it('limits output length using maxResponseLength for category responses', async () => {
    const service = new LLMService({
      enabled: true,
      provider: 'mock',
      maxResponseLength: 8,
    });

    const response = await service.generateText({
      prompt: 'say something encouraging',
      category: 'encouragement',
    });

    expect(response.text.length).toBeLessThanOrEqual(8);
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
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('uses Ollama provider end-to-end when runtime is reachable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ models: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'Hello from Ollama!' }),
      });
    globalThis.fetch = fetchMock as any;

    const service = new LLMService({
      enabled: true,
      provider: 'ollama',
      model: 'qwen3.5-1.5b-instruct',
      maxResponseLength: 200,
    });

    const response = await service.generateText({ prompt: 'Tell me a story' });

    expect(response.provider).toBe('ollama');
    expect(response.source).toBe('local');
    expect(response.text).toBe('Hello from Ollama!');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reuses cached provider adapter between Ollama generations', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ models: [] }) })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Ollama response' }),
      });
    globalThis.fetch = fetchMock as any;

    const service = new LLMService({
      enabled: true,
      provider: 'ollama',
      model: 'qwen3.5-1.5b-instruct',
    });

    await service.generateText({ prompt: 'first' });
    await service.generateText({ prompt: 'second' });

    // 1 call for init (/api/tags) + 2 calls for generate
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('falls back to mock when Ollama generate request fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ models: [] }) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    globalThis.fetch = fetchMock as any;

    const service = new LLMService({
      enabled: true,
      provider: 'ollama',
      model: 'qwen3.5-1.5b-instruct',
      fallbackModel: 'qwen3.5-0.5b-instruct',
    });

    const response = await service.generateText({ prompt: 'fallback test' });

    expect(response.provider).toBe('mock');
    expect(response.source).toBe('mock');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('uses HF inference provider when a ready adapter is available', async () => {
    const { HFInferenceLLMProvider } = await import(
      './providers/HFInferenceLLMProvider'
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ generated_text: 'HF generated text' }],
    });
    globalThis.fetch = fetchMock as any;

    const service = new LLMService({
      enabled: true,
      provider: 'hf-inference',
      model: 'qwen3.5-3b-instruct',
      cloudFallbackEnabled: true,
      parentConsent: true,
    });

    const adapter = new HFInferenceLLMProvider(
      'qwen3.5-3b-instruct',
      'test-hf-token',
    );
    await adapter.init();

    (service as any).providers.set('hf-inference:qwen3.5-3b-instruct', adapter);

    const response = await service.generateText({ prompt: 'generate' });

    expect(response.provider).toBe('hf-inference');
    expect(response.source).toBe('cloud');
    expect(response.text).toBe('HF generated text');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to mock when HF token is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (import.meta as any).env = {
      ...(originalEnv ?? {}),
      VITE_HF_API_KEY: undefined,
    };

    const service = new LLMService({
      enabled: true,
      provider: 'hf-inference',
      model: 'qwen3.5-3b-instruct',
      cloudFallbackEnabled: true,
      parentConsent: true,
    });

    const response = await service.generateText({ prompt: 'no token path' });

    expect(response.provider).toBe('mock');
    expect(response.source).toBe('mock');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns non-zero latency and ISO timestamp in responses', async () => {
    const service = new LLMService({ enabled: true, provider: 'mock' });
    const response = await service.generateText({ prompt: 'hello there' });

    expect(response.latencyMs).toBeGreaterThan(0);
    expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('uses environment variables to enable service via feature flag', () => {
    // provide a custom env object instead of relying on import.meta.env
    const cfg: any = buildDefaultRuntimeConfigFromEnv({
      VITE_FEATURE_AI_LLM_RESPONSES_V1: 'true',
      VITE_AI_LLM_ENABLED: 'false',
    });
    expect(cfg.enabled).toBe(true);
  });

  it('parses env values and falls back for invalid provider/model/length', () => {
    const cfg: any = buildDefaultRuntimeConfigFromEnv({
      VITE_FEATURE_AI_LLM_RESPONSES_V1: 'false',
      VITE_AI_LLM_ENABLED: 'true',
      VITE_AI_LLM_PROVIDER: 'not-a-provider',
      VITE_AI_LLM_MODEL: 'not-a-model',
      VITE_AI_LLM_FALLBACK_MODEL: 'also-invalid',
      VITE_AI_MAX_RESPONSE_LENGTH: '-12',
      VITE_AI_CLOUD_FALLBACK_ENABLED: 'invalid',
      VITE_AI_PARENT_CONSENT: 'invalid',
    });

    expect(cfg.enabled).toBe(true);
    expect(cfg.provider).toBe('mock');
    expect(cfg.model).toBe('qwen3.5-1.5b-instruct');
    expect(cfg.fallbackModel).toBe('qwen3.5-0.5b-instruct');
    expect(cfg.maxResponseLength).toBe(220);
    expect(cfg.cloudFallbackEnabled).toBe(false);
    expect(cfg.parentConsent).toBe(false);
  });

  it('accepts valid env provider/model and max length values', () => {
    const cfg: any = buildDefaultRuntimeConfigFromEnv({
      VITE_AI_LLM_ENABLED: 'true',
      VITE_AI_LLM_PROVIDER: 'ollama',
      VITE_AI_LLM_MODEL: 'qwen3.5-7b-instruct',
      VITE_AI_LLM_FALLBACK_MODEL: 'smollm3-3b-instruct',
      VITE_AI_MAX_RESPONSE_LENGTH: '512',
      VITE_AI_CLOUD_FALLBACK_ENABLED: 'true',
      VITE_AI_PARENT_CONSENT: 'true',
    });

    expect(cfg.enabled).toBe(true);
    expect(cfg.provider).toBe('ollama');
    expect(cfg.model).toBe('qwen3.5-7b-instruct');
    expect(cfg.fallbackModel).toBe('smollm3-3b-instruct');
    expect(cfg.maxResponseLength).toBe(512);
    expect(cfg.cloudFallbackEnabled).toBe(true);
    expect(cfg.parentConsent).toBe(true);
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
