/**
 * Language Configuration — Single Source of Truth
 *
 * **IMPORTANT**: This module now imports from `i18n/config.ts` as the single source of truth.
 * For broader language support and configuration, see `src/i18n/config.ts`.
 *
 * This module provides:
 * - Backward compatibility through `LANGUAGES` export
 * - Helper functions (`getLanguageByCode`, `getLanguageName`, `getAllLanguages`)
 * - Localized names and flag icons for UI selection
 *
 * **Unification Note (TCK-20260224-002)**: As of 2026-02-24, i18n/config.SUPPORTED_LANGUAGES
 * is the canonical source. This module wraps it for specific UI use cases.
 */

// Import language definitions from i18n config
import { SUPPORTED_LANGUAGES, LanguageCode } from '../i18n/config';

/**
 * Language interface for UI selection (compatible with i18n config)
 */
export interface Language {
  code: LanguageCode;
  name: string;
  flagIcon: string;
  nativeName: string;
}

/**
 * Mapping of language codes to flag icons.
 * Maps i18n language codes to their UI flag icon paths.
 *
 * Note: Currently limited to flag-en.svg and flag-in.svg.
 * Follow-up ticket LANG-01 tracks adding per-language flag icons for Telugu, Tamil, Kannada.
 */
const FLAG_ICON_MAP: Record<LanguageCode, string> = {
  en: '/assets/icons/ui/flag-en.svg',
  hi: '/assets/icons/ui/flag-in.svg',
  kn: '/assets/icons/ui/flag-in.svg', // TODO: Create kn-specific flag (LANG-01)
  te: '/assets/icons/ui/flag-in.svg', // TODO: Create te-specific flag (LANG-01)
  ta: '/assets/icons/ui/flag-in.svg', // TODO: Create ta-specific flag (LANG-01)
  zh: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  es: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  ar: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  ml: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  mr: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  gu: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  bn: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  pa: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  or: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
  as: '/assets/icons/ui/flag-in.svg', // Placeholder (not Indian language)
};

/**
 * LANGUAGES — All supported languages with UI metadata
 *
 * **Source**: Derived from `SUPPORTED_LANGUAGES` in `i18n/config.ts` (single source of truth)
 * **Backward Compatibility**: Maintains previous structure for existing code
 *
 * Exported for backward compatibility. New code should use i18n/config.SUPPORTED_LANGUAGES directly.
 */
export const LANGUAGES: Language[] = SUPPORTED_LANGUAGES.map((lang) => ({
  code: lang.code as LanguageCode,
  name: lang.name,
  nativeName: lang.nameLocal,
  flagIcon:
    FLAG_ICON_MAP[lang.code as LanguageCode] || '/assets/icons/ui/flag-en.svg',
}));

/**
 * Get a language by its code
 * @param code Language code (e.g., 'en', 'hi', 'kn')
 * @returns Language object or undefined if not found
 */
export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Get a language name by its code
 * @param code Language code
 * @returns Language name in English, or the code if not found
 */
export function getLanguageName(code: string): string {
  return getLanguageByCode(code)?.name || code;
}

/**
 * Get all supported languages
 * @returns Array of all Language objects
 *
 * **Added for LANG-02 finding resolution** (improved DX, explicit helper)
 */
export function getAllLanguages(): Language[] {
  return LANGUAGES;
}
