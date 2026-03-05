import type { LLMModel, LLMRequest } from '../LLMService';
import type {
  LLMProviderAdapter,
  LLMProviderGenerateResult,
} from '../LLMProvider';

type TextGenerationPipeline = (
  prompt: string,
  options?: Record<string, unknown>,
) => Promise<any>;

const MODEL_MAP: Record<LLMModel, string> = {
  'qwen3.5-1.5b-instruct': 'Qwen/Qwen2.5-1.5B-Instruct',
  'qwen3.5-0.5b-instruct': 'Qwen/Qwen2.5-0.5B-Instruct',
  'qwen3.5-3b-instruct': 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
  'smollm3-3b-instruct': 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
  'qwen3.5-7b-instruct': 'Qwen/Qwen2.5-7B-Instruct',
  'qwen3-8b-instruct': 'Qwen/Qwen2.5-7B-Instruct',
};

export class TransformersJsLLMProvider implements LLMProviderAdapter {
  readonly name = 'Transformers.js';
  readonly source = 'local' as const;

  private readonly model: LLMModel;
  private generator: TextGenerationPipeline | null = null;
  private initStarted = false;

  constructor(model: LLMModel) {
    this.model = model;
  }

  async init(): Promise<boolean> {
    if (this.generator) return true;
    if (this.initStarted) return false;

    this.initStarted = true;
    try {
      const { pipeline } = await import('@huggingface/transformers');
      const modelId = MODEL_MAP[this.model];
      const pipelineAny = pipeline as any;
      this.generator = (await pipelineAny('text-generation', modelId, {
        // Keep config simple and safe for browser contexts.
        dtype: 'q4',
      })) as TextGenerationPipeline;
      return true;
    } catch (error) {
      console.warn('[TransformersJsLLMProvider] init failed:', error);
      this.generator = null;
      return false;
    } finally {
      this.initStarted = false;
    }
  }

  isReady(): boolean {
    return this.generator !== null;
  }

  async generate(request: LLMRequest): Promise<LLMProviderGenerateResult> {
    if (!this.generator) {
      throw new Error('Transformers.js provider not initialized');
    }

    const result = await this.generator(request.prompt, {
      max_new_tokens: request.maxTokens ?? 80,
      temperature: request.temperature ?? 0.6,
      do_sample: true,
      return_full_text: false,
    });

    const first = Array.isArray(result) ? result[0] : result;
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
