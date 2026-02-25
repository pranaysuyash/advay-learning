import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import type { AvatarConfig, AvatarType, AvatarOption } from './types';
import { 
  AVATAR_CATEGORIES, 
  PLATFORMER_AVATARS, 
  ANIMAL_AVATARS, 
  CREATURE_AVATARS,
} from './types';
import { KenneyAvatar } from './KenneyAvatar';
import { useAudio } from '../../utils/hooks/useAudio';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: AvatarConfig | null;
  onSelect: (config: AvatarConfig) => void;
  onSelectPhoto?: () => void;
}

/**
 * Avatar Picker Modal
 * 
 * Allows kids to choose their avatar from Kenney characters.
 * Organized into categories: Kids, Pets, Magic, Photo
 */
export function AvatarPickerModal({
  isOpen,
  onClose,
  currentConfig,
  onSelect,
  onSelectPhoto,
}: AvatarPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<AvatarType>('platformer');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null);
  const [previewAnimation, setPreviewAnimation] = useState<'idle' | 'walk' | 'jump'>('idle');
  const { playPop, playClick } = useAudio();

  // Get avatars for active category
  const getAvatarsForCategory = useCallback((category: AvatarType): AvatarOption[] => {
    switch (category) {
      case 'platformer':
        return PLATFORMER_AVATARS;
      case 'animal':
        return ANIMAL_AVATARS;
      case 'creature':
        return CREATURE_AVATARS;
      default:
        return [];
    }
  }, []);

  // Handle avatar selection
  const handleSelectAvatar = (avatar: AvatarOption) => {
    playPop();
    setSelectedAvatar(avatar);
    
    // Auto-switch preview animation
    if (avatar.type === 'animal' && avatar.character === 'frog') {
      setPreviewAnimation('jump');
    } else if (avatar.type === 'platformer') {
      setPreviewAnimation('walk');
    } else {
      setPreviewAnimation('idle');
    }
  };

  // Handle save
  const handleSave = () => {
    if (!selectedAvatar) return;
    
    playClick();
    const config: AvatarConfig = {
      type: selectedAvatar.type,
      character: selectedAvatar.character,
      animation: previewAnimation,
    };
    onSelect(config);
    onClose();
  };

  // Handle category change
  const handleCategoryChange = (categoryId: AvatarType) => {
    playClick();
    setActiveCategory(categoryId);
    setSelectedAvatar(null);
  };

  if (!isOpen) return null;

  const avatars = getAvatarsForCategory(activeCategory);
  const previewConfig: AvatarConfig | undefined = selectedAvatar ? {
    type: selectedAvatar.type,
    character: selectedAvatar.character,
    animation: previewAnimation,
  } : currentConfig || undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Choose Your Character
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Pick a fun avatar for your profile!
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Left: Preview */}
              <div className="md:w-1/3 bg-gradient-to-br from-amber-50 to-orange-50 p-6 flex flex-col items-center justify-center">
                <motion.div
                  key={selectedAvatar?.id || 'default'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mb-4"
                >
                  <KenneyAvatar
                    config={previewConfig}
                    size="xl"
                    showAnimation={true}
                    animationInterval={500}
                  />
                </motion.div>
                
                {selectedAvatar && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="font-bold text-slate-700 text-lg">
                      {selectedAvatar.name}
                    </p>
                    <p className="text-slate-500 text-sm capitalize">
                      {selectedAvatar.type}
                    </p>
                  </motion.div>
                )}

                {/* Animation toggle for preview */}
                {selectedAvatar && selectedAvatar.type === 'platformer' && (
                  <div className="flex gap-2 mt-4">
                    {(['idle', 'walk', 'jump'] as const).map((anim) => (
                      <button
                        key={anim}
                        onClick={() => setPreviewAnimation(anim)}
                        className={`px-3 py-1 text-xs rounded-full capitalize transition ${
                          previewAnimation === anim
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Picker */}
              <div className="md:w-2/3 p-6">
                {/* Category Tabs */}
                <div className="flex gap-2 mb-6">
                  {AVATAR_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id as AvatarType)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition ${
                        activeCategory === category.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-xs font-medium">{category.label}</span>
                    </button>
                  ))}
                </div>

                {/* Avatar Grid or Photo Option */}
                {activeCategory === 'photo' ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Camera className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-600 text-center mb-4">
                      Take a photo to use as your avatar
                    </p>
                    <button
                      onClick={() => {
                        playClick();
                        onSelectPhoto?.();
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition"
                    >
                      📸 Open Camera
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                    {avatars.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        onClick={() => handleSelectAvatar(avatar)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative aspect-square rounded-xl p-2 transition ${
                          selectedAvatar?.id === avatar.id
                            ? 'bg-orange-100 ring-2 ring-orange-500'
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <img
                          src={avatar.previewImage}
                          alt={avatar.name}
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Selection indicator */}
                        {selectedAvatar?.id === avatar.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                          >
                            <span className="text-white text-xs">✓</span>
                          </motion.div>
                        )}
                        
                        {/* Name label */}
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-slate-600 truncate">
                          {avatar.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!selectedAvatar}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Character
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AvatarPickerModal;
