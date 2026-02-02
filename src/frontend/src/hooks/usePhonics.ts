import { useCallback } from 'react';
import { useTTS } from './useTTS';

/**
 * Phonics hook for letter sound pronunciation
 * Uses existing TTS system for natural speech
 */

// Phoneme mappings for letters (English)
const PHONEME_MAP: Record<string, { sound: string; word: string; emoji: string }> = {
  A: { sound: 'ah', word: 'apple', emoji: '🍎' },
  B: { sound: 'buh', word: 'ball', emoji: '🏐' },
  C: { sound: 'kuh', word: 'cat', emoji: '🐱' },
  D: { sound: 'duh', word: 'dog', emoji: '🐕' },
  E: { sound: 'eh', word: 'elephant', emoji: '🐘' },
  F: { sound: 'fff', word: 'fish', emoji: '🐟' },
  G: { sound: 'guh', word: 'goat', emoji: '🐐' },
  H: { sound: 'huh', word: 'hat', emoji: '🎩' },
  I: { sound: 'ih', word: 'igloo', emoji: '🏠' },
  J: { sound: 'juh', word: 'jump', emoji: '🦘' },
  K: { sound: 'kuh', word: 'kite', emoji: '🪁' },
  L: { sound: 'lll', word: 'lion', emoji: '🦁' },
  M: { sound: 'mmm', word: 'moon', emoji: '🌙' },
  N: { sound: 'nnn', word: 'nest', emoji: '🪺' },
  O: { sound: 'oh', word: 'octopus', emoji: '🐙' },
  P: { sound: 'puh', word: 'pig', emoji: '🐷' },
  Q: { sound: 'kwuh', word: 'queen', emoji: '👸' },
  R: { sound: 'rrr', word: 'rabbit', emoji: '🐰' },
  S: { sound: 'sss', word: 'sun', emoji: '☀️' },
  T: { sound: 'tuh', word: 'tree', emoji: '🌳' },
  U: { sound: 'uh', word: 'umbrella', emoji: '☂️' },
  V: { sound: 'vvv', word: 'van', emoji: '🚐' },
  W: { sound: 'wuh', word: 'water', emoji: '💧' },
  X: { sound: 'ks', word: 'xray', emoji: '🩻' },
  Y: { sound: 'yuh', word: 'yellow', emoji: '💛' },
  Z: { sound: 'zzz', word: 'zebra', emoji: '🦓' },
};

// Hindi phoneme hints (simplified, using Devanagari script recognition)
const HINDI_PHONEME_HINTS: Record<string, string> = {
  'अ': 'uh sound',
  'आ': 'aa sound',
  'इ': 'ih sound',
  'ई': 'ee sound',
  'उ': 'oo sound',
  'क': 'kuh sound',
  'ख': 'khuh sound',
  'ग': 'guh sound',
  // Add more as needed
};

interface PhonicsHook {
  /** Speak the phonetic sound of a letter */
  speakLetterSound: (letter: string, language?: string) => void;
  /** Speak "X is for Word" */
  speakWordExample: (letter: string, language?: string) => void;
  /** Get phoneme info for a letter */
  getPhonemeInfo: (letter: string) => { sound: string; word: string; emoji: string } | null;
  /** Check if phonics is enabled */
  isEnabled: boolean;
}

export function usePhonics(): PhonicsHook {
  const { speak, isSupported } = useTTS();
  
  const getPhonemeInfo = useCallback((letter: string) => {
    const upperLetter = letter.toUpperCase();
    return PHONEME_MAP[upperLetter] || null;
  }, []);
  
  const speakLetterSound = useCallback((letter: string, language: string = 'en') => {
    if (!isSupported) return;
    
    const upperLetter = letter.toUpperCase();
    
    if (language === 'en') {
      const info = PHONEME_MAP[upperLetter];
      if (info) {
        // Speak the phonetic sound
        speak(info.sound, { rate: 0.8, pitch: 1.2 });
      } else {
        // Fallback: just say the letter
        speak(upperLetter, { rate: 0.8 });
      }
    } else if (language === 'hi') {
      // For Hindi, try to get hint or just say the letter
      const hint = HINDI_PHONEME_HINTS[letter];
      if (hint) {
        speak(hint, { rate: 0.8, lang: 'hi-IN' });
      } else {
        speak(letter, { rate: 0.8, lang: 'hi-IN' });
      }
    } else {
      // Other languages: just say the letter
      speak(letter, { rate: 0.8 });
    }
  }, [speak, isSupported]);
  
  const speakWordExample = useCallback((letter: string, language: string = 'en') => {
    if (!isSupported) return;
    
    const upperLetter = letter.toUpperCase();
    
    if (language === 'en') {
      const info = PHONEME_MAP[upperLetter];
      if (info) {
        // "B is for Ball!"
        speak(`${upperLetter} is for ${info.word}!`, { rate: 0.9, pitch: 1.1 });
      }
    } else {
      // For other languages, just congratulate
      speak(`Great job with ${letter}!`, { rate: 0.9 });
    }
  }, [speak, isSupported]);
  
  return {
    speakLetterSound,
    speakWordExample,
    getPhonemeInfo,
    isEnabled: isSupported,
  };
}

export default usePhonics;
