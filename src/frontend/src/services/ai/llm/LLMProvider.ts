import type { LLMModel, LLMRequest } from './LLMService';

export interface LLMProviderGenerateResult {
  text: string;
  model?: LLMModel;
  cached?: boolean;
}

export interface LLMProviderAdapter {
  readonly name: string;
  readonly source: 'local' | 'cloud' | 'mock';
  init(): Promise<boolean>;
  isReady(): boolean;
  generate(request: LLMRequest): Promise<LLMProviderGenerateResult>;
}
