import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UIIcon } from './Icon';
import { useProfileStore } from '../../store';
import type { Profile } from '../../store';

interface ProfileSelectorProps {
  /** Currently selected profile */
  currentProfile?: Profile | null;
  /** Callback when profile is selected */
  onSelect?: (profile: Profile) => void;
  /** Additional CSS classes */
  className?: string;
  /** Positioning for dropdown */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  currentProfile,
  onSelect,
  className = '',
  position = 'bottom-left',
}) => {
  const { profiles, setCurrentProfile } = useProfileStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (profile: Profile) => {
    setCurrentProfile(profile);
    onSelect?.(profile);
    setIsOpen(false);
  };

  // Position classes for dropdown
  const positionClasses = {
    'bottom-left': 'left-0 mt-2',
    'bottom-right': 'right-0 mt-2',
    'top-left': 'left-0 -mt-2',
    'top-right': 'right-0 -mt-2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition min-h-[44px]"
        aria-label="Switch profile"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-pip-orange text-white flex items-center justify-center text-sm font-bold">
          {currentProfile?.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm font-medium">
          {currentProfile?.name || 'Select Profile'}
        </span>
        <UIIcon name="chevron-down" size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 w-64 bg-white rounded-xl shadow-2xl border border-border overflow-hidden ${positionClasses[position]}`}
            role="menu"
          >
            <div className="py-2 max-h-60 overflow-y-auto">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelect(profile)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-secondary transition ${currentProfile?.id === profile.id
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
                  role="menuitem"
                >
                  <div className="w-10 h-10 rounded-full bg-pip-orange text-white flex items-center justify-center text-base font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                      {profile.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {profile.age ? `${profile.age} years` : 'No age'} •{' '}
                      {profile.preferred_language.toUpperCase()}
                    </p>
                  </div>
                  {currentProfile?.id === profile.id && (
                    <UIIcon name="check" size={16} className="text-success" />
                  )}
                </button>
              ))}
              
              {profiles.length === 0 && (
                <div className="px-4 py-6 text-center text-text-secondary">
                  <p>No profiles available</p>
                  <p className="text-sm mt-1">Add a child profile first</p>
                </div>
              )}
            </div>
            
            {profiles.length > 0 && (
              <div className="border-t border-border p-2">
                <button
                  onClick={() => {
                    setCurrentProfile(null);
                    onSelect?.(null as any); // Passing null to indicate no profile
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg text-sm transition text-left"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
