import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UIIcon } from './ui/Icon';
import { VoiceButton } from './ui/VoiceButton';

interface CameraPermissionScreenProps {
  onAllowCamera: () => void;
  onUseTouchMode: () => void;
  mascotName?: string;
}

export function CameraPermissionScreen({
  onAllowCamera,
  onUseTouchMode,
  mascotName = 'Pip',
}: CameraPermissionScreenProps) {
  const [showVideo, setShowVideo] = useState(false);

  const handleAllowCamera = async () => {
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      onAllowCamera();
    } catch {
      // Permission denied or error - fall back to touch mode
      onUseTouchMode();
    }
  };

  return (
    <div className='fixed inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center z-50'>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
          className='bg-white rounded-3xl p-6 md:p-8 max-w-lg mx-4 shadow-2xl'
        >
          {/* Mascot Header */}
          <div className='text-center mb-6'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              className='w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg'
            >
              👋
            </motion.div>
            <h1 className='text-2xl md:text-3xl font-bold text-slate-800 mb-2'>
              Hi! I'm {mascotName}!
            </h1>
            <p className='text-slate-600 text-lg'>
              Let's play and learn together!
            </p>
          </div>

          {/* Main Choice */}
          <div className='space-y-4 mb-6'>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAllowCamera}
              className='w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-3'
            >
              <UIIcon name='camera' size={24} />
              <span>Play with Camera 🎉</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onUseTouchMode}
              className='w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-3 border-2 border-slate-200'
            >
              <UIIcon name='hand' size={24} />
              <span>Use Finger/Mouse 👆</span>
            </motion.button>
          </div>

          {/* Demo Video Toggle */}
          <div className='mb-4'>
            <button
              onClick={() => setShowVideo(!showVideo)}
              className='text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2 mx-auto'
            >
              <UIIcon name='play' size={16} />
              {showVideo ? 'Hide' : 'Show me how it works'}
            </button>

            <AnimatePresence>
              {showVideo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className='overflow-hidden'
                >
                  <div className='mt-3 bg-slate-100 rounded-xl p-4 aspect-video flex items-center justify-center'>
                    {/* Placeholder for demo video */}
                    <div className='text-center text-slate-500'>
                      <UIIcon name='video' size={48} className='mx-auto mb-2 opacity-50' />
                      <p className='text-sm'>Demo video coming soon!</p>
                      <p className='text-xs mt-1'>Shows hand tracking in action</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Privacy Note */}
          <div className='bg-blue-50 rounded-xl p-4 mb-4'>
            <div className='flex items-start gap-3'>
              <UIIcon name='shield' size={20} className='text-blue-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm text-blue-800 font-medium mb-1'>
                  🔒 Your privacy matters
                </p>
                <p className='text-xs text-blue-600 leading-relaxed'>
                  Camera video stays on your device. Nothing is recorded or sent to our servers.
                  You can change this anytime in settings.
                </p>
              </div>
            </div>
          </div>

          {/* Voice Help */}
          <div className='flex items-center justify-center gap-2'>
            <VoiceButton
              text={`Hi! I'm ${mascotName}! We can play with your camera so you can use your hands, or you can use your finger on the screen. Your camera stays private and safe.`}
              label='🔊 Listen'
              size='sm'
              variant='ghost'
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
