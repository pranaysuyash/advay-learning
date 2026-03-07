# File Audit: src/frontend/src/hooks/useVisionWorkerRuntime.ts

**Audit Date:** 2026-03-06  
**Auditor:** Code Agent  
**Prompt Version:** audit-v1.5.1  
**File Version:** 4b08983 (HEAD)  
**Lines of Code:** 294  
**Ticket:** `TCK-20260307-004`

---

## Execution Environment Declaration

- **Repo access:** YES
- **Git availability:** YES

---

## Executive Summary

**Status:** PRODUCTION-READY, SOPHISTICATED WORKER BRIDGE  
**Risk Level:** LOW  
**Recommended Action:** Add unit tests; otherwise no changes required

This hook provides a **React-friendly interface to a Web Worker** that runs MediaPipe hand tracking off the main thread. It enables 60fps games by offloading computationally expensive vision processing from the UI thread.

**Key Innovation:** Dual transfer modes (`bitmap` | `imageData`) with automatic fallback.

---

## 1. File Purpose & Contract

**Observed:** React hook that manages a Web Worker for vision processing.

**Public Interface:**
```typescript
function useVisionWorkerRuntime(
  options: UseVisionWorkerRuntimeOptions
): UseVisionWorkerRuntimeReturn
```

**Key Capabilities:**
- Worker lifecycle management (init, run, dispose)
- Frame transfer to worker (Bitmap or ImageData)
- In-flight request deduplication
- Automatic fallback on worker failure
- Performance timing tracking

---

## 2. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Thread                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  useGameHandTracking                                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ useVisionWorkerRuntime  ◄── YOU ARE HERE        │  │  │
│  │  │ • Manages Worker lifecycle                      │  │  │
│  │  │ • Sends frames via postMessage                  │  │  │
│  │  │ • Receives results                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↓ postMessage                      │
├─────────────────────────────────────────────────────────────┤
│                      Web Worker                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  vision.worker.ts                                     │  │
│  │  • Runs MediaPipe HandLandmarker                      │  │
│  │  • Processes ImageData/ImageBitmap                    │  │
│  │  • Returns TrackedHandFrame                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Frame Flow

```
Video Frame
     ↓
createImageBitmap(video) ──Fallback──► Canvas 2D → getImageData()
     ↓                                    ↓
ImageBitmap                          ImageData
     ↓                                    ↓
worker.postMessage(bitmap, [bitmap])   worker.postMessage(imageData)
     ↓                                    ↓
     └──────────────┬─────────────────────┘
                    ↓
            handLandmarker.detect(frame)
                    ↓
            TrackedHandFrame result
```

---

## 3. Code Quality Assessment

### 3.1 Strengths ✅

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **Race Condition Handling** | Excellent | `initializingRef` guard (lines 70, 84, 88, 99) |
| **Resource Cleanup** | Excellent | Comprehensive cleanup (lines 169-180) |
| **Transfer Mode Flexibility** | Excellent | `bitmap` (fast) → `imageData` (fallback) |
| **In-Flight Deduplication** | Good | `inFlightRef` prevents frame queue buildup (lines 211-213) |
| **Error Handling** | Good | Multiple fallback triggers (lines 104, 119, 149, 265) |
| **Type Safety** | Good | Uses protocol type guards |

### 3.2 Issues Found

#### Issue-001: No Direct Unit Tests
- **Severity:** MEDIUM
- **Observed:** No `useVisionWorkerRuntime.test.ts`; only protocol tests exist
- **Impact:** Worker lifecycle edge cases untested
- **Mitigation:** Integration tested via `useGameHandTracking` tests

#### Issue-002: `pendingMetaRef` Memory Leak Risk
- **Severity:** LOW
- **Observed:** Line 72-74: `Map<number, Omit<HandTrackingRuntimeMeta, 'video'>>` stores metadata per frame
- **Code:**
```typescript
const pendingMetaRef = useRef(
  new Map<number, Omit<HandTrackingRuntimeMeta, 'video'>>(),
);
```
- **Risk:** If worker fails mid-flight, metadata remains in Map
- **Mitigation:** Cleanup on unmount (line 177) clears entire Map

