import { z } from 'zod';

/**
 * Server-side environment variables schema
 * These should NEVER be exposed to the client
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // NextAuth
  NEXTAUTH_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
  STRIPE_PRICE_ID: z.string().startsWith('price_', 'STRIPE_PRICE_ID must start with price_'),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
  throw new Error(`Environment validation failed:\n${errors}`);
}

/**
 * Validated environment variables
 * Only use on server-side (API routes, getServerSideProps, etc.)
 */
export const env = parsed.data;

/**
 * Client-safe environment variables
 * Safe to expose to the browser
 */
export const clientEnv = {
  STRIPE_PUBLISHABLE_KEY: env.STRIPE_PUBLISHABLE_KEY,
} as const;

// Type exports
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = typeof clientEnv;
