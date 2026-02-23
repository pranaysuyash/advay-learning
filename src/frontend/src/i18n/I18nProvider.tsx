/**
 * I18n Provider Component
 * Wraps the app with i18n context and handles language initialization
 */
import { useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store';
import { isRTL } from './config';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation();
  const { language } = useSettingsStore();

  // Sync settings language with i18n
  useEffect(() => {
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Handle RTL direction
  useEffect(() => {
    const dir = isRTL(i18n.language) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return <>{children}</>;
}

// Hook for easy translation access
export { useTranslation };
