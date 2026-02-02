import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const data = await response.json();
        if (response.status === 400) {
          setError(data.detail || 'Invalid or expired token. Please request a new reset link.');
        } else {
          setError(data.detail || 'Something went wrong. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
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
              🔑
            </motion.div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Create New Password
            </h1>
            <p className='text-white/70'>
              Enter your new password below.
            </p>
          </div>

          {isSuccess ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='text-center space-y-6'
            >
              <div className='text-6xl mb-4'>🎉</div>
              <div className='bg-green-500/20 border border-green-500/30 rounded-xl p-4'>
                <p className='text-green-300 font-semibold mb-2'>
                  Password Reset Successful!
                </p>
                <p className='text-green-200/80 text-sm'>
                  Your password has been updated. Redirecting you to login...
                </p>
              </div>
              <Link
                to='/login'
                className='block text-center text-pip-orange hover:text-pip-orange/80 font-semibold'
              >
                Go to Login Now
              </Link>
            </motion.div>
          ) : !token ? (
            // Invalid Token State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='text-center space-y-6'
            >
              <div className='text-6xl mb-4'>⚠️</div>
              <div className='bg-red-500/20 border border-red-500/30 rounded-xl p-4'>
                <p className='text-red-300 font-semibold mb-2'>
                  Invalid Reset Link
                </p>
                <p className='text-red-200/80 text-sm'>
                  This password reset link is invalid or has expired. 
                  Please request a new one.
                </p>
              </div>
              <Button
                variant='primary'
                fullWidth
                onClick={() => navigate('/forgot-password')}
              >
                Request New Link
              </Button>
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

              {/* New Password */}
              <div>
                <label
                  htmlFor='newPassword'
                  className='block text-sm font-medium text-white/80 mb-2'
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
                  className='w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pip-orange transition text-lg'
                  placeholder='Enter new password'
                  required
                  disabled={isLoading}
                />
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className='mt-2'>
                    <div className='flex items-center gap-2 mb-1'>
                      <div className='flex-1 h-2 bg-white/20 rounded-full overflow-hidden'>
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
                    <p className='text-white/50 text-xs'>
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                )}
                {passwordError && (
                  <p className='text-red-400 text-sm mt-1'>{passwordError}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-white/80 mb-2'
                >
                  Confirm Password
                </label>
                <input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pip-orange transition text-lg'
                  placeholder='Confirm new password'
                  required
                  disabled={isLoading}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className='text-red-400 text-sm mt-1'>Passwords do not match</p>
                )}
              </div>

              <Button
                type='submit'
                variant='primary'
                size='lg'
                fullWidth
                isLoading={isLoading}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <div className='text-center pt-4 border-t border-white/10'>
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
          For your security, this reset link will expire in 24 hours. 
          Never share your password with anyone.
        </p>
      </motion.div>
    </div>
  );
}
