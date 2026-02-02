import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';
import { UIIcon } from '../components/ui/Icon';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setMessage('');

    try {
      const response = await authApi.forgotPassword(email);
      setStatus('success');
      setMessage(response.data.message || "If an account exists with this email, we've sent you a password reset link.");
    } catch (err: unknown) {
      setStatus('error');
      setError('Failed to send reset email. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className='min-h-screen flex flex-col'>
        <header className='px-4 py-4'>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium'
          >
            <UIIcon name='back' size={16} />
            Back to login
          </Link>
        </header>

        <main className='flex-1 flex items-center justify-center px-4 py-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='w-full max-w-md text-center'
          >
            <div className='bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl'>
              <div className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <UIIcon name='check' size={32} className='text-green-400' />
              </div>
              <h1 className='text-2xl font-bold text-white mb-2'>Check Your Email</h1>
              <p className='text-slate-400 mb-6'>{message}</p>
              <Link
                to='/login'
                className='inline-flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition'
              >
                Return to Login
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <header className='px-4 py-4'>
        <Link
          to='/login'
          className='inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium'
        >
          <UIIcon name='back' size={16} />
          Back to login
        </Link>
      </header>

      <main className='flex-1 flex items-center justify-center px-4 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='w-full max-w-md'
        >
          <div className='bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl'>
            <div className='text-center mb-8'>
              <div className='w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <UIIcon name='lock' size={28} className='text-orange-400' />
              </div>
              <h1 className='text-2xl font-bold text-white mb-2'>Forgot Password?</h1>
              <p className='text-slate-400'>
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className='bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6'>
                <div className='flex items-center gap-2'>
                  <UIIcon name='warning' size={18} />
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
              <div>
                <label
                  htmlFor='forgot-email'
                  className='block text-sm font-medium text-slate-300 mb-2'
                >
                  Email address
                </label>
                <input
                  id='forgot-email'
                  type='email'
                  name='email'
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg 
                    text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition'
                  placeholder='parent@example.com'
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type='submit'
                disabled={status === 'loading'}
                className='w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg 
                  font-semibold transition-all
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800
                  disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {status === 'loading' ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24' fill='none'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
