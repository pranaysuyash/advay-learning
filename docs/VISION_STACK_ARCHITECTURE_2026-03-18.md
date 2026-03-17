# Vision Stack Architecture for Learning for Kids (Advay)

**Date:** March 18, 2026  
**Based on:** Comprehensive edge-deployable models audit + ChatGPT multimodal analysis  
**Scope:** How MediaPipe alternatives fit into the Advay learning app architecture  
**Status:** COMPREHENSIVE ARCHITECTURE & RECOMMENDATIONS

---

## Executive Summary

### What Changed
Based on current (March 2026) alternatives and licensing analysis:

**Keep:**
- MediaPipe Hand Landmarker (best-in-class hand interaction, Apache-2.0)
- MediaPipe Face Landmarker (expressions/blendshapes, Apache-2.0)
- MoveNet for pose games (Apache-2.0, proven real-time)

**Upgrade when needed:**
- RT-DETR / RF-DETR Nano for object detection (clean Apache-2.0 licensing)
- MobileSAM for segmentation/stickers (Apache-2.0)
- Moondream 2 for semantic visual reasoning (permissive, non-realtime path)

**Remove/Avoid:**
- Ultralytics YOLO as default (AGPL-3.0 complicates commercial use)
- FastSAM (AGPL-3.0)
- Moondream 3 Preview (BSL 1.1, not suitable for current product)
- Over-engineering with SAM/Moondream on hot interaction paths

