# Jenga Physics: Advanced Extraction + Collapse Logic Plan

**Date:** 2026-03-14
**Owner:** Codex
**Status:** Phase A implemented, Phase B/C pending

## Purpose

This document defines a plan to upgrade the current heuristic-based extraction and collapse detection logic in Digital Jenga 3D to a more physics-faithful implementation using Rapier collision events and contact analysis.

The existing implementation works but is based on distance thresholds and center-of-mass heuristics. The goal of this plan is to outline a solid approach to:

1. **Detection of legal extraction boundaries** (block has truly slid free), and
2. **Collapse detection** using real collision/contact analysis rather than approximate COM thresholds.

---

## Current Behavior (Baseline)

### Extraction
- The game uses a distance-from-center threshold (`EXTRACT_DISTANCE`) relative to world origin to decide when a block is considered "extracted".
- This is a heuristic and does not use Rapier collision contacts or actual support contacts.

### Collapse Detection
- The game uses a center-of-mass deviation calculation plus a few height checks.
- If COM deviates outside a simple base radius or blocks drop below a Y threshold, the tower is considered collapsed.

These heuristics are simple to reason about but can be inaccurate (false positives/negatives) and do not map to how Jenga actually behaves.

---

## Objectives for Advanced Physics Logic

1. **Extraction should be based on real support contacts**, not just distance.
2. **Collapse should be triggered by a real structural failure**, not just COM deviation.
3. **Gameplay should still feel responsive and fun**; we do not want overly strict or noisy failure triggers.

---

## Proposed Technical Approach

### 1) Detecting Block Extraction Using Rapier Contact Events

#### 1.1. Support Count via Contact Tracking
- For each `JengaBlock`, track how many *supporting* contacts it has with blocks below.
- Consider a contact to be “supporting” if the contact normal is within a small angle of `+Y` (i.e., block resting on something below).

#### 1.2. Support State Machine
- A block is considered **supported** when its support contact count is >= 1 (or >= 2 for stronger assurance).
- When support count drops to 0 for a block that is still inside the tower, treat it as “loosened”.
- Only allow extraction to fully complete when the block is **loosened** and then clearly moves outside the support region (e.g., it no longer collides with any block in the tower).

#### 1.3. Implementation Path
1. **Enable contact events** in Rapier: `world.createEventQueue(true);` (already done in `RapierPhysics`).
2. **Register contact callback** each frame (or in the physics step) to update support state for blocks:
   - When a contact begins between two blocks, record it in a map keyed by block IDs.
   - When a contact ends, remove it.
3. Determine support direction by checking the contact normal (relative to block local space) and whether the other collider is below.

#### 1.4. Extract Logic Update
- Instead of checking `distFromCenter > EXTRACT_DISTANCE`, do:
  1. If block is currently in “grabbed” phase and support contact count drops to 0 → mark as **exactly extracted**.
  2. When extraction is complete, allow `completeExtract()` and `placeOnTop()` to run.

---

## 2) Collapse Detection via Contact / Support Graph

### 2.1. Structural Collapse Definition
A real collapse occurs when:
- A significant portion of the tower loses support contacts, or
- A block in a low layer falls below a threshold (Y) *and* it is no longer in contact with the tower.

### 2.2. Contact-Based Stability Metric
We can compute a running “support index” for the tower:
- For each block still in the tower (`inTower` or `onTop`):
  - Calculate `supportScore = (#supportContacts) / maxExpectedContacts`.
  - Weighted by layer (lower blocks contribute more to stability).
- Collapse triggers when **combined support score drops below a threshold** (e.g., 0.4) or when too many blocks are “unsupported”.

### 2.3. Implementation Path
1. Extend the contact tracker (from extraction logic) to maintain per-block support counts and optionally contact normals.
2. Each physics step, compute a simple stability score:
   - `stability = (sum(supportScore * layerWeight) / maxScore)`
3. If `stability < COLLAPSE_THRESHOLD` OR `supportContacts == 0` for many low-layer blocks → trigger `tower.hasCollapsed()`.
4. Provide a short “settle window” (e.g., 0.5s) before declaring collapse to avoid temporary jitter.

---

## 3) Implementation “Phases” (Roadmap)

### Phase A (Proof of concept)
- Add a `ContactTracker` in `RapierPhysics` that tracks contact begin/end and stores contact normals.
- Add an API for game state to query “support count” per block.
- Update extraction logic to use support count to decide extraction completion.

**2026-03-14 implementation note**
- `RapierPhysics` now recomputes block-to-block support relationships from Rapier contact pairs each physics step.
- `JengaTower` now queries physics-backed support info when attached to a physics world and uses it for extraction-complete and stability calculations.
- `useGrabController` now promotes grab -> extract only when a block is both loose and displaced past the extraction threshold.
- This is intentionally still a v1 support/contact implementation; collapse tuning and settle-window refinement remain follow-up work.

### Phase B (Refine collapse logic)
- Implement `Tower.stabilityScore()` computed from contact data + layer weighting.
- Replace COM heuristic with `stabilityScore` thresholding.
- Add test coverage verifying collapse triggers when support contacts drop.

### Phase C (Playtest + tuning)
- Playtest and tune thresholds (support count required, collapse score threshold, settle delay).
- Adjust game feel to avoid “false collapse” while still making collapse meaningful.
- Add calibration settings (e.g., easy/hard difficulty affects required support).

---

## 4) Suggested API Additions (Code Sketch)

```ts
// RapierPhysics.ts
interface SupportInfo {
  supportCount: number;
  supportingBlocks: string[];
}

class RapierPhysics {
  // ...
  getSupportInfo(blockId: string): SupportInfo;
}
```

```ts
// Tower.ts (support API)
getSupportCount(block: JengaBlock): number {
  return this.physics.getSupportInfo(block.id).supportCount;
}
```

```ts
// GameState.ts
isBlockLoosened(block: JengaBlock): boolean {
  return this.tower.getSupportCount(block) === 0;
}
```

---

## 5) Documentation / Follow-ups
1. Add a short note to `docs/JENGA_REMAINING_ISSUES.md` describing that an “advanced physics” path exists and pointing to this plan.
2. Add a short “Design Note” badge in `docs/JENGA_TECH_SPEC.md` referencing this plan for future engineers.

---

## ✅ Immediate Next Step (If you want to start implementation)
1. Build the Rapier contact tracking hook (`ContactTracker`) in `src/frontend/src/games/jenga/physics/RapierPhysics.ts`.
2. Add unit tests verifying support/contact counts on a small tower.
3. Swap heuristic extraction and collapse checks to use the new support/contact data.

---

If you want, I can also **create a minimal proof-of-concept patch** (with code) that implements the contact-based support tracking and rewires the extraction/collapse decision logic. Just say “please implement the PoC patch” and I’ll generate it directly.  ✅
