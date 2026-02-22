# CC0 & 3D Assets Strategy: ThreeJS + MediaPipe

**Date:** 2026-02-21
**Purpose:** Documenting the strategy to elevate the Advay Vision platform from 2D DOM elements to immersive 3D experiences using `Three.js` and high-quality CC0 (Public Domain) free assets.

---

## 1. The Vision: Why 3D?
Currently, our games manipulate standard 2D HTML/SVG elements (like falling letters or dots) based on MediaPipe hand coordinates. 

By introducing **ThreeJS / React Three Fiber (R3F)**, we can unlock a vastly superior level of immersion.
*   **Physics-Based Play:** Kids can physically "slap" a 3D block with their hand. The block will tumble with realistic gravity and momentum.
*   **The Wow Factor Landing Page:** Instead of static 2D hero sections, the landing page can feature a live 3D scene (e.g., interactive floating 3D alphabet blocks that follow the mouse cursor).
*   **Premium Vibe:** High-quality 3D assets make the project feel like a massive studio production (like Nintendo or Apple) rather than an indie web-app.

---

## 2. The CC0 Asset Goldmine
The user has provided an incredible roster of resources for downloading premium, free, public-domain 3D models, textures, and sounds to populate our 200+ games. By using **CC0 (Creative Commons 0)**, we avoid copyright issues completely, even when we monetize.

### Essential CC0 Resources (Bookmarked)
1.  **3D Models & Characters:**
    *   **Quaternius (quaternius.com):** (G.O.A.T for low-poly, rigged, animated characters perfect for games. We can find a base model for "Pip" here).
    *   **Kenney (kenney.nl):** The absolute standard for cohesive, playful game assets. Incredible UI packs, 3D props (food, space, city builder).
    *   **OpenGameArt (opengameart.org):** Massive community collection of models and 2D sprites.
    *   **Reddit /r/gamedev CC0 Mega-Thread:** Treasure trove of hidden assets.

2.  **Textures & Environments:**
    *   **AmbientCG (ambientcg.com):** Seamless PBR textures for realistic rendering (wood floors, soft carpets, etc.).

3.  **Audio & Sound Effects:**
    *   **MixKit (mixkit.co/free-sound-effects/game):** Premium UI clicks, success chimes, and failure "boinks".
    *   **Sonniss GDC Packs:** (If needed, massive gigabytes of professional sound effects).

---

## 3. Integration Architecture: `React Three Fiber`

To merge MediaPipe (Hand Coordinates) with 3D Assets (ThreeJS), we use `@react-three/fiber` and `@react-three/rapier` (for physics).

### Architecture Flow:
1.  **MediaPipe Worker:** Outputs the `x, y, z` coordinates of the index finger.
2.  **Scaling & Translation:** We map the camera pixel coordinates `(0-1920)` to the ThreeJS 3D world space `(-10 to +10)`.
3.  **The "Hand Proxy":** Instead of drawing a dot on the screen, we render an invisible 3D sphere (a Rapier Kinematic RigidBody) exactly where the child's hand is.
4.  **Interaction:** The game logic renders 3D falling blocks (e.g., a 3D apple from Quaternius). When the invisible "Hand Sphere" intersects with the apple, the physics engine takes over and bounces the apple away!

### Code Concept (The 3D Scene):
```tsx
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';

export function 3DAlphabetGame() {
  const handPosition = useHandTracking3D(); // Normalized to world coords

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <Physics>
        {/* The child's hand represented in the physics engine */}
        <RigidBody type="kinematicPosition" position={handPosition}>
          <mesh>
             <sphereGeometry args={[0.5]} />
             <meshStandardMaterial color="#E85D04" />
          </mesh>
        </RigidBody>

        {/* The 3D CC0 Asset falling from the sky */}
        <RigidBody>
          <Gltf src="/assets/models/kenney_apple.glb" position={[0, 10, 0]} />
        </RigidBody>
      </Physics>
    </Canvas>
  );
}
```

## 4. Immediate Next Actions for 3D
1.  **Select a 3D Character for Pip:** Browse Quaternius for a rigged character to represent our playful red panda companion.
2.  **Sound Audit:** Download a set of UI Pop, Success Chime, and Ambient Music tracks from Kenney/Mixkit to inject life into the UI immediately.
3.  **Prototype a 3D Canvas:** Create a single test page (`test/3d-hands`) that connects MediaPipe tracking to a simple `react-three-fiber` box, confirming coordinate mapping works at 60fps.
