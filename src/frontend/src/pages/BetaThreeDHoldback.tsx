import { Link } from 'react-router-dom';

export default function BetaThreeDHoldback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
          Public beta
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          3D games are not in the March beta build
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The March public beta is focused on the lighter, more stable game set
          across the supported mobile and desktop launch matrix. The 3D game
          pack stays in development until its performance and device behavior are
          ready for a wider release.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/games"
            className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Browse beta games
          </Link>
          <Link
            to="/support"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ask for early access
          </Link>
        </div>
      </div>
    </div>
  );
}
