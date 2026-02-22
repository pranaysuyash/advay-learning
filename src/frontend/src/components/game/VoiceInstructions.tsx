/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * VoiceInstructions - Text-to-Speech integration for games
 * 
 * CRITICAL FIXES FROM AUDIT:
 * - Zero text dependency (Issue IN-001)
 * - Clear voice instructions for pre-literate children (ages 2-4)
 * - Simple language (<3 sentences, 2-4 year vocabulary)
 * - Repeatable on demand
 * - Visual feedback showing speech is active
 * 
 * Issue References: IN-001 from EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md
 */

interface VoiceInstructionsProps {
  /** Instructions to speak (text) */
  instructions: string | string[];
  
  /** Auto-speak on mount (default: true) */
  autoSpeak?: boolean;
  
  /** Show visual indicator while speaking (default: true) */
  showIndicator?: boolean;
  
  /** Language code (default: 'en-US') */
  lang?: string;
  
  /** Speech rate (0.5-2.0, default: 0.9 - slightly slower for clarity) */
  rate?: number;
  
  /** Speech pitch (0.0-2.0, default: 1.1 - slightly higher for child-friendly) */
  pitch?: number;
  
  /** Voice name (default: browser default) */
  voiceName?: string;
  
  /** Callback when speech starts */
  onSpeechStart?: () => void;
  
  /** Callback when speech ends */
  onSpeechEnd?: () => void;
  
  /** Show replay button (default: true) */
  showReplayButton?: boolean;
  
