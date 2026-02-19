# Wellness Features Documentation

## Overview

This document describes the wellness features implemented in the Advay Learning App to promote healthy gaming habits for children.

## Features Implemented

### 1. Active Time Tracking

- Monitors continuous playtime
- Tracks minutes since game started
- Provides data for wellness reminders

### 2. Inactivity Detection

- Detects when child is not interacting with the game
- Uses event listeners for mouse, keyboard, touch, and scroll events
- Resets timer when activity is detected

### 3. Wellness Timer Component

- Visual display of active and inactive time
- Configurable thresholds for reminders
- Option to hide/show the timer
- Floating reminder indicator when hidden

### 4. Wellness Reminder System

- Contextual reminders based on time thresholds:
  - Break reminder after 15 minutes of continuous play
  - Water/hydration reminder after 20 minutes
  - Stretching reminder after 30 minutes
  - Inactivity check after 60 seconds of inactivity
- Customizable messages and icons
- Postpone and dismiss options

### 5. Eye Tracking (Advanced)

- Uses MediaPipe Face Landmarker for blink detection
- Calculates Eye Aspect Ratio (EAR) to detect blinks
- Provides blink count and timing data
- Can detect when child is not looking at screen

## Technical Implementation

### Components

#### WellnessTimer.tsx

- Displays active time and inactive time
- Configurable thresholds for reminders
- Toggle visibility option
- Uses React state and effects for time tracking

#### WellnessReminder.tsx

- Modal component for wellness notifications
- Contextual messages based on detected needs
- Different types: break, water, stretch, inactive
- Dismiss and postpone functionality

#### Hooks

##### useInactivityDetector.ts

- Tracks user activity via event listeners
- Configurable timeout threshold
- Returns active status and time remaining
- Automatically resets on user interaction

##### useEyeTracking.ts

- Integrates with MediaPipe for face detection
- Calculates eye aspect ratios for blink detection
- Returns blink count and eye state
- Handles model loading and initialization

### Integration Points

#### AlphabetGame.tsx

- Added wellness state variables
- Integrated WellnessTimer component
- Integrated WellnessReminder component
- Connected to game lifecycle (start/stop)
- Added effects for time tracking

## Configuration Options

### WellnessTimer Props

- `onBreakReminder`: Callback when break threshold reached
- `activeThreshold`: Minutes before break reminder (default: 15)
- `inactiveThreshold`: Seconds before inactivity reminder (default: 60)
- `onInactiveDetected`: Callback when inactivity detected

### WellnessReminder Props

- `activeTime`: Current active time in minutes
- `inactiveTime`: Current inactive time in seconds
- `onDismiss`: Callback when reminder dismissed
- `onPostpone`: Callback when reminder postponed

### useInactivityDetector Options

- `timeoutMs`: Milliseconds before inactivity detected (default: 60000)
- `onInactivityDetected`: Callback when inactivity detected

## Usage Examples

### Basic Integration

```tsx
import WellnessTimer from '../components/WellnessTimer';
import WellnessReminder from '../components/WellnessReminder';
import useInactivityDetector from '../hooks/useInactivityDetector';

// In component
const { isActive, timeRemaining } = useInactivityDetector(
  () => console.log('Inactivity detected'),
  60000 // 1 minute
);

return (
  <>
    {/* Your game content */}
    
    <WellnessTimer 
      onBreakReminder={() => setShowBreakReminder(true)}
      activeThreshold={15}
    />
    
    {showBreakReminder && (
      <WellnessReminder
        activeTime={activeTime}
        inactiveTime={inactiveTime}
        onDismiss={() => setShowBreakReminder(false)}
      />
    )}
  </>
);
```

## Best Practices

### For Developers

- Always check if game is active before triggering wellness features
- Use appropriate thresholds based on age group
- Provide clear, kid-friendly messaging
- Test on various devices and browsers

### For Parents/Educators

- Customize thresholds based on child's attention span
- Monitor wellness feature effectiveness
- Adjust settings based on child's response
- Use wellness data to understand play patterns

## Future Enhancements

### Planned Features

- More sophisticated eye tracking for attention detection
- Personalized wellness schedules
- Parent dashboard for wellness data
- Integration with physical activity tracking
- Adaptive reminder timing based on child behavior

### Potential Improvements

- Audio reminders for younger children
- Gamified wellness activities
- Social wellness challenges
- Integration with smart home devices
- Biometric feedback (if available)

## Accessibility Considerations

- High contrast options for timer display
- Large, readable text for reminders
- Keyboard navigation support
- Screen reader compatibility
- Customizable timing for children with special needs

## Performance Notes

- Efficient event listener management
- Optimized rendering with React.memo where appropriate
- Proper cleanup of intervals and timeouts
- Asynchronous loading of heavy models (MediaPipe)
- Minimal impact on game performance

## Testing Guidelines

### Unit Tests

- Time tracking accuracy
- Inactivity detection reliability
- Reminder triggering conditions
- State management correctness

### Integration Tests

- Component rendering in game context
- Event listener attachment/removal
- Data flow between components
- Lifecycle management during game start/stop

### User Acceptance Tests

- Child-friendly interface validation
- Appropriate timing of reminders
- Non-disruptive experience
- Parent satisfaction with wellness features

---
*Document Version: 1.0*  
*Last Updated: January 2026*
