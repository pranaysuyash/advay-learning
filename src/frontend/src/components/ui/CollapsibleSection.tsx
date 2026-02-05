import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false,
  icon 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-xl bg-white shadow-soft mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left rounded-xl transition hover:bg-bg-tertiary"
        aria-expanded={isOpen}
        aria-controls={`${title.replace(/\s+/g, '-').toLowerCase()}-content`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-2xl" aria-hidden="true">{icon}</span>
          )}
          <h3 className="text-lg font-semibold text-text-primary">
            {title}
          </h3>
          <motion.div
            initial={{ rotate: isOpen ? 90 : 0 }}
            animate={{ rotate: isOpen ? 0 : 90 }}
            transition={{ duration: 0.2 }}
            className="text-slate-500"
          >
            ▼
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${title.replace(/\s+/g, '-').toLowerCase()}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
