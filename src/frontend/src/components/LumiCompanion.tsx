/**
 * Lumi Companion Component
 *
 * Specialized component for Lumi the Light Guide character.
 * Focuses on social-emotional learning interactions and complements PIP.
 *
 * @see docs/LUMI_COMPANION_CHARACTER_PLAN.md
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSocialStore } from '../store/socialStore';
import { Mascot } from './Mascot';

interface LumiCompanionProps {
  /** Current emotional state */
  state?: 'idle' | 'happy' | 'caring' | 'thinking' | 'celebrating';
  /** CSS classes for positioning */
  className?: string;
  /** Social context for response selection */
  socialContext?: {
    action: 'shared' | 'helped' | 'waited' | 'cooperated' | 'comforted';
    success?: boolean;
    groupSize?: number;
  };
}

export function LumiCompanion({
  state = 'idle',
  className = '',
  socialContext,
}: LumiCompanionProps) {
  const reducedMotion = useReducedMotion();
  const [showGlow, setShowGlow] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const { recordSocialAction, activeCharacters } = useSocialStore();

  // Gentle glow effect for caring moments
  useEffect(() => {
    if (reducedMotion) return;
    if (state === 'caring' || state === 'celebrating') {
      setShowGlow(true);
      setIsGlowing(true);

      const timer = setTimeout(() => {
        setIsGlowing(false);
        setTimeout(() => setShowGlow(false), 1000); // Fade out
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state, reducedMotion]);

  // Record social actions when appropriate
  useEffect(() => {
    if (socialContext) {
      // Map social context to metrics
      const metricMap = {
        shared: 'sharing' as const,
        helped: 'caring' as const,
        waited: 'patience' as const,
        cooperated: 'cooperation' as const,
        comforted: 'caring' as const,
      };

      const metric = metricMap[socialContext.action];
      if (metric && socialContext.success !== false) {
        recordSocialAction(metric);
      }
    }
  }, [socialContext, recordSocialAction]);

  // Only render if Lumi is active
  if (!activeCharacters.includes('lumi')) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Gentle glow effect */}
      <AnimatePresence>
        {showGlow && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isGlowing ? 0.6 : 0,
              scale: isGlowing ? 1.2 : 0.8
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0.01 } : { duration: 0.5 }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 blur-xl"
          />
        )}
      </AnimatePresence>

      {/* Lumi Character */}
      <motion.div
        animate={state}
        className="relative"
        whileHover={reducedMotion ? undefined : { scale: 1.03 }}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      >
        {/* Lumi's orb body */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Base orb */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-300 to-purple-400 shadow-lg border-2 border-white/50" />

          {/* Face features */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            </div>

            {/* Gentle smile */}
            <div className="w-3 h-1 border-b-2 border-blue-600 rounded-full" />
          </div>

          {/* Soft inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-200/50 to-purple-300/50" />
        </div>

        {/* Gentle floating particles */}
        <AnimatePresence>
          {!reducedMotion && (state === 'happy' || state === 'celebrating') && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-10, -30, -50],
                    x: [0, (i - 1) * 15, (i - 1) * 25],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute w-1 h-1 rounded-full bg-blue-300"
                  style={{
                    left: `${40 + i * 15}%`,
                    top: '20%',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Social indicator */}
      {socialContext && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-300 border-2 border-white flex items-center justify-center"
        >
          <span className="text-xs text-white font-bold" role="img" aria-label="Social action">
            🤝
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Helper component for dual character display
export function DualCharacterDisplay({
  pipState = 'idle',
  lumiState = 'idle',
  pipMessage,
  socialContext,
  className = '',
}: {
  pipState?: 'idle' | 'happy' | 'thinking' | 'waiting' | 'celebrating';
  lumiState?: 'idle' | 'happy' | 'caring' | 'thinking' | 'celebrating';
  pipMessage?: string;
  socialContext?: LumiCompanionProps['socialContext'];
  className?: string;
}) {
  const { activeCharacters } = useSocialStore();

  return (
    <div className={`flex items-end justify-center space-x-8 ${className}`}>
      {/* PIP on the left */}
      {activeCharacters.includes('pip') && (
        <div className="flex flex-col items-center">
          <Mascot
            state={pipState}
            message={pipMessage}
            enableVideo={false}
            className="mb-2"
          />
          <span className="text-xs font-medium text-gray-600">Pip</span>
        </div>
      )}

      {/* Lumi on the right */}
      {activeCharacters.includes('lumi') && (
        <div className="flex flex-col items-center">
          <LumiCompanion
            state={lumiState}
            socialContext={socialContext}
            className="mb-2"
          />
          <span className="text-xs font-medium text-gray-600">Lumi</span>
        </div>
      )}
    </div>
  );
}

export default LumiCompanion;
