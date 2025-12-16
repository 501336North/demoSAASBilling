import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/auth.config';
import { callbacks } from '@/auth.callbacks';

/**
 * NextAuth.js configuration
 * Exported for testing and reference
 */
const config = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' as const },
  callbacks,
  ...authConfig,
};

/**
 * NextAuth.js instance
 * Configured with Prisma adapter for database sessions and Google OAuth
 */
export const { handlers, auth, signIn, signOut } = NextAuth(config);

/**
 * Export configuration for testing
 */
export { config as authConfig };
