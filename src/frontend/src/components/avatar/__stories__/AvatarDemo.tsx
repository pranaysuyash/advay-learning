/**
 * Avatar System Demo
 * 
 * Demonstrates all avatar components and their interactions.
 * This is a development/testing component, not used in production.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Profile } from '../../../store';
import type { AvatarConfig } from '../types';
import {
  KenneyAvatar,
  AvatarWithBadge,
  AgeBadge,
  AgeBadgeWithLabel,
  AvatarPickerModal,
  ProfileBadge,
  CompactProfileBadge,
} from '../index';

// Mock profiles for demo
const DEMO_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Advay',
    age: 5,
    preferred_language: 'en',
    settings: {
      avatar_config: {
        type: 'platformer',
        character: 'beige',
        animation: 'idle',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: 'parent1',
  },
  {
    id: '2',
    name: 'Pip',
    age: 3,
    preferred_language: 'en',
    settings: {
      avatar_config: {
        type: 'animal',
        character: 'frog',
        animation: 'idle',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: 'parent1',
  },
  {
    id: '3',
    name: 'Luna',
    age: 7,
    preferred_language: 'es',
    settings: {
      avatar_config: {
        type: 'creature',
        character: 'slime_normal',
        animation: 'idle',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parent_id: 'parent1',
  },
];

export function AvatarDemo() {
  const [selectedProfile, setSelectedProfile] = useState<Profile>(DEMO_PROFILES[0]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [demoConfig, setDemoConfig] = useState<AvatarConfig | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            🎨 Kenney Avatar System
          </h1>
          <p className="text-slate-600">
            Fun, customizable avatars for kids using Kenney Platformer assets
          </p>
        </div>

        {/* Section 1: Avatar Display */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Avatar Display</h2>
          
          <div className="flex flex-wrap gap-8 items-center">
            <div className="text-center">
              <KenneyAvatar size="lg" fallbackName="A" />
              <p className="text-sm text-slate-500 mt-2">Default (No Avatar)</p>
            </div>
            
            <div className="text-center">
              <KenneyAvatar 
                size="lg" 
                config={{ type: 'platformer', character: 'beige' }}
                fallbackName="A"
              />
              <p className="text-sm text-slate-500 mt-2">Platformer (Beige)</p>
            </div>
            
            <div className="text-center">
              <KenneyAvatar 
                size="lg" 
                config={{ type: 'animal', character: 'frog' }}
                fallbackName="P"
              />
              <p className="text-sm text-slate-500 mt-2">Animal (Frog)</p>
            </div>
            
            <div className="text-center">
              <KenneyAvatar 
                size="lg" 
                config={{ type: 'creature', character: 'slime_fire' }}
                fallbackName="L"
              />
              <p className="text-sm text-slate-500 mt-2">Creature (Fire Slime)</p>
            </div>
          </div>
        </section>

        {/* Section 2: Avatar with Age Badge */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Avatar with Age Badge
          </h2>
          
          <div className="flex flex-wrap gap-8 items-center">
            <div className="text-center">
              <AvatarWithBadge 
                size="lg"
                age={2}
                config={{ type: 'platformer', character: 'pink' }}
                fallbackName="A"
              />
              <p className="text-sm text-slate-500 mt-2">Age 2 (Pink)</p>
            </div>
            
            <div className="text-center">
              <AvatarWithBadge 
                size="lg"
                age={5}
                config={{ type: 'animal', character: 'bee' }}
                fallbackName="B"
              />
              <p className="text-sm text-slate-500 mt-2">Age 5 (Blue)</p>
            </div>
            
            <div className="text-center">
              <AvatarWithBadge 
                size="lg"
                age={7}
                config={{ type: 'platformer', character: 'green' }}
                fallbackName="C"
              />
              <p className="text-sm text-slate-500 mt-2">Age 7 (Green)</p>
            </div>
            
            <div className="text-center">
              <AvatarWithBadge 
                size="lg"
                age={9}
                config={{ type: 'creature', character: 'slime_normal' }}
                fallbackName="D"
              />
              <p className="text-sm text-slate-500 mt-2">Age 9 (Purple)</p>
            </div>
          </div>
        </section>

        {/* Section 3: Age Badges */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Age Badges</h2>
          
          <div className="flex flex-wrap gap-6 items-center">
            <div className="text-center">
              <AgeBadge age={2} size="lg" pulse />
              <p className="text-sm text-slate-500 mt-2">2 years (Pink)</p>
            </div>
            
            <div className="text-center">
              <AgeBadge age={4} size="lg" />
              <p className="text-sm text-slate-500 mt-2">4 years (Blue)</p>
            </div>
            
            <div className="text-center">
              <AgeBadge age={6} size="lg" />
              <p className="text-sm text-slate-500 mt-2">6 years (Green)</p>
            </div>
            
            <div className="text-center">
              <AgeBadge age={8} size="lg" />
              <p className="text-sm text-slate-500 mt-2">8+ years (Purple)</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <AgeBadgeWithLabel age={3} />
            <AgeBadgeWithLabel age={5} />
            <AgeBadgeWithLabel age={7} />
          </div>
        </section>

        {/* Section 4: Profile Badges */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Profile Badges</h2>
          
          <div className="flex flex-wrap gap-6">
            {DEMO_PROFILES.map((profile) => (
              <ProfileBadge
                key={profile.id}
                profile={profile}
                isSelected={selectedProfile.id === profile.id}
                onClick={() => setSelectedProfile(profile)}
                onEdit={() => alert(`Edit ${profile.name}`)}
                onDelete={() => alert(`Delete ${profile.name}`)}
              />
            ))}
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-slate-500 mb-3">Compact (for horizontal lists):</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_PROFILES.map((profile) => (
                <CompactProfileBadge
                  key={profile.id}
                  profile={profile}
                  isSelected={selectedProfile.id === profile.id}
                  onClick={() => setSelectedProfile(profile)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Avatar Picker Trigger */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Avatar Picker</h2>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPickerOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition"
            >
              🎨 Open Avatar Picker
            </motion.button>
            
            {demoConfig && (
              <div className="flex items-center gap-3">
                <span className="text-slate-500">Selected:</span>
                <KenneyAvatar config={demoConfig} size="md" />
                <span className="font-medium text-slate-700 capitalize">
                  {demoConfig.type} - {demoConfig.character}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Section 6: Size Variants */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Size Variants</h2>
          
          <div className="flex items-end gap-4">
            <div className="text-center">
              <KenneyAvatar 
                size="xs" 
                config={{ type: 'platformer', character: 'beige' }}
                fallbackName="A"
              />
              <p className="text-xs text-slate-500 mt-1">XS</p>
            </div>
            <div className="text-center">
              <KenneyAvatar 
                size="sm" 
                config={{ type: 'platformer', character: 'beige' }}
                fallbackName="A"
              />
              <p className="text-xs text-slate-500 mt-1">SM</p>
            </div>
            <div className="text-center">
              <KenneyAvatar 
                size="md" 
                config={{ type: 'platformer', character: 'beige' }}
                fallbackName="A"
              />
              <p className="text-xs text-slate-500 mt-1">MD</p>
            </div>
            <div className="text-center">
              <KenneyAvatar 
                size="lg" 
                config={{ type: 'platformer', character: 'beige' }}
                fallbackName="A"
              />
              <p className="text-xs text-slate-500 mt-1">LG</p>
            </div>
            <div className="text-center">
              <KenneyAvatar 
                size="xl" 
                config={{ type: 'platformer', character: 'beige' }}
                fallbackName="A"
              />
              <p className="text-xs text-slate-500 mt-1">XL</p>
            </div>
          </div>
        </section>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentConfig={demoConfig}
        onSelect={(config) => {
          setDemoConfig(config);
          console.log('Selected avatar config:', config);
        }}
        onSelectPhoto={() => {
          alert('Camera would open here!');
        }}
      />
    </div>
  );
}

export default AvatarDemo;
