import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';
import { UIIcon } from '../components/ui/Icon';
import { Mascot } from '../components/Mascot';

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
    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-400' };
    if (strength <= 4) return { strength: 2, label: 'Okay', color: 'bg-yellow-400' };
    return { strength: 3, label: 'Strong', color: 'bg-green-400' };
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

  return (
    <div className='min-h-screen flex font-nunito bg-[#FFF8F0]'>
      {/* LEFT SIDE: Brand & Mascot (Hidden on mobile) */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#3B82F6] items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
        <div className='absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl'></div>

        <div className='relative z-10 text-center flex flex-col items-center max-w-lg'>
          <Mascot state={status === 'success' ? 'celebrating' : status === 'invalid' ? 'thinking' : 'idle'} responsiveSize='lg' className='mb-8 drop-shadow-2xl' />
          <h1 className='text-5xl font-extrabold text-white mb-6 leading-tight'>
            Almost There! <br />
            <span className='text-[#E85D04]'>Secure your account.</span>
          </h1>
          <p className='text-xl text-white/90 font-medium'>
            Enter a strong new password to protect your child's learning progress.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Area */}
      <div className='w-full lg:w-1/2 flex flex-col relative overflow-y-auto min-h-screen'>
        {/* Header / Back Link */}
        <header className='p-6 lg:p-8 flex justify-between items-center z-10 sticky top-0 bg-[#FFF8F0]/90 backdrop-blur-md'>
          <Link
            to='/login'
            className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-600 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:scale-105 transition shadow-sm'
            aria-label='Back to login'
          >
            <UIIcon name={'back' as any} size={24} />
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
            {status === 'success' && (
              <div className='text-center'>
                <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-green-200'>
                  <UIIcon name={'check-circle' as any} size={40} className='text-green-500' />
                </div>
                <h2 className='text-4xl font-extrabold text-slate-800 mb-4'>Password Reset!</h2>
                <p className='text-lg text-slate-500 font-medium mb-8'>Your password has been updated. Redirecting to login...</p>

                <Link
                  to='/login'
                  className='inline-flex items-center justify-center w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-xl rounded-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all'
                >
                  Go to Login Now
                </Link>
              </div>
            )}

            {status === 'invalid' && (
              <div className='text-center'>
                <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-red-200'>
                  <UIIcon name={'alert-circle' as any} size={40} className='text-red-500' />
                </div>
                <h2 className='text-4xl font-extrabold text-slate-800 mb-4'>Invalid Link</h2>
                <p className='text-lg text-slate-500 font-medium mb-8'>
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link
                  to='/forgot-password'
                  className='inline-flex items-center justify-center w-full py-4 bg-[#E85D04] hover:bg-[#D05303] text-white font-black text-xl rounded-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all group'
                >
                  Request New Link <span className='group-hover:translate-x-1 transition-transform ml-2'>➡️</span>
                </Link>
              </div>
            )}

            {status !== 'success' && status !== 'invalid' && (
              <>
                <h2 className='text-4xl font-extrabold text-slate-800 mb-2'>Create New Password</h2>
                <p className='text-lg text-slate-500 font-medium mb-8'>Enter your strong new password below.</p>

                {error && (
                  <div className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 font-medium shadow-[0_4px_0_0_rgba(239,68,68,0.2)]'>
                    <div className='flex items-center gap-2'>
                      <UIIcon name={'alert-circle' as any} className='h-5 w-5' />
                      {error}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4'>
                    <div>
                      <label htmlFor='newPassword' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                        New Password
                      </label>
                      <div className='relative group mb-1'>
                        <UIIcon name={'lock' as any} size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                        <input
                          id='newPassword'
                          type='password'
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (passwordError) validatePassword(e.target.value);
                          }}
                          className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all'
                          placeholder='Enter new password'
                          required
                          disabled={status === 'loading'}
                        />
                      </div>

                      {newPassword && (
                        <div className='px-1 mb-2'>
                          <div className='flex items-center gap-2 mb-1'>
                            <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
                              <div
                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${passwordStrength.strength === 1 ? 'text-red-500' :
                              passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-green-500'
                              }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                        </div>
                      )}
                      {passwordError && (
                        <p className='text-red-500 text-sm font-bold mt-1 px-1'>{passwordError}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor='confirmPassword' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                        Confirm Password
                      </label>
                      <div className='relative group mb-1'>
                        <UIIcon name={'check' as any} size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                        <input
                          id='confirmPassword'
                          type='password'
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all'
                          placeholder='Confirm new password'
                          required
                          disabled={status === 'loading'}
                        />
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className='text-red-500 text-sm font-bold mt-1 px-1'>Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <button
                    type='submit'
                    disabled={status === 'loading' || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className='w-full py-4 bg-[#E85D04] hover:bg-[#D05303] text-white font-black text-xl rounded-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group'
                  >
                    {status === 'loading' ? (
                      <span className='flex items-center justify-center gap-2'>
                        <UIIcon name={'loader' as any} className='animate-spin' size={24} /> Resetting...
                      </span>
                    ) : (
                      <span className='flex items-center justify-center gap-2'>
                        Reset Password <span className='group-hover:translate-x-1 transition-transform'>➡️</span>
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
