import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuthStore, useSettingsStore } from '../store';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { Mascot } from '../components/Mascot';
import { Sparkles, Hand, ShieldCheck, Activity, FlaskConical } from 'lucide-react';

// Reusable animated feature card
const DynamicFeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
  delay
}: {
  icon: any,
  title: string,
  description: string,
  color: string,
  delay: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`bg-white rounded-[2rem] p-8 border-4 shadow-[0_8px_0_0_rgba(0,0,0,0.1)] relative overflow-hidden`}
      style={{ borderColor: color }}
    >
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm`} style={{ backgroundColor: `${color}20`, color: color }}>
        <Icon size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-600 font-bold text-lg leading-relaxed">{description}</p>

      {/* Decorative background blob */}
      <div
        className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

export function Home() {
  const { isAuthenticated } = useAuthStore();
  const { onboardingCompleted, setDemoMode } = useSettingsStore();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const startDemo = () => {
    setDemoMode(true);
    navigate('/games');
  };

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <>
      {!onboardingCompleted && <OnboardingFlow />}

      <div className='min-h-screen bg-[#FFF8F0] overflow-hidden font-nunito flex flex-col'>

        {/* HEADER */}
        <header className="absolute top-0 w-full z-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-sm border-2 border-white">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight hidden sm:block">Advay<span className="text-[#3B82F6]">Learning</span></span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-3 text-slate-700 font-bold text-lg hover:text-[#3B82F6] transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-6 py-3 bg-[#E85D04] text-white font-black text-lg rounded-full shadow-[0_4px_0_0_#D05303] active:translate-y-[4px] active:shadow-none hover:bg-[#ff6c14] transition-all">
              Sign Up
            </Link>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative flex-1 flex flex-col items-center justify-center pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">

          {/* Animated Floaties in Background */}
          {!reducedMotion && (
            <>
              <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-40 left-10 md:left-32 text-[#E85D04] opacity-20">
                <Sparkles size={80} />
              </motion.div>
              <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute bottom-40 right-10 md:right-32 text-[#3B82F6] opacity-20">
                <Hand size={96} />
              </motion.div>
            </>
          )}

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative z-20 max-w-5xl mx-auto flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-8 px-6 py-3 bg-white text-[#E85D04] rounded-full font-black text-sm tracking-widest border-2 border-orange-200 shadow-sm uppercase"
            >
              ✨ The magic camera playground
            </motion.div>

            <h1 className='text-6xl md:text-8xl font-black mb-8 text-[#2D3748] tracking-tight leading-[1.1]'>
              Learn With Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#0EA5E9]">
                Whole Body.
              </span>
            </h1>

            <p className='text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-bold leading-relaxed'>
              Put down the tablet. Watch your kids solve math with their fingers, do yoga poses, and trace letters in mid-air!
            </p>

            <div className='flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-xl mx-auto'>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-[#E85D04] hover:bg-[#ff6c14] text-white px-10 py-5 rounded-full font-black text-2xl border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  Create a Profile <span className="text-3xl">🚀</span>
                </button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <button
                  onClick={startDemo}
                  className="w-full bg-white text-[#3B82F6] border-4 border-[#3B82F6] px-10 py-5 rounded-full font-black text-2xl shadow-[0_6px_0_0_#2563EB] active:translate-y-[6px] active:shadow-none transition-all drop-shadow-sm flex items-center justify-center gap-3"
                >
                  <Sparkles size={28} /> Try The Magic
                </button>
              </motion.div>
            </div>
            <p className="mt-8 text-sm font-black text-slate-400 tracking-widest uppercase">No extra hardware required • Runs safely in your browser</p>
          </motion.div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 bg-white relative z-20">
          <div className="absolute top-0 w-full h-12 overflow-hidden -translate-y-[99%]">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute w-full h-full text-white fill-current">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight">Digital Magic, Physical Reality.</h2>
              <p className="text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed">Turn passive screen time into an active, full-body learning experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <DynamicFeatureCard
                icon={Activity}
                title="Full-Body Movement"
                description="We track hands, posture, and facial expressions. Your child can learn phonics by smiling, or solve puzzles by jumping."
                color="#E85D04"
                delay={0}
              />
              <DynamicFeatureCard
                icon={FlaskConical}
                title="Risk-Free Reality"
                description="Mix explosive chemicals, paint the walls, or build giant block towers—all the physical fun with zero real-world mess."
                color="#3B82F6"
                delay={0.2}
              />
              <DynamicFeatureCard
                icon={Sparkles}
                title="The Open Playground"
                description="Over 250 interactive games spanning Math, Art, Music, and Science. All instantly available in a non-linear sandbox."
                color="#10B981"
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* PRIVACY PROMISE (PARENT FACING) */}
        <section className="py-32 bg-[#2D3748] text-white relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-800 p-10 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl relative"
              >
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#10B981]/20 rounded-full blur-3xl"></div>
                <ShieldCheck size={80} className="text-[#10B981] mb-8 relative z-10" />
                <h2 className="text-4xl font-black mb-8 text-white tracking-tight relative z-10">Worry-Free for Parents</h2>
                <ul className="space-y-6 relative z-10">
                  {[
                    "100% On-Device AI: Video frames are analyzed instantly and deleted. Nothing goes to the cloud.",
                    "Zero Advertisements, Zero Popups.",
                    "Camera-Based Sleep Lock: The game pauses automatically when parents leave the room or kids get too close.",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-[#10B981] text-slate-900 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">✓</div>
                      <p className="text-xl text-slate-300 font-bold leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <div className="w-full lg:w-1/2 text-center lg:text-left mt-12 lg:mt-0">
              <h3 className="text-6xl font-black mb-8 text-white leading-[1.1] tracking-tight">
                What happens in the room, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]">stays in the room.</span>
              </h3>
              <p className="text-2xl text-slate-400 mb-12 font-bold leading-relaxed">
                We built Advay Learning on WebAssembly. That means our complex Computer Vision runs entirely inside your device browser. Uncompromising privacy by design.
              </p>
              <button onClick={() => navigate('/register')} className="bg-[#FFF8F0] text-slate-900 hover:bg-white text-2xl font-black px-12 py-6 rounded-full border-4 border-[#000000] shadow-[0_6px_0_0_#000000] active:translate-y-[6px] active:shadow-none transition-all drop-shadow-xl inline-block max-w-full">
                Create Child Profile
              </button>
            </div>
          </div>
        </section>

        {/* Global Mascot Guide */}
        <Mascot
          state='happy'
          message="Let's play and learn!"
          className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 drop-shadow-2xl'
          decorative={true}
          hideOnMobile={true}
          responsiveSize='auto'
        />
      </div>
    </>
  );
}
