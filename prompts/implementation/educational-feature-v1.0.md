# Educational Feature Implementation Prompt

**Prompt Version:** 1.0
**Last Updated:** 2026-01-30
**Purpose:** Step-by-step guidance for implementing educational features (language, vocabulary, gestures, patterns, etc.) using MediaPipe

---

## Executive Summary

This prompt provides comprehensive guidance for implementing educational features that go beyond basic letter tracing. These features leverage MediaPipe capabilities to create engaging, multi-modal learning experiences for children aged 4-10 years.

**Core Domains Covered:**
- Language Learning (Hindi greetings, vocabulary, phonics)
- Social-Emotional Development (expression mirroring, feelings)
- Cognitive Skills (patterns, memory, logic, problem-solving)
- Cultural & Bilingual Support (English, Hindi, Kannada prompts)
- Interactive Storytelling (quests, narrative-based activities)

**Technical Feasibility:**
- ✅ HIGH - MediaPipe provides all needed capabilities
- ✅ HIGH - Can integrate with existing Game.tsx
- ✅ MEDIUM - Requires some new components (but mostly reuses existing)
- ✅ LOW - Complex features (custom ML models) deferred

---

## NON-NEGOTIABLE RULES

1. **Evidence First:** Label all claims as Observed, Inferred, or Unknown
2. **Scope Discipline:** One feature per ticket, no drive-by fixes
3. **Preservation First:** Never delete existing code without explicit approval
4. **Age-Appropriate:** All content suitable for 4-10 year olds
5. **Cultural Sensitivity:** Respect Hindi/Kannada naming, accurate translations
6. **Performance First:** Target 25-30 FPS, optimize for mobile
7. **Accessibility First:** WCAG AA compliance, keyboard navigation
8. **Privacy First:** Local processing, no cloud uploads by default
9. **Parent Involvement:** Settings for enabling features, time limits

---

## PHASE 1: Discovery & Planning

### Step 1: Read the Worklog Ticket

**Action:**
```bash
# Find your ticket (e.g., TCK-20260129-201)
grep -A 5 "TCK-20260129-201" docs/WORKLOG_TICKETS.md
```

**What to Look For:**
- Scope contract (what feature to implement)
- Acceptance Criteria (must be testable)
- Dependencies (other features that must complete first)
- Risk/Notes section (known issues)
- Target platform (web, mobile, etc.)

### Step 2: Choose Implementation Pattern

**Pattern Options:**

| Pattern | Description | MediaPipe Required | Complexity |
|---------|-------------|------------------|------------|
| **Pattern 1: Static Content** | None | LOW | Predefined prompts, translations |
| **Pattern 2: Hand Gestures** | Hand Landmarker | MEDIUM | Gesture recognition |
| **Pattern 3: Camera-Based Activities** | Hand/Face/Pose | HIGH | Real-time interaction |
| **Pattern 4: Interactive Story** | Pose + Hand Landmarker | HIGH | Quest-based learning |

**Select Your Pattern:**
- Most educational features use Pattern 2 or 3
- Static content (Pattern 1) is fastest to implement
- Camera-based activities (Pattern 3) is most engaging but requires more time

**Recommendation:** Start with Pattern 1 for quick wins, then progress to Patterns 2 and 3.

### Step 3: Assess Technical Requirements

**Checklist:**
- [ ] Does this feature need MediaPipe? (YES = Pattern 2/3, NO = Pattern 1)
- [ ] Does this feature need Object Detection? (YES = scavenger hunts, NO = greetings)
- [ ] Does this feature need Face Landmarker? (YES = expressions, NO = others)
- [ ] Does this feature need Pose Landmarker? (YES = yoga, dance, NO = greetings)
- [ ] Does this feature need Segmentation? (YES = silhouette games, NO = others)
- [ ] Are audio assets needed? (check and document)
- [ ] Are new components needed? (check existing code)

### Step 4: Define Success Criteria

**Example Success Criteria:**

**For Hindi Greetings Feature:**
- [x] 6 gestures defined (Ha, Ji, Namaste, etc.)
- [x] Hand Landmarker detects gestures with >80% accuracy
- [x] Visual feedback on correct gesture
- [x] Audio plays pronunciation
- [x] Works with both hands (when applicable)
- [x] No performance regression (25+ FPS)
- [ ] Integration with Game.tsx (new game mode or separate page)
- [ ] Multilingual support (English + Hindi)

