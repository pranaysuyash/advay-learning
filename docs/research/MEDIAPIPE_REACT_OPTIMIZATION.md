# MediaPipe + React Integration Optimization
**Production-Ready Hand Tracking & Gesture Recognition for Children's Learning Apps**

---

**Document Version**: 1.0
**Created**: 2026-03-05
**Status**: Implementation-Ready
**Owner**: Engineering Team
**Priority**: P0 (MVP Blocking)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [MediaPipe Setup & Configuration](#3-mediapipe-setup--configuration)
4. [React Hook Abstraction](#4-react-hook-abstraction)
5. [Performance Optimization](#5-performance-optimization)
6. [Memory Management](#6-memory-management)
7. [Gesture Recognition State Machine](#7-gesture-recognition-state-machine)
8. [Low-End Device Fallbacks](#8-low-end-device-fallbacks)
9. [Testing Strategy](#9-testing-strategy)
10. [Accessibility Considerations](#10-accessibility-considerations)
11. [Implementation Checklist](#11-implementation-checklist)
12. [References](#12-references)

---

## 1. Executive Summary

### 1.1 Purpose
This document provides production-ready patterns for integrating MediaPipe hand tracking with React in the Advay Vision Learning platform. It addresses performance, memory, and UX challenges specific to children's apps running on diverse devices.

### 1.2 Key Decisions
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **MediaPipe Tasks Vision** | New unified API, better performance | `@mediapipe/tasks-vision` package |
| **WebWorker Processing** | Prevent UI jank during inference | Offload detection to worker thread |
| **Adaptive Frame Rate** | Balance accuracy vs. performance | Dynamic FPS based on device capability |
| **Gesture State Machine** | Reliable interaction detection | Explicit states with debounce/throttle |
| **Fallback to Touch** | Ensure accessibility | Graceful degradation when camera unavailable |

### 1.3 Performance Targets
| Metric | Target | Fallback |
|--------|--------|----------|
| **Inference Latency** | <50ms per frame | <100ms (low-end) |
| **UI Frame Rate** | 60 FPS | 30 FPS (low-end) |
| **Memory Usage** | <200 MB | <100 MB (low-end) |
| **Battery Impact** | <5%/hour | <10%/hour (low-end) |
| **Cold Start Time** | <2s | <5s (low-end) |

### 1.4 What This Document Covers
- ✅ Complete TypeScript interfaces for hand tracking
- ✅ React hook (`useHandTracking`) with lifecycle management
- ✅ WebWorker integration for non-blocking inference
- ✅ Adaptive performance configuration by device tier
- ✅ Gesture recognition state machine with debounce
- ✅ Memory management and cleanup patterns
- ✅ Fallback strategies for low-end devices
- ✅ Testing strategy (unit, integration, device lab)

### 1.5 What This Document Does NOT Cover
- ❌ Face mesh or pose detection (separate services)
- ❌ Object detection (TensorFlow.js integration)
- ❌ AR overlay rendering (Three.js integration)
- ❌ Privacy policy implementation (see `CONTENT_SAFETY_MODERATION.md`)

---

## 2. Architecture Overview

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                      REACT COMPONENT LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Alphabet   │  │  Finger     │  │  Gesture    │             │
│  │  Tracing    │  │  Numbers    │  │  Games      │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 useHandTracking() HOOK                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • landmarks: HandLandmarks | null                         │
│  │  • isTracking: boolean                                     │
│  │  • gesture: DetectedGesture | null                         │
│  │  • error: Error | null                                     │
│  │  • start(): Promise<void>                                  │
│  │  • stop(): void                                            │
│  │  • calibrate(): Promise<void>                              │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 HAND TRACKING SERVICE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  MediaPipe  │  │  WebWorker  │  │  Gesture    │             │
│  │  Adapter    │  │  Bridge     │  │  Recognizer │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MEDIAPIPE CORE                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  @mediapipe/tasks-vision                                  │
│  │  • HandLandmarker                                         │
│  │  • VisionTaskRunner                                       │
│  │  • FilesetResolver                                        │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DEVICE ADAPTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Capability │  │  Performance│  │  Fallback   │             │
│  │  Detector   │  │  Tuner      │  │  Manager    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow
```
Camera Feed (video element)
        │
        ▼
┌─────────────────┐
│  Frame Capture  │
│  (requestVideoFrameCallback) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frame Preprocess │
│  • Resize to 256x256 │
│  • Normalize RGB    │
│  • Convert to Tensor│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  WebWorker      │────▶│  MediaPipe      │
│  Message Queue  │     │  HandLandmarker │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Results Post   │◀────│  Landmarks      │
│  (transferable) │     │  + Confidence   │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Gesture        │
│  Recognition    │
│  State Machine  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React State    │
│  Update         │
└─────────────────┘
```

---

## 3. MediaPipe Setup & Configuration

### 3.1 Installation
```bash
# Core MediaPipe Tasks Vision
npm install @mediapipe/tasks-vision

# Optional: TypeScript types
npm install -D @types/mediapipe__tasks-vision
```

### 3.2 Hand Landmarker Configuration
```typescript
// src/services/vision/mediapipe/HandLandmarkerConfig.ts

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface HandTrackingConfig {
  // Model selection
  modelPath: string; // URL to .task file
  numHands: number;  // 1 or 2
  
  // Performance tuning
  minDetectionConfidence: number; // 0.0 - 1.0
  minTrackingConfidence: number;  // 0.0 - 1.0
  minPresenceConfidence: number;  // 0.0 - 1.0
  
  // Device adaptation
  adaptiveFPS: boolean;
  maxFPS: number;
  
  // Privacy
  storeFrames: boolean; // Always false for children's apps
}

export const DEFAULT_CONFIG: HandTrackingConfig = {
  modelPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/hand_landmarker.task',
  numHands: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  minPresenceConfidence: 0.5,
  adaptiveFPS: true,
  maxFPS: 30,
  storeFrames: false,
};

export const LOW_END_CONFIG: HandTrackingConfig = {
  ...DEFAULT_CONFIG,
  minDetectionConfidence: 0.7, // Higher threshold = fewer false positives
  minTrackingConfidence: 0.7,
  maxFPS: 15, // Lower frame rate
};

export async function createHandLandmarker(
  config: HandTrackingConfig = DEFAULT_CONFIG
): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  
  return await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: config.modelPath,
      delegate: 'GPU', // Prefer WebGPU, fallback to WASM
    },
    runningMode: 'VIDEO',
    numHands: config.numHands,
    minHandDetectionConfidence: config.minDetectionConfidence,
    minHandPresenceConfidence: config.minPresenceConfidence,
    minTrackingConfidence: config.minTrackingConfidence,
  });
}
```

### 3.3 WebWorker Bridge
```typescript
// src/services/vision/mediapipe/HandTrackingWorker.ts

// This file runs in a WebWorker context
import { HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { createHandLandmarker, HandTrackingConfig } from './HandLandmarkerConfig';

interface WorkerMessage {
  type: 'init' | 'process' | 'stop' | 'config';
  payload?: any;
}

interface WorkerResponse {
  type: 'ready' | 'result' | 'error' | 'status';
  payload?: any;
}

let landmarker: HandLandmarker | null = null;
let config: HandTrackingConfig | null = null;
let lastProcessTime = 0;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'init':
        config = payload.config;
        landmarker = await createHandLandmarker(config);
        postMessage({ type: 'ready' } as WorkerResponse);
        break;
        
      case 'process':
        await processFrame(payload);
        break;
        
      case 'stop':
        landmarker?.close();
        landmarker = null;
        break;
        
      case 'config':
        config = { ...config, ...payload };
        if (landmarker) {
          await landmarker.close();
          landmarker = await createHandLandmarker(config);
        }
        break;
    }
  } catch (error) {
    postMessage({
      type: 'error',
      payload: { message: error.message, stack: error.stack },
    } as WorkerResponse);
  }
};

async function processFrame(data: {
  imageData: ImageData;
  timestamp: number;
  frameId: number;
}): Promise<void> {
  if (!landmarker || !config) return;
  
  // Adaptive FPS: skip frames if processing too fast
  if (config.adaptiveFPS) {
    const elapsed = data.timestamp - lastProcessTime;
    const minInterval = 1000 / config.maxFPS;
    
    if (elapsed < minInterval) {
      postMessage({
        type: 'status',
        payload: { skipped: true, reason: 'fps_limit' },
      } as WorkerResponse);
      return;
    }
  }
  
  lastProcessTime = data.timestamp;
  
  // Detect landmarks
  const results = await landmarker.detectForVideo(
    data.imageData,
    data.timestamp
  );
  
  // Post results with transferable objects for efficiency
  if (results.landmarks?.length > 0) {
    const landmarks = results.landmarks[0].map(
      (lm: NormalizedLandmark) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      })
    );
    
    postMessage({
      type: 'result',
      payload: {
        frameId: data.frameId,
        landmarks,
        handedness: results.handednesses?.[0]?.[0]?.categoryName,
        confidence: results.landmarks[0][0]?.visibility || 0,
        timestamp: data.timestamp,
      },
    } as WorkerResponse);
  } else {
    postMessage({
      type: 'result',
      payload: {
        frameId: data.frameId,
        landmarks: null,
        confidence: 0,
        timestamp: data.timestamp,
      },
    } as WorkerResponse);
  }
}
```

### 3.4 Main Thread Bridge
```typescript
// src/services/vision/mediapipe/HandTrackingBridge.ts

export interface HandTrackingResult {
  frameId: number;
  landmarks: NormalizedLandmark[] | null;
  handedness: 'Left' | 'Right' | null;
  confidence: number;
  timestamp: number;
}

export interface HandTrackingCallbacks {
  onResult: (result: HandTrackingResult) => void;
  onError: (error: Error) => void;
  onStatus?: (status: { skipped: boolean; reason?: string }) => void;
}

export class HandTrackingBridge {
  private worker: Worker;
  private callbacks: HandTrackingCallbacks;
  private frameCounter = 0;
  private isRunning = false;
  
  constructor(callbacks: HandTrackingCallbacks) {
    this.callbacks = callbacks;
    this.worker = new Worker(
      new URL('./HandTrackingWorker.ts', import.meta.url),
      { type: 'module' }
    );
    
    this.worker.onmessage = (event: MessageEvent) => {
      this.handleWorkerMessage(event.data);
    };
    
    this.worker.onerror = (error: ErrorEvent) => {
      this.callbacks.onError(new Error(`Worker error: ${error.message}`));
    };
  }
  
  async initialize(config: HandTrackingConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Hand landmarker initialization timeout'));
      }, 10000);
      
      const onMessage = (event: MessageEvent) => {
        if (event.data.type === 'ready') {
          clearTimeout(timeout);
          this.worker.removeEventListener('message', onMessage);
          resolve();
        } else if (event.data.type === 'error') {
          clearTimeout(timeout);
          this.worker.removeEventListener('message', onMessage);
          reject(new Error(event.data.payload.message));
        }
      };
      
      this.worker.addEventListener('message', onMessage);
      this.worker.postMessage({
        type: 'init',
        payload: { config },
      });
    });
  }
  
  async processFrame(imageData: ImageData, timestamp: number): Promise<void> {
    if (!this.isRunning) return;
    
    this.frameCounter++;
    
    // Transfer imageData to worker (zero-copy when possible)
    this.worker.postMessage(
      {
        type: 'process',
        payload: {
          imageData,
          timestamp,
          frameId: this.frameCounter,
        },
      },
      [imageData.data.buffer] // Transferable
    );
  }
  
  start(): void {
    this.isRunning = true;
  }
  
  stop(): void {
    this.isRunning = false;
    this.worker.postMessage({ type: 'stop' });
  }
  
  updateConfig(config: Partial<HandTrackingConfig>): void {
    this.worker.postMessage({
      type: 'config',
      payload: config,
    });
  }
  
  private handleWorkerMessage(data: any): void {
    switch (data.type) {
      case 'result':
        this.callbacks.onResult(data.payload);
        break;
      case 'error':
        this.callbacks.onError(new Error(data.payload.message));
        break;
      case 'status':
        this.callbacks.onStatus?.(data.payload);
        break;
    }
  }
  
  terminate(): void {
    this.stop();
    this.worker.terminate();
  }
}
```

---

## 4. React Hook Abstraction

### 4.1 useHandTracking Hook
```typescript
// src/hooks/useHandTracking.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { HandTrackingBridge, HandTrackingResult } from '../services/vision/mediapipe/HandTrackingBridge';
import { HandTrackingConfig, DEFAULT_CONFIG, LOW_END_CONFIG } from '../services/vision/mediapipe/HandLandmarkerConfig';
import { detectDeviceTier } from '../utils/deviceDetection';

export interface UseHandTrackingOptions {
  enabled?: boolean;
  config?: Partial<HandTrackingConfig>;
  onGesture?: (gesture: DetectedGesture) => void;
  onError?: (error: Error) => void;
}

export interface UseHandTrackingReturn {
  // State
  landmarks: NormalizedLandmark[] | null;
  isTracking: boolean;
  gesture: DetectedGesture | null;
  error: Error | null;
  deviceTier: DeviceTier;
  
  // Actions
  start: () => Promise<void>;
  stop: () => void;
  calibrate: () => Promise<void>;
  
  // Info
  fps: number;
  confidence: number;
}

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseHandTrackingOptions = {}
): UseHandTrackingReturn {
  const {
    enabled = true,
    config: configOverrides = {},
    onGesture,
    onError,
  } = options;
  
  // State
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [gesture, setGesture] = useState<DetectedGesture | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [fps, setFps] = useState(0);
  const [confidence, setConfidence] = useState(0);
  
  // Refs
  const bridgeRef = useRef<HandTrackingBridge | null>(null);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  
  // Detect device tier for adaptive config
  const deviceTier = detectDeviceTier();
  const baseConfig = deviceTier === 'low' ? LOW_END_CONFIG : DEFAULT_CONFIG;
  const config = { ...baseConfig, ...configOverrides };
  
  // Gesture recognizer (separate module)
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  
  // Initialize gesture recognizer
  useEffect(() => {
    gestureRecognizerRef.current = new GestureRecognizer({
      onGestureDetected: (g) => {
        setGesture(g);
        onGesture?.(g);
      },
    });
    
    return () => {
      gestureRecognizerRef.current?.cleanup();
    };
  }, [onGesture]);
  
  // Start/stop tracking
  const start = useCallback(async () => {
    if (!enabled || !videoRef.current) return;
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      // Initialize bridge
      bridgeRef.current = new HandTrackingBridge({
        onResult: handleResult,
        onError: handleError,
        onStatus: handleStatus,
      });
      
      await bridgeRef.current.initialize(config);
      bridgeRef.current.start();
      
      setIsTracking(true);
      setError(null);
      
      // Start frame loop
      startFrameLoop();
      
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [enabled, videoRef, config]);
  
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (bridgeRef.current) {
      bridgeRef.current.stop();
      bridgeRef.current.terminate();
      bridgeRef.current = null;
    }
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsTracking(false);
    setLandmarks(null);
    setGesture(null);
  }, [videoRef]);
  
  const calibrate = useCallback(async () => {
    // Optional: Run calibration routine to adjust thresholds
    // Could involve user holding hand in specific position
    return Promise.resolve();
  }, []);
  
  // Frame processing loop
  const startFrameLoop = useCallback(() => {
    const processFrame = async (timestamp: number) => {
      if (!isTracking || !videoRef.current || !bridgeRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }
      
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.readyState < video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }
      
      // Create canvas for frame extraction
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }
      
      // Resize to model input size (256x256 for efficiency)
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(video, 0, 0, 256, 256);
      
      const imageData = ctx.getImageData(0, 0, 256, 256);
      
      // Send to worker
      await bridgeRef.current.processFrame(imageData, timestamp);
      
      // Calculate FPS
      frameCountRef.current++;
      const elapsed = timestamp - lastFrameTimeRef.current;
      
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastFrameTimeRef.current = timestamp;
      }
      
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };
    
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isTracking, videoRef]);
  
  // Result handler
  const handleResult = useCallback((result: HandTrackingResult) => {
    setLandmarks(result.landmarks);
    setConfidence(result.confidence);
    
    // Run gesture recognition
    if (result.landmarks && gestureRecognizerRef.current) {
      const recognizedGesture = gestureRecognizerRef.current.recognize(
        result.landmarks,
        result.handedness
      );
      
      if (recognizedGesture) {
        setGesture(recognizedGesture);
      }
    }
  }, []);
  
  // Error handler
  const handleError = useCallback((err: Error) => {
    setError(err);
    onError?.(err);
    stop();
  }, [onError, stop]);
  
  // Status handler (for adaptive FPS feedback)
  const handleStatus = useCallback((status: { skipped: boolean; reason?: string }) => {
    // Could update UI with performance indicators
    if (status.skipped && config.adaptiveFPS) {
      // Frame skipped due to FPS limit - this is expected
    }
  }, [config.adaptiveFPS]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  
  // Reinitialize if config changes
  useEffect(() => {
    if (isTracking && bridgeRef.current) {
      bridgeRef.current.updateConfig(config);
    }
  }, [config, isTracking]);
  
  return {
    landmarks,
    isTracking,
    gesture,
    error,
    deviceTier,
    start,
    stop,
    calibrate,
    fps,
    confidence,
  };
}
```

### 4.2 Gesture Recognizer
```typescript
// src/services/vision/gestures/GestureRecognizer.ts

import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type GestureType = 
  | 'pointing'
  | 'fist'
  | 'open_hand'
  | 'pinch'
  | 'peace'
  | 'thumbs_up'
  | 'number_1'
  | 'number_2'
  | 'number_3'
  | 'number_4'
  | 'number_5'
  | 'wave'
  | null;

export interface DetectedGesture {
  type: GestureType;
  confidence: number;
  handedness: 'Left' | 'Right' | null;
  timestamp: number;
}

export interface GestureRecognizerConfig {
  // Debounce/throttle settings
  minDuration: number; // ms gesture must be held
  confidenceThreshold: number; // 0.0 - 1.0
  
  // Gesture-specific settings
  enableNumbers: boolean;
  enableComplex: boolean; // wave, pinch, etc.
}

export class GestureRecognizer {
  private config: GestureRecognizerConfig;
  private lastGesture: DetectedGesture | null = null;
  private gestureStartTime: number | null = null;
  private onGestureDetected?: (gesture: DetectedGesture) => void;
  
  constructor(
    config: Partial<GestureRecognizerConfig> = {},
    callbacks?: { onGestureDetected?: (gesture: DetectedGesture) => void }
  ) {
    this.config = {
      minDuration: 200, // 200ms minimum hold time
      confidenceThreshold: 0.7,
      enableNumbers: true,
      enableComplex: true,
      ...config,
    };
    this.onGestureDetected = callbacks?.onGestureDetected;
  }
  
  recognize(
    landmarks: NormalizedLandmark[],
    handedness: 'Left' | 'Right' | null
  ): DetectedGesture | null {
    const candidate = this.classifyGesture(landmarks, handedness);
    
    if (!candidate || candidate.confidence < this.config.confidenceThreshold) {
      this.resetGestureState();
      return null;
    }
    
    // Debounce: require gesture to be held for minDuration
    const now = Date.now();
    
    if (this.lastGesture?.type === candidate.type) {
      // Same gesture continuing
      if (!this.gestureStartTime) {
        this.gestureStartTime = now;
      }
      
      const heldDuration = now - this.gestureStartTime;
      
      if (heldDuration >= this.config.minDuration) {
        const result: DetectedGesture = {
          ...candidate,
          timestamp: now,
        };
        
        this.onGestureDetected?.(result);
        return result;
      }
    } else {
      // New gesture - reset timer
      this.lastGesture = candidate;
      this.gestureStartTime = now;
    }
    
    return null;
  }
  
  private classifyGesture(
    landmarks: NormalizedLandmark[],
    handedness: 'Left' | 'Right' | null
  ): Omit<DetectedGesture, 'timestamp'> | null {
    // Extract key landmark positions
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    // Calculate finger extension (distance from wrist)
    const fingerExtensions = {
      thumb: this.distance(wrist, thumbTip),
      index: this.distance(wrist, indexTip),
      middle: this.distance(wrist, middleTip),
      ring: this.distance(wrist, ringTip),
      pinky: this.distance(wrist, pinkyTip),
    };
    
    // Classify based on finger patterns
    const extendedFingers = Object.entries(fingerExtensions)
      .filter(([, dist]) => dist > 0.3) // Threshold for "extended"
      .map(([finger]) => finger);
    
    // Number recognition (1-5)
    if (this.config.enableNumbers) {
      if (extendedFingers.length === 1 && extendedFingers[0] === 'index') {
        return { type: 'number_1', confidence: 0.9, handedness };
      }
      if (extendedFingers.length === 2 && 
          extendedFingers.includes('index') && 
          extendedFingers.includes('middle')) {
        return { type: 'number_2', confidence: 0.85, handedness };
      }
      // ... more number patterns
    }
    
    // Basic gestures
    if (extendedFingers.length === 0) {
      return { type: 'fist', confidence: 0.95, handedness };
    }
    
    if (extendedFingers.length === 5) {
      return { type: 'open_hand', confidence: 0.9, handedness };
    }
    
    if (extendedFingers.length === 1 && extendedFingers[0] === 'index') {
      return { type: 'pointing', confidence: 0.85, handedness };
    }
    
    // Pinch detection (thumb close to index)
    const thumbIndexDist = this.distance(thumbTip, indexTip);
    if (thumbIndexDist < 0.1 && extendedFingers.length <= 2) {
      return { type: 'pinch', confidence: 0.8, handedness };
    }
    
    return null;
  }
  
  private distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) + 
      Math.pow(a.y - b.y, 2) + 
      Math.pow((a.z || 0) - (b.z || 0), 2)
    );
  }
  
  private resetGestureState(): void {
    this.lastGesture = null;
    this.gestureStartTime = null;
  }
  
  cleanup(): void {
    this.resetGestureState();
  }
}
```

---

## 5. Performance Optimization

### 5.1 Adaptive Frame Rate
```typescript
// src/services/vision/performance/AdaptiveFrameRate.ts

export interface PerformanceMetrics {
  fps: number;
  inferenceTime: number; // ms
  memoryUsage: number; // MB
  batteryLevel?: number;
  thermalState?: 'nominal' | 'fair' | 'serious' | 'critical';
}

export class AdaptiveFrameRate {
  private targetFPS: number;
  private currentFPS: number;
  private adjustmentInterval: NodeJS.Timeout | null = null;
  
  constructor(initialFPS: number = 30) {
    this.targetFPS = initialFPS;
    this.currentFPS = initialFPS;
  }
  
  startMonitoring(onUpdate: (newFPS: number) => void): void {
    this.adjustmentInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      const newFPS = this.calculateOptimalFPS(metrics);
      
      if (newFPS !== this.currentFPS) {
        this.currentFPS = newFPS;
        onUpdate(newFPS);
      }
    }, 5000); // Check every 5 seconds
  }
  
  stopMonitoring(): void {
    if (this.adjustmentInterval) {
      clearInterval(this.adjustmentInterval);
      this.adjustmentInterval = null;
    }
  }
  
  getCurrentFPS(): number {
    return this.currentFPS;
  }
  
  private collectMetrics(): PerformanceMetrics {
    // FPS from requestAnimationFrame timing
    // Inference time from MediaPipe results
    // Memory from performance.memory (Chrome only)
    // Battery/thermal from getBattery() and thermal APIs
    
    return {
      fps: this.measureFPS(),
      inferenceTime: this.measureInferenceTime(),
      memoryUsage: this.measureMemory(),
      batteryLevel: (navigator as any).getBattery?.().then(b => b.level),
      thermalState: (navigator as any).thermal?.state,
    };
  }
  
  private calculateOptimalFPS(metrics: PerformanceMetrics): number {
    let fps = this.targetFPS;
    
    // Reduce FPS if inference is slow
    if (metrics.inferenceTime > 100) {
      fps = Math.max(15, fps - 5);
    }
    
    // Reduce FPS if memory is high
    if (metrics.memoryUsage > 300) {
      fps = Math.max(15, fps - 5);
    }
    
    // Reduce FPS if battery is low
    if (metrics.batteryLevel && metrics.batteryLevel < 0.2) {
      fps = Math.max(10, fps - 5);
    }
    
    // Reduce FPS if device is thermally throttled
    if (metrics.thermalState === 'serious' || metrics.thermalState === 'critical') {
      fps = Math.max(10, fps - 10);
    }
    
    // Increase FPS if performance is good
    if (metrics.inferenceTime < 30 && 
        metrics.memoryUsage < 150 && 
        fps < this.targetFPS) {
      fps = Math.min(this.targetFPS, fps + 5);
    }
    
    return Math.round(fps / 5) * 5; // Round to nearest 5
  }
  
  private measureFPS(): number {
    // Implementation using requestAnimationFrame timestamps
    return 0; // Placeholder
  }
  
  private measureInferenceTime(): number {
    // Track time between processFrame and result
    return 0; // Placeholder
  }
  
  private measureMemory(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }
    return 0;
  }
}
```

### 5.2 Frame Preprocessing Optimization
```typescript
// src/services/vision/utils/FramePreprocessor.ts

export class FramePreprocessor {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;
  
  constructor(width: number = 256, height: number = 256) {
    this.canvas = new OffscreenCanvas(width, height);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create OffscreenCanvas context');
    this.ctx = ctx;
  }
  
  process(video: HTMLVideoElement): ImageData {
    // Draw video to offscreen canvas (resize + crop)
    const videoAspect = video.videoWidth / video.videoHeight;
    const canvasAspect = this.canvas.width / this.canvas.height;
    
    let sx, sy, sw, sh;
    
    if (videoAspect > canvasAspect) {
      // Video is wider - crop sides
      sw = video.videoHeight * canvasAspect;
      sh = video.videoHeight;
      sx = (video.videoWidth - sw) / 2;
      sy = 0;
    } else {
      // Video is taller - crop top/bottom
      sw = video.videoWidth;
      sh = video.videoWidth / canvasAspect;
      sx = 0;
      sy = (video.videoHeight - sh) / 2;
    }
    
    this.ctx.drawImage(
      video,
      sx, sy, sw, sh,
      0, 0, this.canvas.width, this.canvas.height
    );
    
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  
  // Alternative: Use WebAssembly for faster preprocessing
  static async createWithWASM(): Promise<FramePreprocessor> {
    // Load WASM module for image processing
    // Return instance with WASM-accelerated methods
    return new FramePreprocessor();
  }
}
```

### 5.3 Memory-Efficient Landmark Storage
```typescript
// src/services/vision/utils/LandmarkBuffer.ts

export class LandmarkBuffer {
  private buffer: Float32Array;
  private writeIndex: number = 0;
  private readonly capacity: number;
  private readonly landmarkSize: number = 21 * 4; // 21 landmarks * 4 values (x,y,z,visibility)
  
  constructor(capacity: number = 30) {
    this.capacity = capacity;
    this.buffer = new Float32Array(capacity * this.landmarkSize);
  }
  
  add(landmarks: NormalizedLandmark[], timestamp: number): void {
    const offset = this.writeIndex * this.landmarkSize;
    
    for (let i = 0; i < 21 && i < landmarks.length; i++) {
      const lm = landmarks[i];
      const lmOffset = offset + i * 4;
      this.buffer[lmOffset] = lm.x;
      this.buffer[lmOffset + 1] = lm.y;
      this.buffer[lmOffset + 2] = lm.z || 0;
      this.buffer[lmOffset + 3] = lm.visibility || 0;
    }
    
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
  }
  
  getRecent(count: number = 5): NormalizedLandmark[][] {
    const results: NormalizedLandmark[][] = [];
    
    for (let i = 0; i < count; i++) {
      const idx = (this.writeIndex - i - 1 + this.capacity) % this.capacity;
      const offset = idx * this.landmarkSize;
      
      const frame: NormalizedLandmark[] = [];
      for (let j = 0; j < 21; j++) {
        const lmOffset = offset + j * 4;
        frame.push({
          x: this.buffer[lmOffset],
          y: this.buffer[lmOffset + 1],
          z: this.buffer[lmOffset + 2],
          visibility: this.buffer[lmOffset + 3],
        });
      }
      results.push(frame);
    }
    
    return results;
  }
  
  clear(): void {
    this.writeIndex = 0;
    this.buffer.fill(0);
  }
}
```

---

## 6. Memory Management

### 6.1 Resource Cleanup Pattern
```typescript
// src/services/vision/utils/ResourceManager.ts

export interface Disposable {
  dispose(): void;
}

export class ResourceManager {
  private resources: Map<string, Disposable> = new Map();
  
  register<T extends Disposable>(key: string, resource: T): T {
    // Clean up existing resource with same key
    this.unregister(key);
    
    this.resources.set(key, resource);
    return resource;
  }
  
  unregister(key: string): void {
    const resource = this.resources.get(key);
    if (resource) {
      resource.dispose();
      this.resources.delete(key);
    }
  }
  
  disposeAll(): void {
    for (const resource of this.resources.values()) {
      resource.dispose();
    }
    this.resources.clear();
  }
}

// Example usage in hand tracking service
export class HandTrackingService implements Disposable {
  private resources: ResourceManager;
  
  constructor() {
    this.resources = new ResourceManager();
  }
  
  async initialize(): Promise<void> {
    const bridge = this.resources.register(
      'hand-bridge',
      new HandTrackingBridge({ /* callbacks */ })
    );
    
    const preprocessor = this.resources.register(
      'frame-preprocessor',
      new FramePreprocessor()
    );
    
    const adaptiveFPS = this.resources.register(
      'adaptive-fps',
      new AdaptiveFrameRate()
    );
    
    await bridge.initialize(config);
    adaptiveFPS.startMonitoring((newFPS) => {
      bridge.updateConfig({ maxFPS: newFPS });
    });
  }
  
  dispose(): void {
    this.resources.disposeAll();
  }
}
```

### 6.2 OffscreenCanvas Pooling
```typescript
// src/services/vision/utils/CanvasPool.ts

export class CanvasPool {
  private pool: OffscreenCanvas[] = [];
  private readonly size: { width: number; height: number };
  private readonly maxSize: number;
  
  constructor(width: number, height: number, maxSize: number = 3) {
    this.size = { width, height };
    this.maxSize = maxSize;
  }
  
  acquire(): OffscreenCanvas {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return new OffscreenCanvas(this.size.width, this.size.height);
  }
  
  release(canvas: OffscreenCanvas): void {
    // Clear canvas before returning to pool
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.pool.length < this.maxSize) {
      this.pool.push(canvas);
    }
    // Otherwise, let it be garbage collected
  }
  
  dispose(): void {
    this.pool.forEach(canvas => {
      // OffscreenCanvas doesn't have explicit dispose, 
      // but we can nullify references
    });
    this.pool = [];
  }
}
```

---

## 7. Gesture Recognition State Machine

### 7.1 State Machine Implementation
```typescript
// src/services/vision/gestures/GestureStateMachine.ts

export type GestureState = 
  | 'idle'
  | 'detecting'
  | 'confirmed'
  | 'executing'
  | 'cooldown';

export interface GestureEvent {
  type: 'landmarks' | 'timeout' | 'reset' | 'execute';
  payload?: any;
}

export class GestureStateMachine {
  private state: GestureState = 'idle';
  private currentGesture: DetectedGesture | null = null;
  private stateTimers: Map<string, NodeJS.Timeout> = new Map();
  
  private transitions: Record<GestureState, Record<string, GestureState>> = {
    idle: {
      landmarks: 'detecting',
    },
    detecting: {
      landmarks: 'detecting', // Stay in detecting while receiving landmarks
      timeout: 'idle',
      confirmed: 'confirmed', // External trigger
    },
    confirmed: {
      execute: 'executing',
      timeout: 'idle',
      reset: 'idle',
    },
    executing: {
      timeout: 'cooldown',
      reset: 'idle',
    },
    cooldown: {
      timeout: 'idle',
    },
  };
  
  constructor(
    private config: {
      detectionTimeout: number;
      executionTimeout: number;
      cooldownDuration: number;
      onStateChange?: (state: GestureState, gesture: DetectedGesture | null) => void;
      onExecute?: (gesture: DetectedGesture) => void;
    }
  ) {}
  
  handleEvent(event: GestureEvent): void {
    const nextState = this.transitions[this.state]?.[event.type];
    
    if (!nextState) {
      // Invalid transition - ignore or log
      return;
    }
    
    this.transitionTo(nextState, event);
  }
  
  private transitionTo(newState: GestureState, event: GestureEvent): void {
    const prevState = this.state;
    this.state = newState;
    
    // Clear timers for previous state
    this.clearTimers(prevState);
    
    // Set up timers for new state
    this.setupTimers(newState);
    
    // Update gesture based on event
    if (event.type === 'landmarks' && event.payload) {
      this.currentGesture = event.payload;
    }
    
    // Execute side effects
    if (newState === 'executing' && this.currentGesture) {
      this.config.onExecute?.(this.currentGesture);
    }
    
    // Notify listeners
    this.config.onStateChange?.(newState, this.currentGesture);
  }
  
  private setupTimers(state: GestureState): void {
    switch (state) {
      case 'detecting':
        this.setTimer('detection', this.config.detectionTimeout, () => {
          this.handleEvent({ type: 'timeout' });
        });
        break;
      case 'executing':
        this.setTimer('execution', this.config.executionTimeout, () => {
          this.handleEvent({ type: 'timeout' });
        });
        break;
      case 'cooldown':
        this.setTimer('cooldown', this.config.cooldownDuration, () => {
          this.handleEvent({ type: 'timeout' });
        });
        break;
    }
  }
  
  private setTimer(name: string, delay: number, callback: () => void): void {
    const timer = setTimeout(callback, delay);
    this.stateTimers.set(`${this.state}:${name}`, timer);
  }
  
  private clearTimers(state: GestureState): void {
    for (const [key, timer] of this.stateTimers) {
      if (key.startsWith(`${state}:`)) {
        clearTimeout(timer);
        this.stateTimers.delete(key);
      }
    }
  }
  
  reset(): void {
    this.handleEvent({ type: 'reset' });
  }
  
  getCurrentState(): { state: GestureState; gesture: DetectedGesture | null } {
    return { state: this.state, gesture: this.currentGesture };
  }
}
```

### 7.2 Integration with React Hook
```typescript
// Update useHandTracking.ts to use state machine

// In useHandTracking hook:
const gestureStateMachineRef = useRef<GestureStateMachine | null>(null);

useEffect(() => {
  gestureStateMachineRef.current = new GestureStateMachine({
    detectionTimeout: 300,
    executionTimeout: 500,
    cooldownDuration: 200,
    onStateChange: (state, gesture) => {
      // Update React state based on machine state
      if (state === 'confirmed' && gesture) {
        setGesture(gesture);
        onGesture?.(gesture);
      }
    },
    onExecute: (gesture) => {
      // Trigger game action
      handleGestureAction(gesture);
    },
  });
  
  return () => {
    gestureStateMachineRef.current?.reset();
  };
}, [onGesture]);

// In handleResult callback:
const handleResult = useCallback((result: HandTrackingResult) => {
  setLandmarks(result.landmarks);
  setConfidence(result.confidence);
  
  if (result.landmarks && gestureRecognizerRef.current) {
    const candidate = gestureRecognizerRef.current.recognize(
      result.landmarks,
      result.handedness
    );
    
    if (candidate) {
      // Feed to state machine instead of direct set
      gestureStateMachineRef.current?.handleEvent({
        type: 'landmarks',
        payload: candidate,
      });
    } else {
      // No gesture detected - reset detection timer
      gestureStateMachineRef.current?.handleEvent({ type: 'landmarks' });
    }
  }
}, []);
```

---

## 8. Low-End Device Fallbacks

### 8.1 Device Tier Detection
```typescript
// src/utils/deviceDetection.ts

export type DeviceTier = 'high' | 'medium' | 'low';

export interface DeviceCapabilities {
  tier: DeviceTier;
  hasWebGPU: boolean;
  hasWebAssembly: boolean;
  deviceMemory: number; // GB
  hardwareConcurrency: number; // CPU cores
  maxTouchPoints: number;
}

export function detectDeviceTier(): DeviceTier {
  const nav = navigator as any;
  
  // Check for WebGPU (high-end indicator)
  const hasWebGPU = !!nav.gpu;
  
  // Get device memory (Chrome/Edge)
  const deviceMemory = nav.deviceMemory || 4;
  
  // Get CPU cores
  const cores = nav.hardwareConcurrency || 4;
  
  // Heuristic scoring
  let score = 0;
  if (hasWebGPU) score += 3;
  if (deviceMemory >= 8) score += 2;
  else if (deviceMemory >= 4) score += 1;
  if (cores >= 6) score += 2;
  else if (cores >= 4) score += 1;
  
  // Check for known low-end user agents
  const ua = navigator.userAgent.toLowerCase();
  if (/(android.*(?:go edition|lowram)|mobile.*(?:rv:|silk))/i.test(ua)) {
    return 'low';
  }
  
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

export function getDeviceCapabilities(): DeviceCapabilities {
  const tier = detectDeviceTier();
  const nav = navigator as any;
  
  return {
    tier,
    hasWebGPU: !!nav.gpu,
    hasWebAssembly: typeof WebAssembly !== 'undefined',
    deviceMemory: nav.deviceMemory || 4,
    hardwareConcurrency: nav.hardwareConcurrency || 4,
    maxTouchPoints: nav.maxTouchPoints || 1,
  };
}
```

### 8.2 Fallback Strategy
```typescript
// src/services/vision/FallbackManager.ts

export type VisionMode = 'hand-tracking' | 'touch-only' | 'keyboard-only';

export class FallbackManager {
  private currentMode: VisionMode = 'hand-tracking';
  private capabilities: DeviceCapabilities;
  private onModeChange?: (mode: VisionMode) => void;
  
  constructor(
    capabilities: DeviceCapabilities,
    callbacks?: { onModeChange?: (mode: VisionMode) => void }
  ) {
    this.capabilities = capabilities;
    this.onModeChange = callbacks?.onModeChange;
    
    // Auto-select initial mode
    this.selectOptimalMode();
  }
  
  selectOptimalMode(): VisionMode {
    // High-end: full hand tracking
    if (this.capabilities.tier === 'high' && this.capabilities.hasWebGPU) {
      return this.setMode('hand-tracking');
    }
    
    // Medium: hand tracking with reduced FPS
    if (this.capabilities.tier === 'medium') {
      return this.setMode('hand-tracking');
    }
    
    // Low-end: try hand tracking, fallback to touch
    if (this.capabilities.tier === 'low') {
      // Attempt hand tracking with aggressive optimization
      // If it fails, fall back to touch
      return this.setMode('touch-only');
    }
    
    // No camera or very constrained: keyboard only
    return this.setMode('keyboard-only');
  }
  
  async attemptHandTracking(): Promise<boolean> {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      
      // Check if device can handle inference
      const testStart = performance.now();
      // Run a single inference test...
      const testDuration = performance.now() - testStart;
      
      // If inference takes >200ms, consider it too slow
      return testDuration < 200;
    } catch {
      return false;
    }
  }
  
  setMode(mode: VisionMode): VisionMode {
    if (mode !== this.currentMode) {
      this.currentMode = mode;
      this.onModeChange?.(mode);
    }
    return mode;
  }
  
  getCurrentMode(): VisionMode {
    return this.currentMode;
  }
  
  // UI helpers for fallback messaging
  getFallbackMessage(): string {
    switch (this.currentMode) {
      case 'hand-tracking':
        return 'Using camera for hand tracking';
      case 'touch-only':
        return 'Touch the screen to interact';
      case 'keyboard-only':
        return 'Use keyboard arrows to play';
      default:
        return '';
    }
  }
}
```

### 8.3 Touch Fallback Component
```typescript
// src/components/vision/TouchFallback.tsx

import React, { useRef, useState } from 'react';

interface TouchFallbackProps {
  onGesture: (gesture: DetectedGesture) => void;
  enabled: boolean;
}

export const TouchFallback: React.FC<TouchFallbackProps> = ({
  onGesture,
  enabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePoint, setActivePoint] = useState<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    
    if (rect) {
      const x = (touch.clientX - rect.left) / rect.width;
      const y = (touch.clientY - rect.top) / rect.height;
      
      setActivePoint({ x, y });
      
      // Map touch position to gesture
      const gesture = mapTouchToGesture(x, y);
      if (gesture) {
        onGesture(gesture);
      }
    }
  };
  
  const handleTouchEnd = () => {
    setActivePoint(null);
  };
  
  return (
    <div
      ref={containerRef}
      className="touch-fallback-overlay"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Visual feedback for touch point */}
      {activePoint && (
        <div
          className="touch-indicator"
          style={{
            left: `${activePoint.x * 100}%`,
            top: `${activePoint.y * 100}%`,
          }}
        />
      )}
      
      {/* Instructions for children */}
      <div className="touch-instructions">
        <p>👆 Tap the screen to play!</p>
      </div>
    </div>
  );
};

function mapTouchToGesture(x: number, y: number): DetectedGesture | null {
  // Map screen quadrants to gestures
  // This is a simple example - could be game-specific
  
  if (x < 0.3 && y < 0.5) {
    return { type: 'number_1', confidence: 0.8, handedness: null, timestamp: Date.now() };
  }
  if (x > 0.7 && y < 0.5) {
    return { type: 'number_5', confidence: 0.8, handedness: null, timestamp: Date.now() };
  }
  if (y > 0.7) {
    return { type: 'open_hand', confidence: 0.7, handedness: null, timestamp: Date.now() };
  }
  
  return { type: 'pointing', confidence: 0.6, handedness: null, timestamp: Date.now() };
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests
```typescript
// src/services/vision/__tests__/GestureRecognizer.test.ts

import { GestureRecognizer } from '../gestures/GestureRecognizer';

describe('GestureRecognizer', () => {
  let recognizer: GestureRecognizer;
  
  beforeEach(() => {
    recognizer = new GestureRecognizer();
  });
  
  it('should detect fist gesture', () => {
    const landmarks = createMockLandmarks({ allFingersClosed: true });
    
    const result = recognizer.recognize(landmarks, 'Right');
    
    expect(result?.type).toBe('fist');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });
  
  it('should detect open hand gesture', () => {
    const landmarks = createMockLandmarks({ allFingersExtended: true });
    
    const result = recognizer.recognize(landmarks, 'Right');
    
    expect(result?.type).toBe('open_hand');
  });
  
  it('should debounce gesture detection', () => {
    const landmarks = createMockLandmarks({ indexExtended: true });
    
    // First detection should not trigger (debounce)
    const result1 = recognizer.recognize(landmarks, 'Right');
    expect(result1).toBeNull();
    
    // After minDuration, should trigger
    jest.advanceTimersByTime(200);
    const result2 = recognizer.recognize(landmarks, 'Right');
    
    expect(result2?.type).toBe('pointing');
  });
  
  it('should respect confidence threshold', () => {
    const landmarks = createMockLandmarks({ ambiguous: true });
    
    const result = recognizer.recognize(landmarks, 'Right');
    
    expect(result).toBeNull(); // Below threshold
  });
});

function createMockLandmarks(config: {
  allFingersClosed?: boolean;
  allFingersExtended?: boolean;
  indexExtended?: boolean;
  ambiguous?: boolean;
}): NormalizedLandmark[] {
  // Create 21 mock landmarks based on config
  // Simplified for test
  return Array(21).fill(null).map((_, i) => ({
    x: config.allFingersExtended ? 0.5 + i * 0.02 : 0.5,
    y: config.allFingersExtended ? 0.5 - i * 0.02 : 0.5,
    z: 0,
    visibility: config.ambiguous ? 0.5 : 0.9,
  }));
}
```

### 9.2 Integration Tests
```typescript
// src/hooks/__tests__/useHandTracking.test.tsx

import { renderHook, act } from '@testing-library/react';
import { useHandTracking } from '../useHandTracking';

describe('useHandTracking', () => {
  beforeEach(() => {
    // Mock MediaPipe and camera APIs
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      }),
    } as any;
    
    // Mock Worker
    global.Worker = jest.fn().mockImplementation(() => ({
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    })) as any;
  });
  
  it('should start tracking when enabled', async () => {
    const videoRef = { current: document.createElement('video') };
    
    const { result } = renderHook(() => 
      useHandTracking(videoRef, { enabled: true })
    );
    
    await act(async () => {
      await result.current.start();
    });
    
    expect(result.current.isTracking).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });
  
  it('should handle camera permission denied', async () => {
    (navigator.mediaDevices.getUserMedia as jest.Mock)
      .mockRejectedValue(new Error('Permission denied'));
    
    const videoRef = { current: document.createElement('video') };
    
    const { result } = renderHook(() => 
      useHandTracking(videoRef, { enabled: true })
    );
    
    await act(async () => {
      await result.current.start();
    });
    
    expect(result.current.error).toBeDefined();
    expect(result.current.isTracking).toBe(false);
  });
  
  it('should cleanup on unmount', () => {
    const videoRef = { current: document.createElement('video') };
    
    const { unmount, result } = renderHook(() => 
      useHandTracking(videoRef, { enabled: true })
    );
    
    act(() => {
      result.current.start();
    });
    
    unmount();
    
    // Verify cleanup was called
    expect(videoRef.current?.srcObject).toBeNull();
  });
});
```

### 9.3 Device Lab Testing
```markdown
## Device Lab Test Matrix

### High-End Devices
- MacBook Pro M2 (WebGPU, 16GB RAM)
- iPad Pro M2 (WebGPU, 8GB RAM)
- Samsung Galaxy S23 (WebGPU, 8GB RAM)

**Expected Performance:**
- Inference: <30ms
- FPS: 60
- Memory: <150 MB

### Medium Devices
- MacBook Air M1 (WebGPU, 8GB RAM)
- iPad 9th gen (WASM, 3GB RAM)
- Samsung Galaxy A54 (WASM, 6GB RAM)

**Expected Performance:**
- Inference: 50-80ms
- FPS: 30-45
- Memory: <200 MB

### Low-End Devices
- Chromebook (Celeron, 4GB RAM)
- Samsung Galaxy A14 (WASM, 4GB RAM)
- Older Android tablets

**Expected Performance:**
- Inference: 100-200ms
- FPS: 15-20
- Memory: <100 MB
- Fallback: Touch-only mode

### Test Scenarios
1. **Cold Start**: Time from app load to first detection
2. **Sustained Use**: 10-minute session, monitor memory growth
3. **Thermal Throttling**: Run under load, verify FPS adaptation
4. **Network Interruption**: Offline use (all local)
5. **Camera Toggle**: Rapid start/stop, verify cleanup
6. **Gesture Accuracy**: Test each gesture 10x, measure false positive rate
```

---

## 10. Accessibility Considerations

### 10.1 Alternative Input Methods
```typescript
// src/services/vision/accessibility/AlternativeInputs.ts

export interface AlternativeInputConfig {
  enableKeyboard: boolean;
  enableSwitch: boolean;
  enableEyeTracking: boolean;
  enableVoice: boolean;
}

export class AlternativeInputManager {
  private config: AlternativeInputConfig;
  private activeMode: 'hand' | 'keyboard' | 'switch' | 'eye' | 'voice' = 'hand';
  
  constructor(config: Partial<AlternativeInputConfig> = {}) {
    this.config = {
      enableKeyboard: true,
      enableSwitch: true,
      enableEyeTracking: false, // Requires additional permissions
      enableVoice: true,
      ...config,
    };
  }
  
  // Keyboard mapping for gestures
  getKeyboardMapping(): Record<string, DetectedGesture> {
    return {
      '1': { type: 'number_1', confidence: 1, handedness: null, timestamp: 0 },
      '2': { type: 'number_2', confidence: 1, handedness: null, timestamp: 0 },
      '3': { type: 'number_3', confidence: 1, handedness: null, timestamp: 0 },
      '4': { type: 'number_4', confidence: 1, handedness: null, timestamp: 0 },
      '5': { type: 'number_5', confidence: 1, handedness: null, timestamp: 0 },
      ' ': { type: 'fist', confidence: 1, handedness: null, timestamp: 0 }, // Space
      'ArrowUp': { type: 'pointing', confidence: 1, handedness: null, timestamp: 0 },
      'o': { type: 'open_hand', confidence: 1, handedness: null, timestamp: 0 },
    };
  }
  
  // Switch control (single button)
  handleSwitchPress(): DetectedGesture | null {
    // Cycle through gestures or trigger default action
    return { type: 'pointing', confidence: 1, handedness: null, timestamp: Date.now() };
  }
  
  // Voice commands
  handleVoiceCommand(command: string): DetectedGesture | null {
    const mappings: Record<string, DetectedGesture> = {
      'one': { type: 'number_1', confidence: 0.9, handedness: null, timestamp: 0 },
      'two': { type: 'number_2', confidence: 0.9, handedness: null, timestamp: 0 },
      'fist': { type: 'fist', confidence: 0.9, handedness: null, timestamp: 0 },
      'open': { type: 'open_hand', confidence: 0.9, handedness: null, timestamp: 0 },
    };
    
    return mappings[command.toLowerCase()] || null;
  }
  
  setActiveMode(mode: 'hand' | 'keyboard' | 'switch' | 'eye' | 'voice'): void {
    this.activeMode = mode;
    // Notify UI to update input hints
  }
  
  getActiveMode(): string {
    return this.activeMode;
  }
}
```

### 10.2 Visual Feedback for Accessibility
```typescript
// src/components/vision/AccessibilityFeedback.tsx

import React from 'react';

interface AccessibilityFeedbackProps {
  currentGesture: DetectedGesture | null;
  inputMode: 'hand' | 'keyboard' | 'switch' | 'voice';
  isCalibrating: boolean;
}

export const AccessibilityFeedback: React.FC<AccessibilityFeedbackProps> = ({
  currentGesture,
  inputMode,
  isCalibrating,
}) => {
  return (
    <div className="accessibility-feedback" aria-live="polite">
      {/* Screen reader announcements */}
      <span className="sr-only">
        {inputMode === 'hand' && 'Camera tracking active'}
        {inputMode === 'keyboard' && 'Use number keys 1-5 to select'}
        {inputMode === 'switch' && 'Press switch to select'}
        {inputMode === 'voice' && 'Say a number to select'}
        {currentGesture && `Detected: ${currentGesture.type}`}
        {isCalibrating && 'Calibrating, please hold hand still'}
      </span>
      
      {/* Visual indicators for non-screen-reader users */}
      <div className="visual-indicators">
        {inputMode !== 'hand' && (
          <div className="input-mode-badge">
            {inputMode === 'keyboard' && '⌨️ Keyboard Mode'}
            {inputMode === 'switch' && '🔘 Switch Mode'}
            {inputMode === 'voice' && '🎤 Voice Mode'}
          </div>
        )}
        
        {isCalibrating && (
          <div className="calibration-overlay">
            <div className="calibration-spinner" />
            <p>Getting ready...</p>
          </div>
        )}
        
        {/* High-contrast gesture indicator */}
        {currentGesture && (
          <div className="gesture-indicator high-contrast">
            {getGestureEmoji(currentGesture.type)}
            <span className="gesture-label">{currentGesture.type}</span>
          </div>
        )}
      </div>
    </div>
  );
};

function getGestureEmoji(gesture: string): string {
  const emojis: Record<string, string> = {
    'number_1': '☝️',
    'number_2': '✌️',
    'number_3': '🤟',
    'number_4': '🤘',
    'number_5': '✋',
    'fist': '✊',
    'open_hand': '🖐️',
    'pointing': '👉',
    'pinch': '🤏',
    'peace': '✌️',
    'thumbs_up': '👍',
    'wave': '👋',
  };
  return emojis[gesture] || '🤔';
}
```

---

## 11. Implementation Checklist

### Phase 1: Foundation (Week 1-2)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Set up MediaPipe Tasks Vision | `HandLandmarkerConfig` | 1 day | ☐ |
| Create WebWorker bridge | `HandTrackingBridge` | 2 days | ☐ |
| Build React hook | `useHandTracking` | 2 days | ☐ |
| Implement gesture recognizer | `GestureRecognizer` | 2 days | ☐ |
| Add basic error handling | Error boundaries | 1 day | ☐ |

### Phase 2: Performance (Week 3)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Adaptive frame rate | `AdaptiveFrameRate` | 2 days | ☐ |
| Frame preprocessing optimization | `FramePreprocessor` | 1 day | ☐ |
| Memory management | `ResourceManager`, `CanvasPool` | 2 days | ☐ |
| Device tier detection | `detectDeviceTier` | 1 day | ☐ |

### Phase 3: Reliability (Week 4)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Gesture state machine | `GestureStateMachine` | 2 days | ☐ |
| Fallback manager | `FallbackManager` | 2 days | ☐ |
| Touch fallback component | `TouchFallback` | 1 day | ☐ |
| Accessibility inputs | `AlternativeInputManager` | 2 days | ☐ |

### Phase 4: Testing & Polish (Week 5)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Unit tests | `GestureRecognizer.test.ts` | 2 days | ☐ |
| Integration tests | `useHandTracking.test.tsx` | 2 days | ☐ |
| Device lab testing | Test matrix execution | 3 days | ☐ |
| Accessibility audit | WCAG 2.2 AA compliance | 2 days | ☐ |
| Documentation | This doc + runbooks | 2 days | ☐ |

### Effort Summary
```
Total estimated effort: ~35 engineering days
Team recommendation: 2 engineers (full-time), 1 QA (part-time)
Critical path: Phase 1 + Phase 2 (5 weeks) for MVP
```

---

## 12. References

### 12.1 Libraries & Documentation
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [MediaPipe Web Examples](https://code.mediapipe.dev/codepen)
- [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [WebGPU for Machine Learning](https://web.dev/webgpu-compute/)

### 12.2 Performance Resources
- [Chrome Performance Insights](https://developer.chrome.com/docs/devtools/performance-insights/)
- [Web Vitals](https://web.dev/vitals/)
- [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)

### 12.3 Accessibility Resources
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)

### 12.4 Project Documentation
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) - System architecture
- [`MEDIAPIPE_REACT_UI_INTERACTION_ARCHITECTURE_2026-02-28.md`](./MEDIAPIPE_REACT_UI_INTERACTION_ARCHITECTURE_2026-02-28.md) - Previous research
- [`CONTENT_SAFETY_MODERATION.md`](./CONTENT_SAFETY_MODERATION.md) - Privacy requirements
- [`ACCESSIBILITY_INCLUSIVE_DESIGN.md`](./ACCESSIBILITY_INCLUSIVE_DESIGN.md) - Accessibility guidelines

---

**Last Updated**: 2026-03-05
**Next Review**: After Phase 1 implementation
**Related**: `ARCHITECTURE.md`, `MEDIAPIPE_REACT_UI_INTERACTION_ARCHITECTURE_2026-02-28.md`, `CONTENT_SAFETY_MODERATION.md`

---

*This document provides implementation-ready code patterns for MediaPipe + React integration. All code examples are TypeScript and designed for the Advay Vision Learning platform's browser-based architecture with children's UX considerations.*
