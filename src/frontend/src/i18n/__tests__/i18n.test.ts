import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  getLanguageInfo,
  isRTL,
  getLanguageOptions,
  DEFAULT_NS,
  NAMESPACES,
} from '../config';

describe('i18n Configuration', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('contains at least 15 languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(15);
    });

    it('includes English as first language', () => {
      expect(SUPPORTED_LANGUAGES[0].code).toBe('en');
      expect(SUPPORTED_LANGUAGES[0].name).toBe('English');
    });

    it('includes Hindi', () => {
      const hindi = SUPPORTED_LANGUAGES.find((l) => l.code === 'hi');
      expect(hindi).toBeDefined();
      expect(hindi?.nameLocal).toBe('हिन्दी');
      expect(hindi?.direction).toBe('ltr');
    });

    it('includes Arabic for RTL testing', () => {
      const arabic = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
      expect(arabic).toBeDefined();
      expect(arabic?.direction).toBe('rtl');
    });

    it('includes Chinese for international support', () => {
      const chinese = SUPPORTED_LANGUAGES.find((l) => l.code === 'zh');
      expect(chinese).toBeDefined();
    });

    it('includes Spanish for international support', () => {
      const spanish = SUPPORTED_LANGUAGES.find((l) => l.code === 'es');
      expect(spanish).toBeDefined();
    });
  });

  describe('getLanguageInfo', () => {
    it('returns language info for valid code', () => {
      const info = getLanguageInfo('hi');
      expect(info.code).toBe('hi');
      expect(info.name).toBe('Hindi');
    });

    it('returns English for invalid code', () => {
      const info = getLanguageInfo('invalid');
      expect(info.code).toBe('en');
    });
  });

  describe('isRTL', () => {
    it('returns false for LTR languages', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('hi')).toBe(false);
      expect(isRTL('zh')).toBe(false);
    });

    it('returns true for RTL languages', () => {
      expect(isRTL('ar')).toBe(true);
    });

    it('returns false for invalid code (defaults to English)', () => {
      expect(isRTL('invalid')).toBe(false);
    });
  });

  describe('getLanguageOptions', () => {
    it('returns array of language options', () => {
      const options = getLanguageOptions();
      expect(options.length).toBe(SUPPORTED_LANGUAGES.length);
      expect(options[0]).toHaveProperty('value');
      expect(options[0]).toHaveProperty('label');
    });

    it('includes local name in label', () => {
      const options = getLanguageOptions();
      const hindi = options.find((o) => o.value === 'hi');
      expect(hindi?.label).toContain('हिन्दी');
    });
  });

  describe('Namespaces', () => {
    it('has default namespace as common', () => {
      expect(DEFAULT_NS).toBe('common');
    });

    it('includes all required namespaces', () => {
      expect(NAMESPACES).toContain('common');
      expect(NAMESPACES).toContain('dashboard');
      expect(NAMESPACES).toContain('games');
      expect(NAMESPACES).toContain('settings');
      expect(NAMESPACES).toContain('auth');
    });
  });
});
