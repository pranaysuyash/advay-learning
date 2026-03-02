# AUDIT ARTIFACT: src/frontend/src/utils/coordinateTransform.ts

---

**Audit Version**: v1.5.1  
**Date/Time**: 2026-02-28 19:22:39 IST  
**Audited File**: `src/frontend/src/utils/coordinateTransform.ts`  
**Base Commit SHA**: `f22be0c8fb5297e326204fd1309fb224bfb29827`  
**Auditor**: GitHub Copilot Agent  
**Source Ticket**: TCK-20260228-013

---

## EXECUTION ENVIRONMENT DECLARATION

- **Repo access**: YES (can run git/rg commands and edit files)
- **Git availability**: YES

---

## DISCOVERY APPENDIX

### Commands Executed

**1. Current timestamp:**

```bash
$ date '+%Y-%m-%d %H:%M:%S %Z'
2026-02-28 19:22:39 IST
```

**2. Git repository validation and HEAD commit:**

```bash
$ git rev-parse --is-inside-work-tree && git rev-parse HEAD
true
f22be0c8fb5297e326204fd1309fb224bfb29827
```

**3. Git file tracking check:**

```bash
$ git ls-files -- src/frontend/src/utils/coordinateTransform.ts
src/frontend/src/utils/coordinateTransform.ts
```

**Observed**: File is git-tracked.

**4. Git history (last 20 commits):**

```bash
$ git log --follow -n 20 --oneline -- src/frontend/src/utils/coordinateTransform.ts
9e11bb8 Complete full frontend refactor program, standardization, and blocker remediation
c54861a docs: Add comprehensive refactoring opportunities report
```

**Observed**: Two commits visible in reachable history. Full ancestry may predate these SHAs or reside in merged branches.

**5. Inbound references (file basename + exported symbols):**

```bash
$ rg -n --no-ignore 'coordinateTransform' src/frontend | head -n 80
```

**Observed**: (See detailed inbound-references evidence section below; summary: 9 distinct usage sites across pages/components/tests.)

**6. Test coverage discovery:**

```bash
$ rg -n --no-ignore 'coordinateTransform|getCanvasCoordinates|getNormalizedCoordinates|mapNormalizedPointToCover|KalmanFilter|isWithinTarget' src/frontend/src/utils/__tests__
src/frontend/src/utils/__tests__/coordinateTransform.test.ts
10:  getCanvasCoordinates,
11:  getNormalizedCoordinates,
13:} from '../coordinateTransform';
33:describe('getCanvasCoordinates', () => {
55:    const result = getCanvasCoordinates(mockCanvas, normalized);
...
```

**Observed**: Unit tests exist at `src/frontend/src/utils/__tests__/coordinateTransform.test.ts` covering `getCanvasCoordinates`, `getNormalizedCoordinates`, and `isPointInCircle`.

---

## EVIDENCE: Inbound References

**Total usage sites found: 9**

1. `src/frontend/src/pages/BubblePopSymphony.tsx` (line 13) — imports `getCanvasCoordinates`
2. `src/frontend/src/pages/EmojiMatch.tsx` (line 20) — imports `getCanvasCoordinates`
3. `src/frontend/src/pages/DressForWeather.tsx` (line 19) — imports `getCanvasCoordinates`
4. `src/frontend/src/pages/MemoryMatch.tsx` (line 16) — imports `getCanvasCoordinates`
5. `src/frontend/src/pages/AirCanvas.tsx` (line 21) — imports `getCanvasCoordinates`
6. `src/frontend/src/components/game/GameCanvas.tsx` (line 10) — imports `getCanvasCoordinates`
7. `src/frontend/src/components/game/TargetSystem.tsx` (line 6) — imports `getCanvasCoordinates`
8. `src/frontend/src/components/game/DragDropSystem.tsx` (line 10) — imports `getCanvasCoordinates` and `getNormalizedCoordinates`
9. `src/frontend/src/utils/__tests__/coordinateTransform.test.ts` — tests file

**Observed**: File is widely used across hand-interaction game pages and shared game component infrastructure.

---

## WHAT THIS FILE ACTUALLY DOES

**Observed**: This file provides coordinate transformation utilities for MediaPipe hand-tracking games. It converts between normalized landmark coordinates (0-1 space from MediaPipe) and canvas pixel coordinates, accounting for `devicePixelRatio` and CSS transforms. It exports:

- `getCanvasCoordinates(canvas, normalizedPoint)` — normalized → canvas pixels
- `getNormalizedCoordinates(canvas, pixelPoint)` — canvas pixels → normalized
- `isPointInCircle(point, center, radius)` — circular hit detection
- `mapNormalizedPointToCover(point, source, target, options)` — aspect-ratio-aware mapping with mirroring and clamping
- `isWithinTarget(point, target, radius)` — wrapper for `isPointInCircle`
- `KalmanFilter` class — 1D Kalman filter for coordinate smoothing (noise reduction)

**Observed**: The file includes JSDoc comments explaining usage and DevicePixelRatio handling.

---

## KEY COMPONENTS

### 1. `getCanvasCoordinates(canvas, normalizedPoint)`

**Inputs:**

- `canvas: HTMLCanvasElement`
- `normalizedPoint: { x: number; y: number }` (0-1 range)

