# Research: Gesture Control System for Camera-Based Learning

**Date:** 2026-01-31  
**Researcher:** AI Assistant  
**Status:** Complete - Ready for Implementation  
**Related Tickets:** TCK-20260131-001, TCK-20260131-002, TCK-20260131-003

---

## Executive Summary

Gesture-based controls can replace traditional button interactions in camera-enabled learning games, making the experience more intuitive and accessible for children. This research explores viable gestures, implementation approaches, and a calibration system similar to voice assistant setup.

---

## 1. Viable Hand Gestures for Game Controls

### 1.1 Core Control Gestures

| Gesture | Detection Logic | Confidence | Use Case |
|---------|----------------|------------|----------|
| **✋ Open Palm** | All 4 fingers extended + thumb extended | High | Start game, confirm |
| **✊ Closed Fist** | All fingers curled (tip below PIP joint) | High | Stop/pause game |
| **👍 Thumbs Up** | Thumb extended up, other fingers curled | High | Success/approve, next level |
| **👎 Thumbs Down** | Thumb extended down, other fingers curled | Medium | Retry, go back |
| **👉 Point** | Index extended, others curled | High | Select item, click |
| **🤘 Rock On** | Index + pinky extended | Medium | Special action, power-up |
| **👌 OK Sign** | Thumb + index touch, others extended | Medium | Confirm, perfect score |
| **🙌 Two Hands Up** | Both hands open above head | High | Celebration, victory |
| **👋 Wave** | Open hand moving left-right | Medium | Hello/goodbye, skip |
| **✌️ Peace Sign** | Index + middle extended | High | Pause, menu |

### 1.2 Implementation Approach

```typescript
// Gesture detection utility
interface GestureResult {
  gesture: string;
  confidence: number;
  hand: 'left' | 'right';
  duration: number; // ms held
}

class GestureRecognizer {
  private landmarks: Landmark[];
  
  detect(landmarks: Landmark[]): GestureResult | null {
    this.landmarks = landmarks;
    
    if (this.isOpenPalm()) return { gesture: 'OPEN_PALM', confidence: 0.95, ... };
    if (this.isFist()) return { gesture: 'FIST', confidence: 0.92, ... };
    if (this.isThumbsUp()) return { gesture: 'THUMBS_UP', confidence: 0.88, ... };
    // ... etc
    
    return null;
  }
  
  private isOpenPalm(): boolean {
    // Check if all fingers are extended
    return this.isFingerExtended(8) &&  // Index
           this.isFingerExtended(12) &&  // Middle
           this.isFingerExtended(16) &&  // Ring
           this.isFingerExtended(20);    // Pinky
  }
  
  private isFist(): boolean {
    // Check if all fingers are curled
    return !this.isFingerExtended(8) &&
           !this.isFingerExtended(12) &&
           !this.isFingerExtended(16) &&
           !this.isFingerExtended(20);
  }
  
  private isFingerExtended(tipIdx: number): boolean {
    const tip = this.landmarks[tipIdx];
    const pip = this.landmarks[tipIdx - 2]; // PIP joint
    const wrist = this.landmarks[0];
    
    // Tip is further from wrist than PIP (extended)
    return this.distance(tip, wrist) > this.distance(pip, wrist) + 0.02;
  }
}
```

### 1.3 Confidence Levels by Gesture

Based on MediaPipe hand tracking reliability:

| Gesture | Reliability | Notes |
|---------|-------------|-------|
| Open Palm | ⭐⭐⭐⭐⭐ | Very reliable - all fingers visible |
| Fist | ⭐⭐⭐⭐⭐ | Very reliable - compact shape |
| Point | ⭐⭐⭐⭐⭐ | Reliable - index distinct |
| Thumbs Up | ⭐⭐⭐⭐ | Good - thumb orientation clear |
| Thumbs Down | ⭐⭐⭐ | Medium - can be confused with fist |
| OK Sign | ⭐⭐⭐ | Medium - requires precise thumb/index touch |
| Wave | ⭐⭐ | Lower - requires motion tracking |
| Two Hands | ⭐⭐⭐⭐ | Good but requires both hands in frame |

---

## 2. Gesture Calibration System ("Train Your Hand")

### 2.1 Concept: Per-Game Gesture Training

Similar to "OK Google" setup, but for hand gestures. Before playing each game, the child demonstrates they can perform the required gestures.

### 2.2 Calibration Flow

