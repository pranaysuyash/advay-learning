Repo access: YES (I can run git/rg commands and edit files)
Git availability: YES

# AUDIT ARTIFACT: `src/frontend/src/App.tsx`

## A) Header
- **Audit version**: 1.5.1
- **Date/time (local)**: 2026-02-24T00:07:03+05:30
- **Audited file path**: `src/frontend/src/App.tsx`
- **Base commit SHA**: 4d1dbc4 (Latest: "TCK-20260223-008: unify progress capture...")
- **Auditor identity**: Antigravity

## B) Discovery evidence (raw outputs)

**Commands executed**:
1. Git Tracking: `git rev-parse --is-inside-work-tree` -> `true` (Observed)
2. Git History: `git log -n 5 --oneline -- src/frontend/src/App.tsx`
   - Retrieved 5 recent commits actively modifying this file.
3. Tests Search: `rg -n --hidden --no-ignore -S "App.tsx|App" test tests __tests__ e2e .`
   - Yielded 1800+ lines of references, but explicit tests for `App.tsx` logic are not immediately evident beyond standard rendering tests (e.g. `tests/__init__.py`, `tests` folders exist).

## C) Findings

### F-001
- **Severity**: HIGH
- **Evidence label**: Observed
- **Evidence snippet**: 
  ```tsx
  <Suspense fallback={<PageLoader />}>
    <Routes>
  ```
- **Failure mode**: If any component outside of `CameraSafeRoute` (such as `Dashboard`, `Settings`, `Home`, `Progress` or a provider) throws an unhandled error, the entire application will crash to a white screen. There is no root-level Error Boundary encompassing the app.
- **Blast radius**: Entire application becomes unusable for the user until manual refresh.
- **Suggested minimal fix direction**: Extract a global `AppErrorBoundary` component and wrap `<Routes>` or wrap the entire `<ToastProvider>` block within it to catch and gracefully display generic runtime errors.

### F-002
- **Severity**: MEDIUM
- **Evidence label**: Observed
- **Evidence snippet**:
  ```tsx
  <Route path='/style-test' element={<Layout><StyleTest /></Layout>}/>
  <Route path='/test/mediapipe' element={<Layout><MediaPipeTest /></Layout>}/>
  ```
- **Failure mode**: Development/testing routes are exposed in the production routing table. 
- **Blast radius**: Users might accidentally navigate to these routes, or automated scanners might index them. They may expose internal development tools or unpolished UI to production users.
- **Suggested minimal fix direction**: Remove these routes or wrap them in an environment check (e.g., `if (import.meta.env.DEV)`).

### F-003
- **Severity**: LOW
- **Evidence label**: Observed
- **Evidence snippet**:
  ```tsx
  function CameraSafeRoute({ gameName, children }: CameraSafeRouteProps) {
  ```
- **Failure mode**: Component definition (`CameraSafeRoute`) inside the main routing file.
- **Blast radius**: Reduces separation of concerns; changes to camera safety logic require modifying the main application router file.
- **Suggested minimal fix direction**: Extract `CameraSafeRoute` to `src/frontend/src/components/routing/CameraSafeRoute.tsx`.

## D) Out-of-scope findings
- `useProgressSync()` might trigger re-renders at the app root depending on its implementation, which could affect the entire app's rendering performance. (Inferred from hook placement; implementation of hook not audited).

## E) Next actions
- **Exact finding IDs recommended for next remediation PR**: F-001, F-002
- **Verification notes per HIGH/MED**:
  - **F-001**: Introduce a deliberate throw in a test route and verify the app shows a friendly fallback instead of a white screen.
  - **F-002**: Verify that navigating to `/style-test` in production yields a 404/redirect instead of the test page.

---

## 3) What this file actually does
`App.tsx` is the root component of the React application. It composes global context providers (Toast, Confirm, CalmMode), triggers background progress synchronization (`useProgressSync`), defines the lazy-loaded route hierarchy using `react-router-dom`, and wraps camera-dependent games in a specialized error boundary (`CameraSafeRoute`) that provides touch fallbacks if camera tracking fails.

## 4) Key components
- **`App`**:
  - Inputs: Context providers, routing state.
  - Outputs: The rendered application tree.
  - Controls: Global providers, routing mapping, code-split loading.
  - Side effects: Initializes `useProgressSync`.
- **`CameraSafeRoute`**:
  - Inputs: `gameName`, `children`.
  - Outputs: The child wrapped in `CameraErrorBoundary` or `CameraCrashFallback`.
  - Controls: Fallback UI activation when camera tracking encounters a runtime error.
  - Side effects: Local state mutation (`fallbackMode`, `renderKey`).
- **`PageLoader`**:
  - Inputs: None.
  - Outputs: A visual spinner during lazy chunk loading.

## 5) Dependencies and contracts

