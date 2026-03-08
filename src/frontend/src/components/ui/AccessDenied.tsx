import { useNavigate } from 'react-router-dom';
import { useTTS } from '../../hooks/useTTS';
import { useSubscription } from '../../hooks/useSubscription';

interface AccessDeniedProps {
  gameName: string;
  gameId: string;
}

export function AccessDenied({ gameName, gameId }: AccessDeniedProps) {
  const navigate = useNavigate();
  const { speak } = useTTS();
  const { statusSource, errorReason } = useSubscription();
  const isServiceIssue = statusSource === 'api_error';

  const handleUpgrade = () => {
    void speak(
      `To play ${gameName}, you need a subscription. Let's go to the pricing page.`,
    );
    navigate('/pricing', { state: { selectedGame: gameId } });
  };

  return (
    <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4'>
      <div className='bg-white border-4 border-[#F2CC8F] rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden'>
        {/* Decorative background */}
        <div className='absolute top-0 left-0 w-full h-24 bg-[#3B82F6]/10 -z-10'></div>

        {/* Icon */}
        <div className='w-20 h-20 bg-[#F2CC8F]/20 rounded-full flex items-center justify-center mx-auto mb-4 -mt-12 border-3 border-white shadow-lg'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='40'
            height='40'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#E85D04'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='3' y='11' width='18' height='11' rx='2' ry='2'></rect>
            <path d='M7 11V7a5 5 0 0 1 10 0v4'></path>
          </svg>
        </div>

        {/* Title */}
        <h2 className='text-3xl font-black text-advay-slate tracking-tight text-center mb-2'>
          {isServiceIssue
            ? '⚠️ Access Check Unavailable'
            : `🔒 ${gameName} is Locked`}
        </h2>

        {/* Message */}
        <p className='text-lg font-bold text-text-secondary text-center mb-6'>
          {isServiceIssue
            ? 'We could not verify your subscription right now.'
            : 'This game requires a subscription to play.'}
        </p>

        {/* Benefits */}
        <div className='bg-slate-50 rounded-xl p-4 mb-6 space-y-2'>
          {isServiceIssue ? (
            <p className='text-sm font-bold text-slate-700'>
              {errorReason ||
                'Please retry in a moment. Your plan may still be active.'}
            </p>
          ) : (
            <>
              <p className='text-sm font-bold text-slate-700 flex items-center gap-2'>
                <span className='text-green-600'>✓</span>
                Access to selected games
              </p>
              <p className='text-sm font-bold text-slate-700 flex items-center gap-2'>
                <span className='text-green-600'>✓</span>
                Track your progress
              </p>
              <p className='text-sm font-bold text-slate-700 flex items-center gap-2'>
                <span className='text-green-600'>✓</span>
                Collect items & achievements
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className='space-y-3'>
          {isServiceIssue ? (
            <button
              onClick={() => window.location.reload()}
              className='w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-black text-lg shadow-lg transition-all transform hover:scale-105'
            >
              Retry Access Check
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              className='w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-black text-lg shadow-lg transition-all transform hover:scale-105'
            >
              View Subscription Plans
            </button>
          )}

          <button
            onClick={() => navigate('/games')}
            className='w-full py-4 bg-white border-2 border-[#F2CC8F] hover:border-[#3B82F6] text-advay-slate rounded-xl font-black text-lg transition-all'
          >
            Back to Games
          </button>
        </div>

        {/* Already subscribed hint */}
        <p className='text-xs text-center text-slate-400 mt-4 font-bold'>
          {isServiceIssue
            ? 'Already subscribed? Retry the check in a moment.'
            : 'Already subscribed? Refresh the page to try again.'}
        </p>
      </div>
    </div>
  );
}
