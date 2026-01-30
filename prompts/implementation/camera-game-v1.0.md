# Camera-Based Game Implementation Prompt

**Prompt Version:** 1.0
**Last Updated:** 2026-01-30
**Purpose:** Comprehensive guide for implementing camera-based educational games using MediaPipe

---

## Executive Summary

This prompt provides step-by-step guidance for implementing camera-based educational games that use MediaPipe (hands, face, pose, segmentation, object detection). All games should follow the architecture and best practices documented in `docs/MEDIAPIPE_EDUCATIONAL_FEATURES.md`.

**Applicability:**
- Single-player games (Simon Says, Freeze Dance, Yoga Animals, Reach Stars, Tap Count, Sort Buckets, etc.)
- Multi-camera support (up to 2 hands)
- Real-time perception (25-30 FPS target)
- Age-appropriate (4-10 years old)
- Privacy-first (local processing, no cloud uploads by default)

---

## NON-NEGOTIABLE RULES

1. **Evidence First:** Label all claims as Observed, Inferred, or Unknown
2. **Scope Discipline:** One feature per ticket, no drive-by fixes
3. **Preservation First:** Never delete existing code without explicit approval
4. **Performance First:** Target 25-30 FPS, optimize for mobile
5. **Accessibility First:** WCAG AA compliance, keyboard navigation, ARIA labels
6. **Safety First:** Child-safe UI, parental controls, timeout after 10 minutes
7. **Privacy First:** Process locally, opt-in for cloud features
8. **Testing Required:** Unit tests for logic, E2E for flows, manual testing

---

## PHASE 1: Discovery & Requirements

### Step 1: Read the Worklog Ticket

**Action:**
```bash
# Find your ticket (e.g., TCK-20260129-200)
grep -A 5 "TCK-20260129-200" docs/WORKLOG_TICKETS.md
```

**What to Look For:**
- Scope contract (what to build, what to avoid)
- Acceptance Criteria (must be testable)
- Dependencies (other tickets that must complete first)
- Risk/Notes section (known issues to watch out for)

### Step 2: Analyze Current Architecture

**Action:**
```bash
# Check existing MediaPipe integration
rg -n "HandLandmarker|FaceLandmarker|PoseLandmarker" src/frontend/src --type-add 'ts,tsx'

# Check existing game structure
ls -la src/frontend/src/games/ || echo "No games directory"

# Check existing component structure
ls -la src/frontend/src/components/game/ || echo "No game components"
```

**What to Look For:**
- Current MediaPipe setup (which tasks are already running)
- Existing game architecture (how games are structured)
- Reusable components that can be adapted
- Camera management system
- Performance budgeting

### Step 3: Define Game Type

**Action:**
Review your worklog ticket and identify game type:

**Game Types:**

| Type | MediaPipe Task | Complexity | Example |
|-------|----------------|------------|---------|
| Fine Motor | Hand Landmarker | Low | Air Trace, Connect Dots |
| Gross Motor | Pose Landmarker | Medium | Simon Says, Freeze Dance |
| Language | Hand + Object Detector | Medium | Point and Say, Show and Tell |
| Math | Hand Landmarker | Low | Finger Number Show |
| Colors/Shapes | Hand Landmarker | Low | Sort into Buckets |
| Social-Emotional | Face Landmarker | Medium | Expression Mirror |
| Real-World | Object Detector | Medium | Scavenger Hunt |

**Select Your Implementation Path:**
- Single MediaPipe Task: Hand, Face, Pose, or Object Detector
- Core Interaction Primitives: Use existing or create new
- Reusable Components: Build once, use multiple times

---

## PHASE 2: Architecture & Technical Setup

### Step 1: Camera Manager (Required for All Games)

**What It Does:**
- Manages camera permissions
- Starts/stops camera stream
- Provides video element to games
- Handles camera errors gracefully
- Provides camera quality signals

**Implementation:**
```typescript
// src/frontend/src/services/cameraManager.ts
export class CameraManager {
  private videoElement: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private active: boolean = false;
  private permissions: boolean = false;

  async start(): Promise<boolean> {
    if (this.active) return true;  // Already running

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',  // Front camera
          width: { ideal: 1280 },  // Reasonable resolution
          height: { ideal: 720 },
        },
        audio: false,  // No audio
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.play();
      
      this.active = true;
      this.permissions = true;
      
      return true;
    } catch (error: Error) {
      console.error('Camera start failed:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        showMessage('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        showMessage('No camera found. Please check your device.');
      } else {
        showMessage('Something went wrong with camera. Please try again.');
      }
      
      this.permissions = false;
      return false;
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.active = false;
  }

  getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  hasPermission(): boolean {
    return this.permissions;
  }

  isActive(): boolean {
    return this.active;
  }
}
```

