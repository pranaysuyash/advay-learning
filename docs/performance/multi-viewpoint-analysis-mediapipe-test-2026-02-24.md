# Multi-Viewpoint Analysis: MediaPipeTest.tsx

**Date**: 2026-02-24
**Analyzed By**: opencode (Senior Engineer)
**File**: `src/frontend/src/pages/MediaPipeTest.tsx`
**Lines**: 780
**Purpose**: Test/debug page for MediaPipe CV features (hands, face, posture, gestures)

---

## Scoring Rubric

| Criterion | Score (0-5) | Rationale |
|-----------|----------------|-----------|
| **A) Impact** (runtime/user/business) | 3 | Test/debug page for CV development - not production-facing, but critical for MediaPipe game debugging and feature validation |
| **B) Risk** (bugs/security/reliability) | 3 | Camera access, external CDN URLs, potential memory leaks from animation frame loops, but isolated to test page |
| **C) Complexity** (hard to reason about) | 5 | 4 MediaPipe integrations, complex Canvas drawing, multiple state updates per frame, animation frame management, landmark coordinate transformations |
| **D) Changeability** (safe to improve) | 4 | All logic in one 780-line component, drawing code mixed with state management, no separation of concerns, difficult to extend |
| **E) Learning Value** (good place for experiments) | 4 | Rich domain (CV features, Canvas rendering, MediaPipe integration) perfect for research in performance patterns, state management optimization, and testing strategies |

**Total Score**: 19/25

**Why This File Beats Candidates**:
- api.ts (17/25): Already optimized; low complexity
- wordBuilderLogic.ts (2617 lines): Pure game logic; well-bounded scope; low learning value
- ConnectTheDots.tsx (863 lines): Complex but production game; lower risk for test page analysis

---

## Repo Snapshot

**Language**: TypeScript (React)
**Build System**: Vite
**Runtime**: React 18 with MediaPipe Tasks Vision
**Testing**: Vitest
**Key Patterns**:
- React hooks (useState, useRef, useCallback, useEffect, useMemo)
- Canvas API for drawing landmarks
- requestAnimationFrame for detection loop
- MediaPipe Task Vision SDK

---

## Candidate Files Considered

| File | Lines | Score | Reason Not Chosen |
|------|-------|-------|------------------|
| src/frontend/src/services/api.ts | 132 | 17 | Already optimized; bounded scope |
| src/frontend/src/pages/ConnectTheDots.tsx | 863 | 18 | Production game; lower test value |
| **src/frontend/src/pages/MediaPipeTest.tsx** | **780** | **19** | **CHOSEN** |

---

## Multi-Viewpoint Findings

### VIEWPOINT 1: Maintainer

**Findings**:

1. **780-Line Monolith - All Logic in One Component** - Lines 1-780
```typescript
export const MediaPipeTest = memo(function MediaPipeTest() {
    // 27 state variables
    // 12 useCallback hooks
    // 2 useEffect hooks
    // 4 MediaPipe models
    // 3 drawing functions
    // 1 detection loop
    // All in ONE component
});
```
**Evidence**: Entire MediaPipe test page is one component. Landmarker initialization, Canvas drawing, gesture detection, face tracking, posture detection, UI rendering all mixed together.

**Root Cause**: No separation of concerns; single component doing everything
**Impact**: Hard to maintain; difficult to test; risky to change; cognitive load high

**Fix Idea**: Extract into multiple modules:
```typescript
// hooks/useMediaPipeDetection.ts
export function useMediaPipeDetection(activeTab: FeatureTab) {
    const [hands, setHands] = useState<HandDetection[]>([]);
    const [face, setFace] = useState<FaceDetection | null>(null);
    const [pose, setPose] = useState<PoseDetection | null>(null);

    const runDetection = useCallback(() => {
        // Detection logic only
    }, [activeTab]);

    return { hands, face, pose, runDetection };
}

// hooks/useLandmarkerLoader.ts
export function useLandmarkerLoader() {
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

    const initialize = async (type: FeatureTab) => {
        // Load logic only
    };

    return { handLandmarkerRef, faceLandmarkerRef, poseLandmarkerRef, initialize };
}

// components/MediaPipeCanvas.tsx
export function MediaPipeCanvas({ detections, activeTab }: MediaPipeCanvasProps) {
    // Drawing logic only
}

// pages/MediaPipeTest.tsx
export const MediaPipeTest = memo(function MediaPipeTest() {
    const detection = useMediaPipeDetection(activeTab);
    const loader = useLandmarkerLoader();

    return (
        <>
            <UIControls />
            <MediaPipeCanvas detections={detection} activeTab={activeTab} />
        </>
    );
});
```

