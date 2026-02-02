import { motion } from 'framer-motion';
import { LANGUAGES } from '../../data/languages';
import type { Profile } from '../../store';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  editName: string;
  onEditNameChange: (name: string) => void;
  editLanguage: string;
  onEditLanguageChange: (language: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * Modal for editing an existing child profile.
 * Allows updating name and preferred language.
 */
export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  editName,
  onEditNameChange,
  editLanguage,
  onEditLanguageChange,
  onSubmit,
  isSubmitting,
}: EditProfileModalProps) {
  if (!isOpen || !profile) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-bg-secondary rounded-2xl p-6 w-full max-w-md shadow-soft-lg border border-border'
      >
        <h3 className='text-xl font-semibold mb-1'>Edit Profile</h3>
        <p className='text-slate-600 text-sm mb-6'>
          Update {profile.name}'s information
        </p>

        <div className='space-y-4'>
          <div>
            <label htmlFor='edit-name' className='block text-sm font-medium text-slate-600 mb-2'>
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
            <label htmlFor='edit-language' className='block text-sm font-medium text-slate-600 mb-2'>
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
            <p className='text-slate-500 text-xs mt-2'>
              This will change the alphabet language in games
            </p>
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 px-4 py-3 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onSubmit}
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
