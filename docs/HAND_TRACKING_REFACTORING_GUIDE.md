# Hand Tracking Refactoring Guide

## Overview

This document provides a comprehensive guide for refactoring hand tracking implementation across all games in the Advay Vision Learning project. The goal is to centralize hand tracking logic, improve maintainability, and ensure consistent behavior across all camera-based games.

## Current State Analysis

### Identified Games with Heavy Hand Tracking Dependencies

Based on code analysis, the following 15 games have significant hand tracking integration (5+ references to MediaPipe/landmarker):

1. **ShapePop** - Target popping game with pinch detection
2. **PhonicsSounds** - Sound matching with hand gestures
3. **WordBuilder** - Word construction with hand tracking
4. **SteadyHandLab** - Precision tracking game
5. **ConnectTheDots** - Drawing game with hand tracking
6. **FreezeDance** - Dance game with gesture recognition
7. **DressForWeather** - Dressing game with hand interactions
8. **MirrorDraw** - Drawing game with hand tracking
9. **AlphabetGamePage** - Alphabet learning with gestures
10. **EmojiMatch** - Emoji matching with hand tracking
11. **ColorMatchGarden** - Color matching game
12. **LetterHunt** - Letter hunting game
13. **NumberTapTrail** - Number tracing game
14. **ShapeSequence** - Shape sequencing game
15. **MusicPinchBeat** - Music game with pinch detection

### Current Architecture

The current hand tracking system consists of:

1. **useHandTracking** - MediaPipe initialization with GPU/CPU fallback
2. **useHandTrackingRuntime** - Frame processing and pinch detection
3. **useGameLoop** - Consistent timing with FPS limiting
4. **Individual game components** - Custom hand tracking logic

## New Centralized Architecture

### useGameHandTracking Hook

The new `useGameHandTracking` hook provides a unified interface for all games:

```typescript
const {
  isReady,
  cursor,
  pinch,
  startTracking,
  stopTracking,
  resetTracking,
  reinitialize,
  fps,
  error,
  isLoading,
} = useGameHandTracking({
  gameName: 'ShapePop',
  targetFps: 30,
  smoothing: { minCutoff: 1.0, beta: 0.0 },
  pinch: {
    startThreshold: 0.05,
    releaseThreshold: 0.07,
    landmarks: [4, 8], // Thumb and index finger
  },
  onError: (error) => console.error('Hand tracking error:', error),
  onReady: () => console.log('Hand tracking ready'),
});
```

### Key Features

1. **Automatic Initialization** - Handles MediaPipe loading with fallback
2. **Error Handling** - Centralized error management with game-specific callbacks
3. **Consistent Configuration** - Standardized pinch detection and smoothing
4. **Lifecycle Management** - Proper cleanup and state management
5. **Performance Monitoring** - Built-in FPS tracking
6. **Haptic Feedback** - Integrated with game logic

## Refactoring Process

### Phase 1: Core Infrastructure

✅ **Completed:**

- Created `useGameHandTracking` hook
- Updated type definitions in `tracking.ts`
- Added missing types: `TrackedHandFrame`, `HandTrackingRuntimeMeta`, `OneEuroFilterOptions`
- Fixed type issues and imports

### Phase 2: Game-by-Game Refactoring

For each game, follow this pattern:

1. **Replace individual hooks** with `useGameHandTracking`
2. **Update component logic** to use new interface
3. **Remove redundant code** (pinch detection, smoothing, etc.)
4. **Add error handling** with game-specific feedback
5. **Test functionality** thoroughly

### Phase 3: Testing and Validation

1. **Unit Testing** - Test hook behavior in isolation
2. **Integration Testing** - Test with actual games
3. **Performance Testing** - Verify FPS and responsiveness
4. **Cross-browser Testing** - Ensure compatibility
5. **Accessibility Testing** - Verify haptic feedback and error messages

## Benefits of Refactoring

### For Developers

1. **Reduced Code Duplication** - Centralized hand tracking logic
2. **Easier Maintenance** - Single point of updates for hand tracking features
3. **Consistent API** - Same interface across all games
4. **Better Error Handling** - Centralized error management
5. **Improved Testing** - Easier to test hand tracking functionality

### For Users

1. **Consistent Experience** - Same hand tracking behavior across games
2. **Better Performance** - Optimized and shared resources
3. **Improved Reliability** - Robust error handling and fallbacks
4. **Enhanced Accessibility** - Better error messages and feedback

