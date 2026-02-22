import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import type { PinchOptions } from '../types/tracking';

export type VisionWorkerTransferMode = 'imageData' | 'bitmap';

export interface WorkerInitRequest {
  type: 'init';
  numHands: number;
  minDetectionConfidence: number;
  minHandPresenceConfidence: number;
  minTrackingConfidence: number;
  delegate: 'GPU' | 'CPU';
  modelAssetPath: string;
  wasmBasePath: string;
  pinchOptions?: PinchOptions;
  resetPinchOnNoHand?: boolean;
}

export interface WorkerInitResponse {
  type: 'init:result';
  ok: boolean;
  message?: string;
}

export interface WorkerFrameRequest {
  type: 'frame';
  id: number;
  sentAt: number;
  transferMode: VisionWorkerTransferMode;
  frame: ImageData | ImageBitmap;
}

export interface WorkerFrameResult {
  type: 'frame:result';
  id: number;
  ok: boolean;
  frame?: TrackedHandFrame;
  error?: string;
  processingMs: number;
}

export interface WorkerErrorEvent {
  type: 'error';
  error: string;
}

export interface WorkerDisposeRequest {
  type: 'dispose';
}

export type VisionWorkerRequest =
  | WorkerInitRequest
  | WorkerFrameRequest
  | WorkerDisposeRequest;

export type VisionWorkerResponse =
  | WorkerInitResponse
  | WorkerFrameResult
  | WorkerErrorEvent;

export function isWorkerFrameResult(
  payload: unknown,
): payload is WorkerFrameResult {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as WorkerFrameResult).type === 'frame:result' &&
    typeof (payload as WorkerFrameResult).id === 'number'
  );
}

export function isWorkerInitResponse(
  payload: unknown,
): payload is WorkerInitResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as WorkerInitResponse).type === 'init:result' &&
    typeof (payload as WorkerInitResponse).ok === 'boolean'
  );
}

export function isWorkerErrorEvent(
  payload: unknown,
): payload is WorkerErrorEvent {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as WorkerErrorEvent).type === 'error' &&
    typeof (payload as WorkerErrorEvent).error === 'string'
  );
}
