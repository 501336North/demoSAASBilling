import { NextRequest } from 'next/server';

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
const mockStripe = {
  webhooks: {
    constructEvent: jest.fn(),
  },
};

jest.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
}));

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid signature', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'stripe-signature': 'invalid' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should activate subscription on checkout.session.completed', async () => {
    const { prisma } = await import('@/lib/prisma');

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
        },
      },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      stripeCustomerId: 'cus_123',
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'stripe-signature': 'valid' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subscriptionStatus: 'ACTIVE',
        }),
      })
    );
  });

  it('should set PAST_DUE on invoice.payment_failed', async () => {
    const { prisma } = await import('@/lib/prisma');

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: {
          customer: 'cus_123',
        },
      },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      stripeCustomerId: 'cus_123',
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'stripe-signature': 'valid' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subscriptionStatus: 'PAST_DUE',
        }),
      })
    );
  });

  it('should set EXPIRED on customer.subscription.deleted', async () => {
    const { prisma } = await import('@/lib/prisma');

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_123',
        },
      },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      stripeCustomerId: 'cus_123',
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'stripe-signature': 'valid' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subscriptionStatus: 'EXPIRED',
        }),
      })
    );
  });

  it('should update period end on invoice.paid', async () => {
    const { prisma } = await import('@/lib/prisma');
    const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: {
        object: {
          customer: 'cus_123',
          lines: {
            data: [{ period: { end: periodEnd } }],
          },
        },
      },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user123',
      stripeCustomerId: 'cus_123',
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'stripe-signature': 'valid' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
        }),
      })
    );
  });
});
