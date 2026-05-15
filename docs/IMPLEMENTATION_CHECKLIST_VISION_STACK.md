# Implementation Checklist: Vision Stack Architecture

**Date:** March 18, 2026  
**For:** Learning for Kids (Advay App)  
**Based on:** VISION_STACK_ARCHITECTURE_2026-03-18.md

---

## Phase 1: KEEP (v1 - Current, No Changes)

### Hand Interaction (MediaPipe Hand Landmarker)

- [x] Already integrated
- [ ] Verify latency <50ms per frame in production
- [ ] Test in low-light scenarios
- [ ] Confirm finger landmark accuracy (index, middle)
- [ ] Test pinch gesture (thumb-index distance)
- [ ] Verify palm detection for "hand present" check

**Games using this:**
- Air Tap Letter Pop
- Trace Alphabet in Air
- Pinch to Grab
- Gesture Recognition (thumbs-up, wave, clap)

**Action:** No changes needed. Just document performance metrics.

---

### Body Pose (MoveNet Lightning)

- [x] Already integrated
- [ ] Verify 17-point detection accuracy
- [ ] Confirm FPS on target devices
- [ ] Test in occlusion scenarios (arms crossed, behind body)
- [ ] Measure latency on low-end devices
- [ ] Verify temporal smoothing working

**Games using this:**
- Copy the Pose
- Dance Imitation
- Freeze Dance
- Action Matching (jump, sit, reach)

**Action:** Run performance benchmark on target devices, log results.

---

### Face Detection (MediaPipe Face Landmarker + BlazeFace)

- [ ] Choose which to use by game:
  - [ ] `BlazeFace` for attention checks (lighter, faster)
  - [ ] `MediaPipe Face Landmarker` for expression (richer output)
- [ ] Verify smile detection accuracy (blendshape)
- [ ] Test head rotation angles (for direction games)
- [ ] Measure latency <50ms per frame

**Games using this:**
- Smile to Unlock
- Attention Check
- Expression Matching
- Head Direction Tracking

**Action:** Create feature detection matrix (which model per game).

---

### Gesture Recognition (Rules-Based)

- [x] Hand landmarks → gesture heuristics
- [ ] Verify gesture accuracy
- [ ] Add temporal smoothing (reduce false positives)
- [ ] Document gesture rules (thumbs-up, wave, clap thresholds)

**Action:** Document gesture detection rules in code comments.

---

### Audio / Voice Layer

- [ ] Confirm TTS/STT not CV-dependent
- [ ] Verify instructions clear to kids
- [ ] Test audio fallback when camera fails

**Action:** No changes, confirm works as-is.

---

## Phase 1 Verification Checklist

- [ ] Run all games on target devices (iPad, iPhone, Android tablet)
- [ ] Measure FPS and latency for each feature
- [ ] Test low-light, high-light, indoor, outdoor
- [ ] Verify touch fallback works when camera unavailable
- [ ] Check Apache-2.0 licensing documented
- [ ] Performance benchmarks in project README

**Target:** All Phase 1 features <150ms latency, >20 FPS

---

## Phase 2: ADD (When Confident - Probably Q2 2026)

### Object Detection (RF-DETR Nano)

