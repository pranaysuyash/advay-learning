import { useContext, useRef } from 'react';
import type Webcam from 'react-webcam';
import { HandDetectionContext } from './HandDetectionContext';

const fallbackPinch = {
  isPinching: false,
  distance: 1,
  transition: 'none' as const,
};

export function useHandDetection() {
  const context = useContext(HandDetectionContext);
  const fallbackWebcamRef = useRef<Webcam | null>(null);

  if (!context) {
    return {
      isHandDetected: false,
      cursor: null,
      pinch: fallbackPinch,
      webcamRef: fallbackWebcamRef,
      meta: null,
    };
  }

  return context;
}