2. **Hardcoded External CDN URLs** - Lines 420-470
```typescript
const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
);

baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
    // 3 more URLs
}
```
**Evidence**: 4 external URLs hardcoded in component. No versioning strategy. No fallback.

**Root Cause**: Inline configuration; no centralized config
**Impact**: Hard to update MediaPipe version; no cache control; no fallback on CDN failure; security risk (unverified CDN)

**Fix Idea**: Centralize configuration:
```typescript
// config/mediapipe.ts
export const MEDIAPIPE_CONFIG = {
    version: '0.10.8',
    cdnBase: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision',
    modelBase: 'https://storage.googleapis.com/mediapipe-models',

    models: {
        hand: {
            path: '/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
            numHands: 2,
        },
        face: {
            path: '/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
            numFaces: 1,
        },
        pose: {
            path: '/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
            numPoses: 1,
        },
    },
} as const;

export function getModelUrl(type: 'hand' | 'face' | 'pose'): string {
    const model = MEDIAPIPE_CONFIG.models[type];
    return MEDIAPIPE_CONFIG.modelBase + model.path;
}

// Usage:
baseOptions: {
    modelAssetPath: getModelUrl('hand'),
    delegate: MEDIAPIPE_CONFIG.models.hand.delegate,
}
```

3. **Magic Numbers in Drawing Logic** - Lines 84-91, 347
```typescript
// Finger counting logic with magic indices
if (landmarks[4].x < landmarks[3].x) count++;
if (landmarks[8].y < landmarks[6].y) count++;
// 3 more...

// Blink threshold
const BLINK_THRESHOLD = 0.25;
```
**Evidence**: Hardcoded landmark indices (4, 8, 12, 16, 20). Hardcoded EAR threshold (0.25). No comments explaining what indices mean.

**Root Cause**: Domain knowledge embedded in code; no abstraction
**Impact**: Contributor must know MediaPipe landmark topology; easy to get wrong; hard to tune thresholds

**Fix Idea**: Create landmark constants:
```typescript
// constants/landmarks.ts
export const HAND_LANDMARKS = {
    THUMB_TIP: 4,
    THUMB_IP: 3,
    INDEX_TIP: 8,
    INDEX_PIP: 6,
    MIDDLE_TIP: 12,
    MIDDLE_PIP: 10,
    RING_TIP: 16,
    RING_PIP: 14,
    PINKY_TIP: 20,
    PINKY_PIP: 18,
} as const;

export const BLINK_THRESHOLDS = {
    /** Eye Aspect Ratio below this = closed eye */
    EAR_THRESHOLD: 0.25,

    /** Minimum time (ms) between blink detections */
    BLINK_COOLDOWN_MS: 200,
} as const;

// Usage:
if (landmarks[HAND_LANDMARKS.THUMB_TIP].x < landmarks[HAND_LANDMARKS.THUMB_IP].x) {
    count++;
}
```

---

### VIEWPOINT 2: New Contributor

**Findings**:

1. **No Documentation for MediaPipe Integration** - Lines 1-19
```typescript
/**
 * MediaPipe Test Page
 * Comprehensive test page showing ALL MediaPipe features with visual overlays:
 * - Hand Tracking (21 landmarks per hand)
 * - Face Detection (468 face landmarks, eye tracking, blink detection)
 * - Posture Detection (33 body landmarks)
 * - Gesture Recognition (open palm, fist, thumbs up, etc.)
 */
```
**Evidence**: Only high-level description. No explanation of:
- How landmark coordinates work (0-1 normalized, mirrored)
- Why canvas is mirrored (user-facing camera)
- How gesture recognition works
- What EAR (Eye Aspect Ratio) is
- How to extend with new features

**Root Cause**: Minimal documentation; assumes contributor knows MediaPipe
**Impact**: Contributor must learn MediaPipe from scratch; hard to add new features; high onboarding time

