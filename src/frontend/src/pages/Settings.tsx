import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore, useProgressStore } from '../store';
import { getAlphabet } from '../data/alphabets';
import { UIIcon } from '../components/ui/Icon';
import { Button, Card, CardHeader } from '../components/ui';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';

export function Settings() {
  const settings = useSettingsStore();
  const {
    unlockAllBatches,
    resetProgress,
    getUnlockedBatches,
    getMasteredLettersCount,
  } = useProgressStore();
  const confirm = useConfirm();
  const toast = useToast();
  const [cameraPermission, setCameraPermission] = useState<
    'granted' | 'denied' | 'prompt'
  >('prompt');
  const [parentGatePassed, setParentGatePassed] = useState(false);
  const [holdingGate, setHoldingGate] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (holdingGate) {
      interval = setInterval(() => {
        setHoldDuration((prev) => {
          if (prev >= 3000) {
            clearInterval(interval);
            setHoldingGate(false);
            setParentGatePassed(true);
            return prev;
          }
          return prev + 100;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [holdingGate]);

  const handleGateStart = () => {
    setHoldingGate(true);
    setHoldDuration(0);
  };

  const handleGateEnd = () => {
    setHoldingGate(false);
    setHoldDuration(0);
  };

  useEffect(() => {
    return () => {
      setParentGatePassed(false);
      setHoldingGate(false);
      setHoldDuration(0);
    };
  }, []);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');

        result.addEventListener('change', () => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        });
      } catch {
        // Fallback: try to get user media
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(() => setCameraPermission('granted'))
          .catch(() => setCameraPermission('denied'));
      }
    };

    checkCameraPermission();
  }, []);

  const handleCameraToggle = async () => {
    if (!settings.cameraEnabled) {
      // Trying to enable camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        settings.updateSettings({ cameraEnabled: true });
        setCameraPermission('granted');
      } catch {
        settings.updateSettings({ cameraEnabled: false });
        setCameraPermission('denied');
        alert(
          'Camera permission denied. Please allow camera access in your browser settings.',
        );
      }
    } else {
      // Disabling camera
      settings.updateSettings({ cameraEnabled: false });
    }
  };

  const handleReset = () => {
    settings.resetSettings();
    setShowResetConfirm(false);
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!parentGatePassed && (
          <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white rounded-2xl p-8 max-w-md text-center'>
              <h2 className='text-2xl font-bold mb-4'>Parent Gate</h2>
              <p className='text-gray-600 mb-6'>
                Hold button below for 3 seconds to access Settings. This
                prevents children from accidentally changing settings.
              </p>
              <button
                onMouseDown={handleGateStart}
                onMouseUp={handleGateEnd}
                onMouseLeave={handleGateEnd}
                onTouchStart={handleGateStart}
                onTouchEnd={handleGateEnd}
                className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition ${
                  holdingGate
                    ? 'bg-red-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {holdingGate
                  ? `Holding... ${(holdDuration / 1000).toFixed(1)}s`
                  : '👆 Hold to Access Settings (3s)'}
              </button>
              <div className='mt-6 text-sm text-gray-500'>
                Press and hold to continue
              </div>
            </div>
          </div>
        )}

        {parentGatePassed && (
          <>
            <h1 className='text-3xl font-bold mb-8'>Settings</h1>

            <div className='max-w-2xl space-y-6'>
              {/* Learning Preferences */}
              <div className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <h2 className='text-xl font-semibold mb-4'>
                  Learning Preferences
                </h2>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-white/80 mb-2'>
                      UI Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        settings.updateSettings({ language: e.target.value })
                      }
                      aria-label='Application UI language'
                      className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                    >
                      <option value='english'>English</option>
                      <option value='hindi'>Hindi (हिन्दी)</option>
                      <option value='kannada'>Kannada (ಕನ್ನಡ)</option>
                      <option value='telugu'>Telugu (తెలుగు)</option>
                      <option value='tamil'>Tamil (தமிழ்)</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-white/80 mb-2'>
                      Game Language
                    </label>
                    <select
                      value={settings.gameLanguage}
                      onChange={(e) =>
                        settings.updateSettings({
                          gameLanguage: e.target.value,
                        })
                      }
                      aria-label='Game content language'
                      className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                    >
                      <option value='english'>English</option>
                      <option value='hindi'>Hindi (हिन्दी)</option>
                      <option value='kannada'>Kannada (ಕನ್ನಡ)</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-white/80 mb-2'>
                      Difficulty
                    </label>
                    <select
                      value={settings.difficulty}
                      onChange={(e) =>
                        settings.updateSettings({ difficulty: e.target.value })
                      }
                      aria-label='Game difficulty level'
                      className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                    >
                      <option value='easy'>Easy</option>
                      <option value='medium'>Medium</option>
                      <option value='hard'>Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-white/80 mb-2'>
                      Sound Effects
                    </label>
                    <div className='flex items-center justify-between bg-white/10 border border-border rounded-lg px-4 py-3 shadow-sm'>
                      <span className='text-white/60'>Enable sounds</span>
                      <button
                        onClick={() =>
                          settings.updateSettings({
                            soundEnabled: !settings.soundEnabled,
                          })
                        }
                        aria-label={
                          settings.soundEnabled
                            ? 'Disable sound effects'
                            : 'Enable sound effects'
                        }
                        className={`w-12 h-6 rounded-full transition ${
                          settings.soundEnabled ? 'bg-red-500' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition transform ${
                            settings.soundEnabled
                              ? 'translate-x-6'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Camera Settings */}
              <div className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <h2 className='text-xl font-semibold mb-4'>Camera Settings</h2>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between bg-white/10 border border-border rounded-lg px-4 py-3 shadow-sm'>
                    <div>
                      <div className='font-medium'>Enable Camera</div>
                      <div className='text-sm text-white/60'>
                        Required for hand tracking features
                      </div>
                    </div>
                    <button
                      onClick={handleCameraToggle}
                      aria-label={
                        settings.cameraEnabled
                          ? 'Disable camera access'
                          : 'Enable camera access'
                      }
                      className={`w-12 h-6 rounded-full transition ${
                        settings.cameraEnabled ? 'bg-red-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition transform ${
                          settings.cameraEnabled
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Camera Permission Status */}
                  <div
                    className={`text-sm px-4 py-2 rounded-lg ${
                      cameraPermission === 'granted'
                        ? 'bg-green-500/20 text-green-400'
                        : cameraPermission === 'denied'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {cameraPermission === 'granted' && (
                      <span className="flex items-center gap-2">
                        <UIIcon name="check" size={16} className="text-green-400" />
                        Camera permission granted
                      </span>
                    )}
                    {cameraPermission === 'denied' && (
                      <span className="flex items-center gap-2">
                        <UIIcon name="warning" size={16} />
                        Camera permission denied - check browser settings
                      </span>
                    )}
                    {cameraPermission === 'prompt' && (
                      <span className="flex items-center gap-2">
                        <UIIcon name="warning" size={16} />
                        Camera permission not requested yet
                      </span>
                    )}
                  </div>

                  {/* Privacy Note */}
                  <div className='text-sm text-white/50 bg-white/10 rounded-lg p-3'>
                    <strong className='text-white/70'>Privacy:</strong> Camera
                    data is processed locally on your device. No video is sent
                    to our servers.
                  </div>
                </div>
              </div>

              {/* Parental Controls */}
              <div className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <h2 className='text-xl font-semibold mb-4'>
                  Parental Controls
                </h2>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between bg-white/5 border border-white/20 rounded-lg px-4 py-3'>
                    <div>
                      <div className='font-medium'>Daily Time Limit</div>
                      <div className='text-sm text-white/60'>
                        Limit play time per day
                      </div>
                    </div>
                    <select
                      value={settings.timeLimit}
                      onChange={(e) =>
                        settings.updateSettings({
                          timeLimit: parseInt(e.target.value),
                        })
                      }
                      aria-label='Daily time limit'
                      className='px-3 py-2 bg-white/10 border border-border rounded-lg shadow-sm'
                    >
                      <option value={0}>No limit</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div className='flex items-center justify-between bg-white/10 border border-border rounded-lg px-4 py-3 shadow-sm'>
                    <div>
                      <div className='font-medium'>Show Letter Hints</div>
                      <div className='text-sm text-white/60'>
                        Display tracing guides
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        settings.updateSettings({
                          showHints: !settings.showHints,
                        })
                      }
                      aria-label={
                        settings.showHints
                          ? 'Hide letter hints'
                          : 'Show letter hints'
                      }
                      className={`w-12 h-6 rounded-full transition ${
                        settings.showHints ? 'bg-red-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition transform ${
                          settings.showHints
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Parent Controls */}
              <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
                <h2 className='text-xl font-semibold mb-4'>Parent Controls</h2>

                <div className='space-y-4'>
                  {/* Progress Summary */}
                  <div className='bg-white/10 rounded-lg p-4 shadow-sm'>
                    <div className='text-sm text-white/60 mb-2'>
                      Alphabet Learning Progress
                    </div>
                    <div className='text-2xl font-bold'>
                      {getMasteredLettersCount(settings.language)} /{' '}
                      {getAlphabet(settings.language).letters.length} letters
                      mastered
                    </div>
                    <div className='text-sm text-white/60 mt-1'>
                      Batch {getUnlockedBatches(settings.language)} unlocked
                    </div>
                  </div>

                  <Button
                    variant="success"
                    fullWidth
                    icon="unlock"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Unlock All Letters?',
                        message: 'This will unlock all letters immediately. Your child will skip the progressive learning experience.',
                        confirmText: 'Yes, Unlock All',
                        cancelText: 'Cancel',
                        type: 'warning',
                      });
                      if (confirmed) {
                        const totalLetters = getAlphabet(settings.language).letters.length;
                        const totalBatches = Math.ceil(totalLetters / 5);
                        unlockAllBatches(settings.language, totalBatches);
                        toast.showToast('All letters unlocked!', 'success');
                      }
                    }}
                  >
                    Unlock All Letters
                  </Button>

                  <Button
                    variant="secondary"
                    fullWidth
                    icon="warning"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Reset Letter Progress?',
                        message: 'This will reset all letter progress. This cannot be undone.',
                        confirmText: 'Yes, Reset',
                        cancelText: 'Cancel',
                        type: 'danger',
                      });
                      if (confirmed) {
                        resetProgress(settings.language);
                        toast.showToast('Letter progress reset', 'success');
                      }
                    }}
                  >
                    Reset Letter Progress
                  </Button>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <h2 className='text-xl font-semibold mb-4'>Data & Privacy</h2>

                <div className='space-y-3'>
                  <Button
                    variant="secondary"
                    fullWidth
                    icon="download"
                    onClick={() => {
                      toast.showToast('Export feature coming soon!', 'info');
                    }}
                  >
                    Export Learning Data
                  </Button>

                  <Button
                    variant="secondary"
                    fullWidth
                    icon="warning"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Reset All Settings?',
                        message: 'This will reset all settings to default. This cannot be undone.',
                        confirmText: 'Yes, Reset',
                        cancelText: 'Cancel',
                        type: 'danger',
                      });
                      if (confirmed) {
                        handleReset();
                        toast.showToast('Settings reset to default', 'success');
                      }
                    }}
                  >
                    Reset All Settings
                  </Button>
                </div>
              </div>

              {/* App Info */}
              <div className='text-center text-white/40 text-sm'>
                <p>Advay Learning App v1.0.0</p>
                <p className='mt-1 flex items-center justify-center gap-1'>
                  Built with <UIIcon name="heart" size={14} className="text-red-400" /> for kids everywhere
                </p>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
