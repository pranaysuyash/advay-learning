import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className='min-h-screen flex flex-col bg-bg-primary text-text-primary'>
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:text-text-primary focus:px-4 focus:py-3 focus:rounded-xl focus:shadow-soft focus:border focus:border-border'
      >
        Skip to content
      </a>
      <header className='bg-white/70 backdrop-blur border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <Link
            to='/'
            className='text-2xl font-extrabold tracking-tight text-advay-slate'
          >
            <span className='text-advay-slate'>Advay</span>
            <span className='text-pip-orange'>.</span>
          </Link>
          <nav className='flex gap-6' aria-label='Main navigation'>
            <ul className='flex gap-6 list-none p-0 m-0'>
              <li>
                <Link
                  to='/'
                  className='text-text-secondary hover:text-text-primary transition'
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to='/games'
                  className='text-text-secondary hover:text-text-primary transition'
                >
                  Games
                </Link>
              </li>
              <li>
                <Link
                  to='/progress'
                  className='text-text-secondary hover:text-text-primary transition'
                >
                  Progress
                </Link>
              </li>
              <li>
                <Link
                  to='/settings'
                  className='text-text-secondary hover:text-text-primary transition'
                >
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id='main-content' tabIndex={-1} className='flex-1'>
        {children}
      </main>

      <footer className='bg-white/70 backdrop-blur border-t border-border py-4'>
        <div className='max-w-7xl mx-auto px-4 text-center text-text-secondary text-sm'>
          <div className='flex items-center justify-center gap-4'>
            <Link to='/privacy' className='hover:text-text-primary transition'>
              Privacy Policy
            </Link>
            <span className='text-border'>•</span>
            <Link to='/terms' className='hover:text-text-primary transition'>
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