**Fix Idea**: Add comprehensive documentation:
```typescript
/**
 * MediaPipe Test Page
 *
 * Comprehensive test page for MediaPipe Task Vision features:
 *
 * @feature Hand Tracking - 21 landmarks per hand
 *   - Landmark coordinates: normalized 0-1 (x, y, z)
 *   - Mirrored: x=1 is left side of frame (user's right hand)
 *   - Connection indices: See HAND_CONNECTIONS constant
 *
 * @feature Face Detection - 468 landmarks per face
 *   - Mesh topology: face, eyes, lips, eyebrows
 *   - Blink detection using Eye Aspect Ratio (EAR)
 *   - EAR formula: (vertical1 + vertical2) / (2 * horizontal)
 *
 * @feature Posture Detection - 33 body landmarks
 *   - Shoulders (11, 12), Nose (0), Ears (7, 8)
 *   - Visibility threshold: 0.3 (filters weak detections)
 *
 * @feature Gesture Recognition - 8 gesture types
 *   - Uses hand landmark geometry
 *   - Confidence threshold: 0.7
 *   - Supported: Fist, Open Palm, Thumbs Up, Thumbs Down, Peace, OK, Pointing, Victory
 *
 * @architecture
 * - Component renders webcam + overlay canvas
 * - Detection loop runs at ~30 FPS via requestAnimationFrame
 * - Canvas is mirrored (user-facing camera behavior)
 * - Landmarker models loaded on-demand per tab
 *
 * @extending
 * - To add new gesture: Update GestureRecognizer class
 * - To add new landmark visualization: Add drawing callback
 * - To add new metrics: Add state + render in renderStats()
 */
```

2. **27 State Variables - Hard to Track** - Lines 22-56
```typescript
const [activeTab, setActiveTab] = useState<FeatureTab>('hands');
const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'running' | 'error'>('idle');
const [fps, setFps] = useState(0);
const [logs, setLogs] = useState<string[]>([]);
const [handsDetected, setHandsDetected] = useState(0);
const [fingerCount, setFingerCount] = useState(0);
const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);
const [gestureConfidence, setGestureConfidence] = useState(0);
// ... and 19 more
```
**Evidence**: 27 state variables in one component. No grouping. No state machine.

**Root Cause**: Flat state structure; no state modeling
**Impact**: Contributor overwhelmed; hard to find relevant state; easy to forget to update related variables

**Fix Idea**: Group state into objects:
```typescript
interface MediaPipeTestState {
    ui: {
        activeTab: FeatureTab;
        testStatus: 'idle' | 'loading' | 'running' | 'error';
        fps: number;
        logs: string[];
    };
    hands: {
        detected: number;
        fingerCount: number;
    };
    gestures: {
        current: GestureType | null;
        confidence: number;
    };
    face: {
        detected: boolean;
        leftEyeOpen: boolean;
        rightEyeOpen: boolean;
        blinkCount: number;
    };
    pose: {
        detected: boolean;
        shoulderAlignment: number;
        headTilt: number;
    };
}

const [state, setState] = useState<MediaPipeTestState>({
    ui: { activeTab: 'hands', testStatus: 'idle', fps: 0, logs: [] },
    hands: { detected: 0, fingerCount: 0 },
    gestures: { current: null, confidence: 0 },
    face: { detected: false, leftEyeOpen: true, rightEyeOpen: true, blinkCount: 0 },
    pose: { detected: false, shoulderAlignment: 0, headTilt: 0 },
});

// Update is clear:
setState(prev => ({
    ...prev,
    hands: {
        ...prev.hands,
        detected: newHandCount,
    },
}));
```

3. **Complex Drawing Logic with No Abstraction** - Lines 113-237
```typescript
// 124 lines of drawing code
const drawFaceLandmarks = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Face oval array (hardcoded 35 indices)
    const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

    // 70 lines of drawing logic
}, []);
```
**Evidence**: 124 lines for face drawing alone. Hardcoded landmark arrays. Repeated canvas context patterns. No helper functions.

**Root Cause**: Procedural drawing; no abstraction
**Impact**: Hard to modify drawing; hard to add new visualizations; duplicated code

