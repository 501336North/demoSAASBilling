import { NextRequest } from 'next/server';

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should redirect unauthenticated user to /login', async () => {
    const { auth } = await import('@/auth');
    (auth as jest.Mock).mockResolvedValue(null);

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/app/dashboard');

    const response = await middleware(request);

    expect(response?.headers.get('location')).toContain('/login');
  });

  it('should redirect authenticated user without subscription to /subscribe', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      subscriptionStatus: 'INACTIVE',
      stripeCurrentPeriodEnd: null,
    });

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/app/dashboard');

    const response = await middleware(request);

    expect(response?.headers.get('location')).toContain('/subscribe');
  });

  it('should allow subscribed user to access /app/*', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      subscriptionStatus: 'ACTIVE',
      stripeCurrentPeriodEnd: null,
    });

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/app/dashboard');

    const response = await middleware(request);

    // No redirect, should return undefined or NextResponse.next()
    expect(response?.headers.get('location')).toBeNull();
  });

  it('should not protect public routes', async () => {
    const { auth } = await import('@/auth');
    (auth as jest.Mock).mockResolvedValue(null);

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/');

    const response = await middleware(request);

    // Public route should not redirect
    expect(response?.headers.get('location')).toBeNull();
  });

  it('should add callbackUrl to login redirect', async () => {
    const { auth } = await import('@/auth');
    (auth as jest.Mock).mockResolvedValue(null);

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/app/settings');

    const response = await middleware(request);

    const location = response?.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('callbackUrl=%2Fapp%2Fsettings');
  });

  it('should allow PAST_DUE subscription status (grace period)', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      subscriptionStatus: 'PAST_DUE',
      stripeCurrentPeriodEnd: new Date(Date.now() + 86400000), // tomorrow
    });

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/app/dashboard');

    const response = await middleware(request);

    // Should allow access
    expect(response?.headers.get('location')).toBeNull();
  });

  it('should allow CANCELED subscription until period end', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      subscriptionStatus: 'CANCELED',
      stripeCurrentPeriodEnd: new Date(Date.now() + 86400000), // tomorrow
    });

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/app/dashboard');

    const response = await middleware(request);

    // Should allow access until period end
    expect(response?.headers.get('location')).toBeNull();
  });

  it('should block CANCELED subscription after period end', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      subscriptionStatus: 'CANCELED',
      stripeCurrentPeriodEnd: new Date(Date.now() - 86400000), // yesterday
    });

    const { middleware } = await import('@/middleware');
    const request = new NextRequest('http://localhost/app/dashboard');

    const response = await middleware(request);

    // Should redirect to subscribe
    expect(response?.headers.get('location')).toContain('/subscribe');
  });
});
