/**
 * FPS Counter Component
 * 
 * Displays FPS in the corner of the screen (dev only).
 * Shows warning state when FPS drops below threshold.
 * 
 * Usage:
 * ```tsx
 * <ThreeDGameCanvas showFPS>
 *   <GameContent />
 * </ThreeDGameCanvas>
 * ```
 */

import React, { useEffect, useState, useRef } from 'react';

interface FPSCounterProps {
  /** FPS threshold for warning state (default: 30) */
  warningThreshold?: number;
  /** FPS threshold for critical state (default: 20) */
  criticalThreshold?: number;
  /** Position on screen (default: 'top-right') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show memory usage (if available) */
  showMemory?: boolean;
}

interface FpsState {
  current: number;
  average: number;
  min: number;
  max: number;
  memory?: number;
}

export const FPSCounter: React.FC<FPSCounterProps> = ({
  warningThreshold = 30,
  criticalThreshold = 20,
  position = 'top-right',
  className = '',
  showMemory = false,
}) => {
  const [fps, setFps] = useState<FpsState>({
    current: 60,
    average: 60,
    min: 60,
    max: 60,
  });
  
  const framesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  
  useEffect(() => {
    let isActive = true;
    
    const updateFPS = () => {
      if (!isActive) return;
      
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      frameCountRef.current++;
      
      // Update every 500ms
      if (delta >= 500) {
        const instantFps = (frameCountRef.current * 1000) / delta;
        
        framesRef.current.push(instantFps);
        if (framesRef.current.length > 60) {
          framesRef.current.shift();
        }
        
        const avg = framesRef.current.reduce((a, b) => a + b, 0) / framesRef.current.length;
        const min = Math.min(...framesRef.current);
        const max = Math.max(...framesRef.current);
        
        // Get memory if available
        let memory: number | undefined;
        if (showMemory && 'memory' in performance) {
          const perfMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
          if (perfMemory?.usedJSHeapSize) {
            memory = Math.round(perfMemory.usedJSHeapSize / (1024 * 1024));
          }
        }
        
        setFps({
          current: Math.round(instantFps),
          average: Math.round(avg),
          min: Math.round(min),
          max: Math.round(max),
          memory,
        });
        
        lastTimeRef.current = now;
        frameCountRef.current = 0;
      }
      
      rafRef.current = requestAnimationFrame(updateFPS);
    };
    
    rafRef.current = requestAnimationFrame(updateFPS);
    
    return () => {
      isActive = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [showMemory]);
  
  // Determine color based on FPS
  const getColorClass = () => {
    if (fps.current < criticalThreshold) {
      return 'bg-red-600 text-white';
    }
    if (fps.current < warningThreshold) {
      return 'bg-yellow-500 text-black';
    }
    return 'bg-green-600 text-white';
  };
  
  // Position classes
  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'top-2 left-2';
      case 'bottom-left':
        return 'bottom-2 left-2';
      case 'bottom-right':
        return 'bottom-2 right-2';
      case 'top-right':
      default:
        return 'top-2 right-2';
    }
  };
  
  // Format number for display
  const fmt = (n: number) => n.toString().padStart(2, '0');
  
  return (
    <div
      className={`
        absolute ${getPositionClass()} z-50
        font-mono text-xs
        rounded-lg shadow-lg
        overflow-hidden
        pointer-events-none
        ${getColorClass()}
        ${className}
      `}
      style={{ minWidth: '80px' }}
    >
      {/* Header */}
      <div className="px-2 py-1 bg-black/20 font-bold text-center border-b border-white/10">
        FPS
      </div>
      
      {/* Current FPS */}
      <div className="px-2 py-1 text-center">
        <span className="text-lg font-bold">{fmt(fps.current)}</span>
      </div>
      
      {/* Details */}
      <div className="px-2 py-1 bg-black/10 text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span className="opacity-75">avg:</span>
          <span>{fmt(fps.average)}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">min:</span>
          <span>{fmt(fps.min)}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">max:</span>
          <span>{fmt(fps.max)}</span>
        </div>
        {showMemory && fps.memory !== undefined && (
          <div className="flex justify-between border-t border-white/10 pt-0.5 mt-0.5">
            <span className="opacity-75">mem:</span>
            <span>{fps.memory}MB</span>
          </div>
        )}
      </div>
      
      {/* Warning indicator */}
      {fps.current < warningThreshold && (
        <div className="px-2 py-0.5 bg-red-500 text-white text-[10px] text-center font-bold animate-pulse">
          ⚠ LOW FPS
        </div>
      )}
    </div>
  );
};

export default FPSCounter;
