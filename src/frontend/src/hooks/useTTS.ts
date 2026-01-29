/**
 * useTTS Hook - React hook for Text-to-Speech
 *
 * Provides easy TTS integration for React components with
 * automatic settings synchronization and cleanup.
 *
 * @see src/services/ai/tts/TTSService.ts
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { ttsService, TTSOptions } from '../services/ai/tts/TTSService';
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
}

/**
 * useTTS hook for Text-to-Speech functionality
 *
 * Automatically syncs with the settings store for soundEnabled toggle.
 * Cleans up (stops speaking) when the component unmounts.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { speak, isSpeaking, isEnabled } = useTTS();
 *
 *   const handleClick = async () => {
 *     await speak("Hello! I'm Pip!");
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={isSpeaking}>
 *       {isSpeaking ? 'Speaking...' : 'Say Hello'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTTS(): UseTTSReturn {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);

  // Sync settings store with TTS service
  useEffect(() => {
    ttsService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Track speaking state
  useEffect(() => {
    const checkSpeaking = () => {
      if (mountedRef.current) {
        setIsSpeaking(ttsService.isSpeaking());
      }
    };

    // Poll speaking state (Web Speech API doesn't have great events)
    const interval = setInterval(checkSpeaking, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      ttsService.stop();
    };
  }, []);

  const speak = useCallback(async (text: string, options?: TTSOptions) => {
    if (!soundEnabled) return;

    setIsSpeaking(true);
    try {
      await ttsService.speak(text, options);
    } finally {
      if (mountedRef.current) {
        setIsSpeaking(false);
      }
    }
  }, [soundEnabled]);

  const speakInLanguage = useCallback(async (text: string, languageCode: string) => {
    if (!soundEnabled) return;

    setIsSpeaking(true);
    try {
      await ttsService.speakInLanguage(text, languageCode);
    } finally {
      if (mountedRef.current) {
        setIsSpeaking(false);
      }
    }
  }, [soundEnabled]);

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
  };
}

export default useTTS;
