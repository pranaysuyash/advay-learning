# V2 Frontend Exploration: The 3D Virtual Playground

**Date:** 2026-02-21
**Purpose:** Defining an extreme, "out-of-the-box" parallel frontend architecture (`src/frontend-v2-3d`) dedicated entirely to exploring highly interactive, ThreeJS-powered 3D environments, starting with the Landing Page itself.

---

## 1. The Strategy: Parallel Execution

We will not break `src/frontend`. That is our stable, fast, V1 "Neon Glass" 2D app. 
Instead, we will initialize a completely separate directory: **`src/frontend-v2`**.

This enables the ultimate creative freedom to pull in heavy 3D rendering libraries, test wild physics engines, and build "game-engine-like" interfaces without worrying about breaking the parent subscription flow in V1. If V2 succeeds, it completely absorbs V1.

---

## 2. The Big Idea: The Landing Page IS the Playground

**Concept:** The user doesn't hit a standard HTML landing page. They load directly into a fully rendered 3D physics sandbox in their browser using `React Three Fiber`.

### The Experience:
1.  **Loading:** "Waking up Pip..."
2.  **The Scene:** The browser renders a beautiful, low-poly 3D bedroom or playground space (built with CC0 assets from Kenney or AmbientCG).
3.  **The Hook:** A 3D object (like a beach ball) drops from the top of the screen.
4.  **The Interaction (Webcam Auto-Trigger):** A floating semi-transparent prompt says: *"Put your hand up to the camera to block the ball!"*
5.  **The Magic:** As the user raises their real hand, MediaPipe instantly tracks the coordinate, spawns a 3D invisible wall in the ThreeJS physics engine at that coordinate, and the 3D beach ball physically bounces off it.
6.  **The Pivot:** A 3D button falls into the scene: `[Enter The Full Playground — Start 7-Day Trial]`. If the user physically "slaps" the button with their hand, they are taken to the V1 registration flow.

**Why this is brilliant:** Instead of *reading* about the camera tracking, the parent/investor *experiences* it instantly upon visiting the domain. 

---

## 3. Architecture for `frontend-v2`

**Tech Stack:**
*   **Framework:** Vite + React (Extremely fast HMR for 3D iteration)
*   **3D Renderer:** `three` & `@react-three/fiber` (R3F)
*   **3D Helpers:** `@react-three/drei` (For easy camera movement, shadows, environment maps)
*   **Physics Engine:** `@react-three/rapier` (Crucial for the "hand bouncing off objects" feel)
*   **AI Vision:** `@mediapipe/tasks-vision` (Same as V1, running in a WebWorker to prevent dropping ThreeJS frames)

### Phase 1: The "Slap the Block" Prototype
The very first goal in V2 is not an entire game. It is a single, magical micro-interaction.
1. Render a floating 3D cube.
2. Hook up MediaPipe hand tracking.
3. Map the 2D pixel coordinates (x,y) of the index finger to the 3D world space (x,y,z=0).
4. Update a Rapier `KinematicRigidBody` to follow the finger.
5. Watch the rigid body physically collide with the cube, sending it tumbling.

If we can perfect that one interaction, we unlock the door to the entire V2 philosophy. 

---

## 4. Asset Pipeline (CC0)
*   **Environments:** We will use a pre-made GLTF/GLB environment (e.g., Kenney's 'Nature Pack') and load it via `useGLTF`.
*   **Lighting:** R3F handles HDRI environment mapping (from AmbientCG) allowing perfect, realistic global illumination on the cartoon assets.

**Conclusion:** 
Building `frontend-v2` as a pure R3D/ThreeJS playground gives us a safe sandbox to push the absolute limits of web-based spatial computing, while V1 successfully executes the business logic and subscription gates.
