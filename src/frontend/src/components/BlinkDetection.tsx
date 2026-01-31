import React, { useState, useEffect, useRef } from 'react';

interface BlinkDetectionProps {
  onBlinkDetected: () => void;
  sensitivity?: number; // Lower is more sensitive (default 0.1)
  debounceMs?: number; // Minimum time between blinks (default 200ms)
}

const BlinkDetection: React.FC<BlinkDetectionProps> = ({
  onBlinkDetected,
  sensitivity = 0.1,
  debounceMs = 200
}) => {
  const [blinkCount, setBlinkCount] = useState<number>(0);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [lastBlinkTime, setLastBlinkTime] = useState<number>(0);
  const [status, setStatus] = useState<string>('Initializing...');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const previousEyeOpenness = useRef<number | null>(null);
  
  // Initialize camera and start detection
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 320, height: 240 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStatus('Looking for eyes...');
          setIsDetecting(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setStatus('Camera access denied');
      }
    };

    initCamera();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clean up camera stream
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Simple eye detection algorithm using brightness changes in eye region
  useEffect(() => {
    if (!isDetecting || !videoRef.current || !canvasRef.current) return;

    const detectEyes = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(detectEyes);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(detectEyes);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simple eye detection by sampling brightness in eye regions
      // This is a simplified approach - in a real app, you'd use MediaPipe or similar
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Approximate eye positions (simplified - in reality you'd use face mesh)
      const eyeRegions = [
        { x: canvas.width * 0.3, y: canvas.height * 0.4, w: canvas.width * 0.1, h: canvas.height * 0.1 }, // Left eye
        { x: canvas.width * 0.6, y: canvas.height * 0.4, w: canvas.width * 0.1, h: canvas.height * 0.1 }  // Right eye
      ];

      let totalBrightness = 0;
      let pixelCount = 0;

      eyeRegions.forEach(region => {
        const startX = Math.floor(region.x);
        const startY = Math.floor(region.y);
        const endX = Math.min(Math.floor(region.x + region.w), canvas.width);
        const endY = Math.min(Math.floor(region.y + region.h), canvas.height);

        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * canvas.width + x) * 4;
            // Calculate brightness (average of RGB)
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            totalBrightness += brightness;
            pixelCount++;
          }
        }
      });

      const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0;
      
      // Detect blink based on change in brightness
      if (previousEyeOpenness.current !== null) {
        const change = Math.abs(previousEyeOpenness.current - avgBrightness);
        
        // If brightness drops significantly, likely a blink
        if (change > 255 * sensitivity && 
            Date.now() - lastBlinkTime > debounceMs) {
          setBlinkCount(prev => prev + 1);
          setLastBlinkTime(Date.now());
          onBlinkDetected();
        }
      }

      previousEyeOpenness.current = avgBrightness;
      animationRef.current = requestAnimationFrame(detectEyes);
    };

    animationRef.current = requestAnimationFrame(detectEyes);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDetecting, sensitivity, debounceMs, onBlinkDetected, lastBlinkTime]);

  return (
    <div className="hidden"> {/* Hidden component - only for detection purposes */}
      <video 
        ref={videoRef} 
        playsInline
        muted
        className="hidden"
      />
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
      <div className="text-xs text-slate-600">
        Blink Detection: {status} | Blinks: {blinkCount}
      </div>
    </div>
  );
};

export default BlinkDetection;