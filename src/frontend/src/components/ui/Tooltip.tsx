import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 0.3,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const newTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    setTimer(newTimer);
  };

  const handleMouseLeave = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white/20',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white/20',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white/20',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white/20',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positions[position]} pointer-events-none`}
          >
            <div className="bg-[#2D3748] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg border border-border whitespace-nowrap">
              {content}
              <div
                className={`absolute w-0 h-0 border-4 border-transparent ${arrowPositions[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Info icon with tooltip for form fields
interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  return (
    <Tooltip content={content}>
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-xs text-white/60 cursor-help hover:bg-white/20 hover:text-white/80 transition">
        ?
      </span>
    </Tooltip>
  );
}
