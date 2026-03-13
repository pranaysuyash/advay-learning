import { Link } from 'react-router-dom';

export type CameraErrorKind = 'init' | 'permission' | 'runtime' | 'unknown';

export interface CameraCrashFallbackProps {
  gameName: string;
  errorKind: CameraErrorKind;
  message?: string;
  onRetry?: () => void;
  onFallbackMode?: () => void;
  fallbackActionLabel?: string;
  showHomeAction?: boolean;
}

const ERROR_COPY: Record<CameraErrorKind, string> = {
  init: 'We couldn’t start camera tracking. Retry, or continue in a non-camera mode if available.',
  permission: 'Camera access is blocked. Allow camera permission in your browser, then try again.',
  runtime: 'Camera tracking stopped unexpectedly. Retry to restart it.',
  unknown: 'Something went wrong with camera features in this game.',
};

export function CameraCrashFallback({
  gameName,
  errorKind,
  message,
  onRetry,
  onFallbackMode,
  fallbackActionLabel,
  showHomeAction = true,
}: CameraCrashFallbackProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4'>
      <div className='w-full max-w-lg rounded-2xl border border-[#F2CC8F] bg-white p-6 text-advay-slate shadow-xl'>
        <h1 className='text-xl font-bold'>Camera Issue in {gameName}</h1>
        <p className='mt-3 text-slate-500 font-medium'>{ERROR_COPY[errorKind]}</p>
        {import.meta.env.DEV && message && (
          <p className='mt-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200'>
            {message}
          </p>
        )}

        <div className='mt-6 flex flex-wrap gap-3'>
          {onRetry && (
            <button
              type='button'
              className='rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500'
              onClick={onRetry}
            >
              Retry Camera
            </button>
          )}
          {onFallbackMode && (
            <button
              type='button'
              className='rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500'
              onClick={onFallbackMode}
            >
              {fallbackActionLabel ?? 'Continue Without Camera'}
            </button>
          )}
          {showHomeAction && (
            <Link
              className='rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600'
              to='/'
            >
              Go Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraCrashFallback;