**Outputs:**

- `{ x: number; y: number }` (canvas pixel coordinates)

**What it controls:**

- Conversion from normalized MediaPipe landmarks to actual canvas drawing coordinates

**Side effects:**

- None (pure function)

---

### 2. `getNormalizedCoordinates(canvas, pixelPoint)`

**Inputs:**

- `canvas: HTMLCanvasElement`
- `pixelPoint: { x: number; y: number }` (canvas pixels)

**Outputs:**

- `{ x: number; y: number }` (normalized 0-1 space)

**What it controls:**

- Reverse conversion (canvas pixels → normalized coordinates)

**Side effects:**

- None (pure function)

---

### 3. `isPointInCircle(point, center, radius)`

**Inputs:**

- `point: { x: number; y: number }`
- `center: { x: number; y: number }`
- `radius: number`

**Outputs:**

- `boolean` (true if point is within circle)

**What it controls:**

- Hit-testing for circular targets/zones

**Side effects:**

- None (pure function)

---

### 4. `mapNormalizedPointToCover(point, source, target, options)`

**Inputs:**

- `point: { x: number; y: number }` (normalized)
- `source: { width: number; height: number }` (source aspect ratio)
- `target: { width: number; height: number }` (target aspect ratio)
- `options?: CoverMapOptions` (`{ mirrored?: boolean; clamp?: boolean }`)

**Outputs:**

- `{ x: number; y: number }` (remapped normalized coordinates)

**What it controls:**

- Aspect-ratio-aware coordinate mapping with optional mirroring (for camera flips) and clamping (boundary containment)

**Side effects:**

- None (pure function)

---

### 5. `isWithinTarget(point, target, radius)`

**Inputs:**

- `point: { x: number; y: number }`
- `target: { x: number; y: number }`
- `radius: number`

**Outputs:**

- `boolean`

**What it controls:**

- Wrapper around `isPointInCircle` with clearer semantic naming for target interaction

**Side effects:**

- None (pure function)

---

### 6. `KalmanFilter` class

**Constructor Inputs:**

- `processNoise: number = 0.01`
- `measurementNoise: number = 0.1`

**State:**

- `q, r, x, p, initialized` — Kalman filter state variables

**Methods:**

**`reset(value?: number)`**

- Resets filter state, optionally to a specific value
- Side effects: Mutates internal state

**`filter(measurement: number): number`**

- Filters noisy 1D coordinate measurement
- Side effects: Updates internal state
- Returns: Smoothed coordinate value

**What it controls:**

- Noise reduction for jittery hand-tracking coordinates (smooths shaky input)

**Side effects:**

- Mutates internal filter state (stateful class)

---

## DEPENDENCIES AND CONTRACTS

### Outbound Dependencies

**Observed**:

- **Zero external imports** — no library dependencies
- **Browser APIs**:
  - `window.devicePixelRatio` — read-only access (defaults to 1 if undefined)
  - `HTMLCanvasElement.getBoundingClientRect()` — relies on DOM method for CSS-transformed canvas dimensions

**Observed**:

- **Environment variables**: None
- **Global mutations**: None
- **Ordering constraints**: None (stateless utility exports except for `KalmanFilter` which is self-contained)

**Load-bearing status**: The file is load-bearing ONLY if canvas-based hand-interaction games use its coordinate conversion functions. Removal would break all games that import these utilities (per discovery evidence: 8 production files import from this module).

---

### Inbound Dependencies

**Observed** (from discovery evidence):

**Who imports this file:**

- `BubblePopSymphony.tsx`, `EmojiMatch.tsx`, `DressForWeather.tsx`, `MemoryMatch.tsx`, `AirCanvas.tsx` (game pages)
- `GameCanvas.tsx`, `TargetSystem.tsx`, `DragDropSystem.tsx` (shared game components)
- `coordinateTransform.test.ts` (unit tests)

**How they import:**

- ES6 named imports: `import { getCanvasCoordinates, ... } from '../utils/coordinateTransform'`

**What they likely assume** (Inferred):

- **Round-trip accuracy**: `getNormalizedCoordinates(canvas, getCanvasCoordinates(canvas, p))` should recover original point `p` within floating-point precision tolerance.
- **DPR handling**: Functions account for high-DPI displays (`devicePixelRatio > 1`).
- **CSS transform handling**: `getBoundingClientRect()` correctly reflects CSS-transformed canvas dimensions.
- **Coordinate space semantics**: Normalized coordinates are [0, 1] range; pixel coordinates are [0, canvas.width * DPR].
- **Pure function behavior**: No side effects (stateless utilities); `KalmanFilter` is stateful but isolated per-instance.

---

## CAPABILITY SURFACE

### Direct Capabilities (Observed)

1. **Normalized-to-pixel conversion** with DPR awareness
2. **Pixel-to-normalized conversion** with DPR awareness
3. **Circular hit detection** (distance-based)
4. **Aspect-ratio-aware coordinate mapping** with optional mirroring/clamping
5. **1D Kalman filtering** for coordinate noise reduction

---

### Implied Capabilities (Inferred)

