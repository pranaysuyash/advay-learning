import React, { useState, useEffect } from 'react';
import './Monster.css';

export type MonsterType = 'munchy' | 'crunchy' | 'nibbles' | 'snoozy' | 'zippy';
export type MonsterExpression = 'idle' | 'happy' | 'sad' | 'surprised' | 'eating' | 'hungry' | 'shaking';
export type MonsterSize = 'sm' | 'md' | 'lg' | 'xl';

interface CSSMonsterProps {
  type: MonsterType;
  expression: MonsterExpression;
  size?: MonsterSize;
  eyeTracking?: boolean;
  onClick?: () => void;
  className?: string;
}

const monsterColors: Record<MonsterType, { primary: string; dark: string; accent: string }> = {
  munchy: { primary: '#4ade80', dark: '#16a34a', accent: '#86efac' },     // Green dinosaur
  crunchy: { primary: '#60a5fa', dark: '#2563eb', accent: '#93c5fd' },    // Blue crocodile
  nibbles: { primary: '#c084fc', dark: '#9333ea', accent: '#d8b4fe' },    // Purple bunny
  snoozy: { primary: '#fbbf24', dark: '#d97706', accent: '#fcd34d' },     // Yellow bear
  zippy: { primary: '#fb923c', dark: '#ea580c', accent: '#fdba74' },      // Orange fox
};

const sizeClasses: Record<MonsterSize, string> = {
  sm: 'monster-size-sm',
  md: 'monster-size-md',
  lg: 'monster-size-lg',
  xl: 'monster-size-xl',
};

export const CSSMonster: React.FC<CSSMonsterProps> = ({
  type,
  expression,
  size = 'md',
  eyeTracking = true,
  onClick,
  className = '',
}) => {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const colors = monsterColors[type];

  // Eye tracking
  useEffect(() => {
    if (!eyeTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      const monster = document.getElementById(`monster-${type}`);
      if (!monster) return;

      const rect = monster.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const maxOffset = 4;
      const x = Math.min(maxOffset, Math.max(-maxOffset, (e.clientX - centerX) / 30));
      const y = Math.min(maxOffset, Math.max(-maxOffset, (e.clientY - centerY) / 30));

      setPupilOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [eyeTracking, type]);

  // Auto-blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Render monster-specific features
  const renderFeatures = () => {
    switch (type) {
      case 'munchy': // Dinosaur - spikes
        return (
          <>
            <div className="monster-spike spike-1" style={{ background: colors.dark }} />
            <div className="monster-spike spike-2" style={{ background: colors.dark }} />
            <div className="monster-spike spike-3" style={{ background: colors.dark }} />
          </>
        );
      case 'crunchy': // Crocodile - angry eyebrows
        return (
          <>
            <div className="monster-eyebrow eyebrow-left" />
            <div className="monster-eyebrow eyebrow-right" />
          </>
        );
      case 'nibbles': // Bunny - long ears
        return (
          <>
            <div className="monster-ear ear-left" style={{ background: colors.primary }} />
            <div className="monster-ear ear-right" style={{ background: colors.primary }} />
          </>
        );
      case 'snoozy': // Bear - round ears
        return (
          <>
            <div className="monster-bear-ear bear-ear-left" style={{ background: colors.dark }} />
            <div className="monster-bear-ear bear-ear-right" style={{ background: colors.dark }} />
          </>
        );
      case 'zippy': // Fox - pointy ears
        return (
          <>
            <div className="monster-fox-ear fox-ear-left" style={{ borderBottomColor: colors.primary }} />
            <div className="monster-fox-ear fox-ear-right" style={{ borderBottomColor: colors.primary }} />
          </>
        );
      default:
        return null;
    }
  };

  // Render expression-specific mouth
  const renderMouth = () => {
    switch (expression) {
      case 'happy':
      case 'eating':
        return (
          <div 
            className="monster-mouth mouth-happy"
            style={{ 
              background: `linear-gradient(to bottom, #1a1a2e 60%, #ef4444 60%)` 
            }}
          />
        );
      case 'sad':
        return <div className="monster-mouth mouth-sad" />;
      case 'surprised':
        return <div className="monster-mouth mouth-surprised" />;
      case 'hungry':
        return (
          <div 
            className="monster-mouth mouth-hungry"
            style={{ background: colors.dark }}
          />
        );
      default:
        return <div className="monster-mouth mouth-neutral" />;
    }
  };

  return (
    <div
      id={`monster-${type}`}
      className={`
        css-monster 
        monster-${type} 
        expression-${expression}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        '--monster-primary': colors.primary,
        '--monster-dark': colors.dark,
        '--monster-accent': colors.accent,
      } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Body */}
      <div className="monster-body">
        {/* Features (ears, spikes, etc.) */}
        {renderFeatures()}

        {/* Eyes container */}
        <div className="monster-eyes">
          {/* Left eye */}
          <div className={`monster-eye eye-left ${isBlinking ? 'blinking' : ''}`}>
            <div 
              className="monster-pupil"
              style={{ 
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` 
              }}
            />
          </div>
          
          {/* Right eye */}
          <div className={`monster-eye eye-right ${isBlinking ? 'blinking' : ''}`}>
            <div 
              className="monster-pupil"
              style={{ 
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` 
              }}
            />
          </div>
        </div>

        {/* Mouth */}
        {renderMouth()}

        {/* Cheeks (for cute factor) */}
        <div className="monster-cheek cheek-left" />
        <div className="monster-cheek cheek-right" />
      </div>
    </div>
  );
};

export default CSSMonster;
