# Audit: `src/frontend/src/components/game/HandDetectionProvider.tsx`

## 0) Repo access declaration

- Repo access: YES (I can run git/rg commands and edit files)
- Git availability: YES

## 1) Discovery Appendix

### Commands executed and outcomes

**Command**: `git rev-parse --is-inside-work-tree && git ls-files -- src/frontend/src/components/game/HandDetectionProvider.tsx && git status --porcelain -- src/frontend/src/components/game/HandDetectionProvider.tsx && git rev-parse HEAD`

**Output**:

```text
true
src/frontend/src/components/game/HandDetectionProvider.tsx
f22be0c8fb5297e326204fd1309fb224bfb29827
```

**Interpretation**: `Observed` — repository is a git work tree, file is tracked, and HEAD is `f22be0c8fb5297e326204fd1309fb224bfb29827`.

---

**Command**: `git log -n 20 --follow -- src/frontend/src/components/game/HandDetectionProvider.tsx`

**Output (excerpt)**:

```text
commit f22be0c8fb5297e326204fd1309fb224bfb29827
Author: Pranay Suyash
Date:   Sat Feb 28 00:06:28 2026 +0530

		fix: resolve ESLint unused variable errors across game pages
```

**Interpretation**: `Observed` — file has reachable git history at current HEAD.

---

**Command**: `git log --follow --name-status -- src/frontend/src/components/game/HandDetectionProvider.tsx`

**Output (excerpt)**:

```text
A       src/frontend/src/components/game/HandDetectionProvider.tsx
```

**Interpretation**: `Observed` — this file appears introduced as an addition in reachable history.

---

**Command**: `rg -n "^import|process\.env|setInterval|setTimeout|fetch\(|axios|localStorage|sessionStorage" src/frontend/src/components/game/HandDetectionProvider.tsx`

**Output**:

```text
7:import React, { useEffect, type ReactNode } from 'react';
8:import { useGameHandTracking } from '../../hooks/useGameHandTracking';
9:import { HandDetectionContext, type HandDetectionContextValue } from './HandDetectionContext';
```

**Interpretation**: `Observed` — no direct network/storage/env/timer side effects in this file body.

---

**Command**: `rg -n --hidden --no-ignore -S "HandDetectionProvider" src/frontend`

**Output (excerpt)**:

```text
src/frontend/src/pages/BubblePopSymphony.tsx:36:import { HandDetectionProvider } from '../components/game/HandDetectionProvider';
src/frontend/src/pages/BubblePopSymphony.tsx:367:    <HandDetectionProvider gameName='BubblePopSymphony' isPlaying={gameStarted}>
```

**Interpretation**: `Observed` — at least one page (`BubblePopSymphony`) depends directly on this provider wrapper.

---

**Command**: `rg -n --hidden --no-ignore -S "HandDetectionProvider|useHandDetection|HandDetectionContext" src/frontend/src/__tests__ src/frontend/src/components src/frontend/src/pages tests || true`

**Output (excerpt)**:

```text
rg: src/frontend/src/__tests__: No such file or directory (os error 2)
src/frontend/src/pages/BubblePopSymphony.tsx:37:import { useHandDetection } from '../components/game/useHandDetection';
src/frontend/src/pages/EmojiMatch.tsx:24:import { useHandDetection } from '../components/game/useHandDetection';
```

**Interpretation**: `Observed` — no direct test hit in queried locations; one queried test path is absent.

---

**Command**: `./scripts/new_ticket_stamp.sh copilot && date '+%Y-%m-%d %H:%M %Z'`

**Output**:

```text
STAMP-20260228T130224Z-copilot-w06i
2026-02-28 18:32 IST
```

## 2) Audit artifact

- Audit artifact path: `docs/audit/src__frontend__src__components__game__HandDetectionProvider.tsx.md`
- Artifact written/appended: YES

## Header

- Audit version: v1.5.1
- Date/time (local): 2026-02-28 18:32 IST
- Audited file path: `src/frontend/src/components/game/HandDetectionProvider.tsx`
- Base commit SHA: `f22be0c8fb5297e326204fd1309fb224bfb29827`
- Auditor identity: GitHub Copilot (GPT-5.3-Codex)
- Source ticket: `TCK-20260228-012`

## 3) What this file actually does

`Observed`: wraps children in `HandDetectionContext.Provider`, runs `useGameHandTracking` using `gameName`/`isPlaying`, stores latest runtime `meta` from `onFrame`, derives `isHandDetected` from `cursor !== null`, and starts/stops tracking via `useEffect` when `isPlaying` changes.

