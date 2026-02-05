import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';
import { authApi } from '../services/api';
import { UIIcon } from '../components/ui/Icon';

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

  // Clear error when component mounts
  useEffect(() => {
    clearError();
    // Focus email input on mount for accessibility
    emailInputRef.current?.focus();
  }, [clearError]);

  const [inlineError, setInlineError] = useState('');

  // Check if form is valid for button state
  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

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
      navigate('/dashboard');
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
    <div className='min-h-screen flex flex-col'>
      {/* Minimal header - just back link */}
      <header className='px-4 py-4'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium'
        >
          <UIIcon name='back' size={16} />
          Back to home
        </Link>
      </header>

      {/* Main content - centered */}
      <main className='flex-1 flex items-center justify-center px-4 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='w-full max-w-md'
        >
          {/* Form card */}
          <div className='bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl'>
            {/* Single clear headline */}
            <div className='text-center mb-8'>
              <h1 className='text-2xl font-bold text-white mb-2'>
                Sign in to Advay Learning
              </h1>
              <p className='text-slate-400'>
                Continue your child's learning journey
              </p>
            </div>

            {/* Error display */}
            {(error || inlineError) && (
              <div
                className='bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6'
                role='alert'
                aria-live='assertive'
              >
                <div className='flex items-start gap-2'>
                  <UIIcon
                    name='warning'
                    size={18}
                    className='mt-0.5 flex-shrink-0'
                  />
                  <div>
                    <p>{inlineError || error}</p>
                    {showResend && (
                      <button
                        type='button'
                        onClick={handleResendVerification}
                        className='mt-2 text-red-300 hover:text-red-200 underline text-sm font-medium'
                      >
                        Resend verification email
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success message for resend */}
            {resendMessage && (
              <div
                className='bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6'
                role='status'
                aria-live='polite'
              >
                <div className='flex items-center gap-2'>
                  <UIIcon name='check' size={18} />
                  {resendMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5' noValidate>
              {/* Email field */}
              <div>
                <label
                  htmlFor='login-email'
                  className='block text-sm font-medium text-slate-300 mb-2'
                >
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id='login-email'
                  type='email'
                  name='email'
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className='w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg 
                    text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition disabled:opacity-50 disabled:cursor-not-allowed'
                  placeholder='parent@example.com'
                  required
                  disabled={isLoading}
                  aria-describedby={inlineError ? 'login-error' : undefined}
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor='login-password'
                  className='block text-sm font-medium text-slate-300 mb-2'
                >
                  Password
                </label>
                <div className='relative'>
                  <input
                    ref={passwordInputRef}
                    id='login-password'
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    autoComplete='current-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='w-full px-4 py-3 pr-12 bg-slate-900 border border-slate-600 rounded-lg 
                      text-white placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                      transition disabled:opacity-50 disabled:cursor-not-allowed'
                    placeholder='Enter your password'
                    required
                    disabled={isLoading}
                    aria-describedby={
                      capsLockOn ? 'caps-lock-warning' : undefined
                    }
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1'
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <UIIcon name={showPassword ? 'eye-off' : 'eye'} size={20} />
                  </button>
                </div>

                {/* Caps lock warning */}
                {capsLockOn && (
                  <p
                    id='caps-lock-warning'
                    className='mt-2 text-sm text-yellow-400 flex items-center gap-1'
                  >
                    <UIIcon name='warning' size={14} />
                    Caps Lock is on
                  </p>
                )}

                {/* Forgot password link */}
                <div className='flex justify-end mt-2'>
                  <Link
                    to='/forgot-password'
                    className='text-sm text-slate-400 hover:text-orange-400 transition font-medium'
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Hidden error announcement for screen readers */}
              <div
                id='login-error'
                role='status'
                aria-live='polite'
                className='sr-only'
              >
                {inlineError || error}
              </div>

              {/* Submit button */}
              <button
                type='submit'
                disabled={isLoading || !isFormValid}
                className='w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg 
                  font-semibold transition-all
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg
                      className='animate-spin h-5 w-5'
                      viewBox='0 0 24 24'
                      fill='none'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Demo/Guest Mode - Try without account */}
              <div className='relative my-4'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-slate-700'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-slate-800 text-slate-500'>or</span>
                </div>
              </div>

              <button
                type='button'
                onClick={() => {
                  // Create guest session and redirect
                  loginAsGuest();
                  navigate('/dashboard');
                }}
                className='w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg 
                  font-medium transition-all border border-slate-600
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800'
              >
                <span className='flex items-center justify-center gap-2'>
                  <UIIcon name='play' size={18} />
                  Try without account
                </span>
              </button>
              <p className='text-center text-xs text-slate-500 mt-2'>
                ⚠️ Guest progress won't be saved. Create an account to keep your achievements!
              </p>
            </form>

            {/* Sign up link - clear secondary action */}
            <p className='text-center mt-6 text-slate-400'>
              Don't have an account?{' '}
              <Link
                to='/register'
                className='text-orange-400 hover:text-orange-300 font-medium transition'
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Trust/privacy footer */}
          <div className='mt-6 text-center'>
            <p className='text-slate-500 text-sm mb-3'>
              🔒 Your data is encrypted and never shared
            </p>
            <div className='flex items-center justify-center gap-4 text-sm'>
              <Link
                to='/privacy'
                className='text-slate-400 hover:text-white transition'
              >
                Privacy Policy
              </Link>
              <span className='text-slate-600'>•</span>
              <Link
                to='/terms'
                className='text-slate-400 hover:text-white transition'
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