### For the Project

1. **Maintainability** - Easier to update and improve hand tracking
2. **Scalability** - New games can easily integrate hand tracking
3. **Code Quality** - Cleaner, more organized codebase
4. **Documentation** - Centralized documentation and examples

## Implementation Examples

### Before (ShapePop - Current)

```typescript
const {
  landmarker,
  isLoading: isModelLoading,
  isReady: isHandTrackingReady,
  initialize: initializeHandTracking,
} = useHandTracking({
  numHands: 1,
  minDetectionConfidence: 0.3,
  minHandPresenceConfidence: 0.3,
  minTrackingConfidence: 0.3,
  delegate: 'GPU',
  enableFallback: true,
});

const { resetPinchState } = useHandTrackingRuntime({
  isRunning: isPlaying && isHandTrackingReady,
  handLandmarker: landmarker,
  webcamRef,
  targetFps: 30,
  onFrame: handleFrame,
  // ... other options
});
```

### After (ShapePop - Refactored)

```typescript
const {
  isReady,
  cursor,
  pinch,
  startTracking,
  stopTracking,
  resetTracking,
  fps,
  error,
  isLoading,
} = useGameHandTracking({
  gameName: 'ShapePop',
  targetFps: 30,
  smoothing: { minCutoff: 1.0, beta: 0.0 },
  pinch: {
    startThreshold: 0.05,
    releaseThreshold: 0.07,
    landmarks: [4, 8],
  },
  onError: (error) => {
    setFeedback('Camera not detected. Please check permissions and try again.');
  },
  onReady: () => {
    setFeedback('Pinch when your finger is inside the shape ring.');
  },
});
```

## Migration Checklist

For each game refactoring:

- [ ] Replace `useHandTracking` with `useGameHandTracking`
- [ ] Replace `useHandTrackingRuntime` with new interface
- [ ] Remove custom pinch detection logic
- [ ] Remove custom smoothing logic
- [ ] Update error handling to use game-specific callbacks
- [ ] Update feedback messages
- [ ] Test pinch detection functionality
- [ ] Test error scenarios
- [ ] Verify performance (FPS)
- [ ] Update documentation

## Common Patterns

### Pinch Detection

```typescript
useEffect(() => {
  if (pinch.transition === 'start') {
    // Handle pinch start
    if (isPointInCircle(cursor, target, radius)) {
      // Success action
    } else {
      // Missed action
    }
  }
}, [pinch.transition, cursor, target]);
```

### Error Handling

```typescript
const { error } = useGameHandTracking({
  onError: (error) => {
    setFeedback(`Error: ${error.message}`);
    // Log to analytics
  },
});
```

### Game Lifecycle

```typescript
useEffect(() => {
  if (isPlaying && !isReady && !isLoading) {
    startTracking();
  }
}, [isPlaying, isReady, isLoading, startTracking]);

useEffect(() => {
  return () => {
    stopTracking();
  };
}, [stopTracking]);
```

## Performance Considerations

1. **FPS Management** - Use appropriate target FPS (20-30 for kids)
2. **Smoothing Settings** - Adjust based on game requirements
3. **Error Recovery** - Implement graceful degradation
4. **Resource Cleanup** - Always clean up on unmount
5. **Memory Management** - Avoid memory leaks in long sessions

## Testing Strategy

### Unit Tests

```typescript
describe('useGameHandTracking', () => {
  it('should initialize with default options', () => {
    // Test default configuration
  });

  it('should handle pinch transitions correctly', () => {
    // Test pinch detection
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

### Integration Tests

```typescript
describe('ShapePop with useGameHandTracking', () => {
  it('should detect pinches correctly', () => {
    // Test actual game functionality
  });

  it('should handle camera errors', () => {
    // Test error scenarios
  });
});
```

## Future Enhancements

1. **Gesture Recognition** - Add more complex gesture detection
2. **Multi-hand Support** - Support for two-handed interactions
3. **Custom Smoothing** - Game-specific smoothing algorithms
4. **Performance Optimization** - Further optimization for low-end devices
5. **Analytics Integration** - Track hand tracking usage and performance

## Conclusion

The hand tracking refactoring provides a solid foundation for consistent, maintainable hand tracking across all games. By centralizing the logic and providing a unified interface, we improve both developer experience and user experience while making the codebase more maintainable and scalable.

The refactoring should be done incrementally, game by game, with thorough testing at each step to ensure functionality is preserved while improving the underlying architecture.