1. **Hand-tracking game infrastructure**: Enables all canvas-based hand-interaction games to map MediaPipe landmarks to screen coordinates.
2. **Camera mirroring support**: `mapNormalizedPointToCover` with `mirrored: true` suggests camera selfie-mode handling.
3. **Jitter smoothing**: `KalmanFilter` suggests real-time hand-tracking noise reduction is a system-level requirement.

---

## GAPS AND MISSING FUNCTIONALITY

### 1. **Bounds validation gap** (HIGH)

**Observed**: None of the coordinate conversion functions validate input ranges.

**Missing safeguards:**

- `getCanvasCoordinates` does not clamp `normalizedPoint.x/y` to `[0, 1]` — out-of-bounds input (e.g., `{ x: -0.5, y: 1.5 }`) produces negative or off-canvas pixel coordinates.
- `getNormalizedCoordinates` does not clamp output to `[0, 1]` — pixel coordinates outside canvas bounds produce normalized coordinates outside `[0, 1]`.

**Failure mode**: Games that accidentally pass out-of-range hand landmarks (MediaPipe tracking errors, coordinate system bugs) will render targets/interactions off-screen without warning.

**Engineering norm**: Coordinate conversion utilities should validate or clamp inputs to prevent silent off-screen rendering bugs.

---

### 2. **Null/undefined canvas handling gap** (HIGH)

**Observed**: Functions directly call `canvas.getBoundingClientRect()` without null checks.

**Missing safeguards:**

- No validation of `canvas` parameter before DOM method calls.

**Failure mode**: If a game component passes `null` or `undefined` canvas (e.g., ref not yet initialized during React render), functions will throw `TypeError: Cannot read property 'getBoundingClientRect' of null` — crashing the game.

**Engineering norm**: DOM-dependent utilities should validate required DOM elements and fail gracefully (return default coordinates or throw descriptive error).

---

### 3. **Canvas dimension edge cases** (MEDIUM)

**Observed**: `Math.max(1, ...)` guards exist in `mapNormalizedPointToCover` to prevent division by zero.

**Missing safeguards:**

- No similar guards in `getCanvasCoordinates` or `getNormalizedCoordinates`.

**Failure mode**: If `canvas.getBoundingClientRect()` returns `width: 0` or `height: 0` (unmounted canvas, display:none, zero-size container), coordinate conversion produces `NaN` or `Infinity` due to `0 * ... / 0` operations.

**Engineering norm**: Geometric utilities should handle zero-dimension edge cases.

---

### 4. **KalmanFilter reset documentation gap** (LOW)

**Observed**: `reset(value?: number)` method exists but JSDoc is missing.

**Missing documentation:**

- What happens if `reset()` is called without a value vs. with a value?
- When should games call `reset()`? (e.g., when hand tracking is lost/regained)

**Impact**: Games may misuse filter lifecycle (e.g., not resetting when hand re-enters frame), causing transient smoothing artifacts.

---

### 5. **Error observability gap** (MEDIUM)

**Observed**: No logging, warnings, or error events when invalid inputs are received.

**Missing observability hooks:**

- No console warnings for out-of-bounds coordinates.
- No telemetry/instrumentation for coordinate conversion failures.

**Impact**: Silent failures in coordinate mapping go unnoticed during QA and production — games may exhibit subtle interaction bugs (targets unreachable, hit detection failing) without clear error signals.

---

## PROBLEMS AND RISKS

### Logic and Correctness

#### **CTR-01** [HIGH]: Null canvas parameter crashes game

- **Evidence** (Observed): Lines 33-39 call `canvas.getBoundingClientRect()` without null check.
- **Failure mode**: If React ref is not yet mounted (race condition during component initialization), `canvas` is `null` → `TypeError` crashes game.
- **Blast radius**: All games using `getCanvasCoordinates()` are vulnerable during component mounting phase.
- **Root cause**: No defensive programming for DOM-dependent utilities.

#### **CTR-02** [HIGH]: Out-of-bounds normalized coordinates produce off-screen pixels

- **Evidence** (Observed): `getCanvasCoordinates` multiplies normalized coordinates directly by canvas dimensions without clamping (lines 37-38).
- **Failure mode**: If MediaPipe produces tracking errors (e.g., `x: 1.2, y: -0.3`), target renders outside visible canvas — child cannot interact with target, game becomes unplayable.
- **Blast radius**: Affects all hand-tracking games during glitchy tracking moments (common with hand occlusion, poor lighting).
- **Root cause**: No input validation for coordinate ranges.

#### **CTR-03** [MEDIUM]: Zero-dimension canvas produces NaN coordinates

- **Evidence** (Observed): No zero-dimension guards in `getCanvasCoordinates` (unlike `mapNormalizedPointToCover` which uses `Math.max(1, ...)`).
- **Failure mode**: If canvas is rendered but not yet sized (`width: 0, height: 0`), coordinate conversion produces `NaN` → canvas drawing commands fail silently (nothing drawn, no error).
- **Blast radius**: Games with dynamic canvas sizing (responsive layouts) vulnerable during resize transitions.
- **Root cause**: Missing edge-case handling for zero/invalid dimensions.

---

### Edge Cases and Undefined Behavior

#### **CTR-04** [MEDIUM]: aspectmapNormalizedPointToCover behavior undefined when source/target have zero width/height