## 4) Key components

1. `HandDetectionProviderProps`
   - Inputs: `gameName`, `isPlaying`, `children`
   - Outputs: typed API contract for provider usage
   - Controls: external activation of tracking lifecycle
   - Side effects: none (`Observed`)

2. `HandDetectionProvider(...)`
   - Inputs: props + hook outputs from `useGameHandTracking`
   - Outputs: `HandDetectionContextValue` for descendants
   - Controls: tracking start/stop and context publication
   - Side effects: starts/stops camera/hand-tracking runtime indirectly via hook methods (`Inferred`)

3. Local state `lastMeta`
   - Inputs: `onFrame` callback meta
   - Outputs: `meta` field in context value
   - Controls: latest runtime metadata visibility to consumers
   - Side effects: React state updates on frames (`Observed`)

## 5) Dependencies and contracts

### 5a) Outbound dependencies

- `react` (`useEffect`, state): `Observed` runtime control and rendering dependency.
- `../../hooks/useGameHandTracking`: `Observed` load-bearing runtime source for cursor/pinch/webcam/start/stop.
- `./HandDetectionContext` + `HandDetectionContextValue`: `Observed` context contract sink.
- Environment variables / storage / fetch / timers in this file: `Observed` none.

### 5b) Inbound dependencies

- `Observed`: `BubblePopSymphony.tsx` mounts this provider directly.
- `Inferred`: descendant consumers via `useHandDetection()` expect stable fields (`isHandDetected`, `cursor`, `pinch`, `webcamRef`, `meta`).

## 6) Capability surface

### 6a) Direct capabilities

- `Observed`: centralizes hand-tracking lifecycle toggling by `isPlaying`.
- `Observed`: supplies shared cursor/pinch/webcam/meta state via context.

### 6b) Implied capabilities

- `Inferred`: lets multiple nested components consume a single tracking session without prop drilling.
- `Inferred`: can isolate per-game tracking behavior through `gameName` hook config.

## 7) Gaps and missing functionality

- `Observed`: `lastMeta` is typed `any`, weakening contract strictness at provider boundary.
- `Observed`: no explicit guard against repeated `startTracking()` calls if function identity changes and `isPlaying` remains true.
- `Unknown`: whether `useGameHandTracking` internals already deduplicate repeated starts/stops.

## 8) Problems and risks

### Finding HDP-01

- Severity: MEDIUM
- Evidence label: `Observed`
- Evidence snippet:
  - `const [lastMeta, setLastMeta] = React.useState<any>(null);`
- Failure mode:
  - Runtime metadata shape drift can pass silently, causing downstream UI assumptions to fail later.
- Blast radius:
  - All consumers reading `meta` from hand-detection context.
- Suggested minimal fix direction:
  - Replace `any` with `HandTrackingRuntimeMeta | null` and preserve this type end-to-end.

### Finding HDP-02

- Severity: MEDIUM
- Evidence label: `Inferred`
- Evidence snippet:
  - `useEffect(() => { if (isPlaying) { void startTracking(); } else { stopTracking(); } }, [isPlaying, startTracking, stopTracking]);`
- Failure mode:
  - If `startTracking`/`stopTracking` references are unstable across renders, effect may invoke lifecycle transitions more often than intended.
- Blast radius:
  - Tracking session stability, camera runtime churn, potential duplicated startup cost.
- Suggested minimal fix direction:
  - Confirm/stabilize hook callback identity and/or add idempotent guard in provider-layer lifecycle handling.

### Finding HDP-03

- Severity: LOW
- Evidence label: `Observed`
- Evidence snippet:
  - `const isHandDetected = cursor !== null;`
- Failure mode:
  - Hand detection status is binary and ignores tracking confidence/quality dimensions.
- Blast radius:
  - UI cues may report “detected” even for poor/unstable frames.
- Suggested minimal fix direction:
  - Expand status semantics only if consumers need confidence-aware behavior (otherwise document intentional simplification).

## 9) Extremes and abuse cases

- Large inputs: `Observed` file itself has no loops over unbounded external input; per-frame updates come from hook callbacks.
- Malformed/adversarial inputs: `Inferred` malformed `meta` can propagate due to `any` typing.
- Timing/race conditions: `Inferred` start/stop overlap can occur during rapid `isPlaying` toggles.
- Partial dependency failures: `Unknown` exact provider behavior if hook start fails asynchronously; no explicit error handling in this file.
- Broken guarantees: `Unknown` if downstream assumes `meta` keys that are absent on certain frames.

