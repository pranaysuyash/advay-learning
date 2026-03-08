// Utility functions shared across AI services for environment detection

/**
 * Check whether the code is running in a browser environment.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

/**
 * Rough mobile detection using userAgent.
 */
export function isMobile(): boolean {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent || '';
  return /Mobi|Android/i.test(ua);
}

/**
 * Detect whether WebGPU is available.
 */
export async function hasWebGPU(): Promise<boolean> {
  if (!isBrowser()) return false;
  try {
    const nav = navigator as any;
    if (!nav.gpu || !nav.gpu.requestAdapter) return false;
    const adapter = await nav.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

/**
 * Shared environment object for LLM runtime selection.
 */
export interface RuntimeEnv {
  isBrowser: boolean;
  hasWebGPU: boolean;
  isMobile: boolean;
  hasLocalOllama: boolean;
  cloudFallbackEnabled: boolean;
  parentConsent: boolean;
}

// Additional helpers for services ------------------------------------------------

/**
 * Returns true when vitest/jsdom is running or NODE_ENV=test is set.
 * Centralizing test-detection avoids repeated \"import.meta.env?.MODE\" checks.
 */
export function isTestEnv(): boolean {
  return (import.meta as any).env?.MODE === 'test';
}

/**
 * STT provider selection logic factored out of STTService.
 * Returns the best provider based on runtime characteristics.
 */
export async function detectBestSTTProvider(
  overrides: Partial<RuntimeEnv & { hasWebSpeech?: boolean }> = {},
): Promise<'whisper' | 'web-speech' | 'cloud'> {
  const env = await buildRuntimeEnv(overrides);

  // prefer whisper when GPU is available in a browser and not mobile
  if (env.isBrowser && env.hasWebGPU && !env.isMobile) {
    return 'whisper';
  }

  // if explicit override for Web Speech was provided, respect it
  const hasWebSpeech =
    overrides.hasWebSpeech ??
    (env.isBrowser &&
      typeof window !== 'undefined' &&
      Boolean(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition,
      ));

  if (env.isBrowser && hasWebSpeech) {
    return 'web-speech';
  }

  // everything else falls back to cloud (parent consent gating handled by caller)
  return 'cloud';
}

/**
 * Gather environment information used by LLMService.
 *
 * @param overrides optional manual overrides for testing
 */
export async function buildRuntimeEnv(
  overrides: Partial<RuntimeEnv> = {},
): Promise<RuntimeEnv> {
  const base: RuntimeEnv = {
    isBrowser: isBrowser(),
    hasWebGPU: await hasWebGPU(),
    isMobile: isMobile(),
    hasLocalOllama: Boolean((import.meta as any).env?.VITE_LOCAL_OLLAMA_URL),
    cloudFallbackEnabled: parseBoolean(
      (import.meta as any).env?.VITE_AI_CLOUD_FALLBACK_ENABLED,
      false,
    ),
    parentConsent: parseBoolean(
      (import.meta as any).env?.VITE_AI_PARENT_CONSENT,
      false,
    ),
  };
  return { ...base, ...overrides };
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(v)) return true;
    if (['0', 'false', 'no', 'off'].includes(v)) return false;
  }
  return fallback;
}

// -- LLM runtime utilities -------------------------------------------------------

import type { LLMProvider, LLMModel } from '../services/ai/llm/LLMService';

/**
 * Description of a selected LLM runtime plan.  This logic mirrors the
 * rule-set formerly housed directly inside `LLMService.selectRuntimePlan`.
 */
export interface LLMRuntimePlan {
  provider: LLMProvider;
  model: LLMModel;
  reason: string;
}

/**
 * Choose an LLM runtime plan based on the gathered runtime environment.
 *
 * This logic is intentionally architecture-aligned and shared across
 * services so that frontend pages and unit tests can reason about it
 * without instantiating a full LLMService instance.
 */
export function selectLLMRuntimePlan(env: RuntimeEnv): LLMRuntimePlan {
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
      reason: 'Mobile profile: prioritize lightweight latency-optimized model.',
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
