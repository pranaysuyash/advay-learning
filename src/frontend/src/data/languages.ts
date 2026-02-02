export interface Language {
  code: string;
  name: string;
  flagIcon: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flagIcon: '/assets/icons/ui/flag-en.svg' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flagIcon: '/assets/icons/ui/flag-in.svg' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flagIcon: '/assets/icons/ui/flag-in.svg' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flagIcon: '/assets/icons/ui/flag-in.svg' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flagIcon: '/assets/icons/ui/flag-in.svg' },
];

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguageName(code: string): string {
  return getLanguageByCode(code)?.name || code;
}