- **Evidence** (Observed): Lines 95-100 guard against zero dimensions with `Math.max(1, ...)`, but this is a silent fallback — aspect ratio calculation becomes incorrect.
- **Failure mode**: If `source.width: 0` (e.g., camera not initialized), aspect ratio becomes `1 / source.height` instead of undefined → coordinate mapping produces visually incorrect results (cameras appear stretched/squashed).
- **Blast radius**: Camera-based games with initialization race conditions show distorted hand tracking.
- **Root cause**: Zero-guard is a workaround, not a validation — should fail fast or return default coordinates instead of silently producing incorrect aspect ratios.

#### **CTR-05** [LOW]: `isPointInCircle` edge behavior at exact radius boundary

- **Evidence** (Observed): Line 87 uses `<=` comparison for radius check — point exactly on circle boundary is considered "inside".
- **Undefined behavior**: Is this intentional for hit detection generosity, or an off-by-one class of issue?
- **Impact**: Low — games unlikely to notice 1-pixel edge cases, but behavior should be documented in comments.
- **Root cause**: Mathematical boundary condition not explicitly documented.

---

### Coupling and Hidden Dependencies

#### **CTR-06** [LOW]: Implicit dependency on `window.devicePixelRatio` behavior

- **Evidence** (Observed): Lines 36, 61 assume `window.devicePixelRatio || 1` provides correct DPR.
- **Hidden assumption**: Browsers always provide accurate DPR; games never run in polyfilled/test environments where `window` is mocked incompletely.
- **Failure mode**: If test environment mocks `window` but not `devicePixelRatio`, coordinate conversion uses `1` instead of test-controlled value → integration tests may miss high-DPI bugs.
- **Blast radius**: Low — test environments should mock correctly, but assumption is not validated.

---

### Scalability and Performance

#### **CTR-07** [LOW]: `getBoundingClientRect()` triggers layout thrash if called per frame

- **Evidence** (Inferred): Games likely call `getCanvasCoordinates()` per animation frame for real-time hand tracking (60fps).
- **Performance concern**: `getBoundingClientRect()` forces browser layout reflow if DOM mutations occurred since last layout — can cause frame drops in complex UIs.
- **Mitigation status** (Unknown): Not known whether games cache canvas rect or compute it per frame.
- **Impact**: Low risk unless games render complex DOM during hand tracking (unlikely for canvas-based games).

---

### Security and Data Exposure

#### **CTR-08** [LOW]: No security concerns identified

- **Observed**: File operates purely on geometric/mathematical transformations without network, storage, or user data access.
- **Impact**: No direct security risk.

---

### Observability and Debuggability

#### **CTR-09** [MEDIUM]: Silent failures make coordinate bugs hard to diagnose

- **Evidence** (Observed): No logging, warnings, or error messages when invalid inputs are passed.
- **Failure mode**: Developer sees "hand tracking target is unreachable" but has no debugging signal to know if issue is in MediaPipe, coordinate conversion, or canvas rendering.
- **Blast radius**: Affects all hand-tracking games during bug investigation — increases debugging time.
- **Root cause**: No observability instrumentation for coordinate utilities.

---

### Testability

#### **CTR-10** [LOW]: `KalmanFilter` lacks comprehensive tests

- **Evidence** (Observed): Test discovery found only `getCanvasCoordinates`, `getNormalizedCoordinates`, `isPointInCircle` tests — no tests for `KalmanFilter`, `mapNormalizedPointToCover`, or `isWithinTarget`.
- **Impact**: Medium — `KalmanFilter` is stateful (harder to reason about); untested state transitions may have bugs.
- **Coverage gap**: No tests for Kalman filter edge cases (reset behavior, noise parameter tuning, convergence).

---

## EXTREMES AND ABUSE CASES

### Very Large Inputs or Scale

#### **CTR-11** [LOW]: Extremely large canvas dimensions may overflow coordinate calculations

- **Abuse case**: Canvas with `width: 1000000, height: 1000000` pixels.
- **Failure mode**: `normalizedPoint.x * rect.width * dpr` may exceed JavaScript `Number.MAX_SAFE_INTEGER` (2^53), causing precision loss.
- **Likelihood**: Extremely low — browsers limit canvas max size to ~16384px.
- **Impact**: Negligible unless games attempt absurdly large canvases.

---

### Malformed or Adversarial Inputs

#### **CTR-12** [MEDIUM]: Non-numeric or `NaN` coordinates propagate through functions

- **Abuse case**: Game passes `{ x: "abc", y: NaN }` as normalized point.
- **Failure mode**: JavaScript silently casts `"abc"` to `NaN` in multiplication (line 37) → coordinate becomes `NaN` → canvas drawing silently fails (nothing rendered).
- **Impact**: Medium — games with buggy coordinate pipelines produce silent rendering failures instead of throwing errors.
- **Root cause**: No type validation at runtime (TypeScript types ignored at runtime).

---

### Partial Dependency Failures and Recovery Gaps

#### **CTR-13** [HIGH]: Canvas ref initialization race conditions

- **Scenario**: React component renders before `canvasRef.current` is assigned → game calls `getCanvasCoordinates(null, ...)`.
- **Failure mode**: Crashes game with `TypeError` (see **CTR-01**).
- **Recovery gap**: No graceful fallback or retry mechanism — game must implement ref initialization guards externally.

