# Audit: `src/frontend/src/components/game/HandDetectionContext.tsx`

## 0) Repo access declaration

- Repo access: YES (I can run git/rg commands and edit files)
- Git availability: YES

## 1) Discovery Appendix

### Commands executed and outcomes

**Command**: `git rev-parse --is-inside-work-tree`

**Output**:

```text
true
```

**Interpretation**: `Observed` — working inside a git repository.

---

**Command**: `git ls-files -- src/frontend/src/components/game/HandDetectionContext.tsx`

**Output**:

```text

```

**Interpretation**: `Observed` — file is currently untracked.

---

**Command**: `git status --porcelain -- src/frontend/src/components/game/HandDetectionContext.tsx`

**Output**:

```text
?? src/frontend/src/components/game/HandDetectionContext.tsx
```

**Interpretation**: `Observed` — new untracked file.

---

**Command**: `git log -n 20 --follow -- src/frontend/src/components/game/HandDetectionContext.tsx`

**Output**:

```text

```

**Interpretation**: `Observed` — no file history because file is not tracked yet.

---

**Command**: `git log --follow --name-status -- src/frontend/src/components/game/HandDetectionContext.tsx`

**Output**:

```text

```

**Interpretation**: `Observed` — no commit-level ancestry for this path yet.

---

**Command**: `rg -n "^import|process\.env|setInterval|setTimeout|fetch\(|axios|localStorage|sessionStorage" src/frontend/src/components/game/HandDetectionContext.tsx`

**Output**:

```text
1:import { createContext } from 'react';
2:import type { RefObject } from 'react';
3:import type Webcam from 'react-webcam';
4:import type { HandTrackingRuntimeMeta } from '../../hooks/useHandTrackingRuntime';
```

**Interpretation**: `Observed` — this file has type-level contracts only; no network/storage/timer side effects.

---

**Command**: `rg -n --hidden --no-ignore -S "HandDetectionContext" src/frontend`

**Output (excerpt)**:

```text
src/frontend/src/components/game/HandDetectionProvider.tsx:9:import { HandDetectionContext, type HandDetectionContextValue } from './HandDetectionContext';
src/frontend/src/components/game/HandDetectionProvider.tsx:55:    <HandDetectionContext.Provider value={value}>
src/frontend/src/components/game/useHandDetection.ts:3:import { HandDetectionContext } from './HandDetectionContext';
```

**Interpretation**: `Observed` — inbound usage exists via provider and helper hook.

---

**Command**: `rg -n --hidden --no-ignore -S "HandDetectionContext|useHandDetection" src/frontend/src tests`

**Output (excerpt)**:

```text
src/frontend/src/pages/EmojiMatch.tsx:24:import { useHandDetection } from '../components/game/useHandDetection';
src/frontend/src/pages/BubblePopSymphony.tsx:37:import { useHandDetection } from '../components/game/useHandDetection';
src/frontend/src/components/game/useHandDetection.ts:11:export function useHandDetection() {
```

**Interpretation**: `Observed` — consumers currently call the wrapper hook, not raw context.

---

**Command**: `git rev-parse HEAD`

**Output**:

```text
f22be0c8fb5297e326204fd1309fb224bfb29827
```

## 2) Audit artifact

- Audit artifact path: `docs/audit/src__frontend__src__components__game__HandDetectionContext.tsx.md`
- Artifact written/appended: YES

## Header

- Audit version: v1.5.1 (one-file audit flow)
- Date/time (local): 2026-02-28 18:20 IST
- Audited file: `src/frontend/src/components/game/HandDetectionContext.tsx`
- Base commit SHA: `f22be0c8fb5297e326204fd1309fb224bfb29827`
- Auditor identity: GitHub Copilot (GPT-5.3-Codex)
- Source ticket: `TCK-20260228-010`

## 3) What this file actually does

`Observed`: Defines a React context contract (`HandDetectionContextValue`) and exports a nullable `HandDetectionContext` initialized with `null` so provider-managed hand-detection state (cursor, pinch state, webcam ref, runtime metadata) can be shared across components.

## 4) Key components

1. `HandDetectionContextValue` (interface)
   - Inputs: none directly (type declaration)
   - Outputs: compile-time contract for context shape
   - Controls: required fields for providers/consumers (`isHandDetected`, `cursor`, `pinch`, `webcamRef`, `meta`)
   - Side effects: none (`Observed`)

2. `HandDetectionContext` (React context)
   - Inputs: provider value object
   - Outputs: context read path for consumers
   - Controls: runtime access boundary for hand-detection state
   - Side effects: none in this file (`Observed`)

## 5) Dependencies and contracts

### 5a) Outbound dependencies

- `react` / `createContext`: `Observed` load-bearing runtime dependency.
- `react` / `RefObject`: `Observed` type-level contract dependency.
- `react-webcam` / `Webcam`: `Observed` type-level coupling for `webcamRef`.
- `../../hooks/useHandTrackingRuntime` / `HandTrackingRuntimeMeta`: `Observed` type-level coupling for runtime metadata.
- Environment variables: `Observed` none.
- Global mutations / storage / timers / network: `Observed` none.

### 5b) Inbound dependencies

- `Observed`: Imported by `src/frontend/src/components/game/HandDetectionProvider.tsx` to publish context values.
- `Observed`: Imported by `src/frontend/src/components/game/useHandDetection.ts` to read/fallback context.
- `Inferred`: Page-level callers rely on `useHandDetection()` wrapper defaults and may assume context fields are always available.

## 6) Capability surface

### 6a) Direct capabilities

- `Observed`: Defines a canonical cross-component schema for hand-detection state.
- `Observed`: Enables provider-based state injection into descendant React trees.

