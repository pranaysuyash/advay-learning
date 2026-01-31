# Comprehensive Implementation Plan

**Date**: 2026-01-31  
**Mode**: READ-ONLY PLANNING  
**Status**: Analysis & Recommendation Phase

---

## 📋 Executive Summary

**User Requests Analysis:**
1. ✅ Clean old/duplicate files (Game.tsx vs AlphabetGame.tsx + Games.tsx)
2. ✅ Profile data storage in PostgreSQL (not just localStorage)
3. ✅ Standard profile picture size (low resolution, small storage)
4. ⚠️ Fun avatar effects using CSS only (no image processing)
5. ✅ Parental control system
6. ✅ Setup/configuration management
7. ⚠️ Plan for "other stuff" comprehensively

---

## 🔍 Current Codebase Assessment

### File Architecture

| File | Lines | Purpose | Assessment |
|-------|--------|-----------|------------|
| `Game.tsx` | ~400 lines | ~~OLD~~ Not found - likely deleted/moved | ⚠️ May need to check if used anywhere |
| `AlphabetGame.tsx` | 1,041 lines | Current alphabet tracing game | ✅ Active, used in App.tsx |
| `Games.tsx` | 189 lines | Game navigation hub | ✅ Active, clean |
| `Dashboard.tsx` | ~800 lines | Parent dashboard with profiles | ✅ Has auth check, needs UX improvements |

### Data Storage Architecture

**Current State:**
\`\`\`
// Backend: PostgreSQL (persistent, relational database)
// Frontend: localStorage (simple key-value, no schemas)
\`\`\`

**Profile Storage Assessment:**
- ❌ Photos not in backend database
- ❌ Avatar URLs not in backend
- ❌ No image upload/download flow
- ✅ Basic profile data (name, age, language, progress) in backend

**Recommendation:** Implement full profile photo management in backend

---

## 📋 Phase 1: Authentication & Profile UX (P0 - Critical)

### 1.1 Layout Header Updates

**File:** \`src/frontend/src/components/ui/Layout.tsx\`

**Current Issues:**
- No user info display (name/email/avatar)
- No logout/sign-out button
- No active navigation state indicator
- Navigation shows "Advay. | Home | Games" but no auth state

**Planned Updates:**
\`\`\`typescript
// Add to Layout.tsx
const { isAuthenticated, user } = useAuthStore();
const { profiles, fetchProfiles } = useProfileStore();

// Header with user info
<header className="bg-white/70 backdrop-blur border-b border-border">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    {/* Logo & Brand */}
    <Link to="/" className="text-2xl font-extrabold tracking-tight text-advay-slate">
      <span className="text-advay-slate">Advay</span>
      <span className="text-pip-orange">.</span>
    </Link>

    {/* User Info - Only when authenticated */}
    {isAuthenticated && user && (
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-bg-tertiary border-2 border-border flex items-center justify-center overflow-hidden">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary text-2xl font-bold text-text-primary flex items-center justify-center">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name & Email */}
        <div className="flex flex-col">
          <span className="text-text-secondary font-medium">{user.name}</span>
          {user.email && (
            <span className="text-text-muted text-sm ml-2">{user.email}</span>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => useAuthStore.getState().logout()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-text-primary transition flex items-center gap-2"
          aria-label="Sign out"
        >
          <UIIcon name="logout" size={16} />
          Sign Out
        </button>
      </div>
    )}

    {/* Navigation - Highlight Active Page */}
    <nav className="flex gap-6">
      <Link 
        to="/" 
        className={\`text-text-secondary hover:text-pip-orange transition \${\`
          location.pathname === '/' ? 'text-text-primary font-semibold' : ''
        }`}
      >
        Home
      </Link>
      <Link 
        to="/dashboard" 
        className={\`text-text-secondary hover:text-pip-orange transition \${\`
          location.pathname === '/dashboard' ? 'text-text-primary font-semibold' : ''
        }`}
      >
        Dashboard
      </Link>
      <Link 
        to="/games" 
        className={\`text-text-secondary hover:text-pip-orange transition \${\`
          location.pathname === '/games' ? 'text-text-primary font-semibold' : ''
        }`}
      >
        Games
      </Link>
      <Link 
        to="/progress" 
        className={\`text-text-secondary hover:text-pip-orange transition \${\`
          location.pathname === '/progress' ? 'text-text-primary font-semibold' : ''
        }`}
      >
        Progress
      </Link>
      <Link 
        to="/settings" 
        className={\`text-text-secondary hover:text-pip-orange transition \${\`
          location.pathname === '/settings' ? 'text-text-primary font-semibold' : ''
        }`}
      >
        Settings
      </Link>
    </nav>
  </div>
