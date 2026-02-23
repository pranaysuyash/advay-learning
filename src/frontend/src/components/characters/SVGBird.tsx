import React, { useState, useEffect } from 'react';
import './SVGBird.css';

export type BirdExpression = 'idle' | 'singing' | 'happy' | 'thinking' | 'surprised';
export type BirdSize = 'sm' | 'md' | 'lg' | 'xl';

interface SVGBirdProps {
  expression: BirdExpression;
  size?: BirdSize;
  eyeTracking?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap: Record<BirdSize, { width: number; height: number }> = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 160, height: 160 },
  xl: { width: 200, height: 200 },
};

export const SVGBird: React.FC<SVGBirdProps> = ({
  expression,
  size = 'md',
  eyeTracking = true,
  onClick,
  className = '',
}) => {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const dimensions = sizeMap[size];

  // Eye tracking
  useEffect(() => {
    if (!eyeTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      const bird = document.getElementById('svg-bird');
      if (!bird) return;

      const rect = bird.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const maxOffset = 3;
      const x = Math.min(maxOffset, Math.max(-maxOffset, (e.clientX - centerX) / 40));
      const y = Math.min(maxOffset, Math.max(-maxOffset, (e.clientY - centerY) / 40));

      setPupilOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [eyeTracking]);

  // Auto-blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Beak variants based on expression
  const getBeakPath = () => {
    switch (expression) {
      case 'singing':
        return 'M45,50 Q55,45 65,50 Q55,65 45,50'; // Open beak
      case 'happy':
        return 'M45,50 Q55,45 65,50 Q55,60 45,50'; // Slightly open
      case 'surprised':
        return 'M48,48 Q55,42 62,48 Q55,62 48,48'; // Round open
      case 'thinking':
        return 'M45,52 Q55,50 62,52 Q55,58 45,52'; // Closed small
      default:
        return 'M45,52 Q55,50 62,52 Q55,58 45,52'; // Closed
    }
  };

  // Wing position based on expression
  const getWingTransform = () => {
    switch (expression) {
      case 'singing':
        return 'rotate(-20, 35, 70)';
      case 'happy':
        return 'rotate(-10, 35, 70)';
      default:
        return 'rotate(0, 35, 70)';
    }
  };

  // Musical notes for singing
  const renderNotes = () => {
    if (expression !== 'singing') return null;
    
    return (
      <>
        <text x="70" y="30" fontSize="20" fill="#f59e0b" className="bird-note note-1">♪</text>
        <text x="85" y="25" fontSize="16" fill="#f59e0b" className="bird-note note-2">♫</text>
        <text x="95" y="35" fontSize="18" fill="#f59e0b" className="bird-note note-3">♪</text>
      </>
    );
  };

  return (
    <div
      id="svg-bird"
      className={`svg-bird expression-${expression} ${className}`}
      onClick={onClick}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="bird-svg"
      >
        <defs>
          <radialGradient id="bodyGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Tail */}
        <path
          d="M15,60 L5,50 L5,70 Z"
          fill="#b91c1c"
          className="bird-tail"
        />

        {/* Body */}
        <ellipse
          cx="50"
          cy="60"
          rx="35"
          ry="30"
          fill="url(#bodyGradient)"
          className="bird-body"
        />

        {/* Belly */}
        <ellipse
          cx="50"
          cy="68"
          rx="25"
          ry="18"
          fill="#fef3c7"
          className="bird-belly"
        />

        {/* Wing */}
        <path
          d="M25,55 Q35,45 45,55 Q40,75 25,70 Z"
          fill="url(#wingGradient)"
          className="bird-wing"
          transform={getWingTransform()}
        />

        {/* Head */}
        <circle
          cx="50"
          cy="35"
          r="22"
          fill="url(#bodyGradient)"
          className="bird-head"
        />

        {/* Eyes */}
        <g className="bird-eyes">
          {/* Left eye */}
          <ellipse
            cx="40"
            cy="30"
            rx="6"
            ry="8"
            fill="white"
            className={`bird-eye ${isBlinking ? 'blinking' : ''}`}
          />
          <circle
            cx={40 + pupilOffset.x}
            cy={32 + pupilOffset.y}
            r="3"
            fill="#1a1a2e"
            className="bird-pupil"
          />

          {/* Right eye */}
          <ellipse
            cx="60"
            cy="30"
            rx="6"
            ry="8"
            fill="white"
            className={`bird-eye ${isBlinking ? 'blinking' : ''}`}
          />
          <circle
            cx={60 + pupilOffset.x}
            cy={32 + pupilOffset.y}
            r="3"
            fill="#1a1a2e"
            className="bird-pupil"
          />
        </g>

        {/* Beak */}
        <path
          d={getBeakPath()}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="0.5"
          className="bird-beak"
        />

        {/* Cheeks */}
        <circle cx="32" cy="38" r="4" fill="#fca5a5" opacity="0.6" />
        <circle cx="68" cy="38" r="4" fill="#fca5a5" opacity="0.6" />

        {/* Musical notes when singing */}
        {renderNotes()}
      </svg>
    </div>
  );
};

export default SVGBird;
