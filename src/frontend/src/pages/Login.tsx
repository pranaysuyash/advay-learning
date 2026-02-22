import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';
import { authApi } from '../services/api';
import { UIIcon } from '../components/ui/Icon';
import { Mascot } from '../components/Mascot';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const { login, error, clearError, isLoading, loginAsGuest } = useAuthStore();
  const [inlineError, setInlineError] = useState('');

  // Clear error when component mounts
  useEffect(() => {
    clearError();
    // Focus email input on mount for accessibility
    emailInputRef.current?.focus();
  }, [clearError]);



  // Detect caps lock
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setShowResend(false);
    setResendMessage('');
    setInlineError('');

    // Basic client-side validation only on explicit submit
    if (!email.trim() || !password.trim()) {
      setInlineError('Please enter your email and password.');
      if (!email.trim()) {
        emailInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }
      return;
    }

    try {
      await login(email, password);
      // Wait for state to settle, then navigate
      setTimeout(() => navigate('/dashboard'), 50);
    } catch (error: unknown) {
      // Check if error is due to unverified email
      const errorMsg =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || '';
      if (
        errorMsg.toLowerCase().includes('not verified') ||
        errorMsg.toLowerCase().includes('verify')
      ) {
        setShowResend(true);
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await authApi.resendVerification(email);
      setResendMessage(response.data.message);
      setShowResend(false);
    } catch {
      setResendMessage(
        'Failed to resend verification email. Please try again.',
      );
    }
  };

  return (
    <div className='min-h-screen flex font-nunito bg-[#FFF8F0]'>

      {/* LEFT SIDE: Brand & Mascot (Hidden on mobile) */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#E85D04] items-center justify-center p-12 relative overflow-hidden'>
        {/* Decorative elements */}
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
        <div className='absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl'></div>

        <div className='relative z-10 text-center flex flex-col items-center max-w-lg'>
          <Mascot state='happy' responsiveSize='lg' className='mb-8 drop-shadow-2xl' />
          <h1 className='text-5xl font-extrabold text-white mb-6 leading-tight'>
            Learn with your <br />
            <span className='text-yellow-300'>whole body.</span>
          </h1>
          <p className='text-xl text-white/90 font-medium'>
            Join Pip on a magical learning adventure where moving is learning!
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Area */}
      <div className='w-full lg:w-1/2 flex flex-col relative'>
        {/* Header / Back Link */}
        <header className='p-6 lg:p-8 flex justify-between items-center z-10'>
          <Link
            to='/'
            className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-600 hover:border-[#E85D04] hover:text-[#E85D04] hover:scale-105 transition shadow-sm'
            aria-label='Back to home'
          >
            <UIIcon name='back' size={24} />
          </Link>
          <div className='lg:hidden'>
            <Mascot state='idle' responsiveSize='xs' hideOnMobile={false} />
          </div>
        </header>

        <div className='flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 pb-12 w-full max-w-md mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='w-full'
          >
            <h2 className='text-4xl font-extrabold text-slate-800 mb-2'>Welcome Back!</h2>
            <p className='text-lg text-slate-500 font-medium mb-8'>Ready for more adventures?</p>

            {(error || inlineError) && (
              <div className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 font-medium shadow-[0_4px_0_0_rgba(239,68,68,0.2)]'>
                <div className='flex items-center gap-2'>
                  <UIIcon name={'alert-circle' as any} className='h-5 w-5' />
                  {error || inlineError}
                </div>
              </div>
            )}

            {resendMessage && (
              <div className='bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 font-medium shadow-[0_4px_0_0_rgba(34,197,94,0.2)]'>
                <div className='flex items-center gap-2'>
                  <UIIcon name={'check-circle' as any} className='h-5 w-5' />
                  {resendMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5' noValidate>
              <div>
                <label htmlFor='email-input' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                  Email Address
                </label>
                <div className='relative group'>
                  <UIIcon name={'mail' as any} size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                  <input
                    id='email-input'
                    ref={emailInputRef}
                    type='email'
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (inlineError) setInlineError('');
                    }}
                    className='w-full bg-white border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all shadow-sm'
                    placeholder='parent@example.com'
                    required
                  />
                </div>
              </div>

              <div>
                <div className='flex justify-between items-center mb-2 px-1'>
                  <label htmlFor='password-input' className='text-sm font-bold text-slate-700'>
                    Password
                  </label>
                  <Link to='/forgot-password' className='text-sm font-bold text-[#3B82F6] hover:text-blue-700 hover:underline'>
                    Forgot?
                  </Link>
                </div>
                <div className='relative group'>
                  <UIIcon name='lock' size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                  <input
                    id='password-input'
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (inlineError) setInlineError('');
                    }}
                    onKeyDown={handleKeyDown}
                    className='w-full bg-white border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-12 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all shadow-sm'
                    placeholder='••••••••'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <UIIcon name={showPassword ? 'eye-off' : 'eye'} size={20} />
                  </button>
                </div>
                {capsLockOn && <p className='mt-2 text-sm font-bold text-amber-600 px-1'>⚠️ Caps Lock is on</p>}
              </div>

              {showResend && (
                <button
                  type='button'
                  onClick={handleResendVerification}
                  className='text-sm font-bold text-[#E85D04] hover:text-orange-700 hover:underline px-1 w-full text-left'
                >
                  Didn't receive verification email? Resend it.
                </button>
              )}

              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-4 mt-6 bg-[#E85D04] hover:bg-[#D4561C] text-white font-black text-xl rounded-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <UIIcon name={'loader' as any} className='animate-spin' size={24} /> Logging in...
                  </span>
                ) : (
                  <span className='flex items-center justify-center gap-2'>
                    Let's Go! <span className='group-hover:translate-x-1 transition-transform'>🚀</span>
                  </span>
                )}
              </button>
            </form>

            <div className='mt-10 text-center'>
              <div className='relative flex items-center mb-6'>
                <div className='flex-grow border-t-2 border-slate-200'></div>
                <span className='flex-shrink-0 mx-4 text-slate-400 font-bold uppercase tracking-wider text-sm'>Or</span>
                <div className='flex-grow border-t-2 border-slate-200'></div>
              </div>

              <button
                type='button'
                onClick={() => {
                  loginAsGuest();
                  // Timeout helps router settle before redirect
                  setTimeout(() => navigate('/dashboard'), 50);
                }}
                className='w-full py-3.5 bg-white text-slate-700 font-bold text-lg rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]'
              >
                <span className='text-2xl'>🌟</span> Try as Guest
              </button>

              <p className='mt-8 text-slate-500 font-medium text-lg'>
                New here?{' '}
                <Link to='/register' className='text-[#E85D04] font-bold hover:underline ml-1'>
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
