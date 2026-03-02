# Audit: `src/frontend/src/components/game/useHandDetection.ts`

## 0) Repo access declaration

- Repo access: YES (I can run git/rg commands and edit files)
- Git availability: YES

## 1) Discovery Appendix

### Commands executed and outcomes

**Command**: `test -f src/frontend/src/components/game/useHandDetection.ts`

**Output**:

```text
exists
```

**Interpretation**: `Observed` — target file exists.

---

**Command**: `git rev-parse --is-inside-work-tree`

**Output**:

```text
true
```

**Interpretation**: `Observed` — working in a git repository.

---

**Command**: `git ls-files -- src/frontend/src/components/game/useHandDetection.ts`

**Output**:

```text

```

**Interpretation**: `Observed` — file is not tracked.

---

**Command**: `git status --porcelain -- src/frontend/src/components/game/useHandDetection.ts`

**Output**:

```text
?? src/frontend/src/components/game/useHandDetection.ts
```

**Interpretation**: `Observed` — new untracked file.

---

**Command**: `git log -n 20 --follow -- src/frontend/src/components/game/useHandDetection.ts`

**Output**:

```text

```

**Interpretation**: `Observed` — no history available for this file path yet.

---

**Command**: `git log --follow --name-status -- src/frontend/src/components/game/useHandDetection.ts`

**Output**:

```text

```

**Interpretation**: `Observed` — no commit ancestry for this path yet.

---

**Command**: `rg -n "^import|process\.env|setInterval|setTimeout|fetch\(|axios|localStorage|sessionStorage" src/frontend/src/components/game/useHandDetection.ts`

**Output**:

```text
1:import { useContext, useRef } from 'react';
2:import type Webcam from 'react-webcam';
3:import { HandDetectionContext } from './HandDetectionContext';
```

**Interpretation**: `Observed` — no timers/network/storage/env access in this file.

---

**Command**: `rg -n --hidden --no-ignore -S "useHandDetection\(|from '../components/game/useHandDetection'|from \"../components/game/useHandDetection\"" src/frontend`

**Output (excerpt)**:

```text
src/frontend/src/pages/BubblePopSymphony.tsx:37:import { useHandDetection } from '../components/game/useHandDetection';
src/frontend/src/pages/BubblePopSymphony.tsx:81:  const { cursor, pinch, webcamRef: _webcamRef } = useHandDetection();
src/frontend/src/pages/EmojiMatch.tsx:24:import { useHandDetection } from '../components/game/useHandDetection';
src/frontend/src/pages/EmojiMatch.tsx:109:  const { cursor: _detectorCursor, pinch: _pinch, meta: _meta } = useHandDetection();
```

**Interpretation**: `Observed` — live page consumers depend on this hook’s return shape.

---

**Command**: `rg -n --hidden --no-ignore -S "useHandDetection|HandDetectionContext" src/frontend/src/**/__tests__ src/frontend/src/tests tests`

**Output**:

```text
rg: src/frontend/src/tests: No such file or directory (os error 2)
```

**Interpretation**: `Observed` — no direct test matches returned in searched test locations; one requested path does not exist.

---

**Command**: `git rev-parse HEAD`

**Output**:

```text
f22be0c8fb5297e326204fd1309fb224bfb29827
```

## 2) Audit artifact

- Audit artifact path: `docs/audit/src__frontend__src__components__game__useHandDetection.ts.md`
- Artifact written/appended: YES

## Header

- Audit version: v1.5.1
- Date/time (local): 2026-02-28 18:26 IST
- Audited file path: `src/frontend/src/components/game/useHandDetection.ts`
- Base commit SHA: `f22be0c8fb5297e326204fd1309fb224bfb29827`
- Auditor identity: GitHub Copilot (GPT-5.3-Codex)
- Source ticket: `TCK-20260228-011`

## 3) What this file actually does

`Observed`: Exposes a safe wrapper hook around `HandDetectionContext`; when provider context is absent it returns a stable fallback object (`isHandDetected=false`, `cursor=null`, non-pinching state, local `webcamRef`, `meta=null`) instead of passing through `null`.

## 4) Key components

1. `fallbackPinch`
   - Inputs: none
   - Outputs: immutable default pinch shape
   - Controls: default `pinch` contract values in no-provider scenarios
   - Side effects: none (`Observed`)

2. `useHandDetection()`
   - Inputs: React context state
   - Outputs: context value or fallback object
   - Controls: runtime safety contract for consumers
   - Side effects: allocates `fallbackWebcamRef` with `useRef` (`Observed`)

## 5) Dependencies and contracts

### 5a) Outbound dependencies

- `react` (`useContext`, `useRef`): `Observed` load-bearing runtime dependency.
- `react-webcam` `Webcam` type: `Observed` type dependency for `webcamRef`.
- `./HandDetectionContext`: `Observed` core contract dependency.
- Env vars/network/storage/timers/global mutations: `Observed` none.

### 5b) Inbound dependencies

- `Observed`: `EmojiMatch.tsx` and `BubblePopSymphony.tsx` consume this hook and destructure fields.
- `Inferred`: Any return-shape changes can break consumers relying on stable keys (`cursor`, `pinch`, `meta`, `webcamRef`).

