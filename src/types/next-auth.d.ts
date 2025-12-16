import { SubscriptionStatus } from '@prisma/client';
import { DefaultSession } from 'next-auth';

/**
 * Extend NextAuth types to include subscription data in session
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      subscriptionStatus: SubscriptionStatus;
      stripeCustomerId: string | null;
      stripeCurrentPeriodEnd: Date | null;
    } & DefaultSession['user'];
  }

  interface User {
    subscriptionStatus?: SubscriptionStatus;
    stripeCustomerId?: string | null;
    stripeCurrentPeriodEnd?: Date | null;
  }
}
