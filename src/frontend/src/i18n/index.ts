/**
 * i18n module exports
 */

export { initializeI18n, SUPPORTED_LANGUAGES, getLanguageInfo, isRTL, getLanguageOptions } from './config';
export type { LanguageCode, Namespace } from './config';
export { I18nProvider } from './I18nProvider';
export { useTranslation } from './useI18n';
