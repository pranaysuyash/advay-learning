import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json();
        setError(data.detail || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-md'
      >
        <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl'>
          {/* Header */}
          <div className='text-center mb-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className='text-6xl mb-4'
            >
              🔐
            </motion.div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Forgot Your Password?
            </h1>
            <p className='text-white/70'>
              No worries! We'll help you get back into your account.
            </p>
          </div>

          {isSuccess ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='text-center space-y-6'
            >
              <div className='text-6xl mb-4'>📧</div>
              <div className='bg-green-500/20 border border-green-500/30 rounded-xl p-4'>
                <p className='text-green-300 font-semibold mb-2'>
                  Check your email!
                </p>
                <p className='text-green-200/80 text-sm'>
                  If an account exists for <strong>{email}</strong>, we've sent 
                  password reset instructions. The link will expire in 24 hours.
                </p>
              </div>
              <div className='space-y-3'>
                <p className='text-white/60 text-sm'>
                  Didn't receive it? Check your spam folder or try again.
                </p>
                <Button
                  variant='secondary'
                  fullWidth
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                >
                  Try Another Email
                </Button>
                <Link
                  to='/login'
                  className='block text-center text-pip-orange hover:text-pip-orange/80 font-semibold'
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className='space-y-6'>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm'
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-white/80 mb-2'
                >
                  Email Address
                </label>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pip-orange transition text-lg'
                  placeholder='you@example.com'
                  required
                  disabled={isLoading}
                />
                <p className='text-white/50 text-xs mt-2'>
                  Enter the email address associated with your account.
                </p>
              </div>

              <Button
                type='submit'
                variant='primary'
                size='lg'
                fullWidth
                isLoading={isLoading}
                disabled={!email || isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className='text-center space-y-3 pt-4 border-t border-white/10'>
                <p className='text-white/60 text-sm'>
                  Remember your password?{' '}
                  <Link
                    to='/login'
                    className='text-pip-orange hover:text-pip-orange/80 font-semibold'
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Security Note */}
        <p className='text-center text-white/40 text-xs mt-6'>
          For security reasons, we can only send reset links to verified email addresses. 
          If you don't receive an email within a few minutes, please check your spam folder.
        </p>
      </motion.div>
    </div>
  );
}
