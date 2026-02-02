import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettingsStore, useProgressStore, useAuthStore } from '../store';
import { getAlphabet } from '../data/alphabets';
import { UIIcon } from '../components/ui/Icon';
import { Button } from '../components/ui';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';

export function Settings() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const { logout, user } = useAuthStore();
  const {
    unlockAllBatches,
    resetProgress,
    getUnlockedBatches,
    getMasteredLettersCount,
  } = useProgressStore();
  const confirm = useConfirm();
  const toast = useToast();
  const cameraPermission = settings.cameraPermissionState;
  const [parentGatePassed, setParentGatePassed] = useState(false);
  const [holdingGate, setHoldingGate] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);
  
  // Alternative method: math challenge for accessibility
  const [showMathChallenge, setShowMathChallenge] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const mathProblem = useMemo(() => {
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * 10) + 5;
    return { a, b, answer: a + b };
  }, []);
  
  // Refs for focus management
  const gateDialogRef = useRef<HTMLDivElement>(null);
  const holdButtonRef = useRef<HTMLButtonElement>(null);
  const goBackButtonRef = useRef<HTMLButtonElement>(null);
  const mathInputRef = useRef<HTMLInputElement>(null);

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

  const handleCancelGate = useCallback(() => {
    setHoldingGate(false);
    setHoldDuration(0);
    setShowMathChallenge(false);
    setMathAnswer('');
    window.history.back();
  }, []);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer, 10) === mathProblem.answer) {
      setParentGatePassed(true);
      setShowMathChallenge(false);
    } else {
      setMathAnswer('');
      mathInputRef.current?.focus();
    }
  };

  // Focus management for modal
  useEffect(() => {
    if (!parentGatePassed) {
      if (showMathChallenge) {
        mathInputRef.current?.focus();
      } else {
        holdButtonRef.current?.focus();
      }
    }
  }, [parentGatePassed, showMathChallenge]);

  // Esc key and focus trapping
  useEffect(() => {
    if (parentGatePassed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancelGate();
        return;
      }

      // Focus trap within modal
      if (e.key === 'Tab' && gateDialogRef.current) {
        const focusable = gateDialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [parentGatePassed, handleCancelGate]);

  useEffect(() => {
    return () => {
      setParentGatePassed(false);
      setHoldingGate(false);
      setHoldDuration(0);
      setShowMathChallenge(false);
      setMathAnswer('');
    };
  }, []);

  // Sync camera permission state on mount (only if unknown)
  useEffect(() => {
    if (cameraPermission !== 'unknown') return;

    const syncPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        if (result.state === 'granted' || result.state === 'denied') {
          settings.updateSettings({ cameraPermissionState: result.state });
        }
      } catch {
        // API not supported, leave as unknown until user interacts
      }
    };

    syncPermission();
  }, [cameraPermission, settings]);

  const handleCameraToggle = async () => {
    if (!settings.cameraEnabled) {
      // Trying to enable camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        settings.updateSettings({
          cameraEnabled: true,
          cameraPermissionState: 'granted',
        });
      } catch {
        settings.updateSettings({
          cameraEnabled: false,
          cameraPermissionState: 'denied',
        });
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
  };

  return (
    <section className='max-w-7xl mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!parentGatePassed && (
          <div 
            className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'
            role='dialog'
            aria-modal='true'
            aria-labelledby='parent-gate-title'
            aria-describedby='parent-gate-desc'
          >
            <div 
              ref={gateDialogRef}
              className='bg-white rounded-2xl p-8 max-w-md text-center mx-4'
            >
              <h2 id='parent-gate-title' className='text-2xl font-bold mb-4'>
                Parent Gate
              </h2>
              
              {!showMathChallenge ? (
                <>
                  <p id='parent-gate-desc' className='text-slate-600 mb-6'>
                    Hold the button below for 3 seconds to access Settings. This
                    prevents children from accidentally changing settings.
                  </p>
                  <button
                    ref={holdButtonRef}
                    onMouseDown={handleGateStart}
                    onMouseUp={handleGateEnd}
                    onMouseLeave={handleGateEnd}
                    onTouchStart={handleGateStart}
                    onTouchEnd={handleGateEnd}
                    aria-label={holdingGate 
                      ? `Holding, ${(holdDuration / 1000).toFixed(1)} seconds elapsed` 
                      : 'Press and hold for 3 seconds to access settings'}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      holdingGate
                        ? 'bg-red-500 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {holdingGate
                      ? `Holding... ${(holdDuration / 1000).toFixed(1)}s`
                      : '👆 Hold to Access Settings (3s)'}
                  </button>
                  {holdingGate && (
                    <progress
                      value={holdDuration}
                      max={3000}
                      aria-label={`Progress: ${Math.round((holdDuration / 3000) * 100)}%`}
                      className='w-full h-1 mt-4 rounded-full progress-accent-red'
                    />
                  )}
                  
                  <div className='mt-6 pt-4 border-t border-slate-200'>
                    <button
                      onClick={() => setShowMathChallenge(true)}
                      className='text-sm text-slate-500 hover:text-slate-700 underline transition'
                      type='button'
                    >
                      Can't hold the button? Try an alternative method
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p id='parent-gate-desc' className='text-slate-600 mb-6'>
                    Solve this math problem to verify you're an adult.
                  </p>
                  <form onSubmit={handleMathSubmit} className='space-y-4'>
                    <div className='text-3xl font-bold text-slate-800'>
                      {mathProblem.a} + {mathProblem.b} = ?
                    </div>
                    <input
                      ref={mathInputRef}
                      type='number'
                      inputMode='numeric'
                      value={mathAnswer}
                      onChange={(e) => setMathAnswer(e.target.value)}
                      placeholder='Enter answer'
                      className='w-full px-4 py-3 text-center text-2xl border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      aria-label={`What is ${mathProblem.a} plus ${mathProblem.b}?`}
                    />
                    <button
                      type='submit'
                      disabled={!mathAnswer}
                      className='w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
                    >
                      Submit
                    </button>
                  </form>
                  <button
                    onClick={() => setShowMathChallenge(false)}
                    className='mt-4 text-sm text-slate-500 hover:text-slate-700 underline transition'
                    type='button'
                  >
                    ← Back to hold button
                  </button>
                </>
              )}
              
              <div className='flex gap-3 mt-6 justify-center'>
                <button
                  ref={goBackButtonRef}
                  onClick={handleCancelGate}
                  className='px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 rounded'
                  type='button'
                >
                  ← Go Back
                </button>
                <span className='text-sm text-slate-400' aria-hidden='true'>
                  or press ESC to cancel
                </span>
              </div>
            </div>
          </div>
        )}

        {parentGatePassed && (
          <>
            <h1 className='text-3xl font-bold mb-8'>Settings</h1>

            <div className='max-w-2xl space-y-6'>
              {/* Learning Preferences */}
              <fieldset className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <legend className='text-xl font-semibold mb-4'>
                  Learning Preferences
                </legend>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
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
                      <option value='en'>English</option>
                      <option value='hi'>Hindi (हिन्दी)</option>
                      <option value='kn'>Kannada (ಕನ್ನಡ)</option>
                      <option value='te'>Telugu (తెలుగు)</option>
                      <option value='ta'>Tamil (தமிழ்)</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
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
                      <option value='en'>English</option>
                      <option value='hi'>Hindi (हिन्दी)</option>
                      <option value='kn'>Kannada (ಕನ್ನಡ)</option>
                      <option value='te'>Telugu (తెలుగు)</option>
                      <option value='ta'>Tamil (தமிழ்)</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
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
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Sound Effects
                    </label>
                    <div className='flex items-center justify-between bg-white/10 border border-border rounded-lg px-4 py-3 shadow-sm'>
                      <span className='text-slate-600'>Enable sounds</span>
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
              </fieldset>

              {/* Camera Settings */}
              <fieldset className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <legend className='text-xl font-semibold mb-4'>
                  Camera Settings
                </legend>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between bg-white/10 border border-border rounded-lg px-4 py-3 shadow-sm'>
                    <div>
                      <div className='font-medium'>Enable Camera</div>
                      <div className='text-sm text-slate-600'>
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

                  {/* Camera Permission Status - only show for granted or denied */}
                  {cameraPermission === 'granted' && (
                    <div className='text-sm px-4 py-2 rounded-lg bg-green-500/20 text-green-400'>
                      <span className='flex items-center gap-2'>
                        <UIIcon
                          name='check'
                          size={16}
                          className='text-green-400'
                        />
                        Camera permission granted
                      </span>
                    </div>
                  )}
                  {cameraPermission === 'denied' && (
                    <div className='text-sm px-4 py-2 rounded-lg bg-red-500/20 text-red-400'>
                      <span className='flex items-center gap-2'>
                        <UIIcon name='warning' size={16} />
                        Camera permission denied - check browser settings
                      </span>
                    </div>
                  )}

                  {/* Hand Tracking Delegate */}
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Hand Tracking Mode
                    </label>
                    <select
                      value={settings.handTrackingDelegate}
                      onChange={(e) =>
                        settings.updateSettings({
                          handTrackingDelegate: e.target.value as 'GPU' | 'CPU',
                        })
                      }
                      aria-label='Hand tracking processing mode'
                      className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                    >
                      <option value='GPU'>
                        GPU (Faster, requires good graphics)
                      </option>
                      <option value='CPU'>
                        CPU (Compatible with all devices)
                      </option>
                    </select>
                    <p className='text-sm text-slate-500 mt-2'>
                      GPU mode is faster but may not work on all devices. The
                      app will automatically fall back to CPU if needed.
                    </p>
                  </div>

                  {/* Privacy Note */}
                  <div className='text-sm text-slate-500 bg-white/10 rounded-lg p-3'>
                    <strong className='text-slate-600'>Privacy:</strong> Camera
                    data is processed locally on your device. No video is sent
                    to our servers.
                  </div>
                </div>
              </fieldset>

              {/* Parental Controls */}
              <fieldset className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <legend className='text-xl font-semibold mb-4'>
                  Parental Controls
                </legend>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between bg-white/10 border border-border rounded-lg px-4 py-3 shadow-sm'>
                    <div>
                      <div className='font-medium'>Daily Time Limit</div>
                      <div className='text-sm text-slate-600'>
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
                      <div className='text-sm text-slate-600'>
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

                  <div className='flex items-center justify-between bg-white/10 border border-border rounded-lg px-4 py-3 shadow-sm'>
                    <div>
                      <div className='font-medium'>Show Tutorial Again</div>
                      <div className='text-sm text-slate-600'>
                        Reset tutorial for next game session
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        settings.updateSettings({
                          tutorialCompleted: false,
                          onboardingCompleted: false,
                        });
                        toast.showToast(
                          'Tutorial will show on next game',
                          'success',
                        );
                      }}
                      className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition text-sm'
                    >
                      Reset Tutorial
                    </button>
                  </div>
                </div>
              </fieldset>

              {/* Parent Controls */}
              <fieldset className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <legend className='text-xl font-semibold mb-4'>
                  Parent Controls
                </legend>

                <div className='space-y-4'>
                  {/* Progress Summary */}
                  <div className='bg-white/10 rounded-lg p-4 shadow-sm'>
                    <div className='text-sm text-slate-600 mb-2'>
                      Alphabet Learning Progress
                    </div>
                    <div className='text-2xl font-bold'>
                      {getMasteredLettersCount(settings.language)} /{' '}
                      {getAlphabet(settings.language).letters.length} letters
                      mastered
                    </div>
                    <div className='text-sm text-slate-600 mt-1'>
                      Batch {getUnlockedBatches(settings.language)} unlocked
                    </div>
                  </div>

                  <Button
                    variant='success'
                    fullWidth
                    icon='unlock'
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Unlock All Letters?',
                        message:
                          'This will unlock all letters immediately. Your child will skip the progressive learning experience.',
                        confirmText: 'Yes, Unlock All',
                        cancelText: 'Cancel',
                        type: 'warning',
                      });
                      if (confirmed) {
                        const totalLetters = getAlphabet(settings.language)
                          .letters.length;
                        const totalBatches = Math.ceil(totalLetters / 5);
                        unlockAllBatches(settings.language, totalBatches);
                        toast.showToast('All letters unlocked!', 'success');
                      }
                    }}
                  >
                    Unlock All Letters
                  </Button>

                  <Button
                    variant='secondary'
                    fullWidth
                    icon='warning'
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Reset Letter Progress?',
                        message:
                          'This will reset all letter progress. This cannot be undone.',
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
              </fieldset>

              {/* Account */}
              <fieldset className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <legend className='text-xl font-semibold mb-4'>
                  Account
                </legend>

                <div className='space-y-4'>
                  {user && (
                    <div className='bg-white/10 rounded-lg p-4 shadow-sm'>
                      <div className='text-sm text-slate-600 mb-1'>Signed in as</div>
                      <div className='font-medium'>
                        {user.email.replace(/^(.)[^@]*(@.*)$/, '$1***$2')}
                      </div>
                    </div>
                  )}

                  <Button
                    variant='secondary'
                    fullWidth
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Sign Out?',
                        message: 'Are you sure you want to sign out?',
                        confirmText: 'Sign Out',
                        cancelText: 'Cancel',
                        type: 'warning',
                      });
                      if (confirmed) {
                        await logout();
                        navigate('/login');
                      }
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </fieldset>

              {/* Data & Privacy */}
              <fieldset className='bg-white/10 border border-border rounded-xl p-6 shadow-sm'>
                <legend className='text-xl font-semibold mb-4'>
                  Data & Privacy
                </legend>

                <div className='space-y-3'>
                  <Button
                    variant='secondary'
                    fullWidth
                    icon='download'
                    onClick={() => {
                      toast.showToast('Export feature coming soon!', 'info');
                    }}
                  >
                    Export Learning Data
                  </Button>

                  <Button
                    variant='secondary'
                    fullWidth
                    icon='warning'
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Reset All Settings?',
                        message:
                          'This will reset all settings to default. This cannot be undone.',
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
              </fieldset>

              {/* App Info - version only, main footer is in Layout */}
              <div className='text-center text-slate-500 text-sm'>
                <p>Advay Learning App v1.0.0</p>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
