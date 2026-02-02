import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';
import { UIIcon } from '../components/ui/Icon';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
    }
  }, [token]);

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    setStatus('loading');

    try {
      await authApi.resetPassword(token!, newPassword);
      setStatus('success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      setStatus('idle');
      const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMsg || 'Failed to reset password. The link may have expired.');
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
              <h1 className='text-2xl font-bold text-white mb-2'>Password Reset!</h1>
              <p className='text-slate-400 mb-6'>Your password has been updated. Redirecting to login...</p>
              <Link
                to='/login'
                className='inline-flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition'
              >
                Go to Login Now
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (status === 'invalid') {
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
              <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <UIIcon name='warning' size={32} className='text-red-400' />
              </div>
              <h1 className='text-2xl font-bold text-white mb-2'>Invalid Reset Link</h1>
              <p className='text-slate-400 mb-6'>
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to='/forgot-password'
                className='inline-flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition'
              >
                Request New Link
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
              <h1 className='text-2xl font-bold text-white mb-2'>Create New Password</h1>
              <p className='text-slate-400'>
                Enter your new password below.
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
                  htmlFor='newPassword'
                  className='block text-sm font-medium text-slate-300 mb-2'
                >
                  New Password
                </label>
                <input
                  id='newPassword'
                  type='password'
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  className='w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg 
                    text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition'
                  placeholder='Enter new password'
                  required
                  disabled={status === 'loading'}
                />
                
                {newPassword && (
                  <div className='mt-2'>
                    <div className='flex items-center gap-2 mb-1'>
                      <div className='flex-1 h-2 bg-slate-700 rounded-full overflow-hidden'>
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.strength === 1 ? 'text-red-400' :
                        passwordStrength.strength === 2 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
                {passwordError && (
                  <p className='text-red-400 text-sm mt-1'>{passwordError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-slate-300 mb-2'
                >
                  Confirm Password
                </label>
                <input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg 
                    text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition'
                  placeholder='Confirm new password'
                  required
                  disabled={status === 'loading'}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className='text-red-400 text-sm mt-1'>Passwords do not match</p>
                )}
              </div>

              <button
                type='submit'
                disabled={status === 'loading' || !newPassword || !confirmPassword || newPassword !== confirmPassword}
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
