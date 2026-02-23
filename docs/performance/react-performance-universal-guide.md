# React Performance Optimization Guide - Universal

**Last Updated**: 2026-02-23

This guide provides universal React performance optimization techniques using Aiden Bai's tools that work across ALL React projects (Vite, Next.js, CRA, or custom setups).

---

## Quick Start: 3-Step Performance Fix

### Step 1: Install React Scan (2 minutes)
```bash
# Any React project
npm install --save-dev react-scan

# Or zero-install via CLI (works on any app!)
npx react-scan@latest http://localhost:YOUR_PORT
```

### Step 2: Enable in Development
```typescript
// src/main.tsx or equivalent
import { scan } from 'react-scan';

scan({
  enabled: import.meta.env.DEV, // or process.env.NODE_ENV === 'development'
  trackUnnecessaryRenders: true,
  animationSpeed: 'fast',
});
```

### Step 3: Identify and Fix Top Issues
1. Open your app in browser
2. Look for 🔴 red highlighted components
3. Apply optimizations:
   - `useMemo` for computed values
   - `useCallback` for functions
   - `React.memo` for components
   - Split large components

---

## Core Performance Principles

### Why React Re-renders?

React components re-render when:
1. **State changes**: `useState` or `useReducer`
2. **Props change**: Parent re-renders
3. **Context changes**: Provider value updates
4. **Hook dependencies change**: `useEffect`, `useMemo`, etc.

**Common misconception**: Props alone don't cause re-renders. Only parent re-renders propagate to children.

### Optimization Strategies

#### 1. Memoize Computed Values (`useMemo`)

**When to use**:
- Expensive calculations (filtering 1000+ items)
- Derived state (computed from other state)
- Object/array literals passed to children

**Example**:
```typescript
// ❌ BAD: Re-calculated on every render
const filtered = items.filter(i => i.active);
const sorted = filtered.sort((a, b) => a.date - b.date);

// ✅ GOOD: Only recalculated when items changes
const filtered = useMemo(() => items.filter(i => i.active), [items]);
const sorted = useMemo(() => filtered.sort((a, b) => a.date - b.date), [filtered]);
```

#### 2. Memoize Functions (`useCallback`)

**When to use**:
- Functions passed as props to memoized children
- Event handlers passed to multiple components
- Functions used in `useEffect` dependencies

**Example**:
```typescript
// ❌ BAD: New function on every render
const handleClick = () => {
  console.log('clicked');
};
return <Button onClick={handleClick} />; // Button re-renders on parent update

// ✅ GOOD: Stable function reference
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
return <Button onClick={handleClick} />; // Button only re-renders when onClick changes
```

#### 3. Memoize Components (`React.memo`)

**When to use**:
- Components that re-render often
- Components with expensive renders
- List items in large lists

**Example**:
```typescript
// ❌ BAD: Re-renders on every parent update
export function ExpensiveComponent({ data }: Props) {
  return <ComplexGraph data={data} />;
}

// ✅ GOOD: Only re-renders when props change
export const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }: Props) {
  return <ComplexGraph data={data} />;
});
```

#### 4. Context Optimization

**Problem**: Context consumers re-render on ANY provider value change.

**Solution**: Split contexts and memoize context values:

```typescript
// ❌ BAD: Single context causes cascade
const App = () => {
  const [user, setUser] = useState();
  const [theme, setTheme] = useState();
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      <Child />
    </AppContext.Provider>
  );
}; // Child re-renders when user OR theme changes

// ✅ GOOD: Split contexts
const App = () => {
  const [user, setUser] = useState();
  const [theme, setTheme] = useState();
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Child />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}; // Child only re-renders when user changes
```

---

## Common Patterns & Solutions

### Pattern 1: Derived State

```typescript
// ❌ BAD
const [firstName, setFirstName] = useState();
const [lastName, setLastName] = useState();
const fullName = `${firstName} ${lastName}`; // Recalculated on every render

// ✅ GOOD
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
```

### Pattern 2: List Filtering

```typescript
// ❌ BAD
const visibleTodos = todos.filter(t => !t.completed); // Re-filtered on every render

// ✅ GOOD
const visibleTodos = useMemo(() => todos.filter(t => !t.completed), [todos]);
```

### Pattern 3: Object Literals as Props

```typescript
// ❌ BAD - New object on every render
<Component options={{ option1: 'a', option2: 'b' }} />

// ✅ GOOD - Stable object
const options = useMemo(() => ({ option1: 'a', option2: 'b' }), []);
<Component options={options} />
```

### Pattern 4: Large Component Split

```typescript
// ❌ BAD - 2000-line component re-renders entirely
export const BigComponent = () => {
  // 1000 lines of state
  // 1000 lines of UI
  return <div>...</div>;
};

// ✅ GOOD - Split into focused components
export const BigComponent = () => {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  return (
    <Section1 state={state1} onChange={setState1} />
    <Section2 state={state2} onChange={setState2} />
  );
};
```

---

## Aiden Bai's Tools

### React Scan
- **Purpose**: Auto-detect performance issues
- **Repo**: https://github.com/aidenybai/react-scan
- **Install**: `npm install --save-dev react-scan`
- **Usage**: See `/docs/performance/react-scan-setup.md`

