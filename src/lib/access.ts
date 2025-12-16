import { SubscriptionStatus } from '@prisma/client';

export interface SubscriptionData {
  subscriptionStatus: SubscriptionStatus | null;
  stripeCurrentPeriodEnd: Date | null;
}

/**
 * Determines if a user has access to protected content based on subscription status.
 *
 * Access rules:
 * - ACTIVE: Has access
 * - PAST_DUE: Has access (grace period for payment recovery)
 * - CANCELED: Has access until stripeCurrentPeriodEnd
 * - INACTIVE: No access (never subscribed)
 * - EXPIRED: No access (subscription ended)
 */
export function hasAccess(data: SubscriptionData): boolean {
  const { subscriptionStatus, stripeCurrentPeriodEnd } = data;

  if (!subscriptionStatus) {
    return false;
  }

  switch (subscriptionStatus) {
    case 'ACTIVE':
    case 'PAST_DUE':
      return true;

    case 'CANCELED':
      // User has access until their current billing period ends
      if (!stripeCurrentPeriodEnd) {
        return false;
      }
      return new Date() < stripeCurrentPeriodEnd;

    case 'INACTIVE':
    case 'EXPIRED':
      return false;

    default:
      return false;
  }
}
