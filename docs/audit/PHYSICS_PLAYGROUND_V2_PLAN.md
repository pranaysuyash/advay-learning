# Physics Playground V2 Engineering Plan

Ticket Reference: `TCK-20260305-016`

**Date:** 2026-03-04
**Epic:** Age Progression (Aiming for 8-9+ depth)

---

## 🎯 Goal
Upgrade the Physics Playground to support "Systemic Depth" and "Engineering Constraints" so that older children can build contraptions rather than just watch particles fall. 

This plan addresses Phase 1 of the Age Progression Strategy from `docs/research/AGE_PROGRESSION_MASTER_PLAN.md`.

## 🛠️ Feature Requirements

### 1. The "Chalk Tool" (Interactive Geometry)
- **Mechanic:** A player can press a "Chalk" button (or use a specific hand gesture) to draw freely on the screen.
- **Physics translation:** The drawn line is continuously sampled. When the user stops drawing, the sampled points are passed into `Matter.Bodies.fromVertices()` to create a `isStatic: true` physics body.
- **Result:** Players can build their own ramps, slides, walls, cups, and funnels.

### 2. Elemental Reaction Matrix
- **Mechanic:** When Particle A collides with Particle B, they can react and mutate.
- **Matrix Additions:**
  1. `Fire` + `Leaves` -> Leaves are deleted, spawn more `Fire`, spawn `Gas` (new particle type that floats up).
  2. `Water` + `Fire` -> Both deleted, spawn `Steam`.
  3. `Water` + `Seeds` (new) -> Spawn a static rigid `Plant` body that grows upwards.
- **Implementation:** Modify the collision events in `src/frontend/src/features/physics-playground/physics/CollisionHandler.ts` to check `Matter.Events.on(engine, 'collisionStart', ...)` for specific ParticleTypes.

---

## 📝 Proposed Files & Changes

### 1. `src/frontend/src/features/physics-playground/types.ts`
- [MODIFY] Add new ParticleTypes: `Gas`, `Steam`, `Seed`, `Plant`.
- [MODIFY] Add new Settings option: `mode: 'pour' | 'draw'`.

### 2. `src/frontend/src/pages/PhysicsPlayground.tsx`
- [MODIFY] Add a floating toolbar (like a palette) so users can click between "Pouring Elements" and "Drawing Chalk".
- [MODIFY] Add `onPointerDown`, `onPointerMove`, `onPointerUp` to the `<canvas>` to capture drawing strokes when in `draw` mode.
- [MODIFY] Add UI state for the current drawing line so it can be previewed.

### 3. `src/frontend/src/features/physics-playground/physics/PhysicsWorld.ts`
- [MODIFY] Add a function `addStaticBody(vertices: Vector2[])` to pass the drawn lines into Matter.js.
- [MODIFY] Update the `ParticleEvent` emitter to emit when a line is drawn, so the UI knows it succeeded.

### 4. `src/frontend/src/features/physics-playground/physics/CollisionHandler.ts`
- [MODIFY] Inside the existing collision resolution code, add a `ReactionMatrix` rule dictionary.
- [NEW] Add logical mutations (e.g. deleting bodies via `callbackToRemove` and inserting new bodies) based on the pairs.

## 🧪 Verification Plan
1. Launch app locally `npm run dev`.
2. Go to Physics Playground.
3. Draw a "V" shape with the mouse to create a funnel.
4. Pour water into the funnel. Verify the water pools inside.
5. Add Fire. Pour water on Fire. Verify steam is emitted.

---

**Next Steps:** Wait for User Approval to execute this plan.
