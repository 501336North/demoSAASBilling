import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

/**
 * Google OAuth provider configuration
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables
 */
export const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];

/**
 * NextAuth.js configuration
 * Configures OAuth providers and custom pages
 */
export const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: '/login',
  },
};
