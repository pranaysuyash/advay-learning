import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UIIcon } from './Icon';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <header className="bg-white/70 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-advay-slate">
            <span className="text-advay-slate">Advay</span>
            <span className="text-pip-orange">.</span>
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-text-secondary hover:text-text-primary transition">Home</Link>
            <Link to="/games" className="text-text-secondary hover:text-text-primary transition">Games</Link>
            <Link to="/progress" className="text-text-secondary hover:text-text-primary transition">Progress</Link>
            <Link to="/settings" className="text-text-secondary hover:text-text-primary transition">Settings</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white/70 backdrop-blur border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-text-secondary text-sm">
          Built with <UIIcon name="heart" size={14} className="inline text-pip-orange" /> for young learners everywhere
        </div>
      </footer>
    </div>
  );
}
