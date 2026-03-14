import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type Webcam from 'react-webcam';

import type { PinchOptions, TrackedHandFrame, UseHandTrackingOptions } from '../types/tracking';
import { useGameLoop } from './useGameLoop';
import type { HandTrackingRuntimeMeta } from './useHandTrackingRuntime';
import {
  isWorkerErrorEvent,
  isWorkerFrameResult,
  isWorkerInitResponse,
  type VisionWorkerTransferMode,
  type WorkerFrameRequest,
} from '../workers/vision.protocol';
import { visionService } from '../services/ai/vision';

interface VisionWorkerConfig {
  enabled: boolean;
  targetFps?: number;
  transferMode?: VisionWorkerTransferMode;
}

export interface UseVisionWorkerRuntimeOptions {
  isRunning: boolean;
  webcamRef: RefObject<Webcam | null>;
  targetFps?: number;
  handTracking?: UseHandTrackingOptions;
  pinchOptions?: PinchOptions;
  resetPinchOnNoHand?: boolean;
  workerConfig?: VisionWorkerConfig;
  onFrame: (frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => void;
  onNoVideoFrame?: () => void;
  onError?: (error: unknown) => void;
  onRuntimeFallback?: (reason: string) => void;
}

export interface UseVisionWorkerRuntimeReturn {
  isReady: boolean;
  error: Error | null;
  isLoading: boolean;
  supportsWorkerRuntime: boolean;
}

function supportsWorkerRuntime(): boolean {
  return (
    typeof Worker !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined'
  );
}

export function useVisionWorkerRuntime(
  options: UseVisionWorkerRuntimeOptions,
): UseVisionWorkerRuntimeReturn {
  const {
    isRunning,
    webcamRef,
    targetFps = 30,
    handTracking,
    pinchOptions,
    resetPinchOnNoHand = true,
    workerConfig,
    onFrame,
    onNoVideoFrame,
    onError,
    onRuntimeFallback,
  } = options;

  const isWorkerSupported = useMemo(() => supportsWorkerRuntime(), []);
  const transferMode = workerConfig?.transferMode ?? 'bitmap';
  const workerEnabled = Boolean(workerConfig?.enabled && isWorkerSupported);
  const pinchStartThreshold = pinchOptions?.startThreshold ?? 0.05;
  const pinchReleaseThreshold = pinchOptions?.releaseThreshold ?? 0.07;
  const pinchLandmarkA = pinchOptions?.landmarks?.[0] ?? 4;
  const pinchLandmarkB = pinchOptions?.landmarks?.[1] ?? 8;

  const workerRef = useRef<Worker | null>(null);
  const initializingRef = useRef(false);  // Guard to prevent race condition
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pendingMetaRef = useRef(
    new Map<number, Omit<HandTrackingRuntimeMeta, 'video'>>(),
  );
  const inFlightRef = useRef(false);
  const frameIdRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const onFrameRef = useRef(onFrame);
  const onNoVideoFrameRef = useRef(onNoVideoFrame);
  const onErrorRef = useRef(onError);
  const onRuntimeFallbackRef = useRef(onRuntimeFallback);

  useEffect(() => {
    onFrameRef.current = onFrame;
    onNoVideoFrameRef.current = onNoVideoFrame;
    onErrorRef.current = onError;
    onRuntimeFallbackRef.current = onRuntimeFallback;
  }, [onError, onFrame, onNoVideoFrame, onRuntimeFallback]);

  useEffect(() => {
    if (workerEnabled) {
      return;
    }

    initializingRef.current = false;
    inFlightRef.current = false;
    pendingMetaRef.current.clear();
    setIsReady(false);
    setIsLoading(false);
  }, [workerEnabled]);

  useEffect(() => {
    // Guard against race condition - prevent multiple simultaneous initializations
    if (!workerEnabled || workerRef.current || initializingRef.current) {
      return;
    }

    initializingRef.current = true;
    setIsLoading(true);

    const worker = new Worker(new URL('../workers/vision.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (isWorkerInitResponse(event.data)) {
        initializingRef.current = false;  // Reset guard after init completes
        setIsLoading(false);
        setIsReady(event.data.ok);
        if (!event.data.ok) {
          const initError = new Error(event.data.message ?? 'Failed to initialize vision worker');
          setError(initError);
          onRuntimeFallbackRef.current?.('worker-init-failed');
        }
        return;
      }

      if (isWorkerFrameResult(event.data)) {
        inFlightRef.current = false;
        const video = webcamRef.current?.video;
        const meta = pendingMetaRef.current.get(event.data.id);
        pendingMetaRef.current.delete(event.data.id);

        if (!event.data.ok) {
          const frameError = new Error(event.data.error ?? 'Vision worker frame failed');
          setError(frameError);
          onErrorRef.current?.(frameError);
          onRuntimeFallbackRef.current?.('worker-frame-failed');
          return;
        }

        if (!video || !meta || !event.data.frame) {
          return;
        }

        onFrameRef.current(event.data.frame, {
          ...meta,
          video,
        });
        return;
      }

      if (isWorkerErrorEvent(event.data)) {
        const workerError = new Error(event.data.error);
        setError(workerError);
        setIsReady(false);
        onErrorRef.current?.(workerError);
        onRuntimeFallbackRef.current?.('worker-runtime-error');
      }
    };

    const handleError = (event: ErrorEvent) => {
      const workerError = new Error(event.message || 'Worker failed');
      setError(workerError);
      setIsReady(false);
      setIsLoading(false);
      onErrorRef.current?.(workerError);
      onRuntimeFallbackRef.current?.('worker-uncaught-error');
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    const cdn = visionService.getCDNConfig();
    worker.postMessage({
      type: 'init',
      numHands: handTracking?.numHands ?? 1,
      minDetectionConfidence: handTracking?.minDetectionConfidence ?? 0.3,
      minHandPresenceConfidence: handTracking?.minHandPresenceConfidence ?? 0.3,
      minTrackingConfidence: handTracking?.minTrackingConfidence ?? 0.3,
      delegate: handTracking?.delegate ?? 'GPU',
      modelAssetPath: cdn.model,
      wasmBasePath: cdn.wasm,
      pinchOptions: {
        startThreshold: pinchStartThreshold,
        releaseThreshold: pinchReleaseThreshold,
        landmarks: [pinchLandmarkA, pinchLandmarkB],
      },
      resetPinchOnNoHand,
    });

    return () => {
      initializingRef.current = false;  // Allow re-initialization
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.postMessage({ type: 'dispose' });
      worker.terminate();
      workerRef.current = null;
      inFlightRef.current = false;
      pendingMetaRef.current.clear();
    };
  }, [
    handTracking?.delegate,
    handTracking?.minDetectionConfidence,
    handTracking?.minHandPresenceConfidence,
    handTracking?.minTrackingConfidence,
    handTracking?.numHands,
    pinchLandmarkA,
    pinchLandmarkB,
    pinchReleaseThreshold,
    pinchStartThreshold,
    resetPinchOnNoHand,
    workerEnabled,
  ]);

  // Canvas cache for fallback path - avoid reallocation
  const canvasSizeRef = useRef<{ width: number; height: number } | null>(null);

  const postFrameToWorker = useCallback(
    async (meta: Omit<HandTrackingRuntimeMeta, 'video'>) => {
      const video = webcamRef.current?.video;
      const worker = workerRef.current;
      if (!video || !worker || !isReady) {
        onNoVideoFrameRef.current?.();
        return;
      }

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        onNoVideoFrameRef.current?.();
        return;
      }

      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;

      const frameId = ++frameIdRef.current;
      pendingMetaRef.current.set(frameId, meta);
      try {
        let request: WorkerFrameRequest;

        // PREFERRED: Use zero-copy ImageBitmap transfer with downscaling for performance
        if (transferMode === 'bitmap' && typeof createImageBitmap === 'function') {
          try {
            // Downscale to 640x480 for faster inference (reduces processing by ~75% for HD video)
            const bitmap = await createImageBitmap(video, {
              resizeWidth: 640,
              resizeHeight: 480,
              resizeQuality: 'medium',
            });
            request = {
              type: 'frame',
              id: frameId,
              sentAt: performance.now(),
              transferMode: 'bitmap',
              frame: bitmap,
            };
            worker.postMessage(request, [bitmap]); // Zero-copy transfer!
            return;
          } catch (bitmapError) {
            // Log but continue to fallback
            console.warn('[useVisionWorkerRuntime] createImageBitmap failed, falling back to canvas:', bitmapError);
          }
        }

        // FALLBACK: Optimized canvas path with minimal copying
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
          // Cache dimensions to avoid reallocation
          canvasRef.current.width = 640;
          canvasRef.current.height = 480;
          canvasSizeRef.current = { width: 640, height: 480 };
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {
          willReadFrequently: true,
          alpha: false, // Disable alpha channel for faster copies (~25% speedup)
        });

        if (!ctx) {
          throw new Error('Could not create 2D context for worker frame transfer');
        }

        // Draw with scaling to reduce data size (640x480 = 1.2MB vs 1920x1080 = 8.3MB)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        request = {
          type: 'frame',
          id: frameId,
          sentAt: performance.now(),
          transferMode: 'imageData',
          frame: imageData,
        };
        // Transfer ownership of the buffer to avoid copy
        worker.postMessage(request, [imageData.data.buffer]);
      } catch (postError) {
        inFlightRef.current = false;
        pendingMetaRef.current.delete(frameId);
        const err = postError instanceof Error ? postError : new Error('Failed to post frame to worker');
        setError(err);
        onErrorRef.current?.(err);
        onRuntimeFallbackRef.current?.('worker-post-frame-failed');
      }
    },
    [isReady, transferMode, webcamRef],
  );

  useGameLoop({
    isRunning: isRunning && isReady,
    targetFps: workerConfig?.targetFps ?? targetFps,
    onFrame: useCallback(
      (deltaTimeMs, fps) => {
        void postFrameToWorker({
          timestamp: performance.now(),
          deltaTimeMs,
          fps,
        });
      },
      [postFrameToWorker],
    ),
  });

  return {
    isReady,
    error,
    isLoading,
    supportsWorkerRuntime: isWorkerSupported,
  };
}

export default useVisionWorkerRuntime;
