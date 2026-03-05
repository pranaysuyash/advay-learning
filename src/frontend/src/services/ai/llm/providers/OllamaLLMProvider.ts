import type { LLMModel, LLMRequest } from '../LLMService';
import type {
  LLMProviderAdapter,
  LLMProviderGenerateResult,
} from '../LLMProvider';

const OLLAMA_MODEL_MAP: Record<LLMModel, string> = {
  'qwen3.5-1.5b-instruct': 'qwen2.5:1.5b-instruct',
  'qwen3.5-0.5b-instruct': 'qwen2.5:0.5b-instruct',
  'qwen3.5-3b-instruct': 'qwen2.5:3b-instruct',
  'smollm3-3b-instruct': 'smollm2:1.7b-instruct',
  'qwen3.5-7b-instruct': 'qwen2.5:7b-instruct',
  'qwen3-8b-instruct': 'qwen2.5:7b-instruct',
};

export class OllamaLLMProvider implements LLMProviderAdapter {
  readonly name = 'Ollama';
  readonly source = 'local' as const;

  private readonly model: LLMModel;
  private readonly baseUrl: string;
  private ready = false;

  constructor(model: LLMModel, baseUrl: string = 'http://localhost:11434') {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async init(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      this.ready = response.ok;
      return this.ready;
    } catch {
      this.ready = false;
      return false;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  async generate(request: LLMRequest): Promise<LLMProviderGenerateResult> {
    if (!this.ready) {
      throw new Error('Ollama provider not ready');
    }

    const ollamaModel = OLLAMA_MODEL_MAP[this.model];
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: request.prompt,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.6,
          num_predict: request.maxTokens ?? 80,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with ${response.status}`);
    }

    const payload = await response.json();
    return {
      text: String(payload?.response ?? '').trim(),
      model: this.model,
      cached: false,
    };
  }
}
