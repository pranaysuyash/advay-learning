import { ReactNode } from 'react';
import { Physics, Debug } from '@react-three/cannon';

interface PhysicsProviderProps {
  children: ReactNode;
  gravity?: [number, number, number];
  iterations?: number;

  allowSleep?: boolean;
  debug?: boolean;
}

export function PhysicsProvider({
  children,
  gravity = [0, -9.82, 0],
  iterations = 10,

  allowSleep = true,
  debug = false,
}: PhysicsProviderProps) {
  return (
    <Physics
      gravity={gravity}
      iterations={iterations}

      allowSleep={allowSleep}
      defaultContactMaterial={{
        friction: 0.6,
        restitution: 0.1,
        contactEquationStiffness: 1e7,
        contactEquationRelaxation: 1,
        frictionEquationStiffness: 1e7,
        frictionEquationRelaxation: 2,
      }}
    >
      {debug ? <Debug color="red">{children}</Debug> : children}
    </Physics>
  );
}

// Pre-configured physics presets for different game types
export const physicsPresets = {
  // Standard earth gravity
  earth: {
    gravity: [0, -9.82, 0] as [number, number, number],
    iterations: 10,
  },
  
  // Lower gravity for floaty feel
  moon: {
    gravity: [0, -1.62, 0] as [number, number, number],
    iterations: 10,
  },
  
  // Higher gravity for snappy platformers
  arcade: {
    gravity: [0, -20, 0] as [number, number, number],
    iterations: 10,
  },
  
  // Very low gravity for space games
  space: {
    gravity: [0, -0.5, 0] as [number, number, number],
    iterations: 5,
  },
  
  // No gravity for puzzles
  zero: {
    gravity: [0, 0, 0] as [number, number, number],
    iterations: 10,
  },
};

export default PhysicsProvider;