**For Vocabulary Builder Feature:**
- [ ] 20+ objects defined (fruits, animals, etc.)
- [ ] Object Detector recognizes objects
- [ ] Child draws object on canvas (or uses brush)
- [ ] AI recognizes drawing (simple pattern matching)
- [ ] Teaches word + pronunciation
- [ ] Celebrates on correct recognition
- [ ] Shows usage examples/definitions

**For Expression Mirror Feature:**
- [ ] 6+ expressions defined (happy, sad, surprised, etc.)
- [ ] Face Landmarker detects expressions
- [ ] Blendshapes compared for matching
- [ ] Child copies expression visually
- [ ] Encouraging messages displayed
- [ ] No face identity claims

---

## PHASE 2: Architecture & Setup

### Step 1: Choose Integration Approach

**Option A: Extend Game.tsx**
- Add new game mode toggle to existing Game.tsx
- Reuse camera infrastructure
- Keep all features (letter tracing, achievements, etc.)

**Option B: Separate Game Page**
- Create dedicated page for feature
- Clean separation of concerns
- More flexible routing

**Decision:**
- Start with Option A (extend Game.tsx)
- Create separate game pages only for very complex features

### Step 2: Data Structure

**For Content-Based Features:**
```typescript
// src/frontend/src/data/hindiGestures.ts
export const hindiGestures = {
  ha: {
    name: 'Ha (हा)',
    description: 'Fist with thumb up',
    landmarks: {
      thumbUp: { wrist: -0.2, thumbTip: -0.4 }, // Thumb above knuckle
      fingersExtended: 0,  // All fingers down
    },
    pronunciation: 'Haa',
    english: 'Hello',
    meaning: 'Hello',
    hindi: 'नमस्ते है',
  },
  ji: {
    name: 'Ji (जी)',
    description: 'Open palm, fingers spread',
    landmarks: {
      fingersSpread: 0.3,  // Fingers apart
    palmOpen: { wrist: 0.1, thumbTip: 0.1 }, // Palm visible
    },
    pronunciation: 'Jee',
    english: 'Yes',
    meaning: 'Yes',
    hindi: 'हाँ/जी',
  },
  namaste: {
    name: 'Namaste (नमस्ते)',
    description: 'Palms together, fingers up, slight bow',
    landmarks: {
      palmsTogether: 0.1,  // Wrists close
      fingersUp: 0.2,  // Fingers extended
      bowed: true,
    },
    pronunciation: 'Namaste',
    english: 'Hello',
    meaning: 'Greetings',
    hindi: 'नमस्ते है',
  },
  danyavad: {
    name: 'Dhanyavad (धन्यवाद)',
    description: 'Palms together at chest level, fingers up',
    landmarks: {
      palmsAtChest: { y: 0.3 }, // Wrists at chest height
      fingersUp: 0.2, // Fingers extended
    },
    pronunciation: 'Dhanyavad',
    english: 'Respects',
    meaning: 'With respect',
    hindi: 'धन्यवादा',
  },
  yes: {
    name: 'Yes (हाँ/जी)',
    description: 'Thumbs up gesture',
    landmarks: {
      thumbsUp: 0.1, // Both thumbs above knuckles
      fingersDown: 0.2, // Fingers curled
    },
    pronunciation: 'Haa/Hee',
    english: 'Yes',
    meaning: 'Yes/Okay',
    hindi: 'हाँ/हाँ/जी',
  },
};

// src/frontend/src/data/vocabulary.ts
export const vocabulary = [
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruit', colors: ['#FF6B6B', '#F59E0B'], sounds: ['apple'], kannada: 'ಸೇಪಳು', hindi: 'सेब' },
  { id: 'ball', name: 'Ball', emoji: '⚽', category: 'toy', colors: ['#E63946', '#3B82F6'], sounds: ['ball'], kannada: 'ಚಾಂಡ್', hindi: 'गेंदा' },
  { id: 'cat', name: 'Cat', emoji: '🐱', category: 'animal', colors: ['#808080', '#FFA07A'], sounds: ['meow'], kannada: 'ಬಿ', hindi: 'बिल्ली' },
  // ... more objects
];
```