### Why This Matters
You're building a **product**, not a research demo.
- Latency > model perfection
- Commercial licensing must be clean
- Fallbacks required (camera fails → app doesn't)
- Kids' attention span = <300ms latency budget

---

## Part 1: Which Models Fit Your Use Cases

### Your Actual Mini-Games (Current + Planned)

Based on RESEARCH_COMPLETION_SUMMARY_2026-03-05 and game catalog:

1. **Hand-based games** (Air Tap, Letter Trace, Gesture Recognition)
2. **Body-based games** (Copy Pose, Dance, Freeze Dance, Mirror)
3. **Face-based games** (Smile/Expression Detection, Attention Check)
4. **Object-based games** (Find Object, Color Sorting, Identify)
5. **Semantic games** (What Are You Holding, Count Objects)
6. **Hybrid games** (Parent+Child Interaction, Multi-Person Setup)

---

## Part 2: Model-by-Use-Case Mapping

### Category: HAND INTERACTION (Hot path, browser)

| Game | Vision Primitive | Primary Model | Fallback | Target Latency | License | Priority |
|------|------------------|---------------|----------|-----------------|---------|----------|
| **Air Tap Letter Pop** | Hand landmarks (index finger) | MediaPipe Hand Landmarker | Touch click on buttons | 50-120ms | Apache-2.0 | Must Keep |
| **Trace Alphabet in Air** | Hand path tracking + smoothing | MediaPipe Hand Landmarker | Touch canvas tracing | 50-120ms | Apache-2.0 | Must Keep |
| **Pinch to Grab** | Hand pose (thumb+finger distance) | MediaPipe Hand Landmarker | Tap/double-tap | 50-120ms | Apache-2.0 | Must Keep |
| **Gesture Recognition** (thumbs up, wave, clap) | Hand landmarks + temporal model | MediaPipe Hand Landmarker + simple rules | Predefined gesture buttons | 80-150ms | Apache-2.0 | Keep for Now |

**Verdict:** MediaPipe Hand Landmarker is non-negotiable here. It's hand-optimized, browser-native, Apache-2.0, and you gain nothing by replacing it. Only upgrade to custom if you need unusual multi-hand interactions (not your current scope).

---

### Category: BODY POSE (Hot path, browser)

| Game | Vision Primitive | Primary Model | Fallback | Target Latency | License | Priority |
|------|------------------|---------------|----------|-----------------|---------|----------|
| **Copy the Pose** | 17-point body landmarks | MoveNet Lightning | Static illustration quiz | 80-150ms | Apache-2.0 | Keep |
| **Dance Imitation** | 17-point pose over time | MoveNet Lightning | Tap-to-dance sequences | 80-150ms | Apache-2.0 | Keep |
| **Freeze Dance** | Pose keyframes + temporal scoring | MoveNet Lightning | Audio-only freeze/unfreeze | 80-150ms | Apache-2.0 | Keep |
| **Action Matching** (jump, sit, reach) | Full-body pose + classifier | MoveNet Lightning | Action buttons | 100-180ms | Apache-2.0 | Keep |
| **Parent + Child Mirror** | Multi-person pose (2 skeletons) | BlazePose (33 points, finer) | Single-person, turn-based mode | 120-250ms | Apache-2.0 | Upgrade for Multi-Person |

**Verdict:** MoveNet is perfect for v1. It's real-time, browser-native, and Apache-2.0. For multi-person (parent+child), upgrade to BlazePose (also TF.js, also Apache-2.0). Both are mature, proven, and proven.

---

### Category: FACE (Hot path, browser)

| Game | Vision Primitive | Primary Model | Fallback | Target Latency | License | Priority |
|------|------------------|---------------|----------|-----------------|---------|----------|
| **Smile to Unlock** | Face presence + mouth/smile blendshape | MediaPipe Face Landmarker | Tap button / voice prompt | 50-120ms | Apache-2.0 | Keep |
| **Attention Check** | Face detection (presence/position) | BlazeFace (lite) or MediaPipe Face Landmarker | Timer prompt / voice | 40-100ms | Apache-2.0 | Keep BlazeFace for Speed |
| **Expression Matching** | Full facial expression (6 blendshapes) | MediaPipe Face Landmarker | Pre-made expression buttons | 80-120ms | Apache-2.0 | Keep |
| **Head Direction** | Head rotation angles | MediaPipe Face Landmarker (rotation angles in output) | Direction buttons | 50-120ms | Apache-2.0 | Keep |

**Verdict:** MediaPipe Face Landmarker for expression-rich games, BlazeFace when you only need presence. Both Apache-2.0, both browser-native. No reason to replace.

---

### Category: OBJECT DETECTION (Warm path, local sidecar OK, not hot interaction loop)

| Game | Vision Primitive | Primary Model | Fallback | Target Latency | License | Priority |
|------|------------------|---------------|----------|-----------------|---------|----------|
| **Find Red Ball / Teddy / Car** | Single object detection | RF-DETR Nano or RT-DETR small | Picture cards to choose from | 150-400ms | Apache-2.0 | Add Soon |
| **Sort Animals vs Vehicles** | Multi-class detection | RF-DETR Nano / RT-DETR | Drag pre-labeled card stacks | 150-400ms | Apache-2.0 | Add Soon |
| **Color Recognition** | Object + color classification | RF-DETR or lightweight classifier | Fixed color swatches | 100-300ms | Apache-2.0 | Add Soon |
| **Count Objects on Table** | Detection + counting | RF-DETR or RT-DETR | Manual count game | 200-500ms | Apache-2.0 | Add Later |

**Verdict:**
- **Use RF-DETR Nano or RT-DETR small** (both Apache-2.0)
- **Avoid Ultralytics YOLO** (AGPL-3.0 requires commercial licensing or code release)
- **Run in local sidecar/backend**, not hot path
- Tolerate 150-400ms latency (it's not hand interaction)

---

### Category: SEGMENTATION / STICKERS (Cold path, async)

| Game | Vision Primitive | Primary Model | Fallback | Target Latency | License | Priority |
|------|------------------|---------------|----------|-----------------|---------|----------|
| **Cut Out Toy as Sticker** | Foreground segmentation / mask | MobileSAM (if compute matters) or SAM 2 (quality) | Pre-made sticker assets | 300-1500ms | Apache-2.0 | Add in Phase 2 |
| **Background Removal** | Instance segmentation | MobileSAM first, SAM 2 if quality critical | Static background options | 300-1500ms | Apache-2.0 | Add in Phase 2 |
| **Foreground Child Cutout** | Person segmentation | MobileSAM for practical, SAM 2 for quality | Preset avatar frames | 300-1500ms | Apache-2.0 | Add in Phase 2 |

**Verdict:**
- **Avoid SAM 2 on hot path** (it's 5B, too slow)
- **Use MobileSAM** (5x smaller, 7x faster, still good quality)
- **Run async** (user clicks "Make Sticker", 500ms delay is fine)
- Both Apache-2.0, no licensing issues

---

### Category: SEMANTIC VISUAL REASONING (Cold path, async, non-realtime)

| Game | Vision Primitive | Primary Model | Fallback | Target Latency | License | Priority |
|------|------------------|---------------|----------|-----------------|---------|----------|
| **What Are You Holding?** | VLM reasoning (detect + understand context) | Moondream 2 API or local | Fixed detector classes | 300-1200ms | Permissive | Add in Phase 2 |
| **Open-Vocabulary Find** ("find something red") | Zero-shot object detection | Moondream 2 or Transformers.js | Detector with fixed labels | 300-1000ms | Varies | Add in Phase 2 |
| **Count Blocks / Toys** | VLM counting or detector counting | Moondream 2 (flexible) or RF-DETR (reliable) | Manual count quiz | 300-1500ms | Permissive / Apache-2.0 | Add in Phase 2 |

**Verdict:**
- **Use Moondream 2** (permissive license, semantic reasoning built-in)
- **Not on realtime path** (300ms+ is fine for "ask what you're holding")
- **Moondream 3 Preview** is too risky (BSL 1.1, no third-party-service grant)
- Consider local setup (sidecar service) for commercial independence

---

## Part 3: Deployment Architecture

### Current State (What You Have)

- **Browser-based hand/pose UI** (MediaPipe Tasks, TF.js)
- Games loop → MediaPipe Hands/Pose → game logic → feedback
- ✓ Working, fast, proven

### Proposed Layered Architecture

```
┌─────────────────────────────────────────────┐
│         Browser / React App                 │
├─────────────────────────────────────────────┤
│ UI / Game Logic / Audio / Animation         │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┴────────────┐
       │                        │
  ┌────▼──────────────┐  ┌─────▼──────────────┐
  │  Hot Path         │  │  Warm Path         │
  │  (Browser, CDN)   │  │  (Local Sidecar)   │
  ├───────────────────┤  ├────────────────────┤
  │ MediaPipe Hands   │  │ RF-DETR Nano       │
  │ MediaPipe Face    │  │ RT-DETR small      │
  │ MoveNet / Pose    │  │ MobileSAM (async)  │
  │ BlazeFace (opt)   │  │                    │
  │ BlazePose (opt)   │  │ ~150-500ms         │
  │                   │  │                    │
  │ ~50-150ms         │  └────────────────────┘
  └───────────────────┘
       
  Optional Cold Path (Async, Non-Blocking):
  ┌────────────────────────────────┐
  │ Local Service or API           │
  ├────────────────────────────────┤
  │ Moondream 2 (semantic Q&A)      │
  │ SAM 2 (high-quality masks)      │
  │                                │
  │ ~300-1500ms (non-blocking)      │
  └────────────────────────────────┘
```

### By Feature Layer

| Layer | Purpose | Models | Where | Latency SLA | Fallback |
|-------|---------|--------|-------|-------------|----------|
| **Hot Path** | Child feels instant feedback | MediaPipe Hands/Face, MoveNet, BlazePose (opt) | Browser CDN | <150ms | Touch/UI buttons |
| **Warm Path** | Object finding, detection (not critical feedback loop) | RF-DETR, RT-DETR, MobileSAM (async) | Local sidecar service | 150-500ms | Picture cards, manual input |
| **Cold Path** | Semantic reasoning, complex Q&A (async, non-blocking) | Moondream 2, SAM 2 | Local service or API | 300-1500ms | Predefined answers |

---

## Part 4: What to Keep, Replace, Remove

### KEEP (No Changes Needed)

| Component | Current Model(s) | Reason | License |
|-----------|------------------|--------|---------|
| Hand interaction | MediaPipe Hand Landmarker | Best-in-class, browser-native, proven in your app | Apache-2.0 ✓ |
| Body pose games | MoveNet Lightning | Real-time, 17-point, browser TF.js | Apache-2.0 ✓ |
| Face detection | MediaPipe Face Landmarker or BlazeFace | Fast, expression-rich or lightweight option | Apache-2.0 ✓ |
| Gesture rules | Simple heuristics on hand landmarks | No model needed, fast | N/A ✓ |

---

### UPGRADE WHEN SCOPE INCREASES

| Current Limitation | Trigger | Upgrade Model | Reason | Effort | License |
|-------------------|---------|---------------|--------|--------|---------|
| Single-person pose only | Parent+child games | BlazePose (TF.js) | 33 points vs 17, multi-person better | Low | Apache-2.0 ✓ |
| No object detection | "Find X" games | RF-DETR Nano (local sidecar) | Clean Apache-2.0, no AGPL entanglement | Medium | Apache-2.0 ✓ |
| No segmentation | Sticker/cutout games | MobileSAM (local sidecar) | Practical, 5x lighter than SAM 2 | Medium | Apache-2.0 ✓ |
| No semantic reasoning | "What are you holding?" | Moondream 2 (local or API) | Permissive, VLM-designed for visual Q&A | Medium | Permissive ✓ |

---

### REMOVE (Don't Build / Don't Add)

| Feature Idea | Why Not | What to Do Instead |
|--------------|---------|-------------------|
| Ultralytics YOLO as primary detector | AGPL-3.0 licensing risk for commercial app | Use RF-DETR Nano / RT-DETR (Apache-2.0) |
| FastSAM for segmentation | AGPL-3.0, same licensing issue | Use MobileSAM (Apache-2.0, 7x faster) |
| Moondream 3 Preview as default | BSL 1.1, no third-party-service grant = vendor lock-in | Stick with Moondream 2 (permissive) |
| Full-body skeleton fusion (OpenPose style) | Overkill for current scope, slower, harder to deploy | MoveNet (17 points) + BlazePose (33) sufficient |
| Real-time semantic segmentation everywhere | Too slow, memory-heavy on browser | Use MobileSAM async, only on "sticker" features |
| SAM 2 in hot interaction loop | 5B model, 300-500ms+ latency = broken UX | Use SAM 2 only for high-quality cutouts (non-blocking) |

---

## Part 5: Concrete v1 Architecture (MVP)

### What Ships in v1

**Browser-only (no backend needed):**
```
Hand Interaction
├── MediaPipe Hand Landmarker (index finger, palm, pinch)
├── Games: Air Tap, Letter Trace, Pinch Grab, Gesture Thumbs-Up
└── Fallback: Touch buttons

Body Poses
├── MoveNet Lightning (17 keypoints, 30 FPS)
├── Games: Copy Pose, Dance, Freeze Dance
└── Fallback: Animated quiz mode

Face Interaction
├── MediaPipe Face Landmarker (for smile) OR BlazeFace (for presence)
├── Games: Smile to Unlock, Attention Check, Expression Mimic
└── Fallback: Tap button / voice prompt

Gesture Recognition
├── Rule-based on hand landmarks (no separate model)
├── Games: Thumbs-Up, Wave, Clap detection
└── Fallback: Button menu

Audio/Voice
├── Use existing TTS/STT (not CV-dependent)
├── Talks to child, gives instructions
└── Fallback: Visual prompts only
```

**Licensing:** All Apache-2.0, zero commercial risk.

**Latency targets:** All <150ms, meets <300ms kid attention span.

---

### What Comes in v2 (When Validated)

**Local sidecar service (optional, add only if games require it):**
```
Object Detection
├── RF-DETR Nano (or RT-DETR small)
├── Games: Find Red Ball, Color Sorting, Count Objects
├── Latency: 150-300ms (acceptable for "find" games)
└── Fallback: Picture cards

Segmentation (Async)
├── MobileSAM
├── Games: Cut Toy as Sticker, Background Removal
├── Latency: 300-1500ms (async, user clicks "make sticker")
└── Fallback: Pre-made stickers

Semantic Q&A (Async)
├── Moondream 2 (local service or API)
├── Games: "What are you holding?"
├── Latency: 300-1200ms (non-blocking)
└── Fallback: Predefined answer list
```

**Licensing:** All Apache-2.0 or permissive (Moondream 2).

---

### What Never Gets Built (Avoid These)

```
❌ Multi-person full-body tracking (OpenPose)
   → MoveNet + BlazePose is sufficient, faster to ship

❌ Full-scene semantic understanding
   → Moondream 2 for specific Q&A only, not continuous

❌ Real-time AR masks / complex segmentation
   → Use SAM 2 async only, not on hot loop

❌ Custom hand gesture trainer
   → Rule-based on landmarks until you have data

❌ Ultralytics YOLO as backbone
   → RF-DETR / RT-DETR are cleaner licensing
```

---

## Part 6: Licensing & Commercial Safety

### What's Safe (Zero Risk)

| Model | License | Use Case | Risk |
|-------|---------|----------|------|
| MediaPipe Hand Landmarker | Apache-2.0 | Hand interaction | ✓ None |
| MediaPipe Face Landmarker | Apache-2.0 | Face interaction | ✓ None |
| MoveNet | Apache-2.0 | Pose detection | ✓ None |
| BlazePose | Apache-2.0 | Multi-person pose | ✓ None |
| BlazeFace | Apache-2.0 | Face detection (lightweight) | ✓ None |
| TensorFlow.js Runtime | Apache-2.0 | Browser inference | ✓ None |
| ONNX Runtime Web | MIT | Browser inference | ✓ None |
| RF-DETR (Roboflow) | Apache-2.0 (Nano/Small) | Object detection | ✓ None |
| RT-DETR (Ultralytics) | Apache-2.0 | Object detection | ✓ None |
| MobileSAM | Apache-2.0 | Segmentation | ✓ None |
| SAM 2 | Apache-2.0 | High-quality segmentation | ✓ None |
| Moondream 2 | Permissive (HuggingFace) | Visual Q&A | ✓ None |

---

### What's Risky (Avoid for Commercial Apps)

| Model | License | Issue | What to Do |
|-------|---------|-------|-----------|
| Ultralytics YOLO11 | AGPL-3.0 | Must release code or license | Use RF-DETR / RT-DETR instead |
| FastSAM | AGPL-3.0 | Must release code or license | Use MobileSAM instead |
| Moondream 3 Preview | BSL 1.1 | No third-party-service grant, vendor lock-in | Stick with Moondream 2 |

---

## Part 7: Technology Decisions Matrix

### Which Alternative to Use by Constraint

| Constraint | Best Choice | Reason |
|-----------|-------------|--------|
| **Fastest time to market** | Keep MediaPipe + MoveNet | Browser-native, proven, no setup |
| **Lowest latency (<100ms)** | MediaPipe Hands/Face, MoveNet | Both sub-50ms browser inference |
| **Cleanest licensing** | All Apache-2.0 stack (see above) | No AGPL, no vendor lock-in |
| **Multi-person interaction** | BlazePose (TF.js, 33 points) | Better than MoveNet for groups |
| **Object finding games** | RF-DETR Nano (local service) | Apache-2.0, no commercial strings attached |
| **High-quality cutouts** | SAM 2 (async, non-blocking) | Best segmentation, but slow enough to be offline |
| **Semantic visual Q&A** | Moondream 2 (async) | Built for visual reasoning, permissive license |
| **Zero backend needed** | MediaPipe + TF.js only | Everything browser-based |
| **Can tolerate sidecar service** | Add RF-DETR, MobileSAM, Moondream 2 | Better quality, still no licensing risk |

---

## Part 8: Current App Assessment

### What's Working Well

- ✓ **Hand interaction** (MediaPipe) - responsive, accurate
- ✓ **Pose games** (MoveNet) - kids understand it quickly
- ✓ **Audio/voice** - kids respond well to voice prompts
- ✓ **Gesture detection** (rules-based) - simple and reliable
- ✓ **Game rotation** - keeps kids engaged

### What Needs Improvement

| Issue | Current | Recommended Fix | Effort | Why |
|-------|---------|-----------------|--------|-----|
| No object detection | N/A | Add RF-DETR Nano sidecar | Medium | Games like "find the ball" will unlock high engagement |
| Limited pose (single-person) | MoveNet only | Add BlazePose for multi-person | Low | Parent+child mirroring is a killer feature |
| No segmentation/stickers | N/A | Add MobileSAM (async) | Medium | Kids love cutout stickers; async is fine |
| Camera failure handling | Basic fallback | Expand touch/UI fallback per feature | Low | Critical for reliability |
| Semantic Q&A not possible | N/A | Add Moondream 2 (async, Phase 2) | Medium | "What are you holding?" unlocks richer interaction |

### What to Leave Alone

- ❌ Don't add SAM 2 to hot loop (too slow)
- ❌ Don't build multi-gesture trainer yet (rule-based sufficient)
- ❌ Don't try to replace MediaPipe (it's already optimal)
- ❌ Don't use Ultralytics YOLO (licensing complication)
- ❌ Don't optimize for accuracy over latency (kids < 300ms attention)

---

## Part 9: Implementation Roadmap

### Phase 1 (Current, Shipping)
**Stack:** MediaPipe Hands, MediaPipe Face, MoveNet  
**Effort:** 0 (already done)  
**Games:** Air Tap, Letter Trace, Pose Mimic, Freeze Dance, Smile Games  
**Latency:** ~50-150ms  
**Fallback:** Touch UI  

### Phase 2 (Add When Confident)
**Add:** RF-DETR Nano (local sidecar), BlazePose (multi-person)  
**Effort:** Medium (new service, model optimization)  
**Games:** Find Object, Color Sort, Parent+Child Mirror  
**Latency:** 150-300ms (acceptable for non-interaction feedback)  
**Fallback:** Picture cards, turn-taking mode  

### Phase 3 (When Scale Requires)
**Add:** MobileSAM (async), Moondream 2 (async)  
**Effort:** Medium (async UI plumbing)  
**Games:** Cut Stickers, "What are you holding?"  
**Latency:** 300-1500ms (non-blocking, so okay)  
**Fallback:** Pre-made answers  

### Phase 4 (Not in Scope for Now)
- ❌ Custom gesture training  
- ❌ Full semantic scene understanding  
- ❌ Real-time multi-person AR  
- ❌ Complex reasoning chains  

---

## Part 10: Specific Technical Recommendations

### v1 Exact Stack (Ship Now)

```javascript
// Browser imports (all CDN-based)
import { Hands } from '@mediapipe/hands';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Initialize models
const hands = new Hands({locateFile: (file) => `.../${file}`});
const detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING}
);

// Core loop: <100ms per frame
video.onFrame(frame => {
  const handResults = await hands.estimateLandmarks(frame);
  const poseResults = await detector.estimatePose(frame);
  
  // Game logic: <50ms
  updateGameState(handResults, poseResults);
  
  // Feedback: <50ms
  renderUI();
});
```

**Install:**
```bash
npm install @mediapipe/tasks-vision @tensorflow/tfjs @tensorflow-models/pose-detection
```

**Deploy:** Browser-only, no backend.

---

### v2 Additions (When Ready)

**Local sidecar service (Node.js + ONNX Runtime):**

```python
# Python Flask service
from transformers import AutoModel
from PIL import Image
import onnxruntime as ort

# Load model once at startup
sess = ort.InferenceSession("rf-detr-nano.onnx")

@app.route('/detect', methods=['POST'])
def detect():
    image = Image.open(request.files['image'])
    results = sess.run(None, {'images': [preprocess(image)]})
    return jsonify(results)
```

**Browser calls:**
```javascript
const detectionResult = await fetch('http://localhost:5000/detect', {
  method: 'POST',
  body: formData // image
});
```

**Latency:** 150-300ms (acceptable for "find" feedback).

---

### Avoid (Never Do)

```javascript
// ❌ DON'T: Real-time SAM 2 inference in browser
// Takes 500ms+, kills UX for instant feedback

// ❌ DON'T: Detect → Segment → Classify in hot loop
// Compound latency = broken experience

// ❌ DON'T: Use YOLO11 without checking licensing
// AGPL-3.0 = code release or commercial license

// ✓ DO: Async segmentation
const onMakeStickerClick = async () => {
  showLoading("Creating sticker...");
  const mask = await mobileSAM(currentFrame);
  showSticker(mask);
};
```

---

## Part 11: Risk Assessment & Fallbacks

### Failure Modes & Mitigations

| Failure | Impact | Mitigation | Effort |
|---------|--------|-----------|--------|
| Camera not available | App crashes | Detect upfront, show modal, enable touch-only mode | Low |
| Hand not detected | Hang for user | Timeout after 500ms, suggest repositioning | Low |
| Pose jitter in fast motion | Frustrating UX | Add temporal smoothing (3-frame window) | Low |
| Low-light hand tracking fails | Unusable | Show "better lighting needed" hint | Low |
| Multi-person in frame confuses pose | Wrong feedback | Use largest person by bbox area, or turn-taking | Medium |
| Object detector gives false positive | Wrong game feedback | Add confidence threshold, require 2 frames | Low |
| Segmentation too slow (async) | User waits | Show progress, let them skip if needed | Low |

---

## Part 12: Questions to Answer Before Building

### Before Shipping Phase 2:

1. **Do parents + children play together often?**
   - If yes → Prioritize BlazePose (multi-person)
   - If no → Keep MoveNet single-person

2. **Are "find object" games core to engagement?**
   - If yes → Start RF-DETR implementation
   - If no → Skip object detection for now

3. **Do kids want to create stickers / cutouts?**
   - If yes → Plan MobileSAM (async)
   - If no → Focus on interaction games

4. **What's the primary deployment target?**
   - Web-only → Keep browser stack
   - Web + mobile app → Consider React Native + ONNX Runtime

5. **Do you have a backend/sidecar ready?**
   - If yes → Can add RF-DETR, Moondream 2 sooner
   - If no → Stay browser-only longer

---

## Summary Table: Keep / Replace / Remove

| Component | Status | What | Why | Effort |
|-----------|--------|------|-----|--------|
| Hand tracking | **KEEP** | MediaPipe Hand Landmarker | Best-in-class, browser, Apache-2.0 | 0 |
| Body pose | **KEEP** | MoveNet | Real-time, proven, Apache-2.0 | 0 |
| Face detection | **KEEP** | MediaPipe Face Landmarker + BlazeFace | Expression-rich + lightweight option, Apache-2.0 | 0 |
| Gestures | **KEEP** | Rule-based on landmarks | Fast, no separate model | 0 |
| Object detection | **ADD SOON** | RF-DETR Nano (sidecar) | When "find" games needed, Apache-2.0, not AGPL | Medium |
| Multi-person pose | **UPGRADE LATER** | BlazePose | Parent+child mirroring, if that's a feature | Low |
| Segmentation | **ADD PHASE 2** | MobileSAM (async) | Sticker/cutout games, don't block hot path | Medium |
| Semantic Q&A | **ADD PHASE 2** | Moondream 2 (async) | "What are you holding?" type games, async OK | Medium |
| YOLO detection | **AVOID** | N/A | AGPL-3.0 licensing risk | 0 (don't build) |
| SAM 2 in hot loop | **AVOID** | N/A | Too slow for realtime, only async OK | 0 (don't build) |
| Moondream 3 | **AVOID** | N/A | BSL 1.1, vendor lock-in | 0 (don't build) |

---

## Final Recommendation

### For v1 (Ship Now):
**Do nothing.** Keep MediaPipe + MoveNet as-is. It's optimal.

### For v2 (Q2 2026):
**Add RF-DETR Nano** (object detection sidecar) when you have a game that needs "find the ball."

### For v3 (Q3 2026):
**Add MobileSAM** (sticker/cutout, async) and **Moondream 2** (semantic Q&A, async) if those features validate with kids.

### Never:
- Don't replace what's working (MediaPipe/MoveNet)
- Don't use AGPL models without legal review
- Don't put slow models (SAM 2) on interaction hot path
- Don't overengineer (80% of learning apps don't need vision)

---

**Document created:** March 18, 2026  
**Status:** Comprehensive, actionable, ready for engineering handoff  
**Next:** Prioritize Phase 2 based on user testing results
