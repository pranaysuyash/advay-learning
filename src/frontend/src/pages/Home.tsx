import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';

export function Home() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }
  return (
    <div className='max-w-7xl mx-auto px-4 py-16'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center'
      >
        <h1 className='text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent'>
          Learn with Your Hands
        </h1>
        <p className='text-xl text-white/80 mb-8 max-w-2xl mx-auto'>
          An AI-powered educational platform where children can learn alphabets,
          words, and objects through interactive hand tracking and drawing.
        </p>

        <div className='flex gap-4 justify-center'>
          <Link
            to='/register'
            className='px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition'
          >
            Get Started
          </Link>
          <Link
            to='/game'
            className='px-8 py-3 bg-white/10 border border-border rounded-lg font-semibold hover:bg-white/20 transition'
          >
            Try Demo
          </Link>
        </div>
      </motion.div>

      <section className='mt-20'>
        <h2 className='sr-only'>Key Features</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {[
            {
              icon: '/assets/images/feature-hand-tracking.svg',
              title: 'Hand Tracking',
              description: 'Draw and interact using natural hand gestures',
            },
            {
              icon: '/assets/images/feature-multilang.svg',
              title: 'Multi-Language',
              description: 'Learn English, Hindi, Kannada and more alphabets',
            },
            {
              icon: '/assets/images/feature-gamified.svg',
              title: 'Gamified',
              description: 'Earn rewards and track your progress',
            },
          ].map((feature, i) => (
            <article
              key={i}
              className='bg-white/10 border border-border rounded-xl p-6 text-center shadow-sm'
            >
              <figure className='w-20 h-20 mx-auto mb-4'>
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className='w-full h-full object-contain'
                />
              </figure>
              <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
              <p className='text-white/70'>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
