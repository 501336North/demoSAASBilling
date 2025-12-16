import { SubscriptionStatus } from '@prisma/client';

describe('Access Control', () => {
  describe('hasAccess', () => {
    it('should return true for ACTIVE user', async () => {
      const { hasAccess } = await import('@/lib/access');

      const result = hasAccess({
        subscriptionStatus: 'ACTIVE',
        stripeCurrentPeriodEnd: null,
      });

      expect(result).toBe(true);
    });

    it('should return true for PAST_DUE user (grace period)', async () => {
      const { hasAccess } = await import('@/lib/access');

      const result = hasAccess({
        subscriptionStatus: 'PAST_DUE',
        stripeCurrentPeriodEnd: null,
      });

      expect(result).toBe(true);
    });

    it('should return true for CANCELED user if period not ended', async () => {
      const { hasAccess } = await import('@/lib/access');
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const result = hasAccess({
        subscriptionStatus: 'CANCELED',
        stripeCurrentPeriodEnd: futureDate,
      });

      expect(result).toBe(true);
    });

    it('should return false for CANCELED user if period ended', async () => {
      const { hasAccess } = await import('@/lib/access');
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago

      const result = hasAccess({
        subscriptionStatus: 'CANCELED',
        stripeCurrentPeriodEnd: pastDate,
      });

      expect(result).toBe(false);
    });

    it('should return false for INACTIVE user', async () => {
      const { hasAccess } = await import('@/lib/access');

      const result = hasAccess({
        subscriptionStatus: 'INACTIVE',
        stripeCurrentPeriodEnd: null,
      });

      expect(result).toBe(false);
    });

    it('should return false for EXPIRED user', async () => {
      const { hasAccess } = await import('@/lib/access');

      const result = hasAccess({
        subscriptionStatus: 'EXPIRED',
        stripeCurrentPeriodEnd: null,
      });

      expect(result).toBe(false);
    });

    it('should return false for null subscription status', async () => {
      const { hasAccess } = await import('@/lib/access');

      const result = hasAccess({
        subscriptionStatus: null as unknown as SubscriptionStatus,
        stripeCurrentPeriodEnd: null,
      });

      expect(result).toBe(false);
    });

    it('should return false for CANCELED user with null period end', async () => {
      const { hasAccess } = await import('@/lib/access');

      const result = hasAccess({
        subscriptionStatus: 'CANCELED',
        stripeCurrentPeriodEnd: null,
      });

      expect(result).toBe(false);
    });
  });
});
