import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';
import { UIIcon } from '../components/ui/Icon';
import { Mascot } from '../components/Mascot';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'invalid' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setError('Invalid verification link. Please check your email for the correct link.');
    } else {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    setStatus('loading');

    try {
      await authApi.verifyEmail(token);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setError('This verification link is invalid or has expired. Please request a new verification email.');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = async () => {
    navigate('/forgot-password');
  };

  if (status === 'invalid' || status === 'error') {
    return (
      <div className='min-h-screen flex font-nunito bg-[#FFF8F0]'>
        {/* LEFT SIDE: Brand & Mascot */}
        <div className='hidden lg:flex lg:w-1/2 bg-red-400 items-center justify-center p-12 relative overflow-hidden'>
          <div className='absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
          <div className='absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl'></div>

          <div className='relative z-10 text-center flex flex-col items-center max-w-lg'>
            <Mascot state='idle' responsiveSize='lg' className='mb-8 drop-shadow-2xl' />
            <h1 className='text-5xl font-extrabold text-white mb-6 leading-tight'>
              Oops! <br />
              <span className='text-[#FFD93D]'>Something went wrong.</span>
            </h1>
            <p className='text-xl text-white/90 font-medium'>
              {error || "We couldn't verify your email. Let's try again!"}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form Area */}
        <div className='w-full lg:w-1/2 flex flex-col relative overflow-y-auto min-h-screen'>
          <header className='p-6 lg:p-8 flex justify-between items-center z-10 sticky top-0 bg-[#FFF8F0]/90 backdrop-blur-md'>
            <Link
              to='/login'
              className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#F2CC8F] text-advay-slate hover:border-[#3B82F6] hover:text-[#3B82F6] hover:scale-105 transition shadow-[0_4px_0_#E5B86E]'
              aria-label='Back to login'
            >
              <UIIcon name='back' size={24} />
            </Link>
          </header>

          <div className='flex-1 flex items-center justify-center p-8'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='w-full max-w-md text-center'
            >
              <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-5xl'>❌</span>
              </div>
              <h2 className='text-3xl font-extrabold text-advay-slate mb-4'>
                Verification Failed
              </h2>
              <p className='text-advay-slate/70 mb-8'>
                {error}
              </p>
              <div className='space-y-4'>
                <button
                  onClick={handleResendEmail}
                  className='w-full py-4 px-6 bg-[#FF8C42] text-white font-bold rounded-xl hover:bg-[#E85D04] transition shadow-[0_4px_0_#C44D00] hover:translate-y-0.5 hover:shadow-[0_2px_0_#C44D00]'
                >
                  Request New Verification Email
                </button>
                <Link
                  to='/login'
                  className='block w-full py-4 px-6 bg-white border-2 border-[#3B82F6] text-[#3B82F6] font-bold rounded-xl hover:bg-[#3B82F6]/5 transition'
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#FFF8F0]'>
        <div className='text-center'>
          <Mascot state='waiting' responsiveSize='lg' className='mb-8' />
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4'></div>
          <p className='text-xl font-bold text-advay-slate'>Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex font-nunito bg-[#FFF8F0]'>
      {/* LEFT SIDE: Brand & Mascot */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#6BCB77] items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
        <div className='absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl'></div>

        <div className='relative z-10 text-center flex flex-col items-center max-w-lg'>
          <Mascot state='celebrating' responsiveSize='lg' className='mb-8 drop-shadow-2xl' />
          <h1 className='text-5xl font-extrabold text-white mb-6 leading-tight'>
            You're In! <br />
            <span className='text-[#FFD93D]'>Welcome aboard!</span>
          </h1>
          <p className='text-xl text-white/90 font-medium'>
            Your email has been verified. Time to start learning!
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Success Area */}
      <div className='w-full lg:w-1/2 flex flex-col relative overflow-y-auto min-h-screen'>
        <header className='p-6 lg:p-8 flex justify-between items-center z-10 sticky top-0 bg-[#FFF8F0]/90 backdrop-blur-md'>
          <div className='w-12'></div>
        </header>

        <div className='flex-1 flex items-center justify-center p-8'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='w-full max-w-md text-center'
          >
            <div className='w-24 h-24 bg-[#6BCB77] rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-5xl'>🎉</span>
            </div>
            <h2 className='text-3xl font-extrabold text-advay-slate mb-4'>
              Email Verified!
            </h2>
            <p className='text-advay-slate/70 mb-8'>
              Hooray! Your account is now active. Let's start your learning adventure!
            </p>
            <div className='space-y-4'>
              <button
                onClick={handleGoToLogin}
                className='w-full py-4 px-6 bg-[#FF8C42] text-white font-bold rounded-xl hover:bg-[#E85D04] transition shadow-[0_4px_0_#C44D00] hover:translate-y-0.5 hover:shadow-[0_2px_0_#C44D00]'
              >
                Go to Login
              </button>
              <Link
                to='/'
                className='block w-full py-4 px-6 bg-white border-2 border-[#3B82F6] text-[#3B82F6] font-bold rounded-xl hover:bg-[#3B82F6]/5 transition'
              >
                Explore Learning Games
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
