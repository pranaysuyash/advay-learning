import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UIIcon } from './Icon';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Advay Vision Learning
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-white/80 hover:text-white transition">Home</Link>
            <Link to="/games" className="text-white/80 hover:text-white transition">Games</Link>
            <Link to="/progress" className="text-white/80 hover:text-white transition">Progress</Link>
            <Link to="/settings" className="text-white/80 hover:text-white transition">Settings</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-black/30 border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/50 text-sm">
          Built with <UIIcon name="heart" size={14} className="inline text-red-400" /> for Advay and young learners everywhere
        </div>
      </footer>
    </div>
  );
}
