import { describe, it, expect } from 'vitest';
import { getRandomIcon, getAllIcons } from '../iconUtils';
import { Letter } from '../../data/alphabets';

describe('iconUtils', () => {
  describe('getRandomIcon', () => {
    it('returns the single icon when letter has a string icon', () => {
      const letter: Letter = {
        char: 'A',
        name: 'Apple',
        icon: '/assets/icons/apple.svg',
        color: '#ef4444',
        pronunciation: 'ay',
      };

      const result = getRandomIcon(letter);
      expect(result).toBe('/assets/icons/apple.svg');
    });

    it('returns a random icon from the array when letter has multiple icons', () => {
      const letter: Letter = {
        char: 'A',
        name: 'Apple',
        icon: ['/assets/icons/apple.svg', '/assets/icons/aardvark.svg', '/assets/icons/airplane.svg'],
        color: '#ef4444',
        pronunciation: 'ay',
      };

      const result = getRandomIcon(letter);
      expect(letter.icon).toContain(result);
    });

    it('returns default icon when letter has no icons', () => {
      const letter: Letter = {
        char: 'A',
        name: 'Apple',
        icon: [],
        color: '#ef4444',
        pronunciation: 'ay',
      };

      const result = getRandomIcon(letter);
      expect(result).toBe('/assets/icons/default.svg');
    });
  });

  describe('getAllIcons', () => {
    it('returns single icon as array when letter has a string icon', () => {
      const letter: Letter = {
        char: 'A',
        name: 'Apple',
        icon: '/assets/icons/apple.svg',
        color: '#ef4444',
        pronunciation: 'ay',
      };

      const result = getAllIcons(letter);
      expect(result).toEqual(['/assets/icons/apple.svg']);
    });

    it('returns all icons when letter has multiple icons', () => {
      const letter: Letter = {
        char: 'A',
        name: 'Apple',
        icon: ['/assets/icons/apple.svg', '/assets/icons/aardvark.svg', '/assets/icons/airplane.svg'],
        color: '#ef4444',
        pronunciation: 'ay',
      };

      const result = getAllIcons(letter);
      expect(result).toEqual(['/assets/icons/apple.svg', '/assets/icons/aardvark.svg', '/assets/icons/airplane.svg']);
    });

    it('returns empty array when letter has no icons', () => {
      const letter: Letter = {
        char: 'A',
        name: 'Apple',
        icon: [],
        color: '#ef4444',
        pronunciation: 'ay',
      };

      const result = getAllIcons(letter);
      expect(result).toEqual([]);
    });
  });
});