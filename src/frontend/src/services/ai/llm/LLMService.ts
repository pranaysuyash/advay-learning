/**
 * LLMService - Initial scaffold for local-first text generation.
 *
 * This is intentionally a contract-first implementation to unblock
 * provider wiring (Transformers.js / WebLLM / Ollama / cloud fallback)
 * in subsequent steps.
 */

import {
  getRandomResponse,
  type ResponseCategory,
} from '../../../data/pipResponses';
import type { LLMProviderAdapter } from './LLMProvider';
import { MockLLMProvider } from './providers/MockLLMProvider';
import { TransformersJsLLMProvider } from './providers/TransformersJsLLMProvider';
import { WebLLMLLMProvider } from './providers/WebLLMLLMProvider';
import { OllamaLLMProvider } from './providers/OllamaLLMProvider';
import { HFInferenceLLMProvider } from './providers/HFInferenceLLMProvider';

export type LLMProvider =
  | 'transformers-js'
  | 'web-llm'
  | 'ollama'
  | 'hf-inference'
  | 'mock';

export type LLMModel =
  | 'qwen3.5-1.5b-instruct'
  | 'qwen3.5-0.5b-instruct'
  | 'qwen3.5-3b-instruct'
  | 'smollm3-3b-instruct'
  | 'qwen3.5-7b-instruct'
  | 'qwen3-8b-instruct';

export type LLMResponseSource = 'local' | 'cloud' | 'mock';

export interface LLMRequest {
  prompt: string;
  category?: ResponseCategory;
  languageCode?: string;
  maxTokens?: number;
  temperature?: number;
  childAge?: number;
  context?: Record<string, unknown>;
}

export interface LLMResponse {
  text: string;
  provider: LLMProvider;
  model: LLMModel;
  source: LLMResponseSource;
  latencyMs: number;
  cached: boolean;
  timestamp: string;
}

export interface LLMRuntimeConfig {
  enabled: boolean;
  provider: LLMProvider;
  model: LLMModel;
  fallbackModel: LLMModel;
  maxResponseLength: number;
}

export interface LLMRuntimeEnvironment {
  isBrowser: boolean;
  hasWebGPU: boolean;
  isMobile: boolean;
  hasLocalOllama: boolean;
  cloudFallbackEnabled: boolean;
  parentConsent: boolean;
}

export interface LLMRuntimePlan {
  provider: LLMProvider;
  model: LLMModel;
  reason: string;
}

const VALID_PROVIDERS: LLMProvider[] = [
  'transformers-js',
  'web-llm',
  'ollama',
  'hf-inference',
  'mock',
];

const VALID_MODELS: LLMModel[] = [
  'qwen3.5-1.5b-instruct',
  'qwen3.5-0.5b-instruct',
  'qwen3.5-3b-instruct',
  'smollm3-3b-instruct',
  'qwen3.5-7b-instruct',
  'qwen3-8b-instruct',
];

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  return fallback;
}

function parseProvider(value: unknown, fallback: LLMProvider): LLMProvider {
  if (
    typeof value === 'string' &&
    VALID_PROVIDERS.includes(value as LLMProvider)
  ) {
    return value as LLMProvider;
  }
  return fallback;
}

function parseModel(value: unknown, fallback: LLMModel): LLMModel {
  if (typeof value === 'string' && VALID_MODELS.includes(value as LLMModel)) {
    return value as LLMModel;
  }
  return fallback;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed > 0 ? Math.floor(parsed) : fallback;
}

function buildDefaultRuntimeConfigFromEnv(
  envOverride?: Record<string, any>,
): LLMRuntimeConfig {
  const env = envOverride ?? (import.meta as any).env ?? {};
  const llmFlag = parseBoolean(env.VITE_FEATURE_AI_LLM_RESPONSES_V1, false);
  const explicitEnabled = parseBoolean(env.VITE_AI_LLM_ENABLED, false);

  return {
    // feature flag takes precedence and acts as an OR with explicit setting
    enabled: llmFlag || explicitEnabled,
    provider: parseProvider(env.VITE_AI_LLM_PROVIDER, 'mock'),
    model: parseModel(env.VITE_AI_LLM_MODEL, 'qwen3.5-1.5b-instruct'),
    fallbackModel: parseModel(
      env.VITE_AI_LLM_FALLBACK_MODEL,
      'qwen3.5-0.5b-instruct',
    ),
    maxResponseLength: parsePositiveInt(env.VITE_AI_MAX_RESPONSE_LENGTH, 220),
  };
}

// default configuration is built on demand inside LLMService so that
// unit tests can modify `import.meta.env` and observe changes.

/**
 * Contract-first LLM service.
 *
 * Current behavior:
 * - Provides typed generation API
 * - Returns deterministic, child-safe mock text for integration safety
 *
 * Next steps will swap mock generation with provider-backed inference.
 */
export class LLMService {
  private config: LLMRuntimeConfig;
  private readonly providers = new Map<string, LLMProviderAdapter>();

