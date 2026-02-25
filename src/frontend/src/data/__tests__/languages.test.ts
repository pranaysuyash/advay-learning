/**
 * Languages Configuration Tests
 *
 * Tests for unification of language configs (TCK-20260224-002)
 * Verifies that languages.ts properly consumes from i18n/config.ts
 */

import { describe, it, expect } from 'vitest';
import {
  LANGUAGES,
  getLanguageByCode,
  getLanguageName,
  getAllLanguages,
} from '../languages';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';

describe('languages', () => {
  describe('LANGUAGES array', () => {
    it('should export a non-empty array', () => {
      expect(LANGUAGES).toBeDefined();
      expect(Array.isArray(LANGUAGES)).toBe(true);
      expect(LANGUAGES.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each language', () => {
      LANGUAGES.forEach((lang) => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('nativeName');
        expect(lang).toHaveProperty('flagIcon');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.nativeName).toBe('string');
        expect(typeof lang.flagIcon).toBe('string');
      });
    });

    it('should have unique language codes (no duplicates)', () => {
      const codes = LANGUAGES.map((lang) => lang.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should map all SUPPORTED_LANGUAGES from i18n/config (unification check)', () => {
      expect(LANGUAGES.length).toBe(SUPPORTED_LANGUAGES.length);
      SUPPORTED_LANGUAGES.forEach((isoLang) => {
        const dataLang = LANGUAGES.find((lang) => lang.code === isoLang.code);
        expect(dataLang).toBeDefined();
        expect(dataLang?.nativeName).toBe(isoLang.nameLocal);
      });
    });

    it('should always have a flagIcon (fallback to flag-en.svg if not explicitly mapped)', () => {
      LANGUAGES.forEach((lang) => {
        expect(lang.flagIcon).toBeTruthy();
        expect(lang.flagIcon.startsWith('/assets/icons/ui/flag-')).toBe(true);
      });
    });

    it('should include English and Hindi (backward compatibility check)', () => {
      expect(LANGUAGES.find((lang) => lang.code === 'en')).toBeDefined();
      expect(LANGUAGES.find((lang) => lang.code === 'hi')).toBeDefined();
    });
  });

  describe('getLanguageByCode()', () => {
    it('should return language for valid code', () => {
      const en = getLanguageByCode('en');
      expect(en).toBeDefined();
      expect(en?.code).toBe('en');
      expect(en?.name).toBe('English');
    });

    it('should return undefined for unknown code', () => {
      const unknown = getLanguageByCode('xx');
      expect(unknown).toBeUndefined();
    });

    it('should work for all languages in LANGUAGES array', () => {
      LANGUAGES.forEach((lang) => {
        const found = getLanguageByCode(lang.code);
        expect(found).toBeDefined();
        expect(found?.code).toBe(lang.code);
      });
    });
  });

  describe('getLanguageName()', () => {
    it('should return language name for valid code', () => {
      expect(getLanguageName('en')).toBe('English');
      expect(getLanguageName('hi')).toBe('Hindi');
    });

    it('should return code itself for unknown code (fallback)', () => {
      expect(getLanguageName('xx')).toBe('xx');
    });

    it('should work for all languages in LANGUAGES array', () => {
      LANGUAGES.forEach((lang) => {
        expect(getLanguageName(lang.code)).toBe(lang.name);
      });
    });
  });

  describe('getAllLanguages()', () => {
    it('should return all languages', () => {
      const all = getAllLanguages();
      expect(all).toEqual(LANGUAGES);
    });

    it('should return an array with the same length as LANGUAGES', () => {
      expect(getAllLanguages().length).toBe(LANGUAGES.length);
    });

    it('should be the single point for getting all supported languages (DX improvement)', () => {
      const all = getAllLanguages();
      expect(all).toBeDefined();
      expect(all.length).toBeGreaterThan(0);
      all.forEach((lang) => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
      });
    });
  });

  describe('Unification (TCK-20260224-002)', () => {
    it('should maintain single source of truth: i18n/config.SUPPORTED_LANGUAGES', () => {
      // Verify that LANGUAGES is generated from SUPPORTED_LANGUAGES, not hardcoded
      const codesMismatch = LANGUAGES.some(
        (lang) =>
          !SUPPORTED_LANGUAGES.find((isoLang) => isoLang.code === lang.code),
      );
      expect(codesMismatch).toBe(false);
    });

    it('should prevent drift between languages.ts and i18n/config.ts', () => {
      // If a new language is added to i18n/config, it should automatically appear in LANGUAGES
      const languageCodes = LANGUAGES.map((lang) => lang.code);
      const isoLanguageCodes = SUPPORTED_LANGUAGES.map((lang) => lang.code);
      expect(languageCodes.sort()).toEqual(isoLanguageCodes.sort());
    });

    it('should have backward-compatible exports for existing code', () => {
      // Verify that old code importing LANGUAGES still works
      expect(LANGUAGES).toBeDefined();
      expect(getLanguageByCode).toBeDefined();
      expect(getLanguageName).toBeDefined();
    });
  });

  describe('Incomplete flag mapping (LANG-01 follow-up)', () => {
    it('should document missing per-language flags for Indian languages', () => {
      const indianLanguages = ['kn', 'te', 'ta'];
      indianLanguages.forEach((code) => {
        const lang = getLanguageByCode(code);
        // Currently all Indian languages use flag-in.svg (LANG-01 follow-up to add specific flags)
        expect(lang?.flagIcon).toContain('flag-in.svg');
      });
    });
  });
});