### Million.js
- **Purpose**: Compile-time React optimization
- **Repo**: https://github.com/aidenybai/million
- **Impact**: Up to 70% faster
- **Install**: `npm install million`

---

## Integration Examples

### Vite (learning_for_kids)
```typescript
// src/main.tsx
import { scan } from 'react-scan';

scan({
  enabled: import.meta.env.DEV,
});

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

### Next.js (App Router)
```typescript
// app/layout.tsx
'use client';

import { scan } from 'react-scan';

scan({ enabled: process.env.NODE_ENV === 'development' });

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

### Create React App
```typescript
// src/index.js
import { scan } from 'react-scan';

scan({ enabled: process.env.NODE_ENV === 'development' });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

---

## Performance Checklist

### Before Optimization
- [ ] Install React Scan
- [ ] Run app and identify 🔴 red components
- [ ] Document baseline metrics (render time, count)

### During Optimization
- [ ] Add `useMemo` for computed values
- [ ] Add `useCallback` for stable functions
- [ ] Add `React.memo` for expensive components
- [ ] Split large components (>500 lines)
- [ ] Optimize context providers

### After Optimization
- [ ] Re-run React Scan
- [ ] Verify 🔴 issues resolved
- [ ] Compare performance metrics
- [ ] Test functionality still works
- [ ] Remove React Scan from production build

---

## Common Pitfalls

### 1. Over-Memoization
```typescript
// ❌ BAD: useMemo for simple math
const result = useMemo(() => a + b, [a, b]); // Overhead > benefit

// ✅ GOOD: useMemo for expensive computation
const result = useMemo(() => complexCalculation(data), [data]);
```

### 2. Missing Dependencies
```typescript
// ❌ BAD: Excluding dependencies
const handleClick = useCallback(() => {
  console.log(count); // Stale closure!
}, []);

// ✅ GOOD: Include all dependencies
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
```

### 3. False Dependencies
```typescript
// ❌ BAD: Including everything
useEffect(() => {
  fetchData();
}, [fetchData, component]); // Causes infinite loop

// ✅ GOOD: Only necessary dependencies
useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 4. Conditional Hooks
```typescript
// ❌ BAD: Hook inside condition
if (isLoading) {
  const data = useData(); // VIOLATES HOOKS RULE!
}

// ✅ GOOD: Always call hooks
const data = useData();
if (isLoading) {
  return <Loading />;
}
return <div>{data}</div>;
```

---

## Measuring Impact

### Using React Scan
1. Open app with React Scan enabled
2. Note count of 🔴 red components
3. Apply optimizations
4. Re-count 🔴 components
5. Goal: 0-5 red components

### Using React DevTools Profiler
1. Open React DevTools → Profiler tab
2. Click record
3. Perform actions (click, type, navigate)
4. Stop recording
5. Review flame graph for hot paths

### Key Metrics
- **Render time**: <16ms for 60fps
- **Render count**: <10 per interaction
- **Component size**: <500 lines per file
- **Bundle size**: <200KB gzipped

---

## Production Considerations

### React Scan
```typescript
// ❌ BAD: Always enabled
scan({ enabled: true });

// ✅ GOOD: Only in development
scan({ enabled: process.env.NODE_ENV === 'development' });
```

### Why Disable in Production?
- Security: Exposes component internals
- Performance: Adds ~5% overhead
- Bundle size: Adds to production bundle

### Tree-shaking
```typescript
// Use dynamic import to tree-shake dev-only code
if (import.meta.env.DEV) {
  const { scan } = await import('react-scan');
  scan({ enabled: true });
}
```

---

## Additional Resources

### Official Docs
- [React Profiler](https://react.dev/learn/react-developer-tools#profiling-components-with-the-react-profiler)
- [React.memo](https://react.dev/reference/react/memo)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)

### Aiden Bai's Projects
- [Million.js](https://github.com/aidenybai/million)
- [React Scan](https://github.com/aidenybai/react-scan)
- [usehooks-ts](https://usehooks-ts.com)

### Community Resources
- [React Performance](https://react.dev/learn/render-and-commit)
- [Why React Re-renders](https://juejin.cn/post/7162717557235908644)
- [100% Correct React Hooks](https://github.com/davidg-xyz/hooks)

---

## Quick Reference

```typescript
// Memoize computed value
const value = useMemo(() => expensiveCalc(a, b), [a, b]);

// Memoize function
const fn = useCallback(() => doSomething(a, b), [a, b]);

// Memoize component
const Component = React.memo(function Component({ prop }) {
  return <div>{prop}</div>;
});

// Memoize array of controls
const controls = useMemo(() => [
  { id: '1', onClick: handler1 },
  { id: '2', onClick: handler2 },
], [handler1, handler2]);

// Memoize object
const options = useMemo(() => ({ opt1, opt2 }), []);

// Enable React Scan
import { scan } from 'react-scan';
scan({ enabled: import.meta.env.DEV });
```

---

**Project-Specific Notes**:
- This file documents universal patterns applicable to ANY React project
- For learning_for_kids specific optimizations, see `re-render-analysis-2026-02-23.md`
- For React Scan setup, see `react-scan-setup.md`
