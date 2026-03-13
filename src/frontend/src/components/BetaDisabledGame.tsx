import { getBetaDisabledReason } from '../config/betaGames';

interface BetaDisabledGameProps {
  gameId: string;
  gameName: string;
}

export function BetaDisabledGame({ gameId, gameName }: BetaDisabledGameProps) {
  const reason = getBetaDisabledReason(gameId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-center">
        <div className="text-6xl mb-4">🛠️</div>
        <h1 className="text-3xl font-black text-advay-slate mb-4">
          Coming Later In Beta
        </h1>
        <p className="text-lg text-text-secondary mb-6">
          {gameName} is not in the March 31, 2026 public beta roster.
        </p>
        {reason && <p className="text-sm text-text-secondary mb-6">{reason}</p>}
        <a
          href="/games"
          className="inline-block w-full px-6 py-4 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-[1.5rem] font-black text-xl shadow-[0_4px_0_#1D4ED8] transition-all"
        >
          Browse Beta Games
        </a>
      </div>
    </div>
  );
}