**For Camera-Based Activities:**
```typescript
// src/frontend/src/data/activityLibrary.ts
export const activities = [
  {
    id: 'simon-says-body',
    name: 'Simon Says (Body)',
    type: 'gross-motor',
    mediaPipe: 'pose',
    difficulty: 'easy',
    duration: 5,
    poses: [
      'touchHead',
      'touchLeftShoulder',
      'touchRightShoulder',
      'touchBothElbows',
      'touchLeftKnee',
      'touchRightKnee',
      'makeAT',
    ],
  },
  {
    id: 'expression-mirror',
    name: 'Expression Mirror',
    type: 'social-emotional',
    mediaPipe: 'face',
    difficulty: 'medium',
    duration: 3,
    expressions: [
      'happy',
      'sad',
      'surprised',
      'angry',
      'neutral',
    ],
  },
  // ... more activities
];
```

### Step 3: Component Structure

**Recommended Structure:**
```
src/frontend/src/features/
├── hindi/
│   ├── HindiGreetings.tsx (gesture detection + teaching)
│   └── VocabularyBuilder.tsx (object recognition)
├── social-emotional/
│   ├── ExpressionMirror.tsx (face landmark matching)
│   └── FeelingsStory.tsx (emotional awareness)
├── cognitive/
│   ├── PatternBuilder.tsx (pattern continuation)
│   └── LogicPuzzle.tsx (odd one out)
└── common/
    ├── GestureRecognizer.tsx (reusable gesture detection)
    ├── ObjectDetector.tsx (reusable object detection wrapper)
    └── ConfettiCelebration.tsx (reusable celebration)
```

---

## PHASE 3: Implementation Patterns

### Pattern 1: Hindi Greetings (Gesture Recognition)

**What It Does:**
- Teaches Hindi greetings (Ha, Ji, Namaste, etc.)
- Detects child's hand gestures using MediaPipe Hand Landmarker
- Provides instant feedback (correct/incorrect)
- Teaches pronunciation in Hindi, English, and Kannada
- Celebrates correct answers

**Technical Approach:**
```typescript
// Detect gesture
const detectHindiGesture = (landmarks: Landmark[]): Gesture => {
  const thumbTip = landmarks[4];  // Thumb tip
  const indexTip = landmarks[8];  // Index finger tip
  const wrist = landmarks[0];  // Wrist
  
  // Gesture: Ha (हा)
  const fingersExtended = countExtendedFingers(landmarks);
  const thumbUp = thumbTip.y < wrist.y - 0.2;
  if (fingersExtended === 0 && thumbUp) {
    return 'ha';
  }
  
  // Gesture: Ji (जी)
  const fingersSpread = Math.abs(landmarks[5].x - landmarks[17].x);
  const palmOpen = wrist.y < 0.15; // Palm facing camera
  if (fingersSpread > 0.3 && palmOpen) {
    return 'ji';
  }
  
  // ... more gestures
};

// Render feedback
function renderFeedback(detectedGesture: string, confidence: number) {
  if (confidence < 0.7) {
    return null;  // Not confident
  }
  
  switch (detectedGesture) {
    case 'ha':
      return <div className="feedback correct">
        <span>🙏 हां</span>
        <p className="pronunciation">Haa (Hello)</p>
        <p className="translation">Hello</p>
      </div>;
    case 'ji':
      return <div className="feedback correct">
        <span>🙏 जी</span>
        <p className="pronunciation">Jee (Yes)</p>
        <p className="translation">Yes</p>
      </div>;
    case 'namaste':
      return <div className="feedback correct">
        <span>🙏 नमस्ते</span>
        <p className="pronunciation">Namaste</p>
        <p className="translation">Greetings</p>
      </div>;
    // ... more gestures
  }
}
```

### Pattern 2: Vocabulary Builder (Object Recognition + Drawing)

**What It Does:**
- Shows object on screen (apple, ball, cat, etc.)
- Child draws or selects object using hand/brush
- AI recognizes what was drawn
- Teaches word + pronunciation
- Shows usage example