**Evidence Requirements:**
- [ ] CameraManager.ts created
- [ ] Camera starts successfully
- [ ] Camera stops cleanly
- [ ] Permissions handled correctly
- [ ] Error messages are child-friendly
- [ ] Video element provided to games

### Step 2: MediaPipe Task Runner (Required for All Games)

**What It Does:**
- Wraps MediaPipe task initialization
- Provides frame detection loop
- Implements smoothing (EMA)
- Manages performance (frame skipping)
- Provides quality signals

**Implementation:**
```typescript
// src/frontend/src/services/mediapipeTaskRunner.ts
interface TaskRunnerConfig {
  task: HandLandmarker | FaceLandmarker | PoseLandmarker | ImageSegmenter | ObjectDetector;
  targetFPS: number;
  smoothingAlpha: number;
}

export class MediaPipeTaskRunner {
  private task: any;
  private smoothing: SmoothingFilter;
  private frameCount: number = 0;
  private lastFrameTime: number = -1;

  async initialize(config: TaskRunnerConfig): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
    );

    switch (config.task.type) {
      case 'hand':
        this.task = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: config.modelAssetPath || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
            delegate: 'GPU',
          },
          numHands: 2,
          minHandDetectionConfidence: 0.5,
        });
        break;

      case 'face':
        this.task = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: config.modelAssetPath || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          minFaceDetectionConfidence: 0.5,
        });
        break;

      case 'pose':
        this.task = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: config.modelAssetPath || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
            delegate: 'GPU',
          },
          outputSegmentationMasks: true,
          minPoseDetectionConfidence: 0.5,
        });
        break;

      // Add more task types as needed
    }

    this.smoothing = new EMASmoothingFilter(config.smoothingAlpha || 0.7);
  }

  detect(video: HTMLVideoElement, timestamp: number): any {
    // Check for duplicate frames
    if (video.currentTime === this.lastFrameTime) {
      return this.lastResults;
    }

    this.lastFrameTime = video.currentTime;

    const results = this.task.detectForVideo(video, timestamp);

    // Apply smoothing
    const smoothed = this.smoothing.smooth(results);

    this.frameCount++;
    return smoothed;
  }

  getFingerPosition(handIndex: number = 0): Point | null {
    if (!this.lastResults || !this.lastResults.landmarks) {
      return null;
    }

    const landmarks = this.lastResults.landmarks[handIndex];
    if (!landmarks) return null;

    return {
      x: landmarks[8].x,
      y: landmarks[8].y,
    };
  }

  getCurrentFPS(): number {
    // Calculate FPS based on frame count
    const now = performance.now();
    const timeSinceLastFPS = now - this.lastFPSUpdateTime;
    
    if (timeSinceLastFPS > 1000) {
      const fps = this.frameCount * 1000 / timeSinceLastFPS;
      this.frameCount = 0;
      this.lastFPSUpdateTime = now;
      
      console.log(`FPS: ${fps.toFixed(1)}`);
      
      if (fps < 15) {
        console.warn('Low FPS detected, reducing complexity');
      }
    }
    
    return this.frameCount * 1000 / timeSinceLastFPS;
  }
}
```

**Evidence Requirements:**
- [ ] MediaPipeTaskRunner created
- [ ] Supports Hand, Face, Pose tasks
- [ ] EMA smoothing implemented
- [ ] Frame skipping for performance
- [ ] FPS monitoring
- [ ] Quality signals provided

---

## PHASE 3: Game Component Structure

### Step 1: Base Game Component

**What It Does:**
- Common game infrastructure (camera loop, state machine, scoring)
- Reusable across all game types
- Handles lifecycle (start, pause, end, cleanup)
- Provides celebration hooks
- Supports undo/redo (where applicable)

