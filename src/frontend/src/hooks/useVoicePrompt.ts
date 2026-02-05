import { useCallback, useEffect, useRef, useState } from 'react';

interface VoicePromptOptions {
  rate?: number; // 0.1 to 10, default 0.9 (slower for kids)
  pitch?: number; // 0 to 2, default 1.1 (slightly higher for friendliness)
  volume?: number; // 0 to 1, default 1
  lang?: string; // default 'en-US'
}

interface UseVoicePromptReturn {
  speak: (text: string, options?: VoicePromptOptions) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  setPreferredVoice: (voice: SpeechSynthesisVoice | null) => void;
}

/**
 * Custom hook for text-to-speech voice prompts
 * Designed for pre-readers (ages 2-5) with kid-friendly defaults
 */
export function useVoicePrompt(): UseVoicePromptReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setIsSupported(true);

    // Load available voices
    const loadVoices = () => {
      const voices = synth.getVoices();
      setAvailableVoices(voices);
      
      // Auto-select a kid-friendly voice (prefer female voices that sound friendly)
      if (!preferredVoiceRef.current && voices.length > 0) {
        const preferredVoices = [
          // English voices that sound friendly/child-appropriate
          voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en')),
          voices.find(v => v.name.includes('Victoria') && v.lang.startsWith('en')),
          voices.find(v => v.name.includes('Karen') && v.lang.startsWith('en')),
          voices.find(v => v.name.includes('Google US English')),
          voices.find(v => v.lang === 'en-US' && v.name.includes('Female')),
          voices.find(v => v.lang === 'en-GB' && v.name.includes('Female')),
          // Fallback to any English voice
          voices.find(v => v.lang.startsWith('en')),
        ].filter(Boolean);
        
        preferredVoiceRef.current = preferredVoices[0] || voices[0];
      }
    };

    // Voices may load asynchronously
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
      synth.cancel();
    };
  }, []);

  const speak = useCallback((text: string, options: VoicePromptOptions = {}) => {
    const synth = synthRef.current;
    if (!synth || !isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Kid-friendly defaults
    utterance.rate = options.rate ?? 0.9; // Slightly slower
    utterance.pitch = options.pitch ?? 1.1; // Slightly higher/more playful
    utterance.volume = options.volume ?? 1;
    utterance.lang = options.lang ?? 'en-US';
    
    // Use preferred voice if available
    if (preferredVoiceRef.current) {
      utterance.voice = preferredVoiceRef.current;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const setPreferredVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    preferredVoiceRef.current = voice;
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    availableVoices,
    setPreferredVoice,
  };
}

export default useVoicePrompt;
