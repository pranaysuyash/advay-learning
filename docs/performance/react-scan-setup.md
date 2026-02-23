# Installing React Scan - Universal Guide

## What is React Scan?
React Scan is Aiden Bai's tool that automatically detects React performance issues and highlights components that need optimization. It requires zero code changes to get started.

**Works with any React app:**
- Vite projects
- Next.js apps
- Create React App
- Any custom React setup

---

## Method 1: Browser Extension (Fastest - Zero Code Changes)

### Steps:
1. Visit: https://react-scan.dev
2. Install browser extension (Chrome, Firefox, Safari, Edge)
3. Open any React app (your localhost:6173 or any other)
4. Click React Scan icon in browser toolbar
5. Interact with your application

### What you'll see:
- 🔴 **Red highlighting**: Unnecessary re-renders
- 🟡 **Yellow highlighting**: Slow renders (>16ms)
- 🟢 **Green highlighting**: Optimized components
- ⚪ **Gray**: Idle components
- Real-time metrics panel in bottom-right

**Pros:**
- ✅ Zero code changes
- ✅ Works on ANY React app (not just yours)
- ✅ No npm install needed
- ✅ Instant feedback

**Cons:**
- ❌ Must install in each browser
- ❌ Can't commit to git
- ❌ May not work in iframe/embedded contexts

---

## Method 2: Script Tag (Quick Integration)

Add to your HTML entry file (development only):

**For Vite/CRA:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your App</title>

    <!-- Add React Scan (development only) -->
    <script src="https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**For Next.js (app directory):**
```typescript
// app/layout.tsx
'use client';

import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Pros:**
- ✅ Quick setup
- ✅ No build configuration
- ✅ Can be conditionally loaded

**Cons:**
- ❌ Script loaded on every page
- ❌ No TypeScript support by default

---

## Method 3: NPM Package (Recommended for Long-term)

### Installation:

```bash
# Any React project
npm install --save-dev react-scan

# With yarn
yarn add -D react-scan

# With pnpm
pnpm add -D react-scan

# With bun
bun add -D react-scan
```

### Vite Integration:

Edit `src/main.tsx` or `src/main.jsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add React Scan import (must be before ReactDOM.render)
import { scan } from 'react-scan';