**Implementation:**
```typescript
// src/frontend/src/components/game/BaseGame.tsx
export interface BaseGameState {
  score: number;
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number;
  currentLevel: number;
  attempts: number;
}

export interface GameConfig {
  targetFPS: number;
  maxDuration: number;  // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  enableCelebrations: boolean;
  enableSoundEffects: boolean;
}

export function BaseGame(props: BaseGameProps) {
  const cameraManager = useCameraManager();
  const taskRunner = useMediaPipeTaskRunner();
  const [gameState, setGameState] = useState<BaseGameState>({
    score: 0,
    isPlaying: false,
    isPaused: false,
    startTime: 0,
    currentLevel: 1,
    attempts: 0,
  });

  // Start game
  const startGame = async () => {
    const cameraStarted = await cameraManager.start();
    if (!cameraStarted) return;

    await taskRunner.initialize({
      task: props.taskConfig,
      targetFPS: props.config.targetFPS || 30,
      smoothingAlpha: 0.7,
    });

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      startTime: Date.now(),
    }));

    startGameLoop();
  };

  // Stop game
  const stopGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));

    cameraManager.stop();
    stopGameLoop();
  };

  // Pause/Resume
  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  // Game loop
  const gameLoop = (timestamp: number) => {
    if (!gameState.isPlaying || gameState.isPaused) {
      requestAnimationFrame(gameLoop);
      return;
    }

    const videoElement = cameraManager.getVideoElement();
    if (!videoElement) {
      requestAnimationFrame(gameLoop);
      return;
    }

    const results = taskRunner.detect(videoElement, timestamp);

    // Process results (specific to game type)
    processGameResults(results);

    requestAnimationFrame(gameLoop);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGame();
      cameraManager.stop();
    };
  }, []);

  return {
    startGame,
    stopGame,
    togglePause,
    gameState,
  };
}
```

### Step 2: Game Canvas Component

**What It Does:**
- Manages canvas rendering
- Handles high-DPI displays
- Provides drawing primitives
- Optimized for performance
- Supports multiple layers (game, UI overlay)

