# Vision Provider Survey (2026-03-05)

Camera/scene understanding options relevant to hand tracking, gesture
recognition, and general object classification. The codebase currently
uses MediaPipe extensively; this document evaluates that choice and
identifies alternatives.

## Codebase Usage

- `src/features/physics-playground/hand-tracking/HandTracker.ts` – an
  input‑state wrapper around MediaPipe Hands. Migrated February 2026 from
  `@mediapipe/hands` to the newer `@mediapipe/tasks-vision` API.
- `package.json` includes `@mediapipe/camera_utils`, `@mediapipe/hands`.
- Other pages (games) call `useHandTracker` hooks directly.
- No generic `VisionService` abstraction exists; vision logic lives inside
  feature code.

## MediaPipe Overview

MediaPipe is a Google open‑source framework offering cross-platform
vision solutions. Popular pipelines include:

- **Hands** – 21‑point hand keypoints ~15 ms on mobile CPU. Supports
  gesture inference. Used by us.
- **FaceMesh** – 468 face landmarks, used for AR filters.
- **Pose** – full‑body keypoints.
- **Objectron** / **Object Detection** – 3D bounding boxes.
- **Segmentation** – person/background masks.

Key strengths:

- Zero dependencies; runs in browser via WASM or WebGPU.
- Very low latency (<50 ms) with WebGL/WebGPU.
- Maintained by Google with quarterly releases.
- Suitable for on-device inference (privacy, offline).

Limitations:

- Heavier models for full body/face can exceed 20 MB and take 100 ms.
- Gesture classification must be implemented on top of keypoints.
- Lack of extensibility for custom training.

## Alternatives

| Provider                         | Type  | Models                                  | Latency     | Strengths                                   | Weaknesses                                              |
| -------------------------------- | ----- | --------------------------------------- | ----------- | ------------------------------------------- | ------------------------------------------------------- |
| **TensorFlow.js**                | Local | MoveNet, BlazeFace, BlazePose, HandPose | 30‑150 ms   | Highly configurable; can load custom models | Larger bundle size; slower on CPU vs MediaPipe          |
| **OpenCV.js + DNN**              | Local | YOLO, MobileNet, custom                 | 100‑300 ms  | Fully open; wide model support              | Complicated JS API; larger payload                      |
| **onnxruntime-web**              | Local | Any ONNX model (e.g. YOLO‑X)            | 50‑200 ms   | Easy port of Python models; WebGPU support  | Must ship model files; no prebuilt high‑level pipelines |
| **Google Cloud Vision / AutoML** | Cloud | Proprietary                             | 500‑1500 ms | Extremely accurate; powerful features       | Requires network; privacy concerns                      |
| **MediaPipe (existing)**         | Local | Hands, Pose, Face, etc                  | 15‑70 ms    | Optimized, well‑tested, small               | Limited to Google-provided models                       |

### Observations

- MediaPipe remains the **best fit** for hand tracking – it is already
  integrated and outperforms other runtimes on mobile by 2×. The only
  real competitor is TensorFlow.js MoveNet/HandPose, which is slightly
  heavier and harder to tune.
- For high‑level object detection (e.g. classifying physical objects like
  letters), an ONNX/YOLO model via `onnxruntime-web` could supplement
  MediaPipe; this would live in a new VisionService.
- Full‑body pose tracking for games could use TensorFlow.js MoveNet+Pose
  or MediaPipe Pose; both are similar performance.

## Recommendations

1. **Keep MediaPipe as primary vision engine.** Expand use to other
   pipelines (pose, face) as needed.
2. **Create a `VisionService` abstraction** that wraps MediaPipe initialization
   and exposes typed keypoints/gestures. This will enable easier mocks and
   testing (similar to LLMService/STTService).
3. **Add onnxruntime-web provider** for custom object detection or future
   ML models not supported by MediaPipe. Load models from HF hub or local
   bundle.
4. **Continue monitoring TF.js v4** – its WebGPU backend may catch up
   soon, at which point a generic `TFJSVisionProvider` could be added.
5. **Consider precomputing small gesture classifiers** on a keypoints stream
   rather than shipping giant CNNs; this keeps bundle size low.

## Next steps

- Add research ticket TCK‑20260305‑013 :: VisionService design + MediaPipe
  consolidation.
- Benchmark MediaPipe Hands vs TF.js HandPose on a low‑end tablet with
  child‑sized hand videos – confirm latency/accuracy gap.
- Evaluate shipping a tiny YOLO‑F model (5 MB) via onnxruntime-web for
  letter/object recognition; decide whether it belongs inside VisionService.

_Research completed March 5 2026_
