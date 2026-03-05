# Accessibility and Inclusive Design for Children's Educational Apps (Ages 3-8)

**Document Version:** 1.0  
**Last Updated:** March 5, 2026  
**Target Audience:** Engineers, Designers, Product Managers  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [WCAG 2.2 AA Requirements for Children's Apps](#wcag-22-aa-requirements-for-childrens-apps)
3. [Age-Appropriate Accessibility Patterns](#age-appropriate-accessibility-patterns)
4. [Alternative Input Methods](#alternative-input-methods)
5. [Motor Impairments Support](#motor-impairments-support)
6. [Visual Impairments Support](#visual-impairments-support)
7. [Neurodiversity and Sensory-Friendly Design](#neurodiversity-and-sensory-friendly-design)
8. [Hearing Impairments Support](#hearing-impairments-support)
9. [Inclusive EdTech Case Studies](#inclusive-edtech-case-studies)
10. [Technical Implementation Patterns (React/TypeScript)](#technical-implementation-patterns-reacttypescript)
11. [Testing with Assistive Technologies](#testing-with-assistive-technologies)
12. [Compliance Checklist (ADA, Section 508)](#compliance-checklist-ada-section-508)
13. [Implementation Roadmap](#implementation-roadmap)
14. [Tools and Resources](#tools-and-resources)
15. [References](#references)

---

## Executive Summary

### Key Recommendations

Building accessible and inclusive educational apps for children ages 3-8 requires intentional design decisions that account for developing motor skills, emerging literacy, diverse cognitive abilities, and varying sensory needs. This document provides actionable guidance for engineering teams.

### Critical Priorities

| Priority | Area | Key Action | Effort |
|----------|------|------------|--------|
| **P0** | Touch Targets | Minimum 44x44px targets with 8px spacing | Low |
| **P0** | Keyboard Navigation | Full keyboard accessibility for all interactive elements | Medium |
| **P0** | Screen Reader Support | Proper ARIA labels, roles, and live regions | Medium |
| **P0** | Color Contrast | 4.5:1 minimum for text, 3:1 for UI components | Low |
| **P1** | Timing Flexibility | No strict time limits; adjustable timers | Medium |
| **P1** | Gesture Alternatives | Single-tap alternatives to swipe/pinch/drag | Medium |
| **P1** | Focus Management | Visible focus indicators, logical tab order | Low |
| **P1** | Sensory Settings | Toggle for animations, sounds, visual effects | Medium |
| **P2** | Voice Control | Support for voice navigation and commands | High |
| **P2** | Switch Access | Full compatibility with switch control devices | High |

### Age-Specific Considerations

| Age Group | Motor Skills | Cognitive | Design Implications |
|-----------|--------------|-----------|---------------------|
| **3-4 years** | Limited precision, whole-hand grip | Pre-reading, concrete thinking | Extra-large targets (60px+), audio instructions, minimal text |
| **5-6 years** | Improving precision, emerging fine motor | Early reading, symbolic thinking | Large targets (48px+), text + audio, simple navigation |
| **7-8 years** | Developed precision, coordinated movements | Reading fluency, logical thinking | Standard targets (44px+), text with support, complex interactions OK |

---

## WCAG 2.2 AA Requirements for Children's Apps

### Overview

WCAG 2.2 (Web Content Accessibility Guidelines) is the international standard for web accessibility. Level AA conformance is the legal requirement in many jurisdictions and the recommended target for educational apps.

### Four Principles (POUR)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WCAG 2.2 FOUR PRINCIPLES                      │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│ PERCEIVABLE │  OPERABLE   │ UNDERSTANDABLE │       ROBUST        │
│             │             │                │                     │
│ • Text      │ • Keyboard  │ • Readable     │ • Compatible        │
│   alternatives           │ • Enough time   │ • Valid markup      │
│ • Captions  │ • No        │ • Predictable  │ • ARIA semantics    │
│ • Adaptable │   seizures  │ • Input help   │                     │
│ •           │ •           │                │                     │
│   Distinguishable         │                │                     │
└─────────────┴─────────────┴────────────────┴─────────────────────┘
```

### Priority Success Criteria for Children's Apps

#### Perceivable (Priority: HIGH)

| Criterion | Level | Requirement | Child-Specific Implementation |
|-----------|-------|-------------|-------------------------------|
| **1.1.1 Non-text Content** | A | All images have alt text | Describe educational content: "Red apple with green leaf" not "image1" |
| **1.2.2 Captions** | A | Videos have captions | Sync captions with narration; use simple language |
| **1.4.1 Use of Color** | A | Color not sole indicator | Add icons + color: ✓ Correct (green) / ✗ Try again (red) |
| **1.4.3 Contrast (Minimum)** | AA | 4.5:1 text, 3:1 UI | Larger text (18pt+) can use 3:1; test with children |
| **1.4.4 Resize Text** | AA | 200% zoom without loss | Reflow content; no horizontal scroll |
| **1.4.10 Reflow** | AA | Works at 320px width | Responsive design for all tablet sizes |
| **1.4.11 Non-text Contrast** | AA | 3:1 for icons/buttons | High contrast icons visible to low vision |
| **1.4.12 Text Spacing** | AA | Support spacing adjustments | Don't break layout with increased line-height |

#### Operable (Priority: CRITICAL)

| Criterion | Level | Requirement | Child-Specific Implementation |
|-----------|-------|-------------|-------------------------------|
| **2.1.1 Keyboard** | A | All functions via keyboard | Support external keyboards for motor impairments |
| **2.1.2 No Keyboard Trap** | A | Can exit any component | Test with Tab/Shift+Tab navigation |
| **2.1.4 Character Key Shortcuts** | A | Shortcuts can be turned off | Prevent accidental activation by young children |
| **2.2.1 Timing Adjustable** | A | No strict time limits | Offer untimed mode; extendable timers |
| **2.2.2 Pause, Stop, Hide** | A | Control moving content | Pause animations; stop auto-playing audio |
| **2.3.1 Three Flashes** | A | No more than 3 flashes/second | Prevent seizures; avoid rapid transitions |
| **2.4.3 Focus Order** | A | Logical navigation order | Top-to-bottom, left-to-right flow |
| **2.4.7 Focus Visible** | AA | Visible focus indicator | Thick outline (3px+) for easy visibility |
| **2.4.11 Focus Not Obscured** | AA | Focus not hidden by content | Account for sticky headers/footers |
| **2.5.1 Pointer Gestures** | A | Single-pointer alternatives | Tap instead of swipe; buttons instead of pinch |
| **2.5.2 Pointer Cancellation** | A | Can cancel before activation | Activate on lift, not press |
| **2.5.4 Motion Actuation** | A | Alternatives to shake/tilt | Button alternative to motion gestures |
| **2.5.7 Dragging Movements** | AA | Non-drag alternatives | Tap-to-select instead of drag-and-drop |
| **2.5.8 Target Size (Minimum)** | AA | 24x24px minimum | **Recommend 44x44px for children** |

#### Understandable (Priority: HIGH)

| Criterion | Level | Requirement | Child-Specific Implementation |
|-----------|-------|-------------|-------------------------------|
| **3.1.1 Language of Page** | A | Declare page language | `<html lang="en">` for proper TTS |
| **3.2.1 On Focus** | A | No unexpected changes | Focus doesn't trigger actions |
| **3.2.2 On Input** | A | No unexpected changes | Submit doesn't navigate away |
| **3.2.3 Consistent Navigation** | AA | Same navigation everywhere | Consistent menu placement |
| **3.2.4 Consistent Identification** | AA | Same function = same look | Consistent icon/button styling |
| **3.2.6 Consistent Help** | AA | Help in consistent location | Help button always accessible |
| **3.3.1 Error Identification** | A | Describe errors in text | "Tap the blue circle" not just red highlight |
| **3.3.2 Labels or Instructions** | A | Provide instructions | Audio + text instructions |
| **3.3.3 Error Suggestion** | AA | How to fix errors | "Try counting the stars again" |
| **3.3.7 Redundant Entry** | AA | Don't re-enter info | Remember child's name across sessions |
| **3.3.8 Accessible Authentication** | AA | No cognitive tests for login | Simple PIN or biometric for parents |

#### Robust (Priority: MEDIUM)

| Criterion | Level | Requirement | Child-Specific Implementation |
|-----------|-------|-------------|-------------------------------|
| **4.1.2 Name, Role, Value** | A | Accessible semantics | `<button aria-label="Play">` |
| **4.1.3 Status Messages** | AA | Announce without focus | "Great job!" announced to screen readers |

---

## Age-Appropriate Accessibility Patterns

### Ages 3-4 Years (Pre-K)

#### Motor Development Characteristics
- Whole-hand grasp (palmar grasp)
- Limited fine motor control
- Difficulty with precise movements
- May use stylus or finger with imprecision

#### Design Patterns

```tsx
// LARGE TOUCH TARGETS (60px minimum)
const PreschoolButton = ({ children, onPress }) => (
  <button
    className="min-w-[60px] min-h-[60px] rounded-2xl bg-blue-500
               active:scale-95 transition-transform duration-150"
    onClick={onPress}
    // Activate on pointer up, not down
    onPointerUp={onPress}
    onPointerDown={(e) => e.preventDefault()}
  >
    {children}
  </button>
);

// AUDIO INSTRUCTIONS WITH VISUAL CUES
const ActivityInstruction = ({ instruction, audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div role="region" aria-label="Instructions" className="p-4">
      <button
        onClick={() => {
          setIsPlaying(true);
          playAudio(audioUrl).finally(() => setIsPlaying(false));
        }}
        aria-label="Play instructions"
        aria-pressed={isPlaying}
        className="flex items-center gap-3"
      >
        <SpeakerIcon animated={isPlaying} size={48} />
        <span className="text-xl font-bold">{instruction}</span>
      </button>
    </div>
  );
};

// SIMPLE NAVIGATION - MAX 3 CHOICES
const SimpleChoice = ({ options, onSelect }) => (
  <div role="radiogroup" aria-label="Choose an activity" className="grid grid-cols-3 gap-4">
    {options.map((option) => (
      <button
        key={option.id}
        role="radio"
        aria-checked={option.selected}
        onClick={() => onSelect(option.id)}
        className="aspect-square flex flex-col items-center justify-center
                   bg-white rounded-3xl shadow-lg border-4 border-transparent
                   focus:outline-none focus:ring-4 focus:ring-yellow-400"
      >
        <img src={option.icon} alt="" className="w-20 h-20" />
        <span className="mt-2 text-lg font-bold">{option.label}</span>
      </button>
    ))}
  </div>
);
```

#### Accessibility Checklist (Ages 3-4)
- [ ] Touch targets minimum 60x60px
- [ ] 16px spacing between interactive elements
- [ ] Audio instructions for all activities
- [ ] Visual cues accompany all audio
- [ ] Maximum 3 choices per screen
- [ ] No time limits
- [ ] Immediate positive feedback
- [ ] Error prevention over correction
- [ ] Consistent icon + text labels
- [ ] High contrast (minimum 4.5:1)

### Ages 5-6 Years (K-1st Grade)

#### Motor Development Characteristics
- Developing fine motor control
- Can use individual fingers
- Improved hand-eye coordination
- Beginning to use mouse/trackpad

#### Design Patterns

```tsx
// STANDARD TOUCH TARGETS (48px minimum)
const EarlyElementaryButton = ({ children, onPress, variant = 'primary' }) => (
  <button
    className={`min-w-[48px] min-h-[48px] rounded-xl font-semibold text-lg
               ${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-200'}
               focus:outline-none focus:ring-4 focus:ring-offset-2
               active:scale-98 transition-all`}
    onClick={onPress}
  >
    {children}
  </button>
);

// TEXT + AUDIO SUPPORT
const ReadingSupport = ({ text, showAudio = true }) => {
  return (
    <div className="relative">
      <p className="text-xl leading-relaxed">{text}</p>
      {showAudio && (
        <button
          onClick={() => speakText(text)}
          aria-label="Read this text aloud"
          className="absolute -left-8 top-1/2 -translate-y-1/2 p-2
                     hover:bg-blue-100 rounded-full"
        >
          <SpeakerIcon size={24} />
        </button>
      )}
    </div>
  );
};

// DRAG-AND-DROP WITH ALTERNATIVES
const DragDropActivity = ({ items, target, onDrop }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div>
      {/* Drag option */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, target)}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8"
      >
        Drop here
      </div>

      {/* Tap alternative */}
      <div className="mt-4">
        <p className="text-lg mb-2">Or tap to select:</p>
        <div className="flex gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                onDrop(item, target);
              }}
              className={`p-3 rounded-lg border-2
                        ${selectedItem?.id === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'}`}
            >
              <img src={item.icon} alt={item.label} className="w-12 h-12" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### Accessibility Checklist (Ages 5-6)
- [ ] Touch targets minimum 48x48px
- [ ] 12px spacing between elements
- [ ] Text with optional audio support
- [ ] Simple written instructions (1-2 sentences)
- [ ] Drag-and-drop with tap alternative
- [ ] Optional timers (can be disabled)
- [ ] Progress indicators visible
- [ ] Consistent navigation patterns
- [ ] Error messages with suggestions
- [ ] Keyboard navigation supported

### Ages 7-8 Years (2nd-3rd Grade)

#### Motor Development Characteristics
- Refined fine motor control
- Can perform precise movements
- Comfortable with mouse/keyboard
- Can use multi-touch gestures

#### Design Patterns

```tsx
// STANDARD ADULT TARGETS (44px minimum)
const ElementaryButton = ({ children, onPress, size = 'md' }) => {
  const sizes = {
    sm: 'min-w-[44px] min-h-[44px] text-base',
    md: 'min-w-[48px] min-h-[48px] text-lg',
    lg: 'min-w-[56px] min-h-[56px] text-xl',
  };

  return (
    <button
      className={`${sizes[size]} rounded-lg font-medium
                 bg-blue-600 text-white hover:bg-blue-700
                 focus:outline-none focus:ring-2 focus:ring-blue-400
                 focus:ring-offset-2 transition-colors`}
      onClick={onPress}
    >
      {children}
    </button>
  );
};

// COMPLEX INTERACTIONS WITH SUPPORT
const MultiStepActivity = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState([]);

  return (
    <div>
      {/* Progress indicator */}
      <div role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={steps.length}>
        <div className="flex gap-2 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full
                        ${i <= currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <span className="sr-only">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Current step content */}
      <div role="region" aria-label={`Step ${currentStep + 1}`}>
        {steps[currentStep].content}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-3 rounded-lg border-2 border-gray-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              onComplete();
            }
          }}
          className="px-6 py-3 rounded-lg bg-blue-500 text-white"
        >
          {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

// GESTURE WITH KEYBOARD ALTERNATIVE
const SwipeGallery = ({ images, currentIndex, onChange }) => {
  const handleSwipe = (direction) => {
    const newIndex = direction === 'left'
      ? Math.min(images.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);
    onChange(newIndex);
  };

  return (
    <div className="relative">
      {/* Touch/swipe area */}
      <div
        onTouchEnd={(e) => {
          const swipeDirection = getSwipeDirection(e);
          if (swipeDirection) handleSwipe(swipeDirection);
        }}
        className="overflow-hidden rounded-xl"
      >
        <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} />
      </div>

      {/* Button alternatives */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => handleSwipe('right')}
          disabled={currentIndex === 0}
          aria-label="Previous image"
          className="p-3 rounded-full bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeftIcon size={24} />
        </button>
        <button
          onClick={() => handleSwipe('left')}
          disabled={currentIndex === images.length - 1}
          aria-label="Next image"
          className="p-3 rounded-full bg-gray-100 disabled:opacity-50"
        >
          <ChevronRightIcon size={24} />
        </button>
      </div>
    </div>
  );
};
```

#### Accessibility Checklist (Ages 7-8)
- [ ] Touch targets minimum 44x44px
- [ ] 8px spacing between elements
- [ ] Text instructions (audio optional)
- [ ] Multi-step activities with progress
- [ ] Gesture support with alternatives
- [ ] Timed activities with extensions
- [ ] Keyboard shortcuts (remappable)
- [ ] Complex navigation supported
- [ ] Error recovery options
- [ ] Help system accessible

---

## Alternative Input Methods

### Overview

Children with motor, visual, or cognitive disabilities may use alternative input methods instead of touch or mouse. Your app must support these methods to be truly inclusive.

### Supported Input Methods

| Method | Description | Use Cases | Implementation Requirements |
|--------|-------------|-----------|----------------------------|
| **Switch Control** | One or more switches activated by any body part | Motor impairments, limited mobility | Sequential scanning, dwell selection |
| **Eye Tracking** | Camera tracks eye movement to control cursor | Severe motor impairments, ALS, cerebral palsy | Dwell clicking, gaze-based selection |
| **Head Tracking** | Camera tracks head movement for cursor control | Limited hand mobility, spinal injuries | Smooth cursor movement, click alternatives |
| **Voice Control** | Voice commands for navigation and actions | Motor impairments, hands-free use | Consistent labels, command feedback |
| **Keyboard** | Physical or on-screen keyboard | Motor impairments, preference | Full keyboard navigation |
| **Assistive Touch** | Customizable touch gestures via software | Limited dexterity, tremors | Standard touch events |

### Switch Control Implementation

```tsx
// Switch-compatible button component
const SwitchAccessibleButton = ({
  children,
  onPress,
  scanOrder = 1,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      tabIndex={0}
      data-scan-order={scanOrder}
      onFocus={() => {
        setIsFocused(true);
        // Announce to screen reader
        announceToScreenReader(children);
      }}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress();
        }
      }}
      className={`p-4 rounded-xl transition-all duration-200
                ${isFocused
                  ? 'ring-4 ring-yellow-400 scale-105 bg-yellow-50'
                  : 'bg-white hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );
};

// Sequential scanning container
const SwitchScanningGroup = ({ children, autoScan = true }) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const items = React.Children.toArray(children);

  useEffect(() => {
    if (!autoScan) return;

    const interval = setInterval(() => {
      setFocusIndex((prev) => (prev + 1) % items.length);
    }, 2000); // 2 second scan interval

    return () => clearInterval(interval);
  }, [autoScan, items.length]);

  return (
    <div role="group" aria-label="Switch scanning group">
      {items.map((item, index) =>
        React.cloneElement(item, {
          tabIndex: index === focusIndex ? 0 : -1,
          'data-scan-index': index,
        })
      )}
    </div>
  );
};
```

### Voice Control Support

```tsx
// Voice-control compatible component
const VoiceAccessibleComponent = ({
  children,
  voiceLabel,
  onVoiceCommand,
}) => {
  return (
    <button
      aria-label={voiceLabel}
      // Visible label must match accessible name
      data-voice-command={voiceLabel.toLowerCase()}
      onClick={onVoiceCommand}
    >
      {voiceLabel}
    </button>
  );
};

// Voice command registry
const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const commands = useRef(new Map());

  const registerCommand = (label, callback) => {
    commands.current.set(label.toLowerCase(), callback);
  };

  const handleVoiceInput = (transcript) => {
    const command = commands.current.get(transcript.toLowerCase());
    if (command) {
      command();
      announceToScreenReader(`Executed: ${transcript}`);
    }
  };

  return { registerCommand, handleVoiceInput, isListening };
};
```

### Eye Tracking Considerations

```tsx
// Dwell-click compatible button
const DwellClickableButton = ({
  children,
  onPress,
  dwellTime = 1500, // 1.5 second dwell
}) => {
  const [dwellProgress, setDwellProgress] = useState(0);
  const dwellTimer = useRef(null);
  const animationFrame = useRef(null);

  const startDwell = () => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / dwellTime, 1);
      setDwellProgress(progress);

      if (progress >= 1) {
        onPress();
        setDwellProgress(0);
      } else {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
  };

  const stopDwell = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setDwellProgress(0);
  };

  return (
    <button
      onMouseEnter={startDwell}
      onMouseLeave={stopDwell}
      onFocus={startDwell}
      onBlur={stopDwell}
      className="relative overflow-hidden"
    >
      {/* Dwell progress indicator */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all"
        style={{ width: `${dwellProgress * 100}%` }}
      />
      {children}
    </button>
  );
};
```

### Input Method Detection

```tsx
// Detect and adapt to input method
const useInputMethod = () => {
  const [inputMethod, setInputMethod] = useState<'touch' | 'mouse' | 'keyboard' | 'switch'>('touch');

  useEffect(() => {
    // Detect touch capability
    if ('ontouchstart' in window) {
      setInputMethod('touch');
    }

    // Listen for keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setInputMethod('keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return inputMethod;
};

// Adapt UI based on input method
const AdaptiveContainer = ({ children }) => {
  const inputMethod = useInputMethod();

  return (
    <div
      data-input-method={inputMethod}
      className={cn({
        'touch-mode': inputMethod === 'touch',
        'keyboard-mode': inputMethod === 'keyboard',
      })}
    >
      {children}
    </div>
  );
};
```

---

## Motor Impairments Support

### Common Motor Challenges in Children

| Condition | Characteristics | Design Adaptations |
|-----------|-----------------|-------------------|
| **Cerebral Palsy** | Spasticity, tremors, limited range | Large targets, dwell selection, switch access |
| **Developmental Coordination Disorder** | Clumsiness, poor hand-eye coordination | Forgiving hit areas, no precision required |
| **Muscular Dystrophy** | Progressive weakness, fatigue | Voice control, minimal force required |
| **Arthritis/JIA** | Pain, limited grip strength | Large targets, no sustained pressure |
| **Temporary Injuries** | Cast, bandages, one-handed use | One-handed operation, voice control |

### Touch Target Guidelines

```tsx
// Minimum touch target sizes by age/ability
const TOUCH_TARGETS = {
  // Ages 3-4 or significant motor impairment
  preschool: {
    minSize: 60, // pixels
    spacing: 16, // pixels between targets
  },
  // Ages 5-6 or mild motor impairment
  earlyElementary: {
    minSize: 48,
    spacing: 12,
  },
  // Ages 7-8 or typical development
  elementary: {
    minSize: 44, // WCAG 2.2 AA minimum
    spacing: 8,
  },
};

// Enhanced touch target component
const AccessibleTouchTarget = ({
  children,
  onPress,
  size = 'elementary',
  hitSlop = 0,
}) => {
  const config = TOUCH_TARGETS[size];

  return (
    <button
      onClick={onPress}
      style={{
        minWidth: config.minSize,
        minHeight: config.minSize,
        margin: config.spacing / 2,
      }}
      // Extend hit area beyond visual bounds
      data-hit-slop={hitSlop}
      className="touch-none active:scale-95 transition-transform"
    >
      {children}
    </button>
  );
};
```

### Gesture Alternatives

```tsx
// Drag-and-drop with alternatives
const AccessibleDragDrop = ({
  items,
  dropZones,
  onDrop,
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Drag mode
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDrop = (zone) => {
    if (draggedItem) {
      onDrop(draggedItem, zone);
      setDraggedItem(null);
    }
  };

  // Tap mode alternative
  const handleSelectItem = (item) => {
    if (selectedItem === item) {
      // Deselect
      setSelectedItem(null);
    } else if (selectedItem) {
      // Complete action with previously selected item
      onDrop(selectedItem, item.targetZone);
      setSelectedItem(null);
    } else {
      // Select item
      setSelectedItem(item);
    }
  };

  return (
    <div>
      {/* Instructions */}
      <div role="status" className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p>Drag items to their matching zone, or tap to select then tap destination</p>
      </div>

      {/* Draggable items */}
      <div className="flex flex-wrap gap-4 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item)}
            onClick={() => handleSelectItem(item)}
            role="button"
            tabIndex={0}
            aria-grabbed={draggedItem?.id === item.id}
            aria-selected={selectedItem?.id === item.id}
            className={`p-4 rounded-xl cursor-grab active:cursor-grabbing
                      border-2 transition-all
                      ${draggedItem?.id === item.id ? 'border-blue-500 scale-105' : ''}
                      ${selectedItem?.id === item.id ? 'border-green-500 bg-green-50' : ''}
                      ${!draggedItem && !selectedItem ? 'border-gray-200 hover:border-gray-300' : ''}`}
          >
            {item.content}
          </div>
        ))}
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-3 gap-4">
        {dropZones.map((zone) => (
          <div
            key={zone.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(zone)}
            onClick={() => selectedItem && handleDrop(zone)}
            role="button"
            tabIndex={0}
            aria-label={`Drop zone: ${zone.label}`}
            className="aspect-square border-2 border-dashed border-gray-300
                      rounded-xl flex items-center justify-center
                      hover:border-gray-400 focus:border-blue-500
                      focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {zone.label}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Reducing Precision Requirements

```tsx
// Forgiving hit detection
const useForgivingHitDetection = ({
  targetRef,
  tolerance = 20, // pixels of tolerance
}) => {
  const checkHit = (clientX, clientY) => {
    if (!targetRef.current) return false;

    const rect = targetRef.current.getBoundingClientRect();

    // Expand hit area by tolerance
    const expandedRect = {
      left: rect.left - tolerance,
      right: rect.right + tolerance,
      top: rect.top - tolerance,
      bottom: rect.bottom + tolerance,
    };

    return (
      clientX >= expandedRect.left &&
      clientX <= expandedRect.right &&
      clientY >= expandedRect.top &&
      clientY <= expandedRect.bottom
    );
  };

  return { checkHit };
};

// Stabilization for tremors
const useTremorStabilization = ({
  threshold = 50, // ms to stabilize
  onStable,
}) => {
  const [isStable, setIsStable] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const timerRef = useRef(null);

  const handleMovement = (x, y) => {
    const dx = x - positionRef.current.x;
    const dy = y - positionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Reset timer if movement exceeds threshold
    if (distance > 5) {
      setIsStable(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      // Start stability timer
      timerRef.current = setTimeout(() => {
        setIsStable(true);
        onStable?.();
      }, threshold);
    }

    positionRef.current = { x, y };
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isStable, handleMovement };
};
```

---

## Visual Impairments Support

### Types of Visual Impairments

| Condition | Characteristics | Design Adaptations |
|-----------|-----------------|-------------------|
| **Low Vision** | Reduced acuity, may use magnification | Large text, high contrast, scalable UI |
| **Color Blindness** | Difficulty distinguishing colors | Don't rely on color alone; use patterns |
| **Cortical Visual Impairment (CVI)** | Brain-based vision processing | Simple backgrounds, high contrast, movement |
| **Blindness** | No functional vision | Full screen reader support, audio descriptions |

### High Contrast Design

```tsx
// Color palette with contrast ratios
const ACCESSIBLE_COLORS = {
  // Primary colors (all meet 4.5:1 on white)
  primary: {
    blue: { base: '#0052CC', contrast: 7.2 },
    green: { base: '#006644', contrast: 5.8 },
    purple: { base: '#5E35B1', contrast: 6.1 },
  },
  // Feedback colors
  feedback: {
    success: { base: '#006644', icon: '✓', contrast: 5.8 },
    error: { base: '#C62828', icon: '✗', contrast: 5.9 },
    warning: { base: '#F57C00', icon: '⚠', contrast: 4.6 },
  },
  // Text colors
  text: {
    primary: { base: '#1A1A1A', contrast: 16.1 },
    secondary: { base: '#5C5C5C', contrast: 7.0 },
  },
};

// High contrast mode toggle
const useHighContrastMode = () => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handler = (e) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const colors = highContrast
    ? {
        background: '#000000',
        text: '#FFFFFF',
        primary: '#FFFF00', // Yellow on black
        secondary: '#00FFFF', // Cyan on black
      }
    : {
        background: '#FFFFFF',
        text: '#1A1A1A',
        primary: '#0052CC',
        secondary: '#5C5C5C',
      };

  return { highContrast, colors, setHighContrast };
};

// High contrast component wrapper
const HighContrastContainer = ({ children }) => {
  const { colors } = useHighContrastMode();

  return (
    <div
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
      className="min-h-screen"
    >
      {children}
    </div>
  );
};
```

### Color Blindness Support

```tsx
// Color-blind safe patterns
const PATTERNS = {
  success: 'url(#pattern-check)',
  error: 'url(#pattern-x)',
  warning: 'url(#pattern-exclamation)',
  info: 'url(#pattern-i)',
};

const ColorBlindSafeChart = ({ data }) => {
  return (
    <svg role="img" aria-label="Progress chart">
      {/* Define patterns */}
      <defs>
        <pattern id="pattern-check" patternUnits="userSpaceOnUse" width="10" height="10">
          <path d="M0 10 L10 0 M5 10 L10 5" stroke="white" strokeWidth="2" />
        </pattern>
        <pattern id="pattern-x" patternUnits="userSpaceOnUse" width="10" height="10">
          <path d="M0 0 L10 10 M10 0 L0 10" stroke="white" strokeWidth="2" />
        </pattern>
      </defs>

      {data.map((item, i) => (
        <rect
          key={item.id}
          x={item.x}
          y={item.y}
          width={item.width}
          height={item.height}
          fill={item.color}
          // Add pattern overlay for color-blind users
          fillOpacity={item.pattern ? 0.7 : 1}
        />
      ))}

      {/* Legend with patterns */}
      <g aria-label="Legend">
        {data.map((item, i) => (
          <g key={`legend-${item.id}`} transform={`translate(${item.legendX}, ${item.legendY})`}>
            <rect
              width="20"
              height="20"
              fill={item.color}
              stroke="#000"
              strokeWidth="1"
            />
            <text x="25" y="15">{item.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// Don't rely on color alone
const FeedbackMessage = ({ type, message }) => {
  const config = {
    success: { icon: '✓', label: 'Correct', color: 'text-green-700' },
    error: { icon: '✗', label: 'Try Again', color: 'text-red-700' },
    warning: { icon: '⚠', label: 'Warning', color: 'text-orange-700' },
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 p-3 rounded-lg ${config.color}`}
    >
      <span aria-hidden="true" className="text-xl">{config.icon}</span>
      <span className="font-semibold">{config.label}:</span>
      <span>{message}</span>
    </div>
  );
};
```

### Screen Reader Support

```tsx
// Screen reader announcements
const useScreenReaderAnnouncements = () => {
  const announce = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const announceError = (message) => {
    announce(message, 'assertive');
  };

  return { announce, announceError };
};

// Accessible image component
const AccessibleImage = ({
  src,
  alt,
  decorative = false,
  longDescription,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      <img
        src={src}
        alt={decorative ? '' : alt}
        role={decorative ? 'presentation' : 'img'}
        aria-describedby={longDescription ? 'image-desc' : undefined}
        onLoad={() => setIsLoaded(true)}
        className={isLoaded ? 'opacity-100' : 'opacity-0'}
      />

      {/* Loading state for screen readers */}
      {!isLoaded && (
        <div role="status" aria-live="polite" className="sr-only">
          Loading image: {alt}
        </div>
      )}

      {/* Long description */}
      {longDescription && (
        <div id="image-desc" className="sr-only">
          {longDescription}
        </div>
      )}
    </div>
  );
};

// Accessible progress indicator
const AccessibleProgress = ({ value, max, label }) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-4 bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="sr-only">
        {percentage}% complete
      </span>
    </div>
  );
};
```

### Text Scaling Support

```tsx
// Responsive text sizing
const useResponsiveText = () => {
  const [baseSize, setBaseSize] = useState(16);

  useEffect(() => {
    // Check user's preferred text size
    const html = document.documentElement;
    const computedStyle = getComputedStyle(html);
    const fontSize = parseFloat(computedStyle.fontSize);

    if (fontSize !== 16) {
      setBaseSize(fontSize);
    }
  }, []);

  const sizes = {
    xs: `${baseSize * 0.75}px`,   // 12px base
    sm: `${baseSize * 0.875}px`,  // 14px base
    base: `${baseSize}px`,         // 16px base
    lg: `${baseSize * 1.125}px`,  // 18px base
    xl: `${baseSize * 1.25}px`,   // 20px base
    '2xl': `${baseSize * 1.5}px`, // 24px base
    '3xl': `${baseSize * 1.875}px`, // 30px base
    '4xl': `${baseSize * 2.25}px`, // 36px base
  };

  return sizes;
};

// Text that scales properly
const ScalableText = ({
  children,
  size = 'base',
  className,
}) => {
  const sizes = useResponsiveText();

  return (
    <p
      style={{ fontSize: sizes[size] }}
      className={`leading-relaxed ${className}`}
    >
      {children}
    </p>
  );
};
```

---

## Neurodiversity and Sensory-Friendly Design

### Neurodivergent Conditions

| Condition | Characteristics | Design Adaptations |
|-----------|-----------------|-------------------|
| **Autism Spectrum (ASD)** | Sensory sensitivities, preference for routine | Sensory-friendly mode, predictable interactions |
| **ADHD** | Attention challenges, impulsivity | Minimal distractions, clear focus indicators |
| **Dyslexia** | Reading difficulties | Dyslexia-friendly fonts, text-to-speech |
| **Sensory Processing Disorder** | Over/under-sensitivity to stimuli | Customizable sensory settings |
| **Anxiety** | Stress from uncertainty | Clear expectations, no surprises |

### Sensory-Friendly Mode

```tsx
// Sensory settings context
const SensorySettingsContext = createContext({
  reducedMotion: false,
  reducedSounds: false,
  highContrast: false,
  simplifiedLayout: false,
  noAutoplay: true,
});

const useSensorySettings = () => useContext(SensorySettingsContext);

// Sensory settings panel
const SensorySettingsPanel = () => {
  const [settings, setSettings] = useState({
    reducedMotion: false,
    reducedSounds: false,
    highContrast: false,
    simplifiedLayout: false,
    noAutoplay: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Save to localStorage
    localStorage.setItem('sensory-settings', JSON.stringify(settings));
  };

  return (
    <div role="dialog" aria-label="Sensory settings" className="p-6">
      <h2 className="text-2xl font-bold mb-6">Sensory Settings</h2>

      <div className="space-y-4">
        {/* Reduced Motion */}
        <label className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Reduce Motion</span>
            <p className="text-sm text-gray-600">
              Minimize animations and transitions
            </p>
          </div>
          <Switch
            checked={settings.reducedMotion}
            onChange={(v) => updateSetting('reducedMotion', v)}
            aria-describedby="motion-desc"
          />
        </label>

        {/* Reduced Sounds */}
        <label className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Reduce Sounds</span>
            <p className="text-sm text-gray-600">
              Lower volume of sound effects
            </p>
          </div>
          <Switch
            checked={settings.reducedSounds}
            onChange={(v) => updateSetting('reducedSounds', v)}
          />
        </label>

        {/* High Contrast */}
        <label className="flex items-center justify-between">
          <div>
            <span className="font-semibold">High Contrast</span>
            <p className="text-sm text-gray-600">
              Increase color contrast
            </p>
          </div>
          <Switch
            checked={settings.highContrast}
            onChange={(v) => updateSetting('highContrast', v)}
          />
        </label>

        {/* Simplified Layout */}
        <label className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Simplified Layout</span>
            <p className="text-sm text-gray-600">
              Remove decorative elements
            </p>
          </div>
          <Switch
            checked={settings.simplifiedLayout}
            onChange={(v) => updateSetting('simplifiedLayout', v)}
          />
        </label>
      </div>
    </div>
  );
};

// Motion-safe animations
const MotionSafeAnimation = ({ children, className }) => {
  const { reducedMotion } = useSensorySettings();

  return (
    <div
      className={cn(
        reducedMotion ? '' : 'animate-fade-in',
        className
      )}
      style={{
        animation: reducedMotion ? 'none' : undefined,
        transition: reducedMotion ? 'none' : undefined,
      }}
    >
      {children}
    </div>
  );
};

// Sound control
const AccessibleSound = ({ src, volume = 1, autoPlay = false }) => {
  const { reducedSounds, noAutoplay } = useSensorySettings();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = reducedSounds ? volume * 0.3 : volume;
    }
  }, [reducedSounds, volume]);

  useEffect(() => {
    if (autoPlay && !noAutoplay && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Auto-play blocked - show play button instead
      });
    }
  }, [autoPlay, noAutoplay]);

  return (
    <audio
      ref={audioRef}
      src={src}
      // Always provide controls for user control
      controls={!noAutoplay}
    />
  );
};
```

### Dyslexia-Friendly Design

```tsx
// Dyslexia-friendly font stack
const DYSLEXIA_FONTS = {
  openDyslexic: '"OpenDyslexic", "Comic Sans MS", sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
};

const DyslexiaFriendlyText = ({
  children,
  enableDyslexiaFont = false,
}) => {
  const { dyslexiaFont } = useAccessibilitySettings();

  return (
    <p
      style={{
        fontFamily: enableDyslexiaFont
          ? DYSLEXIA_FONTS.openDyslexic
          : DYSLEXIA_FONTS.arial,
        fontSize: '18px',
        lineHeight: 1.8,
        letterSpacing: '0.05em',
        wordSpacing: '0.1em',
        maxWidth: '65ch', // Optimal line length
        textAlign: 'left', // Don't justify
      }}
    >
      {children}
    </p>
  );
};

// Text-to-speech for reading support
const ReadAloudButton = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for comprehension
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      aria-label={isSpeaking ? 'Stop reading aloud' : 'Read text aloud'}
      aria-pressed={isSpeaking}
      className="flex items-center gap-2 px-3 py-2 rounded-lg
                 bg-blue-100 hover:bg-blue-200 transition-colors"
    >
      {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
      <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
    </button>
  );
};
```

### ADHD-Friendly Design

```tsx
// Focus mode component
const FocusModeContainer = ({ children, activeElement }) => {
  const { simplifiedLayout } = useSensorySettings();

  return (
    <div
      className={cn(
        'transition-all duration-300',
        simplifiedLayout && 'max-w-2xl mx-auto'
      )}
    >
      {/* Dim inactive elements */}
      <div
        className={cn(
          'transition-opacity',
          simplifiedLayout && 'opacity-50'
        )}
        aria-hidden={simplifiedLayout}
      >
        {children}
      </div>

      {/* Highlight active element */}
      {activeElement && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute ring-4 ring-blue-400 rounded-lg"
            style={{
              top: activeElement.top,
              left: activeElement.left,
              width: activeElement.width,
              height: activeElement.height,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Clear task breakdown
const TaskBreakdown = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current step - large and clear */}
      <div
        key={currentStep}
        className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200"
      >
        <h3 className="text-xl font-bold mb-2">{steps[currentStep].title}</h3>
        <p className="text-lg mb-4">{steps[currentStep].instruction}</p>
        {steps[currentStep].content}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-3 rounded-lg border-2 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          className="px-6 py-3 rounded-lg bg-blue-500 text-white"
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};
```

### Predictable Interactions

```tsx
// Consistent navigation pattern
const ConsistentNavigation = () => {
  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0">
      <div className="flex justify-around items-center p-4 bg-white border-t">
        <NavLink to="/home" icon={<HomeIcon />} label="Home" />
        <NavLink to="/activities" icon={<ActivitiesIcon />} label="Activities" />
        <NavLink to="/progress" icon={<ProgressIcon />} label="My Progress" />
        <NavLink to="/settings" icon={<SettingsIcon />} label="Settings" />
      </div>
    </nav>
  );
};

// Predictable feedback
const PredictableFeedback = ({ type, message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2
                 px-6 py-3 rounded-lg shadow-lg z-50
                 animate-slide-down"
      style={{
        backgroundColor: type === 'success' ? '#dcfce7' : '#fee2e2',
        color: type === 'success' ? '#166534' : '#991b1b',
      }}
    >
      {message}
    </div>
  );
};
```

---

## Hearing Impairments Support

### Types of Hearing Impairments

| Condition | Characteristics | Design Adaptations |
|-----------|-----------------|-------------------|
| **Deaf** | No functional hearing | Visual alternatives, captions, sign language |
| **Hard of Hearing** | Partial hearing loss | Amplified audio, captions, visual cues |
| **Auditory Processing Disorder** | Difficulty processing sounds | Clear audio, reduced background noise |
| **Unilateral Hearing Loss** | Hearing in one ear only | Mono audio, visual redundancy |

### Visual Feedback Alternatives

```tsx
// Visual notification system
const VisualNotification = ({
  type,
  message,
  icon,
  color,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-3 p-4 rounded-lg"
      style={{ backgroundColor: color }}
    >
      <span aria-hidden="true" className="text-2xl">{icon}</span>
      <span className="font-semibold">{message}</span>
      {/* Flash indicator for attention */}
      <div
        className="w-3 h-3 rounded-full bg-white animate-pulse"
        aria-hidden="true"
      />
    </div>
  );
};

// Audio-visual feedback pairing
const AudioVisualFeedback = ({
  type,
  audioUrl,
  visualComponent,
}) => {
  const { reducedSounds } = useSensorySettings();

  return (
    <div>
      {/* Always show visual feedback */}
      {visualComponent}

      {/* Optional audio */}
      {!reducedSounds && audioUrl && (
        <audio src={audioUrl} aria-hidden="true" />
      )}
    </div>
  );
};

// Success feedback example
const SuccessFeedback = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual */}
      <div
        className="w-24 h-24 rounded-full bg-green-500
                   flex items-center justify-center
                   animate-bounce"
        role="img"
        aria-label="Correct answer"
      >
        <CheckIcon className="w-16 h-16 text-white" />
      </div>

      {/* Text */}
      <p className="text-xl font-bold text-green-700">Great job!</p>

      {/* Optional audio */}
      <audio src="/sounds/success.mp3" aria-hidden="true" />
    </div>
  );
};
```

### Captions and Transcripts

```tsx
// Accessible video component
const AccessibleVideo = ({
  src,
  poster,
  captions,
  transcript,
}) => {
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="relative">
      <video
        src={src}
        poster={poster}
        controls
        className="w-full rounded-lg"
      >
        {/* Closed captions */}
        {captions && (
          <track
            kind="captions"
            src={captions}
            srcLang="en"
            label="English captions"
            default={showCaptions}
          />
        )}

        {/* Audio descriptions */}
        <track
          kind="descriptions"
          src="/descriptions.vtt"
          srcLang="en"
          label="Audio descriptions"
        />
      </video>

      {/* Caption toggle */}
      <button
        onClick={() => setShowCaptions(!showCaptions)}
        aria-pressed={showCaptions}
        aria-label={showCaptions ? 'Hide captions' : 'Show captions'}
        className="absolute bottom-16 right-4 px-3 py-2
                   bg-black/70 text-white rounded"
      >
        CC {showCaptions ? 'On' : 'Off'}
      </button>

      {/* Transcript toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        aria-pressed={showTranscript}
        aria-expanded={showTranscript}
        aria-controls="transcript"
        className="absolute bottom-16 right-20 px-3 py-2
                   bg-black/70 text-white rounded"
      >
        Transcript
      </button>

      {/* Transcript panel */}
      {showTranscript && transcript && (
        <div
          id="transcript"
          role="region"
          aria-label="Video transcript"
          className="mt-4 p-4 bg-gray-100 rounded-lg max-h-64 overflow-y-auto"
        >
          {transcript.map((segment, i) => (
            <p key={i} className="mb-2">
              <span className="text-sm text-gray-600">
                [{formatTime(segment.start)}]
              </span>{' '}
              {segment.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// WebVTT caption format example
const captionExample = `WEBVTT

00:00:00.000 --> 00:00:03.000
Welcome to Learning Adventure!

00:00:03.000 --> 00:00:06.000
Today we'll learn about shapes.

00:00:06.000 --> 00:00:09.000
Can you find the circle?
`;
```

### Sign Language Support

```tsx
// Sign language video overlay
const SignLanguageOverlay = ({ videoSrc, position = 'bottom-right' }) => {
  const [showSigner, setShowSigner] = useState(false);

  const positions = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setShowSigner(!showSigner)}
        aria-pressed={showSigner}
        aria-label={showSigner ? 'Hide sign language interpreter' : 'Show sign language interpreter'}
        className="fixed bottom-20 right-4 p-3 bg-blue-500 text-white rounded-full"
      >
        <SignLanguageIcon size={24} />
      </button>

      {/* Sign language video */}
      {showSigner && (
        <div
          className={`fixed ${positions[position]} w-48 h-36
                     rounded-lg overflow-hidden shadow-lg
                     border-2 border-white`}
        >
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            aria-label="Sign language interpreter"
          />
        </div>
      )}
    </div>
  );
};
```

---

## Inclusive EdTech Case Studies

### Khan Academy Kids

**Accessibility Features:**
- Audio narration for all text content
- Large, colorful touch targets
- No time limits on activities
- Positive reinforcement feedback
- Progressive difficulty adjustment

**Lessons Learned:**
- Audio support is essential for pre-readers
- Visual feedback must accompany all audio
- Children need multiple attempts without penalty

### PBS Kids

**Accessibility Features:**
- Closed captions on all videos
- Keyboard navigation support
- Consistent navigation patterns
- Parent/teacher resources for accessibility

**Lessons Learned:**
- Consistency helps children with cognitive disabilities
- Parent involvement is key for accessibility setup

### Duolingo ABC

**Accessibility Features:**
- Phonics-based audio support
- Visual progress indicators
- Bite-sized lessons
- Gamification with accessibility in mind

**Lessons Learned:**
- Short lessons reduce cognitive load
- Visual progress motivates continued use

### Epic! Reading App

**Accessibility Features:**
- Read-to-me audio narration
- Highlighting synchronized with audio
- Adjustable reading levels
- Dyslexia-friendly font option

**Lessons Learned:**
- Synchronized highlighting improves comprehension
- Font options support diverse reading needs

### Starfall

**Accessibility Features:**
- Simple, consistent interface
- Audio instructions throughout
- Minimal distractions
- Clear cause-and-effect feedback

**Lessons Learned:**
- Simplicity benefits all learners
- Immediate feedback reinforces learning

---

## Technical Implementation Patterns (React/TypeScript)

### Core Accessibility Hooks

```tsx
// useAccessibility.ts
import { useEffect, useState, useCallback } from 'react';

export interface AccessibilitySettings {
  reducedMotion: boolean;
  reducedSounds: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  dyslexiaFont: boolean;
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : {
      reducedMotion: false,
      reducedSounds: false,
      highContrast: false,
      largeText: false,
      screenReaderMode: false,
      dyslexiaFont: false,
    };
  });

  // Check system preferences on mount
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    setSettings(prev => ({
      ...prev,
      reducedMotion: motionQuery.matches || prev.reducedMotion,
      highContrast: contrastQuery.matches || prev.highContrast,
    }));

    const motionHandler = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    const contrastHandler = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', motionHandler);
    contrastQuery.addEventListener('change', contrastHandler);

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      contrastQuery.removeEventListener('change', contrastHandler);
    };
  }, []);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { settings, updateSetting };
}
```

### Accessible Button Component

```tsx
// components/AccessibleButton.tsx
import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  targetSize?: 'standard' | 'large' | 'extra-large';
}

const sizeClasses = {
  sm: 'min-w-[44px] min-h-[44px] px-4 py-2 text-base',
  md: 'min-w-[48px] min-h-[48px] px-5 py-3 text-lg',
  lg: 'min-w-[56px] min-h-[56px] px-6 py-4 text-xl',
  xl: 'min-w-[64px] min-h-[64px] px-8 py-5 text-2xl',
};

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
};

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  function AccessibleButton(
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      targetSize = 'standard',
      disabled,
      className,
      ...props
    },
    ref
  ) {
    const { settings } = useAccessibility();

    // Adjust size based on accessibility settings
    const effectiveSize = settings.largeText || targetSize === 'extra-large'
      ? 'xl'
      : targetSize === 'large'
      ? 'lg'
      : size;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${sizeClasses[effectiveSize]}
          ${variantClasses[variant]}
          rounded-xl font-semibold
          transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
          ${settings.reducedMotion ? 'transition-none' : ''}
          ${className || ''}
        `}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size={20} aria-hidden="true" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
```

### Accessible Modal Dialog

```tsx
// components/AccessibleModal.tsx
import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string;
  isAlert?: boolean;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  description,
  isAlert = false,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Trap focus within modal
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocus.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Return focus
      previousFocus.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role={isAlert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full
                   max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="modal-title" className="text-2xl font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 hover:bg-gray-100 rounded-full
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Description */}
        {description && (
          <div id="modal-description" className="px-6 py-4">
            <p className="text-lg">{description}</p>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
```

### Focus Trap Hook

```tsx
// hooks/useFocusTrap.ts
import { useEffect, RefObject } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(
  ref: RefObject<HTMLElement>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTORS
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [ref, isActive]);
}
```

### Accessible Form Components

```tsx
// components/AccessibleForm.tsx
import React, { useState } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}

export function FormField({
  id,
  label,
  error,
  required,
  helpText,
  children,
}: FormFieldProps) {
  const describedBy = [
    helpText ? `${id}-help` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block text-lg font-semibold mb-2"
      >
        {label}
        {required && (
          <span className="text-red-600 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-required': required,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': describedBy,
      })}

      {helpText && (
        <p id={`${id}-help`} className="mt-1 text-sm text-gray-600">
          {helpText}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-sm text-red-600 font-semibold"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible input component
export function AccessibleInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`
        w-full px-4 py-3 rounded-lg border-2
        focus:outline-none focus:ring-4 focus:ring-blue-400
        ${props['aria-invalid'] === 'true'
          ? 'border-red-500 focus:ring-red-400'
          : 'border-gray-300'}
        text-lg
      `}
    />
  );
}
```

### Live Region Announcements

```tsx
// components/LiveAnnouncer.tsx
import React, { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
}

export function useAnnouncer() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const id = Date.now().toString();
    setAnnouncements(prev => [...prev, { id, message, priority }]);

    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  };

  return { announce };
}

export function LiveAnnouncer() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Global announcement listener
  useEffect(() => {
    const handleAnnounce = (e: CustomEvent<Announcement>) => {
      setAnnouncements(prev => [...prev, e.detail]);
    };

    window.addEventListener('announce' as any, handleAnnounce);
    return () => window.removeEventListener('announce' as any, handleAnnounce);
  }, []);

  return (
    <div className="sr-only">
      {/* Polite live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcements
          .filter(a => a.priority === 'polite')
          .map(a => (
            <div key={a.id}>{a.message}</div>
          ))}
      </div>

      {/* Assertive live region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(a => (
            <div key={a.id}>{a.message}</div>
          ))}
      </div>
    </div>
  );
}

// Usage example
function ExampleComponent() {
  const { announce } = useAnnouncer();

  const handleSubmit = () => {
    // Process form...
    announce('Form submitted successfully!', 'polite');
  };

  const handleError = () => {
    announce('Error: Please check your input', 'assertive');
  };

  return (
    <button onClick={handleSubmit}>Submit</button>
  );
}
```

---

## Testing with Assistive Technologies

### Screen Reader Testing

#### VoiceOver (macOS/iOS)

```markdown
## VoiceOver Testing Checklist

### Setup
- [ ] Enable VoiceOver: Cmd + F5 (Mac) or triple-click side button (iOS)
- [ ] Set verbosity to medium for testing
- [ ] Use Control + Option + H for help

### Navigation Testing
- [ ] Tab through all interactive elements
- [ ] Use rotor to navigate by headings
- [ ] Use rotor to navigate by landmarks
- [ ] Use rotor to navigate by buttons
- [ ] Verify all elements have meaningful labels

### Interaction Testing
- [ ] Activate all buttons with Space/Enter
- [ ] Use touch rotor on iOS for item selection
- [ ] Test form input and error announcements
- [ ] Verify live region announcements

### Common Commands
| Command | Action |
|---------|--------|
| Control + Option + Right | Next item |
| Control + Option + Left | Previous item |
| Control + Option + Space | Activate |
| Control + Option + H | Next heading |
| Control + Option + M | Next landmark |
| Control + Option + B | Next button |
```

#### NVDA (Windows)

```markdown
## NVDA Testing Checklist

### Setup
- [ ] Download NVDA from nvaccess.org
- [ ] Install and run (no admin required)
- [ ] Set speech rate to comfortable level

### Navigation Testing
- [ ] Tab through all elements
- [ ] Use H for headings navigation
- [ ] Use B for buttons navigation
- [ ] Use F for form fields
- [ ] Use D for landmarks

### Interaction Testing
- [ ] Activate buttons with Enter/Space
- [ ] Test form completion
- [ ] Verify error announcements
- [ ] Test with touch screen (if available)

### Common Commands
| Key | Action |
|-----|--------|
| Tab | Next focusable |
| Shift + Tab | Previous focusable |
| H | Next heading |
| B | Next button |
| F | Next form field |
| Enter | Activate |
| Insert + Up | Read current line |
| Insert + B | Read from start |
```

#### JAWS (Windows)

```markdown
## JAWS Testing Checklist

### Setup
- [ ] Download trial from freedomscientific.com
- [ ] Install and configure
- [ ] Set appropriate speech settings

### Navigation Testing
- [ ] Use Tab for sequential navigation
- [ ] Use Insert + F7 for links list
- [ ] Use Insert + F6 for headings list
- [ ] Verify semantic structure

### Common Commands
| Key | Action |
|-----|--------|
| Tab | Next focusable |
| Insert + F7 | Links list |
| Insert + F6 | Headings list |
| Insert + Esc | JAWS menu |
```

### Keyboard Testing

```tsx
// Keyboard testing utility
const keyboardTestCases = [
  {
    name: 'Tab navigation',
    test: async () => {
      // Press Tab and verify focus moves correctly
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focusedElement).toBe('BUTTON');
    },
  },
  {
    name: 'Enter activates button',
    test: async () => {
      await page.keyboard.press('Enter');
      const clicked = await page.evaluate(() =>
        (window as any).buttonClicked
      );
      expect(clicked).toBe(true);
    },
  },
  {
    name: 'Escape closes modal',
    test: async () => {
      await page.keyboard.press('Escape');
      const modalOpen = await page.evaluate(
        () => document.querySelector('[role="dialog"]') !== null
      );
      expect(modalOpen).toBe(false);
    },
  },
  {
    name: 'Arrow keys navigate menu',
    test: async () => {
      await page.keyboard.press('ArrowDown');
      const focusedItem = await page.evaluate(
        () => document.activeElement?.textContent
      );
      expect(focusedItem).toBe('Second Item');
    },
  },
];

// Run keyboard tests
async function runKeyboardTests(page: Page) {
  for (const testCase of keyboardTestCases) {
    console.log(`Running: ${testCase.name}`);
    await testCase.test();
  }
}
```

### Automated Testing Tools

```tsx
// Jest + React Testing Library accessibility tests
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibleButton } from './AccessibleButton';

expect.extend(toHaveNoViolations);

describe('AccessibleButton', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <AccessibleButton>Click me</AccessibleButton>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has accessible name', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('announces loading state', () => {
    render(<AccessibleButton loading>Click me</AccessibleButton>);

    const button = screen.getByRole('button', {
      name: /loading/i,
    });
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
```

### Testing Checklist

```markdown
## Accessibility Testing Checklist

### Automated Testing
- [ ] Run axe-core on all pages
- [ ] Run Lighthouse accessibility audit
- [ ] Check color contrast ratios
- [ ] Validate HTML semantics
- [ ] Test with WAVE browser extension

### Manual Testing
- [ ] Navigate with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test with high contrast mode
- [ ] Test with text zoom (200%)
- [ ] Test with reduced motion
- [ ] Test with switch control (if available)
- [ ] Test with voice control (if available)

### User Testing
- [ ] Test with children with disabilities
- [ ] Gather feedback on usability
- [ ] Iterate based on findings
- [ ] Document accommodations needed
```

---

## Compliance Checklist (ADA, Section 508)

### ADA Title III Compliance

```markdown
## ADA Digital Accessibility Checklist

### Legal Requirements
- [ ] Website/app accessible to people with disabilities
- [ ] Effective communication ensured
- [ ] Reasonable accommodations provided
- [ ] No fundamental alteration of service

### Technical Standards
- [ ] WCAG 2.2 Level AA conformance
- [ ] Regular accessibility audits
- [ ] Accessibility statement published
- [ ] Feedback mechanism available

### Documentation
- [ ] VPAT (Voluntary Product Accessibility Template) completed
- [ ] Accessibility conformance report available
- [ ] Contact information for accessibility issues
- [ ] Process for handling accommodation requests
```

### Section 508 Compliance

```markdown
## Section 508 Compliance Checklist

### Functional Performance Criteria

#### Without Vision (1194.22(a))
- [ ] All information available via screen reader
- [ ] No reliance on visual perception alone

#### With Low Vision (1194.22(b))
- [ ] High contrast mode supported
- [ ] Text scalable to 200%
- [ ] No color-only information

#### Without Color Perception (1194.22(c))
- [ ] Information not conveyed by color alone
- [ ] Patterns/icons used in addition to color

#### Without Hearing (1194.22(d))
- [ ] Captions for all audio content
- [ ] Visual alternatives to audio cues

#### With Limited Hearing (1194.22(e))
- [ ] Volume control available
- [ ] Audio quality maintained at higher volumes

#### Without Speech (1194.22(f))
- [ ] No speech-only input required
- [ ] Alternative input methods available

#### With Limited Manipulation (1194.22(g))
- [ ] Large touch targets (44px minimum)
- [ ] No precise movements required
- [ ] Switch control compatible

#### With Limited Reach and Strength (1194.22(h))
- [ ] No sustained pressure required
- [ ] Voice control supported

#### With Limited Language/Cognitive (1194.22(i))
- [ ] Simple, clear language
- [ ] Consistent navigation
- [ ] Error prevention and recovery

#### Photosensitivity (1194.22(j))
- [ ] No content flashes more than 3 times/second
- [ ] Animation can be disabled

#### Time Limits (1194.22(k))
- [ ] Time limits can be extended or disabled
- [ ] Warning before time expires

### Technical Standards

#### Software (1194.21)
- [ ] Keyboard accessible
- [ ] Focus visible
- [ ] Object information available to AT
- [ ] User preferences respected

#### Web-Based (1194.22)
- [ ] WCAG 2.2 AA compliant
- [ ] Proper ARIA implementation
- [ ] Semantic HTML

### Documentation Requirements
- [ ] Accessibility conformance report
- [ ] Support resources available
- [ ] Contact information provided
```

### WCAG 2.2 AA Quick Reference

```markdown
## WCAG 2.2 AA Success Criteria Checklist

### Perceivable
- [ ] 1.1.1 Non-text Content (A)
- [ ] 1.2.2 Captions (Prerecorded) (A)
- [ ] 1.2.4 Captions (Live) (AA)
- [ ] 1.2.5 Audio Description (AA)
- [ ] 1.3.1 Info and Relationships (A)
- [ ] 1.3.4 Orientation (AA)
- [ ] 1.3.5 Identify Input Purpose (AA)
- [ ] 1.4.1 Use of Color (A)
- [ ] 1.4.3 Contrast (Minimum) (AA)
- [ ] 1.4.4 Resize Text (AA)
- [ ] 1.4.5 Images of Text (AA)
- [ ] 1.4.10 Reflow (AA)
- [ ] 1.4.11 Non-text Contrast (AA)
- [ ] 1.4.12 Text Spacing (AA)
- [ ] 1.4.13 Content on Hover or Focus (AA)

### Operable
- [ ] 2.1.1 Keyboard (A)
- [ ] 2.1.2 No Keyboard Trap (A)
- [ ] 2.1.4 Character Key Shortcuts (A)
- [ ] 2.2.1 Timing Adjustable (A)
- [ ] 2.2.2 Pause, Stop, Hide (A)
- [ ] 2.3.1 Three Flashes (A)
- [ ] 2.4.1 Bypass Blocks (A)
- [ ] 2.4.2 Page Titled (A)
- [ ] 2.4.3 Focus Order (A)
- [ ] 2.4.4 Link Purpose (A)
- [ ] 2.4.5 Multiple Ways (AA)
- [ ] 2.4.6 Headings and Labels (AA)
- [ ] 2.4.7 Focus Visible (AA)
- [ ] 2.4.11 Focus Not Obscured (AA)
- [ ] 2.5.1 Pointer Gestures (A)
- [ ] 2.5.2 Pointer Cancellation (A)
- [ ] 2.5.3 Label in Name (A)
- [ ] 2.5.4 Motion Actuation (A)
- [ ] 2.5.7 Dragging Movements (AA)
- [ ] 2.5.8 Target Size (Minimum) (AA)

### Understandable
- [ ] 3.1.1 Language of Page (A)
- [ ] 3.1.2 Language of Parts (AA)
- [ ] 3.2.1 On Focus (A)
- [ ] 3.2.2 On Input (A)
- [ ] 3.2.3 Consistent Navigation (AA)
- [ ] 3.2.4 Consistent Identification (AA)
- [ ] 3.2.6 Consistent Help (AA)
- [ ] 3.3.1 Error Identification (A)
- [ ] 3.3.2 Labels or Instructions (A)
- [ ] 3.3.3 Error Suggestion (AA)
- [ ] 3.3.4 Error Prevention (AA)
- [ ] 3.3.7 Redundant Entry (AA)
- [ ] 3.3.8 Accessible Authentication (AA)

### Robust
- [ ] 4.1.1 Parsing (A)
- [ ] 4.1.2 Name, Role, Value (A)
- [ ] 4.1.3 Status Messages (AA)
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Task | Description | Effort | Priority |
|------|-------------|--------|----------|
| **Accessibility Audit** | Run automated tools on existing codebase | 2 days | P0 |
| **Design System Updates** | Update color palette, typography, spacing | 1 week | P0 |
| **Core Components** | Build accessible Button, Input, Modal components | 1 week | P0 |
| **Keyboard Navigation** | Implement focus management, tab order | 1 week | P0 |
| **Screen Reader Testing** | Test with VoiceOver and NVDA | 3 days | P0 |

**Deliverables:**
- Accessibility audit report
- Updated design tokens
- Core accessible components library
- Keyboard navigation working group

### Phase 2: Enhanced Accessibility (Weeks 5-8)

| Task | Description | Effort | Priority |
|------|-------------|--------|----------|
| **Sensory Settings** | Implement reduced motion, high contrast toggles | 1 week | P1 |
| **Alternative Input** | Add switch control, voice control support | 1 week | P1 |
| **Age-Appropriate UI** | Implement size variants for different age groups | 3 days | P1 |
| **Audio Support** | Add text-to-speech, audio instructions | 1 week | P1 |
| **Captions** | Implement video captions system | 3 days | P1 |

**Deliverables:**
- Sensory settings panel
- Alternative input support
- Age-group specific UI variants
- Audio narration system

### Phase 3: Advanced Features (Weeks 9-12)

| Task | Description | Effort | Priority |
|------|-------------|--------|----------|
| **Dyslexia Support** | Dyslexia-friendly fonts, reading assistance | 3 days | P2 |
| **Motor Support** | Enhanced hit areas, gesture alternatives | 3 days | P2 |
| **Visual Support** | Screen reader optimizations, audio descriptions | 1 week | P2 |
| **Cognitive Support** | Simplified layouts, task breakdown | 1 week | P2 |
| **Testing Program** | User testing with children with disabilities | 1 week | P2 |

**Deliverables:**
- Comprehensive accessibility features
- User testing report
- Accessibility documentation

### Phase 4: Compliance & Maintenance (Ongoing)

| Task | Description | Effort | Priority |
|------|-------------|--------|----------|
| **VPAT Completion** | Document accessibility conformance | 3 days | P2 |
| **Accessibility Statement** | Publish public commitment | 1 day | P2 |
| **Training** | Team accessibility training | 1 week | P2 |
| **Monitoring** | Continuous accessibility monitoring | Ongoing | P2 |
| **User Feedback** | Accessibility feedback mechanism | 2 days | P2 |

**Deliverables:**
- VPAT document
- Accessibility statement
- Trained team
- Monitoring dashboard

---

## Tools and Resources

### Development Tools

| Tool | Purpose | URL |
|------|---------|-----|
| **axe DevTools** | Automated accessibility testing | deque.com/axe |
| **WAVE** | Web accessibility evaluation | wave.webaim.org |
| **Lighthouse** | Chrome accessibility audit | Built into Chrome DevTools |
| **Color Contrast Analyzer** | Check color ratios | webaim.org/resources/contrastchecker |
| **ANDI** | Accessibility testing tool | ssa.gov/accessibility/andi |
| **Accessibility Insights** | Microsoft accessibility testing | accessibilityinsights.io |

### Screen Readers

| Screen Reader | Platform | Cost |
|---------------|----------|------|
| **VoiceOver** | macOS, iOS | Free |
| **NVDA** | Windows | Free |
| **JAWS** | Windows | Paid |
| **TalkBack** | Android | Free |
| **Narrator** | Windows | Free |

### Libraries & Frameworks

| Library | Description | URL |
|---------|-------------|-----|
| **React Aria** | Accessible React components | react-spectrum.adobe.com/react-aria |
| **Radix UI** | Unstyled accessible components | radix-ui.com |
| **Headless UI** | Accessible UI components | headlessui.com |
| **Reach UI** | Accessible React components | reach.tech |
| **A11y Project** | Accessibility resources | a11yproject.com |

### Testing Services

| Service | Description |
|---------|-------------|
| **Fable** | User testing with people with disabilities | makeitfable.com |
| **AccessWorks** | Accessibility testing platform | accessworks.org |
| **UserTesting** | Includes accessibility testing | usertesting.com |

### Guidelines & Standards

| Resource | Description |
|----------|-------------|
| **WCAG 2.2** | Web Content Accessibility Guidelines | w3.org/WAI/WCAG22 |
| **ARIA APG** | ARIA Authoring Practices Guide | w3.org/WAI/ARIA/apg |
| **Section 508** | US Federal accessibility standards | section508.gov |
| **ADA.gov** | Americans with Disabilities Act | ada.gov |

---

## References

1. W3C Web Accessibility Initiative (WAI). "WCAG 2.2 Guidelines." https://www.w3.org/WAI/WCAG22/
2. W3C. "ARIA Authoring Practices Guide." https://www.w3.org/WAI/ARIA/apg/
3. W3C. "Making Content Usable for People with Cognitive and Learning Disabilities." https://www.w3.org/TR/coga-usable/
4. Section508.gov. "ICT Testing Baseline." https://www.section508.gov/
5. ADA.gov. "Title III Regulations." https://www.ada.gov/
6. MDN Web Docs. "Accessibility." https://developer.mozilla.org/en-US/docs/Web/Accessibility
7. Chrome Developers. "Lighthouse Accessibility Audits." https://developer.chrome.com/docs/lighthouse/accessibility/
8. Apple. "Accessibility Features." https://support.apple.com/accessibility/
9. React Aria. "Accessible Component Patterns." https://react-spectrum.adobe.com/react-aria/
10. The A11y Project. "Accessibility Checklist." https://www.a11yproject.com/checklist/

---

## Appendix: Quick Reference Cards

### Touch Target Sizes

```
┌─────────────────────────────────────────────────────────┐
│                  TOUCH TARGET SIZES                      │
├──────────────┬─────────────┬─────────────┬──────────────┤
│   Age 3-4    │   Age 5-6   │   Age 7-8   │   Standard   │
│              │             │             │   (Adult)    │
├──────────────┼─────────────┼─────────────┼──────────────┤
│   60x60px    │   48x48px   │   44x44px   │   44x44px    │
│   16px gap   │   12px gap  │    8px gap  │    8px gap   │
└──────────────┴─────────────┴─────────────┴──────────────┘
```

### Color Contrast Requirements

```
┌─────────────────────────────────────────────────────────┐
│               COLOR CONTRAST REQUIREMENTS                │
├─────────────────────────┬───────────────────────────────┤
│      Text Type          │    Minimum Ratio              │
├─────────────────────────┼───────────────────────────────┤
│ Normal text (< 18pt)    │    4.5:1 (AA)                 │
│ Large text (≥ 18pt)     │    3:1 (AA)                   │
│ UI components/icons     │    3:1 (AA)                   │
│ Essential icons         │    4.5:1 (recommended)        │
└─────────────────────────┴───────────────────────────────┘
```

### Keyboard Shortcuts Reference

```
┌─────────────────────────────────────────────────────────┐
│              ESSENTIAL KEYBOARD SHORTCUTS                │
├─────────────────────────┬───────────────────────────────┤
│         Key             │         Action                │
├─────────────────────────┼───────────────────────────────┤
│ Tab                     │ Next focusable element        │
│ Shift + Tab             │ Previous focusable element    │
│ Enter/Space             │ Activate button/link          │
│ Escape                  │ Close modal/cancel            │
│ Arrow keys              │ Navigate within components    │
│ Home                    │ Go to first item              │
│ End                     │ Go to last item               │
└─────────────────────────┴───────────────────────────────┘
```

---

*This document is a living resource and should be updated as new accessibility standards and best practices emerge. Last reviewed: March 5, 2026.*