#### Issue-003: Hard-coded CDN URLs Duplicated
- **Severity:** LOW
- **Observed:** Lines 163-164 duplicate URLs from `useHandTracking.ts`
```typescript
modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/...',
wasmBasePath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
```
- **Inferred:** Same URLs in multiple files; drift risk if version changes

#### Issue-004: No Worker Retry Logic
- **Severity:** INFO
- **Observed:** If worker init fails, falls back to main-thread (line 104)
- **Inferred:** No automatic retry; user must manually retry via game

---

## 4. Dependencies Analysis

### 4.1 Load-Bearing Dependencies

| Dependency | Usage | Load-Bearing |
|------------|-------|--------------|
| `vision.worker.ts` | Web Worker instance | **YES** - Core functionality |
| `vision.protocol.ts` | Type guards | **YES** - Message validation |
| `useGameLoop` | Frame timing | **YES** - Drives frame capture |
| `react-webcam` | Video ref type | NO - Type only |

### 4.2 Worker File

**Path:** `src/frontend/src/workers/vision.worker.ts`

**Responsibilities:**
- Initialize MediaPipe HandLandmarker
- Process ImageData/ImageBitmap frames
- Build `TrackedHandFrame` with pinch detection
- Report processing time

**Running Mode:** `IMAGE` (not `VIDEO`) - worker processes individual frames

---

## 5. Transfer Modes Deep Dive

### Mode 1: ImageBitmap (Default)

**Code:** Lines 222-232
```typescript
if (transferMode === 'bitmap' && typeof createImageBitmap === 'function') {
  const bitmap = await createImageBitmap(video);
  request = {
    type: 'frame',
    id: frameId,
    sentAt: performance.now(),
    transferMode: 'bitmap',
    frame: bitmap,
  };
  worker.postMessage(request, [bitmap]);  // Transfer ownership
  return;
}
```

**Advantages:**
- Zero-copy transfer (`[bitmap]` transfers ownership)
- Faster than ImageData serialization
- Worker calls `.close()` when done (line 89 in worker)

**Requirements:**
- `createImageBitmap()` API support (modern browsers)
- Worker must explicitly close bitmap to free memory

### Mode 2: ImageData (Fallback)

**Code:** Lines 235-258
```typescript
if (!canvasRef.current) {
  canvasRef.current = document.createElement('canvas');
}
const canvas = canvasRef.current;
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext('2d', { willReadFrequently: true });
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

request = {
  type: 'frame',
  id: frameId,
  sentAt: performance.now(),
  transferMode: 'imageData',
  frame: imageData,
};
worker.postMessage(request);  // Structured clone (copies data)
```

**Advantages:**
- Universal browser support
- No special transfer requirements

**Disadvantages:**
- Slower (canvas readback + structured clone)
- Higher memory pressure

---

## 6. Usage Analysis

### 6.1 Consumers

| File | Usage |
|------|-------|
| `useGameHandTracking.ts` | Primary consumer - enables worker runtime mode |
| `useGameHandTracking.trackingLoss.test.ts` | Mocked in tests |

### 6.2 Configuration

**Environment Variables:**
- `VITE_VISION_WORKER_ENABLED` (default: `'true'`)
- `VITE_VISION_WORKER_FORCE_MAIN_THREAD` (default: `'false'`)

**Runtime Mode Resolution:**
```typescript
if (VISION_WORKER_FORCE_MAIN_THREAD) return 'main-thread';
if (!VISION_WORKER_ENABLED_BY_ENV) return 'main-thread';
if (!workerSupported) return 'main-thread';
```

---

## 7. Message Protocol

### Request Types

```typescript
type VisionWorkerRequest =
  | { type: 'init'; ...config }           // Initialize HandLandmarker
  | { type: 'frame'; id; frame; ... }     // Process video frame
  | { type: 'dispose' };                  // Cleanup resources
```

### Response Types

```typescript
type VisionWorkerResponse =
  | { type: 'init:result'; ok; message? }
  | { type: 'frame:result'; id; ok; frame?; error?; processingMs }
  | { type: 'error'; error };
```

### Type Guards

**Location:** `vision.protocol.ts` (lines 61-91)

