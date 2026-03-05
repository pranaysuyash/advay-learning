import type { LLMModel, LLMRequest } from '../LLMService';
import type {
  LLMProviderAdapter,
  LLMProviderGenerateResult,
} from '../LLMProvider';

/**
 * WebLLM adapter stub.
 *
 * Kept intentionally lightweight for now: service-level fallback handles
 * routing to mock/transformers when WebLLM runtime is unavailable.
 */
export class WebLLMLLMProvider implements LLMProviderAdapter {
  readonly name = 'WebLLM';
  readonly source = 'local' as const;

  private readonly model: LLMModel;
  private ready = false;
  private runtimeLib: any | null = null;

  constructor(model: LLMModel) {
    this.model = model;
  }

  /**
   * Attempt to lazily load the WebLLM runtime and perform a quick health
   * check. Non‑blocking: if import fails we leave `ready` false and let the
   * service fall back to another provider.
   */
  async init(): Promise<boolean> {
    if (this.ready) return true;

    try {
      // `@vite-ignore` with a variable prevents Vite from statically
      // resolving the path during build. we also wrap it in try/catch so
      // tests and environments without the package continue functioning.
      const pkgName = '@sashido/web-llm';
      const lib = await import(/* @vite-ignore */ pkgName);
      this.runtimeLib = lib;

      if (typeof lib.available === 'function') {
        this.ready = await lib.available();
      } else {
        // assume usable if import succeeded
        this.ready = true;
      }
    } catch (err) {
      console.warn('[WebLLM] initialization failed', err);
      this.ready = false;
      this.runtimeLib = null;
    }

    return this.ready;
  }

  isReady(): boolean {
    return this.ready;
  }

  async generate(request: LLMRequest): Promise<LLMProviderGenerateResult> {
    if (!this.ready || !this.runtimeLib) {
      throw new Error(`WebLLM provider not available for model ${this.model}.`);
    }

    // api shape is hypothetical; update when actual library is known
    const result = await this.runtimeLib.generate({
      model: this.model,
      prompt: request.prompt,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
    });

    return {
      text: result.text,
      model: this.model,
      cached: false,
    };
  }
}
