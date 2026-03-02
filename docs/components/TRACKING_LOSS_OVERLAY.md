# TrackingLossOverlay Component

**Status**: Implemented  
**Ticket**: ISSUE-002  
**Date**: 2026-03-02

## Purpose

Provides a standardized UI for handling camera hand tracking loss in games. Prevents "frozen confusion" by clearly communicating the issue and offering recovery options.

## Requirements

From `docs/audit/GAME_INPUT_AGE_AUDIT_2026-02-28.md` Section 9 APP-002:
- Tracking loss shows pause overlay within 1s
- No silent freeze
- Retry camera option
- Fallback to tap mode option (when available)

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isVisible` | boolean | Yes | Whether overlay is displayed |
| `onRetryCamera` | () => void | Yes | Called when user wants to retry camera |
| `onSwitchToTapMode` | () => void | No | Called to switch to tap/dwell controls |
| `lossDurationMs` | number | No | How long tracking has been lost (for display) |
| `fallbackAvailable` | boolean | No | Whether tap fallback is available |

## Usage

```tsx
import { TrackingLossOverlay } from '@/components/game/TrackingLossOverlay';
import { useGameHandTracking } from '@/hooks/useGameHandTracking';

function MyGame() {
  const { 
    isReady, 
    trackingLoss,
    // ... other tracking props
  } = useGameHandTracking({
    gameName: 'MyGame',
  });

  return (
    <>
      {/* Game content */}
      
      <TrackingLossOverlay
        isVisible={trackingLoss.isLost}
        onRetryCamera={trackingLoss.retry}
        onSwitchToTapMode={() => setUseFallbackMode(true)}
        lossDurationMs={trackingLoss.durationMs}
        fallbackAvailable={fallbackEnabled}
      />
    </>
  );
}
```

## Behavior

1. **Auto-show tips**: After 3 seconds of tracking loss, helpful tips fade in
2. **Progressive disclosure**: 
   - Primary: Retry camera (green button)
   - Secondary: Switch to tap mode (amber button, if available)
   - Tertiary: Exit to games (neutral button)
3. **Reassurance**: Always shows "Your progress is saved!"
4. **Mascot state**: Shows confused mascot that changes message based on duration

## Accessibility

- High contrast buttons (WCAG AA compliant)
- Large touch targets (64px minimum)
- Clear visual hierarchy
- Icon + text on all buttons

## Related

- `useGameHandTracking` hook - Provides tracking loss detection
- `GamePauseModal` - Standard pause UI (shares visual design)
- Feature flag: `safety.pauseOnTrackingLoss` (default: true)
