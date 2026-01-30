import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { englishAlphabet } from '../alphabets';

const ICONS_DIR = path.resolve(process.cwd(), 'public', 'assets', 'icons');

describe('English alphabet icons', () => {
  it('has at least one existing icon per letter', () => {
    const missing: string[] = [];

    englishAlphabet.letters.forEach(letter => {
      const icons = Array.isArray(letter.icon) ? letter.icon : [letter.icon];
      const hasAny = icons.some(iconPath => {
        const basename = path.basename(iconPath);
        return fs.existsSync(path.join(ICONS_DIR, basename));
      });
      if (!hasAny) missing.push(letter.char + ':' + letter.name);
    });

    expect(missing).toEqual([]);
  });
});