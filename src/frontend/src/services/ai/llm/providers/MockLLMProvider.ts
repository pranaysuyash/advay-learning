import { getRandomResponse } from '../../../../data/pipResponses';
import type { LLMRequest } from '../LLMService';
import type {
  LLMProviderAdapter,
  LLMProviderGenerateResult,
} from '../LLMProvider';

export class MockLLMProvider implements LLMProviderAdapter {
  readonly name = 'Mock LLM Provider';
  readonly source = 'mock' as const;

  async init(): Promise<boolean> {
    return true;
  }

  isReady(): boolean {
    return true;
  }

  async generate(request: LLMRequest): Promise<LLMProviderGenerateResult> {
    if (request.category) {
      return { text: getRandomResponse(request.category), cached: false };
    }

    const normalized = request.prompt.toLowerCase();

    if (normalized.includes('bye') || normalized.includes('goodbye')) {
      return { text: getRandomResponse('farewell'), cached: false };
    }

    if (normalized.includes('hello') || normalized.includes('hi')) {
      return { text: getRandomResponse('greeting'), cached: false };
    }

    if (normalized.includes('wait') || normalized.includes('hold on')) {
      return { text: getRandomResponse('waiting'), cached: false };
    }

    if (normalized.length === 0) {
      return { text: getRandomResponse('thinking'), cached: false };
    }

    return { text: getRandomResponse('encouragement'), cached: false };
  }
}
