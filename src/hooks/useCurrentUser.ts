'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Custom hook for accessing current user session with type safety
 *
 * @returns Object containing user data and authentication status helpers
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, hasActiveSubscription } = useCurrentUser();
 *
 *   if (!isAuthenticated) {
 *     return <Login />;
 *   }
 *
 *   return <div>Welcome {user?.email}</div>;
 * }
 * ```
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  // Type-safe access to user with extended properties
  const user = session?.user as Session['user'] | undefined;

  return {
    user: user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    subscriptionStatus: user?.subscriptionStatus as SubscriptionStatus | undefined,
    hasActiveSubscription: user?.subscriptionStatus === 'ACTIVE',
    isPastDue: user?.subscriptionStatus === 'PAST_DUE',
  };
}
