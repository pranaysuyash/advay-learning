/// <reference lib="webworker" />

import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

import {
  type VisionWorkerRequest,
  type VisionWorkerResponse,
  type WorkerFrameResult,
  type WorkerInitResponse,
} from './vision.protocol';
import { getHandLandmarkLists } from '../utils/landmarkUtils';
import { buildTrackedHandFrame } from '../utils/handTrackingFrame';
import { createDefaultPinchState } from '../utils/pinchDetection';
import type { PinchOptions, PinchState } from '../types/tracking';

let handLandmarker: HandLandmarker | null = null;
let pinchState: PinchState = createDefaultPinchState();
let pinchOptions: PinchOptions | undefined;
let resetPinchOnNoHand = true;

const workerScope = self as DedicatedWorkerGlobalScope;

async function initialize(req: Extract<VisionWorkerRequest, { type: 'init' }>) {
  const vision = await FilesetResolver.forVisionTasks(req.wasmBasePath);

  handLandmarker?.close();
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: req.modelAssetPath,
      delegate: req.delegate,
    },
    runningMode: 'IMAGE',
    numHands: req.numHands,
    minHandDetectionConfidence: req.minDetectionConfidence,
    minHandPresenceConfidence: req.minHandPresenceConfidence,
    minTrackingConfidence: req.minTrackingConfidence,
  });

  pinchOptions = req.pinchOptions;
  resetPinchOnNoHand = req.resetPinchOnNoHand ?? true;
  pinchState = createDefaultPinchState(req.pinchOptions);
}

async function processFrame(
  req: Extract<VisionWorkerRequest, { type: 'frame' }>,
): Promise<WorkerFrameResult> {
  const start = performance.now();

  try {
    if (!handLandmarker) {
      return {
        type: 'frame:result',
        id: req.id,
        ok: false,
        error: 'Worker was not initialized',
        processingMs: performance.now() - start,
      };
    }

    const results = handLandmarker.detect(req.frame);
    const hands = getHandLandmarkLists(results);
    const trackedFrame = buildTrackedHandFrame({
      hands,
      previousPinchState: pinchState,
      pinchOptions,
      resetPinchOnNoHand,
      timestamp: performance.now() / 1000,
    });

    pinchState = trackedFrame.pinch.state;

    return {
      type: 'frame:result',
      id: req.id,
      ok: true,
      frame: trackedFrame,
      processingMs: performance.now() - start,
    };
  } catch (error) {
    return {
      type: 'frame:result',
      id: req.id,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown worker frame error',
      processingMs: performance.now() - start,
    };
  } finally {
    if (req.transferMode === 'bitmap' && 'close' in req.frame) {
      req.frame.close();
    }
  }
}

workerScope.onmessage = async (event: MessageEvent<VisionWorkerRequest>) => {
  const req = event.data;

  try {
    if (req.type === 'init') {
      await initialize(req);
      const response: WorkerInitResponse = {
        type: 'init:result',
        ok: true,
      };
      workerScope.postMessage(response satisfies VisionWorkerResponse);
      return;
    }

    if (req.type === 'frame') {
      const result = await processFrame(req);
      workerScope.postMessage(result satisfies VisionWorkerResponse);
      return;
    }

    if (req.type === 'dispose') {
      handLandmarker?.close();
      handLandmarker = null;
      pinchState = createDefaultPinchState();
    }
  } catch (error) {
    const response: VisionWorkerResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown worker error',
    };
    workerScope.postMessage(response);
  }
};

export {};