**Fix Idea**: Create drawing abstraction:
```typescript
// utils/landmarkDrawing.ts
export class LandmarkDrawer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    /** Convert MediaPipe normalized coords to canvas coords */
    private toCanvas(point: { x: number; y: number }): { x: number; y: number } {
        return {
            x: (1 - point.x) * this.width, // Mirrored
            y: point.y * this.height,
        };
    }

    /** Draw a landmark path */
    drawPath(indices: number[], landmarks: any[], options: { color: string; lineWidth: number }) {
        const { color, lineWidth } = options;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();

        indices.forEach((idx, i) => {
            const point = this.toCanvas(landmarks[idx]);
            if (i === 0) this.ctx.moveTo(point.x, point.y);
            else this.ctx.lineTo(point.x, point.y);
        });

        this.ctx.closePath();
        this.ctx.stroke();
    }

    /** Draw landmark points */
    drawPoints(indices: number[], landmarks: any[], options: { color: string; radius: number }) {
        const { color, radius } = options;
        this.ctx.fillStyle = color;

        indices.forEach(idx => {
            const point = this.toCanvas(landmarks[idx]);
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /** Draw connections between landmarks */
    drawConnections(connections: [number, number][], landmarks: any[], options: { color: string; lineWidth: number; visibilityThreshold?: number }) {
        const { color, lineWidth, visibilityThreshold = 0.3 } = options;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;

        connections.forEach(([from, to]) => {
            const p1 = landmarks[from];
            const p2 = landmarks[to];

            if (p1 && p2 && p1.visibility > visibilityThreshold && p2.visibility > visibilityThreshold) {
                const cp1 = this.toCanvas(p1);
                const cp2 = this.toCanvas(p2);

                this.ctx.beginPath();
                this.ctx.moveTo(cp1.x, cp1.y);
                this.ctx.lineTo(cp2.x, cp2.y);
                this.ctx.stroke();
            }
        });
    }
}

// Usage:
const drawer = new LandmarkDrawer(ctx, width, height);

// Face oval
drawer.drawPath(FACE_OVAL_INDICES, landmarks, { color: '#22c55e', lineWidth: 2 });

// Eyes
[LEFT_EYE_INDICES, RIGHT_EYE_INDICES].forEach(eye => {
    drawer.drawPath(eye, landmarks, { color: '#60a5fa', lineWidth: 2 });
});
```

---

### VIEWPOINT 3: Performance Engineer

**Findings**:

1. **Run Detection Loop on Every State Change** - Lines 416, 240
```typescript
const runDetection = useCallback(() => {
    // Complex detection logic
}, [activeTab, countFingers, calculateEAR, drawFaceLandmarks, drawPoseLandmarks]);
```
**Evidence**: `runDetection` has 5 dependencies. `countFingers`, `calculateEAR`, `drawFaceLandmarks`, `drawPoseLandmarks` are ALL callback functions. If ANY changes, `runDetection` re-creates, breaking the animation frame loop.

**Root Cause**: Callback dependency on drawing functions that don't actually change
**Impact**: Animation frame loop breaks when callbacks re-create; stuttering; performance degradation

**Fix Idea**: Separate detection from drawing:
```typescript
// Hook for detection logic only
function useMediaPipeDetection(activeTab: FeatureTab, landmarkerRefs: LandmarkerRefs) {
    const [results, setResults] = useState<DetectionResults>({ hands: [], face: null, pose: null });

    const runDetection = useCallback(() => {
        // Only detection logic, no drawing
        const detectionResults = {
            hands: detectHands(webcam, landmarkerRefs.hand),
            face: detectFace(webcam, landmarkerRefs.face),
            pose: detectPose(webcam, landmarkerRefs.pose),
        };

        setResults(detectionResults);
    }, [activeTab]);

    return { results, runDetection };
}

// Separate rendering component
function MediaPipeCanvas({ results, activeTab }: { results: DetectionResults; activeTab: FeatureTab }) {
    // Drawing logic only, no callbacks
    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Draw based on results
        if (activeTab === 'face' && results.face) {
            drawFaceLandmarks(ctx, results.face.landmarks, width, height);
        }
        // ...
    }, [results, activeTab]);
}
```

2. **No Canvas Memoization - Redraws Every Frame** - Lines 240-416
```typescript
const runDetection = useCallback(() => {
    // Clears canvas every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draws video every frame
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

    // Draws landmarks every frame (even if no change)
    landmarks.forEach((point: any, i: number) => {
        ctx.beginPath();
        ctx.arc(x, y, i === 8 ? 8 : 4, 0, Math.PI * 2);
        ctx.fill();
    });
}, [activeTab, ...]);
```
**Evidence**: Canvas is cleared and redrawn every frame, even if landmarks haven't moved significantly. No dirty checking. No interpolation.

**Root Cause**: Always redraw pattern; no change detection
**Impact**: Unnecessary GPU work; battery drain on mobile; thermal throttling

**Fix Idea**: Add dirty checking and interpolation:
```typescript
interface FrameState {
    lastResults: DetectionResults | null;
    lastDrawTime: number;
    dirty: boolean;
}

const [frameState, setFrameState] = useState<FrameState>({
    lastResults: null,
    lastDrawTime: 0,
    dirty: true,
});

const runDetection = useCallback(() => {
    const results = detectEverything();

    // Check if results changed significantly
    const resultsChanged = !frameState.lastResults ||
        Math.abs(results.hands.length - frameState.lastResults.hands.length) > 0 ||
        results.face?.detected !== frameState.lastResults.face?.detected;

    if (!resultsChanged) {
        // Skip redraw, just schedule next frame
        animationFrameRef.current = requestAnimationFrame(runDetection);
        return;
    }

    // Draw only if dirty
    drawResults(results);
    setFrameState(prev => ({
        ...prev,
        lastResults: results,
        dirty: false,
    }));
}, [activeTab]);
```