**Technical Approach:**
```typescript
// Simple object recognition (color-based)
const recognizeDrawing = (canvas: HTMLCanvasElement): string | null => {
  const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  
  // Analyze dominant colors
  const colors = countPixelColors(imageData);
  
  // Find best match
  const bestMatch = vocabulary.find(obj => 
    obj.colors.includes(colors.dominant) && 
    obj.colors.includes(colors.secondary)
  );
  
  return bestMatch?.id || null;
};

// Render drawing and ask questions
function renderVocabularyGame() {
  const targetObject = getRandomObject();
  displayObject(targetObject);
  
  // Child draws or selects
  while (gameActive) {
    const drawing = captureDrawing();
    const recognized = recognizeDrawing(drawing);
    
    if (recognized === targetObject.id) {
      celebrate();
      playPronunciation(targetObject);
      showDefinition(targetObject);
      askUsageQuestion(targetObject);
    } else if (recognized) {
      showEncouragement("Close! Try again");
    }
  }
}
```

### Pattern 3: Expression Mirror (Social-Emotional)

**What It Does:**
- Shows character face with expression (happy, sad, surprised, etc.)
- Child copies expression with their face
- Teaches emotional awareness (happy = good, sad = upset)
- No emotion detection claims (just expression matching)

**Technical Approach:**
```typescript
// Match facial blendshapes
const detectExpression = (blendshapes: Blendshapes): Expression => {
  const scores = blendshapes.categories;
  
  // Calculate match score for each expression
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const [key, targetValue] of Object.entries(scores)) {
    const detectedValue = detected[key];
    const diff = Math.abs(detectedValue - targetValue);
    const weight = getBlendshapeWeight(key);
    
    score += weight * (1 - diff);  // Higher score for closer match
    totalWeights += weight;
  }
  
  return score / totalWeights;  // 0.0 to 1.0
};

// Render character
function renderCharacterWithExpression(expression: Expression) {
  return (
    <div className="character-container">
      <img src="/assets/characters/child-face.png" alt="Character" />
      <div className={`expression-overlay ${expression}`}>
        <div className="eyes">
          <div className={`eye eye-left ${expression === 'sad' ? 'looking-down' : 'looking-neutral'}`}/>
          <div className={`eye eye-right ${expression === 'sad' ? 'looking-down' : 'looking-neutral'}`}/>
        </div>
        <div className={`mouth ${expression}`}>
          {/* Render mouth based on blendshapes */}
          {expression === 'happy' && <div className="smile happy-smile"/>}
          {expression === 'sad' && <div className="frown sad-frown"/>}
          {/* ... more expressions */}
        </div>
      </div>
    </div>
  );
}
```

### Pattern 4: Pattern Builder (Cognitive Skills)

**What It Does:**
- Shows color pattern (Red, Blue, Red, Blue)
- Child copies pattern by selecting colors in order
- Teaches pattern recognition
- Progressive difficulty (longer patterns, more colors)

**Technical Approach:**
```typescript
// Generate pattern
const generatePattern = (length: number): Color[] => {
  const colors = ['red', 'blue'];
  const pattern = [];
  
  for (let i = 0; i < length; i++) {
    pattern.push(colors[i % colors.length]);
  }
  
  return pattern;
};

// Validate pattern
const validatePattern = (userPattern: Color[], targetPattern: Color[]): boolean => {
  if (userPattern.length !== targetPattern.length) {
    return false;
  }
  
  for (let i = 0; i < userPattern.length; i++) {
    if (userPattern[i] !== targetPattern[i]) {
      return false;  // Wrong color at position
    }
  }
  
  return true;
};
```

---

## PHASE 4: Implementation

### Step 1: Create Feature Directory

**Action:**
```bash
# Create feature directory
mkdir -p src/frontend/src/features/hindi

# Create specific feature directory
mkdir -p src/frontend/src/features/hindi/greetings
```

### Step 2: Implement Core Components

**Required Components:**
- `GestureDetector.tsx` - Reusable gesture detection
- `ObjectDetector.tsx` - Reusable object detection wrapper
- `FeedbackDisplay.tsx` - Visual feedback (correct/incorrect)
- `CelebrationManager.tsx` - Confetti + mascot integration
- `AudioManager.tsx` - Sound effect playback

