import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('Auth Callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn callback', () => {
    it('should create user in database on first Google login', async () => {
      const mockUser = {
        id: 'cuid123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        subscriptionStatus: 'INACTIVE',
      };

      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      // Import the signIn callback
      const { callbacks } = await import('@/auth.callbacks');

      const result = await callbacks.signIn!({
        user: {
          id: 'google-id-123',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
        },
        account: {
          provider: 'google',
          providerAccountId: 'google-id-123',
          type: 'oauth',
        } as any,
        profile: undefined,
      } as any);

      expect(result).toBe(true);
      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
        })
      );
    });

    it('should return false when user email is missing', async () => {
      const { callbacks } = await import('@/auth.callbacks');

      const result = await callbacks.signIn!({
        user: {
          id: 'google-id-123',
          name: 'Test User',
        } as any,
        account: {
          provider: 'google',
          providerAccountId: 'google-id-123',
          type: 'oauth',
        } as any,
        profile: undefined,
      } as any);

      expect(result).toBe(false);
      expect(prisma.user.upsert).not.toHaveBeenCalled();
    });
  });

  describe('session callback', () => {
    it('should include subscription status in session', async () => {
      const mockUser = {
        id: 'cuid123',
        email: 'test@example.com',
        subscriptionStatus: 'ACTIVE',
        stripeCustomerId: 'cus_123',
        stripeCurrentPeriodEnd: new Date('2024-12-31'),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const { callbacks } = await import('@/auth.callbacks');

      const session = await callbacks.session!({
        session: {
          user: { email: 'test@example.com' } as any,
          expires: new Date().toISOString(),
        } as any,
        token: {},
      } as any);

      expect(session.user.subscriptionStatus).toBe('ACTIVE');
      expect(session.user.stripeCustomerId).toBe('cus_123');
      expect(session.user.id).toBe('cuid123');
    });

    it('should handle missing user in database', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const { callbacks } = await import('@/auth.callbacks');

      const originalSession = {
        user: { email: 'test@example.com' },
        expires: new Date().toISOString(),
      };

      const session = await callbacks.session!({
        session: originalSession as any,
        token: {},
      } as any);

      // Should return session unchanged if user not found
      expect(session).toEqual(originalSession);
    });

    it('should handle session without user email', async () => {
      const { callbacks } = await import('@/auth.callbacks');

      const originalSession = {
        user: {},
        expires: new Date().toISOString(),
      };

      const session = await callbacks.session!({
        session: originalSession as any,
        token: {},
      } as any);

      expect(session).toEqual(originalSession);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
