# Fallback Controls System

**Status**: Implemented  
**Ticket**: ISSUE-001  
**Date**: 2026-03-02

## Purpose

Provides tap/dwell/snap fallback controls for camera-based games, enabling gameplay when:
- Camera is unavailable or permission denied
- Hand tracking fails
- User prefers touch/mouse input
- Device lacks camera

## Requirements

From `docs/audit/GAME_INPUT_AGE_AUDIT_2026-02-28.md` Section 9 APP-001:
- Every CV game can complete core loop without camera in ≤2 interactions
- Dwell time: 350-500ms (child-appropriate)
- Snap radius: 24-40px age-adaptive
- Feature flag: `controls.fallbackV1`

## Architecture

```
Game Page
    │
    ├── useGameHandTracking (camera controls)
    │   └── trackingLoss state
    │
    └── useFallbackControls (fallback controls)
        ├── DwellTarget (visual targets)
        └── FallbackCursor (visual cursor)
```

## Components

### useFallbackControls Hook

```tsx
import { useFallbackControls } from '@/hooks/useFallbackControls';

const {
  cursor,
  isDwelling,
  dwellProgress,
  snappedTargetId,
  handlers,
  enable,
  disable,
} = useFallbackControls({
  enabled: fallbackEnabled,
  dwell: { dwellTimeMs: 400 },
  snap: { 
    snapRadiusPx: 32, 
    targets: [{ x: 100, y: 200, id: 'target-1' }] 
  },
  onDwellSelect: (targetId) => handleSelection(targetId),
  containerRef: gameContainerRef,
});
```

### DwellTarget Component

```tsx
import { DwellTarget } from '@/components/game/DwellTarget';

<DwellTarget
  id="letter-a"
  x={200}
  y={300}
  size={80}
  isDwelling={snappedTargetId === 'letter-a' && isDwelling}
  dwellProgress={dwellProgress}
  isSnapped={snappedTargetId === 'letter-a'}
  onClick={() => handleSelection('letter-a')}
>
  A
</DwellTarget>
```

### FallbackCursor Component

```tsx
import { FallbackCursor } from '@/components/game/FallbackCursor';

<FallbackCursor
  position={cursor}
  isVisible={fallbackActive}
  isDwelling={isDwelling}
  dwellProgress={dwellProgress}
  highContrast={true}
/>
```

## Integration Pattern

```tsx
function GamePage() {
  const gameRef = useRef<HTMLDivElement>(null);
  const fallbackEnabled = useFeatureFlag('controls.fallbackV1');
  const [useFallback, setUseFallback] = useState(false);
  
  const {
    isReady,
    trackingLoss,
    cursor: handCursor,
    // ... other hand tracking
  } = useGameHandTracking({ gameName: 'MyGame' });

  const {
    cursor: fallbackCursor,
    isDwelling,
    dwellProgress,
    snappedTargetId,
    handlers,
  } = useFallbackControls({
    enabled: useFallback,
    dwell: { dwellTimeMs: 400 },
    snap: { snapRadiusPx: 40, targets: gameTargets },
    onDwellSelect: handleTargetSelect,
    containerRef: gameRef,
  });

  // Switch to fallback when tracking lost
  useEffect(() => {
    if (trackingLoss.isLost && fallbackEnabled) {
      setUseFallback(true);
    }
  }, [trackingLoss.isLost, fallbackEnabled]);

  return (
    <div 
      ref={gameRef}
      {...(useFallback ? handlers : {})}
    >
      {/* Game content */}
      
      <TrackingLossOverlay
        isVisible={trackingLoss.isLost && !useFallback}
        onRetryCamera={() => {
          trackingLoss.retry();
          setUseFallback(false);
        }}
        onSwitchToTapMode={() => setUseFallback(true)}
        fallbackAvailable={fallbackEnabled}
      />

      {!useFallback && <GameCursor cursor={handCursor} />}
      {useFallback && (
        <FallbackCursor
          position={fallbackCursor}
          isVisible={true}
          isDwelling={isDwelling}
          dwellProgress={dwellProgress}
        />
      )}
    </div>
  );
}
```

## Age-Adapted Defaults

| Age Band | Dwell Time | Snap Radius | Target Size |
|----------|------------|-------------|-------------|
| A (2-3)  | 500ms      | 48px        | 80px        |
| B (3-4)  | 450ms      | 40px        | 72px        |
| C (4-6)  | 400ms      | 32px        | 64px        |
| D (6-8)  | 350ms      | 24px        | 56px        |

## Accessibility

- All interactions work with single pointer (mouse, touch, stylus)
- High contrast mode available
- Visual feedback for dwell progress
- No precision required (snap targets)
- Works with screen readers (target labels)

## Feature Flag

```tsx
const fallbackEnabled = useFeatureFlag('controls.fallbackV1');
```

- Default: `false` (camera-first)
- When `true`: Games show fallback option on tracking loss

## Testing

```bash
# Unit tests
npm run test -- useFallbackControls --run

# Integration
# 1. Start game with camera
# 2. Block camera (cover lens or deny permission)
# 3. Verify TrackingLossOverlay appears
# 4. Click "Switch to Tap Mode"
# 5. Verify FallbackCursor appears
# 6. Hover over target, verify dwell ring animates
# 7. Verify target selects after dwell time or click
```

## Migration Guide

To add fallback controls to an existing game:

1. Add `useFallbackControls` hook
2. Wrap game container with pointer handlers
3. Add `DwellTarget` components for interactive elements
4. Add `FallbackCursor` component
5. Integrate with `TrackingLossOverlay`
6. Test with `controls.fallbackV1` flag enabled

## Related

- `TrackingLossOverlay` - UI for camera loss recovery
- `useGameHandTracking` - Camera-based controls
- Feature flag: `controls.fallbackV1`