**Implementation:**
```typescript
// src/frontend/src/components/game/GameCanvas.tsx
export interface GameCanvasProps {
  width: number;
  height: number;
  onCanvasRef: (ref: HTMLCanvasElement) => void;
}

export function GameCanvas(props: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = props.width;
    canvas.height = props.height;

    // Optimize for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${props.width}px`;
    canvas.style.height = `${props.height}px`;

    ctxRef.current = ctx;

    // Notify parent component
    if (props.onCanvasRef) {
      props.onCanvasRef(canvas);
    }
  }, [props.width, props.height]);

  // Drawing primitives
  const clearCanvas = () => {
    if (!ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, props.width, props.height);
  };

  const drawCircle = (x: number, y: number, radius: number, color: string) => {
    if (!ctxRef.current) return;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  };

  const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
    if (!ctxRef.current) return;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };

  const drawText = (x: number, y: number, text: string, size: number = 24, color: string = 'white') => {
    if (!ctxRef.current) return;

    ctx.font = `${size}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };

  return {
    canvasRef,
    ctxRef,
    clearCanvas,
    drawCircle,
    drawRect,
    drawText,
  };
}
```

---

## PHASE 4: Implementation Steps

### Step 1: Create Game Component Structure

**Action:**
```bash
# Create game directory
mkdir -p src/frontend/src/games

# Create game component
touch src/frontend/src/games/YOUR_GAME_NAME.tsx
```

**Template:**
```typescript
// src/frontend/src/games/YOUR_GAME_NAME.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CameraManager } from '../services/cameraManager';
import { MediaPipeTaskRunner } from '../services/mediapipeTaskRunner';
import { GameCanvas } from '../components/game/GameCanvas';
import { useCelebrations } from '../hooks/useCelebrations';
import { playSound } from '../utils/audioManager';

export function YOUR_GAME_NAME() {
  const cameraManager = new CameraManager();
  const taskRunner = new MediaPipeTaskRunner();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Initialize MediaPipe
  useEffect(() => {
    const initializeMediaPipe = async () => {
      await taskRunner.initialize({
        task: { type: 'hand' },  // Change based on your game
        targetFPS: 30,
        smoothingAlpha: 0.7,
      });
    };

    initializeMediaPipe();
  }, []);

  // Start game
  const startGame = async () => {
    const cameraStarted = await cameraManager.start();
    if (!cameraStarted) return;

    setIsPlaying(true);
    setCurrentLevel(1);
    setScore(0);
  };

  // Game loop
  useEffect(() => {
    let animationFrameId: number;
    
    const gameLoop = (timestamp: number) => {
      if (!isPlaying || isPaused) {
        return;  // Paused or stopped
      }

      const videoElement = cameraManager.getVideoElement();
      if (!videoElement) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const results = taskRunner.detect(videoElement, timestamp);

      // Process game results
      processGameResults(results);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const cleanup = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      cameraManager.stop();
      setIsPlaying(false);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return cleanup;
  }, [isPlaying, isPaused]);

  // Process game results (specific to your game type)
  const processGameResults = (results: any) => {
    // Implement your game-specific logic here
    // This is where the magic happens!
  };

  return (
    <div className="game-container">
      <GameCanvas
        ref={canvasRef}
        width={640}
        height={480}
        onCanvasRef={(ref) => { canvasRef.current = ref; }}
      />
      <div className="game-ui">
        <div className="score">Score: {score}</div>
        <div className="level">Level: {currentLevel}</div>
        <button onClick={startGame}>Start Game</button>
        <button onClick={() => setIsPlaying(false)}>Stop Game</button>
        <button onClick={() => setIsPaused(p => !p)}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
}
```

### Step 2: Implement Game-Specific Logic

**Action:**
Implement the `processGameResults` function with your game-specific logic.

**For Hand-Based Games (Fine Motor, Gross Motor):**
```typescript
const processGameResults = (results: HandResult) => {
  if (!results.landmarks || results.landmarks.length === 0) {
    // No hand detected
    return;
  }

  const handIndex = 0;  // Or both hands
  
  // Use specific landmarks based on game
  const indexTip = results.landmarks[handIndex][8];  // Pointer finger
  const thumbTip = results.landmarks[handIndex][4];
  const wrist = results.landmarks[handIndex][0];
  
  // YOUR GAME LOGIC HERE
  const detectedAction = detectGameAction(indexTip, thumbTip, wrist);
  
  if (detectedAction) {
    setScore(prev => prev + 10);
    playSound('success');
    triggerCelebration();
  }
};
```

**For Face-Based Games (Social-Emotional):**
```typescript
const processGameResults = (results: FaceResult) => {
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    return;
  }

  const blendshapes = results.faceBlendshapes[0];
  
  // YOUR GAME LOGIC HERE
  const detectedExpression = detectExpression(blendshapes);
  
  if (detectedExpression) {
    setScore(prev => prev + 10);
    playSound('success');
    showMessage("Great job! You matched the expression!");
  }
};
```

**For Object Detection Games (Language, Math, Real-World):**
```typescript
const processGameResults = (results: DetectionResult) => {
  if (!results.detections || results.detections.length === 0) {
    return;
  }

  // YOUR GAME LOGIC HERE
  const detectedObjects = results.detections;
  
  // Process objects based on game type
  detectedObjects.forEach(obj => {
    processObject(obj);
  });
};
```

### Step 3: Add Visual Elements

**Action:**
Add child-friendly UI elements to your game component.

**Best Practices:**
- Large touch targets (minimum 60px for 4-6 year olds)
- Clear, simple icons (emoji or SVG)
- Bright, contrasting colors
- Smooth animations (Framer Motion)
- Encouraging messages (not "try again")
- Celebrations for success (confetti, mascot)

**Implementation:**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  className="game-feedback"
>
  {isSuccess && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="success-message">🎉 Great job!</span>
    </motion.div>
  )}
  
  {isWrong && (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <span className="try-again">💪 Try again!</span>
    </motion.div>
  )}
</motion.div>
```

### Step 4: Add Sound Effects

**Action:**
Integrate audio feedback using `useCelebrations` or `audioManager`.

**Best Practices:**
- Gentle, encouraging sounds (not harsh or negative)
- Short, non-repetitive loops
- Volume control (parent setting)
- Easy to implement without audio files (use Web Audio API)

**Implementation:**
```typescript
import { playSound } from '../utils/audioManager';

// Play sound on success
const handleSuccess = () => {
  playSound('success-cheer');
};

// Play sound on wrong answer
const handleWrong = () => {
  playSound('gentle-try-again');
};

