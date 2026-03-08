import { useCallback, useEffect, useState } from 'react';
import { useFeatureFlag } from './useFeatureFlag';
import { llmService } from '../services/ai/llm';
import { ttsService } from '../services/ai/tts/TTSService';
import { useSettingsStore, useAITelemetryStore } from '../store';

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
  requiresCloudConsent: boolean;
  approveCloudConsent: () => void;
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
  const [requiresCloudConsent, setRequiresCloudConsent] = useState(false);
  const llmResponsesEnabled = useFeatureFlag('ai.llmResponsesV1');
  const cloudFallbackEnabled = useFeatureFlag('ai.cloudFallbackV1');
  const parentConsentForCloudAI = useSettingsStore(
    (s) => s.parentConsentForCloudAI,
  );
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const recordLLMUsage = useAITelemetryStore((s) => s.recordLLMUsage);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  useEffect(() => {
    llmService.updateConfig({
      cloudFallbackEnabled,
      parentConsent: parentConsentForCloudAI,
    });
  }, [cloudFallbackEnabled, parentConsentForCloudAI]);

  useEffect(() => {
    const unsubscribe = llmService.subscribeUsage((event) => {
      recordLLMUsage({
        provider: event.provider,
        source: event.source,
        model: event.model,
        latencyMs: event.latencyMs,
        cached: event.cached,
        fallbackUsed: event.fallbackUsed,
        reason: event.reason,
        timestamp: event.timestamp,
      });

      if (
        event.reason === 'cloud_blocked_no_consent_or_flag' &&
        !parentConsentForCloudAI
      ) {
        setRequiresCloudConsent(true);
      }

      if (event.source === 'cloud') {
        const nextCount = useSettingsStore.getState().aiCloudUsageCount + 1;
        updateSettings({ aiCloudUsageCount: nextCount });
      }
    });

    return unsubscribe;
  }, [
    parentConsentForCloudAI,
    recordLLMUsage,
    updateSettings,
  ]);

  const approveCloudConsent = useCallback(() => {
    updateSettings({ parentConsentForCloudAI: true });
    setRequiresCloudConsent(false);
  }, [updateSettings]);

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
    requiresCloudConsent,
    approveCloudConsent,
    availableVoices: [] as never[],
    setPreferredVoice: () => {},
  };
}

export default useVoicePrompt;
