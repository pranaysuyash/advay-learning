import { createContext } from 'react';
import type { RefObject } from 'react';
import type Webcam from 'react-webcam';
import type { HandTrackingRuntimeMeta } from '../../hooks/useHandTrackingRuntime';

export interface HandDetectionContextValue {
  isHandDetected: boolean;
  cursor: { x: number; y: number } | null;
  pinch: {
    isPinching: boolean;
    distance: number;
    transition: 'start' | 'continue' | 'release' | 'none';
  };
  webcamRef: RefObject<Webcam | null>;
  meta: HandTrackingRuntimeMeta | null;
}

export const HandDetectionContext =
  createContext<HandDetectionContextValue | null>(null);