```typescript
isWorkerFrameResult(payload): payload is WorkerFrameResult
isWorkerInitResponse(payload): payload is WorkerInitResponse
isWorkerErrorEvent(payload): payload is WorkerErrorEvent
```

**Purpose:** Runtime type checking for untrusted worker messages

---

## 8. Performance Characteristics

| Aspect | Main-Thread | Worker (Bitmap) | Worker (ImageData) |
|--------|-------------|-----------------|-------------------|
| **CPU Impact** | Blocks UI | Minimal UI impact | Minimal UI impact |
| **Memory** | Shared heap | Transferable | Copied |
| **Latency** | Lowest | Low | Higher |
| **Throughput** | Best | Good | Acceptable |

**Target FPS:** 30 (configurable via `targetFps`)

**Frame Drop Prevention:**
- `inFlightRef` prevents sending new frame while previous processes
- Ensures only one frame in flight at a time

---

## 9. Security Assessment

| Vector | Status | Notes |
|--------|--------|-------|
| **Worker Script Injection** | N/A | Worker loaded from same-origin module |
| **XSS via Frame Data** | N/A | Video data is binary, not text |
| **CSP Violations** | ⚠️ | `blob:` worker URLs may need CSP adjustment |
| **Memory Exhaustion** | LOW | Bitmap transfer limits memory duplication |

---

## 10. Testing Gap Analysis

| Test Type | Status | Gap |
|-----------|--------|-----|
| Unit tests | ❌ Missing | No `useVisionWorkerRuntime.test.ts` |
| Protocol tests | ✅ Exists | `vision.protocol.test.ts` |
| Integration | ✅ Indirect | Via `useGameHandTracking` tests |
| Worker tests | ❌ Missing | No `vision.worker.test.ts` |

**Recommended Tests:**
1. Worker initialization success/failure paths
2. Frame transfer (bitmap and imageData modes)
3. In-flight deduplication
4. Cleanup on unmount
5. Fallback trigger scenarios

---

## 11. Findings Summary

### HIGH Priority
_None_

### MEDIUM Priority
1. **TEST-001:** Add unit tests for hook lifecycle
2. **TEST-002:** Add worker unit tests (Jest with `jsdom` or `node` worker mock)

### LOW Priority
3. **CONFIG-001:** Extract CDN URLs to shared config
4. **DOC-001:** Document transfer mode selection criteria

### INFO (No Action)
5. **ARCH-001:** Consider extracting protocol to separate package for reuse

---

## 12. Related Artifacts

- `src/frontend/src/workers/vision.worker.ts` - Worker implementation
- `src/frontend/src/workers/vision.protocol.ts` - Message protocol
- `src/frontend/src/workers/__tests__/vision.protocol.test.ts` - Protocol tests
- `docs/audit/src__frontend__src__hooks__useGameHandTracking.ts.md` - Parent hook audit

---

## 13. Complete Worker Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      MAIN THREAD                             │
│                                                              │
│  ┌─────────────────────┐     ┌──────────────────────────┐   │
│  │  useGameHandTracking│────►│ useVisionWorkerRuntime   │   │
│  │  (orchestrates)     │     │ (manages worker)         │   │
│  └─────────────────────┘     └──────────────┬───────────┘   │
│                                             │                │
│  ┌─────────────────────┐                   │ postMessage    │
│  │ useHandTracking     │◄────Fallback─────┘                │
│  │ (main-thread)       │                                    │
│  └─────────────────────┘                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼ postMessage
┌──────────────────────────────────────────────────────────────┐
│                      WEB WORKER                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  vision.worker.ts                                    │   │
│  │                                                      │   │
│  │  1. Initialize HandLandmarker                        │   │
│  │     FilesetResolver.forVisionTasks(wasmBasePath)     │   │
│  │     HandLandmarker.createFromOptions(...)            │   │
│  │                                                      │   │
│  │  2. Process Frame                                    │   │
│  │     handLandmarker.detect(ImageBitmap|ImageData)     │   │
│  │     buildTrackedHandFrame(hands, pinchState)         │   │
│  │                                                      │   │
│  │  3. Return Result                                    │   │
│  │     postMessage({ type: 'frame:result', frame })     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

**End of Audit**
