import { ReactNode } from 'react';
import { Physics } from '@react-three/rapier';

interface PhysicsProviderProps {
  children: ReactNode;
  gravity?: [number, number, number];
  debug?: boolean;
}

export function PhysicsProvider({
  children,
  gravity = [0, -9.82, 0],
  debug = false,
}: PhysicsProviderProps) {
  return (
    <Physics gravity={gravity} debug={debug}>
      {children}
    </Physics>
  );
}

// Pre-configured gravity presets for different game types
export const gravityPresets = {
  // Standard earth gravity
  earth: [0, -9.82, 0] as [number, number, number],

  // Lower gravity for floaty feel
  moon: [0, -1.62, 0] as [number, number, number],

  // Higher gravity for snappy platformers
  arcade: [0, -20, 0] as [number, number, number],

  // Very low gravity for space games
  space: [0, -0.5, 0] as [number, number, number],

  // No gravity for puzzles
  zero: [0, 0, 0] as [number, number, number],
};

export default PhysicsProvider;
