import { Link } from 'react-router-dom';

export type CameraErrorKind = 'init' | 'permission' | 'runtime' | 'unknown';

export interface CameraCrashFallbackProps {
  gameName: string;
  errorKind: CameraErrorKind;
  message?: string;
  onRetry?: () => void;
  onFallbackMode?: () => void;
  showHomeAction?: boolean;
}

const ERROR_COPY: Record<CameraErrorKind, string> = {
  init: 'We could not start camera tracking for this game.',
  permission: 'Camera permission was blocked or unavailable.',
  runtime: 'The camera tracker crashed while the game was running.',
  unknown: 'The game hit an unexpected camera issue.',
};

export function CameraCrashFallback({
  gameName,
  errorKind,
  message,
  onRetry,
  onFallbackMode,
  showHomeAction = true,
}: CameraCrashFallbackProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-950 px-4'>
      <div className='w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl'>
        <h1 className='text-xl font-bold'>Camera Issue in {gameName}</h1>
        <p className='mt-3 text-slate-300'>{ERROR_COPY[errorKind]}</p>
        {message && (
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
              Continue Without Camera
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
