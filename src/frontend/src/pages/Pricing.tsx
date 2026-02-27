import { useState, useEffect } from 'react';
import { subscriptionApi, SubscriptionPlanType, SubscriptionStatus } from '../services/api';

const PRICING_PLANS = [
  {
    id: 'game_pack_5' as SubscriptionPlanType,
    name: 'Explorer Pack',
    games: 5,
    duration: '3 months',
    price: 1500,
    priceDisplay: '₹1,500',
    description: 'Perfect for trying out our games',
    features: [
      'Access to 5 games',
      '3 months of play',
      '1 free game swap',
      'Progress tracking',
    ],
    popular: false,
  },
  {
    id: 'game_pack_10' as SubscriptionPlanType,
    name: 'Explorer Pack+',
    games: 10,
    duration: '3 months',
    price: 2500,
    priceDisplay: '₹2,500',
    description: 'More games for variety',
    features: [
      'Access to 10 games',
      '3 months of play',
      '1 free game swap',
      'Progress tracking',
    ],
    popular: false,
  },
  {
    id: 'full_annual' as SubscriptionPlanType,
    name: 'Full Access',
    games: 'All',
    duration: '12 months',
    price: 6000,
    priceDisplay: '₹6,000',
    description: 'Best value - unlimited access',
    features: [
      'All games unlocked',
      '12 months of play',
      'Unlimited game swaps',
      'Priority support',
      'Save ₹3,000 vs packs',
    ],
    popular: true,
  },
];

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check current subscription status
    subscriptionApi.getCurrent()
      .then((res) => setCurrentSubscription(res.data))
      .catch(() => setCurrentSubscription(null));
  }, []);

  const hasActiveSubscription = currentSubscription?.has_active;
  const currentPlan = currentSubscription?.subscription?.plan_type;
  const currentSubscriptionId = currentSubscription?.subscription?.id;
  const daysRemaining = currentSubscription?.days_remaining;

  const getUpgradeCredit = () => {
    if (!currentSubscription?.subscription || currentPlan === 'full_annual') return 0;
    const priceMap: Record<string, number> = { game_pack_5: 1500, game_pack_10: 2500 };
    const basePrice = priceMap[currentPlan || ''] || 0;
    return Math.round(((daysRemaining || 0) / 90) * basePrice);
  };

  const upgradeCredit = getUpgradeCredit();

  const handlePurchase = async (planId: SubscriptionPlanType) => {
    setLoading(planId);
    setError(null);

    try {
      // Upgrade flow
      if (currentSubscriptionId && hasActiveSubscription && planId === 'full_annual' && currentPlan !== 'full_annual') {
        await subscriptionApi.upgrade(currentSubscriptionId, planId);
        alert(`Upgrade successful! Credit of ₹${upgradeCredit} applied.`);
        const sub = await subscriptionApi.getCurrent();
        setCurrentSubscription(sub.data);
        return;
      }

      const response = await subscriptionApi.purchase(planId);
      const { checkout_url } = response.data;
      if (checkout_url && !checkout_url.includes('placeholder')) {
        window.location.href = checkout_url;
      } else {
        alert('Demo mode: Checkout would redirect to ' + checkout_url);
        const sub = await subscriptionApi.getCurrent();
        setCurrentSubscription(sub.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start purchase');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start your child's learning journey with our interactive games.
            Choose the plan that works best for you.
          </p>
        </div>

        {/* Current Status Banner */}
        {hasActiveSubscription && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-green-800">
              You have an active {currentPlan?.replace('_', ' ')} subscription
              {currentSubscription.days_remaining && ` • ${currentSubscription.days_remaining} days remaining`}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isLoading = loading === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                    BEST VALUE
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.priceDisplay}
                    </span>
                    <span className="text-gray-500">/{plan.duration}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isLoading || isCurrentPlan}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isLoading
                      ? 'Processing...'
                      : isCurrentPlan
                      ? 'Current Plan'
                      : plan.popular
                      ? 'Get Started'
                      : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change games during my subscription?
              </h3>
              <p className="text-gray-600">
                Yes! Game packs include 1 free game swap. Full annual subscribers
                have unlimited swaps.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens when my subscription ends?
              </h3>
              <p className="text-gray-600">
                You can renew or upgrade to a longer plan. Your progress is saved
                and will be restored when you resubscribe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I upgrade from a pack to annual?
              </h3>
              <p className="text-gray-600">
                Absolutely! We'll credit the remaining value of your pack towards
                the annual subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