#### Pre-Implementation
- [ ] Define required objects to detect (ball, teddy, car, apple, etc.)
- [ ] Gather training images for domain (kids' toys)
- [ ] Decide: pre-trained COCO or custom fine-tune?
- [ ] Choose deployment: local Node.js sidecar or Python Flask?
- [ ] Estimate inference budget (compute, storage, network)

#### Architecture
- [ ] Create local sidecar service (Node.js or Python)
- [ ] Load RF-DETR Nano model at startup
- [ ] Implement `/detect` endpoint
- [ ] Add request batching for latency optimization
- [ ] Cache model weights locally

#### Integration
- [ ] Browser captures frame → sends to sidecar
- [ ] Sidecar returns detection boxes + confidence
- [ ] Browser highlights objects, checks game condition
- [ ] Handle sidecar unavailable (fallback to picture cards)

#### Testing
- [ ] Verify detection accuracy on custom objects
- [ ] Measure latency: <300ms roundtrip
- [ ] Test in various lighting conditions
- [ ] Verify graceful fallback if service unavailable
- [ ] Benchmark CPU/memory on target server

#### Games
- Find Red Ball / Teddy / Car
- Sort Animals vs Vehicles
- Color Recognition + Sorting
- Count Objects on Table

**Files to create:**
- `src/services/object-detector.ts` (browser client)
- `backend/models/rf-detr-service.py` or `.js` (inference)
- `docs/OBJECT_DETECTION_SPEC.md` (technical details)

**Action:** Start after Phase 1 validates successfully.

---

### Multi-Person Pose (BlazePose)

#### Pre-Implementation
- [ ] Confirm parent+child games are core feature
- [ ] Understand multi-person pose use cases
  - [ ] Mirroring (1:1 parent-child)
  - [ ] Group actions (multiple kids)
  - [ ] Turn-taking mode

#### Migration from MoveNet
- [ ] Keep MoveNet for single-person (backward compat)
- [ ] Add BlazePose detection in parallel
- [ ] Switch based on # of people detected
- [ ] Test pose scoring with 2 people

#### Games
- Parent and Child Mirror
- Group Dance
- Multi-Person Actions

**Files to create:**
- `src/models/blazepose-detector.ts`
- `docs/MULTI_PERSON_DESIGN.md`

**Action:** Low effort, deprioritized until multi-person game metrics good.

---

## Phase 3: ADD (When Validating - Probably Q3 2026)

### Segmentation (MobileSAM)

#### Pre-Implementation
- [ ] Confirm sticker/cutout games are high-engagement
- [ ] Understand use cases:
  - [ ] Cut toy as sticker (interactive)
  - [ ] Background removal (for AR)
  - [ ] Foreground child cutout (for memories)
- [ ] Decide: real-time or async only?
  - Recommendation: async only (500ms+ is slow)

#### Architecture
- [ ] Add MobileSAM to sidecar service
- [ ] Implement `/segment` endpoint
- [ ] Make it **non-blocking** (show spinner, user can skip)
- [ ] Cache masks for same object/background

#### Integration
- [ ] User clicks "Make Sticker"
- [ ] Background shows "Creating sticker..." spinner
- [ ] Sidecar processes frame with MobileSAM
- [ ] Browser receives mask → blends into background
- [ ] User can save sticker or retry

#### Testing
- [ ] Verify segmentation quality on kids/toys
- [ ] Measure latency: 300-1500ms (acceptable for async)
- [ ] Test mask quality on various backgrounds
- [ ] Verify sticker rendering smooth
- [ ] Confirm "skip" button works

#### Games
- Cut Out Toy as Sticker
- Background Removal
- Foreground Child Cutout

**Files to create:**
- `src/services/segmentation-client.ts`
- `backend/models/mobilesam-service.py`
- `docs/STICKER_CREATION_FLOW.md`

**Action:** Deprioritized until engagement metrics justify async flow.

---

### Semantic Visual Q&A (Moondream 2)

#### Pre-Implementation
- [ ] Confirm semantic games are high-value
- [ ] Use cases:
  - [ ] "What are you holding?"
  - [ ] "Find something red"
  - [ ] "How many toys?"
- [ ] Decide: Moondream 2 API vs local service?
  - Recommendation: Local (for privacy + independence)
- [ ] Plan infrastructure (may need GPU for speed)

#### Architecture
- [ ] Add Moondream 2 to sidecar
- [ ] Implement `/question` endpoint
- [ ] Make it **async** (non-blocking, 300-1200ms OK)
- [ ] Cache responses for repeated questions

#### Integration
- [ ] User sees visual prompt: "What am I holding?"
- [ ] Browser captures frame
- [ ] Sidecar runs Moondream 2 inference
- [ ] Returns text answer
- [ ] Browser evaluates answer (correct/incorrect)

#### Testing
- [ ] Verify accuracy on objects kids hold
- [ ] Measure latency: 300-1200ms
- [ ] Test on various objects and backgrounds
- [ ] Verify fallback to predefined answers
- [ ] Confirm privacy (no data sent to cloud)

#### Games
- What Are You Holding?
- Open-Vocabulary Find
- Visual Reasoning Tasks

**Files to create:**
- `src/services/moondream-client.ts`
- `backend/models/moondream-service.py`
- `docs/SEMANTIC_VISION_SPEC.md`

**Action:** Deprioritized, add only if semantic games show high engagement.

---

## NEVER Build (Risk Assessment)

### ❌ YOLO11 as Primary Detector

**Why not:**
- AGPL-3.0 license
- Requires code release or commercial license for proprietary app
- RF-DETR is Apache-2.0, same performance, no strings

**If you really need it:**
- [ ] Consult legal team
- [ ] Get commercial license from Ultralytics
- [ ] Document license obligation

**Better:** Use RF-DETR / RT-DETR instead.

---

### ❌ FastSAM as Primary Segmentation

**Why not:**
- AGPL-3.0 license (same as YOLO)
- MobileSAM is Apache-2.0, 7x faster, sufficient quality

**Better:** Use MobileSAM.

---

### ❌ SAM 2 in Hot Interaction Loop

**Why not:**
- 5B model = 300-500ms+ latency
- Kids lose attention in <300ms
- Breaks UX for instant feedback

**When to use SAM 2:**
- High-quality cutouts (async, non-blocking)
- Sticker creation (user clicked "make sticker", can wait)
- Never on interaction hot path

---

### ❌ Moondream 3 Preview

**Why not:**
- BSL 1.1 license
- No third-party-service grant
- Vendor lock-in risk

**Use instead:** Moondream 2 (permissive, HuggingFace).

---

### ❌ Over-Parameterized Models

**Don't:**
- Don't use full SAM (too big, too slow)
- Don't use 405B LLMs for simple reasoning
- Don't run continuous semantic understanding
- Don't process every frame with heavy models

**Do:**
- Use lightweight models on hot path (MoveNet, MediaPipe)
- Use async for heavy computation (SAM, Moondream)
- Use simple heuristics when possible (gesture rules)
- Batch inference when you can

---

## Testing & Validation Framework

### Phase 1 Validation

```markdown
Test Date: ___________

Device: iPad | iPhone | Android Tablet | Web Browser

HAND TRACKING:
- [ ] Air Tap latency: ______ms (target: <100ms)
- [ ] Pinch accuracy: ______% (target: >90%)
- [ ] Trace smoothness: passes / fails
- [ ] Low-light performance: good / ok / bad

BODY POSE:
- [ ] Pose detection FPS: ______ (target: >20)
- [ ] Occlusion handling: good / ok / bad
- [ ] Temporal smoothing: passes / fails
- [ ] Multi-pose avoidance: single / multi (should be single)

FACE:
- [ ] Smile detection accuracy: ______% (target: >85%)
- [ ] Attention check: passes / fails
- [ ] Head direction angles: accurate / jittery

OVERALL:
- [ ] Total latency per frame: ______ ms (target: <150ms)
- [ ] Memory usage: ______ MB
- [ ] CPU usage: ______ %
- [ ] Any crashes: yes / no
- [ ] Touch fallback works: yes / no
```

---

### Phase 2 Validation (RF-DETR)

```markdown
OBJECT DETECTION:
- [ ] Detection accuracy on custom objects: ______%
- [ ] Latency per request: ______ ms (target: <300ms)
- [ ] Sidecar memory: ______ MB
- [ ] Sidecar CPU: ______ %
- [ ] Fallback behavior: works / broken
- [ ] Multiple objects: detected / missed
- [ ] Confidence threshold tuning: passes / fails
```

---

## Deployment Checklist

### Browser Components
- [ ] MediaPipe Hands CDN link works
- [ ] MediaPipe Face CDN link works
- [ ] TensorFlow.js MoveNet loads
- [ ] All models cached (Service Worker)
- [ ] No CORS issues
- [ ] Performance acceptable on 4G

### Sidecar Service (If Phase 2+)
- [ ] Docker container builds
- [ ] Model weights downloaded at startup
- [ ] API endpoint responds <300ms
- [ ] Graceful shutdown on SIGTERM
- [ ] Health check endpoint `/health`
- [ ] Error handling (bad image, timeout, etc.)
- [ ] Logging working

### Licensing
- [ ] All dependencies checked for AGPL/BSL
- [ ] Apache-2.0 and MIT licenses only
- [ ] LICENSE file updated
- [ ] Third-party notices documented

---

## Decision Tree: When to Advance Phase

### Phase 1 → Phase 2
**Condition:** Hand/pose/face games showing >80% engagement rate + confident latency <150ms

**Actions before advancing:**
- [ ] Run 10 hours of user testing
- [ ] Measure engagement per game type
- [ ] Confirm latency targets met
- [ ] Plan Phase 2 (object detection) timing

### Phase 2 → Phase 3
**Condition:** Object detection games showing >70% engagement + backend infrastructure ready

**Actions before advancing:**
- [ ] Run 10 hours of user testing with object games
- [ ] Measure sidecar stability
- [ ] Gather sticker creation requests from kids
- [ ] Confirm semantic game ideas from user testing

---

## Final Shipping Checklist

- [ ] All Apache-2.0 / MIT licenses only
- [ ] No AGPL / BSL models
- [ ] Latency <150ms (hot path)
- [ ] Fallback for each feature
- [ ] Performance tested on 3+ devices
- [ ] Camera permission handling
- [ ] Touch-only mode functional
- [ ] Audio clear and helpful
- [ ] Documentation complete
- [ ] Legal review passed
- [ ] Ready for app store submission

---

**Document created:** March 18, 2026  
**Status:** Ready to hand to engineering team  
**Next step:** Run Phase 1 validation on real devices
