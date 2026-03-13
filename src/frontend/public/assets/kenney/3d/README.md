# Kenney 3D Assets

This folder contains CC0 3D assets from Kenney (kenney.nl)

## Structure

- `marble/` - Marble Kit (track pieces for physics games)
- `platformer/` - Platformer Kit (terrain, hazards, collectibles)
- `characters/` - Blocky Characters (18 unique characters)
- `food/` - Food Kit (fruits, vegetables, meals)
- `nature/` - Nature Kit (trees, rocks, environment)
- `building/` - Building Kit (modular buildings)
- `cars/` - Toy Car Kit (vehicles)
- `space/` - Space Kit (rockets, planets)
- `audio/` - Sound effects

## Usage

```tsx
import { useGLTF } from '@react-three/drei';

function MyComponent() {
  const { scene } = useGLTF('/assets/kenney/3d/marble/straight.glb');
  return <primitive object={scene} />;
}
```

## License

CC0 - Public Domain
No attribution required (but appreciated)
https://kenney.nl/