## 10) Inter-file impact analysis

### 10.1 Inbound impact

- `Observed`: `BubblePopSymphony` and descendant consumers can break if provider value keys/types change.
- `Inferred`: tests should lock context value shape and lifecycle behavior for `isPlaying` transitions.

### 10.2 Outbound impact

- `Observed`: this file trusts `useGameHandTracking` for lifecycle correctness.
- `Inferred`: callback identity instability in hook implementation can influence provider effect behavior.

### 10.3 Change impact per HIGH/MEDIUM finding

- HDP-01
  - Could fixing break callers: `Inferred` low risk unless callers relied on untyped/meta-any behavior.
  - Could callers invalidate fix: `Observed` yes, if callers still treat `meta` as arbitrary object.
  - Contract to lock with tests: `meta` published type matches `HandTrackingRuntimeMeta | null`.
  - Post-fix invariant(s): `Inferred` provider never emits `meta` with type outside declared contract.

- HDP-02
  - Could fixing break callers: `Inferred` medium if lifecycle timing assumptions exist.
  - Could callers invalidate fix: `Inferred` rapid external `isPlaying` flips may still stress lifecycle.
  - Contract to lock with tests: toggling `isPlaying` invokes one logical start on false→true and one stop on true→false.
  - Post-fix invariant(s): `Inferred` repeated renders with unchanged `isPlaying=true` do not re-trigger unnecessary startup side-effects.

## 11) Clean architecture fit

- `Observed`: file is appropriately scoped as a context-lifecycle bridge between hook runtime and consumer tree.
- `Inferred`: keeping all runtime error handling and confidence policy outside this file preserves separation of concerns.

## 12) Patch plan (HIGH/MED only)

### Plan item for HDP-01

- Where: `src/frontend/src/components/game/HandDetectionProvider.tsx` state declaration and context value assembly.
- What: type `lastMeta` as `HandTrackingRuntimeMeta | null`.
- Why: enforce compile-time metadata contract integrity.
- Failure prevented: silent shape drift and deferred runtime failures in consumers.
- Invariant to preserve: provider still publishes nullable meta while tracking initializes/when unavailable.
- Test to add: `HandDetectionProvider.meta-contract.test.tsx`.

### Plan item for HDP-02

- Where: `useEffect` lifecycle block in provider.
- What: enforce idempotent start/stop semantics around `isPlaying` transitions.
- Why: reduce startup churn and race-prone repeated side-effects.
- Failure prevented: redundant tracking starts/stops during rerenders.
- Invariant to preserve: true transition starts tracking; false transition stops tracking.
- Test to add: `HandDetectionProvider.lifecycle.test.tsx` with transition assertions.

## 13) Verification and test coverage

- `Observed`: no direct provider-specific tests surfaced from queried paths.
- `Inferred`: lifecycle transition correctness and typed `meta` contract are currently unguarded.
- Proposed coverage:
  - Provider lifecycle transition test (start/stop calls).
  - Provider context value contract test (keys + types, including `meta`).

## 14) Risk rating

**MEDIUM**

- Why at least this bad: `Observed` provider is a shared runtime bridge; type/lifecycle drift affects live pages.
- Why not worse: `Observed` implementation is small and explicit; side effects are delegated to a single hook API.

## 15) Regression analysis

- Commands executed:
  - `git log -n 20 --follow -- src/frontend/src/components/game/HandDetectionProvider.tsx`
  - `git log --follow --name-status -- src/frontend/src/components/game/HandDetectionProvider.tsx`
- Concrete deltas observed:
  - `Observed`: file appears as added (`A`) in reachable history.
  - `Observed`: no older historical revisions were surfaced beyond current reachable addition.
- Classification (file-level): **Unknown** (insufficient multi-revision evidence to classify fixed/partial/regression state).

## Out-of-scope findings

- `Observed`: `useHandDetection.ts` and `HandDetectionContext.tsx` have contract-related concerns tracked under separate tickets/audits.
- Scope decision: out-of-scope because this audit targets only provider file behavior.

## Next actions

1. Recommended next remediation finding IDs: `HDP-01`, `HDP-02`.
2. Verification notes for closure:
   - Add provider lifecycle transition tests.
   - Add typed `meta` contract assertion test.