### 5a) Outbound dependencies (Observed)
- **Load-bearing imports**: `react-router-dom` for routing. `Layout`, `ProtectedRoute` for page structure and authentication guarding. Several context providers (`ToastProvider`, `ConfirmProvider`, `CalmModeProvider`).
- **Global mutations**: `useProgressSync` handles progress tracking logic (likely network or local storage side effects).

### 5b) Inbound dependencies (Observed or Inferred)
- **Who imports this**: Usually `main.tsx` or `index.tsx`.
- **What they assume**: They assume `<App />` is a self-contained, fully configured component tree that simply needs to be rendered inside a standard DOM node (or `BrowserRouter`).

## 6) Capability surface
### 6a) Direct capabilities (Observed)
- Maps URLs to lazy-loaded code chunks.
- Intercepts and handles camera-specific errors for game routes.
- Provides global toast and confirmation dialog capabilities.

### 6b) Implied capabilities (Inferred)
- Protects authenticated routes via `<ProtectedRoute>`.
- Synchronizes user progress in the background globally.

## 7) Gaps and missing functionality
- **Missing safeguards**: No global error boundary covering standard pages and UI components.
- **Missing validation**: Test routes are indiscriminately bundled and accessible.

## 8) Problems and risks
- **logic and correctness**: `CameraSafeRoute` relies on a `renderKey` to reset the error boundary. If the children component retains invalid state outside the boundary, remounting might immediately cause another crash. (Inferred)
- **coupling and hidden dependencies**: The routing definition is tightly coupled with `CameraSafeRoute` implementation.
- **observability and debuggability**: Unhandled non-camera exceptions will crash the app without a graceful UI or dedicated telemetry hook at the root boundary.

## 9) Extremes and abuse cases
- Over-navigation: Rapid path switching while chunks are loading could pile up multiple transitions or expose race conditions in `useProgressSync`.
- Component crashes: Deliberate or accidental unhandled exceptions in any `Layout` or `Home` child will blank the screen.

## 10) Inter-file impact analysis

### 10.1 Inbound impact
- `main.tsx` assumes `App.tsx` handles its own routing. Changing providers at this level affects all downstream consuming components (e.g., anything calling `useToast()`).

### 10.2 Outbound impact
- `ProtectedRoute` failures will redirect logic natively.
- Changes to `Layout` structure directly cascade to all pages using it.

### 10.3 Change impact per finding
- **F-001**: Adding a global Error Boundary does not break callers. It protects the application UX.
  - *Post-fix invariant*: Any error thrown outside of `CameraErrorBoundary` MUST be caught by `AppErrorBoundary` and render a fallback instead of unmounting the root.
- **F-002**: Removing test routes.
  - *Post-fix invariant*: Production builds MUST NOT resolve `/style-test` or `/test/mediapipe`.

## 11) Clean architecture fit
- Routing and provider composition belong here.
- Component implementations like `CameraSafeRoute` and `PageLoader` should ideally exist in dedicated files (`src/components/routing/...`) to keep `App.tsx` strictly focused on the routing tree topology.

## 12) Patch plan
- **F-001 Global Error Boundary**
  - **Where**: `src/frontend/src/App.tsx` (wrap `<Routes>`)
  - **What**: Create/import a `GlobalErrorBoundary` and wrap the generic UI.
  - **Why**: Prevents catastrophic white-screen failure modes.
  - **Invariant**: Unhandled render errors display a recovery UI.
  - **Test**: `App.test.tsx` -> "catches generic render errors in routes".

- **F-002 Remove Production Test Routes**
  - **Where**: `src/frontend/src/App.tsx` (route list)
  - **What**: Delete `<Route path='/style-test' />` and `<Route path='/test/mediapipe' />` or wrap them in an environment condition.
  - **Why**: Prevent exposure of development tooling.
  - **Invariant**: Production bundle does not contain dev routes.
  - **Test**: Route coverage tests ensuring 404 on these paths.

## 13) Verification and test coverage
- **Tests that exist**: Discovery shows testing infrastructure but limited specific unit tests for `App.tsx` routing. There are E2E or snapshot tests (e.g. `App.tsx` coverage in integration).
- **Critical paths untested**: The failure path where a non-camera page throws an error.
- Propose test: "App routing boundary gracefully catches layout errors."

## 14) Risk rating
**MEDIUM**. 
The lack of a global error boundary is a standard React anti-pattern that can lead to poor UX upon unexpected state failures, and exposing test routes is sloppy but not immediately a critical security hole.

## 15) Regression analysis
**Commands executed**: `git log -n 5 --oneline -- src/frontend/src/App.tsx`
**Deltas observed**:
- 4d1dbc4: Added/modified `useProgressSync`
- c54861a: Documentation modifications related to this
- Older commits indicate routing and component additions.
**Classification**: Unknown / Ongoing evolution. No specific regression introduced recently, missing error boundary seems to be an original architectural omission.
