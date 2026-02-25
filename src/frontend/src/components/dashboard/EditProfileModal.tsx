import { motion } from 'framer-motion';
import { LANGUAGES } from '../../data/languages';
import type { Profile } from '../../store';
import type { AvatarConfig } from '../avatar';
import { KenneyAvatar } from '../avatar';
import { useAudio } from '../../utils/hooks/useAudio';
import { useEffect, useRef } from 'react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  editName: string;
  onEditNameChange: (name: string) => void;
  editLanguage: string;
  onEditLanguageChange: (language: string) => void;
  editAvatarConfig?: AvatarConfig | null;
  onChangeAvatar?: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * Modal for editing an existing child profile.
 * Allows updating name, preferred language, and avatar.
 */
export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  editName,
  onEditNameChange,
  editLanguage,
  onEditLanguageChange,
  editAvatarConfig,
  onChangeAvatar,
  onSubmit,
  isSubmitting,
}: EditProfileModalProps) {
  const { playPop, playClick } = useAudio();
  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen !== wasOpen.current) {
      playPop();
      wasOpen.current = isOpen;
    }
  }, [isOpen, playPop]);

  if (!isOpen || !profile) return null;

  // Use editing avatar config if available, otherwise fall back to profile's current avatar
  const avatarConfig = editAvatarConfig || (profile.settings?.avatar_config as AvatarConfig) || null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-bg-secondary rounded-2xl p-6 w-full max-w-md shadow-soft-lg border border-border'
      >
        <h3 className='text-xl font-semibold mb-1'>Edit Profile</h3>
        <p className='text-advay-slate text-sm mb-6'>
          Update {profile.name}'s information
        </p>

        {/* Avatar Section */}
        <div className='flex flex-col items-center mb-6'>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClick();
              onChangeAvatar?.();
            }}
            className='relative cursor-pointer group'
          >
            <KenneyAvatar
              config={avatarConfig}
              fallbackName={editName || profile.name}
              size='xl'
              showAnimation={true}
            />
            {/* Change overlay */}
            <div className='absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
              <span className='text-white text-sm font-medium'>Change</span>
            </div>
          </motion.div>
          <button
            type='button'
            onClick={() => {
              playClick();
              onChangeAvatar?.();
            }}
            className='mt-2 text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition'
          >
            Change Avatar
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label htmlFor='edit-name' className='block text-sm font-medium text-advay-slate mb-2'>
              Child's Name
            </label>
            <input
              id='edit-name'
              type='text'
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              placeholder="Enter child's name"
              className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
            />
          </div>

          <div>
            <label htmlFor='edit-language' className='block text-sm font-medium text-advay-slate mb-2'>
              Preferred Language
            </label>
            <select
              id='edit-language'
              value={editLanguage}
              onChange={(e) => onEditLanguageChange(e.target.value)}
              className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <p className='text-text-secondary text-xs mt-2'>
              This will change the alphabet language in games
            </p>
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <button
            type='button'
            onClick={() => {
              playClick();
              onClose();
            }}
            className='flex-1 px-4 py-3 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              playClick();
              onSubmit();
            }}
            disabled={!editName.trim() || isSubmitting}
            className='flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