3. **No FPS Throttling - Runs Unconstrained** - Lines 408-409
```typescript
const elapsed = performance.now() - startTime;
setFps(Math.round(1000 / Math.max(elapsed, 1)));
```
**Evidence**: FPS is calculated but not capped. Detection loop runs as fast as possible. On high-end devices, may run at 60+ FPS, wasting battery.

**Root Cause**: No target FPS; unconstrained animation loop
**Impact**: Battery drain on mobile; thermal throttling; inconsistent experience across devices

**Fix Idea**: Add FPS throttling:
```typescript
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastFrameTime = 0;

const runDetection = useCallback((timestamp: number) => {
    // Throttle to target FPS
    const elapsed = timestamp - lastFrameTime;
    if (elapsed < FRAME_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(runDetection);
        return;
    }

    lastFrameTime = timestamp;

    // Run detection
    detectEverything();

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(runDetection);
}, [activeTab]);
```

---

### VIEWPOINT 4: Security Reviewer

**Findings**:

1. **Unvalidated External CDN URLs** - Lines 420-470
```typescript
const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
);

baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/...',
}
```
**Evidence**: External URLs hardcoded. No validation. No integrity checks. No fallback.

**Root Cause**: Trusts CDN implicitly; no security controls
**Impact**: CDN compromise → malicious code execution; MITM attacks; supply chain attacks

**Fix Idea**: Add Subresource Integrity (SRI) and allowlist:
```typescript
// config/mediapipe.ts
export const MEDIAPIPE_CONFIG = {
    allowedDomains: [
        'https://cdn.jsdelivr.net',
        'https://storage.googleapis.com',
    ],

    // Subresource Integrity hashes (pre-computed)
    integrity: {
        wasm: 'sha384-abc123...',
        handModel: 'sha384-def456...',
        faceModel: 'sha384-ghi789...',
        poseModel: 'sha384-jkl012...',
    },
} as const;

// Validate URL
function validateMediaPipeUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return MEDIAPIPE_CONFIG.allowedDomains.some(domain =>
            url.startsWith(domain)
        );
    } catch {
        return false;
    }
}

// Usage in loader:
const modelUrl = MODEL_URLS.hand;
if (!validateMediaPipeUrl(modelUrl)) {
    throw new SecurityError('Invalid MediaPipe model URL');
}

// Add SRI attribute when loading
const script = document.createElement('script');
script.integrity = MEDIAPIPE_CONFIG.integrity.handModel;
script.src = modelUrl;
```

2. **Camera Stream No Permission Validation** - Lines 666-672
```typescript
<Webcam
    ref={webcamRef}
    audio={false}
    mirrored
    className="absolute inset-0 w-full h-full object-cover"
    videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
/>
```
**Evidence**: Webcam component uses camera but no explicit permission handling. No user consent UI. No error handling for denied permission.

**Root Cause**: Delegates to react-webcam; no custom permission handling
**Impact**: Poor UX when permission denied; unclear error messages; no retry mechanism

**Fix Idea**: Add explicit permission handling:
```typescript
const [cameraPermission, setCameraPermission] = useState<'idle' | 'granted' | 'denied'>('idle');

const requestCameraPermission = useCallback(async () => {
    try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission('granted');
        addLog('Camera permission granted');
        await startTest();
    } catch (err) {
        setCameraPermission('denied');
        addLog(`Camera permission denied: ${err}`);
        showPermissionError(err);
    }
}, []);

// UI:
{cameraPermission === 'idle' && (
    <button onClick={requestCameraPermission}>
        Enable Camera
    </button>
)}

{cameraPermission === 'denied' && (
    <div className="error">
        Camera permission denied. Please enable camera in browser settings and reload.
    </div>
)}
```

3. **No Data Sanitization in Logs** - Lines 58-61
```typescript
const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-30), `[${timestamp}] ${message}`]);
}, []);
```
**Evidence**: Logs accept any string. No sanitization. If error objects contain sensitive info, it's logged.

**Root Cause**: Direct string interpolation; no filtering
**Impact**: Potential XSS if logs are rendered unsafely; sensitive data in logs

**Fix Idea**: Add log sanitization:
```typescript
function sanitizeLogMessage(message: unknown): string {
    // Convert to string if error object
    if (message instanceof Error) {
        return message.message; // Don't log stack trace
    }

    // Sanitize HTML
    if (typeof message === 'string') {
        return message
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Fallback
    return String(message);
}

const addLog = useCallback((message: unknown) => {
    const sanitized = sanitizeLogMessage(message);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-30), `[${timestamp}] ${sanitized}`]);
}, []);
```

