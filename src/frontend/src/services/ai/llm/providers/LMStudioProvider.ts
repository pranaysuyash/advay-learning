import type { LLMModel, LLMRequest } from '../LLMService';
import type {
  LLMProviderAdapter,
  LLMProviderGenerateResult,
} from '../LLMProvider';

/**
 * LM Studio Provider - OpenAI-compatible local LLM API
 *
 * LM Studio runs an OpenAI-compatible server at http://localhost:1234/v1
 * by default. This provider uses the /chat/completions endpoint.
 *
 * Usage:
 * 1. Start LM Studio
 * 2. Load a model
 * 3. Enable "Server" mode (Start Server button)
 * 4. Set VITE_AI_LLM_PROVIDER=lm-studio in your .env
 *
 * Default base URL: http://localhost:1234/v1
 * Override with: VITE_LM_STUDIO_BASE_URL
 */

// Map internal model names to LM Studio model names
// LM Studio uses whatever model is currently loaded
const LM_STUDIO_MODEL_MAP: Record<LLMModel, string> = {
  'qwen3.5-1.5b-instruct': 'local-model',
  'qwen3.5-0.5b-instruct': 'local-model',
  'qwen3.5-3b-instruct': 'local-model',
  'smollm3-3b-instruct': 'local-model',
  'qwen3.5-7b-instruct': 'local-model',
  'qwen3-8b-instruct': 'local-model',
};

export class LMStudioProvider implements LLMProviderAdapter {
  readonly name = 'LM Studio';
  readonly source = 'local' as const;

  private readonly model: LLMModel;
  private readonly baseUrl: string;
  private ready = false;

  constructor(model: LLMModel, baseUrl: string = 'http://localhost:1234/v1') {
    this.model = model;
    // Ensure the URL ends with /v1 for OpenAI compatibility
    this.baseUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
  }

  async init(): Promise<boolean> {
    try {
      // LM Studio exposes /v1/models for compatibility
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
      });
      this.ready = response.ok;
      if (this.ready) {
        console.log('[LMStudio] Connected to LM Studio server');
      }
      return this.ready;
    } catch {
      this.ready = false;
      console.warn('[LMStudio] Could not connect to LM Studio at', this.baseUrl);
      return false;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  async generate(request: LLMRequest): Promise<LLMProviderGenerateResult> {
    if (!this.ready) {
      throw new Error('LM Studio provider not ready');
    }

    const lmStudioModel = LM_STUDIO_MODEL_MAP[this.model];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // LM Studio doesn't require an API key but accepts one for compatibility
        'Authorization': 'Bearer lm-studio',
      },
      body: JSON.stringify({
        model: lmStudioModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful, child-friendly assistant. Keep responses short, encouraging, and appropriate for young children.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature ?? 0.6,
        max_tokens: request.maxTokens ?? 80,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LM Studio request failed with ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content ?? '';

    return {
      text: String(text).trim(),
      model: this.model,
      cached: false,
    };
  }
}
