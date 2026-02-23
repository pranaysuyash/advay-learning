/**
 * i18n Configuration
 * Dynamic multi-language support for Advay Vision Learning
 * Supports unlimited languages with lazy loading
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Supported languages configuration
// Easy to extend - just add new language objects
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nameLocal: 'English', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nameLocal: 'हिन्दी', direction: 'ltr' },
  { code: 'zh', name: 'Chinese (Simplified)', nameLocal: '简体中文', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nameLocal: 'Español', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nameLocal: 'العربية', direction: 'rtl' },
  // Indian languages
  { code: 'ta', name: 'Tamil', nameLocal: 'தமிழ்', direction: 'ltr' },
  { code: 'te', name: 'Telugu', nameLocal: 'తెలుగు', direction: 'ltr' },
  { code: 'kn', name: 'Kannada', nameLocal: 'ಕನ್ನಡ', direction: 'ltr' },
  { code: 'ml', name: 'Malayalam', nameLocal: 'മലയാളം', direction: 'ltr' },
  { code: 'mr', name: 'Marathi', nameLocal: 'मराठी', direction: 'ltr' },
  { code: 'gu', name: 'Gujarati', nameLocal: 'ગુજરાતી', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', nameLocal: 'বাংলা', direction: 'ltr' },
  { code: 'pa', name: 'Punjabi', nameLocal: 'ਪੰਜਾਬੀ', direction: 'ltr' },
  { code: 'or', name: 'Odia', nameLocal: 'ଓଡ଼ିଆ', direction: 'ltr' },
  { code: 'as', name: 'Assamese', nameLocal: 'অসমীয়া', direction: 'ltr' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// Namespaces for modular translations
export const NAMESPACES = ['common', 'dashboard', 'games', 'settings', 'auth'] as const;
export type Namespace = typeof NAMESPACES[number];

// Default namespace
export const DEFAULT_NS: Namespace = 'common';

// Get language info helper
export const getLanguageInfo = (code: string) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
};

// Check if language is RTL
export const isRTL = (code: string): boolean => {
  return getLanguageInfo(code).direction === 'rtl';
};

// Get available languages for dropdown
export const getLanguageOptions = () => {
  return SUPPORTED_LANGUAGES.map(lang => ({
    value: lang.code,
    label: `${lang.nameLocal} (${lang.name})`,
  }));
};

// i18n initialization
export const initializeI18n = () => {
  i18n
    // Detect user language
    .use(LanguageDetector)
    // Load translations using HTTP
    .use(HttpApi)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    .init({
      // Default language
      fallbackLng: 'en',
      
      // Debug mode (disable in production)
      debug: false,
      
      // Namespaces
      ns: NAMESPACES,
      defaultNS: DEFAULT_NS,
      
      // Language detection options
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'advay-language',
      },
      
      // Backend (lazy loading)
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      
      // Interpolation
      interpolation: {
        escapeValue: false, // React already escapes
      },
      
      // React-specific
      react: {
        useSuspense: false, // Disable suspense for compatibility
      },
    });

  return i18n;
};

// Export configured instance
export default initializeI18n;