---

### VIEWPOINT 5: Test Engineer

**Findings**:

1. **No Test Hooks - Hard to Test Detection Logic** - Lines 240-416
```typescript
// All detection logic in runDetection callback
const runDetection = useCallback(() => {
    const video = webcamRef.current?.video;
    // 176 lines of mixed detection and drawing logic
}, [activeTab, ...]);
```
**Evidence**: No testable functions exported. No separation of detection from UI. No mock points for MediaPipe.

**Root Cause**: All logic in component; no architectural seams
**Impact**: Cannot unit test detection logic; cannot mock MediaPipe; flaky end-to-end tests only

**Fix Idea**: Extract testable logic:
```typescript
// utils/detectionLogic.ts
export function countExtendedFingers(landmarks: Landmark[]): number {
    let count = 0;
    if (landmarks[4].x < landmarks[3].x) count++;
    if (landmarks[8].y < landmarks[6].y) count++;
    if (landmarks[12].y < landmarks[10].y) count++;
    if (landmarks[16].y < landmarks[14].y) count++;
    if (landmarks[20].y < landmarks[18].y) count++;
    return count;
}

export function calculateEyeAspectRatio(eyeLandmarks: Landmark[]): number {
    const verticalDist1 = Math.sqrt(
        Math.pow(eyeLandmarks[1].x - eyeLandmarks[5].x, 2) +
        Math.pow(eyeLandmarks[1].y - eyeLandmarks[5].y, 2)
    );
    const verticalDist2 = Math.sqrt(
        Math.pow(eyeLandmarks[2].x - eyeLandmarks[4].x, 2) +
        Math.pow(eyeLandmarks[2].y - eyeLandmarks[4].y, 2)
    );
    const horizontalDist = Math.sqrt(
        Math.pow(eyeLandmarks[0].x - eyeLandmarks[3].x, 2) +
        Math.pow(eyeLandmarks[0].y - eyeLandmarks[3].y, 2)
    );
    if (horizontalDist < 1e-6) return 1;
    return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
}

export function detectBlink(leftEAR: number, rightEAR: number, threshold: number): boolean {
    return leftEAR < threshold && rightEAR < threshold;
}

// Tests:
describe('Detection Logic', () => {
    it('should count extended fingers', () => {
        const landmarks = createMockLandmarks([
            { id: 4, x: 0.1, y: 0.5 }, // Thumb extended
            { id: 3, x: 0.2, y: 0.5 },
            { id: 8, x: 0.3, y: 0.4 }, // Index extended (y < 0.5)
            { id: 6, x: 0.3, y: 0.5 },
            // ...
        ]);

        const count = countExtendedFingers(landmarks);
        expect(count).toBe(2);
    });

    it('should calculate EAR correctly', () => {
        const eyeLandmarks = createMockEyeLandmarks();
        const ear = calculateEyeAspectRatio(eyeLandmarks);
        expect(ear).toBeGreaterThan(0);
        expect(ear).toBeLessThan(1);
    });
});
```

2. **No Error Boundary for MediaPipe Failures** - Lines 264-413
```typescript
try {
    // Detection logic
} catch (err) {
    console.error('Detection error:', err);
}
```
**Evidence**: Error only logged to console. No user notification. No graceful degradation. No recovery path.

**Root Cause**: Minimal error handling; no fallback
**Impact**: Silent failures; poor UX; hard to debug; no recovery

**Fix Idea**: Add error boundary and recovery:
```typescript
// components/MediaPipeErrorBoundary.tsx
export function MediaPipeErrorBoundary({ children }: { children: React.ReactNode }) {
    const [error, setError] = useState<Error | null>(null);

    if (error) {
        return (
            <div className="error-state">
                <h2>MediaPipe Error</h2>
                <p>{error.message}</p>
                <button onClick={() => setError(null)}>Retry</button>
                <button onClick={() => window.location.reload()}>Reload Page</button>
            </div>
        );
    }

    return <ErrorBoundary onError={setError}>{children}</ErrorBoundary>;
}

// Usage:
<MediaPipeErrorBoundary>
    <MediaPipeTest />
</MediaPipeErrorBoundary>
```

3. **No E2E Test Scenarios** - No tests found
```typescript
// No test files for MediaPipeTest.tsx
```
**Evidence**: No `MediaPipeTest.test.tsx`. No Playwright tests. No manual test scenarios documented.

