import { useCallback, useEffect, useState } from 'react';
import { useFeatureFlag } from './useFeatureFlag';
import { llmService } from '../services/ai/llm';
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
  const llmResponsesEnabled = useFeatureFlag('ai.llmResponsesV1');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const speak = useCallback(
    (text: string, options: VoicePromptOptions = {}) => {
      ttsService.stop();
      setIsSpeaking(true);

      void (async () => {
        try {
          let finalText = text;

          if (llmResponsesEnabled) {
            const generated = await llmService.generateText({ prompt: text });
            if (generated.text.trim().length > 0) {
              finalText = generated.text;
            }
          }

          await ttsService.speak(finalText, {
            rate: options.rate ?? 0.9,
            volume: options.volume ?? 1,
            lang: options.lang ?? 'en-US',
          });
        } finally {
          setIsSpeaking(false);
        }
      })();
    },
    [llmResponsesEnabled],
  );

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
    setPreferredVoice: () => {},
  };
}

export default useVoicePrompt;
