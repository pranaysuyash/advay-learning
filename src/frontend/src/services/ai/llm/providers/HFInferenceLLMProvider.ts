import type { LLMModel, LLMRequest } from '../LLMService';
import type {
  LLMProviderAdapter,
  LLMProviderGenerateResult,
} from '../LLMProvider';

const HF_MODEL_MAP: Record<LLMModel, string> = {
  'qwen3.5-1.5b-instruct': 'Qwen/Qwen3.5-1.5B-Instruct',
  'qwen3.5-0.5b-instruct': 'Qwen/Qwen3.5-0.5B-Instruct',
  'qwen3.5-3b-instruct': 'Qwen/Qwen3.5-3B-Instruct',
  'smollm3-3b-instruct': 'HuggingFaceTB/SmolLM3-3B-Instruct',
  'qwen3.5-7b-instruct': 'Qwen/Qwen3.5-7B-Instruct',
  'qwen3-8b-instruct': 'Qwen/Qwen3.5-8B-Instruct',
};

export class HFInferenceLLMProvider implements LLMProviderAdapter {
  readonly name = 'Hugging Face Inference API';
  readonly source = 'cloud' as const;

  private readonly model: LLMModel;
  private readonly token?: string;
  private ready = false;

  constructor(model: LLMModel, token?: string) {
    this.model = model;
    this.token = token;
  }

  async init(): Promise<boolean> {
    this.ready = Boolean(this.token);
    return this.ready;
  }

  isReady(): boolean {
    return this.ready;
  }

  async generate(request: LLMRequest): Promise<LLMProviderGenerateResult> {
    if (!this.ready || !this.token) {
      throw new Error('HF Inference provider not ready (missing token)');
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL_MAP[this.model]}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: request.prompt,
          parameters: {
            max_new_tokens: request.maxTokens ?? 80,
            temperature: request.temperature ?? 0.6,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HF Inference request failed with ${response.status}`);
    }

    const payload = await response.json();
    const first = Array.isArray(payload) ? payload[0] : payload;
    const text =
      first?.generated_text ??
      first?.text ??
      (typeof first === 'string' ? first : '');

    return {
      text: String(text || '').trim(),
      model: this.model,
      cached: false,
    };
  }
}
