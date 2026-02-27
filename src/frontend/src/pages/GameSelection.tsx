import { useState, useEffect } from 'react';
import { subscriptionApi, SubscriptionStatus } from '../services/api';

interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  difficulty: string;
  image_url: string | null;
}

export function GameSelection() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load subscription and games in parallel
      const [subRes, gamesRes] = await Promise.all([
        subscriptionApi.getCurrent(),
        subscriptionApi.getGamesCatalog(),
      ]);

      setSubscription(subRes.data);
      setGames(gamesRes.data.games);

      // Set currently selected games
      if (subRes.data.subscription?.game_selections) {
        const selected = subRes.data.subscription.game_selections.map((g: any) => g.game_id);
        setSelectedGames(new Set(selected));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const gameLimit = subscription?.available_games?.game_limit || 0;
  const remainingSlots = gameLimit - selectedGames.size;

  const handleToggleGame = (gameId: string) => {
    const newSelected = new Set(selectedGames);

    if (newSelected.has(gameId)) {
      newSelected.delete(gameId);
    } else if (newSelected.size < gameLimit) {
      newSelected.add(gameId);
    }

    setSelectedGames(newSelected);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!subscription?.subscription?.id) return;

    setSaving(true);
    setError(null);

    try {
      await subscriptionApi.updateGameSelection(
        subscription.subscription.id,
        Array.from(selectedGames)
      );
      setSuccess('Game selection saved successfully!');
      // Refresh to get updated state
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save selection');
    } finally {
      setSaving(false);
    }
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(games.map((g) => g.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!subscription?.has_active || !subscription.subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Subscription</h1>
          <p className="text-gray-600 mb-8">
            You need an active game pack subscription to select games.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            View Pricing
          </a>
        </div>
      </div>
    );
  }

  const isFullAnnual = subscription.subscription.plan_type === 'full_annual';

  if (isFullAnnual) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Games Unlocked!</h1>
          <p className="text-gray-600 mb-8">
            You have full access to all games with your annual subscription.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.slice(0, 8).map((game) => (
              <div key={game.id} className="bg-white p-4 rounded-lg shadow">
                <div className="text-green-500 text-2xl mb-2">✓</div>
                <div className="font-medium">{game.name}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 mt-4">+ {games.length - 8} more games</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Games
          </h1>
          <p className="text-gray-600">
            Choose up to {gameLimit} games for your {subscription.subscription.plan_type?.replace('_', ' ')} subscription
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-gray-600">Selected: </span>
            <span className="font-semibold text-gray-900">
              {selectedGames.size} / {gameLimit}
            </span>
            {remainingSlots > 0 && (
              <span className="text-gray-500 ml-2">({remainingSlots} remaining)</span>
            )}
          </div>
          <div className="flex gap-4">
            {subscription.available_games?.swap_available && (
              <span className="text-green-600">1 swap available</span>
            )}
            {subscription.days_remaining && (
              <span className="text-gray-500">
                {subscription.days_remaining} days remaining
              </span>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filteredGames.map((game) => {
            const isSelected = selectedGames.has(game.id);
            const isDisabled = !isSelected && selectedGames.size >= gameLimit;

            return (
              <button
                key={game.id}
                onClick={() => handleToggleGame(game.id)}
                disabled={isDisabled}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {game.image_url ? (
                    <img src={game.image_url} alt={game.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-4xl">🎮</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{game.name}</h3>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{game.category}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{game.difficulty}</span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No games found matching your filters.
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving || selectedGames.size === 0}
            className={`px-8 py-3 rounded-lg font-semibold ${
              saving || selectedGames.size === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Selection'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSelection;
