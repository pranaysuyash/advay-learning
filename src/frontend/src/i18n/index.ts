/**
 * i18n module exports
 */

export { initializeI18n, SUPPORTED_LANGUAGES, getLanguageInfo, isRTL, getLanguageOptions } from './config';
export type { LanguageCode, Namespace } from './config';
export { I18nProvider, useTranslation } from './I18nProvider';
