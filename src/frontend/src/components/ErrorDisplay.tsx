import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { getErrorMessage } from '../utils/errorMessages';

interface ErrorDisplayProps {
  errorCode: string;
  error?: Error | null;
  title?: string;
  description?: string;
  action?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'modal' | 'toast' | 'inline';
  showDetails?: boolean;
}

/**
 * ErrorDisplay Component
 *
 * Shows human-friendly error messages with actionable recovery steps.
 * Maps technical errors to child/parent-friendly language.
 *
 * Props:
 * - errorCode: Technical error code or type
 * - error: Optional Error object for additional context
 * - title, description, action: Override default messages
 * - onRetry: Callback when user clicks retry
 * - onDismiss: Callback when user dismisses error
 * - variant: 'modal' (fullscreen), 'toast' (notification), 'inline' (in-content)
 * - showDetails: Show error details in a collapsible section
 */
export function ErrorDisplay({
  errorCode,
  error,
  title: customTitle,
  description: customDescription,
  action: customAction,
  onRetry,
  onDismiss,
  variant = 'modal',
  showDetails = false,
}: ErrorDisplayProps) {
  const errorMsg = getErrorMessage(errorCode, error);
  const title = customTitle || errorMsg.title;
  const description = customDescription || errorMsg.description;
  const action = customAction || errorMsg.action;

  if (variant === 'toast') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className='fixed top-4 left-4 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 md:w-96 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 z-50'
      >
        <div className='flex gap-4'>
          <div className='text-3xl flex-shrink-0'>{errorMsg.emoji}</div>
          <div className='flex-1 min-w-0'>
            <h3 className='font-bold text-red-900'>{title}</h3>
            <p className='text-sm text-red-700 mt-1'>{description}</p>
            <p className='text-xs text-red-600 mt-2 font-semibold'>👉 {action}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className='flex-shrink-0 text-red-400 hover:text-red-600'
              aria-label='Close error message'
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-red-50 border-2 border-red-200 rounded-lg p-6 my-4'
      >
        <div className='flex gap-4'>
          <div className='text-4xl flex-shrink-0'>{errorMsg.emoji}</div>
          <div className='flex-1'>
            <h3 className='text-lg font-bold text-red-900'>{title}</h3>
            <p className='text-red-700 mt-2'>{description}</p>
            <div className='mt-4 bg-white rounded p-3 border border-red-100'>
              <p className='text-sm text-gray-700'>
                <span className='font-bold'>What to do:</span> {action}
              </p>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant='primary'
                size='sm'
                className='mt-4'
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default: modal variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className='w-full max-w-md bg-white rounded-lg shadow-lg p-6'
      >
        {/* Error Icon */}
        <div className='text-6xl text-center mb-4'>{errorMsg.emoji}</div>

        {/* Title */}
        <h2 className='text-2xl font-bold text-center text-gray-900 mb-3'>{title}</h2>

        {/* Description */}
        <p className='text-center text-gray-700 mb-6'>{description}</p>

        {/* Action Box */}
        <div className='bg-blue-50 border-l-4 border-blue-500 rounded p-4 mb-6'>
          <p className='text-sm text-blue-900'>
            <span className='font-bold'>What to do:</span>
            <br />
            {action}
          </p>
        </div>

        {/* Error Details (if showDetails) */}
        {showDetails && error && (
          <details className='mb-6'>
            <summary className='cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-700'>
              Technical Details (for developers)
            </summary>
            <pre className='mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 text-gray-700'>
              {JSON.stringify(
                {
                  code: errorCode,
                  message: error.message,
                  name: error.name,
                  stack: error.stack?.split('\n').slice(0, 3).join('\n'),
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}

        {/* Buttons */}
        <div className='flex flex-col gap-3'>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant='primary'
              size='lg'
              className='w-full'
            >
              Try Again
            </Button>
          )}

          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant='secondary'
              size='lg'
              className='w-full'
            >
              {onRetry ? 'Continue without fix' : 'Dismiss'}
            </Button>
          )}
        </div>

        {/* Support Message */}
        <p className='text-xs text-gray-500 text-center mt-6'>
          If the problem continues, please let us know by asking a grown-up to contact support.
        </p>
      </motion.div>
    </motion.div>
  );
}
