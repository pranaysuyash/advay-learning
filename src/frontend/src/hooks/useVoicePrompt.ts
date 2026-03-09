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

export interface TTSVoiceInfo {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

interface UseVoicePromptReturn {
  speak: (text: string, options?: VoicePromptOptions) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  requiresCloudConsent: boolean;
  approveCloudConsent: () => void;
  /** Available voices for the current TTS engine */
  availableVoices: TTSVoiceInfo[];
  /** Set a preferred voice by name (from availableVoices) */
  setPreferredVoice: (voiceName: string) => void;
}

/**
 * Custom hook for text-to-speech voice prompts.
 * Routes through ttsService (Kokoro primary, Web Speech fallback).
 */
export function useVoicePrompt(): UseVoicePromptReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [requiresCloudConsent, setRequiresCloudConsent] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<TTSVoiceInfo[]>([]);
  const [preferredVoice, setPreferredVoiceState] = useState<string>('');
  const llmResponsesEnabled = useFeatureFlag('ai.llmResponsesV1');
  const cloudFallbackEnabled = useFeatureFlag('ai.cloudFallbackV1');
  const parentConsentForCloudAI = useSettingsStore(
    (s) => s.parentConsentForCloudAI,
  );
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const recordLLMUsage = useAITelemetryStore((s) => s.recordLLMUsage);
  const recordVoiceError = useAITelemetryStore((s) => s.recordVoiceError);

  // Load available voices on mount
  useEffect(() => {
    const voices = ttsService.getVoices();
    setAvailableVoices(voices);

    // Voices may load asynchronously in some browsers
    if (voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        setAvailableVoices(ttsService.getVoices());
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Restore preferred voice from settings if available
  useEffect(() => {
    const settings = useSettingsStore.getState();
    if (settings.preferredVoice) {
      setPreferredVoiceState(settings.preferredVoice);
    }
  }, []);

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

  const setPreferredVoice = useCallback((voiceName: string) => {
    setPreferredVoiceState(voiceName);
    updateSettings({ preferredVoice: voiceName });
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
            voiceName: preferredVoice || undefined,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          // Check if preferred voice was unavailable (primary concern for accessibility)
          const fallbackUsed = preferredVoice ? !availableVoices.some(v => v.name === preferredVoice) : false;
          recordVoiceError({
            type: 'tts_failed',
            message,
            preferredVoice: preferredVoice || undefined,
            fallbackUsed,
          });
          console.warn('[VoicePrompt] TTS failed:', message);
        } finally {
          setIsSpeaking(false);
        }
      })();
    },
    [llmResponsesEnabled, preferredVoice, availableVoices, recordVoiceError],
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
    availableVoices,
    setPreferredVoice,
  };
}

export default useVoicePrompt;
