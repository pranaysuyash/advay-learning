const LETTER_COLOR_CLASS_MAP: Record<string, string> = {
  '#ef4444': 'letter-color-ef4444',
  '#dc2626': 'letter-color-dc2626',
  '#3b82f6': 'letter-color-3b82f6',
  '#f59e0b': 'letter-color-f59e0b',
  '#10b981': 'letter-color-10b981',
  '#8b5cf6': 'letter-color-8b5cf6',
  '#06b6d4': 'letter-color-06b6d4',
  '#84cc16': 'letter-color-84cc16',
  '#f97316': 'letter-color-f97316',
  '#ec4899': 'letter-color-ec4899',
  '#eab308': 'letter-color-eab308',
  '#6366f1': 'letter-color-6366f1',
  '#64748b': 'letter-color-64748b',
  '#a16207': 'letter-color-a16207',
  '#a855f7': 'letter-color-a855f7',
  '#16a34a': 'letter-color-16a34a',
  '#1f2937': 'letter-color-1f2937',
  '#ffffff': 'letter-color-ffffff',
  '#fff': 'letter-color-ffffff',
};

export const getLetterColorClass = (color: string): string =>
  LETTER_COLOR_CLASS_MAP[color.toLowerCase()] ?? 'text-text-primary';
