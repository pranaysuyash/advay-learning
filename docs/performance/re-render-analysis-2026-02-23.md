# Re-Render Issues Analysis - learning_for_kids

## Date: 2026-02-23

## Overview
Analysis of React re-render issues across the learning_for_kids project, with focus on AlphabetGame and recommendations based on Aiden Bai's performance optimization tools.

---

## Aiden Bai's React Optimization Tools

### 1. Million.js
- **Repo**: https://github.com/aidenybai/million
- **Purpose**: Extremely fast and lightweight optimizing compiler
- **Impact**: Up to 70% faster React components
- **How it works**: Skips diffing steps, O(1) constant time DOM updates instead of O(n)
- **Size**: <4kb
- **Integration**: Zero code rewrite, works with existing React

### 2. React Scan
- **Repo**: https://github.com/aidenybai/react-scan
- **Purpose**: Auto-detect React performance issues
- **Features**:
  - Zero configuration needed
  - Highlights components that need optimization
  - Multiple usage methods: script tag, npm, CLI
  - Visualizes unnecessary re-renders in real-time
  - Tracks props, state, context changes
  - Validates React.memo effectiveness

---

## Current State of Optimization

### AlphabetGame.tsx Analysis

**Stats**:
- Total hooks: 61 instances
- Using `useCallback`: 11+ times
- Using `useMemo`: 0 times
- Wrapped in `React.memo`: YES
- Total lines: ~1800

**Current Optimization Techniques**:
```typescript
// ✅ Already using React.memo
export const AlphabetGame = React.memo(function AlphabetGameComponent() {
  // ...
});

// ✅ Multiple useCallback hooks
const handleTrackingFrame = useCallback(
  (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    latestTrackingFrameRef.current = frame;
  },
  [],
);

const handleCameraError = useCallback(
  (error: Error | string | DOMException) => {
    // ...
  },
  [],
);

// ... 9+ more useCallback instances
```

---

## Identified Re-Render Issues

### 1. **Infinite 401/429 Retry Loop** (CRITICAL - FIXED)

**Location**: `src/frontend/src/services/api.ts:22-49`

**Problem**: Response interceptor attempts token refresh on every 401 error without retry limit, causing infinite loop.

**Impact**:
- Thousands of failed requests
- App hangs on loading states
- User experience completely blocked

**Fix Applied**:
```typescript
// Added _retry flag to prevent infinite loops
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
```

---

### 2. **Profile Fetch Without Error Handling** (HIGH - FIXED)

**Location**: `src/frontend/src/pages/AlphabetGame.tsx:476-509`

**Problem**: Profile fetch attempts on every mount without error handling, causing loading state to persist on failure.

**Impact**:
- App stuck on "Loading your child's profile..." indefinitely
- No recovery path for users
- Fetch retries even when explicitly failed

**Fix Applied**:
```typescript
// Track fetch attempts to prevent retry loop
const [fetchAttempted, setFetchAttempted] = useState(false);

// Only fetch once
useEffect(() => {
  if (profiles.length === 0 && !isProfilesLoading && !fetchAttempted) {
    setFetchAttempted(true);
    fetchProfiles().catch(() => {
      // Error handled in store, prevent retry loop
    });
  }
}, [fetchProfiles, isProfilesLoading, profiles.length, fetchAttempted]);

// Show error state when fetch fails
if (profilesError) {
  return (
    <section className='min-h-[60vh] flex items-center justify-center px-4'>
      <div className='text-center max-w-md'>
        {/* Show error with retry/guest options */}
      </div>
    </section>
  );
}
```

---

### 3. **LSP Hook Dependency Warnings** (MEDIUM)

**Location**: `src/frontend/src/pages/AlphabetGame.tsx:684-706`

**Problem**: React hooks dependencies causing LSP warnings about stability.

**Issues**:
- `stopGame` changes on every re-render (not memoized)
- Should not be used in useCallback dependency arrays

**Status**: Current approach uses direct function calls (acceptable per React docs)

---

## Additional Re-Render Issues to Investigate

### 4. **Large Component Size (1800+ lines)**

**Problem**: AlphabetGame component is too large, making re-renders expensive and hard to optimize.

**Recommendations**:
- Extract sub-components: `GameControls`, `CanvasOverlay`, `ProfileSelector`
- Use `React.memo` for extracted components
- Split into feature modules

### 5. **No useMemo Usage**

**Problem**: No memoization of computed values despite complex calculations.

