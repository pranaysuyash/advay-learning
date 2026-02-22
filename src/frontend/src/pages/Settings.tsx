import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettingsStore, useProgressStore, useAuthStore } from '../store';
import { getAlphabet } from '../data/alphabets';
import { UIIcon } from '../components/ui/Icon';
import { Button } from '../components/ui';
import { useConfirm } from '../components/ui/useConfirm';
import { useToast } from '../components/ui/useToast';
import { ParentGate } from '../components/ui/ParentGate';

export function Settings() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const { logout, user } = useAuthStore();
  const {
    resetProgress,
    getMasteredLettersCount,
  } = useProgressStore();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const cameraPermission = settings.cameraPermissionState;
  const [parentGatePassed, setParentGatePassed] = useState(false);

  const handleCancelGate = useCallback(() => {
    window.history.back();
  }, []);

  // Sync camera permission state
  useEffect(() => {
    if (cameraPermission !== 'unknown') return;
    const syncPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'granted' || result.state === 'denied') {
          settings.updateSettings({ cameraPermissionState: result.state });
        }
      } catch {
        // Ignore API errors
      }
    };
    syncPermission();
  }, [cameraPermission, settings]);

  const handleCameraToggle = async () => {
    if (!settings.cameraEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        settings.updateSettings({ cameraEnabled: true, cameraPermissionState: 'granted' });
      } catch {
        settings.updateSettings({ cameraEnabled: false, cameraPermissionState: 'denied' });
        alert('Camera permission denied. Please allow camera access in your browser settings.');
      }
    } else {
      settings.updateSettings({ cameraEnabled: false });
    }
  };

  return (
    <section className='min-h-[100dvh] bg-[#FFF8F0] font-nunito pb-20 relative overflow-hidden'>
      {/* Background Decor */}
      <div className='absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl -z-10' />
      <div className='absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl -z-10' />
      {/* Parent Gate */}
      {!parentGatePassed && (
        <ParentGate
          isOpen={!parentGatePassed}
          onUnlock={() => setParentGatePassed(true)}
          onCancel={handleCancelGate}
          title="Advay Zone"
          message="Hold the button below for 3 seconds to access Settings. This prevents children from accidentally changing configurations."
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: parentGatePassed ? 1 : 0, y: parentGatePassed ? 0 : 15 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        {parentGatePassed && (
          <>
            <div className="mb-10 text-center relative z-10">
              <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-[2rem] border-4 border-purple-200 mb-6 drop-shadow-sm">
                <UIIcon name={'settings' as any} size={48} className="text-purple-600" />
              </div>
              <h1 className='text-4xl md:text-5xl font-black text-slate-800 tracking-tight gap-3'>
                Advay Zone
              </h1>
              <p className="text-xl text-slate-500 font-bold mt-4">Manage learning preferences, tools, and parent controls.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

              {/* LEFT COLUMN */}
              <div className="space-y-8">

                {/* Learning Preferences */}
                <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden'>
                  <div className="bg-[#3B82F6] px-8 py-5 border-b-4 border-blue-600">
                    <h2 className='text-2xl font-black text-white flex items-center gap-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]'>
                      <UIIcon name={'target' as any} size={28} className="text-blue-100" />
                      Learning Prefs
                    </h2>
                  </div>
                  <div className='p-8 space-y-8'>
                    <div>
                      <label className='block font-black text-slate-700 mb-3 text-lg'>UI Language</label>
                      <select
                        value={settings.language}
                        onChange={(e) => settings.updateSettings({ language: e.target.value })}
                        className='w-full px-5 py-4 bg-slate-50 border-4 border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/20 focus:border-[#3B82F6] font-bold text-slate-800 text-lg transition-all appearance-none cursor-pointer hover:bg-slate-100'
                      >
                        <option value='en'>English</option>
                        <option value='hi'>Hindi (हिन्दी)</option>
                        <option value='kn'>Kannada (ಕನ್ನಡ)</option>
                        <option value='te'>Telugu (తెలుగు)</option>
                        <option value='ta'>Tamil (தமிழ்)</option>
                      </select>
                    </div>

                    <div>
                      <label className='block font-black text-slate-700 mb-3 text-lg'>Game Difficulty</label>
                      <select
                        value={settings.difficulty}
                        onChange={(e) => settings.updateSettings({ difficulty: e.target.value })}
                        className='w-full px-5 py-4 bg-slate-50 border-4 border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/20 focus:border-[#3B82F6] font-bold text-slate-800 text-lg transition-all appearance-none cursor-pointer hover:bg-slate-100'
                      >
                        <option value='easy'>🟢 Easy - Guided learning</option>
                        <option value='medium'>🟡 Medium - Standard pace</option>
                        <option value='hard'>🔴 Hard - Less hints & faster</option>
                      </select>
                    </div>

                    <div className='flex items-center justify-between pt-6 border-t-4 border-slate-100'>
                      <div>
                        <div className='font-black text-slate-700 text-lg'>Sound Effects</div>
                        <div className='text-base font-bold text-slate-500 mt-1'>Bouncy app feedback sounds</div>
                      </div>
                      <button
                        onClick={() => settings.updateSettings({ soundEnabled: !settings.soundEnabled })}
                        className={`w-20 h-10 rounded-full transition-colors relative border-4 flex items-center p-1 cursor-pointer ${settings.soundEnabled ? 'bg-[#10B981] border-emerald-600' : 'bg-slate-200 border-slate-300'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.soundEnabled ? 'translate-x-[2.25rem]' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device & Camera */}
                <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden'>
                  <div className="bg-[#8B5CF6] px-8 py-5 border-b-4 border-purple-600">
                    <h2 className='text-2xl font-black text-white flex items-center gap-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]'>
                      <UIIcon name={'camera' as any} size={28} className="text-purple-100" />
                      Device & Camera
                    </h2>
                  </div>
                  <div className='p-8 space-y-8'>

                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-black text-slate-700 text-lg'>Enable Tracking</div>
                        <div className='text-sm font-bold text-slate-500 mt-1 max-w-[200px] leading-tight'>Camera required. Video never leaves this device.</div>
                      </div>
                      <button
                        onClick={handleCameraToggle}
                        className={`w-20 h-10 flex-shrink-0 rounded-full transition-colors relative border-4 flex items-center p-1 cursor-pointer ${settings.cameraEnabled ? 'bg-[#10B981] border-emerald-600' : 'bg-slate-200 border-slate-300'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.cameraEnabled ? 'translate-x-[2.25rem]' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {cameraPermission === 'granted' && (
                      <div className='px-5 py-4 rounded-[1.5rem] bg-emerald-50 text-emerald-700 border-4 border-emerald-200 flex items-center gap-3 font-black text-lg'>
                        <UIIcon name={'check-circle' as any} size={24} /> Device camera active
                      </div>
                    )}
                    {cameraPermission === 'denied' && (
                      <div className='px-5 py-4 rounded-[1.5rem] bg-red-50 text-red-700 border-4 border-red-200 flex items-center gap-3 font-black text-lg'>
                        <UIIcon name={'alert-circle' as any} size={24} /> Camera blocked
                      </div>
                    )}

                    <div className="pt-6 border-t-4 border-slate-100">
                      <label className='block font-black text-slate-700 mb-3 text-lg'>AI Processing Mode</label>
                      <select
                        value={settings.handTrackingDelegate}
                        onChange={(e) => settings.updateSettings({ handTrackingDelegate: e.target.value as 'GPU' | 'CPU' })}
                        className='w-full px-5 py-4 bg-slate-50 border-4 border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/20 focus:border-[#8B5CF6] font-bold text-slate-800 text-lg transition-all appearance-none cursor-pointer hover:bg-slate-100 mb-3'
                      >
                        <option value='GPU'>⚡ Hardware Accelerated (GPU)</option>
                        <option value='CPU'>🐌 Compatibility Mode (CPU)</option>
                      </select>
                      <p className='text-sm font-bold text-slate-500 leading-relaxed'>
                        Use GPU for the smoothest tracking. Switch to CPU if the app crashes or freezes.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-8">

                {/* Parental Controls */}
                <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden'>
                  <div className="bg-[#E85D04] px-8 py-5 border-b-4 border-orange-600">
                    <h2 className='text-2xl font-black text-white flex items-center gap-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]'>
                      <UIIcon name={'lock' as any} size={28} className="text-orange-100" />
                      Parent Controls
                    </h2>
                  </div>

                  <div className='p-8 space-y-8'>
                    <div>
                      <label className='block font-black text-slate-700 mb-3 text-lg'>Daily Time Limit</label>
                      <select
                        value={settings.timeLimit}
                        onChange={(e) => settings.updateSettings({ timeLimit: parseInt(e.target.value) })}
                        className='w-full px-5 py-4 bg-slate-50 border-4 border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/20 focus:border-[#E85D04] font-bold text-slate-800 text-lg transition-all appearance-none cursor-pointer hover:bg-slate-100'
                      >
                        <option value={0}>♾️ No Limit</option>
                        <option value={15}>⏱️ 15 minutes</option>
                        <option value={30}>⏱️ 30 minutes</option>
                        <option value={60}>⏱️ 1 hour</option>
                      </select>
                    </div>

                    <div className='flex items-center justify-between pt-6 border-t-4 border-slate-100'>
                      <div>
                        <div className='font-black text-slate-700 text-lg'>Show Tracing Hints</div>
                        <div className='text-base font-bold text-slate-500 mt-1'>Visual guides for drawing</div>
                      </div>
                      <button
                        onClick={() => settings.updateSettings({ showHints: !settings.showHints })}
                        className={`w-20 h-10 flex-shrink-0 rounded-full transition-colors relative border-4 flex items-center p-1 cursor-pointer ${settings.showHints ? 'bg-[#10B981] border-emerald-600' : 'bg-slate-200 border-slate-300'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.showHints ? 'translate-x-[2.25rem]' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="pt-6 border-t-4 border-slate-100 space-y-4">
                      <div className='bg-slate-50 rounded-[1.5rem] p-5 mb-4 border-4 border-slate-100'>
                        <div className='text-sm font-black uppercase tracking-widest text-slate-400 mb-2'>Alphabet System</div>
                        <div className='text-slate-800 flex items-baseline gap-2'>
                          <span className='font-black text-3xl'>{getMasteredLettersCount(settings.language)}</span>
                          <span className="text-slate-500 font-bold text-lg">/ {getAlphabet(settings.language).letters.length} Mastered</span>
                        </div>
                      </div>

                      <Button
                        variant='secondary'
                        className="w-full text-lg font-black text-slate-600 bg-white border-4 border-slate-200 hover:bg-slate-50 py-4 rounded-[1.5rem] shadow-[0_4px_0_0_rgba(226,232,240,1)] hover:shadow-none hover:translate-y-[4px] transition-all"
                        onClick={async () => {
                          if (await confirm({
                            title: 'Reset Tutorials?',
                            message: 'This will show intro tours again for the next game.',
                            confirmText: 'Reset',
                            cancelText: 'Cancel'
                          })) {
                            settings.updateSettings({ tutorialCompleted: false, onboardingCompleted: false });
                            showToast('Tutorials reset for next session', 'success');
                          }
                        }}
                      >
                        Reset Application Tutorials
                      </Button>

                      <Button
                        variant='secondary'
                        className="w-full text-lg font-black text-red-500 bg-red-50 border-4 border-red-200 hover:bg-red-100 py-4 rounded-[1.5rem] shadow-[0_4px_0_0_rgba(254,202,202,1)] hover:shadow-none hover:translate-y-[4px] transition-all"
                        onClick={async () => {
                          if (await confirm({
                            title: 'Erase Curriculum Progress?',
                            message: 'This irrevocably resets all tracked mastery. Proceed cautiously.',
                            confirmText: 'Erase Progress',
                            cancelText: 'Cancel',
                            type: 'danger',
                          })) {
                            resetProgress(settings.language);
                            showToast('Curriculum progress reset', 'success');
                          }
                        }}
                      >
                        Reset Curriculum Progress
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Account & Data */}
                <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden'>
                  <div className='p-8 space-y-6'>
                    {user ? (
                      <div className='flex items-center justify-between mb-4'>
                        <div>
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Signed In</p>
                          <p className="font-bold text-xl text-slate-800">{user.email}</p>
                        </div>
                        <Button
                          variant="secondary"
                          className="px-6 py-3 h-auto text-sm font-black bg-white border-4 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-[1rem] shadow-[0_4px_0_0_rgba(226,232,240,1)] hover:shadow-none hover:translate-y-[4px] transition-all"
                          onClick={() => { logout(); navigate('/login'); }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Local Session</p>
                        <p className="font-bold text-slate-600 mb-5 text-lg leading-tight">You are playing on a guest profile. Sign up to sync progress across devices.</p>
                        <Button
                          variant="primary"
                          className="w-full text-lg font-black bg-[#E85D04] hover:bg-orange-600 border-4 border-orange-700 py-4 rounded-[1.5rem] shadow-[0_4px_0_0_rgba(194,65,12,1)] hover:shadow-none hover:translate-y-[4px] transition-all"
                          onClick={() => navigate('/register')}
                        >
                          Create Account
                        </Button>
                      </div>
                    )}

                    <div className="pt-6 border-t-4 border-slate-100 flex flex-col sm:flex-row gap-4">
                      <Button
                        variant='secondary'
                        className="flex-1 text-sm font-black bg-white border-4 border-slate-200 text-slate-600 hover:bg-slate-50 py-4 rounded-[1.5rem] shadow-[0_4px_0_0_rgba(226,232,240,1)] hover:shadow-none hover:translate-y-[4px] transition-all"
                        onClick={() => showToast('Data export will be available in the next update.', 'info')}
                      >
                        Export Data
                      </Button>
                      <Button
                        variant='secondary'
                        className="flex-1 text-sm font-black bg-red-50 border-4 border-red-200 text-red-500 hover:bg-red-100 py-4 rounded-[1.5rem] shadow-[0_4px_0_0_rgba(254,202,202,1)] hover:shadow-none hover:translate-y-[4px] transition-all"
                        onClick={async () => {
                          if (await confirm({
                            title: 'Restore Factory Defaults?',
                            message: 'Erase all device configurations and restore defaults.',
                            confirmText: 'Restore Defaults',
                            cancelText: 'Cancel',
                            type: 'danger',
                          })) {
                            settings.resetSettings();
                            showToast('Settings restored', 'success');
                          }
                        }}
                      >
                        Restore Defaults
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-8 py-4 border-t-4 border-slate-100 text-center text-sm font-black text-slate-400 tracking-wider">
                    Advay Version 1.0.0 (Build 42)
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
