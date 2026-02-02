import { motion } from 'framer-motion';
import { LANGUAGES } from '../../data/languages';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  onChildNameChange: (name: string) => void;
  childAge: number;
  onChildAgeChange: (age: number) => void;
  childLanguage: string;
  onChildLanguageChange: (language: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * Modal for adding a new child profile.
 * Contains form for name, age, and preferred language.
 */
export function AddChildModal({
  isOpen,
  onClose,
  childName,
  onChildNameChange,
  childAge,
  onChildAgeChange,
  childLanguage,
  onChildLanguageChange,
  onSubmit,
  isSubmitting,
}: AddChildModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-white border border-border rounded-xl p-6 max-w-md w-full shadow-soft-lg'
      >
        <h2 className='text-2xl font-bold mb-4'>Add Child Profile</h2>

        <div className='space-y-4'>
          <div>
            <label htmlFor='child-name' className='block text-sm font-medium text-slate-600 mb-2'>
              Child's Name *
            </label>
            <input
              id='child-name'
              type='text'
              value={childName}
              onChange={(e) => onChildNameChange(e.target.value)}
              placeholder="Child's name"
              autoComplete='name'
              className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
            />
          </div>

          <div>
            <label htmlFor='child-age' className='block text-sm font-medium text-slate-600 mb-2'>
              Age (years)
            </label>
            <input
              id='child-age'
              type='number'
              min={2}
              max={12}
              step={0.1}
              value={childAge}
              onChange={(e) => onChildAgeChange(parseFloat(e.target.value) || 5)}
              placeholder='Age (2-12 years)'
              autoComplete='bday'
              className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
            />
            <p className='text-xs text-slate-600 mt-1'>
              Use decimals for partial years (e.g., 2.5 for 2 years 6 months)
            </p>
          </div>

          <div>
            <label htmlFor='child-language' className='block text-sm font-medium text-slate-600 mb-2'>
              Preferred Language
            </label>
            <select
              id='child-language'
              value={childLanguage}
              onChange={(e) => onChildLanguageChange(e.target.value)}
              className='w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
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
            disabled={!childName.trim() || isSubmitting}
            className='flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? 'Creating...' : 'Add Child'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
