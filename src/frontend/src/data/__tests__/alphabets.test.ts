import { describe, it, expect } from 'vitest';
import { 
  getAlphabet, 
  getLettersForGame, 
  englishAlphabet, 
  hindiAlphabet, 
  kannadaAlphabet 
} from '../alphabets';

describe('Alphabets', () => {
  describe('getAlphabet', () => {
    it('returns English alphabet by default', () => {
      const alphabet = getAlphabet('unknown');
      expect(alphabet.language).toBe('english');
    });

    it('returns English alphabet', () => {
      const alphabet = getAlphabet('english');
      expect(alphabet.language).toBe('english');
      expect(alphabet.letters).toHaveLength(26);
    });

    it('returns Hindi alphabet', () => {
      const alphabet = getAlphabet('hindi');
      expect(alphabet.language).toBe('hindi');
      expect(alphabet.letters.length).toBeGreaterThan(0);
    });

    it('returns Kannada alphabet', () => {
      const alphabet = getAlphabet('kannada');
      expect(alphabet.language).toBe('kannada');
      expect(alphabet.letters.length).toBeGreaterThan(0);
    });
  });

  describe('getLettersForGame', () => {
    it('returns 5 letters for easy difficulty', () => {
      const letters = getLettersForGame('english', 'easy');
      expect(letters).toHaveLength(5);
    });

    it('returns 10 letters for medium difficulty', () => {
      const letters = getLettersForGame('english', 'medium');
      expect(letters).toHaveLength(10);
    });

    it('returns all letters for hard difficulty', () => {
      const letters = getLettersForGame('english', 'hard');
      expect(letters).toHaveLength(26);
    });
  });

  describe('English Alphabet', () => {
    it('has 26 letters', () => {
      expect(englishAlphabet.letters).toHaveLength(26);
    });

    it('first letter is A', () => {
      expect(englishAlphabet.letters[0].char).toBe('A');
    });

    it('last letter is Z', () => {
      expect(englishAlphabet.letters[25].char).toBe('Z');
    });
  });

  describe('Hindi Alphabet', () => {
    it('has letters', () => {
      expect(hindiAlphabet.letters.length).toBeGreaterThan(0);
    });

    it('first letter is अ', () => {
      expect(hindiAlphabet.letters[0].char).toBe('अ');
    });
  });

  describe('Kannada Alphabet', () => {
    it('has letters', () => {
      expect(kannadaAlphabet.letters.length).toBeGreaterThan(0);
    });

    it('first letter is ಅ', () => {
      expect(kannadaAlphabet.letters[0].char).toBe('ಅ');
    });
  });
});
