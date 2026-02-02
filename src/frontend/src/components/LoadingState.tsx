import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Loading hand tracking...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: { pip: 'text-4xl', container: 'w-16 h-16', text: 'text-sm' },
    md: { pip: 'text-6xl', container: 'w-24 h-24', text: 'text-base' },
    lg: { pip: 'text-8xl', container: 'w-32 h-32', text: 'text-lg' },
  };

  const { pip, container, text } = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${container} relative`}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className={`${pip} absolute inset-0 flex items-center justify-center`}>
          🦊
        </div>
        <motion.div
          className="absolute inset-0 bg-orange-400/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      <motion.div
        className="mt-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.span
          className={`${text} text-text-secondary`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.span>
      </motion.div>

      <motion.div
        className="mt-3 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-pip-orange rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, message, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary/80 backdrop-blur-sm z-50">
          <LoadingState message={message} />
        </div>
      )}
    </div>
  );
}