### 6b) Implied capabilities

- `Inferred`: Allows multiple games to share one consistent hand-detection contract.
- `Inferred`: Supports graceful no-provider behavior when paired with a fallback hook.

## 7) Gaps and missing functionality

- `Observed`: This file exports raw nullable context directly; no guard API is enforced here.
- `Inferred`: Contract correctness depends on consumers using wrapper hooks rather than direct `useContext` calls.
- `Unknown`: Whether all future consumers will avoid direct raw-context access.

## 8) Problems and risks

### Finding HDC-01

- Severity: MEDIUM
- Evidence label: `Observed`
- Evidence snippet:
  - `export const HandDetectionContext = createContext<HandDetectionContextValue | null>(null);`
- Failure mode:
  - Direct consumers that call `useContext(HandDetectionContext)` without null checks can crash or fail unpredictably when provider is absent.
- Blast radius:
  - Any new game/component bypassing `useHandDetection()` wrapper.
- Suggested minimal fix direction:
  - Keep context export, but establish and enforce a single safe accessor pattern (wrapper hook usage lint/rule/docs) so raw nullable reads are not introduced.

### Finding HDC-02

- Severity: LOW
- Evidence label: `Observed`
- Evidence snippet:
  - `webcamRef: RefObject<Webcam | null>;`
  - `meta: HandTrackingRuntimeMeta | null;`
- Failure mode:
  - Tight type coupling to specific runtime/hook modules may increase change friction when swapping webcam provider or runtime meta shape.
- Blast radius:
  - Provider and hook files that construct this contract.
- Suggested minimal fix direction:
  - Document context contract as API surface and version shape changes intentionally (type alias/export strategy).

## 9) Extremes and abuse cases

- Very large inputs: `Observed` not applicable; file has no data processing loops.
- Malformed/adversarial inputs: `Inferred` malformed provider values could violate expectations (e.g., incomplete pinch object).
- Timing/race conditions: `Observed` none in this file (no async/timers).
- Partial dependency failures: `Inferred` provider absence leads to null context path; recovery depends on wrapper hook behavior in another file.
- Broken guarantees: `Unknown` if future callers bypass wrapper and assume non-null context.

## 10) Inter-file impact analysis

### 10.1 Inbound impact

- `Observed`: `HandDetectionProvider.tsx` and `useHandDetection.ts` would break if field names/types change.
- `Inferred`: Pages using `useHandDetection()` expect stable field names (`cursor`, `pinch`, `meta`).
- Tests to protect: contract-level tests around wrapper return shape and provider value pass-through.

### 10.2 Outbound impact

- `Observed`: This file depends on type exports from runtime hook modules and `react-webcam` types.
- `Inferred`: Renaming `HandTrackingRuntimeMeta` or replacing webcam ref type can force cascading type churn.

### 10.3 Change impact per HIGH/MEDIUM finding

- HDC-01
  - Could fixing break callers: `Inferred` yes, if context export/access changes abruptly.
  - Could callers invalidate fix: `Observed` yes, if they continue direct raw-context reads.
  - Contract to lock with tests: `Inferred` wrapper returns safe fallback shape when no provider exists.
  - Post-fix invariant(s):
    - `Inferred` Consumer code path must remain non-throwing when provider is missing.

## 11) Clean architecture fit

- `Observed`: File correctly stays as a thin contract-and-context definition with no runtime business logic.
- `Inferred`: Responsibility remains clean as long as runtime behavior (start/stop tracking, side effects) stays in provider/hook layers.

## 12) Patch plan (HIGH/MED only)

### Plan item for HDC-01 (MED)

- Where: `src/frontend/src/components/game/useHandDetection.ts` + usage conventions for `HandDetectionContext`.
- What: Enforce single safe accessor policy (central wrapper hook), and optionally add defensive runtime warning in dev builds if raw context is consumed unsafely.
- Why: Prevent null-context misuse and provider-absence crashes.
- Failure it prevents: direct consumer null dereference.
- Invariant to preserve: consumers without provider still get a stable fallback object shape.
- Test to add: `useHandDetection.fallback.test.tsx` (no provider) + `useHandDetection.provider.test.tsx` (with provider).

## 13) Verification and test coverage

- `Observed`: No dedicated tests specifically referencing `HandDetectionContext` directly were found.
- `Observed`: Consumer usage is currently indirect through `useHandDetection` in pages like `EmojiMatch` and `BubblePopSymphony`.
- Critical paths untested: provider-absent fallback behavior contract for future refactors (`Inferred`).

## 14) Risk rating

**MEDIUM**

- Why at least this bad: `Observed` nullable raw context can be misused by new direct consumers.
- Why not worse: `Observed` file is small, side-effect free, and current usage path already favors the wrapper hook.

## 15) Regression analysis

- Commands executed:
  - `git log -n 20 --follow -- src/frontend/src/components/game/HandDetectionContext.tsx`
  - `git log --follow --name-status -- src/frontend/src/components/game/HandDetectionContext.tsx`
- Concrete deltas observed:
  - `Observed` none (file currently untracked).
- Classification (file-level): **Unknown** (no tracked history available yet).

## Out-of-scope findings

- `Observed` in related file `HandDetectionProvider.tsx`: `lastMeta` currently typed as `any`.
- Scope decision: out-of-scope because this audit targets only `HandDetectionContext.tsx`.

## Next actions

1. Recommended next remediation PR finding IDs: `HDC-01`.
2. Verification for closure:
   - Add wrapper-hook fallback tests.
   - Confirm no direct raw-context reads exist via lint/search gate.
