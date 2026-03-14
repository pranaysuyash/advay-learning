# Audit Artifact

**Ticket**: TCK-20260314-002

- Audit version: `audit-v1.5.1`
- Date/time: `2026-03-14 11:25 IST`
- Audited file path: `src/frontend/src/games/jenga/domain/GameState.ts`
- Base commit SHA: `dd9d4fe`
- Auditor: `Codex`

## Discovery Evidence

### Commands executed

```bash
git rev-parse --is-inside-work-tree
git status --porcelain
git diff origin/main...HEAD -- src/frontend/src/games/jenga/domain/GameState.ts
sed -n '1,420p' src/frontend/src/games/jenga/domain/GameState.ts
```

### High-signal outcomes

- **Observed**: Constructor and turn reset logic generated targets immediately for non-classic modes.
- **Observed**: HUD/button design in the page expected explicit rolling.
- **Observed**: The state exposed only aggregate `diceValue`, not the actual rolled faces needed by the new HUD.

## Findings

### GS-001
- Severity: HIGH
- Evidence: **Observed**
- Evidence snippet: constructor/next-turn/reset calling `generateNewTarget()`
- Failure mode: non-classic modes start with silent pre-rolled targets, making the HUD and player flow misleading
- Blast radius: single-dice, double-dice, and math mode clarity
- Minimal fix direction: clear targets on reset/new turn and require explicit roll generation

### GS-002
- Severity: MED
- Evidence: **Observed**
- Evidence snippet: only `_diceValue` was stored, not the die faces
- Failure mode: the UI cannot explain two-dice and math targets clearly
- Blast radius: child-facing readability and testing
- Minimal fix direction: store rolled faces in state and expose them through a getter

### GS-003
- Severity: MED
- Evidence: **Observed**
- Evidence snippet: `getValidTargets()` on non-classic modes depended entirely on `_targetNumbers`, but no `hasActiveTarget` contract existed
- Failure mode: legality and UI had to infer whether a roll existed
- Blast radius: button enablement, instructions, and future integration
- Minimal fix direction: add an explicit `hasActiveTarget` contract and gate grabbing on it

## Next Actions

- Implement `GS-001..GS-003`.
- Add deterministic tests for single, double, and math target generation plus reset behavior.
