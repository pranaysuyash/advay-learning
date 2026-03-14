import { Html } from '@react-three/drei';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';

interface FPSDisplayProps {
  gameName: string;
  position?: [number, number, number];
}

export function FPSDisplay({ gameName, position = [4, 4, 0] }: FPSDisplayProps) {
  const { fps, averageFps, isPerformant } = usePerformanceMonitor(gameName);
  
  // Only show in development
  if (!import.meta.env.DEV) return null;
  
  const colorClass = isPerformant ? 'text-green-400' : 'text-red-400';
  
  return (
    <Html position={position}>
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }} className="text-white px-3 py-2 rounded-lg font-mono text-sm">
        <div className={`font-bold ${colorClass}`}>{fps} FPS</div>
        <div className="text-xs text-slate-400">avg: {averageFps}</div>
      </div>
    </Html>
  );
}

export default FPSDisplay;
