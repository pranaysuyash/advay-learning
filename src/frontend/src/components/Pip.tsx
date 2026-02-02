import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCharacterStore } from '../store/characterStore';
import { UIIcon } from './ui/Icon';

interface PipProps {
  className?: string;
  enableVideo?: boolean;
}

export function Pip({ className = '', enableVideo = true }: PipProps) {
  const { pip, setPipState, setPipPosition, setPipVisible } = useCharacterStore();
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup video stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Update video stream when camera is enabled
  useEffect(() => {
    if (enableVideo && pip.visible && pip.position === 'camera') {
      startCamera();
    } else {
      cleanupCamera();
    }
  }, [enableVideo, pip.visible, pip.position]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoReady(true);
      }
    } catch (error) {
      console.warn('Camera access denied for Pip video', error);
      setIsVideoReady(false);
    }
  };

  const cleanupCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsVideoReady(false);
  };

  // Get expression based on state
  const getExpression = (state: typeof pip.state) => {
    const expressions = {
      idle: '😊',
      thinking: '🤔',
      happy: '😄',
      waiting: '⏳',
      celebrating: '🎉',
      dancing: '💃',
    };
    return expressions[state] || expressions.idle;
  };

  // Get animation based on state
  const getAnimation = (state: typeof pip.state) => {
    const animations = {
      idle: {
        scale: [1, 1.05, 1],
        rotate: [0, -2, 2, 0],
      },
      thinking: {
        scale: [1, 0.95, 1],
        rotate: [0, 5, -5, 0],
      },
      happy: {
        scale: [1, 1.1, 1],
        rotate: [0, 10, -10, 0],
      },
      waiting: {
        scale: [1, 0.9, 1],
        rotate: [0, 15, -15, 0],
      },
      celebrating: {
        scale: [1, 1.2, 1],
        rotate: [0, 20, -20, 0],
      },
      dancing: {
        scale: [1, 1.15, 1],
        rotate: [0, 30, -30, 0],
      },
    };
    return animations[state] || animations.idle;
  };

  // Get position styles
  const getPositionStyles = (position: typeof pip.position) => {
    const positions = {
      camera: {
        position: 'absolute' as const,
        bottom: '5%',
        left: '5%',
        width: '100px',
        height: 'auto',
        zIndex: 100,
      },
      corner: {
        position: 'fixed' as const,
        bottom: '5%',
        right: '5%',
        width: '100px',
        height: 'auto',
        zIndex: 1000,
      },
    };
    return positions[position] ?? positions.corner;
  };

  if (!pip.visible) return null;

  return (
    <motion.div
      className={`relative ${className}`}
      style={getPositionStyles(pip.position)}
      animate={getAnimation(pip.state)}
      transition={{ duration: 0.3, repeat: pip.state === 'dancing' ? Infinity : 0 }}
    >
      <div className="absolute top-2 right-2 z-10 flex gap-1 pointer-events-auto">
        <button
          type="button"
          onClick={() => setPipPosition(pip.position === 'camera' ? 'corner' : 'camera')}
          className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-border shadow-soft flex items-center justify-center hover:bg-white transition"
          aria-label={pip.position === 'camera' ? 'Move PIP to corner' : 'Move PIP to camera'}
          title={pip.position === 'camera' ? 'Move to corner' : 'Move to camera'}
        >
          <UIIcon name={pip.position === 'camera' ? 'circle' : 'camera'} size={16} />
        </button>
        <button
          type="button"
          onClick={() => setPipVisible(false)}
          className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-border shadow-soft flex items-center justify-center hover:bg-white transition"
          aria-label="Hide PIP"
          title="Hide"
        >
          <UIIcon name="x" size={16} />
        </button>
      </div>
      {/* Video feed (if enabled) */}
      {enableVideo && isVideoReady && pip.position === 'camera' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-2xl overflow-hidden w-full h-auto"
        />
      )}

      {/* Character icon/emoji */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 0.5, repeat: 1 }}
      >
        <div className="text-4xl bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
          {getExpression(pip.state)}
        </div>
      </motion.div>

      {/* Character name badge */}
      {pip.position !== 'camera' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
        >
          PIP
        </motion.div>
      )}

      {/* Interactive area for camera position */}
      {pip.position === 'camera' && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => {
            // Example: Toggle celebration on click
            setPipState(pip.state === 'celebrating' ? 'happy' : 'celebrating');
          }}
          aria-label={`PIP is ${pip.state}. Click to interact.`}
        />
      )}
    </motion.div>
  );
}
