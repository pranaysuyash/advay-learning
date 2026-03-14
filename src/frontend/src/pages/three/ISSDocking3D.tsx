import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Vector3, Quaternion } from 'three';
import { initSpacePhysics, SpacePhysics } from '../../games/iss-docking-3d/physics/SpacePhysics';
import { ShipView } from '../../games/iss-docking-3d/components/ShipView';
import { ISSView } from '../../games/iss-docking-3d/components/ISSView';

const GameScene = () => {
  const [physics, setPhysics] = useState<SpacePhysics | null>(null);
  const [shipState, setShipState] = useState({
    position: new Vector3(0, 0, 50),
    rotation: new Quaternion(),
  });
  
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    initSpacePhysics().then(setPhysics);

    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!physics) return;

    // Movement Controls (WASD + Space/Shift)
    const thrust = new Vector3(0, 0, 0);
    if (keys.current['w']) thrust.z -= 1;
    if (keys.current['s']) thrust.z += 1;
    if (keys.current['a']) thrust.x -= 1;
    if (keys.current['d']) thrust.x += 1;
    if (keys.current[' ']) thrust.y += 1;
    if (keys.current['Shift']) thrust.y -= 1;

    // Rotation Controls (Arrow Keys + Q/E)
    const torque = new Vector3(0, 0, 0);
    if (keys.current['ArrowUp']) torque.x -= 0.1;
    if (keys.current['ArrowDown']) torque.x += 0.1;
    if (keys.current['ArrowLeft']) torque.y += 0.1;
    if (keys.current['ArrowRight']) torque.y -= 0.1;
    if (keys.current['q']) torque.z += 0.1;
    if (keys.current['e']) torque.z -= 0.1;

    physics.applyShipForce(thrust.multiplyScalar(10), torque.multiplyScalar(5));
    physics.step();

    const state = physics.getShipState();
    setShipState({
      position: new Vector3(state.translation.x, state.translation.y, state.translation.z),
      rotation: new Quaternion(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w),
    });
  });

  return (
    <>
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <ambientLight intensity={0.2} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      
      <Suspense fallback={null}>
        <ShipView position={shipState.position} rotation={shipState.rotation} />
        <ISSView position={new Vector3(0, 0, 0)} rotation={new Quaternion()} />
      </Suspense>

      <OrbitControls makeDefault />
      <PerspectiveCamera makeDefault position={[0, 10, 30]} />
    </>
  );
};

const ISSDocking3D: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas shadows>
        <GameScene />
      </Canvas>
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif' }}>
        <h1>ISS Docking 3D</h1>
        <p>WASD: Thrust | Space/Shift: Up/Down | Arrows: Rotation | Q/E: Roll</p>
      </div>
    </div>
  );
};

export default ISSDocking3D;
