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

  const workerRef = useRef<Worker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pendingMetaRef = useRef(
    new Map<number, Omit<HandTrackingRuntimeMeta, 'video'>>(),
  );
  const inFlightRef = useRef(false);
  const frameIdRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workerConfig?.enabled || !isWorkerSupported || workerRef.current) {
      return;
    }

    setIsLoading(true);

    const worker = new Worker(new URL('../workers/vision.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (isWorkerInitResponse(event.data)) {
        setIsLoading(false);
        setIsReady(event.data.ok);
        if (!event.data.ok) {
          const initError = new Error(event.data.message ?? 'Failed to initialize vision worker');
          setError(initError);
          onRuntimeFallback?.('worker-init-failed');
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
          onError?.(frameError);
          onRuntimeFallback?.('worker-frame-failed');
          return;
        }

        if (!video || !meta || !event.data.frame) {
          return;
        }

        onFrame(event.data.frame, {
          ...meta,
          video,
        });
        return;
      }

      if (isWorkerErrorEvent(event.data)) {
        const workerError = new Error(event.data.error);
        setError(workerError);
        setIsReady(false);
        onError?.(workerError);
        onRuntimeFallback?.('worker-runtime-error');
      }
    };

    const handleError = (event: ErrorEvent) => {
      const workerError = new Error(event.message || 'Worker failed');
      setError(workerError);
      setIsReady(false);
      setIsLoading(false);
      onError?.(workerError);
      onRuntimeFallback?.('worker-uncaught-error');
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    worker.postMessage({
      type: 'init',
      numHands: handTracking?.numHands ?? 1,
      minDetectionConfidence: handTracking?.minDetectionConfidence ?? 0.3,
      minHandPresenceConfidence: handTracking?.minHandPresenceConfidence ?? 0.3,
      minTrackingConfidence: handTracking?.minTrackingConfidence ?? 0.3,
      delegate: handTracking?.delegate ?? 'GPU',
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      wasmBasePath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
      pinchOptions,
      resetPinchOnNoHand,
    });

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.postMessage({ type: 'dispose' });
      worker.terminate();
      workerRef.current = null;
      inFlightRef.current = false;
      pendingMetaRef.current.clear();
      setIsReady(false);
      setIsLoading(false);
    };
  }, [
    handTracking?.delegate,
    handTracking?.minDetectionConfidence,
    handTracking?.minHandPresenceConfidence,
    handTracking?.minTrackingConfidence,
    handTracking?.numHands,
    isWorkerSupported,
    onError,
    onFrame,
    onRuntimeFallback,
    pinchOptions,
    resetPinchOnNoHand,
    webcamRef,
    workerConfig?.enabled,
  ]);

  const postFrameToWorker = useCallback(
    async (meta: Omit<HandTrackingRuntimeMeta, 'video'>) => {
      const video = webcamRef.current?.video;
      const worker = workerRef.current;
      if (!video || !worker || !isReady) {
        onNoVideoFrame?.();
        return;
      }

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        onNoVideoFrame?.();
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

        if (transferMode === 'bitmap' && typeof createImageBitmap === 'function') {
          const bitmap = await createImageBitmap(video);
          request = {
            type: 'frame',
            id: frameId,
            sentAt: performance.now(),
            transferMode: 'bitmap',
            frame: bitmap,
          };
          worker.postMessage(request, [bitmap]);
          return;
        }

        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Could not create 2D context for worker frame transfer');
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        request = {
          type: 'frame',
          id: frameId,
          sentAt: performance.now(),
          transferMode: 'imageData',
          frame: imageData,
        };
        worker.postMessage(request);
      } catch (postError) {
        inFlightRef.current = false;
        pendingMetaRef.current.delete(frameId);
        const err = postError instanceof Error ? postError : new Error('Failed to post frame to worker');
        setError(err);
        onError?.(err);
        onRuntimeFallback?.('worker-post-frame-failed');
      }
    },
    [isReady, onError, onNoVideoFrame, onRuntimeFallback, transferMode, webcamRef],
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
