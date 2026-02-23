import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, type RefObject } from 'react';

type HandAvatarState = 'idle' | 'tracking' | 'pinching' | 'success';

interface HandAvatarCursorProps {
  position: { x: number; y: number };
  coordinateSpace?: 'viewport' | 'normalized';
  containerRef?: RefObject<HTMLElement | null>;
  isPinching?: boolean;
  isHandDetected?: boolean;
  state?: HandAvatarState;
  size?: number;
  showTrail?: boolean;
  highContrast?: boolean;
  zIndex?: number;
}

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function HandAvatarCursor({
  position,
  coordinateSpace = 'viewport',
  containerRef,
  isPinching = false,
  isHandDetected = true,
  state = 'tracking',
  size = 84,
  showTrail = true,
  highContrast = false,
  zIndex = 9999,
}: HandAvatarCursorProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const resolvedPosition = useMemo(() => {
    if (coordinateSpace === 'normalized') {
      const rect = containerRef?.current?.getBoundingClientRect();
      if (rect) {
        return {
          x: rect.left + position.x * rect.width,
          y: rect.top + position.y * rect.height,
        };
      }
    }
    return position;
  }, [containerRef, coordinateSpace, position]);

  useEffect(() => {
    if (showTrail && isHandDetected) {
      const now = Date.now();
      setTrail((prev) =>
        [...prev, { ...resolvedPosition, timestamp: now }]
          .filter((p) => now - p.timestamp < 260)
          .slice(-4),
      );
    } else {
      setTrail([]);
    }
  }, [resolvedPosition, showTrail, isHandDetected]);

  if (!isHandDetected) return null;

  const cursorSize = Math.max(72, size);
  const palm = highContrast ? '#FFEB3B' : '#FDE68A';
  const outline = highContrast ? '#000000' : '#7C2D12';
  const shadowColor = isPinching ? '#22C55E' : '#F59E0B';
  const effectiveState: HandAvatarState = state === 'tracking' && isPinching ? 'pinching' : state;

  return (
    <>
      {showTrail &&
        trail.map((point, index) => {
          const age = Date.now() - point.timestamp;
          const opacity = Math.max(0, (260 - age) / 260);
          return (
            <div
              key={`${point.timestamp}-${index}`}
              style={{
                position: 'fixed',
                left: point.x - cursorSize * 0.15,
                top: point.y - cursorSize * 0.15,
                width: cursorSize * 0.3,
                height: cursorSize * 0.3,
                borderRadius: '999px',
                background: 'rgba(251, 191, 36, 0.55)',
                opacity,
                pointerEvents: 'none',
                zIndex: zIndex - 1,
              }}
            />
          );
        })}

      <motion.div
        data-testid='hand-avatar-cursor'
        style={{
          position: 'fixed',
          left: resolvedPosition.x - cursorSize / 2,
          top: resolvedPosition.y - cursorSize / 2,
          width: cursorSize,
          height: cursorSize,
          pointerEvents: 'none',
          zIndex,
          filter: `drop-shadow(0 0 12px ${shadowColor})`,
        }}
        animate={{
          scale:
            effectiveState === 'success'
              ? [1, 1.14, 1]
              : effectiveState === 'pinching'
                ? 1.08
                : [1, 1.03, 1],
          rotate: effectiveState === 'idle' ? [0, -2, 2, 0] : 0,
        }}
        transition={{
          scale: { duration: effectiveState === 'success' ? 0.45 : 1.6, repeat: effectiveState === 'tracking' ? Infinity : 0 },
          rotate: { duration: 2.2, repeat: effectiveState === 'idle' ? Infinity : 0 },
        }}
      >
        <svg
          width={cursorSize}
          height={cursorSize}
          viewBox='0 0 120 120'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
        >
          <g>
            <rect x='38' y='44' width='44' height='46' rx='18' fill={palm} stroke={outline} strokeWidth='5' />
            <rect x='44' y='24' width='11' height='28' rx='7' fill={palm} stroke={outline} strokeWidth='4' />
            <rect x='58' y='20' width='11' height='30' rx='7' fill={palm} stroke={outline} strokeWidth='4' />
            <rect
              x={effectiveState === 'pinching' ? '70' : '74'}
              y={effectiveState === 'pinching' ? '32' : '23'}
              width='11'
              height={effectiveState === 'pinching' ? '20' : '28'}
              rx='7'
              fill={palm}
              stroke={outline}
              strokeWidth='4'
            />
            <rect
              x={effectiveState === 'pinching' ? '26' : '22'}
              y={effectiveState === 'pinching' ? '50' : '58'}
              width='18'
              height='11'
              rx='7'
              transform={effectiveState === 'pinching' ? 'rotate(-25 35 55)' : 'rotate(-35 30 62)'}
              fill={palm}
              stroke={outline}
              strokeWidth='4'
            />
          </g>
          {effectiveState === 'pinching' && (
            <circle cx='70' cy='58' r='10' stroke='#22C55E' strokeWidth='4' fill='none' />
          )}
          {effectiveState === 'success' && (
            <g>
              <circle cx='95' cy='25' r='4' fill='#34D399' />
              <circle cx='102' cy='42' r='3' fill='#FBBF24' />
              <circle cx='20' cy='28' r='3' fill='#60A5FA' />
            </g>
          )}
        </svg>
      </motion.div>
    </>
  );
}

export type { HandAvatarCursorProps, HandAvatarState };
