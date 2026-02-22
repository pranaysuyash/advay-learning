import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store';
import { profileApi } from '../services/api';
import { Mascot } from '../components/Mascot';
import { LANGUAGES } from '../data/languages';
import { UIIcon } from '../components/ui/Icon';

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

      setTimeout(() => navigate('/login?registered=true'), 50);
    } catch (error) {
      // Error is handled in store
    }
  };

  const error = localError || storeError;

  return (
    <div className='min-h-screen flex font-nunito bg-[#FFF8F0]'>

      {/* LEFT SIDE: Brand & Mascot (Hidden on mobile) */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#3B82F6] items-center justify-center p-12 relative overflow-hidden'>
        {/* Decorative elements */}
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
        <div className='absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl'></div>

        <div className='relative z-10 text-center flex flex-col items-center max-w-lg'>
          <Mascot state='celebrating' responsiveSize='lg' className='mb-8 drop-shadow-2xl' />
          <h1 className='text-5xl font-extrabold text-white mb-6 leading-tight'>
            Start your child's <br />
            <span className='text-[#E85D04]'>journey!</span>
          </h1>
          <p className='text-xl text-white/90 font-medium'>
            Setup your parent account to track progress, set limits, and customize the magical world.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Area */}
      <div className='w-full lg:w-1/2 flex flex-col relative overflow-y-auto min-h-screen'>
        {/* Header / Back Link */}
        <header className='p-6 lg:p-8 flex justify-between items-center z-10 sticky top-0 bg-[#FFF8F0]/90 backdrop-blur-md'>
          <Link
            to='/'
            className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-600 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:scale-105 transition shadow-sm'
            aria-label='Back to home'
          >
            <UIIcon name='back' size={24} />
          </Link>
          <div className='lg:hidden'>
            <Mascot state='idle' responsiveSize='xs' hideOnMobile={false} />
          </div>
        </header>

        <div className='flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 pb-12 w-full max-w-xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='w-full'
          >
            <h2 className='text-4xl font-extrabold text-slate-800 mb-2'>Create Account</h2>
            <p className='text-lg text-slate-500 font-medium mb-8'>Join thousands of active learners today.</p>

            {error && (
              <div className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 font-medium shadow-[0_4px_0_0_rgba(239,68,68,0.2)]'>
                <div className='flex items-center gap-2'>
                  <UIIcon name={'alert-circle' as any} className='h-5 w-5' />
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>

              {/* PARENT DETAILS SECTION */}
              <div className='bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm'>
                <h3 className='text-xl font-bold text-slate-800 mb-4 flex items-center gap-2'>
                  <span className='bg-[#3B82F6] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>1</span>
                  Parent Details
                </h3>

                <div className='space-y-4'>
                  <div>
                    <label htmlFor='email' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                      Email Address
                    </label>
                    <div className='relative group'>
                      <UIIcon name={'mail' as any} size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                      <input
                        id='email'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all'
                        placeholder='parent@example.com'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label htmlFor='password' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                        Password
                      </label>
                      <div className='relative group'>
                        <UIIcon name='lock' size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                        <input
                          id='password'
                          type='password'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all'
                          placeholder='Min 8 chars'
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor='confirm-password' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                        Confirm Password
                      </label>
                      <div className='relative group'>
                        <UIIcon name='lock' size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                        <input
                          id='confirm-password'
                          type='password'
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all'
                          placeholder='Confirm'
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHILD PROFILE SECTION */}
              <div className='bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                    <span className='bg-[#E85D04] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>2</span>
                    Learner Profile
                  </h3>
                  <label className='flex items-center cursor-pointer'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        className='sr-only'
                        checked={showChildFields}
                        onChange={(e) => setShowChildFields(e.target.checked)}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${showChildFields ? 'bg-[#E85D04]' : 'bg-slate-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showChildFields ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>

                <AnimatePresence>
                  {showChildFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='space-y-4 overflow-hidden'
                    >
                      <div className='pt-2'>
                        <label htmlFor='childName' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                          What's the explorer's name?
                        </label>
                        <input
                          id='childName'
                          type='text'
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 px-4 text-slate-800 font-semibold focus:outline-none focus:border-[#E85D04] focus:ring-4 focus:ring-[#E85D04]/20 transition-all'
                          placeholder='Leo'
                          required={showChildFields}
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label htmlFor='childAge' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                            Age
                          </label>
                          <select
                            id='childAge'
                            value={childAge}
                            onChange={(e) => setChildAge(Number(e.target.value))}
                            className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 px-4 text-slate-800 font-semibold focus:outline-none focus:border-[#E85D04] focus:ring-4 focus:ring-[#E85D04]/20 transition-all appearance-none cursor-pointer'
                          >
                            {[3, 4, 5, 6, 7, 8].map((age) => (
                              <option key={age} value={age}>
                                {age} years old
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor='childLanguage' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                            Language
                          </label>
                          <select
                            id='childLanguage'
                            value={childLanguage}
                            onChange={(e) => setChildLanguage(e.target.value)}
                            className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 px-4 text-slate-800 font-semibold focus:outline-none focus:border-[#E85D04] focus:ring-4 focus:ring-[#E85D04]/20 transition-all appearance-none cursor-pointer'
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type='submit'
                disabled={isLoading || isCreatingProfile}
                className='w-full py-4 mt-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-xl rounded-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group'
              >
                {isLoading || isCreatingProfile ? (
                  <span className='flex items-center justify-center gap-2'>
                    <UIIcon name={'loader' as any} className='animate-spin' size={24} /> Creating Magic...
                  </span>
                ) : (
                  <span className='flex items-center justify-center gap-2'>
                    Create Account <span className='group-hover:translate-x-1 transition-transform'>🪄</span>
                  </span>
                )}
              </button>
            </form>

            <p className='mt-8 text-slate-500 font-medium text-lg text-center'>
              Already have an account?{' '}
              <Link to='/login' className='text-[#3B82F6] font-bold hover:underline ml-1'>
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
