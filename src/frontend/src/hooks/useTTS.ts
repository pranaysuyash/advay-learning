/**
 * useTTS Hook - React hook for Text-to-Speech
 *
 * Provides easy TTS integration for React components with
 * automatic settings synchronization, Kokoro model loading,
 * and cleanup.
 *
 * @see src/services/ai/tts/TTSService.ts
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { ttsService, TTSOptions, ActiveEngine } from '../services/ai/tts/TTSService';
import { useSettingsStore } from '../store/settingsStore';

export interface UseTTSReturn {
  /** Speak text with optional configuration */
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  /** Speak text in a specific language */
  speakInLanguage: (text: string, languageCode: string) => Promise<void>;
  /** Stop any ongoing speech */
  stop: () => void;
  /** Whether TTS is currently speaking */
  isSpeaking: boolean;
  /** Whether TTS is available in this browser */
  isAvailable: boolean;
  /** Whether TTS is enabled (user setting) */
  isEnabled: boolean;
  /** Whether the Kokoro neural model is loading */
  isModelLoading: boolean;
  /** Kokoro model loading progress (0-100) */
  modelLoadProgress: number;
  /** Which engine was used for the last speak() call */
  activeEngine: ActiveEngine;
}

/**
 * useTTS hook for Text-to-Speech functionality
 *
 * Automatically syncs with the settings store for soundEnabled and ttsEngine.
 * Initializes Kokoro model loading when engine preference is 'auto' or 'kokoro'.
 * Cleans up (stops speaking) when the component unmounts.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { speak, isSpeaking, isEnabled, isModelLoading } = useTTS();
 *
 *   const handleClick = async () => {
 *     await speak("Hello! I'm Pip!");
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={isSpeaking}>
 *       {isModelLoading ? 'Loading voice...' : isSpeaking ? 'Speaking...' : 'Say Hello'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTTS(): UseTTSReturn {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const ttsEngine = useSettingsStore((state) => state.ttsEngine);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [activeEngine, setActiveEngine] = useState<ActiveEngine>('web-speech');
  const mountedRef = useRef(true);

  // Sync settings store with TTS service
  useEffect(() => {
    ttsService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Sync engine preference and initialize Kokoro if needed
  useEffect(() => {
    ttsService.setEnginePreference(ttsEngine);

    if (ttsEngine === 'auto' || ttsEngine === 'kokoro') {
      setIsModelLoading(true);

      const unsubscribe = ttsService.onKokoroEvent((event) => {
        if (!mountedRef.current) return;

        if (event.type === 'progress') {
          setModelLoadProgress(event.percent ?? 0);
        } else if (event.type === 'ready') {
          setIsModelLoading(false);
          setModelLoadProgress(100);
        } else if (event.type === 'error') {
          setIsModelLoading(false);
        }
      });

      // Check if already ready (e.g. from another component)
      if (ttsService.getKokoroStatus() === 'ready') {
        setIsModelLoading(false);
        setModelLoadProgress(100);
      }

      return unsubscribe;
    } else {
      setIsModelLoading(false);
    }
  }, [ttsEngine]);

  // Track speaking state
  useEffect(() => {
    const checkSpeaking = () => {
      if (mountedRef.current) {
        setIsSpeaking(ttsService.isSpeaking());
      }
    };

    const interval = setInterval(checkSpeaking, 100);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      ttsService.stop();
    };
  }, []);

  const speak = useCallback(
    async (text: string, options?: TTSOptions) => {
      if (!soundEnabled) return;

      setIsSpeaking(true);
      try {
        await ttsService.speak(text, options);
        if (mountedRef.current) {
          setActiveEngine(ttsService.lastActiveEngine);
        }
      } finally {
        if (mountedRef.current) {
          setIsSpeaking(false);
        }
      }
    },
    [soundEnabled],
  );

  const speakInLanguage = useCallback(
    async (text: string, languageCode: string) => {
      if (!soundEnabled) return;

      setIsSpeaking(true);
      try {
        await ttsService.speakInLanguage(text, languageCode);
        if (mountedRef.current) {
          setActiveEngine(ttsService.lastActiveEngine);
        }
      } finally {
        if (mountedRef.current) {
          setIsSpeaking(false);
        }
      }
    },
    [soundEnabled],
  );

  const stop = useCallback(() => {
    ttsService.stop();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    speakInLanguage,
    stop,
    isSpeaking,
    isAvailable: ttsService.isAvailable(),
    isEnabled: soundEnabled && ttsService.isAvailable(),
    isModelLoading,
    modelLoadProgress,
    activeEngine,
  };
}

export default useTTS;
