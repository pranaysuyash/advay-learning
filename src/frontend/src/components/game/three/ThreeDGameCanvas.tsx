import React, { ReactNode, Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  Stats,
  PerformanceMonitor,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei';
import * as THREE from 'three';
import { FPSCounter } from './FPSCounter';
import { detectWebGPU, logWebGPUCapabilities } from '../../../utils/webgpu';

type QualityLevel = 'high' | 'medium' | 'low' | 'minimal';
type RendererType = 'webgl' | 'webgpu';

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
  environment?:
    | 'studio'
    | 'sunset'
    | 'dawn'
    | 'night'
    | 'warehouse'
    | 'forest'
    | 'apartment'
    | null;
  className?: string;
  shadows?: boolean;
  dpr?: [number, number];
  /** Enable adaptive quality (default: true) */
  enableAdaptiveQuality?: boolean;
  /** Show WebGPU indicator (dev mode, default: false) */
  showWebGPUIndicator?: boolean;
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
      return (
        this.props.fallback || (
          <div className='flex items-center justify-center h-full bg-red-900/20 text-red-500 p-8'>
            <div className='text-center'>
              <p className='text-xl font-bold mb-2'>3D Error</p>
              <p>Something went wrong with the 3D view.</p>
              <button
                className='mt-4 px-4 py-2 bg-red-500 text-white rounded-lg'
                onClick={() => this.setState({ hasError: false })}
              >
                Retry
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Lighting setup component with quality-aware shadows
function GameLighting({
  shadows = true,
  shadowMapSize = 2048,
}: {
  shadows?: boolean;
  shadowMapSize?: number;
}) {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow={shadows}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
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
        color='#b0c4de'
      />

      {/* Rim light for depth */}
      <spotLight
        position={[0, 10, -10]}
        intensity={0.5}
        angle={Math.PI / 6}
        penumbra={1}
        color='#ffffff'
      />
    </>
  );
}

// Main canvas component with adaptive performance
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
  enableAdaptiveQuality = true,
  showWebGPUIndicator = false,
}: ThreeDGameCanvasProps) {
  const [quality, setQuality] = useState<QualityLevel>('high');
  const [rendererType, setRendererType] = useState<RendererType>('webgl');

  // Detect WebGPU support on mount
  useEffect(() => {
    let mounted = true;

    const checkWebGPU = async () => {
      const support = await detectWebGPU();

      if (mounted) {
        if (support.available) {
          setRendererType('webgpu');
          if (import.meta.env.DEV) {
            logWebGPUCapabilities(support);
          }
        } else {
          setRendererType('webgl');
          if (import.meta.env.DEV) {
            console.log('🎮 WebGPU: Not available, using WebGL fallback');
          }
        }
      }
    };

    checkWebGPU();

    return () => {
      mounted = false;
    };
  }, []);

  // Calculate quality settings based on performance
  const qualitySettings = {
    high: {
      dpr: [1.5, 2] as [number, number],
      shadows: true,
      shadowSize: 2048,
    },
    medium: {
      dpr: [1, 1.5] as [number, number],
      shadows: true,
      shadowSize: 1024,
    },
    low: {
      dpr: [0.75, 1] as [number, number],
      shadows: false,
      shadowSize: 512,
    },
    minimal: {
      dpr: [0.5, 0.75] as [number, number],
      shadows: false,
      shadowSize: 256,
    },
  };

  const currentSettings = qualitySettings[quality];

  const CanvasContent = () => (
    <>
      {enableAdaptiveQuality && (
        <>
          <PerformanceMonitor
            factor={0.5}
            onDecline={() => {
              setQuality((prev) => {
                if (prev === 'high') return 'medium';
                if (prev === 'medium') return 'low';
                if (prev === 'low') return 'minimal';
                return 'minimal';
              });
            }}
            onIncline={() => {
              setQuality((prev) => {
                if (prev === 'minimal') return 'low';
                if (prev === 'low') return 'medium';
                if (prev === 'medium') return 'high';
                return 'high';
              });
            }}
          />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </>
      )}

      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={cameraPosition}
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* Lighting */}
      <GameLighting
        shadows={shadows}
        shadowMapSize={currentSettings.shadowSize}
      />

      {/* Environment lighting */}
      {environment && <Environment preset={environment} background={false} />}

      {/* Game content with quality context */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            quality,
            shadowSize: currentSettings.shadowSize,
          });
        }
        return child;
      })}

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
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      )}

      {/* Performance stats (dev only) */}
      {showStats && <Stats />}
    </>
  );

  return (
    <ThreeErrorBoundary>
      <div className={`w-full h-full min-h-[400px] ${className}`}>
        <Canvas
          shadows={enableAdaptiveQuality ? shadows && currentSettings.shadows : shadows}
          dpr={enableAdaptiveQuality ? currentSettings.dpr : dpr}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(backgroundColor);
            gl.shadowMap.enabled = enableAdaptiveQuality
              ? shadows && currentSettings.shadows
              : true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            <CanvasContent />
          </Suspense>
        </Canvas>

        {/* FPS Counter overlay */}
        {showFPS && (
          <FPSCounter
            warningThreshold={fpsThreshold}
            showMemory={import.meta.env.DEV}
          />
        )}

        {/* WebGPU Indicator (dev mode only) */}
        {showWebGPUIndicator && import.meta.env.DEV && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '6px 12px',
              backgroundColor:
                rendererType === 'webgpu' ? '#10b981' : '#6b7280',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              zIndex: 9999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {rendererType === 'webgpu' ? '🚀 WebGPU' : '🌐 WebGL'}
          </div>
        )}
      </div>
    </ThreeErrorBoundary>
  );
}

export default ThreeDGameCanvas;
