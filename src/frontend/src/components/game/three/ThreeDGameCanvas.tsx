import React, { ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { FPSCounter } from './FPSCounter';

interface ThreeDGameCanvasProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  enableOrbit?: boolean;
  showStats?: boolean;
  /** Show FPS counter overlay (dev mode only by default) */
  showFPS?: boolean;
  /** FPS warning threshold (default: 30) */
  fpsThreshold?: number;
  backgroundColor?: string;
  environment?: 'studio' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | null;
  className?: string;
  shadows?: boolean;
  dpr?: [number, number];
}

// Error boundary for 3D errors
class ThreeErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full bg-red-900/20 text-red-500 p-8">
          <div className="text-center">
            <p className="text-xl font-bold mb-2">3D Error</p>
            <p>Something went wrong with the 3D view.</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
              onClick={() => this.setState({ hasError: false })}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lighting setup component
function GameLighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#b0c4de"
      />
      
      {/* Rim light for depth */}
      <spotLight
        position={[0, 10, -10]}
        intensity={0.5}
        angle={Math.PI / 6}
        penumbra={1}
        color="#ffffff"
      />
    </>
  );
}

// Main canvas component
export function ThreeDGameCanvas({
  children,
  cameraPosition = [5, 5, 5],
  cameraTarget = [0, 0, 0],
  enableOrbit = true,
  showStats = false,
  showFPS = false,
  fpsThreshold = 30,
  backgroundColor = '#1e293b',
  environment = 'studio',
  className = '',
  shadows = true,
  dpr = [1, 2],
}: ThreeDGameCanvasProps) {
  return (
    <ThreeErrorBoundary>
      <div className={`w-full h-full min-h-[400px] ${className}`}>
        <Canvas
          shadows={shadows}
          dpr={dpr}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            // Optimize for performance
            gl.setClearColor(backgroundColor);
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            {/* Camera setup */}
            <PerspectiveCamera
              makeDefault
              position={cameraPosition}
              fov={50}
              near={0.1}
              far={1000}
            />
            
            {/* Lighting */}
            <GameLighting />
            
            {/* Environment lighting */}
            {environment && (
              <Environment preset={environment} background={false} />
            )}
            
            {/* Game content */}
            {children}
            
            {/* Camera controls */}
            {enableOrbit && (
              <OrbitControls
                target={cameraTarget}
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={30}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below ground
              />
            )}
            
            {/* Performance stats (dev only) */}
            {showStats && <Stats />}
          </Suspense>
        </Canvas>
        
        {/* FPS Counter overlay (dev mode or when explicitly enabled) */}
        {showFPS && (
          <FPSCounter 
            warningThreshold={fpsThreshold}
            showMemory={import.meta.env.DEV}
          />
        )}
      </div>
    </ThreeErrorBoundary>
  );
}

export default ThreeDGameCanvas;