---

### Broken or Undefined Guarantees

#### **CTR-14** [MEDIUM]: Round-trip conversion accuracy not guaranteed for extreme coordinates

- **Guarantee assumption** (Inferred): `getNormalizedCoordinates(canvas, getCanvasCoordinates(canvas, p))` should recover `p`.
- **Observed**: Test coverage includes round-trip test (line 121), but only for "normal" coordinates.
- **Undefined behavior**: Round-trip accuracy for out-of-bounds coordinates (`x: -10, y: 5`) is untested.
- **Impact**: Games that expect defensive clamping may see unexpected coordinate drift for off-screen tracking.

---

## INTER-FILE IMPACT ANALYSIS

### 10.1 Inbound Impact

**Which callers could break if this file changes:**

**Observed** (from discovery evidence):

- `BubblePopSymphony.tsx`, `EmojiMatch.tsx`, `DressForWeather.tsx`, `MemoryMatch.tsx`, `AirCanvas.tsx` (game pages) depend on exact function signatures.
- `GameCanvas.tsx`, `TargetSystem.tsx`, `DragDropSystem.tsx` (shared components) depend on coordinate conversion semantics.

**Which implicit contracts must be preserved:**

1. **Function signatures** (Observed): All games expect exact parameter types and return types.
2. **Coordinate space semantics** (Inferred):
   - Normalized coordinates are `[0, 1]` range.
   - Pixel coordinates are `[0, canvas.width * DPR]`.
3. **Pure function behavior** (Inferred): Callers assume no side effects (except for `KalmanFilter`, which is instance-scoped).

**What must be protected by tests:**

1. **Contract tests** (missing): Verify `getCanvasCoordinates` signature, return type, and basic correctness across DPR values.
2. **Round-trip tests** (exist but incomplete): Expand coverage for edge cases (out-of-bounds, zero-dimension canvases).

---

### 10.2 Outbound Impact

**Which dependencies could break this file if they change:**

1. **Browser API changes** (Low risk):
   - If `window.devicePixelRatio` semantics change (unlikely — stable API).
   - If `HTMLCanvasElement.getBoundingClientRect()` behavior changes (unlikely — standard DOM API).

**Which assumptions are unsafe or unenforced:**

1. **Assumption**: `canvas.getBoundingClientRect()` always returns valid numeric `width`/`height` (Inferred).
   - **Unsafe**: No validation; zero/negative dimensions not handled in all functions.
2. **Assumption**: `window.devicePixelRatio` exists and is numeric (Inferred).
   - **Unsafe**: Fallback to `1` is reasonable, but untested in mock environments.

---

### 10.3 Change Impact Per Finding

#### **CTR-01** [HIGH]: Adding null canvas guards

**Could fixing it break callers?**

- **No** (Observed): Adding null check and throwing descriptive error is backwards-compatible with correct usage (callers already passing valid canvas).
- **Maybe** (Inferred): If any caller intentionally passes `null` (bug workaround), fix will expose that bug — but this is the correct behavior.

**Could callers invalidate the fix?**

- **No** (Observed): Callers cannot bypass internal null check.

**What contract must be locked with tests?**

- **Contract test**: "getCanvasCoordinates throws descriptive error when canvas is null/undefined"

**Post-fix invariant(s) to lock:**

- **Invariant** (Observed): `getCanvasCoordinates(null, ...)` must throw `TypeError` with message "Canvas element is required"

---

#### **CTR-02** [HIGH]: Adding normalized coordinate clamping

**Could fixing it break callers?**

- **Maybe** (Inferred): If any caller intentionally passes out-of-bounds coordinates to render off-screen targets (unlikely but possible), clamping will change behavior.
- **Preferred strategy**: Add optional `clamp: boolean` parameter (default: `false`) to preserve backwards compatibility while enabling defensive mode.

**Could callers invalidate the fix?**

- **No** (Observed): Clamping is internal to function.

**What contract must be locked with tests?**

- **Contract test**: "getCanvasCoordinates with clamp:true constrains output to canvas bounds"
- **Contract test**: "getCanvasCoordinates with clamp:false preserves original behavior"

**Post-fix invariant(s) to lock:**

- **Invariant** (Inferred): `getCanvasCoordinates(canvas, {x,y}, {clamp:true})` output always within `[0, canvas.width*DPR] × [0, canvas.height*DPR]`

---

#### **CTR-03** [MEDIUM]: Adding zero-dimension guards

**Could fixing it break callers?**

- **Maybe** (Inferred): If any caller expects coordinate conversion to proceed even when canvas is not yet sized (race condition), fix may expose initialization bug.
- **Preferred strategy**: Return `{x: 0, y: 0}` as safe default for zero-dimension canvas (prevents `NaN` propagation).

**Could callers invalidate the fix?**

- **No** (Observed): Zero-dimension guard is internal.

**What contract must be locked with tests?**

- **Contract test**: "getCanvasCoordinates returns {0,0} when canvas has zero width or height"

**Post-fix invariant(s) to lock:**

- **Invariant** (Observed): `getCanvasCoordinates(canvas, ...)` never returns `NaN` or `Infinity`

---

#### **CTR-09** [MEDIUM]: Adding logging for invalid inputs