```
┌─────────────────────────────────────────┐
│  Welcome to [Game Name]! 🎮            │
│                                         │
│  Let's practice the magic hand moves    │
│  before we start playing!               │
│                                         │
│         [Show me your hand 👋]          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Step 1/3: Open Hand 👋                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     [CAMERA FEED]               │   │
│  │                                 │   │
│  │   👋 <- Show open hand          │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Hold for 2 seconds... ████████░░ 80%  │
│                                         │
│  ✓ Detected! Hold a bit longer...      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Step 2/3: Closed Fist ✊               │
│                                         │
│  ✓ Open hand mastered!                  │
│                                         │
│  Now make a fist like this: ✊          │
│                                         │
│  [Camera feed with fist overlay]        │
│                                         │
│  Hold for 2 seconds...                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Step 3/3: Point Finger 👉              │
│                                         │
│  Great! Now point with your finger      │
│                                         │
│  [Camera feed with point overlay]       │
│                                         │
│  Hold for 2 seconds...                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  🎉 You're Ready!                       │
│                                         │
│  You learned 3 magic moves:             │
│  👋 Open hand = START GAME              │
│  ✊ Fist = STOP GAME                     │
│  👉 Point = SELECT                      │
│                                         │
│      [START PLAYING] ⭐                 │
│                                         │
│  Don't worry, you can practice again    │
│  anytime in Settings!                   │
└─────────────────────────────────────────┘
```

### 2.3 Calibration Component

```tsx
// GestureCalibration.tsx
interface CalibrationStep {
  gesture: string;
  icon: string;
  instruction: string;
  durationRequired: number; // ms
}

const CALIBRATION_STEPS: CalibrationStep[] = [
  {
    gesture: 'OPEN_PALM',
    icon: '👋',
    instruction: 'Show me your open hand',
    durationRequired: 2000,
  },
  {
    gesture: 'FIST',
    icon: '✊',
    instruction: 'Now make a fist',
    durationRequired: 2000,
  },
  {
    gesture: 'POINT',
    icon: '👉',
    instruction: 'Point with your finger',
    durationRequired: 2000,
  },
];

export function GestureCalibration({
  gameName,
  steps = CALIBRATION_STEPS,
  onComplete,
  onSkip,
}: CalibrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  
  const handleGestureDetected = (gesture: string) => {
    setDetectedGesture(gesture);
    
    if (gesture === steps[currentStep].gesture) {
      // Correct gesture - progress
      setProgress(prev => {
        const newProgress = prev + 100; // Update based on hold duration
        if (newProgress >= 100) {
          // Step complete
          if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
            return 0;
          } else {
            onComplete?.();
            return 100;
          }
        }
        return newProgress;
      });
    } else {
      // Wrong gesture - gentle correction
      showCorrectionHint(gesture, steps[currentStep].gesture);
    }
  };
  
  return (
    <div className="calibration-screen">
      <h1>Practice Your Magic Moves! 🎮</h1>
      <p>Let's learn the hand gestures for {gameName}</p>
      
      <ProgressIndicator 
        current={currentStep + 1} 
        total={steps.length} 
      />
      
      <CalibrationStep 
        step={steps[currentStep]}
        progress={progress}
        detectedGesture={detectedGesture}
      />
      
      <CameraFeed onGestureDetected={handleGestureDetected} />
      
      <button onClick={onSkip} className="skip-button">
        Skip for now (use buttons instead)
      </button>
    </div>
  );
}
```

### 2.4 Gamification of Calibration

Make it fun for kids:

- **Mascot guides**: Pip demonstrates each gesture
- **Visual effects**: Sparkles when gesture held correctly
- **Progress stars**: Earn stars for each mastered gesture
- **Retry encouragement**: "Almost! Try again" with hints
- **Celebration**: Confetti when calibration complete

---

## 3. Per-Game Gesture Mapping

### 3.1 AlphabetGame (Letter Tracing)

| Gesture | Action | Alternative |
|---------|--------|-------------|
| 👋 Open Palm | Start Game | Start button |
| ✊ Fist | Stop Game | Stop button |
| 👉 Point | Pinch to draw (alternative) | Mouse/touch |
| 👍 Thumbs Up | Next letter | Next button |

### 3.2 FingerNumberShow

| Gesture | Action | Alternative |
|---------|--------|-------------|
| 👋 Open Palm | Start counting | Start button |
| ✊ Fist | Stop/reset | Stop button |
| 🙌 Two Hands | "I'm ready!" (skip countdown) | - |
| 👍 Thumbs Up | Next number | Auto-advance |

### 3.3 LetterHunt

| Gesture | Action | Alternative |
|---------|--------|-------------|
| 👉 Point | Select letter | Click/tap |
| ✊ Fist | Confirm selection | Click button |
| 👋 Wave | Skip/hint | Hint button |

### 3.4 ConnectTheDots

| Gesture | Action | Alternative |
|---------|--------|-------------|
| 👉 Point | Move cursor to dot | Mouse/touch |
| 🤏 Pinch | Connect dots | Click |
| 👍 Thumbs Up | Complete picture | Auto-complete |

---

## 4. Technical Implementation

### 4.1 Gesture Control Hook

