import React, { useRef, useEffect, useState } from 'react';
import { useSpatialInput } from '../../context/SpatialInputContext';
import { isWithinTarget } from '../../utils/coordinateTransform';
import KenneyButton from './KenneyButton';
import type { KenneyButtonColor, KenneyButtonSize, KenneyButtonStyle } from './KenneyButton';

/**
 * VisionButton - A CV-ready button component
 * 
 * Wraps KenneyButton and adds:
 * - Spatial hit testing (detects spatial cursor hover)
 * - Pinch-to-click mapping
 * - Visual feedback for spatial hover
 */

interface VisionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: KenneyButtonColor;
  size?: KenneyButtonSize;
  style?: KenneyButtonStyle;
  disabled?: boolean;
  className?: string;
  
  /** Multiplier for the spatial hitbox (default: 1.5) */
  hitboxMultiplier?: number;
}

export function VisionButton({
  children,
  onClick,
  color = 'blue',
  size = 'default',
  style = 'default',
  disabled = false,
  className = '',
  hitboxMultiplier = 1.5,
}: VisionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { cursor } = useSpatialInput();
  const [isSpatialHovered, setIsSpatialHovered] = useState(false);
  const [wasPinching, setWasPinching] = useState(false);

  // Perform spatial hit testing
  useEffect(() => {
    if (!buttonRef.current || !cursor.isActive || disabled) {
      setIsSpatialHovered(false);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = (Math.max(rect.width, rect.height) / 2) * hitboxMultiplier;

    const cursorPoint = (cursor.position.x <= 1 && cursor.position.y <= 1)
      ? { x: cursor.position.x * window.innerWidth, y: cursor.position.y * window.innerHeight }
      : cursor.position;
    const hit = isWithinTarget(
      cursorPoint,
      { x: centerX, y: centerY },
      radius
    );

    setIsSpatialHovered(hit);
  }, [cursor.position, cursor.isActive, disabled, hitboxMultiplier]);

  // Handle pinch gesture (spatial click)
  useEffect(() => {
    if (isSpatialHovered && !disabled && onClick) {
      // Logic: If transitioning from not pinching to pinching while hovered
      if (cursor.isPinching && !wasPinching) {
        onClick();
      }
    }
    setWasPinching(cursor.isPinching);
  }, [cursor.isPinching, isSpatialHovered, disabled, onClick, wasPinching]);

  return (
    <KenneyButton
      ref={buttonRef}
      color={color}
      size={size}
      style={style}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${className}
        ${isSpatialHovered ? 'scale-110 !brightness-125' : ''}
        transition-all duration-200
      `}
    >
      {/* Visual Feedback for Spatial Hover */}
      {isSpatialHovered && (
        <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg animate-pulse pointer-events-none" />
      )}
      {children}
    </KenneyButton>
  );
}

export default VisionButton;