**Could fixing it break callers?**

- **No** (Observed): Adding `console.warn()` for out-of-bounds inputs is non-breaking.

**Could callers invalidate the fix?**

- **No** (Observed): Logging is side-effect only; does not change return values.

**What contract must be locked with tests?**

- **Contract test**: "getCanvasCoordinates logs warning when normalized coordinates are out of [0,1] range"

**Post-fix invariant(s) to lock:**

- **Invariant** (Inferred): Invalid inputs produce observable warnings (testable via spy on `console.warn`)

---

#### **CTR-10** [LOW]: Adding tests for untested functions

**Could fixing it break callers?**

- **No** (Observed): Adding tests does not change function behavior.

**Could callers invalidate the fix?**

- **No** (Observed): Tests validate existing behavior.

**What contract must be locked with tests?**

- **Contract tests**: `KalmanFilter.filter()`, `mapNormalizedPointToCover()`, `isWithinTarget()` correctness

**Post-fix invariant(s) to lock:**

- **Invariant** (Observed): `KalmanFilter.filter(x)` returns smoothed value within reasonable bounds of input `x`
- **Invariant** (Observed): `mapNormalizedPointToCover()` with `clamp:true` always returns coordinates in [0,1]

---

## CLEAN ARCHITECTURE FIT

### What Belongs Here (Core Responsibilities)

**Observed**:

1. **Coordinate space transformations** — normalized ↔ pixel conversion
2. **Geometric utilities** — hit detection, distance calculations
3. **Signal processing** — noise reduction for real-time tracking

**Reasoning**: This is a pure utility module; coordinate transformation is a legitimate shared concern across hand-tracking games.

---

### What Does NOT Belong Here (Responsibility Leakage)

**Observed**:

- No responsibility leakage detected.

**Potential future leakage risks** (Inferred):

- If game-specific business logic (e.g., scoring, game state transitions) gets added here, it would violate separation of concerns.
- If DOM manipulation (rendering) gets added here, it would blur utility vs. UI boundary.

---

## PATCH PLAN (ACTIONABLE, SCOPED)

### **CTR-01** [HIGH]: Add null canvas guards

**Where**: `getCanvasCoordinates()`, `getNormalizedCoordinates()` functions (lines 33-39, 59-67).

**What**:

1. Add null check at start of each function:
   ```typescript
   if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
     throw new TypeError(
       'Canvas element is required for coordinate conversion',
     );
   }
   ```
2. Update JSDoc to document error case.

**Why**: Prevents crashes from React ref initialization race conditions.

**Failure it prevents**: `TypeError: Cannot read property 'getBoundingClientRect' of null` crashing games during mount.

**Invariant(s) it must preserve**:

- **Observed**: Existing valid-canvas usage continues to work (backwards compatible).

**Test that proves it**:

```typescript
describe('getCanvasCoordinates', () => {
  it('throws descriptive error when canvas is null', () => {
    expect(() => getCanvasCoordinates(null as any, { x: 0.5, y: 0.5 })).toThrow(
      'Canvas element is required',
    );
  });
});
```

---

### **CTR-02** [HIGH]: Add normalized coordinate validation

**Where**: `getCanvasCoordinates()` function (lines 37-38).

**What**:

1. Add optional `clamp` parameter to function signature:
   ```typescript
   export function getCanvasCoordinates(
     canvas: HTMLCanvasElement,
     normalizedPoint: { x: number; y: number },
     options?: { clamp?: boolean },
   ): { x: number; y: number };
   ```
2. If `options?.clamp === true`, clamp normalized coordinates to [0, 1] before conversion:
   ```typescript
   const nx = options?.clamp
     ? Math.max(0, Math.min(1, normalizedPoint.x))
     : normalizedPoint.x;
   const ny = options?.clamp
     ? Math.max(0, Math.min(1, normalizedPoint.y))
     : normalizedPoint.y;
   ```
3. Add `console.warn()` for out-of-bounds coordinates when not clamping.

**Why**: Prevents silent off-screen rendering bugs when MediaPipe tracking glitches.

**Failure it prevents**: Hand targets rendering outside visible canvas during poor lighting/hand occlusion.

**Invariant(s) it must preserve**:

- **Observed**: Existing callers without `{clamp: true}` see no behavior change (backwards compatible).
- **Inferred**: With `{clamp: true}`, output is always within `[0, canvas.width*DPR] × [0, canvas.height*DPR]`.

**Test that proves it**:

```typescript
describe('getCanvasCoordinates', () => {
  it('clamps out-of-bounds normalized coordinates when clamp:true', () => {
    const result = getCanvasCoordinates(
      mockCanvas,
      { x: 1.5, y: -0.3 },
      { clamp: true },
    );
    expect(result.x).toBe(800); // clamped to x:1.0
    expect(result.y).toBe(0); // clamped to y:0.0
  });

  it('warns when normalized coordinates are out of bounds and clamp:false', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    getCanvasCoordinates(mockCanvas, { x: 1.2, y: 0.5 });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('out of bounds'),
    );
  });
});
```

---

### **CTR-03** [MEDIUM]: Add zero-dimension guards

**Where**: `getCanvasCoordinates()`, `getNormalizedCoordinates()` functions.