```typescript
// hooks/useGestureControls.ts
interface UseGestureControlsOptions {
  enabled: boolean;
  gestures: string[]; // Which gestures to detect
  holdDuration: number; // ms to trigger
  cooldown: number; // ms between triggers
}

export function useGestureControls(options: UseGestureControlsOptions) {
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [gestureProgress, setGestureProgress] = useState(0);
  const holdStartRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<number>(0);
  
  const processLandmarks = useCallback((landmarks: Landmark[]) => {
    if (!options.enabled) return;
    
    const now = Date.now();
    if (now - lastTriggerRef.current < options.cooldown) return;
    
    const recognizer = new GestureRecognizer();
    const result = recognizer.detect(landmarks);
    
    if (!result || !options.gestures.includes(result.gesture)) {
      holdStartRef.current = null;
      setGestureProgress(0);
      return;
    }
    
    if (holdStartRef.current === null) {
      holdStartRef.current = now;
      setDetectedGesture(result.gesture);
    }
    
    const heldDuration = now - holdStartRef.current;
    const progress = Math.min(100, (heldDuration / options.holdDuration) * 100);
    setGestureProgress(progress);
    
    if (heldDuration >= options.holdDuration) {
      lastTriggerRef.current = now;
      holdStartRef.current = null;
      setGestureProgress(0);
      return result.gesture; // Trigger action
    }
  }, [options]);
  
  return { detectedGesture, gestureProgress, processLandmarks };
}
```

### 4.2 Settings Integration

```typescript
// settingsStore.ts
interface Settings {
  // ... existing settings
  gestureControls: {
    enabled: boolean;
    holdDuration: number; // ms (default: 1500)
    requireCalibration: boolean; // Require calibration before first play
    showGestureHints: boolean; // Show hint overlays during gameplay
  };
}

const defaultSettings: Settings = {
  // ... existing defaults
  gestureControls: {
    enabled: true,
    holdDuration: 1500,
    requireCalibration: true,
    showGestureHints: true,
  },
};
```

### 4.3 Visual Feedback System

```tsx
// GestureFeedback.tsx
export function GestureFeedback({
  gesture,
  progress,
  action,
}: GestureFeedbackProps) {
  return (
    <div className="gesture-feedback">
      {/* Progress ring */}
      <div className="progress-ring">
        <svg viewBox="0 0 100 100">
          <circle
            className="progress-ring-circle"
            strokeDasharray={`${progress * 2.83} 283`}
          />
        </svg>
        <div className="gesture-icon">{getGestureEmoji(gesture)}</div>
      </div>
      
      {/* Action text */}
      <div className="action-text">
        {progress < 100 ? (
          <span>Hold {gesture}...</span>
        ) : (
          <span>{action}!</span>
        )}
      </div>
      
      {/* Countdown */}
      {progress >= 100 && (
        <div className="countdown">3... 2... 1...</div>
      )}
    </div>
  );
}
```

---

## 5. Accessibility Considerations

| Concern | Solution |
|---------|----------|
| Motor disabilities | Buttons remain primary; gestures optional |
| Gesture not recognized | Auto-fallback to buttons after 3 attempts |
| Calibration too hard | Skip option always available |
| Slow processing | Lower hold duration in settings |
| Confusion | Always show current gesture on screen |

---

## 6. Testing Strategy

### 6.1 Unit Tests
- Gesture detection accuracy with mock landmarks
- Hold duration calculations
- Cooldown behavior

### 6.2 Integration Tests
- Calibration flow completion
- Gesture-to-action mapping
- Settings persistence

### 6.3 User Testing (Children 4-10)
- Can children perform gestures?
- Do they understand the calibration?
- Is hold duration appropriate?
- Do they prefer gestures or buttons?

---

## 7. Implementation Tickets

| Ticket | Task | Effort | Priority |
|--------|------|--------|----------|
| TCK-20260131-001 | Create GestureRecognizer utility | 4 hrs | P1 |
| TCK-20260131-002 | Build GestureCalibration component | 6 hrs | P1 |
| TCK-20260131-003 | Integrate gesture controls into games | 8 hrs | P2 |

---

## 8. Research Sources

- MediaPipe Hands documentation: landmark indices and detection
- Child development research: motor skills 4-10 years
- Accessibility guidelines: WCAG 2.1 for motion-based inputs
- Comparable products: Xbox Kinect, Nintendo Switch motion controls

---

**Conclusion:** Gesture controls with calibration system will significantly improve UX for camera-based learning games. The system is technically feasible with MediaPipe, educationally appropriate for the target age group, and provides a magical experience while maintaining accessibility through button fallbacks.

**Recommendation:** Proceed with implementation starting with TCK-20260131-001 (GestureRecognizer utility).

---

*Document Version: 1.0*  
*Last Updated: 2026-01-31*  
*Status: Ready for Implementation*
