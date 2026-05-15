import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UIIcon } from './Icon';
import { useVoicePrompt } from '../../hooks/useVoicePrompt';
import { ParentGate } from './ParentGate';

interface VoiceButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  autoPlay?: boolean; // Auto-play on mount (for critical instructions)
  className?: string;
}

/**
 * Voice Button Component
 * Provides text-to-speech for pre-readers
 *
 * Usage:
 * <VoiceButton text="Click Allow to use your camera" label="Listen" />
 */
export function VoiceButton({
  text,
  label,
  size = 'md',
  variant = 'secondary',
  autoPlay = false,
  className = '',
}: VoiceButtonProps) {
  const {
    speak,
    stop,
    isSpeaking: isTTSspeaking,
    isSupported,
    requiresCloudConsent,
    approveCloudConsent,
  } = useVoicePrompt();
  const [showCloudConsentGate, setShowCloudConsentGate] = useState(false);
  const [showSpeakingLabel, setShowSpeakingLabel] = useState(false);
  const speakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync "Speaking..." label with actual audio output
  // The TTS sets isSpeaking=true immediately, but audio starts after ~300ms delay
  useEffect(() => {
    if (isTTSspeaking) {
      // Delay showing "Speaking..." to match when audio actually starts
      speakingTimerRef.current = setTimeout(() => {
        setShowSpeakingLabel(true);
      }, 300); // Wait for TTS to actually start producing audio

      // Clear any pending stop timer
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    } else {
      // Clear speaking timer if speech was stopped before audio started
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }

      // Keep showing "Speaking..." briefly after speech ends for smoother UX
      if (showSpeakingLabel) {
        stopTimerRef.current = setTimeout(() => {
          setShowSpeakingLabel(false);
        }, 200);
      } else {
        setShowSpeakingLabel(false);
      }
    }

    return () => {
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
      }
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
      }
    };
  }, [isTTSspeaking, showSpeakingLabel]);

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && isSupported) {
      const timer = setTimeout(() => {
        if (!requiresCloudConsent) {
          speak(text);
        }
      }, 500); // Small delay for better UX
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isSupported, speak, text, requiresCloudConsent]);

  if (!isSupported) {
    return null; // Don't show button if speech synthesis not supported
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-soft',
    secondary: 'bg-surface-secondary text-text-primary hover:bg-surface-tertiary border border-border',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => {
          if (isTTSspeaking) {
            stop();
          } else {
            if (requiresCloudConsent) {
              setShowCloudConsentGate(true);
              return;
            }
            speak(text);
          }
        }}
        whileTap={{ scale: 0.95 }}
        className={`
          inline-flex items-center justify-center rounded-lg font-medium transition-colors
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${showSpeakingLabel ? 'ring-2 ring-brand-primary ring-offset-2' : ''}
          ${className}
        `}
        aria-label={isTTSspeaking ? 'Stop speaking' : `Listen: ${text}`}
        title={isTTSspeaking ? 'Click to stop' : 'Click to listen'}
      >
        <motion.div
          animate={showSpeakingLabel ? {
            scale: [1, 1.2, 1],
            transition: { repeat: Infinity, duration: 0.5 }
          } : {}}
        >
          <UIIcon
            name={showSpeakingLabel ? 'volume' : 'volume-off'}
            size={iconSizes[size]}
          />
        </motion.div>
        {label && <span>{showSpeakingLabel ? 'Speaking...' : label}</span>}
      </motion.button>

      <ParentGate
        isOpen={showCloudConsentGate}
        onUnlock={() => {
          approveCloudConsent();
          setShowCloudConsentGate(false);
          speak(text);
        }}
        onCancel={() => setShowCloudConsentGate(false)}
        holdDuration={3000}
        title="Enable Cloud AI Fallback"
        message="Some voice responses may use cloud processing when local AI is unavailable. Hold to approve parent consent."
      />
    </>
  );
}

export default VoiceButton;