**What**:

1. After `getBoundingClientRect()` call, check for zero dimensions:
   ```typescript
   const rect = canvas.getBoundingClientRect();
   if (rect.width === 0 || rect.height === 0) {
     console.warn(
       'coordinateTransform: Canvas has zero dimensions, returning origin',
     );
     return { x: 0, y: 0 };
   }
   ```
2. Update JSDoc to document edge case behavior.

**Why**: Prevents `NaN` coordinate propagation during canvas resize/initialization.

**Failure it prevents**: Silent canvas rendering failures when canvas is not yet sized.

**Invariant(s) it must preserve**:

- **Observed**: Functions never return `NaN` or `Infinity`.

**Test that proves it**:

```typescript
describe('getCanvasCoordinates', () => {
  it('returns {0,0} when canvas has zero width', () => {
    const zeroCanvas = document.createElement('canvas');
    vi.spyOn(zeroCanvas, 'getBoundingClientRect').mockReturnValue(
      createMockRect(0, 600),
    );
    expect(getCanvasCoordinates(zeroCanvas, { x: 0.5, y: 0.5 })).toEqual({
      x: 0,
      y: 0,
    });
  });
});
```

---

### **CTR-09** [MEDIUM]: Add observability logging

**Where**: All coordinate conversion functions.

**What**:

1. Add `console.warn()` for invalid inputs (already covered in **CTR-02**).
2. Optionally add feature flag `DEBUG_COORDINATE_TRANSFORM` to enable verbose logging for debugging.

**Why**: Improves debuggability during hand-tracking bug investigations.

**Failure it prevents**: Hours wasted debugging silent coordinate bugs.

**Invariant(s) it must preserve**:

- **Observed**: No performance impact in production (warnings only, no logging loops).

**Test that proves it**: (Covered in **CTR-02** test plan)

---

### **CTR-10** [LOW]: Add comprehensive test coverage

**Where**: `src/frontend/src/utils/__tests__/coordinateTransform.test.ts`.

**What**:

1. Add test suite for `KalmanFilter`:
   ```typescript
   describe('KalmanFilter', () => {
     it('initializes on first measurement', () => {
       /* ... */
     });
     it('smooths noisy coordinates', () => {
       /* ... */
     });
     it('resets state when reset() called', () => {
       /* ... */
     });
   });
   ```
2. Add test suite for `mapNormalizedPointToCover`:
   ```typescript
   describe('mapNormalizedPointToCover', () => {
     it('handles aspect ratio differences', () => {
       /* ... */
     });
     it('mirrors coordinates when mirrored:true', () => {
       /* ... */
     });
     it('clamps output when clamp:true', () => {
       /* ... */
     });
   });
   ```
3. Add edge-case tests for `isWithinTarget`.

**Why**: Increases confidence in stateful/complex utilities.

**Failure it prevents**: Stateful filter bugs, aspect-ratio calculation errors.

**Invariant(s) it must preserve**:

- **Observed**: Existing tests continue to pass.

**Test that proves it**: (Test suite itself is the proof)

---

## VERIFICATION AND TEST COVERAGE

### Tests That Exist Touching This File

**Observed** (from test discovery):

- `src/frontend/src/utils/__tests__/coordinateTransform.test.ts`
- **Covered functions**: `getCanvasCoordinates`, `getNormalizedCoordinates`, `isPointInCircle`
- **Coverage quality**: Good — tests for DPR, CSS transforms, round-trip accuracy, edge values

---

### Critical Paths Untested

**Observed**:

1. **`KalmanFilter` class** — no tests (stateful logic, requires initialization/reset/convergence tests)
2. **`mapNormalizedPointToCover`** — no tests (aspect-ratio edge cases, mirroring, clamping)
3. **`isWithinTarget`** — no tests (trivial wrapper, but completeness requires coverage)
4. **Null canvas handling** — no tests (see **CTR-01**)
5. **Zero-dimension canvas** — no tests (see **CTR-03**)
6. **Out-of-bounds coordinates** — no tests (see **CTR-02**)

---

### Assumed Invariants Not Enforced

**Inferred**:

1. **Round-trip accuracy for normal coordinates** — tested, but not for edge cases.
2. **DPR handling correctness** — tested, but not in mock/test environments without `window.devicePixelRatio`.
3. **Aspect-ratio calculation correctness** — untested.

---

### Proposed Tests Tied to Patch Plan

**See individual patch plan items above for test specifications.**

**Summary of new tests required:**

- Null canvas error test (**CTR-01**)
- Out-of-bounds clamping test (**CTR-02**)
- Zero-dimension safe return test (**CTR-03**)
- Warning observability test (**CTR-09**)
- `KalmanFilter` test suite (**CTR-10**)
- `mapNormalizedPointToCover` test suite (**CTR-10**)
- `isWithinTarget` test (**CTR-10**)

---

## RISK RATING

**Rating**: **MEDIUM**

**Justification — Why it is at least this bad:**

1. **High usage footprint** (Observed): 8 production files import this module — defects have broad blast radius across all hand-tracking games.
2. **Critical gameplay path** (Inferred): Coordinate conversion errors directly break game interactivity (targets unreachable, hit detection failing) — high user impact.
3. **Missing safeguards** (Observed): No null canvas checks, no coordinate validation, no zero-dimension guards — multiple high-severity crash/silent-failure risks.