### Step 3: Implement Feature Component

**Example: HindiGreetings.tsx**
```typescript
import { useState, useEffect } from 'react';
import { useMediaPipeTaskRunner } from '../../services/mediapipeTaskRunner';
import { hindiGestures } from '../../data/hindiGestures';
import { FeedbackDisplay } from '../common/FeedbackDisplay';
import { CelebrationManager } from '../common/CelebrationManager';

export function HindiGreetings() {
  const taskRunner = useMediaPipeTaskRunner();
  const [gesture, setGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize MediaPipe (Hand only)
  useEffect(() => {
    const initializeMediaPipe = async () => {
      await taskRunner.initialize({
        task: { type: 'hand' },
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
  };

  // Detect gesture
  useEffect(() => {
    if (!isPlaying || !taskRunner.getCurrentFPS()) return;

    const videoElement = cameraManager.getVideoElement();
    if (!videoElement) return;

    const results = taskRunner.detect(videoElement, performance.now());
    
    if (results.landmarks && results.landmarks.length > 0) {
      const detected = detectHindiGesture(results.landmarks);
      setGesture(detected);
      setConfidence(results.landmarks[0].visibility || 0);
    }
  }, 100); // Check every 100ms

  // Render feedback based on gesture
  const renderFeedback = () => {
    if (!gesture || !confidence) return null;

    const gestureData = hindiGestures[gesture];

    if (confidence > 0.7) {
      return (
        <FeedbackDisplay
          type={confidence > 0.85 ? 'success' : 'correct'}
          message={gestureData.name}
          pronunciation={gestureData.pronunciation}
          translation={gestureData.english}
          kannadaTranslation={gestureData.kannada}
        />
      );
    }

    return (
      <FeedbackDisplay
        type="incorrect"
        message="Try again!"
        hint="Make sure your hand is clear in the camera"
      />
    );
  };

  return (
    <div className="hindi-greetings-container">
      <button onClick={startGame} disabled={isPlaying}>
        Start Game
      </button>

      {renderFeedback()}

      <div className="gesture-display">
        {gesture && (
          <div className={`gesture-icon ${gesture}`}>
            {gestureData.emoji}
          </div>
          <p className="gesture-name">{gestureData.name}</p>
        )}
      </div>

      {confidence > 0 && (
        <div className="confidence-indicator">
          <div className="confidence-bar" style={{ width: `${confidence * 100}%` }}>
            <div className={`confidence-label ${confidence > 0.7 ? 'high' : 'medium'}`}>
              {confidence > 0.7 ? 'Very confident!' : 'Getting clearer...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Integrate with Game.tsx

**Action:**
```typescript
// src/frontend/src/pages/Game.tsx
import { HindiGreetings } from '../features/hindi/greetings/HindiGreetings';

export function Game() {
  // ... existing game code ...

  const [currentMode, setCurrentMode] = useState<'trace' | 'hindi-greetings'>('trace');

  return (
    <>
      {currentMode === 'trace' && <LetterTraceGame />}
      {currentMode === 'hindi-greetings' && <HindiGreetings />}
      
      <div className="mode-toggle">
        <button onClick={() => setCurrentMode('hindi-greetings')}>
          Hindi Greetings Mode
        </button>
        <button onClick={() => setCurrentMode('trace')}>
          Letter Tracing Mode
        </button>
      </div>
    </>
  );
}
```

---

## PHASE 5: Testing & Verification

### Step 1: Unit Tests

**Test File:**
```typescript
// src/frontend/src/features/hindi/__tests__/HindiGreetings.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { HindiGreetings } from '../HindiGreetings';

