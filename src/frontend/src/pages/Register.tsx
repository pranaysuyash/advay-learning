import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';
import { profileApi } from '../services/api';
import { Mascot } from '../components/Mascot';
import { LANGUAGES } from '../data/languages';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showChildFields, setShowChildFields] = useState(true);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [childLanguage, setChildLanguage] = useState('en');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const { register, error: storeError, clearError, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (showChildFields && !childName.trim()) {
      setLocalError('Please enter your child\'s name');
      return;
    }

    try {
      await register(email, password);
      
      if (showChildFields && childName.trim()) {
        setIsCreatingProfile(true);
        try {
          await profileApi.createProfile({
            name: childName,
            age: childAge,
            preferred_language: childLanguage,
          });
        } catch (profileError) {
          console.error('Failed to create child profile:', profileError);
        }
        setIsCreatingProfile(false);
      }
      
      navigate('/login?registered=true');
    } catch (error) {
      // Error is handled in store
    }
  };

  const error = localError || storeError;

  return (
    <div className='max-w-md mx-auto px-4 py-16'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white/10 border border-border rounded-xl p-8 shadow-sm'
      >
        <Mascot
          state='happy'
          message={showChildFields ? "Great! Now let's add your little learner's profile!" : "Creating your adventurer's profile! What's their name?"}
          className='absolute top-0 left-0 -translate-x-8'
        />

        <div className='pl-48'>
          <h1 className='text-3xl font-bold text-center mb-2'>Create Account</h1>
          <p className='text-slate-300 text-center mb-8'>
            Start your learning journey
          </p>

          {error && (
            <div className='bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label
                htmlFor='register-email-input'
                className='block text-sm font-medium text-white/80 mb-2'
              >
                Email
              </label>
              <input
                id='register-email-input'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                placeholder='you@example.com'
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor='register-password-input'
                className='block text-sm font-medium text-white/80 mb-2'
              >
                Password
              </label>
              <input
                id='register-password-input'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                placeholder='•••••••••••••'
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor='register-confirm-password-input'
                className='block text-sm font-medium text-white/80 mb-2'
              >
                Confirm Password
              </label>
              <input
                id='register-confirm-password-input'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                placeholder='••••••••••••'
                required
                disabled={isLoading}
              />
            </div>

            <p className='text-xs text-slate-400 mt-1'>
              Must be at least 8 characters
            </p>

            <div className='border-t border-white/10 pt-6'>
              <button
                type='button'
                onClick={() => setShowChildFields(!showChildFields)}
                className='text-sm text-orange-400 hover:text-orange-300 mb-4 flex items-center gap-1'
              >
                {showChildFields ? '− Skip adding child profile' : '+ Add child profile now'}
              </button>

              {showChildFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='space-y-4'
                >
                  <div>
                    <label
                      htmlFor='child-name'
                      className='block text-sm font-medium text-white/80 mb-2'
                    >
                      Child's Name
                    </label>
                    <input
                      id='child-name'
                      type='text'
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                      placeholder="Child's name"
                      disabled={isLoading}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='child-age'
                        className='block text-sm font-medium text-white/80 mb-2'
                      >
                        Age
                      </label>
                      <input
                        id='child-age'
                        type='number'
                        min={2}
                        max={12}
                        value={childAge}
                        onChange={(e) => setChildAge(parseInt(e.target.value) || 5)}
                        className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='child-language'
                        className='block text-sm font-medium text-white/80 mb-2'
                      >
                        Language
                      </label>
                      <select
                        id='child-language'
                        value={childLanguage}
                        onChange={(e) => setChildLanguage(e.target.value)}
                        className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                        disabled={isLoading}
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.nativeName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type='submit'
              disabled={isLoading || isCreatingProfile}
              className='w-full py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Creating account...' : isCreatingProfile ? 'Creating profile...' : 'Create Account'}
            </button>
          </form>

          <p className='text-center mt-6 text-slate-300'>
            Already have an account?{' '}
            <Link to='/login' className='text-red-400 hover:text-red-300'>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
