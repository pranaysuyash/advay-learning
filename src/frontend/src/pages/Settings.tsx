import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore, useProgressStore } from '../store';
import { getAlphabet } from '../data/alphabets';

export function Settings() {
  const settings = useSettingsStore();
  const { unlockAllBatches, resetProgress, getUnlockedBatches, getMasteredLettersCount } = useProgressStore();
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        result.addEventListener('change', () => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        });
      } catch {
        // Fallback: try to get user media
        navigator.mediaDevices.getUserMedia({ video: true })
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        settings.updateSettings({ cameraEnabled: true });
        setCameraPermission('granted');
      } catch {
        settings.updateSettings({ cameraEnabled: false });
        setCameraPermission('denied');
        alert('Camera permission denied. Please allow camera access in your browser settings.');
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="max-w-2xl space-y-6">
          {/* Learning Preferences */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Learning Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => settings.updateSettings({ language: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi (हिन्दी)</option>
                  <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="telugu">Telugu (తెలుగు)</option>
                  <option value="tamil">Tamil (தமிழ்)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Difficulty
                </label>
                <select
                  value={settings.difficulty}
                  onChange={(e) => settings.updateSettings({ difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Sound Effects
                </label>
                <div className="flex items-center justify-between bg-white/5 border border-white/20 rounded-lg px-4 py-3">
                  <span className="text-white/60">Enable sounds</span>
                  <button
                    onClick={() => settings.updateSettings({ soundEnabled: !settings.soundEnabled })}
                    className={`w-12 h-6 rounded-full transition ${
                      settings.soundEnabled ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Settings */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Camera Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 border border-white/20 rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">Enable Camera</div>
                  <div className="text-sm text-white/60">
                    Required for hand tracking features
                  </div>
                </div>
                <button
                  onClick={handleCameraToggle}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.cameraEnabled ? 'bg-red-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition transform ${
                      settings.cameraEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Camera Permission Status */}
              <div className={`text-sm px-4 py-2 rounded-lg ${
                cameraPermission === 'granted' 
                  ? 'bg-green-500/20 text-green-400' 
                  : cameraPermission === 'denied'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {cameraPermission === 'granted' && '✓ Camera permission granted'}
                {cameraPermission === 'denied' && '✗ Camera permission denied - check browser settings'}
                {cameraPermission === 'prompt' && '⚠ Camera permission not requested yet'}
              </div>

              {/* Privacy Note */}
              <div className="text-sm text-white/50 bg-white/5 rounded-lg p-3">
                <strong className="text-white/70">Privacy:</strong> Camera data is processed locally on your device. 
                No video is sent to our servers.
              </div>
            </div>
          </div>

          {/* Parental Controls */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Parental Controls</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 border border-white/20 rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">Daily Time Limit</div>
                  <div className="text-sm text-white/60">
                    Limit play time per day
                  </div>
                </div>
                <select
                  value={settings.timeLimit}
                  onChange={(e) => settings.updateSettings({ timeLimit: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                >
                  <option value={0}>No limit</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/20 rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">Show Letter Hints</div>
                  <div className="text-sm text-white/60">
                    Display tracing guides
                  </div>
                </div>
                <button
                  onClick={() => settings.updateSettings({ showHints: !settings.showHints })}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.showHints ? 'bg-red-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition transform ${
                      settings.showHints ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Parent Controls */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Parent Controls</h2>
            
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-2">Learning Progress</div>
                <div className="text-2xl font-bold">
                  {getMasteredLettersCount(settings.language)} / {getAlphabet(settings.language).letters.length} letters mastered
                </div>
                <div className="text-sm text-white/60 mt-1">
                  Batch {getUnlockedBatches(settings.language)} unlocked
                </div>
              </div>
              
              <button 
                className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition text-left flex justify-between items-center"
                onClick={() => setShowUnlockConfirm(true)}
              >
                <span>🔓 Unlock All Letters</span>
                <span className="text-white/40 text-sm">Skip progression</span>
              </button>
              
              <button 
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-left flex justify-between items-center"
                onClick={() => {
                  if (confirm('Reset all letter progress? This cannot be undone.')) {
                    resetProgress(settings.language);
                  }
                }}
              >
                <span>🔄 Reset Letter Progress</span>
                <span className="text-white/40 text-sm">Start over</span>
              </button>
            </div>

            {showUnlockConfirm && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 mb-3">
                  ⚠️ This will unlock all letters immediately. Your child will skip the progressive learning experience.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const totalLetters = getAlphabet(settings.language).letters.length;
                      const totalBatches = Math.ceil(totalLetters / 5);
                      unlockAllBatches(settings.language, totalBatches);
                      setShowUnlockConfirm(false);
                    }}
                    className="px-4 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Yes, Unlock All
                  </button>
                  <button
                    onClick={() => setShowUnlockConfirm(false)}
                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Data & Privacy */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
            
            <div className="space-y-3">
              <button 
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-left flex justify-between items-center"
                onClick={() => alert('Export feature coming soon!')}
              >
                <span>📥 Export Learning Data</span>
                <span className="text-white/40 text-sm">JSON</span>
              </button>
              
              <button 
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-left flex justify-between items-center"
                onClick={() => setShowResetConfirm(true)}
              >
                <span>🔄 Reset All Settings</span>
                <span className="text-white/40 text-sm">Cannot undo</span>
              </button>
            </div>

            {showResetConfirm && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 mb-3">Are you sure? This will reset all settings to default.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* App Info */}
          <div className="text-center text-white/40 text-sm">
            <p>Advay Learning App v1.0.0</p>
            <p className="mt-1">Built with ❤️ for kids everywhere</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
