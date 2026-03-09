# Analytics Testing Pattern

**Date:** 2026-03-08  
**Status:** Validated with 6 tests  
**Use Case:** Testing module-level analytics functions with hidden state

## The Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as analytics from '@/analytics';  // Or relative path: '../index'

// Mock the entire module
vi.mock('@/analytics', () => ({
  logEvent: vi.fn(),
  startSession: vi.fn(),
  endSession: vi.fn(),
  getActiveSession: vi.fn(),
}));

describe('Game with Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log event on action', () => {
    // Arrange
    vi.mocked(analytics.logEvent).mockReturnValue(undefined);

    // Act
    myGameFunction();

    // Assert
    expect(analytics.logEvent).toHaveBeenCalledWith(
      'expected_event_type',
      expect.objectContaining({ expected: 'payload' })
    );
  });
});
```

## Key Insights

### 1. Import Path Matters
- **Use relative imports** in test files: `import * as analytics from '../index'`
- `@/analytics` alias doesn't resolve during vitest module mocking
- Pattern verified: `vi.mock('../index', ...)` works correctly

### 2. vi.mocked() for Type Safety
```typescript
// Gives you typed access to mock methods
vi.mocked(analytics.logEvent).mockReturnValue(undefined);
vi.mocked(analytics.logEvent).mockResolvedValue(data);  // For async
```

### 3. beforeEach(vi.clearAllMocks())
Essential for test isolation. Without this, mock call counts persist across tests.

## Real-World Example: CV Error Logging

```typescript
// In countingCollectathonLogic.test.ts
import * as analytics from '@/analytics';

vi.mock('@/analytics', () => ({
  logEvent: vi.fn(),
}));

describe('NaN Validation', () => {
  it('should log CV error for NaN input', () => {
    vi.mocked(analytics.logEvent).mockReturnValue(undefined);
    
    const state = createInitialState();
    updatePlayerPosition(state, NaN, DEFAULT_CONFIG);
    
    expect(analytics.logEvent).toHaveBeenCalledWith(
      'cv_input_error',
      expect.objectContaining({
        game: 'counting-collectathon',
        field: 'handX',
        value: 'NaN',
      })
    );
  });
});
```

## When to Use This Pattern

| Scenario | Pattern | Example |
|----------|---------|---------|
| Module-level function | `vi.mock()` | `logEvent()`, `startSession()` |
| Class method | `vi.spyOn()` | `new Analytics().track()` |
| Dependency injection | Pass mock as param | `(logger: Logger) => {...}` |

## Limitations

1. **Mock doesn't implement default values**
   - Real `logEvent` adds `{}` as default payload
   - Mock records whatever was passed

2. **Module state is mocked, not tested**
   - `activeSession` internal state is hidden
   - Tests verify calls, not internal behavior

3. **Async timing**
   - If `logEvent` had side effects, mock won't capture them
   - Use `waitFor()` or `act()` for async assertions

## Next Steps (Phase 3 Telemetry)

1. Implement `recordCVError()` in `analytics/extensions/countingCollectathon.ts`
2. Replace `console.warn` with `recordCVError()` call
3. Add test using this pattern to verify event is logged
4. Repeat for Shape Safari

## References

- Test file: `src/analytics/__tests__/mockPattern.test.ts`
- Vitest docs: https://vitest.dev/api/vi.html#vi-mock
- Example usage: `src/hooks/useFeatureDetection.test.ts`
