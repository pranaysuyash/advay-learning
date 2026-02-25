import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import type { Profile } from '../../store';
import type { AvatarConfig } from './types';
import { AvatarWithBadge } from './KenneyAvatar';


interface ProfileBadgeProps {
  profile: Profile;
  isSelected?: boolean;
  showAge?: boolean;
  showEditMenu?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Profile Badge Component
 * 
 * Displays a profile with avatar, name, and optional actions.
 * Used in profile selectors and lists.
 */
export function ProfileBadge({
  profile,
  isSelected = false,
  showAge = true,
  showEditMenu = true,
  size = 'md',
  onClick,
  onEdit,
  onDelete,
}: ProfileBadgeProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [, setIsLongPress] = useState(false);

  // Parse avatar config from profile settings
  const avatarConfig = profile.settings?.avatar_config as AvatarConfig | null | undefined;

  // Size mappings
  const SIZE_MAP = {
    sm: { name: 'text-xs', detail: 'text-[10px]' },
    md: { name: 'text-sm', detail: 'text-xs' },
    lg: { name: 'text-base', detail: 'text-sm' },
  };
  const sizeClasses = SIZE_MAP[size];

  // Handle long press for edit menu
  const handleMouseDown = () => {
    if (!showEditMenu) return;
    setIsLongPress(true);
    const timer = setTimeout(() => {
      setShowMenu(true);
      setIsLongPress(false);
    }, 500);
    
    const handleMouseUp = () => {
      clearTimeout(timer);
      setIsLongPress(false);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${profile.name}'s profile?`)) {
      onDelete?.();
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative flex flex-col items-center gap-1 p-2 rounded-xl transition
          ${isSelected 
            ? 'bg-blue-100 ring-2 ring-blue-500' 
            : 'bg-white hover:bg-slate-50'
          }
        `}
      >
        {/* Avatar with Age Badge */}
        <AvatarWithBadge
          config={avatarConfig}
          fallbackName={profile.name}
          age={showAge ? profile.age : undefined}
          size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
          showAnimation={isSelected}
        />

        {/* Name */}
        <span className={`${sizeClasses.name} font-semibold text-slate-700 truncate max-w-[80px]`}>
          {profile.name}
        </span>

        {/* Language indicator */}
        <span className={`${sizeClasses.detail} text-slate-400 uppercase`}>
          {profile.preferred_language}
        </span>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </motion.button>

      {/* Edit Menu Popup */}
      <AnimatePresence>
        {showMenu && showEditMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 min-w-[120px]"
            >
              <button
                onClick={() => {
                  onEdit?.();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact Profile Badge for horizontal lists
 */
interface CompactProfileBadgeProps {
  profile: Profile;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CompactProfileBadge({
  profile,
  isSelected,
  onClick,
}: CompactProfileBadgeProps) {
  const avatarConfig = profile.settings?.avatar_config as AvatarConfig | null | undefined;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition
        ${isSelected 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
        }
      `}
    >
      <AvatarWithBadge
        config={avatarConfig}
        fallbackName={profile.name}
        age={profile.age}
        size="sm"
      />
      <span className="truncate max-w-[80px]">{profile.name}</span>
    </motion.button>
  );
}

export default ProfileBadge;