**Root Cause**: Test/debug page treated as "internal tool"; no testing discipline
**Impact**: MediaPipe regressions go undetected; broken features in production games

**Fix Idea**: Add E2E test scenarios:
```typescript
// tests/e2e/mediapipe-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MediaPipe Test Page', () => {
    test('should load hand model and detect hands', async ({ page }) => {
        await page.goto('/mediapipe-test');

        // Click hand tracking tab
        await page.click('button:has-text("Hand Tracking")');

        // Start test
        await page.click('button:has-text("Start Hand Tracking")');

        // Wait for model to load
        await expect(page.locator('text=Hand model loaded')).toBeVisible();

        // Verify detection is running
        await expect(page.locator('text=Hand Tracking Active')).toBeVisible();

        // Verify FPS is shown
        await expect(page.locator('text=FPS')).toBeVisible();
    });

    test('should detect gestures and show emoji', async ({ page }) => {
        await page.goto('/mediapipe-test');

        await page.click('button:has-text("Gestures")');
        await page.click('button:has-text("Start Gestures")');

        // Wait for model
        await expect(page.locator('text=Hand model loaded')).toBeVisible();

        // Gesture overlay should be hidden initially
        await expect(page.locator('.gesture-overlay')).not.toBeVisible();

        // After gesture detected, overlay should show
        await expect(page.locator('.gesture-overlay')).toBeVisible({ timeout: 10000 });
    });

    test('should show error on model load failure', async ({ page, context }) => {
        // Block MediaPipe CDN
        await context.route('**/mediapipe-models/**', route => route.abort());

        await page.goto('/mediapipe-test');
        await page.click('button:has-text("Hand Tracking")');
        await page.click('button:has-text("Start Hand Tracking")');

        // Should show error state
        await expect(page.locator('text=Error')).toBeVisible();
        await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    });
});
```

---

### VIEWPOINT 6: UX Engineer

**Findings**:

1. **No Loading Progress for Model Downloads** - Lines 692-698
```typescript
{testStatus === 'loading' && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
        <div className="text-center">
            <div className="animate-spin w-12 h-12 border-3 border-white/20 border-t-white rounded-full mx-auto mb-4" />
            <div className="text-xl font-semibold">Loading MediaPipe...</div>
        </div>
    </div>
)}
```
**Evidence**: Single "Loading MediaPipe..." text. No progress bar. No file size info. No estimated time.

**Root Cause**: Minimal loading state; no progress tracking
**Impact**: User wonders if it's stuck; no feedback; poor UX on slow networks

**Fix Idea**: Add detailed loading progress:
```typescript
interface LoadingProgress {
    stage: 'downloading' | 'compiling' | 'initializing';
    progress: number; // 0-100
    filename: string;
    fileSize: string;
}

const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);

// During loading:
{loadingProgress && (
    <div className="loading-overlay">
        <div className="progress-bar">
            <div
                className="progress-fill"
                style={{ width: `${loadingProgress.progress}%` }}
            />
        </div>
        <div className="loading-text">
            {loadingProgress.stage === 'downloading' && (
                <>
                    Downloading {loadingProgress.filename} ({loadingProgress.fileSize})...
                </>
            )}
            {loadingProgress.stage === 'compiling' && (
                <>
                    Compiling WebAssembly... {loadingProgress.progress}%
                </>
            )}
            {loadingProgress.stage === 'initializing' && (
                <>
                    Initializing {loadingProgress.filename}...
                </>
            )}
        </div>
        <div className="loading-details">
            {loadingProgress.progress}% complete
        </div>
    </div>
)}
```

2. **No Performance Metrics Beyond FPS** - Lines 408-409
```typescript
const elapsed = performance.now() - startTime;
setFps(Math.round(1000 / Math.max(elapsed, 1)));
```
**Evidence**: Only FPS shown. No CPU usage. No memory usage. No detection latency. No model size info.

**Root Cause**: Minimal metrics; no performance observability
**Impact**: Can't optimize performance; can't detect bottlenecks; limited debug info

