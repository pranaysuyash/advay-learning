import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../../store';
import { Button } from './Button';
import { useCalmModeContext } from '../CalmModeProvider';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { demoMode, setDemoMode } = useSettingsStore();
  const { isCalmMode, colors } = useCalmModeContext();
  const location = useLocation();

  const exitDemo = () => {
    setDemoMode(false);
    // Navigate to home page
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Progress', path: '/progress' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div 
      className={`min-h-screen flex flex-col font-nunito transition-colors duration-500 ${
        isCalmMode ? '' : 'selection:bg-[#3B82F6]/30'
      }`}
      style={{ backgroundColor: colors.background }}
    >
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:text-advay-slate focus:px-6 focus:py-4 focus:rounded-2xl focus:shadow-2xl focus:border-3 focus:border-[#3B82F6] focus:font-bold focus:outline-none'
      >
        Skip to content
      </a>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className='bg-[#E85D04] text-white py-3 px-6 flex justify-between items-center text-sm sm:text-base font-bold tracking-wide relative z-50 shadow-[0_4px_0_#E5B86E]'>
          <span className="flex items-center gap-2">
            <span className="text-xl">🎮</span> Demo Mode - Try the full experience with camera access
          </span>
          <Button
            size='sm'
            variant='secondary'
            onClick={exitDemo}
            className='border-2'
            aria-label='Exit demo mode'
          >
            Exit Demo
          </Button>
        </div>
      )}

      <header className='bg-white/90 backdrop-blur-md border-b-4 border-[#F2CC8F] sticky top-0 z-40 shadow-[0_4px_0_#E5B86E]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
          <Link
            to='/'
            className='text-3xl font-black tracking-tight text-advay-slate group hover:scale-105 transition-transform'
            aria-label="Advay Home"
          >
            Advay<span className='text-[#E85D04]'>.</span>
          </Link>

          <nav className='hidden md:block' aria-label='Main navigation'>
            <ul className='flex gap-8 list-none p-0 m-0'>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path));

                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`text-sm font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isActive
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                        : 'text-text-secondary hover:text-[#3B82F6] hover:bg-slate-50'
                        }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      <main id='main-content' tabIndex={-1} className='flex-1 flex flex-col focus:outline-none relative z-10'>
        {children}
      </main>

      <footer className='bg-slate-800 border-t-4 border-slate-900 overflow-hidden relative'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[length:14px_14px] opacity-20 pointer-events-none mix-blend-overlay'></div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 text-center'>
          <div className='flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-400'>
            <p>© {new Date().getFullYear()} Advay Learning</p>
            <span className='text-advay-slate hidden sm:inline'>•</span>
            <Link to='/privacy' className='hover:text-white transition-colors focus:outline-none focus:text-white'>
              Privacy Promise
            </Link>
            <span className='text-advay-slate hidden sm:inline'>•</span>
            <Link to='/terms' className='hover:text-white transition-colors focus:outline-none focus:text-white'>
              Terms of Play
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