// Play sound on action
const handleAction = (action: string) => {
  playSound(`${action}-pop`);
};
```

### Step 5: Integrate with Router

**Action:**
Add route for your game and integrate with App.tsx.

**Implementation:**
```typescript
// src/frontend/src/App.tsx
// Add route for your game
<Route path="/game/fingerNumberShow" element={<FingerNumberShow />} />
```

### Step 6: Update Index and Exports

**Action:**
Export your game component and add to navigation.

**Implementation:**
```typescript
// src/frontend/src/games/YOUR_GAME_NAME.tsx
export function YOUR_GAME_NAME();

// Update game index (if applicable)
// src/frontend/src/components/game/index.ts
export { YOUR_GAME_NAME } from './YOUR_GAME_NAME';
```

---

## PHASE 5: Testing & Verification

### Step 1: Unit Tests

**Action:**
```bash
# Create test file
touch src/frontend/src/games/__tests__/YOUR_GAME_NAME.test.tsx

# Run tests
npm test -- YOUR_GAME_NAME.test.tsx
```

**What to Test:**
- Game logic (state changes, scoring)
- MediaPipe integration (if applicable)
- Canvas rendering
- Event handlers
- Error handling

**Test Template:**
```typescript
// src/frontend/src/games/__tests__/YOUR_GAME_NAME.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { YOUR_GAME_NAME } from '../YOUR_GAME_NAME';

describe('YOUR_GAME_NAME', () => {
  it('starts with score 0', () => {
    const { container } = render(<YOUR_GAME_NAME />);
    expect(container.textContent).toContain('Score: 0');
  });

  it('increments score on success', () => {
    const { container } = render(<YOUR_GAME_NAME {...defaultProps} />);
    const startButton = container.querySelector('[data-testid="start-game"]');
    fireEvent.click(startButton);
    
    expect(container.textContent).toContain('Score: 10');
  });
});
```

### Step 2: Manual Testing

**Action:**
Test your game manually before committing.

**Test Checklist:**
- [ ] Camera starts successfully
- [ ] MediaPipe initializes without errors
- [ ] Game loop runs at 25+ FPS
- [ ] Game logic works correctly (success/fail states)
- [ ] Celebrations trigger on success
- [ ] Sound effects play correctly
- [ ] No console errors
- [ ] Works on mobile/tablet/desktop
- [ ] Touch targets are large enough (60px+)
- [ ] Colors are WCAG AA compliant
- [ ] Keyboard navigation works (Tab, Space, Enter)

### Step 3: Performance Testing

**Action:**
Monitor FPS and optimize if needed.

**Performance Checklist:**
- [ ] Target FPS achieved (25-30 FPS)
- [ ] No frame drops below 20 FPS
- [ ] Canvas rendering is smooth (no jank)
- [ ] Memory usage is reasonable (<200MB)
- [ ] CPU usage is reasonable (<80%)

### Step 4: Accessibility Testing

**Action:**
Test with screen reader and keyboard.

**Accessibility Checklist:**
- [ ] All interactive elements have ARIA labels
- [ ] Keyboard navigation works (Tab, Enter, Space, Escape)
- ] Focus indicators are visible
- ] Colors have WCAG AA contrast (4.5:1 ratio)
- ] Screen reader announces game state changes
- ] Touch targets are minimum 60px
- ] "Reduce motion" preference is respected

---

## PHASE 6: Documentation

### Step 1: Update WORKLOG_TICKETS.md

**Action:**
```bash
# Update your worklog ticket
# Find your ticket (e.g., TCK-20260129-200)
rg -A 20 "TCK-20260129-200" docs/WORKLOG_TICKETS.md

# Mark as DONE
# Update status from OPEN to DONE
# Add completion evidence (screenshots, outputs)
```

**What to Update:**
- Status: DONE (mark as completed)
- Completion timestamp
- Evidence of implementation (screenshots, test results)
- Next actions (if applicable)

**Evidence Template:**
```markdown
### Evidence of Completion

- **Command**: `npm test -- YOUR_GAME_NAME.test.tsx`
- **Output**: All tests passed
  - **Interpretation**: Observed — Unit tests pass

- **Command**: Manual testing checklist
- **Output**: All checks passed
  - **Interpretation**: Observed — Manual testing complete

- **Screenshots**:
  ![Game screenshot](path/to/screenshot.png)
  - **Interpretation**: Observed — Game running in browser
```

### Step 2: Update Component Documentation

**Action:**
```bash
# Update component documentation
touch src/frontend/src/components/game/README.md