**Potential Candidates for Memoization**:
```typescript
// Letter calculations (lines 580-590)
const LETTERS = useMemo(() => getLettersForGame(selectedLanguage), [selectedLanguage]);
const currentLetter = useMemo(() => LETTERS[currentLetterIndex] ?? LETTERS[0], [LETTERS, currentLetterIndex]);

// Color calculations
const letterColorClass = useMemo(() => getLetterColorClass(currentLetter.color), [currentLetter.color]);
const accuracyColorClass = useMemo(() =>
  accuracy >= 70 ? 'text-text-success' :
  accuracy >= 40 ? 'text-text-warning' :
  'text-text-error',
  [accuracy]
);

// Game controls arrays
const gameControls = useMemo(() => [
  { id: 'clear', icon: 'x', label: 'Clear', onClick: clearDrawing, variant: 'danger' },
  { id: 'check', icon: 'check', label: 'Check', onClick: checkProgress, variant: 'success' },
  { id: 'skip', icon: 'play', label: 'Skip', onClick: nextLetter, variant: 'primary' },
], [clearDrawing, checkProgress, nextLetter]);
```

### 6. **Store Subscriptions Causing Re-renders**

**Problem**: Multiple Zustand store subscriptions may cause cascading re-renders.

**Current Stores**:
- `useSettingsStore`
- `useAuthStore`
- `useProgressStore`
- `useProfileStore`

**Investigation Needed**:
- Use React DevTools Profiler to identify which stores trigger re-renders
- Consider selector-based subscriptions for partial state updates

### 7. **useEffect Dependencies**

**Problem**: Multiple `useEffect` hooks with complex dependencies may trigger unnecessary re-runs.

**Effects to Review**:
- Line 476: Profile fetch on mount
- Line 505: Profile fetch retry
- Line 513: Profile resolution
- Line 530: Active time tracking
- Line 549: Hydration reminder
- Line 593: Session restore
- Line 609: Session save
- Line 730: Keyboard handler
- Line 734: Letter prompt
- Line 748: Progress queue subscription
- Line 756: Drawing loop

---

## Recommendations

### Immediate Actions (Priority 1)

1. ✅ **Fix infinite 401 retry loop** - COMPLETED
2. ✅ **Fix profile fetch error handling** - COMPLETED
3. 🔲 **Add useMemo for computed values** - PENDING
4. 🔲 **Split AlphabetGame into smaller components** - PENDING

### Medium Priority (Priority 2)

5. 🔲 **Install React Scan** for real-time performance monitoring
6. 🔲 **Profile with React DevTools** to identify hot re-render paths
7. 🔲 **Optimize store subscriptions** with selectors
8. 🔲 **Review and reduce useEffect dependencies**

### Low Priority (Priority 3)

9. 🔲 **Consider Million.js** integration for critical game loops
10. 🔲 **Add performance monitoring** to production builds
11. 🔲 **Create performance regression tests**

---

## Using React Scan

### Installation

```bash
npm install react-scan
# or
yarn add react-scan
```

### Quick Start (Development Only)

Add to `src/frontend/src/main.tsx`:

```typescript
import { scan } from 'react-scan';

scan({
  enabled: import.meta.env.DEV,
  trackUnnecessaryRenders: true,
  animationSpeed: 'fast',
});
```

### CLI Usage (Zero Code Changes)

```bash
npx react-scan@latest http://localhost:6173
```

### Browser Extension

Install from: https://react-scan.dev
- Zero configuration
- Works on any React app
- Real-time component highlighting

---

## Using Million.js

### Installation

```bash
npm install million
# or
yarn add million
```

### Vite Integration

Add to `src/frontend/vite.config.ts`:

```typescript
import million from 'million/compiler';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    million.vite({ auto: true }), // Auto-optimize all components
  ],
});
```

### Manual Block Component

```typescript
import { block } from 'million/react';

const MemoizedComponent = block(function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
});
```

---

## Performance Testing Checklist

- [ ] Install React Scan and identify top re-render offenders
- [ ] Run React DevTools Profiler on AlphabetGame
- [ ] Capture baseline metrics:
  - First contentful paint
  - Time to interactive
  - Component render counts
  - Memory usage
- [ ] Apply optimizations and compare
- [ ] Test with different profile counts (1, 5, 10+)
- [ ] Test on low-end devices/mobile
- [ ] Verify no regressions in other game pages

---

## References

- **Million.js**: https://github.com/aidenybai/million
- **React Scan**: https://github.com/aidenybai/react-scan
- **React Profiler**: https://react.dev/learn/react-developer-tools#profiling-components-with-the-react-profiler
- **usehooks-ts**: https://usehooks-ts.com
- **Aiden Bai's YC Profile**: https://www.ycombinator.com/companies/same

---

**Next Steps**:
1. Install React Scan in development
2. Profile AlphabetGame during gameplay
3. Identify top 5 re-render causes
4. Apply memoization optimizations
5. Consider Million.js for critical paths
