import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { register, error: storeError, clearError, isLoading } = useAuthStore();

  // Clear error when component mounts
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

    try {
      await register(email, password);
      // Registration successful - user can now login
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
        className='bg-white/5 border border-white/10 rounded-xl p-8'
      >
        <h1 className='text-3xl font-bold text-center mb-2'>Create Account</h1>
        <p className='text-white/60 text-center mb-8'>
          Start your learning journey
        </p>

        {error && (
          <div className='bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-white/80 mb-2'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition'
              placeholder='you@example.com'
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-white/80 mb-2'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition'
              placeholder='••••••••'
              required
              disabled={isLoading}
              minLength={8}
            />
            <p className='text-xs text-white/40 mt-1'>
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-white/80 mb-2'>
              Confirm Password
            </label>
            <input
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-red-500 transition'
              placeholder='••••••••'
              required
              disabled={isLoading}
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className='text-center mt-6 text-white/60'>
          Already have an account?{' '}
          <Link to='/login' className='text-red-400 hover:text-red-300'>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