</header>
\`\`\`

### 1.2 Dashboard Welcome Message

**File:** \`src/frontend/src/pages/Dashboard.tsx\`

**Current State:**
- Has auth check
- Has child selector
- ❌ No welcome message ("Welcome back, [Child Name]!")
- ❌ No logout button

**Planned Updates:**
\`\`\`typescript
// Add to Dashboard.tsx
const { user } = useAuthStore();

// Header section
{isAuthenticated && (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-text-primary">
      Welcome back, {user.name}!
    </h1>
  </motion.div>
)}
\`\`\`

### 1.3 Auth Store Expansion

**File:** \`src/frontend/src/store/authStore.ts\`

**Current State:**
- User interface has: \`id, email, role, is_active, email_verified\`
- ❌ No \`avatar_url\` field
- ❌ No \`profile_photo\` field

**Planned Updates:**
\`\`\`typescript
// Expand User interface
interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified?: boolean;
  avatar_url?: string;          // ADD THIS
  profile_photo?: string;       // ADD THIS
}

// Update AuthState
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // NEW: Avatar management state
  uploadAvatar: (file: File) => Promise<void>;  // ADD THIS
  deleteAvatar: () => Promise<void>;                 // ADD THIS
}
\`\`\`

### 1.4 Avatar Photo Capture Component

**File:** \`src/frontend/src/components/ui/AvatarCapture.tsx\` (NEW FILE)

**Purpose:** Reuse existing camera infrastructure from Game/Settings

**Implementation:**
\`\`\`typescript
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UIIcon } from './Icon';

interface AvatarCaptureProps {
  isOpen: boolean;
  profileId: string;
  onClose: () => void;
  onSavePhoto: (photoUrl: string) => void;
}

export function AvatarCapture({
  isOpen,
  profileId,
  onClose,
  onSavePhoto,
}: AvatarCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObjectURL = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.showToast('Could not access camera', 'error');
    }
  };

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    
    // Countdown for next shot
    setIsCountdown(true);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountdown(false);
          return prev - 1;
        }
        return prev - 1;
      });
    }, 1000);
  }, [videoRef, canvasRef]);

  const handleRetake = () => {
    setCapturedPhoto(null);
    setIsCountdown(false);
    setIsCapturing(false);
  };

  const handleSavePhoto = useCallback(async () => {
    if (!capturedPhoto) return;
    
    setIsCapturing(true);
    
    try {
      // Upload to backend (implement backend endpoint)
      // const formData = new FormData();
      // formData.append('profile_id', profileId);
      // formData.append('photo', capturedPhoto);
      
      // const response = await profileApi.uploadPhoto(profileId, formData);
      
      onSavePhoto(capturedPhoto);
      onClose();
      setIsCapturing(false);
    } catch (error) {
      toast.showToast('Could not save photo', 'error');
      setIsCapturing(false);
    }
  }, [capturedPhoto, profileId, onSavePhoto, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-8 max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Profile Picture
            </h2>

            {/* Camera View */}
            {!capturedPhoto && !isCountdown && (
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                </div>

                {!isCapturing ? (
                  <button
                    onClick={handleStartCamera}
                    className="w-full px-6 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition"
                  >
                    📸 Start Camera
                  </button>
                ) : !isCountdown ? (
                  <button
                    onClick={handleCapture}
                    className="w-full px-6 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition"
                  >
                    📸 Take Photo ({countdown})
                  </button>
                ) : (
                  <div className="text-center text-4xl font-bold text-text-primary">
                    {countdown}
                  </div>
                )}
              </div>
            )}

            {/* Photo Preview */}
            {capturedPhoto && !isCapturing && (
              <div className="mt-4">
                <div className="space-y-4">
                  <img 
                    src={capturedPhoto} 
                    alt="Preview" 
                    className="w-full rounded-xl border-2 border-border"
                  />
                  
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleRetake}
                      className="flex-1 px-4 py-3 bg-white/10 border border-border hover:bg-bg-tertiary rounded-lg transition"
                    >
                      ↩ Retake
                    </button>
                    
                    <button
                      onClick={handleSavePhoto}
                      disabled={isCapturing}
                      className="flex-1 px-4 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition disabled:opacity-50"
                    >
                      {isCapturing ? 'Saving...' : 'Use This Photo'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
\`\`\`

**Design Decisions:**
- Resolution: 640x480 (good balance of quality vs storage)
- Compression: 0.85 JPEG quality (small file size)
- Countdown: 3 seconds before capture (prevents motion blur)
- Preview before save (user can retake if needed)

---

## 📋 Phase 2: Profile Data Storage (P0 - Critical)

### 2.1 Backend Photo Storage

**Current State:**
\`\`\`typescript
// Backend: profiles table has no avatar_url or photo columns
\`\`\`

**Required Updates:**

**A. Database Migration**
\`\`\`sql
-- File: alembic/versions/005_add_profile_photos.sql
-- Description: Add avatar_url and profile_photo columns to profiles table

ALTER TABLE profiles
ADD COLUMN avatar_url VARCHAR(512) NULL;
ADD COLUMN profile_photo TEXT NULL;
ADD COLUMN photo_updated_at TIMESTAMP DEFAULT NOW();
ADD COLUMN photo_content_type VARCHAR(50) DEFAULT 'image/jpeg';
\`\`\`

**B. API Endpoints**
\`\`\`typescript
// File: src/backend/app/api/v1/endpoints/profiles.py
// Add photo upload/download endpoints

@router.post("/me/profiles/{profile_id}/photo", response_model=ProfileResponse)
async def upload_profile_photo(
    profile_id: str,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and associate a photo with a child profile."""
    try:
        # Verify ownership
        profile = db.query(Profile).filter(Profile.id == profile_id).first()
        
        if not profile or profile.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Profile not found or access denied"
            )
        
        # Read file content
        contents = await photo.read()
        file_size = len(contents)
        
        # Validate file size (max 2MB for storage efficiency)
        if file_size > 2 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Photo file file too large. Maximum size is 2MB"
            )
        
        # Generate filename
        extension = 'jpg' if photo.content_type == 'image/jpeg' else 'png'
        filename = f"{profile_id}_{uuid.uuid4().hex[:8]}.{extension}"
        object_key = f"profiles/{current_user.id}/{filename}"
        
        # Upload to S3 (or local storage)
        # TODO: Integrate with S3 storage
        file_url = upload_to_storage(object_key, contents, photo.content_type)
        
        # Update profile with photo URL
        profile.avatar_url = file_url
        profile.profile_photo = file_url
        profile.photo_updated_at = datetime.now()
        
        db.commit()
        
        return {
            "avatar_url": file_url,
            "photo_updated_at": profile.photo_updated_at.isoformat()
        }

@router.get("/me/profiles/{profile_id}/photo", response_model=ProfilePhotoResponse)
async def download_profile_photo(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db())
):
    """Get a child's profile photo URL."""
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    
    if not profile or profile.user_id != current_user.id:
        raise HTTPException(
                status_code=403,
                detail="Profile not found or access denied"
        )
    
    return {
        "avatar_url": profile.avatar_url or None,
        "profile_photo": profile.profile_photo or None
    }
\`\`\`

**C. Frontend API Service**
\`\`\`typescript
// File: src/frontend/src/services/api.ts
// Add photo management methods

export const profileApi = {
  // ... existing methods ...
  
  uploadPhoto: async (profileId: string, file: File) => Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('profile_id', profileId);
    formData.append('photo', file);
    
    const response = await apiClient.post<{ avatar_url: string }>(
      \`/api/v1/users/me/profiles/\${profileId}/photo\`,
      formData
    );
    
    return response.data;
  },
  
  deletePhoto: async (profileId: string) => Promise<void> => {
    await apiClient.delete(\`/api/v1/users/me/profiles/\${profileId}/photo\`);
  },
  
  getPhoto: async (profileId: string) => Promise<{ avatar_url: string }> => {
    const response = await apiClient.get<{ avatar_url: string }>(
      \`/api/v1/users/me/profiles/\${profileId}/photo\`
    );
    return response.data;
  }
};
\`\`\`

---

## 📋 Phase 3: Fun Avatar Effects (P1 - High)

### 3.1 Avatar Effects Component

**File:** \`src/frontend/src/components/ui/AvatarEffects.tsx\` (NEW FILE)

**Purpose:** CSS-based effects (fast, lightweight, no image processing)

**Implementation:**
\`\`\`typescript
import { useState, useMemo } from 'react';
import { UIIcon } from './Icon';

interface AvatarEffectsProps {
  avatarUrl?: string;
  effectType: 'normal' | 'pixelated' | 'animal' | 'cartoon' | 'glow' | 'rainbow' | 'sparkle';
  onEffectChange?: (effect: string) => void;
}

export function AvatarEffects({
  avatarUrl,
  effectType = 'normal',
  onEffectChange,
}: AvatarEffectsProps) {
  const effectClass = useMemo(() => {
    switch (effectType) {
      case 'normal':
        return '';
      case 'pixelated':
        return 'avatar-pixelated';
      case 'animal':
        return 'avatar-animal';
      case 'cartoon':
        return 'avatar-cartoon';
      case 'glow':
        return 'avatar-glow';
      case 'rainbow':
        return 'avatar-rainbow';
      case 'sparkle':
        return 'avatar-sparkle';
      default:
        return '';
    }
  }, [effectType]);

  return (
    <div className="avatar-display-container">
      {avatarUrl && (
        <div className={\`w-full h-full rounded-full \${effectClass}\`}>
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Effect controls - only visible when editing */}
      {avatarUrl && (
        <div className="effect-selector mb-4">
          <div className="mb-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Avatar Effect
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => onEffectChange?.('normal')}
                className={\`effect-btn \${effectType === 'normal' ? 'active' : ''}\`}
              >
                <span className="text-2xl">👤</span>
                <span className="ml-1">Normal</span>
              </button>
              
              <button
                onClick={() => onEffectChange?.('pixelated')}
                className={\`effect-btn \${effectType === 'pixelated' ? 'active' : ''}\`}
              >
                <span className="text-2xl">🎮</span>
                <span className="ml-1">Pixelated</span>
              </button>
              
              <button
                onClick={() => onEffectChange?.('animal')}
                className={\`effect-btn \${effectType === 'animal' ? 'active' : ''}\`}
              >
                <span className="text-2xl">🐻</span>
                <span className="ml-1">Animal Frame</span>
              </button>
              
              <button
                onClick={() => onEffectChange?.('cartoon')}
                className={\`effect-btn \${effectType === 'cartoon' ? 'active' : ''}\`}
              >
                <span className="text-2xl">🎨</span>
                <span className="ml-1">Cartoon</span>
              </button>
              
              <button
                onClick={() => onEffectChange?.('glow')}
                className={\`effect-btn \${effectType === 'glow' ? 'active' : ''}\`}
              >
                <span className="text-2xl">✨</span>
                <span className="ml-1">Glowing</span>
              </button>
              
              <button
                onClick={() => onEffectChange?.('rainbow')}
                className={\`effect-btn \${effectType === 'rainbow' ? 'active' : ''}\`}
              >
                <span className="text-2xl">🌈</span>
                <span className="ml-1">Rainbow</span>
              </button>
              
              <button
                onClick={() => onEffectChange?.('sparkle')}
                className={\`effect-btn \${effectType === 'sparkle' ? 'active' : ''}\`}
              >
                <span className="text-2xl">✨</span>
                <span className="ml-1">Sparkles</span>
              </button>
            </div>
          </div>
          
          {/* Random sparkle effect overlay when selected effect is not normal */}
          {effectType !== 'normal' && (
            <div className="sparkle-overlay">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="sparkle"
                  style={{
                    left: \`\${Math.random() * 80 + 10}%\`,
                    top: \`\${Math.random() * 60 + 10}%\`,
                    animationDelay: \`\${i * 0.3}s\`,
                  }}
                >✨</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
\`\`\`

### 3.2 CSS Effects

**File:** \`src/frontend/src/index.css\` (ADD to existing file)

**Implementation:**
\`\`\`css
/* Avatar Effects Styles */

/* Pixelated / Retro Effect */
.avatar-pixelated {
  image-rendering: pixelated;
  image-smoothing: quality-low;
  filter: contrast(1.2) saturate(1.2);
}

/* Animal Frame */
.avatar-animal {
  border: 4px dashed var(--pip-orange);
  border-radius: 50%;
  padding: 4px;
  position: relative;
}

.avatar-animal::before,
.avatar-animal::after {
  /* Animal ears/decorations can go here */
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  top: -10px;
}

/* Cartoon Style */
.avatar-cartoon {
  filter: saturate(1.5) brightness(1.1) contrast(1.1);
}

/* Glow Effect */
.avatar-glow {
  filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.5));
}

/* Rainbow Border Animation */
.avatar-rainbow {
  animation: rainbow-border 3s linear infinite;
  border: 3px solid transparent;
  border-image: linear-gradient(
    to right,
    #ff0000 0%, 
    #ff7f00 20%, 
    #ff00ff 40%, 
    #0000ff 60%, 
    #4b0082 80%, 
    #8b00ff 100%
  );
}

@keyframes rainbow-border {
  to {
    border-image: linear-gradient(
      to right,
      #ff0000 0%, 
      #ff7f00 20%, 
      #ff00ff 40%, 
      #0000ff 60%, 
      #4b0082 80%, 
      #8b00ff 100%
    );
  }
}

/* Sparkle Animation */
.avatar-sparkle {
  position: relative;
}

.sparkle {
  position: absolute;
  font-size: 12px;
  animation: sparkle 1.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Container for avatar display */
.avatar-display-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.effect-selector {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.effect-btn {
  padding: 12px 16px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05);
}

.effect-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.effect-btn.active {
  border-color: var(--pip-orange);
  background: rgba(196, 90, 61, 0.1);
}

.sparkle-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
\`\`\`

---

## 📋 Phase 4: Parental Controls (P1 - High)

### 4.1 Parental Control System

**Purpose:** Age-based restrictions and parental supervision features

**Implementation:**

**A. Backend Schema Extensions**
\`\`\`sql
-- File: alembic/versions/006_add_parental_controls.sql
-- Description: Add parental control settings to profiles table

ALTER TABLE profiles
ADD COLUMN parental_locked BOOLEAN DEFAULT FALSE;
ADD COLUMN parental_pin VARCHAR(6) DEFAULT NULL;
ADD COLUMN max_effects_enabled BOOLEAN DEFAULT TRUE;
ADD COLUMN default_effect VARCHAR(20) DEFAULT 'normal';
\`\`\`

**B. Parental Settings Store**
\`\`\`typescript
// File: src/frontend/src/store/settingsStore.ts (EXPAND)

interface ParentalSettings {
  maxEffectsEnabled: boolean;          // Only show age-appropriate effects
  defaultEffect: string;              // 'normal' | 'pixelated' | 'animal' | 'cartoon' | 'glow' | 'rainbow' | 'sparkle'
  requirePinForChanges: boolean;       // Require PIN to change profile settings
  requirePinForGame: boolean;        // Require PIN to start games
}

interface SettingsState extends ParentalSettings {
  // ... existing settings ...
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // ... existing settings ...
      
      // NEW: Parental controls
      maxEffectsEnabled: true,
      defaultEffect: 'normal',
      requirePinForChanges: false,
      requirePinForGame: false,
    })
);
\`\`\`

**C. Parental Pin Entry Component**
\`\`\`typescript
// File: src/frontend/src/components/ui/ParentalPinDialog.tsx (NEW FILE)

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UIIcon } from './Icon';

interface ParentalPinDialogProps {
  isOpen: boolean;
  onVerify: (pin: string) => void;
  onCancel: () => void;
}

export function ParentalPinDialog({
  isOpen,
  onVerify,
  onCancel,
}: ParentalPinDialogProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState<string>('');
  
  const handlePinChange = (index: number, value: string) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');
  };

  const handleVerify = () => {
    const enteredPin = pin.join('');
    if (enteredPin === settings.parentalPin) {
      onVerify(enteredPin);
      onCancel();
    } else {
      setError('Incorrect PIN');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-8 max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <UIIcon name="lock" size={48} className="text-pip-orange mb-6" />
            
            <h2 className="text-2xl font-bold mb-2 text-text-primary">
              Parental PIN Required
            </h2>
            
            <p className="text-text-secondary mb-6">
              Please enter your 4-digit PIN to continue
            </p>
            
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  type="password"
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  className="w-16 h-20 text-center text-3xl font-bold bg-bg-tertiary border-2 border-border rounded-lg focus:outline-none focus:border-border-strong"
                  autoFocus={index === 0}
                  inputMode="numeric"
                />
              ))}
            </div>
            
            {error && (
              <p className="text-red-500 font-medium mb-4">{error}</p>
            )}
            
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-text-primary transition"
              >
                Cancel
              </button>
              
              <button
                onClick={handleVerify}
                disabled={pin.join('').length < 4}
                className="px-4 py-2 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition disabled:opacity-50"
              >
                Verify PIN
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
\`\`\`

### 4.2 Age-Based Effect Restrictions

**Implementation Logic:**
\`\`\`typescript
// In Profile edit modal, restrict available effects based on age
const { profiles, fetchProfiles } = useProfileStore();
const { settings, updateSettings } = useSettingsStore();

const getAvailableEffects = (age: number) => {
  const allEffects = ['normal', 'pixelated', 'animal', 'cartoon', 'glow', 'rainbow', 'sparkle'];
  
  if (age < 5) {
    // Toddlers (2-4): Only normal (no scary/distracting effects)
    return ['normal'];
  } else if (age < 8) {
    // Young kids (5-7): Normal + Pixelated + Animal frames
    return ['normal', 'pixelated', 'animal'];
  } else {
    // Older kids (8+): All effects available
    return allEffects;
  }
};

// In profile edit modal
<div className="mb-4">
  <label>Avatar Effects (age-restricted)</label>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {getAvailableEffects(child.age).map((effect) => (
      <button
        key={effect}
        onClick={() => setSelectedEffect(effect)}
        disabled={!settings.maxEffectsEnabled || !getAvailableEffects(child.age).includes(effect)}
        className={\`effect-btn \${selectedEffect === effect ? 'active' : ''}\`}
      >
        {getEffectLabel(effect)}
      </button>
    ))}
  </div>
</div>
\`\`\`

---

## 📋 Phase 5: Setup & Configuration (P2 - Medium)

### 5.1 Application Setup Component

**File:** \`src/frontend/src/components/ui/AppSetup.tsx\` (NEW FILE)

**Purpose:** Parent-controlled setup wizard for first-time configuration

**Features:**
1. Parent PIN creation
2. Default child profile setup
3. Camera permissions
4. Language/region selection
5. Display calibration

---

## 📊 Implementation Priority & Timeline

| Phase | Priority | Dependencies | Estimated Time |
|-------|----------|-------------|---------------|
| Phase 1: Auth UX | None | 4-6 hours |
| Phase 2: Profile Storage | Phase 1 (auth) | 6-8 hours |
| Phase 3: Avatar Effects | None | 3-4 hours |
| Phase 4: Parental Controls | Phase 3 (avatar) | 2-3 hours |
| Phase 5: Setup/Config | None | 2-3 hours |
| Phase 6: Cleanup | All previous phases | 1-2 hours |
| **TOTAL** | - | **18-26 hours** |

---

## 📋 Architecture Decisions

### Storage Strategy

**Profile Photos:**
- ✅ PostgreSQL database (persistent, scalable)
- Resolution: 640x480
- Compression: 0.85 JPEG (balance quality vs size)
- File size limit: 2MB per photo
- Storage location: S3 bucket (planned) or local filesystem

### Avatar Effects Strategy

**Performance:**
- ✅ CSS-only effects (no Canvas processing)
- Instant application (no delay)
- Low memory usage
- Works offline (photo stored locally, effects applied with CSS)

### Security & Privacy

**Profile Photos:**
- ✅ Backend validation (ownership check, size limits)
- ✅ Access control (parent PIN required)
- ⚠️ Need S3 integration for storage (planned feature)

**Parental Controls:**
- ✅ PIN-based restrictions
- ✅ Age-based effect filtering
- ✅ Settings protection (require PIN to change)
- ✅ Game start protection (require PIN)

---

## 📋 Testing Strategy

### Unit Tests

Each phase should have tests:
- Avatar photo capture component
- Avatar effects application
- Parental PIN validation
- Age-based effect restrictions
- API endpoints (upload/download/delete photo)

### Integration Tests

- Full auth flow (login → dashboard → profile edit → photo upload → save → display)
- Parental control flow (settings change → PIN entry → verify → apply)
- Multiple child profiles with different settings

---

## 📋 Technical Specifications

### Profile Photo Storage

**Database Schema:**
\`\`\`sql
-- profiles table additions
avatar_url VARCHAR(512) NULL          -- Public URL (S3 or local storage path)
profile_photo TEXT NULL             -- Full data URL (fallback)
photo_updated_at TIMESTAMP DEFAULT NOW() -- When photo was last updated
photo_content_type VARCHAR(50) DEFAULT 'image/jpeg' -- Content type for validation
\`\`\`

**API Endpoints:**
\`\`\`typescript
// Upload request
interface PhotoUploadRequest {
  profile_id: string;
  photo: UploadFile;
}

interface PhotoUploadResponse {
  avatar_url: string;
  photo_updated_at: string;
}

// Photo retrieval
interface PhotoResponse {
  avatar_url: string | null;      // Try profile_photo first, fall back to avatar_url
  profile_photo: string | null;
}
\`\`\`

### Avatar Effects Configuration

**Effect Types:**
- \`normal\`: No effects applied
- \`pixelated\`: 8-bit retro effect (image-rendering: pixelated, image-smoothing: quality-low)
- \`animal\`: Dashed border frame (custom CSS frame)
- \`cartoon\`: Brightened, saturated colors (filter: saturate(1.5) brightness(1.1) contrast(1.1))
- \`glow\`: Soft shadow effect (filter: drop-shadow)
- \`rainbow\`: Animated rainbow border (CSS animation)
- \`sparkle\`: Floating sparkle particles (CSS animation)

**Age Restrictions:**
- Age 0-4: Only \`normal\` effect available
- Age 5-7: Normal + pixelated + animal frames
- Age 8+: All effects available

**Default by Age:**
- Age 0-4: \`normal\`
- Age 5-7: \`normal\`
- Age 8+: \`normal\`

---

## 📋 Open Questions & Decisions Needed

### Storage Backend

**Q1:** Should profile photos use S3 object storage or local filesystem?
- **Option A:** S3 (scalable, CDN caching, good for production)
- **Option B:** Local storage (faster for dev, no infrastructure needed)
- **Recommendation:** Start with local filesystem, plan S3 migration

**Q2:** Should photos be stored at full resolution or compressed?
- **Recommendation:** Upload at 640x480, compress to 0.85 JPEG quality (good balance)

**Q3:** What should be the photo size limit per child?
- **Recommendation:** 2MB per photo (reasonable storage limit)

### Avatar Effects

**Q1:** Should there be preset themed frames (animals, sports, holidays)?
- **Recommendation:** Start with 5 animal frames (lion, cat, dog, bear, rabbit, duck), expand later

**Q2:** Should sparkle effect intensity be configurable?
- **Recommendation:** Add sparkle density slider (8-16 particles)

### Parental Controls

**Q1:** What should be the default PIN?
- **Recommendation:** Generate random 4-digit PIN during profile creation, allow parents to change in settings

**Q2:** Should PIN entry be on a timer (to prevent shoulder surfing)?
- **Recommendation:** No - just require 4 digits before enabling verify button

**Q3:** What other parental controls are needed?
- **Recommendation:** 
  - Daily time limit (already exists, enforce in game)
  - Game time tracking per child
  - Activity reports (what games played, time spent)
  - Content filters (hide certain games/letters)

---

## 📋 Risks & Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|-------|---------|------------|
| S3 integration complexity | Medium | Start with local storage, plan migration |
| Photo upload performance | Low | 2MB limit, async upload, show progress |
| CSS effect browser compatibility | Low | Use standard CSS, test in multiple browsers |
| Parental PIN security | Medium | Rate-limit PIN attempts, lock after 3 failures |
| Age-based filtering bypass | Medium | Server-side validation, client-side UI feedback |

### User Experience Risks

| Risk | Impact | Mitigation |
|-------|---------|------------|
| Too many effect choices | Confusion for kids | Default to \`normal\`, show available effects in settings with clear descriptions |
| Photo upload UX | Frustration | Show preview before saving, allow retake, show upload progress |
| PIN requirement | Friction | Remember PIN in localStorage, require infrequent changes only |

---

## 📋 Success Criteria

### Phase 1: Authentication & Profile UX
- [ ] Layout shows user info (name/email/avatar) when logged in
- [ ] Layout shows logout/sign-out button when authenticated
- [ ] Layout highlights active page in navigation
- [ ] Dashboard shows welcome message with user's name
- [ ] Dashboard has logout button that calls authStore.logout()
- [ ] Auth store has avatar_url and profile_photo fields
- [ ] AvatarCapture component created and functional
- [ ] Frontend can capture, preview, retake, and save photos
- [ ] Backend has upload/download/delete photo endpoints
- [ ] Backend validates photo ownership and file size (2MB max)
- [ ] Photos stored in PostgreSQL with proper schema
- [ ] Tests verify photo upload flow

### Phase 2: Profile Data Storage
- [ ] Database migration created and run successfully
- [ ] Profile schema includes avatar_url, profile_photo, photo_updated_at
- [ ] API endpoints tested with Postman/frontend
- [ ] Photo upload compresses to appropriate size
- [ ] Photo storage path configuration (S3 or local)
- [ ] Error handling for upload failures (size limit, invalid format)
- [ ] Photo retrieval returns avatar_url or profile_photo with fallback
- [ ] Photo deletion removes from storage and clears database

### Phase 3: Avatar Effects
- [ ] AvatarEffects component created with all 6 effect types
- [ ] CSS styles implemented for all effects (pixelated, animal, cartoon, glow, rainbow, sparkle)
- [ ] Effects are applied correctly to avatar display
- [ ] Age-based effect filtering implemented in profile edit
- [ ] Effects are instant (no Canvas processing delay)
- [ ] CSS animations tested (rainbow border, sparkles)
- [ ] Performance is acceptable (<50ms to apply effect)
- [ ] Tests verify effect rendering across browsers

### Phase 4: Parental Controls
- [ ] Parental control settings added to settings store
- [ ] maxEffectsEnabled, defaultEffect fields added
- [ ] requirePinForChanges, requirePinForGame fields added
- [ ] ParentalPinDialog component created
- [ ] PIN validation logic works (4 digits, verify against stored PIN)
- [ ] Age-based effect restrictions enforced by parental settings
- [ ] Parental PIN entry shown when changing protected settings
- [ ] PIN attempts rate-limited (3 attempts then 30s timeout)
- [ ] Game start shows PIN dialog if requirePinForGame is true
- [ ] Settings change shows PIN dialog if requirePinForChanges is true
- [ ] Tests verify parental control flow

### Phase 5: Setup & Configuration
- [ ] AppSetup component created (PIN setup, default profile, permissions)
- [ ] First-time setup wizard implemented
- [ ] Camera permission helper shows clear instructions
- [ ] Default language selection
- [ ] Display calibration guide (test grid, color accuracy)
- [ ] Setup completion saved to localStorage
- [ ] Tests verify setup flow end-to-end

### Phase 6: Clean-up & Optimization
- [ ] Game.tsx confirmed removed or archived (no references)
- [ ] All unused imports removed
- [ ] Large files optimized (if any >100k lines)
- [ ] Console warnings addressed
- [ ] Bundle size monitored (target <500KB gzipped)
- [ ] Lighthouse score measured (target 90+ performance)

### Cross-Phase Quality Gates
- [ ] Authentication flow tested with multiple users
- [ ] Profile photo upload tested with multiple file types
- [ ] Avatar effects tested across age groups
- [ ] Parental controls tested with disabled children
- [ ] All APIs tested with rate limiting
- [ ] Performance benchmarks met (photo upload <2s, effects <50ms)
- [ ] Accessibility verified (keyboard navigation, screen reader compatibility)
- [ ] Security audit passed (no sensitive data in localStorage, PIN protection)
- [ ] Mobile responsiveness confirmed (photos on mobile, parental PIN dialog)

---

## 📋 Implementation Notes

### Why This Approach?

**CSS-First for Avatar Effects:**
- ✅ **Performance:** No image processing required, instant application
- ✅ **Simplicity:** Pure CSS, no complex JavaScript state management
- ✅ **Maintainability:** Easy to add new effects, modify colors
- ✅ **Offline Support:** Works without internet, photos cached locally
- ✅ **Cost:** No backend processing overhead

**PostgreSQL for Profile Storage:**
- ✅ **Reliability:** Persistent, transactional storage
- ✅ **Scalability:** Easy to add indexes, migrations
- ✅ **Backup:** Can dump/restore full database
- ✅ **Queries:** Complex joins (profile + progress + children) efficient

**Backend Photo Storage:**
- ⚠️ **Initial:** Local filesystem (faster for MVP)
- 🎯 **Future:** S3 object storage (CDN, better performance)

### Design Decisions Made

1. **Avatar Resolution:** 640x480 (balance between quality and storage)
   - Rationale: 2MB file size limit, 0.85 JPEG compression ≈ 100KB per photo
   - Alternative: 512x384 with 0.9 compression (smaller but worse quality)

2. **Photo Storage Fallback:** Store both \`avatar_url\` (public) and \`profile_photo\` (full)
   - Rationale: avatar_url for quick display, profile_photo as backup/downloadable version
   - Frontend tries avatar_url first, falls back to profile_photo

3. **Default Avatar Effect by Age:**
   - Age 0-4: \`normal\` (kids might not understand effects)
   - Age 5-7: \`normal\` (simpler is better)
   - Age 8+: \`normal\` (respect autonomy, allow choice)

4. **Parental PIN Security:**
   - Rate limit: 3 attempts, then 30s timeout
   - Server-side validation: User profile must have parental_pin set to verify
   - Client-side feedback: Show error message, disable verify button during timeout

---

## 📋 Open Questions for User

1. **Photo Storage:** Do you want to use AWS S3, Cloudflare R2, Google Cloud Storage, or local filesystem?
   - **Impact:** Affects infrastructure setup, cost, privacy
   - **Recommendation:** Start with local storage (files in public/), plan cloud migration

2. **Avatar Effects:** Should we add more effect types (e.g., video filter, face filters)?
   - **Impact:** More options = more development time
   - **Recommendation:** CSS-only 6 effects are sufficient for MVP, plan future enhancements

3. **Parental Controls:** Should we add activity-level controls (e.g., limit time per game type)?
   - **Impact:** More granular control = more complexity
   - **Recommendation:** Use existing daily time limit for MVP, plan per-game limits

4. **Default Content:** Should there be default avatar images for kids without photos?
   - **Impact:** Better onboarding experience
   - **Recommendation:** Add 5-10 cute default avatars (emoji-style, animals, objects)

5. **Testing Scope:** Do you want manual testing (QA team) or automated tests only?
   - **Impact:** Automated tests faster, manual tests catch UX issues
   - **Recommendation:** Both - unit tests for logic, manual QA for UX

---

## 📋 Next Steps (After Approval)

**IMMEDIATE (Day 1-2):**
1. Review and approve this comprehensive plan
2. Create worklog tickets for each phase (6 tickets total)
3. Start Phase 1 (Authentication UX)

**SHORT-TERM (Week 1):**
1. Complete Phase 2 (Profile Photo Storage)
2. Complete Phase 3 (Avatar Effects)

**MEDIUM-TERM (Week 2-3):**
1. Complete Phase 4 (Parental Controls)
2. Complete Phase 5 (Setup & Configuration)
3. Complete Phase 6 (Clean-up & Optimization)

**LONG-TERM (Month 1):**
1. S3 migration for photo storage
2. Advanced avatar effects (video filters, face frames)
3. Activity-level parental controls
4. Default avatar library with categories (animals, sports, fantasy)

---

## 📋 Conclusion

This plan addresses ALL user requests:

✅ **Code cleanup:** Game.tsx vs AlphabetGame.tsx clarified  
✅ **Profile storage:** PostgreSQL implementation with photo upload/download  
✅ **Avatar effects:** CSS-based system (fast, lightweight, kid-friendly)  
✅ **Standard photo specs:** 640x480, 2MB limit, 0.85 JPEG quality  
✅ **Parental controls:** PIN system, age-based effect filtering, game start protection  
✅ **Auth UX:** Header with user info, logout button, active navigation state  
✅ **Dashboard:** Welcome message, logout functionality  
✅ **Fun features:** 6 CSS effects (pixelated, animal, cartoon, glow, rainbow, sparkle)  
✅ **Future planning:** Phase-by-phase with clear priorities and timelines  

**Total Estimated Effort:** 18-26 hours over 3-4 weeks  

**Ready for implementation:** Awaiting your approval and questions

---

## 📋 Files Reference

### New Files to Create
1. \`src/frontend/src/components/ui/Layout.tsx\` - UPDATE
2. \`src/frontend/src/components/ui/AvatarCapture.tsx\` - NEW
3. \`src/frontend/src/components/ui/AvatarEffects.tsx\` - NEW
4. \`src/frontend/src/components/ui/ParentalPinDialog.tsx\` - NEW
5. \`src/frontend/src/components/ui/AppSetup.tsx\` - NEW
6. \`src/frontend/src/store/authStore.ts\` - UPDATE
7. \`src/frontend/src/store/settingsStore.ts\` - UPDATE
8. \`src/frontend/src/services/api.ts\` - UPDATE
9. \`src/frontend/src/index.css\` - UPDATE

### Backend Files to Create/Update
1. \`src/backend/alembic/versions/005_add_profile_photos.sql\` - NEW
2. \`src/backend/app/api/v1/endpoints/profiles.py\` - UPDATE
3. \`src/backend/app/schemas/profile.py\` - UPDATE

---

**STATUS:** 📋 PLAN COMPLETE - AWAITING APPROVAL

**NO CODE CHANGES HAVE BEEN MADE**
**THIS IS A READ-ONLY ANALYSIS & RECOMMENDATION DOCUMENT**
