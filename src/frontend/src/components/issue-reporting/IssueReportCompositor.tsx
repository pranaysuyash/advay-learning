import { useEffect, useRef } from 'react';

export interface CompositorMaskRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

interface IssueReportCompositorProps {
  sourceCanvas: HTMLCanvasElement | null;
  width: number;
  height: number;
  active: boolean;
  fps?: number;
  maskRegion?: CompositorMaskRegion;
  onStreamReady?: (stream: MediaStream) => void;
  className?: string;
}

/**
 * IssueReportCompositor
 *
 * Draws a controlled recording surface using a game canvas source and applies
 * deterministic privacy masking for the camera thumbnail region.
 */
export function IssueReportCompositor({
  sourceCanvas,
  width,
  height,
  active,
  fps = 24,
  maskRegion,
  onStreamReady,
  className,
}: IssueReportCompositorProps) {
  const recordingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasEmittedStreamRef = useRef(false);

  useEffect(() => {
    const recordingCanvas = recordingCanvasRef.current;
    if (!recordingCanvas) return;

    const ctx = recordingCanvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      if (sourceCanvas) {
        ctx.drawImage(sourceCanvas, 0, 0, width, height);
      } else {
        // Fallback background if source is unavailable.
        ctx.fillStyle = '#FFF8F0';
        ctx.fillRect(0, 0, width, height);
      }

      if (maskRegion) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(
          maskRegion.x,
          maskRegion.y,
          maskRegion.width,
          maskRegion.height,
        );

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = maskRegion.label || 'Camera hidden for privacy';
        ctx.fillText(
          label,
          maskRegion.x + maskRegion.width / 2,
          maskRegion.y + maskRegion.height / 2,
          Math.max(40, maskRegion.width - 12),
        );
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    if (active) {
      drawFrame();

      if (!hasEmittedStreamRef.current) {
        streamRef.current = recordingCanvas.captureStream(fps);
        hasEmittedStreamRef.current = true;
        onStreamReady?.(streamRef.current);
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, fps, height, maskRegion, onStreamReady, sourceCanvas, width]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      hasEmittedStreamRef.current = false;
    },
    [],
  );

  return (
    <canvas
      ref={recordingCanvasRef}
      width={width}
      height={height}
      className={className || 'hidden'}
      aria-hidden='true'
      data-testid='issue-report-compositor'
    />
  );
}

export default IssueReportCompositor;
