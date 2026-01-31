import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarCaptureProps {
  isOpen: boolean;
  profileId: string;
  onClose: () => void;
  onSavePhoto: (photoUrl: string) => void;
}

export function AvatarCapture({
  isOpen,
  profileId,
  onClose,
  onSavePhoto,
}: AvatarCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);

    setIsCountdown(true);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountdown(false);
          return prev - 1;
        }
        return prev - 1;
      });
    }, 1000);
  }, [videoRef, canvasRef]);

  void handleCapture; // Use variable to avoid unused warning

  const handleRetake = () => {
    setCapturedPhoto(null);
    setIsCountdown(false);
    setIsCapturing(false);
  };

  const handleSavePhoto = useCallback(async () => {
    if (!capturedPhoto) return;

    setIsCapturing(true);

    try {
      // TODO: Upload to backend when endpoint is implemented
      // const formData = new FormData();
      // formData.append('profile_id', profileId);
      // formData.append('photo', dataUrlToBlob(capturedPhoto));

      // const response = await apiClient.post('/api/v1/users/me/profiles/${profileId}/photo', formData);

      // onSavePhoto(response.data.avatar_url);

      onClose();
    } finally {
      setIsCapturing(false);
    }
  }, [capturedPhoto, profileId, onSavePhoto, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-8 max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Profile Picture
            </h2>

            {/* Camera View */}
            {!capturedPhoto && !isCountdown && (
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                {!isCapturing && !isCountdown && (
                  <button
                    onClick={handleStartCamera}
                    className="w-full px-6 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition"
                  >
                    📸 Start Camera
                  </button>
                )}
              </div>
            )}

            {/* Photo Preview */}
            {capturedPhoto && !isCapturing && (
              <div className="mt-4">
                <img
                  src={capturedPhoto}
                  alt="Preview"
                  className="w-full rounded-xl border-2 border-border"
                />

                <div className="flex gap-2 justify-center mt-4">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2 bg-white/10 border border-border hover:bg-bg-tertiary rounded-lg transition"
                  >
                    ↩ Retake
                  </button>

                  <button
                    onClick={handleSavePhoto}
                    disabled={isCapturing}
                    className="px-4 py-2 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition disabled:opacity-50"
                  >
                    {isCapturing ? 'Saving...' : 'Use This Photo'}
                  </button>
                </div>
              </div>
            )}

            {/* Countdown */}
            {isCountdown && (
              <div className="text-center text-4xl font-bold text-text-primary">
                {countdown}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
