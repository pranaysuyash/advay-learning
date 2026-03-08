import { useEffect, useState } from 'react';
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
    isSpeaking,
    isSupported,
    requiresCloudConsent,
    approveCloudConsent,
  } = useVoicePrompt();
  const [showCloudConsentGate, setShowCloudConsentGate] = useState(false);

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
          if (isSpeaking) {
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
          ${isSpeaking ? 'ring-2 ring-brand-primary ring-offset-2' : ''}
          ${className}
        `}
        aria-label={isSpeaking ? 'Stop speaking' : `Listen: ${text}`}
        title={isSpeaking ? 'Click to stop' : 'Click to listen'}
      >
        <motion.div
          animate={isSpeaking ? {
            scale: [1, 1.2, 1],
            transition: { repeat: Infinity, duration: 0.5 }
          } : {}}
        >
          <UIIcon 
            name={isSpeaking ? 'volume' : 'volume-off'} 
            size={iconSizes[size]} 
          />
        </motion.div>
        {label && <span>{isSpeaking ? 'Speaking...' : label}</span>}
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