# Add your game
echo "- YOUR_GAME_NAME: Game description" >> src/frontend/src/components/game/README.md
```

---

## PHASE 7: Common Patterns & Best Practices

### Hand-Based Games (Fine Motor, Gross Motor)

**Pattern 1: Finger Position Detection**
```typescript
// Get finger position
const fingerPosition = taskRunner.getFingerPosition(0);  // Index finger

// Check if finger is in specific zone
const isPointingAt = (position: Point, target: { x, y }, threshold: number = 0.05) => {
  const distance = Math.sqrt(
    Math.pow(position.x - target.x, 2) +
    Math.pow(position.y - target.y, 2)
  );
  return distance < threshold;
};
```

**Pattern 2: Pinch Detection**
```typescript
// Detect pinch gesture
const detectPinch = (results: HandResult) => {
  if (!results.landmarks) return false;
  
  const thumbTip = results.landmarks[0][4];  // Thumb tip
  const indexTip = results.landmarks[0][8];  // Index finger tip
  
  const distance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) +
    Math.pow(thumbTip.y - indexTip.y, 2)
  );
  
  // Pinch if fingers are close
  return distance < 0.05;
};
```

**Pattern 3: Hand Raise Detection**
```typescript
// Detect if hand is raised
const isHandRaised = (wrist: Point, shoulder: Point) => {
  // Wrist is above shoulder = hand is raised
  return wrist.y < shoulder.y;
};
```

**Pattern 4: Both Hands Support**
```typescript
// Support both hands
const getLeftHandPosition = () => taskRunner.getFingerPosition(0);
const getRightHandPosition = () => taskRunner.getFingerPosition(1);

const isBothHandsRaised = (leftWrist, rightWrist) => {
  return isHandRaised(leftWrist, leftShoulder) && 
         isHandRaised(rightWrist, rightShoulder);
};
```

### Face-Based Games (Social-Emotional)

**Pattern 1: Expression Matching**
```typescript
// Match expression by comparing blendshapes
const matchExpression = (detected: Blendshapes, target: FaceBlendshapes): number => {
  let score = 0;
  const weights = {
    MouthSmile: 0.4,
    EyesWide: 0.3,
    MouthPucker: 0.2,
    // ... more weights
  };
  
  for (const [key, detectedValue] of Object.entries(detected)) {
    const targetValue = target[key];
    const diff = Math.abs(detectedValue - targetValue);
    score += weights[key] * (1 - diff);
  }
  
  return score;  // 0.0 to 1.0 range
};
```

**Pattern 2: Head Orientation Detection**
```typescript
// Detect head turn (left/right)
const detectHeadOrientation = (results: FaceResult): 'left' | 'center' | 'right' => {
  const yaw = results.facialTransformationMatrixes[0].yaw;
  
  if (Math.abs(yaw) < 0.2) return 'left';
  if (Math.abs(yaw) > 0.2) return 'right';
  return 'center';
};
```

### Pose-Based Games (Gross Motor)

**Pattern 1: Body Part Position Comparison**
```typescript
// Check if body part is above/below/in zone
const isPartAbove = (part: Point, reference: Point): boolean => {
  return part.y < reference.y;
};

const isPartInZone = (part: Point, zone: { minX, maxX, minY, maxY }): boolean => {
  return part.x >= zone.minX && part.x <= zone.maxX &&
         part.y >= zone.minY && part.y <= zone.maxY;
};
```

**Pattern 2: Pose Matching**
```typescript
// Match target pose
const matchPose = (detected: PoseLandmarks, target: TargetPose): number => {
  const score = 0;
  
  // Compare key body parts
  const headMatch = 1 - Math.abs(detected.head.y - target.head.y) / 0.2;
  const shoulderMatch = 1 - Math.abs(detected.leftShoulder.y - target.leftShoulder.y) / 0.2;
  
  score += (headMatch + shoulderMatch) / 2;
  
  return score; // 0.0 to 1.0 range
};
```

### Object Detection Games

**Pattern 1: Object Presence Check**
```typescript
// Check if object is detected with confidence
const isObjectDetected = (results: DetectionResult): boolean => {
  if (!results.detections || results.detections.length === 0) {
    return false;
  }
  
  const hasHighConfidence = results.detections.some(obj => obj.confidence > 0.7);
  return hasHighConfidence;
};
```

**Pattern 2: Object Classification**
```typescript
// Classify detected object
const classifyObject = (detection: DetectionResult): string => {
  if (!detection.categories) {
    return 'unknown';
  }
  
  const category = detection.categories[0].categoryName;
  return category; // "apple", "car", etc.
};
```

---

## PHASE 8: Safety & Privacy

### Child Safety Guidelines

**Age-Appropriate Content:**
- No scary or violent content
- No flashing lights or sudden loud noises
- Positive, encouraging feedback
- Simple, clear instructions
- Large, easy-to-tap buttons (60px+)
- Bright, contrasting colors
- No time pressure (no timers or countdowns unless parent-enabled)

**Privacy Guidelines:**
- Process video frames locally (no cloud uploads by default)
- No personal data collection without parent consent
- No facial recognition for identity (expressions only)
- No voice recording (synthesized or parent-approved audio only)
- Opt-in required for any cloud features
- Clear data export/deletion options for parents

### Parental Controls

**Settings to Implement:**
```typescript
// Parent dashboard controls
interface ParentSettings {
  maxSessionDuration: number;  // 5-60 minutes
  enableCelebrations: boolean;
  enableSoundEffects: boolean;
  volume: number;  // 0-100
  enableDataCollection: boolean;  // Opt-in for analytics
  dailyTimeLimit: number;  // Minutes per day
}

