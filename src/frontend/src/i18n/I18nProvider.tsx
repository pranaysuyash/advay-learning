/**
 * I18n Provider Component
 * Wraps the app with i18n context and handles language initialization
 */
import { useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store';
import { isRTL, SUPPORTED_LANGUAGES } from './config';

interface I18nProviderProps {
  children: ReactNode;
}

const supportedLanguages = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));

export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation();
  const { language } = useSettingsStore();

  // Sync settings language with i18n
  useEffect(() => {
    if (!language || !supportedLanguages.has(language as any)) return;
    if (language !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Handle RTL direction
  useEffect(() => {
    const lang = i18n.resolvedLanguage || 'en';
    const dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [i18n.resolvedLanguage]);

  return <>{children}</>;
}