describe('HindiGreetings', () => {
  it('renders greeting instructions', () => {
    const { container } = render(<HindiGreetings />);
    expect(container.textContent).toContain('Match the greeting:');
    expect(container.textContent).toContain('Use your hand to show greetings:');
    fireEvent.click(screen.getByText('Show Me Namaste'));
  });

  it('detects Ha gesture correctly', () => {
    // Mock MediaPipe results
    const mockResults = {
      landmarks: [
        { x: 0.1, y: 0.5, z: 0 },
        { x: -0.2, y: 0.4, z: 0 },
        // ... more landmarks (simulating fist with thumb up)
      ],
      visibility: 0.9,
    };

    const result = detectHindiGesture(mockResults.landmarks);
    expect(result).toBe('ha');
  });

  it('shows correct feedback', () => {
    const { container } = render(<HindiGreetings gesture="ha" />);
    expect(container.querySelector('.feedback.success')).toBeTruthy();
  });
});
```

### Step 2: Manual Testing Checklist

**Accessibility:**
- [ ] Large touch targets (60px+) for gesture display
- [ ] WCAG AA color contrast
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces state changes

**Functionality:**
- [ ] Gestures detect reliably in good lighting
- [ ] Feedback is immediate and clear
- [ ] Sounds play correctly
- [ ] Works with both hands (when applicable)
- [ ] No false negatives (wrong gesture not too harsh)

**Performance:**
- [ ] Target 30 FPS achieved
- ] No frame drops below 20 FPS
- ] Confetti doesn't impact performance
- ] Memory usage is reasonable

---

## PHASE 6: Documentation & Handoff

### Step 1: Update WORKLOG_TICKETS.md

**Action:**
```bash
# Update your ticket
rg -A 5 "TCK-20260129-201" docs/WORKLOG_TICKETS.md

# Mark as DONE
# Add completion evidence
echo "Marked as DONE at $(date -u +%Y-%m-%d)" >> docs/WORKLOG_TICKETS.md
```

**What to Update:**
- Status: DONE
- Completion timestamp
- Evidence section (screenshots, test outputs)
- Next actions (if applicable)

### Step 2: Create Documentation

**Action:**
```bash
# Create feature documentation
touch docs/MEDIAPIPE_EDUCATIONAL_FEATURES.md

# Update with feature details
echo "## Implemented: Hindi Greetings" >> docs/MEDIAPIPE_EDUCATIONAL_FEATURES.md
echo "- 6 gestures implemented"
echo "- Hand Landmarker integration"
echo "- Multilingual support (English, Hindi, Kannada)"
echo "- Audio feedback"
echo ">>" >> docs/MEDIAPIPE_EDUCATIONAL_FEATURES.md
```

---

## SUCCESS CRITERIA

Before marking your worklog ticket as DONE, verify:

### Functionality
- [ ] Core feature works as described
- [ ] All gestures/tasks implemented
- [ ] MediaPipe integration successful
- [ ] Audio feedback works
- [ ] Visual feedback is clear and immediate
- [ ] Works on target platform (web, mobile)

### Quality
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console errors during use
- [ ] Performance target met (25+ FPS)

### Testing
- [ ] Unit tests pass
- [ ] Manual testing complete
- [ ] Accessibility checklist passed
- [ ] No critical bugs

### Documentation
- [ ] WORKLOG_TICKETS.md updated
- [ ] Feature documented in MEDIAPIPE_EDUCATIONAL_FEATURES.md
- [ ] Implementation notes added
- [ ] Next actions documented (if applicable)

---

## QUICK REFERENCE

**MediaPipe Tasks:**
- Hand Landmarker: 21 landmarks, gestures
- Face Landmarker: 468 landmarks, 52 blendshapes
- Pose Landmarker: 33 landmarks, body position
- Image Segmenter: Background removal, body masks
- Object Detector: Real-world objects, classification

**Game Types:**
- Fine Motor: Tracing, dot connection
- Gross Motor: Simon Says, Yoga, Dance
- Language: Greetings, Vocabulary, Phonics
- Social-Emotional: Expressions, Feelings
- Cognitive: Patterns, Memory, Logic

**Best Practices:**
- EMA smoothing (alpha 0.5-0.7)
- Frame skipping for performance (every 2nd frame)
- GPU delegation when available
- Large touch targets (60px+)
- WCAG AA color contrast
- Age-appropriate (simple UI, clear instructions)
- Privacy-first (local processing)
- Parent controls (settings, time limits)

---

**Document Status:** COMPLETE
**Version:** 1.0
**Last Updated:** 2026-01-30 01:00 UTC
