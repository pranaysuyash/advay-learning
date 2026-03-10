import React from 'react';
import { useProfileStore } from '../../store';
import type { Profile } from '../../store';

interface ProfileLoadingViewProps {
  isLoading: boolean;
  error: string | null;
  profiles: Profile[];
  hasFetchedRef: React.MutableRefObject<boolean>;
  fetchProfiles: () => void;
  navigate: (path: string) => void;
}

export function ProfileLoadingView({
  isLoading,
  error,
  profiles,
  hasFetchedRef,
  fetchProfiles,
  navigate,
}: ProfileLoadingViewProps) {
  if (isLoading) {
    return (
      <section className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4' />
          <p className='text-text-secondary'>
            Loading your child&apos;s profile...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='min-h-[60vh] flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <div className='text-6xl mb-4'>⚠️</div>
          <h2 className='text-2xl font-bold mb-2'>Unable to Load Profile</h2>
          <p className='text-text-secondary mb-6'>{error}</p>
          <div className='space-y-3'>
            <button
              type='button'
              onClick={() => {
                hasFetchedRef.current = false;
                fetchProfiles();
              }}
              className='w-full px-5 py-3 bg-gradient-to-r from-pip-orange to-pip-rust text-white rounded-xl font-bold shadow-soft hover:scale-105 transition-transform'
            >
              Try Again
            </button>
            <button
              type='button'
              onClick={() => {
                useProfileStore.setState({
                  currentProfile: {
                    id: 'guest',
                    name: 'Guest',
                    preferred_language: 'en',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    parent_id: 'guest',
                    settings: {},
                  },
                });
              }}
              className='w-full px-5 py-3 bg-white border border-border rounded-xl font-bold text-advay-slate shadow-soft hover:bg-bg-tertiary transition'
            >
              Play as Guest
            </button>
            <button
              type='button'
              onClick={() => navigate('/login')}
              className='w-full px-5 py-3 text-text-secondary hover:text-text-primary transition'
            >
              Go to Login
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return (
      <section className='min-h-[60vh] flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <div className='text-5xl mb-4 font-bold text-blue-500'>Aa</div>
          <h2 className='text-2xl font-bold mb-2'>Ready to Learn!</h2>
          <p className='text-text-secondary mb-6'>
            Create a profile to save your progress, or start playing right
            away!
          </p>
          <div className='space-y-3'>
            <button
              type='button'
              onClick={async () => {
                await useProfileStore.getState().createProfile({
                  name: 'Learner',
                  age: 5,
                  preferred_language: 'en',
                });
              }}
              className='w-full px-5 py-3 bg-gradient-to-r from-pip-orange to-pip-rust text-white rounded-xl font-bold shadow-soft hover:scale-105 transition-transform'
            >
              Create Profile & Play
            </button>
            <button
              type='button'
              onClick={() => {
                useProfileStore.setState({
                  currentProfile: {
                    id: 'guest',
                    name: 'Guest',
                    preferred_language: 'en',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    parent_id: 'guest',
                    settings: {},
                  },
                });
              }}
              className='w-full px-5 py-3 bg-white border border-border rounded-xl font-bold text-advay-slate shadow-soft hover:bg-bg-tertiary transition'
            >
              Play as Guest
            </button>
            <button
              type='button'
              onClick={() => navigate('/dashboard')}
              className='w-full px-5 py-3 text-text-secondary hover:text-text-primary transition'
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Profiles exist but none selected - show brief loading
  return (
    <section className='min-h-[60vh] flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4' />
        <p className='text-text-secondary'>
          Loading your child&apos;s profile...
        </p>
      </div>
    </section>
  );
}
