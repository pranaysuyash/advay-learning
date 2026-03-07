/**
 * SafetyService - Content filtering for children's AI interactions
 *
 * Multi-layer safety system:
 * 1. Pattern matching (blocked words, PII, injection)
 * 2. Prompt injection detection
 * 3. Safe response fallback
 *
 * @see docs/research/CONTENT_SAFETY_MODERATION.md
 */

// JSON module resolution
import blockedWordsData from '../../../games/wordlists/blocked-words.json';

export type SafetyCategory =
  | 'profanity'
  | 'violence'
  | 'sexual'
  | 'death'
  | 'fear'
  | 'substances'
  | 'political'
  | 'self_harm'
  | 'bodily_inappropriate'
  | 'negative_emotion'
  | 'pii'
  | 'injection';

export interface SafetyResult {
  safe: boolean;
  category?: SafetyCategory;
  confidence: number;
  message?: string;
  redirect?: string;
}

interface BlockedWordsData {
  metadata: {
    categories: Record<string, string>;
  };
  blockedWords: string[];
}

const BLOCKED_DATA = blockedWordsData as BlockedWordsData;
const BLOCKED_SET = new Set(BLOCKED_DATA.blockedWords.map(w => w.toLowerCase()));

const INJECTION_PATTERNS: Array<{ pattern: RegExp; severity: 'medium' | 'high' }> = [
  { pattern: /ignore.*(instructions|rules|system|previous)/i, severity: 'high' },
  { pattern: /forget.*(everything|all|instructions)/i, severity: 'high' },
  { pattern: /you.*are.*(now|different|evil|bad)/i, severity: 'medium' },
  { pattern: /pretend.*(to be|you are)/i, severity: 'medium' },
  { pattern: /what.*(are your|were your).*(instructions|rules|system)/i, severity: 'high' },
  { pattern: /(show|print|tell).*system.*(prompt|instructions|message)/i, severity: 'high' },
  { pattern: /ignore.*all.*(above|previous|prior)/i, severity: 'high' },
  { pattern: /new.*(instructions|rules|system)/i, severity: 'medium' },
];

const PII_PATTERNS = [
  /(?:my|your|our)\s*(address|phone|mobile|email|name)/i,
  /(?:where|i live|they live)/i,
  /(?:password|secret|code)/i,
  /(?:school|teacher|friend).*(name|address)/i,
];

class SafetyServiceImpl {
  private initialized = false;

  init(): void {
    this.initialized = true;
    console.log('[SafetyService] Initialized with', BLOCKED_SET.size, 'blocked words');
  }

  validateInput(input: string): SafetyResult {
    if (!this.initialized) {
      this.init();
    }

    const normalized = input.toLowerCase().trim();

    if (!normalized || normalized.length === 0) {
      return { safe: true, confidence: 1.0 };
    }

    if (normalized.length > 500) {
      return {
        safe: false,
        category: 'negative_emotion',
        confidence: 0.9,
        message: 'too_long',
      };
    }

    const injectionCheck = this.detectInjection(normalized);
    if (!injectionCheck.safe) {
      return injectionCheck;
    }

    const piiCheck = this.detectPII(normalized);
    if (!piiCheck.safe) {
      return piiCheck;
    }

    const wordCheck = this.checkBlockedWords(normalized);
    if (!wordCheck.safe) {
      return wordCheck;
    }

    return { safe: true, confidence: 0.95 };
  }

  private detectInjection(input: string): SafetyResult {
    for (const { pattern, severity } of INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        return {
          safe: false,
          category: 'injection',
          confidence: severity === 'high' ? 0.9 : 0.7,
          message: 'injection_detected',
        };
      }
    }
    return { safe: true, confidence: 0.95 };
  }

  private detectPII(input: string): SafetyResult {
    for (const pattern of PII_PATTERNS) {
      if (pattern.test(input)) {
        return {
          safe: false,
          category: 'pii',
          confidence: 0.8,
          message: 'pii_detected',
        };
      }
    }
    return { safe: true, confidence: 0.9 };
  }

  private checkBlockedWords(input: string): SafetyResult {
    const words = input.split(/\s+/);

    for (const word of words) {
      const clean = word.replace(/[^a-z]/gi, '').toLowerCase();
      if (BLOCKED_SET.has(clean)) {
        return {
          safe: false,
          category: 'profanity',
          confidence: 0.95,
          message: 'blocked_word',
        };
      }
    }

    return { safe: true, confidence: 0.9 };
  }

  getBlockedCategories(): string[] {
    return Object.keys(BLOCKED_DATA.metadata.categories);
  }
}

export const safetyService = new SafetyServiceImpl();
