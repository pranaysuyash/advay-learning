/**
 * useVoiceRecognition hook - Voice input via Web Speech API
 *
 * Provides voice recognition for games using the browser's native
 * SpeechRecognition API (Web Speech API).
 *
 * @example
 * ```tsx
 * const {
 *   isListening,
 *   transcript,
 *   startListening,
 *   stopListening,
 *   resetTranscript,
 *   isSupported,
 *   error
 * } = useVoiceRecognition({
 *   gameName: 'VoiceStories',
 *   continuous: false,
 *   language: 'en-US',
 *   onResult: (text) => console.log('Heard:', text),
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
}

// Polyfill for SpeechRecognition
type SpeechRecognitionConstructor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  
  const Win = window as any;
  return Win.SpeechRecognition || Win.webkitSpeechRecognition || null;
}

export interface UseVoiceRecognitionOptions {
  /** Name of the game for logging/debugging */
  gameName?: string;
  /** Language code (default: 'en-US') */
  language?: string;
  /** Whether to listen continuously (default: false) */
  continuous?: boolean;
  /** Whether to return interim results (default: false) */
  interimResults?: boolean;
  /** Callback when a final result is received */
  onResult?: (transcript: string, confidence: number) => void;
  /** Callback when an interim result is received */
  onInterimResult?: (transcript: string) => void;
  /** Callback when listening starts */
  onListeningStart?: () => void;
  /** Callback when listening ends */
  onListeningEnd?: () => void;
  /** Callback for errors */
  onError?: (error: string) => void;
}

export interface UseVoiceRecognitionReturn {
  /** Whether voice recognition is currently listening */
  isListening: boolean;
  /** The current transcript */
  transcript: string;
  /** The current interim (non-final) transcript */
  interimTranscript: string;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Reset the transcript */
  resetTranscript: () => void;
  /** Whether Web Speech API is supported */
  isSupported: boolean;
  /** Current error state */
  error: string | null;
  /** Confidence of the last result (0-1) */
  confidence: number;
}

/**
 * High-level voice recognition hook for games
 *
 * Provides a simple interface for voice input using the Web Speech API.
 * Handles browser compatibility, error recovery, and cleanup.
 */
export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {},
): UseVoiceRecognitionReturn {
  const {
    gameName: providedGameName = 'Game',
    language = 'en-US',
    continuous = false,
    interimResults = false,
    onResult,
    onInterimResult,
    onListeningStart,
    onListeningEnd,
    onError,
  } = options;

  const gameName = providedGameName;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isSupported] = useState(() => getSpeechRecognition() !== null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Create recognition instance
  const createRecognition = useCallback((): SpeechRecognition | null => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      console.warn(`[${gameName}] SpeechRecognition not supported`);
      return null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const resultIndex = event.resultIndex;

      for (let i = resultIndex; i < results.length; i++) {
        const result = results[i];
        const firstAlternative = result[0];
        const text = firstAlternative.transcript;
        const conf = firstAlternative.confidence;

        if (result.isFinal) {
          setTranscript(prev => prev + text);
          setInterimTranscript('');
          setConfidence(conf);
          onResult?.(text, conf);
          console.log(`[${gameName}] Final result: "${text}" (${conf})`);
        } else if (interimResults) {
          setInterimTranscript(text);
          onInterimResult?.(text);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg = event.error;
      console.error(`[${gameName}] Speech recognition error:`, errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);

      // Don't stop on 'no-speech' or 'aborted' errors
      if (errorMsg !== 'no-speech' && errorMsg !== 'aborted') {
        setIsListening(false);
        isListeningRef.current = false;
        onListeningEnd?.();
      }
    };

    recognition.onstart = () => {
      console.log(`[${gameName}] Listening started`);
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      onListeningStart?.();
    };

    recognition.onend = () => {
      console.log(`[${gameName}] Listening ended`);
      const shouldRestart = continuous && isListeningRef.current;
      setIsListening(false);
      isListeningRef.current = false;
      onListeningEnd?.();

      // Auto-restart if continuous mode and still should be listening
      if (shouldRestart) {
        try {
          recognition.start();
          isListeningRef.current = true;
        } catch (e) {
          // Ignore restart errors
        }
      }
    };

    recognition.onspeechstart = () => {
      console.log(`[${gameName}] Speech detected`);
    };

    recognition.onspeechend = () => {
      console.log(`[${gameName}] Speech ended`);
    };

    return recognition;
  }, [gameName, continuous, interimResults, language, onResult, onInterimResult, onListeningStart, onListeningEnd, onError]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'SpeechRecognition not supported in this browser';
      console.warn(`[${gameName}] ${msg}`);
      setError(msg);
      onError?.(msg);
      return;
    }

    if (isListeningRef.current) {
      console.log(`[${gameName}] Already listening`);
      return;
    }

    try {
      // Stop any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }

      // Create new recognition instance
      const recognition = createRecognition();
      if (!recognition) return;

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[${gameName}] Failed to start listening:`, errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [isSupported, gameName, createRecognition, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    } catch (err) {
      // Ignore stop errors
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          isListeningRef.current = false;
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
    confidence,
  };
}

export default useVoiceRecognition;
