import { Navigate, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuthStore, useSettingsStore } from '../store';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { Mascot } from '../components/Mascot';
import { Button } from '../components/ui/Button';
import { FeatureCard } from '../components/ui/Card';
import { UIIcon } from '../components/ui/Icon';

export function Home() {
  const { isAuthenticated } = useAuthStore();
  const { onboardingCompleted, setDemoMode } = useSettingsStore();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const startDemo = () => {
    // Start a no-camera demo session and navigate to games (transient)
    setDemoMode(true);
    // Ensure camera remains disabled for privacy in demo
    // (the demo route/component should respect this setting and not request permission)
    navigate('/games');
  };

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <>
      {!onboardingCompleted && <OnboardingFlow />}
      <div className='max-w-7xl mx-auto px-4 py-16'>
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <h1 className='text-5xl font-bold mb-6 text-text-primary'>
            Learn with Your Hands
          </h1>
          <p className='text-xl text-text-secondary mb-8 max-w-2xl mx-auto'>
            An AI-powered educational platform where children can learn
            alphabets, words, and objects through interactive hand tracking and
            drawing.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
            <Button
              size='lg'
              icon='sparkles'
              onClick={() => navigate('/games')}
            >
              Play Games
            </Button>

            <Button
              size='lg'
              variant='primary'
              onClick={startDemo}
              aria-label='Try demo - no account required'
            >
              ⚡ Start Playing
            </Button>
          </div>
        </motion.div>

        <section className='mt-20'>
          <h2 className='sr-only'>Key Features</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                id: 'feature-hand-tracking',
                title: 'Hand Tracking',
                description: 'Draw and interact using natural hand gestures',
              },
              {
                id: 'feature-multilang',
                title: 'Multi-Language',
                description: 'Learn English, Hindi, Kannada and more alphabets',
              },
              {
                id: 'feature-gamified',
                title: 'Gamified',
                description: 'Earn rewards and track your progress',
              },
            ].map((feature) => (
              <article key={feature.id}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={
                    feature.id === 'feature-hand-tracking' ? (
                      <UIIcon
                        name='hand'
                        size={28}
                        className='text-vision-blue'
                      />
                    ) : feature.id === 'feature-multilang' ? (
                      <UIIcon
                        name='letters'
                        size={28}
                        className='text-pip-orange'
                      />
                    ) : (
                      <UIIcon
                        name='trophy'
                        size={28}
                        className='text-warning'
                      />
                    )
                  }
                />
              </article>
            ))}
          </div>
        </section>

        <Mascot
          state='happy'
          message="Hi there! I'm Pip! Let's go on an adventure together!"
          className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-10'
          decorative={true}
          hideOnMobile={false}
          responsiveSize='auto'
        />
      </div>
    </>
  );
}