## 6) Capability surface

### 6a) Direct capabilities

- `Observed`: Shields consumers from null-context crashes.
- `Observed`: Provides a unified object shape independent of provider presence.

### 6b) Implied capabilities

- `Inferred`: Enables camera-optional rendering paths where game pages can still mount before tracking initialization.
- `Inferred`: Simplifies consumer code by avoiding repetitive null checks.

## 7) Gaps and missing functionality

- `Observed`: Returned object type is inferred, not explicitly exported as a formal hook return type alias.
- `Inferred`: Lack of explicit return type may allow accidental widening in future edits.
- `Observed`: No direct tests were found covering fallback-vs-provider behavior for this hook.

## 8) Problems and risks

### Finding UHD-01

- Severity: MEDIUM
- Evidence label: `Observed`
- Evidence snippet:
  - No-provider fallback path returns hardcoded object.
  - Consumers in `EmojiMatch.tsx` and `BubblePopSymphony.tsx` destructure values directly.
- Failure mode:
  - Future edits could drift fallback shape from provider shape, causing subtle runtime breakage.
- Blast radius:
  - All pages using `useHandDetection()`.
- Suggested minimal fix direction:
  - Lock shape with explicit return type and contract tests for provider/no-provider cases.

### Finding UHD-02

- Severity: LOW
- Evidence label: `Observed`
- Evidence snippet:
  - `const fallbackWebcamRef = useRef<Webcam | null>(null);`
- Failure mode:
  - A new ref object is created per hook consumer; if consumers assume shared fallback ref identity, behavior can diverge.
- Blast radius:
  - Multi-component pages reading `webcamRef` while provider is absent.
- Suggested minimal fix direction:
  - Document fallback ref semantics (per-consumer local ref) and avoid identity-based assumptions.

## 9) Extremes and abuse cases

- Large inputs: `Observed` not applicable (no loops over user datasets).
- Malformed/adversarial inputs: `Inferred` malformed provider value could propagate without validation.
- Timing/race conditions: `Observed` minimal; hook itself is synchronous.
- Partial dependency failures: `Observed` if provider missing, fallback path preserves non-throwing behavior.
- Broken guarantees: `Unknown` whether future consumers rely on strict object identity across renders.

## 10) Inter-file impact analysis

### 10.1 Inbound impact

- `Observed`: Changing key names or removing fallback fields would break live consumers.
- `Inferred`: Tests should protect destructuring assumptions for `cursor`, `pinch`, `meta`.

### 10.2 Outbound impact

- `Observed`: Depends on `HandDetectionContext` shape; contract drift there can invalidate this hook.
- `Inferred`: Context evolution requires synchronized updates in both context and wrapper hook.

### 10.3 Change impact per HIGH/MEDIUM finding

- UHD-01
  - Could fixing break callers: `Inferred` yes, if return contract is altered.
  - Could callers invalidate fix: `Observed` yes, if they assume optional/unstable fields.
  - Contract to lock with tests: stable full return shape for both context-present and context-absent modes.
  - Post-fix invariant(s):
    - `Inferred` `useHandDetection()` always returns object with keys: `isHandDetected`, `cursor`, `pinch`, `webcamRef`, `meta`.

## 11) Clean architecture fit

- `Observed`: Responsibility is well-scoped to context-safe access and fallback normalization.
- `Inferred`: This is the correct layer to centralize no-provider behavior and prevent duplicated null handling in pages.

## 12) Patch plan (HIGH/MED only)

### Plan item for UHD-01 (MED)

- Where: `src/frontend/src/components/game/useHandDetection.ts`
- What: Add explicit return-type alias and contract tests for no-provider/provider modes.
- Why: Prevent unintentional shape drift and protect page consumers.
- Failure prevented: runtime breakage from fallback/provider contract mismatch.
- Invariant to preserve: hook remains non-throwing without provider and shape-stable with provider.
- Test to add: `useHandDetection.test.tsx` with two cases (provider absent, provider present).

## 13) Verification and test coverage

- `Observed`: no direct test evidence found for this hook in current test search scope.
- `Inferred`: critical contract path (fallback object shape) is currently unguarded.
- Proposed coverage: hook-level render tests asserting return shape and stability.

## 14) Risk rating

**MEDIUM**

- Why at least this bad: `Observed` multiple live pages rely on this hook shape.
- Why not worse: `Observed` file is compact, deterministic, and already includes safe fallback behavior.

## 15) Regression analysis

- Commands executed:
  - `git log -n 20 --follow -- src/frontend/src/components/game/useHandDetection.ts`
  - `git log --follow --name-status -- src/frontend/src/components/game/useHandDetection.ts`
- Concrete deltas observed:
  - `Observed` none; file is currently untracked.
- Classification (file-level): **Unknown** (no history for this file path yet).

## Out-of-scope findings

- `Observed`: `HandDetectionProvider.tsx` currently stores runtime meta in `any`; this could be tightened separately.
- Scope decision: out-of-scope for this single-file hook audit.

## Next actions

1. Recommended next remediation finding IDs: `UHD-01`.
2. Verification notes:
   - Add hook contract tests.
   - Verify no page directly reads raw context where hook should be used.
