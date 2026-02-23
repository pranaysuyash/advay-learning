import { useCallback, useEffect, useState } from 'react';
import { ttsService } from '../services/ai/tts/TTSService';

interface VoicePromptOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

interface UseVoicePromptReturn {
  speak: (text: string, options?: VoicePromptOptions) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  /** @deprecated No longer needed — ttsService manages voice selection */
  availableVoices: never[];
  /** @deprecated No longer needed — ttsService manages voice selection */
  setPreferredVoice: (voice: unknown) => void;
}

/**
 * Custom hook for text-to-speech voice prompts.
 * Routes through ttsService (Kokoro primary, Web Speech fallback).
 */
export function useVoicePrompt(): UseVoicePromptReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const speak = useCallback((text: string, options: VoicePromptOptions = {}) => {
    ttsService.stop();
    setIsSpeaking(true);

    ttsService.speak(text, {
      rate: options.rate ?? 0.9,
      volume: options.volume ?? 1,
      lang: options.lang ?? 'en-US',
    }).then(() => {
      setIsSpeaking(false);
    }).catch(() => {
      setIsSpeaking(false);
    });
  }, []);

  const stop = useCallback(() => {
    ttsService.stop();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: ttsService.isAvailable(),
    availableVoices: [] as never[],
    setPreferredVoice: () => { },
  };
}

export default useVoicePrompt;

