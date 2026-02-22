import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';
import { UIIcon } from '../components/ui/Icon';
import { Mascot } from '../components/Mascot';

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

  return (
    <div className='min-h-screen flex font-nunito bg-[#FFF8F0]'>
      {/* LEFT SIDE: Brand & Mascot (Hidden on mobile) */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#3B82F6] items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
        <div className='absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl'></div>

        <div className='relative z-10 text-center flex flex-col items-center max-w-lg'>
          <Mascot state={status === 'success' ? 'celebrating' : 'idle'} responsiveSize='lg' className='mb-8 drop-shadow-2xl' />
          <h1 className='text-5xl font-extrabold text-white mb-6 leading-tight'>
            No Worries! <br />
            <span className='text-[#E85D04]'>We've got you.</span>
          </h1>
          <p className='text-xl text-white/90 font-medium'>
            Follow the magical link to set a new password.
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
            {status === 'success' ? (
              <div className='text-center'>
                <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-green-200'>
                  <UIIcon name={'check-circle' as any} size={40} className='text-green-500' />
                </div>
                <h2 className='text-4xl font-extrabold text-slate-800 mb-4'>Check Your Email</h2>
                <p className='text-lg text-slate-500 font-medium mb-8'>{message}</p>

                <Link
                  to='/login'
                  className='inline-flex items-center justify-center w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-xl rounded-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all'
                >
                  Return to Login
                </Link>
              </div>
            ) : (
              <>
                <h2 className='text-4xl font-extrabold text-slate-800 mb-2'>Reset Password</h2>
                <p className='text-lg text-slate-500 font-medium mb-8'>Enter your email and we'll send you a link to reset it.</p>

                {error && (
                  <div className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 font-medium shadow-[0_4px_0_0_rgba(239,68,68,0.2)]'>
                    <div className='flex items-center gap-2'>
                      <UIIcon name={'alert-circle' as any} className='h-5 w-5' />
                      {error}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm'>
                    <div className='space-y-4'>
                      <div>
                        <label htmlFor='forgot-email' className='block text-sm font-bold text-slate-700 mb-2 px-1'>
                          Account Email
                        </label>
                        <div className='relative group'>
                          <UIIcon name={'mail' as any} size={20} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6]' aria-hidden='true' />
                          <input
                            id='forgot-email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/20 transition-all'
                            placeholder='parent@example.com'
                            required
                            disabled={status === 'loading'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type='submit'
                    disabled={status === 'loading'}
                    className='w-full py-4 bg-[#E85D04] hover:bg-[#D05303] text-white font-black text-xl rounded-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group'
                  >
                    {status === 'loading' ? (
                      <span className='flex items-center justify-center gap-2'>
                        <UIIcon name={'loader' as any} className='animate-spin' size={24} /> Sending...
                      </span>
                    ) : (
                      <span className='flex items-center justify-center gap-2'>
                        Send Reset Link <span className='group-hover:translate-x-1 transition-transform'>➡️</span>
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