  constructor(config?: Partial<LLMRuntimeConfig>) {
    // build default config at construction time so callers can override env
    // variables between module load and instantiation.
    this.config = { ...buildDefaultRuntimeConfigFromEnv() };
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): LLMRuntimeConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<LLMRuntimeConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Select provider/model using architecture-aligned runtime rules.
   */
  selectRuntimePlan(env: LLMRuntimeEnvironment): LLMRuntimePlan {
    if (env.isBrowser && env.hasWebGPU && !env.isMobile) {
      return {
        provider: 'transformers-js',
        model: 'qwen3.5-1.5b-instruct',
        reason: 'Browser with WebGPU available: use primary MVP model.',
      };
    }

    if (env.isBrowser && env.isMobile) {
      return {
        provider: 'transformers-js',
        model: 'qwen3.5-0.5b-instruct',
        reason:
          'Mobile profile: prioritize lightweight latency-optimized model.',
      };
    }

    if (env.isBrowser && !env.hasWebGPU) {
      return {
        provider: 'transformers-js',
        model: 'qwen3.5-0.5b-instruct',
        reason: 'No WebGPU: use smaller fallback model for WASM compatibility.',
      };
    }

    if (env.hasLocalOllama) {
      return {
        provider: 'ollama',
        model: 'qwen3.5-1.5b-instruct',
        reason: 'Local desktop runtime available: use Ollama local inference.',
      };
    }

    if (env.cloudFallbackEnabled && env.parentConsent) {
      return {
        provider: 'hf-inference',
        model: 'qwen3.5-3b-instruct',
        reason: 'Cloud fallback enabled with parent consent.',
      };
    }

    return {
      provider: 'mock',
      model: 'qwen3.5-0.5b-instruct',
      reason: 'No local/cloud provider available: safe mock fallback.',
    };
  }

  applyRuntimePlan(plan: LLMRuntimePlan): void {
    this.updateConfig({
      provider: plan.provider,
      model: plan.model,
    });
  }

  private providerKey(provider: LLMProvider, model: LLMModel): string {
    return `${provider}:${model}`;
  }

  private buildProvider(
    provider: LLMProvider,
    model: LLMModel,
  ): LLMProviderAdapter {
    switch (provider) {
      case 'transformers-js':
        return new TransformersJsLLMProvider(model);
      case 'web-llm':
        return new WebLLMLLMProvider(model);
      case 'ollama':
        // allow overriding the Ollama local server URL via env var
        const ollamaUrl = (import.meta as any).env?.VITE_OLLAMA_BASE_URL;
        return new OllamaLLMProvider(model, ollamaUrl);
      case 'hf-inference':
        return new HFInferenceLLMProvider(
          model,
          (import.meta as any).env?.VITE_HF_API_KEY,
        );
      case 'mock':
      default:
        return new MockLLMProvider();
    }
  }

  private async getProvider(
    provider: LLMProvider,
    model: LLMModel,
  ): Promise<LLMProviderAdapter> {
    const key = this.providerKey(provider, model);
    const existing = this.providers.get(key);
    if (existing) {
      return existing;
    }

    const adapter = this.buildProvider(provider, model);
    this.providers.set(key, adapter);
    await adapter.init();
    return adapter;
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    const startedAt = Date.now();
    const prompt = request.prompt?.trim() ?? '';

    // Always keep a safety mock available.
    const mockProvider = await this.getProvider(
      'mock',
      this.config.fallbackModel,
    );

    if (!this.config.enabled) {
      const mock = await mockProvider.generate({
        ...request,
        prompt: 'waiting',
        category: 'waiting',
      });
      const elapsed = Math.max(1, Date.now() - startedAt);
      return {
        text: mock.text.slice(0, this.config.maxResponseLength),
        provider: 'mock',
        model: this.config.fallbackModel,
        source: 'mock',
        latencyMs: elapsed,
        cached: Boolean(mock.cached),
        timestamp: new Date().toISOString(),
      };
    }

    // Category-first responses remain child-safe and deterministic.
    if (request.category) {
      const mock = await mockProvider.generate({ ...request, prompt });
      const elapsed = Math.max(1, Date.now() - startedAt);
      return {
        text: mock.text.slice(0, this.config.maxResponseLength),
        provider: 'mock',
        model: this.config.model,
        source: 'mock',
        latencyMs: elapsed,
        cached: Boolean(mock.cached),
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const provider = await this.getProvider(
        this.config.provider,
        this.config.model,
      );
      if (!provider.isReady()) {
        throw new Error(`Provider ${provider.name} is not ready`);
      }

      const generated = await provider.generate({ ...request, prompt });
      const text = generated.text?.trim() || getRandomResponse('encouragement');
      const elapsed = Math.max(1, Date.now() - startedAt);

      return {
        text: text.slice(0, this.config.maxResponseLength),
        provider: this.config.provider,
        model: generated.model ?? this.config.model,
        source: provider.source,
        latencyMs: elapsed,
        cached: Boolean(generated.cached),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn(
        '[LLMService] Provider failed, falling back to mock:',
        error,
      );
      const mock = await mockProvider.generate({ ...request, prompt });
      const elapsed = Math.max(1, Date.now() - startedAt);
      return {
        text: mock.text.slice(0, this.config.maxResponseLength),
        provider: 'mock',
        model: this.config.fallbackModel,
        source: 'mock',
        latencyMs: elapsed,
        cached: Boolean(mock.cached),
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const llmService = new LLMService();

export default llmService;

// exposed for tests and tooling
export { buildDefaultRuntimeConfigFromEnv };