**Fix Idea**: Add comprehensive metrics:
```typescript
interface PerformanceMetrics {
    fps: number;
    detectionLatency: number; // ms
    frameTime: number; // ms
    memoryUsage?: number; // MB
    modelSize: number; // MB
    gpuMemory?: number; // MB
}

const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    detectionLatency: 0,
    frameTime: 0,
    modelSize: 15, // Hand model is ~15MB
});

// In detection loop:
const detectionStart = performance.now();
const results = handLandmarkerRef.current.detectForVideo(video, startTime);
const detectionLatency = performance.now() - detectionStart;

const frameEnd = performance.now();
const frameTime = frameEnd - startTime;

setMetrics(prev => ({
    ...prev,
    detectionLatency: Math.round(detectionLatency),
    frameTime: Math.round(frameTime),
    fps: Math.round(1000 / Math.max(frameTime, 1)),
}));

// Display metrics:
<div className="metrics-panel">
    <div className="metric">
        <label>FPS</label>
        <value>{metrics.fps}</value>
    </div>
    <div className="metric">
        <label>Detection Latency</label>
        <value>{metrics.detectionLatency}ms</value>
    </div>
    <div className="metric">
        <label>Frame Time</label>
        <value>{metrics.frameTime}ms</value>
    </div>
    <div className="metric">
        <label>Model Size</label>
        <value>{metrics.modelSize}MB</value>
    </div>
</div>
```

3. **No Calibration or Tuning UI** - Lines 347, 389
```typescript
const BLINK_THRESHOLD = 0.25;
const alignment = Math.max(0, 1 - (shoulderDiff * 5));
```
**Evidence**: Hardcoded thresholds. No UI to adjust. No way to tune for different users/environments.

**Root Cause**: Fixed parameters; no user control
**Impact**: Can't adapt to different cameras/lighting; hard to find optimal values; limited debug capabilities

**Fix Idea**: Add tuning controls:
```typescript
interface TuningParams {
    blinkThreshold: number;
    detectionConfidence: number;
    visibilityThreshold: number;
    shoulderSensitivity: number;
}

const [tuningParams, setTuningParams] = useState<TuningParams>({
    blinkThreshold: 0.25,
    detectionConfidence: 0.3,
    visibilityThreshold: 0.3,
    shoulderSensitivity: 5,
});

// Tuning panel:
{showTuningPanel && (
    <div className="tuning-panel">
        <h3>Tuning Parameters</h3>

        <label>Blink Threshold</label>
        <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.01"
            value={tuningParams.blinkThreshold}
            onChange={(e) => setTuningParams({
                ...tuningParams,
                blinkThreshold: parseFloat(e.target.value),
            })}
        />
        <span>{tuningParams.blinkThreshold}</span>

        <label>Detection Confidence</label>
        <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={tuningParams.detectionConfidence}
            onChange={(e) => setTuningParams({
                ...tuningParams,
                detectionConfidence: parseFloat(e.target.value),
            })}
        />
        <span>{tuningParams.detectionConfidence}</span>

        <button onClick={saveTuningParams}>Save Preset</button>
        <button onClick={resetTuningParams}>Reset Default</button>
    </div>
)}
```

---

## Summary

### Critical Issues (Immediate Action Required)

1. **780-line monolith** - Extract into modules for maintainability
2. **Hardcoded external URLs** - Centralize configuration, add security controls
3. **No FPS throttling** - Add target FPS to conserve battery
4. **No error boundary** - Add graceful error handling

### High Priority Issues

5. **Complex drawing logic** - Create abstraction layer
6. **27 state variables** - Group into state objects
7. **No test hooks** - Extract testable detection logic
8. **Minimal loading UI** - Add progress tracking

### Medium Priority Issues

9. **Magic numbers** - Create landmark constants
10. **No tuning UI** - Add parameter controls
11. **No performance metrics** - Add comprehensive metrics

### Low Priority Issues

12. **No documentation** - Add MediaPipe integration guide
13. **No camera permission handling** - Add explicit consent flow
14. **Log sanitization** - Add XSS protection

---

## Recommended Actions

### Phase 1: Refactoring (2-3 days)
1. Extract detection logic into `useMediaPipeDetection` hook
2. Extract drawing logic into `LandmarkDrawer` class
3. Extract landmarker loading into `useLandmarkerLoader` hook
4. Group state into state objects
5. Create landmark constants file

### Phase 2: Performance & Security (2 days)
1. Add FPS throttling (target 30 FPS)
2. Add dirty checking for canvas redraws
3. Add SRI validation for CDN URLs
4. Add camera permission handling
5. Add error boundary

### Phase 3: Testing & Documentation (2 days)
1. Extract testable detection functions
2. Add unit tests for detection logic
3. Add E2E Playwright tests
4. Add comprehensive documentation
5. Add tuning UI

### Phase 4: UX Improvements (1-2 days)
1. Add detailed loading progress
2. Add performance metrics panel
3. Add parameter tuning controls
4. Add log sanitization

---

**Total Effort Estimate**: 7-9 days

**Risk**: Medium - Refactoring complex Canvas drawing logic may introduce bugs

**Value**: High - Maintains test/debug page for CV games, improves developer experience, enables faster iteration on MediaPipe features
