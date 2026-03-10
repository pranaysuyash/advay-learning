/**
 * Celebration Effects Component
 * 
 * Particle effects, confetti, and screen flash using Kenney assets.
 * 
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 */

import { useState, useEffect } from 'react';
import { KenneyIcon, type KenneyIconType } from '../ui/KenneyIcon';

export type EffectType = 'confetti' | 'stars' | 'coins' | 'burst' | 'flash';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  type: KenneyIconType;
  opacity: number;
}

interface CelebrationEffectsProps {
  trigger: boolean;
  type?: EffectType;
  origin?: { x: number; y: number };
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
}

/**
 * Generate random particles
 */
function generateParticles(
  count: number,
  origin: { x: number; y: number },
  type: EffectType
): Particle[] {
  const types: KenneyIconType[] = type === 'coins' 
    ? ['coin'] 
    : type === 'stars'
    ? ['star']
    : ['coin', 'gem', 'star'];

  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i}-${Date.now()}`,
    x: origin.x,
    y: origin.y,
    vx: (Math.random() - 0.5) * 10,
    vy: -Math.random() * 15 - 5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    scale: 0.5 + Math.random() * 0.5,
    type: types[Math.floor(Math.random() * types.length)],
    opacity: 1,
  }));
}

/**
 * CelebrationEffects - Particle effects using Kenney assets
 * 
 * Usage:
 * ```tsx
 * <CelebrationEffects 
 *   trigger={showCelebration}
 *   type="confetti"
 *   origin={{ x: 400, y: 300 }}
 *   onComplete={() => setShowCelebration(false)}
 * />
 * ```
 */
export function CelebrationEffects({
  trigger,
  type = 'confetti',
  origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  particleCount = 20,
  duration = 2000,
  onComplete,
}: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setParticles(generateParticles(particleCount, origin, type));
      setIsActive(true);
    }
  }, [trigger, type, origin, particleCount, isActive]);

  // Animation loop
  useEffect(() => {
    if (!isActive || particles.length === 0) return;

    let animationId: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 16; // Normalize to ~60fps
      lastTime = now;

      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 0.5 * dt, // Gravity
          rotation: p.rotation + p.rotationSpeed * dt,
          opacity: p.opacity - 0.01 * dt,
        })).filter(p => p.opacity > 0 && p.y < window.innerHeight + 100);

        if (updated.length === 0) {
          setIsActive(false);
          onComplete?.();
        }

        return updated;
      });

      if (isActive) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    // Auto-complete after duration
    const timeout = setTimeout(() => {
      setIsActive(false);
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
    };
  }, [isActive, particles.length, duration, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            opacity: particle.opacity,
          }}
        >
          <KenneyIcon type={particle.type} size={32} />
        </div>
      ))}
    </div>
  );
}

/**
 * ScreenFlash - Brief screen flash effect
 */
interface ScreenFlashProps {
  trigger: boolean;
  color?: string;
  duration?: number;
}

export function ScreenFlash({
  trigger,
  color = '#FFD700',
  duration = 300,
}: ScreenFlashProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (trigger) {
      setOpacity(0.5);
      const fadeOut = setTimeout(() => {
        setOpacity(0);
      }, duration / 2);

      return () => clearTimeout(fadeOut);
    }
  }, [trigger, duration]);

  if (opacity === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-300"
      style={{
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

/**
 * ComboCounter - Animated combo counter
 */
interface ComboCounterProps {
  combo: number;
  className?: string;
}

export function ComboCounter({ combo, className = '' }: ComboCounterProps) {
  const [show, setShow] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (combo > 1) {
      setShow(true);
      setScale(1.5);
      const timer = setTimeout(() => setScale(1), 200);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [combo]);

  if (!show) return null;

  const getComboText = () => {
    if (combo >= 10) return 'UNSTOPPABLE!';
    if (combo >= 7) return 'AMAZING!';
    if (combo >= 5) return 'GREAT!';
    if (combo >= 3) return 'COMBO!';
    return `${combo}x`;
  };

  const getComboColor = () => {
    if (combo >= 10) return '#FF1493';
    if (combo >= 7) return '#FF4500';
    if (combo >= 5) return '#FFD700';
    return '#00CED1';
  };

  return (
    <div
      className={`text-center ${className}`.trim()}
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.2s ease',
      }}
    >
      <p
        className="text-4xl font-black"
        style={{
          color: getComboColor(),
          textShadow: '0 0 20px currentColor',
        }}
      >
        {getComboText()}
      </p>
      <p className="text-lg text-white font-bold">{combo} in a row!</p>
    </div>
  );
}

/**
 * LevelUpAnimation - Level up celebration
 */
interface LevelUpAnimationProps {
  level: number;
  show: boolean;
  onComplete?: () => void;
}

export function LevelUpAnimation({ level, show, onComplete }: LevelUpAnimationProps) {
  const [phase, setPhase] = useState<'spawn' | 'hold' | 'fade'>('spawn');

  useEffect(() => {
    if (!show) {
      setPhase('spawn');
      return;
    }

    const holdTimer = setTimeout(() => setPhase('hold'), 500);
    const fadeTimer = setTimeout(() => setPhase('fade'), 2500);
    const completeTimer = setTimeout(() => onComplete?.(), 3000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [show, onComplete]);

  if (!show) return null;

  const getStyles = () => {
    switch (phase) {
      case 'spawn':
        return { transform: 'scale(0)', opacity: 0 };
      case 'hold':
        return { 
          transform: 'scale(1)', 
          opacity: 1,
          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        };
      case 'fade':
        return { 
          transform: 'scale(1.1)', 
          opacity: 0,
          transition: 'all 0.5s ease'
        };
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className="text-center"
        style={getStyles()}
      >
        <p className="text-6xl font-black text-yellow-400 mb-2 drop-shadow-lg">
          LEVEL UP!
        </p>
        <p className="text-4xl font-bold text-white drop-shadow-lg">
          Level {level}
        </p>
      </div>
    </div>
  );
}

/**
 * StreakFlame - Animated flame for streak display
 */
interface StreakFlameProps {
  streak: number;
  className?: string;
}

export function StreakFlame({ streak, className = '' }: StreakFlameProps) {
  const intensity = Math.min(streak / 10, 1);
  
  return (
    <div className={`relative ${className}`.trim()}>
      <div
        className="w-8 h-12 rounded-full"
        style={{
          background: `linear-gradient(to top, #FF4500, #FFD700)`,
          opacity: 0.3 + intensity * 0.7,
          transform: `scale(${1 + intensity * 0.5})`,
          animation: 'pulse 0.5s ease-in-out infinite',
        }}
      />
      {streak > 2 && (
        <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
          {streak}
        </span>
      )}
    </div>
  );
}

export default CelebrationEffects;
