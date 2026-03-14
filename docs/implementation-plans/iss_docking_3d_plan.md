# Implementation Plan: ISS Docking 3D Prototype

## Goal
Modernize the **ISS Docking** game by transitioning from a 2D canvas implementation to a full 3D orbital physics simulation using the patterns established in Jenga 3D.

## Proposed Changes

### [ISS Docking 3D Core]
- **Physics**: Move from manual 2D math to **Rapier 3D**. Implement zero-gravity physics with damping to simulate orbital inertia.
- **Controls**: Implement 6-DOF (Degrees of Freedom) controls:
  - Thrust: Forward/Backward, Left/Right, Up/Down.
  - Rotation: Pitch, Yaw, Roll.
- **Environment**: Create a 3D starfield and a large Earth sphere as a background.
- **Models**: Use 3D GLTF models for the ISS and the space capsule.

### [Component Structure]
#### [NEW] ISSDocking3D.tsx (file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/pages/three/ISSDocking3D.tsx)
The main entry point for the 3D game, wrapping the R3F Canvas and HUD.

#### [NEW] games/iss-docking-3d/ (file:///Users/pranay/Projects/learning_for_kids/src/frontend/src/games/iss-docking-3d/)
New directory for the 3D-specific logic:
- `domain/ISSShip.ts`: Domain model for the capsule.
- `physics/SpacePhysics.ts`: Rapier initialization with zero-gravity.
- `components/ShipView.tsx`: 3D rendering of the capsule.
- `components/ISSView.tsx`: 3D rendering of the station.

## Verification Plan
### Automated Tests
- Physics stability tests for zero-gravity movement.
- Coordinate transformation validation (ensuring HUD markers align with 3D positions).

### Manual Verification
- Verify controls feel responsive and "space-like" (drifting).
- Test docking collision detection.
- Confirm visual fidelity of the 3D environment.