function saveParentSettings(settings: ParentSettings): void {
  localStorage.setItem('parentSettings', JSON.stringify(settings));
}

function loadParentSettings(): ParentSettings {
  const stored = localStorage.getItem('parentSettings');
  return stored ? JSON.parse(stored) : {
    maxSessionDuration: 30,
    enableCelebrations: true,
    enableSoundEffects: true,
    volume: 70,
    enableDataCollection: false,
    dailyTimeLimit: 15,
  };
}
```

### Session Time Management

```typescript
// Auto-pause after time limit
const useSessionTimer = (maxDuration: number = 30) => {
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (sessionDuration >= maxDuration * 60) {
      setShowWarning(true);
    }
  }, [sessionDuration]);
  
  const pauseGame = () => {
    setIsPlaying(false);
  };
};
```

---

## COMPLETION CHECKLIST

Before marking your worklog ticket as DONE, verify:

### Code Quality
- [ ] TypeScript compilation passes
- [ ] No ESLint errors
- [ ] No unused variables
- [ ] All functions have clear names
- [ ] Components are reusable

### Functionality
- [ ] Game starts correctly
- [ ] Game loop runs smoothly
- [ ] MediaPipe integration works
- [ ] Scoring is accurate
- [ ] Celebrations trigger correctly
- [ ] Sound effects play
- [ ] Error handling is graceful

### Performance
- [ ] Target FPS achieved (25-30)
- [ ] No performance regressions
- [ ] Memory usage is reasonable
- [ ] Works on mobile/tablet/desktop

### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Colors are WCAG AA compliant
- [ ] Touch targets are 60px+
- [ ] Screen reader support

### Testing
- [ ] Unit tests pass
- [ ] Manual testing complete
- [ ] Edge cases handled
- [ ] No critical bugs

### Documentation
- [ ] WORKLOG_TICKETS.md updated (marked DONE)
- [ ] Code comments added where needed
- [ ] Evidence section completed
- [ ] Next actions documented (if applicable)

---

## QUICK REFERENCE

**MediaPipe Tasks:**
- Hand Landmarker: 21 landmarks, detect gestures, counting
- Face Landmarker: 468 landmarks, 52 blendshapes, expressions
- Pose Landmarker: 33 landmarks, body position, balance
- Image Segmenter: Background removal, body masks
- Object Detector: Real-world objects, classification

**Common Primitives:**
- `getFingerPosition(handIndex)`: Get index finger tip coordinates
- `detectPinch(results)`: Check if thumb+index pinching
- `isPointingAt(position, target, threshold)`: Check proximity
- `matchExpression(detected, target)`: Compare facial blendshapes
- `matchPose(detected, target)`: Compare body landmarks

**Best Practices:**
- Use EMA smoothing (alpha 0.5-0.7)
- Skip frames for performance (every 2nd frame)
- Monitor FPS continuously
- Handle camera errors gracefully
- Validate user input before MediaPipe processing
- Use GPU delegation when available
- Test on actual devices, not just development machine

---

**Document Status:** COMPLETE
**Version:** 1.0
**Last Updated:** 2026-01-30 00:45 UTC
