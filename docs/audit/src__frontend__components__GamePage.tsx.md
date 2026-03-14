# Audit: `src/frontend/src/components/GamePage.tsx`

**Date**: 2026-03-14
**Auditor**: Codex
**Ticket**: TCK-20260314-004

---

## File Info

- **Path**: `src/frontend/src/components/GamePage.tsx`
- **Type**: React component (TSX)
- **Purpose**: Central game-page wrapper providing score/level context, error boundary, subscription gating, progress saving, and inventory-drop integration
- **Confidence**: High — read file + test + all 4 consumed hooks

---

## Findings

### F1: Error Boundary Lacks Monitoring Integration
- **Type**: observability, DX
- **Severity**: medium
- **Origin**: explicit (line 82 comment: "we could log to monitoring here")
- **Evidence**: `componentDidCatch` only does `console.error`
- **Why open**: Production render errors invisible; silent crashes lose trust in kids' app
- **Fix**: Wire to `trackLaunchEvent('game_render_error', ...)`

### F2: `GameErrorScreen` Uses Full Page Reload
- **Type**: UX, performance
- **Severity**: medium
- **Origin**: explicit (line 53: `window.location.reload()`)
- **Evidence**: "Reload" button triggers hard reload destroying all client state
- **Why open**: SPA should recover without full page reload; jarring for children
- **Fix**: Implement React-level error recovery (reset error boundary + reinit refs)

### F3: No Visual Feedback During Progress Save
- **Type**: UX
- **Severity**: medium
- **Origin**: implicit (no loading indicator for save state)
- **Evidence**: `submittingRef` guards double-submit but nothing reflects this in UI
- **Why open**: Child clicks "Finish", nothing visibly happens; could cause repeated clicks
- **Fix**: Expose `isSubmitting` via context for loading indicator

### F4: `handleFinish` Does Not Navigate After Save
- **Type**: UX, architecture
- **Severity**: medium
- **Origin**: explicit (line 192: "navigation should be handled by caller")
- **Evidence**: Context exposes `handleFinish` but no `onComplete` callback; inconsistent flows
- **Why open**: Every game must independently implement post-save navigation
- **Fix**: Add `onComplete` callback prop to `GamePageProps`

### F5: `startTimeRef` Never Resets
- **Type**: bug risk
- **Severity**: medium
- **Origin**: inferred (reasonable from line 124: `useRef(Date.now())` set once)
- **Evidence**: Duration accumulates from mount time for multi-round games
- **Why open**: Game duration analytics inflated for replay scenarios
- **Fix**: Reset timer on each `handleFinish` cycle

### F6: `setScore`/`setCurrentLevel` Missing from `useMemo` Deps
- **Type**: correctness, maintainability
- **Severity**: low
- **Origin**: observed (line 197-200)
- **Evidence**: `ctxValue` memo excludes setters; works today because `useCallback([])` is stable, but fragile
- **Why open**: Violates exhaustive-deps principle; future maintainers may break
- **Fix**: Add to dependency array for defensive correctness

### F7: Test Coverage Gaps
- **Type**: testing
- **Severity**: medium
- **Origin**: observed (only 1 test, 65 lines)
- **Evidence**: No tests for: access denied, error boundary, save failure, double-submit, `reportSession=false`
- **Why open**: Core error paths and access gating untested
- **Fix**: Add tests for access denied, error boundary, save failure, double-submit guard

### F8: `reportSession` Prop Not Forwarded to `GameContainer`
- **Type**: consistency, bug risk
- **Severity**: low
- **Origin**: observed (GamePage.tsx:103 vs GameContainer.tsx:21)
- **Evidence**: `GamePage` accepts `reportSession` but only uses it for `showScore` display; `GameContainer` has its own `reportSession` controlling session progress reporting — always defaults to `true`
- **Why open**: Setting `reportSession={false}` hides score but session still reported
- **Fix**: Forward prop or rename to clarify distinct purposes

### F9: Loading Spinner Missing Accessible Label
- **Type**: accessibility
- **Severity**: low
- **Origin**: observed (lines 207-213)
- **Evidence**: Spinner has `role='status'` but no `aria-label`; screen readers hear nothing
- **Why open**: WCAG requires status messages to have accessible names
- **Fix**: Add `aria-label='Loading game…'`

### F10: eslint-disable Comment Indicates Architectural Tension
- **Type**: maintainability
- **Severity**: low
- **Origin**: observed (line 1)
- **Evidence**: File exports both component and context; React Refresh expects only components
- **Why open**: Tight coupling; extracting context to separate file removes lint suppression
- **Fix**: Move `GamePageContext` to `GamePageContext.ts`

---

## "Marked Done, But Check Again"

### Progress Saving Flow
- **Claim**: Progress saved via `handleGameComplete` → `saveProgress` → `progressQueue.add`
- **Reality**: `useGameProgress.saveProgress` catches errors internally (does NOT throw). `GamePage` expects it to throw on failure. Save-error UI at lines 222-233 is effectively dead code.
- **Impact**: Progress queue failures silently swallowed; no user notification

### Error Boundary Coverage
- **Claim**: Catches render-time exceptions
- **Reality**: True but only for children inside boundary (line 242-246). `GameContainer` header is OUTSIDE; header crashes uncaught.
