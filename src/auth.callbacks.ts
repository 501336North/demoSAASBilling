import { prisma } from '@/lib/prisma';
import type { NextAuthConfig } from 'next-auth';

/**
 * NextAuth.js callbacks for authentication flow
 * Handles user creation/updates and session enrichment with subscription data
 */
export const callbacks: NextAuthConfig['callbacks'] = {
  /**
   * Called on sign in
   * Creates or updates user in database with Google OAuth profile data
   */
  async signIn({ user, account }) {
    if (!user.email) {
      return false;
    }

    // Upsert user in database (create if not exists, update if exists)
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: user.name,
        image: user.image,
      },
      update: {
        name: user.name,
        image: user.image,
      },
    });

    return true;
  },

  /**
   * Called whenever a session is checked
   * Enriches session with user subscription data from database
   */
  async session({ session, token }) {
    if (!session.user?.email) {
      return session;
    }

    // Fetch user from database to get subscription status
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (dbUser) {
      session.user.id = dbUser.id;
      session.user.subscriptionStatus = dbUser.subscriptionStatus;
      session.user.stripeCustomerId = dbUser.stripeCustomerId;
      session.user.stripeCurrentPeriodEnd = dbUser.stripeCurrentPeriodEnd;
    }

    return session;
  },
};
