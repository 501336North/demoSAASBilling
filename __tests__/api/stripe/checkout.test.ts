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
      update: jest.fn(),
    },
  },
}));

// Mock Stripe
const mockStripeCustomersCreate = jest.fn();
const mockStripeCheckoutSessionsCreate = jest.fn();

jest.mock('@/lib/stripe', () => ({
  stripe: {
    customers: {
      create: mockStripeCustomersCreate,
    },
    checkout: {
      sessions: {
        create: mockStripeCheckoutSessionsCreate,
      },
    },
  },
}));

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    const { auth } = await import('@/auth');
    (auth as jest.Mock).mockResolvedValue(null);

    const { POST } = await import('@/app/api/stripe/checkout/route');
    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should create Stripe customer if not exists', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com', id: 'user123' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      stripeCustomerId: null, // No customer yet
    });

    mockStripeCustomersCreate.mockResolvedValue({ id: 'cus_new123' });
    mockStripeCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session123',
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({
      stripeCustomerId: 'cus_new123',
    });

    const { POST } = await import('@/app/api/stripe/checkout/route');
    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user123' },
        data: expect.objectContaining({ stripeCustomerId: 'cus_new123' }),
      })
    );
  });

  it('should return checkout session URL', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');

    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com', id: 'user123' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      stripeCustomerId: 'cus_existing',
    });

    mockStripeCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/session123',
    });

    const { POST } = await import('@/app/api/stripe/checkout/route');
    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe('https://checkout.stripe.com/session123');
  });
});
