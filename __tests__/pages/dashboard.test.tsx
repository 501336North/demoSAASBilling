import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock useCurrentUser
jest.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));

// Mock PaymentFailedBanner
jest.mock('@/components/PaymentFailedBanner', () => ({
  PaymentFailedBanner: () => <div data-testid="payment-banner">Payment Banner</div>,
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard for subscribed user', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      subscriptionStatus: 'ACTIVE',
      isPastDue: false,
    });

    const DashboardPage = (await import('@/app/app/page')).default;
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('should display PaymentFailedBanner when PAST_DUE', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'PAST_DUE',
      isPastDue: true,
    });

    const DashboardPage = (await import('@/app/app/page')).default;
    render(<DashboardPage />);

    expect(screen.getByTestId('payment-banner')).toBeInTheDocument();
  });
});
