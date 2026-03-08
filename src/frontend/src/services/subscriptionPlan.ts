import type { SubscriptionPlanType } from './api';

export const SUPPORTED_SUBSCRIPTION_PLANS = new Set<SubscriptionPlanType>([
  'game_pack_5',
  'game_pack_10',
  'full_annual',
]);

export function isSupportedSubscriptionPlan(planType: string | null | undefined): planType is SubscriptionPlanType {
  return Boolean(planType && SUPPORTED_SUBSCRIPTION_PLANS.has(planType as SubscriptionPlanType));
}

export function isFullAccessPlan(planType: string | null | undefined): boolean {
  return planType === 'full_annual';
}

export function isQuarterlyPack(planType: string | null | undefined): boolean {
  return planType === 'game_pack_10';
}

export function getPlanLabel(planType: string | null | undefined): string {
  switch (planType) {
    case 'game_pack_5':
      return '5 games for 1 month';
    case 'game_pack_10':
      return '10 games for 3 months';
    case 'full_annual':
      return 'Full access for 1 year';
    default:
      return 'Unknown subscription';
  }
}

export function getPlanRenewalMessage(planType: string | null | undefined): string | null {
  switch (planType) {
    case 'game_pack_5':
      return 'At renewal you can keep the same 5 games or choose a new 5.';
    case 'game_pack_10':
      return 'Your 10-game pack can refresh once each month during the quarter.';
    default:
      return null;
  }
}