  /** Custom replay button position */
  replayButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function VoiceInstructions({
  instructions,
  autoSpeak = true,
  showIndicator = true,
  lang = 'en-US',
  rate = 0.9, // MANDATORY: Slightly slower for clarity
  pitch = 1.1, // MANDATORY: Slightly higher for child-friendly tone
  voiceName,
  onSpeechStart,
  onSpeechEnd,
  showReplayButton = true,
  replayButtonPosition = 'top-right',
}: VoiceInstructionsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Load available voices
  useEffect(() => {
    function loadVoices() {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    }
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);
  
  // Select best voice
  const selectedVoice = voices.find(v => v.name === voiceName) ||
    voices.find(v => v.lang === lang && v.name.includes('Female')) ||
    voices.find(v => v.lang === lang) ||
    voices[0];
  
  // Speak function
  const speak = useCallback(() => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const textToSpeak = Array.isArray(instructions)
      ? instructions.join(' ... ') // Pause between sentences
      : instructions;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onSpeechStart) {
        onSpeechStart();
      }
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onSpeechEnd) {
        onSpeechEnd();
      }
    };
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [instructions, lang, rate, pitch, selectedVoice, onSpeechStart, onSpeechEnd]);
  
  // Auto-speak on mount or instruction change
  useEffect(() => {
    if (autoSpeak) {
      // Delay slightly to avoid browser blocking (requires user interaction)
      const timer = setTimeout(() => {
        speak();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [instructions, autoSpeak, speak]);
  
  return (
    <>
      {/* Visual indicator */}
      {showIndicator && isSpeaking && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: '#FFD700',
            borderRadius: '16px',
            padding: '12px 24px',
            border: '3px solid #000000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Animated speaker icon */}
          <div
            style={{
              fontSize: '32px',
              animation: 'pulse-speaker 1s ease-in-out infinite',
            }}
          >
            🔊
          </div>
          
          {/* Sound waves animation */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: '20px',
                  backgroundColor: '#000000',
                  borderRadius: '2px',
                  animation: `sound-wave 0.8s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Replay button */}
      {showReplayButton && (
        <button
          onClick={speak}
          disabled={isSpeaking}
          style={{
            position: 'fixed',
            ...getPositionStyles(replayButtonPosition),
            zIndex: 100,
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: isSpeaking ? '#CCCCCC' : '#4ECDC4',
            border: '4px solid #000000',
            cursor: isSpeaking ? 'not-allowed' : 'pointer',
            fontSize: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s, background-color 0.2s',
            transform: isSpeaking ? 'scale(0.95)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!isSpeaking) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSpeaking) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          aria-label="Replay instructions"
        >
          🔄
        </button>
      )}
      
      <style>{pulseAnimationCSS}</style>
    </>
  );
}

/**
 * Get position styles for replay button
 */
function getPositionStyles(position: string) {
  const offset = '24px';
  
  switch (position) {
    case 'top-left':
      return { top: offset, left: offset };
    case 'top-right':
      return { top: offset, right: offset };
    case 'bottom-left':
      return { bottom: offset, left: offset };
    case 'bottom-right':
      return { bottom: offset, right: offset };
    default:
      return { top: offset, right: offset };
  }
}

/**
 * CSS animations
 */
const pulseAnimationCSS = `
@keyframes pulse-speaker {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes sound-wave {
  0%, 100% { height: 12px; opacity: 0.5; }
  50% { height: 28px; opacity: 1; }
}
`;

/**
 * Utility hook for managing voice instructions in games
 */
export function useVoiceInstructions(initialInstructions?: string | string[]) {
  const [instructions, setInstructions] = useState<string | string[]>(initialInstructions || '');
  const [shouldSpeak, setShouldSpeak] = useState(false);
  
  const speak = useCallback((text: string | string[]) => {
    setInstructions(text);
    setShouldSpeak(true);
    
    // Reset after speaking
    setTimeout(() => {
      setShouldSpeak(false);
    }, 100);
  }, []);
  
  const speakSequence = useCallback(async (texts: string[], delayBetween: number = 1000) => {
    for (const text of texts) {
      speak(text);
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }
  }, [speak]);
  
  return {
    instructions,
    shouldSpeak,
    speak,
    speakSequence,
    component: shouldSpeak ? (
      <VoiceInstructions instructions={instructions} autoSpeak={shouldSpeak} />
    ) : null,
  };
}

/**
 * Pre-defined voice instructions for common game scenarios
 */
export const GAME_INSTRUCTIONS = {
  // Start instructions
  GAME_START: "Let's play! Show me your hand!",
  HAND_DETECTED: "Great! I can see your hand!",
  HAND_LOST: "I can't see your hand! Show it to the camera!",
  
  // Gesture instructions
  PINCH_TO_SELECT: "Make a pinch to grab!",
  WAVE_TO_START: "Wave your hand to begin!",
  POINT_TO_CHOOSE: "Point at what you want!",
  OPEN_HAND: "Open your hand wide!",
  CLOSE_HAND: "Make a fist!",
  
  // Feedback
  SUCCESS: "Amazing! You did it!",
  TRY_AGAIN: "Not quite! Try again!",
  GREAT_JOB: "Great job! Keep going!",
  ALMOST: "So close! One more try!",
  
  // Game events
  LEVEL_COMPLETE: "You finished! Let's try the next one!",
  GAME_COMPLETE: "You're amazing! You finished all the levels!",
  NEW_LEVEL: "Here's a new challenge!",
  
  // Specific games
  BUBBLE_POP: "Pop the bubbles by pinching them!",
  EMOJI_MATCH: "Find the matching emoji!",
  COLOR_SPLASH: "Paint with your finger!",
  DRESS_WEATHER: "Dress them for the weather!",
} as const;

/**
 * Usage Example:
 * 
 * ```tsx
 * function MyGame() {
 *   const { speak } = useVoiceInstructions();
 *   
 *   useEffect(() => {
 *     // Speak instructions on mount
 *     speak(GAME_INSTRUCTIONS.GAME_START);
 *   }, []);
 *   
 *   function onCorrectAnswer() {
 *     speak(GAME_INSTRUCTIONS.SUCCESS);
 *   }
 *   
 *   return (
 *     <div>
 *       <VoiceInstructions 
 *         instructions={["Pop the bubbles!", "Use your finger to pinch!"]}
 *         autoSpeak={true}
 *         showReplayButton={true}
 *       />
 *       
  *       <div>Game content here</div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Testing Requirements:
 * - [ ] Instructions use 2-4 year vocabulary only
 * - [ ] Sentences are <10 words each
 * - [ ] Voice is clear and friendly (tested with 5+ children)
 * - [ ] No text dependency (all game instructions have voice equivalents)
 * - [ ] Replay button is easily accessible and large (80x80px minimum)
 * - [ ] Speech rate tested for clarity (0.8-1.0 optimal for toddlers)
 * - [ ] Visual indicator matches speech timing (no lag >100ms)
 */
