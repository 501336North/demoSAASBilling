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

// Mock Stripe
const mockStripe = {
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
};

jest.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
}));

describe('POST /api/stripe/portal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    const { auth } = await import('@/auth');
    (auth as jest.Mock).mockResolvedValue(null);

    const { POST } = await import('@/app/api/stripe/portal/route');
    const request = new NextRequest('http://localhost/api/stripe/portal', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 if user has no Stripe customer', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      stripeCustomerId: null, // No Stripe customer
    });

    const { POST } = await import('@/app/api/stripe/portal/route');
    const request = new NextRequest('http://localhost/api/stripe/portal', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return portal session URL', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      stripeCustomerId: 'cus_existing',
    });

    mockStripe.billingPortal.sessions.create.mockResolvedValue({
      url: 'https://billing.stripe.com/session123',
    });

    const { POST } = await import('@/app/api/stripe/portal/route');
    const request = new NextRequest('http://localhost/api/stripe/portal', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe('https://billing.stripe.com/session123');
    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_existing',
      return_url: expect.stringContaining('/app/settings'),
    });
  });
});
