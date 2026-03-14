# Audit Artifact

**Ticket**: TCK-20260314-003

- Audit version: `audit-v1.5.1`
- Date/time: `2026-03-14 11:25 IST`
- Audited file path: `src/frontend/src/pages/three/DigitalJenga3D.tsx`
- Base commit SHA: `dd9d4fe`
- Auditor: `Codex`

## Discovery Evidence

### Commands executed

```bash
git rev-parse --is-inside-work-tree
git status --porcelain
git fetch origin --prune
git diff --name-only origin/main...HEAD
git diff origin/main...HEAD -- src/frontend/src/pages/three/DigitalJenga3D.tsx
sed -n '1,860p' src/frontend/src/pages/three/DigitalJenga3D.tsx
sed -n '1,720p' src/frontend/src/hooks/useGameHandTracking.ts
sed -n '1,260p' src/frontend/src/hooks/useHandTrackingRuntime.ts
```

### High-signal outcomes

- **Observed**: Repo is a git worktree and already dirty with many unrelated changes.
- **Observed**: The Jenga page previously contained its own hand-tracking RAF loop and directly mutated hand/pinch state inside the page layer.
- **Observed**: The page was wired to `useGrabController`, but hand input still owned separate raycast/start/update/release behavior.
- **Observed**: Shared hand-tracking runtime already exists in `useGameHandTracking` and `useHandTrackingRuntime`.

## Findings

### DJ-001
- Severity: HIGH
- Evidence: **Observed**
- Evidence snippet: local page-level hand-processing loop plus page-owned `setPinchState` / `setHandPosition`
- Failure mode: hand interaction lifecycle diverged from the actual controller path
- Blast radius: grab reliability, tracking-loss reset, stale pinch state
- Minimal fix direction: move runtime ownership to shared hand-tracking hooks and feed normalized cursor/pinch state into the existing controller

### DJ-002
- Severity: HIGH
- Evidence: **Observed**
- Evidence snippet: page-level effects raycast for hand start/update/release while pointer input used mesh `pointerdown`
- Failure mode: pointer and hand input behaved differently even though both should represent the same grab contract
- Blast radius: inconsistent gameplay feel and harder bug fixing
- Minimal fix direction: make `useGrabController` the single source of truth for both input modes

### DJ-003
- Severity: MED
- Evidence: **Observed**
- Evidence snippet: camera state, hand state, and page overlays did not use shared camera thumbnail / tracking-loss UI patterns
- Failure mode: camera-first UX was under-explained and less repo-aligned than other games
- Blast radius: onboarding clarity and recoverability after tracking loss
- Minimal fix direction: use `useGameHandTracking`, `GameContainer` webcam thumbnail support, and `TrackingLossOverlay`

## Dependency-Impact Notes

- `src/frontend/src/games/jenga/hooks/useGrabController.ts` is load-bearing for controller ownership.
- `src/frontend/src/games/jenga/domain/GameState.ts` is load-bearing for roll/target semantics shown by the page.
- `src/frontend/src/games/jenga/components/HUD.tsx` and `BlockView.tsx` are display dependencies affected by the page contract.

## Next Actions

- Implement findings `DJ-001..DJ-003` in the Jenga page and its minimal dependency set.
- Verify with targeted Jenga tests and frontend typecheck.