// Initialize React Scan (development only)
scan({
  enabled: import.meta.env.DEV,
  trackUnnecessaryRenders: true,
  animationSpeed: 'fast',
  showToolbar: true,
  log: false, // Set to true for debugging
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Next.js Integration:

**App Router:**
```typescript
// app/layout.tsx
'use client';

import { scan } from 'react-scan';
import React from 'react';

scan({
  enabled: process.env.NODE_ENV === 'development',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

**Pages Router:**
```typescript
// pages/_app.tsx
import { scan } from 'react-scan';

scan({
  enabled: process.env.NODE_ENV === 'development',
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

### Create React App Integration:

Edit `src/index.js` or `src/index.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { scan } from 'react-scan';

scan({
  enabled: process.env.NODE_ENV === 'development',
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### TypeScript Support:

Create `react-scan.d.ts` in your `src/` directory:

```typescript
declare module 'react-scan' {
  export interface ScanOptions {
    enabled?: boolean;
    trackUnnecessaryRenders?: boolean;
    trackComplexity?: boolean;
    animationSpeed?: 'slow' | 'medium' | 'fast';
    showToolbar?: boolean;
    toolbarPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    log?: boolean;
    include?: string[];
    exclude?: string[];
  }

  export function scan(options: ScanOptions): void;
}
```

Or install type definitions:
```bash
npm install --save-dev @types/react-scan
```

**Pros:**
- ✅ Git-tracked configuration
- ✅ TypeScript support
- ✅ Team-wide consistency
- ✅ Fine-grained control

**Cons:**
- ❌ Requires build setup
- ❌ Must update when upgrading

---

## Method 4: CLI (Zero Installation - Perfect for Audits)

```bash
# Scan any running React app
npx react-scan@latest http://localhost:6173
npx react-scan@latest http://localhost:3000
npx react-scan@latest https://your-production-app.com

# Scan with custom options
npx react-scan@latest --port=6173 --include='**/*.{tsx,ts,jsx,js}'

# Scan and generate report
npx react-scan@latest http://localhost:6173 --report

# Scan in CI/CD
npx react-scan@latest http://localhost:6173 --threshold=10 --fail
```

**Pros:**
- ✅ Zero installation
- ✅ Works on ANY React app
- ✅ Great for one-time audits
- ✅ Can use in CI/CD

**Cons:**
- ❌ Not persistent
- ❌ Must re-run on each session
- ❌ No hot reload integration

---

## Configuration Options

### Full Options:

```typescript
scan({
  // Enable/disable scanning
  enabled: true,

  // Track unnecessary renders
  trackUnnecessaryRenders: true,

  // Track component complexity
  trackComplexity: true,

  // Animation speed
  animationSpeed: 'fast', // 'slow' | 'medium' | 'fast'

  // Show floating toolbar
  showToolbar: true,

  // Toolbar position
  toolbarPosition: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

  // Log to console
  log: false,

  // Only include specific files
  include: ['src/**/*.{tsx,ts}'],

  // Exclude specific files
  exclude: ['node_modules/**', 'src/**/*.test.{tsx,ts}'],

  // Threshold for reporting (ms)
  reportThreshold: 10,

  // Fail build if threshold exceeded
  failOnThreshold: false,
});
```

---

## Using with Multiple Projects

### Project 1: Vite React App
```bash
cd project1-vite
npm install --save-dev react-scan
# Add to src/main.tsx as shown above
```

### Project 2: Next.js App
```bash
cd project2-nextjs
npm install --save-dev react-scan
# Add to app/layout.tsx as shown above
```

### Project 3: CRA App
```bash
cd project3-cra
npm install --save-dev react-scan
# Add to src/index.js as shown above
```

### Auditing Any Project (CLI):
```bash
# No installation needed!
npx react-scan@latest http://localhost:3000
npx react-scan@latest https://example.com
npx react-scan@latest file:///path/to/build/index.html
```

---

## Best Practices

### Development:
- ✅ Always enable in development builds
- ✅ Use different colors for different teams/components
- ✅ Set meaningful thresholds for your app
- ✅ Document findings in GitHub issues

### Production:
- ❌ Never enable in production (security + performance)
- ❌ Don't commit auto.global.js to git
- ✅ Use conditional loading: `enabled: import.meta.env.DEV`

### Team Workflow:
1. Developer opens PR
2. CI runs `npx react-scan` on preview build
3. If regression detected, CI fails
4. Developer fixes issues
5. Re-scan and verify

---

## Troubleshooting

### React Scan not showing:
- Check you're in development mode
- Verify React is mounted (`document.getElementById('root')`)
- Check browser console for errors
- Try CLI: `npx react-scan@latest http://localhost:YOUR_PORT`

### Too many re-renders highlighted:
- Normal for development!
- Focus on hottest (red) components
- Some may be intentional (animations, timers)

### Performance impact:
- Adds ~5% overhead in development
- Only use in dev builds
- Always disable in production

### Next.js specific:
- Add `'use client'` to layout
- Ensure scan() is called at module level
- Check Next.js version compatibility

### TypeScript errors:
- Add `@types/react-scan` or create declaration file
- Check react-scan version supports your TS version
- Update react-scan: `npm update react-scan`

---

## Integration Examples

### learning_for_kids (This Project):
```typescript
// src/frontend/src/main.tsx
import { scan } from 'react-scan';

scan({
  enabled: import.meta.env.DEV,
  trackUnnecessaryRenders: true,
  animationSpeed: 'fast',
  showToolbar: true,
});
```

### Generic React Project:
```typescript
// src/index.tsx
import { scan } from 'react-scan';

scan({
  enabled: process.env.NODE_ENV === 'development',
  trackUnnecessaryRenders: true,
});
```

### Next.js 14+ App Router:
```typescript
// app/layout.tsx
'use client';

import { scan } from 'react-scan';

scan({ enabled: process.env.NODE_ENV === 'development' });
```

---

## Related Tools

### Million.js:
- Complement to React Scan
- Optimizes React at build time
- Up to 70% performance improvement
- Works with React Scan for full optimization

### React DevTools Profiler:
- Built-in to React DevTools
- Records interactions
- Flame graph visualization
- Use alongside React Scan

---

## References

- **React Scan**: https://github.com/aidenybai/react-scan
- **Official Docs**: https://react-scan.dev
- **Million.js**: https://github.com/aidenybai/million
- **Aiden Bai**: https://github.com/aidenybai
- **React DevTools**: https://react.dev/learn/react-developer-tools

---

## Method 3: NPM Package (Recommended for Long-term)

### Installation:

```bash
cd src/frontend
npm install --save-dev react-scan
```

### Integration:

Edit `src/frontend/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Add React Scan import
import { scan } from 'react-scan';

// Initialize React Scan (development only)
scan({
  enabled: import.meta.env.DEV,
  trackUnnecessaryRenders: true,
  animationSpeed: 'fast',
  showToolbar: true,
  log: true, // Log to console for debugging
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### TypeScript Support:

Create `src/frontend/src/react-scan.d.ts`:

```typescript
declare module 'react-scan' {
  export interface ScanOptions {
    enabled?: boolean;
    trackUnnecessaryRenders?: boolean;
    animationSpeed?: 'slow' | 'medium' | 'fast';
    showToolbar?: boolean;
    log?: boolean;
  }

  export function scan(options: ScanOptions): void;
}
```

---

## Method 4: CLI (Zero Installation)

```bash
# Scan running development server
npx react-scan@latest http://localhost:6173

# Scan specific route
npx react-scan@latest http://localhost:6173/games/alphabet-tracing

# Scan with custom port
npx react-scan@latest http://localhost:3000
```

---

## Analyzing AlphabetGame with React Scan

### Test Scenarios:

1. **Initial Load**:
   - Visit http://localhost:6173/games/alphabet-tracing
   - Check how many components re-render on mount
   - Note loading state re-renders

2. **Start Game**:
   - Click "Start Learning!" button
   - Watch re-render cascade
   - Identify components that re-render unnecessarily

3. **Drawing Action**:
   - Draw letters on canvas
   - Observe re-renders per frame
   - Check if GameContainer re-renders on every draw event

4. **Language Switch**:
   - Change language selector
   - Verify only necessary components re-render
   - Check if LETTERS array is memoized

5. **Wellness Reminders**:
   - Trigger wellness reminder (wait or simulate)
   - Check if modals cause full re-renders

### Key Metrics to Watch:

- **Render Count**: How many times does each component render?
- **Render Time**: How long does each render take?
- **Why Re-render**: What changed? (props/state/context)
- **Unnecessary Renders**: Components rendering without changes?

---

## Interpreting Results

### Color Legend:
- 🔴 **Red**: Unnecessary re-render (prime optimization target)
- 🟡 **Yellow**: Slow render (>16ms = dropped frame)
- 🟢 **Green**: Optimized render (good!)
- ⚪ **Gray**: Not rendering (idle)

### Common Patterns:

1. **Cascading Re-renders**:
   ```
   Parent -> Child -> Grandchild
   🔴     🔴         🔴
   ```
   Fix: Memoize children with React.memo

2. **Prop Drilling**:
   ```
   Top -> ... -> ... -> Bottom
   🔴              🔴         🔴
   ```
   Fix: Use Context or state management

3. **Function Re-creation**:
   ```
   Component renders
   new function created
   child receives new prop
   child re-renders
   ```
   Fix: Wrap with useCallback

4. **Object Re-creation**:
   ```
   Component renders
   new object created
   child receives new prop
   child re-renders
   ```
   Fix: Wrap with useMemo

---

## AlphabetGame Optimization Targets

### High Priority (Based on Code Analysis):

1. **Letter Calculations** (Lines 580-590):
   ```typescript
   // BEFORE: Re-calculated on every render
   const LETTERS = getLettersForGame(selectedLanguage);
   const currentLetter = LETTERS[currentLetterIndex] ?? LETTERS[0];

   // AFTER: Memoized
   const LETTERS = useMemo(() => getLettersForGame(selectedLanguage), [selectedLanguage]);
   const currentLetter = useMemo(() => LETTERS[currentLetterIndex] ?? LETTERS[0], [LETTERS, currentLetterIndex]);
   ```

2. **Color Class Calculations** (Lines 584-590):
   ```typescript
   // BEFORE: Re-calculated on every render
   const letterColorClass = getLetterColorClass(currentLetter.color);
   const accuracyColorClass =
     accuracy >= 70 ? 'text-text-success' :
     accuracy >= 40 ? 'text-text-warning' :
     'text-text-error';

   // AFTER: Memoized
   const letterColorClass = useMemo(() => getLetterColorClass(currentLetter.color), [currentLetter.color]);
   const accuracyColorClass = useMemo(() =>
     accuracy >= 70 ? 'text-text-success' :
     accuracy >= 40 ? 'text-text-warning' :
     'text-text-error',
     [accuracy]
   );
   ```

3. **Game Controls Array** (Lines 1134-1157):
   ```typescript
   // BEFORE: New array on every render
   const gameControls: GameControl[] = [
     { id: 'clear', icon: 'x', label: 'Clear', onClick: clearDrawing, variant: 'danger' },
     { id: 'check', icon: 'check', label: 'Check', onClick: checkProgress, variant: 'success' },
     { id: 'skip', icon: 'play', label: 'Skip', onClick: nextLetter, variant: 'primary' },
   ];

   // AFTER: Memoized
   const gameControls = useMemo(() => [
     { id: 'clear', icon: 'x', label: 'Clear', onClick: clearDrawing, variant: 'danger' },
     { id: 'check', icon: 'check', label: 'Check', onClick: checkProgress, variant: 'success' },
     { id: 'skip', icon: 'play', label: 'Skip', onClick: nextLetter, variant: 'primary' },
   ], [clearDrawing, checkProgress, nextLetter]);
   ```

### Medium Priority:

4. **Session Persistence** (Lines 593-628):
   - Session data object recreated on every save
   - Consider debouncing saves

5. **Progress Queue Subscription** (Lines 747-753):
   - Check if progressQueue causes re-renders
   - Consider using shallow comparison

### Low Priority:

6. **Wellness Timers** (Lines 530-566):
   - Timer logic may cause frequent state updates
   - Consider throttling UI updates

---

## Next Steps

1. ✅ Install React Scan using Method 1 (Browser Extension) - Quickest
2. ✅ Open AlphabetGame and perform test scenarios
3. ✅ Identify top 3 re-render causes
4. ✅ Apply useMemo optimizations to targets above
5. ✅ Verify improvements with React Scan
6. 🔲 Consider Million.js for critical game loops
7. 🔲 Document findings in performance audit

---

## Troubleshooting

### React Scan not showing:
- Ensure you're in development mode (`import.meta.env.DEV` is true)
- Check browser console for errors
- Try CLI method: `npx react-scan@latest http://localhost:6173`

### Too many re-renders highlighted:
- This is normal for development!
- Focus on the hottest (red) components first
- Some re-renders may be intentional (animations, timers)

### Performance impact:
- React Scan adds minimal overhead (~5%)
- Only use in development
- Disable in production builds

---

## References

- **React Scan**: https://github.com/aidenybai/react-scan
- **Official Docs**: https://react-scan.dev
- **Million.js**: https://github.com/aidenybai/million
- **Aiden Bai's Twitter**: @aidenybai
