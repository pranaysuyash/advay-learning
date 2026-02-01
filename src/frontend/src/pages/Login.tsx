import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';
import { authApi } from '../services/api';
import { Mascot } from '../components/Mascot';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  const { login, error, clearError, isLoading } = useAuthStore();

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const [inlineError, setInlineError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setShowResend(false);
    setResendMessage('');
    setInlineError('');

    // Basic client-side validation only on explicit submit
    if (!email.trim() || !password.trim()) {
      setInlineError('Please enter your email and password.');
      // Focus first missing field
      if (!email.trim()) {
        const el = document.getElementById('login-email-input');
        el?.focus();
      } else {
        const el = document.getElementById('login-password-input');
        el?.focus();
      }
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      // Check if error is due to unverified email
      const errorMsg = error.response?.data?.detail || '';
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
    } catch (error) {
      setResendMessage(
        'Failed to resend verification email. Please try again.',
      );
    }
  };

  return (
    <div className='max-w-md mx-auto px-4 py-16'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white/10 border border-border rounded-xl p-8 shadow-sm'
      >
        <Mascot
          state='happy'
          message="Welcome back, [Parent Name]! Ready for another adventure?"
          className='absolute top-0 left-0 -translate-x-8'
        />

        <div className='pl-48'>
          <h1 className='text-3xl font-bold text-center mb-2'>Welcome Back</h1>
          <p className='text-white/60 text-center mb-8'>
            Sign in to continue learning
          </p>

          {error && (
            <div className='bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6'>
              {error}
              {showResend && (
                <button
                  type='button'
                  onClick={handleResendVerification}
                  className='block mt-2 text-red-400 hover:text-red-300 underline'
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {resendMessage && (
            <div className='bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6'>
              {resendMessage}
            </div>
          )}

          <div id='login-error' role='status' aria-live='polite' className='sr-only'>
            {inlineError || error}
          </div>

          <form onSubmit={handleSubmit} className='space-y-6' noValidate>
            <div>
              <label
                htmlFor='login-email-input'
                className='block text-sm font-medium text-white/80 mb-2'
              >
                Email
              </label>
              <input
                id='login-email-input'
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
                htmlFor='login-password-input'
                className='block text-sm font-medium text-white/80 mb-2'
              >
                Password
              </label>
              <input
                id='login-password-input'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-border rounded-lg focus:outline-none focus:border-border-strong transition'
                placeholder='••••••••••••'
                required
                disabled={isLoading}
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className='text-center mt-6 text-white/60'>
            Don't have an account?{' '}
            <Link to='/register' className='text-red-400 hover:text-red-300'>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