**Why it is not worse (not HIGH):**

1. **Pure utility scope** (Observed): File has no external side effects (no network, storage, global mutations) — failure is isolated to coordinate calculations, not system-wide corruption.
2. **Test coverage exists** (Observed): Core functions (`getCanvasCoordinates`, `getNormalizedCoordinates`, `isPointInCircle`) have unit tests — basic correctness is verified.
3. **Low data-sensitivity** (Observed): Operates only on geometric coordinates — no user data, authentication, or financial logic.

**Tipping point to HIGH**:

- If any of the identified crash bugs (**CTR-01**, **CTR-02**, **CTR-03**) are found to occur frequently in production (evidence required), risk should be upgraded to HIGH.

---

## REGRESSION ANALYSIS

### Commands Executed

**Git history depth available:**

```bash
$ git log --follow -n 20 --oneline -- src/frontend/src/utils/coordinateTransform.ts
9e11bb8 Complete full frontend refactor program, standardization, and blocker remediation
c54861a docs: Add comprehensive refactoring opportunities report
```

**Observed**: Only 2 commits visible in reachable history. Full file ancestry may predate these SHAs or reside in merged branches.

---

### Concrete Deltas Observed

**Insufficient ancestry depth** (Observed): Cannot retrieve full diff history beyond visible commits without additional git archaeology commands (`git log --all --source -- <file>` or checking merge commits).

**Regression classification at FILE LEVEL**: **UNKNOWN**

**Reasoning**:

- Evidence is insufficient to determine whether current HEAD represents a fix, partial fix, regression, or stable state relative to original implementation.
- To complete regression analysis, additional commands required:
  ```bash
  git log --all --source -- src/frontend/src/utils/coordinateTransform.ts
  git show c54861a:src/frontend/src/utils/coordinateTransform.ts
  git show 9e11bb8:src/frontend/src/utils/coordinateTransform.ts
  ```
- Without full delta visibility, regression status remains **UNKNOWN**.

---

## OUT-OF-SCOPE FINDINGS

**None**: All findings are scoped to this file's direct behavior and immediate contracts.

---

## NEXT ACTIONS

### Recommended for Next Remediation PR

**HIGH priority findings** (immediate fix recommended):

1. **CTR-01**: Add null canvas guards (prevents game crashes during component mount)
2. **CTR-02**: Add normalized coordinate validation/clamping (prevents off-screen rendering bugs)

**MEDIUM priority findings** (next sprint): 3. **CTR-03**: Add zero-dimension guards (prevents `NaN` propagation) 4. **CTR-09**: Add observability logging (improves debuggability)

**LOW priority findings** (backlog): 5. **CTR-10**: Add comprehensive test coverage for untested functions

---

### Verification Notes Per HIGH/MED

#### **CTR-01** (HIGH): Null canvas guards

**What must be tested to close:**

- Manual test: Modify a game component to render before `canvasRef` is assigned → verify error is thrown instead of crash.
- Unit test: `getCanvasCoordinates(null, ...)` throws `TypeError` with descriptive message.

---

#### **CTR-02** (HIGH): Normalized coordinate validation

**What must be tested to close:**

- Manual test: Force MediaPipe to produce out-of-bounds coordinates (simulate tracking error) → verify target is clamped to canvas bounds (with `{clamp: true}`) or warning is logged (with `{clamp: false}`).
- Unit test: Out-of-bounds input produces expected clamped output or warning.

---

#### **CTR-03** (MEDIUM): Zero-dimension guards

**What must be tested to close:**

- Manual test: Render canvas with `display: none` or `width: 0` → verify coordinate conversion returns `{0,0}` instead of `NaN`.
- Unit test: Zero-dimension canvas produces safe default coordinates.

---

#### **CTR-09** (MEDIUM): Observability logging

**What must be tested to close:**

- Manual test: Play hand-tracking game with intentionally bad coordinates → verify warnings appear in console.
- Unit test: Spy on `console.warn` and verify it is called for invalid inputs.

---

## SUMMARY

**File**: `src/frontend/src/utils/coordinateTransform.ts`  
**Purpose**: Coordinate transformation utilities for MediaPipe hand-tracking games.  
**Scope**: Shared utility module (8 production files depend on it).  
**Risk**: MEDIUM (high usage footprint, critical gameplay path, missing safeguards).

**Top Risks**:

1. **Game crashes** from null canvas parameters (no defensive guards).
2. **Silent interaction failures** from out-of-bounds coordinates (no validation).
3. **NaN propagation** from zero-dimension canvases (no edge-case handling).

**Recommended Remediation Order**:

1. Add null canvas guards (**CTR-01**) — prevents crashes.
2. Add coordinate validation/clamping (**CTR-02**) — prevents off-screen bugs.
3. Add zero-dimension guards (**CTR-03**) — prevents `NaN` propagation.
4. Add observability logging (**CTR-09**) — improves debuggability.
5. Add comprehensive tests (**CTR-10**) — increases confidence.

**Estimated Effort**: 2-3 days (4-6 engineer-hours for fixes + tests).

---

**Audit Complete**: 2026-02-28 19:22:39 IST
