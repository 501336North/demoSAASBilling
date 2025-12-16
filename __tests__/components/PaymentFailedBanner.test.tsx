import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock useCurrentUser hook
jest.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));

// Mock fetch for portal API call
global.fetch = jest.fn() as jest.Mock;

describe('PaymentFailedBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render banner when status is PAST_DUE', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      subscriptionStatus: 'PAST_DUE',
      isPastDue: true,
    });

    const { PaymentFailedBanner } = await import('@/components/PaymentFailedBanner');
    render(<PaymentFailedBanner />);

    expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update payment/i })).toBeInTheDocument();
  });

  it('should not render banner when status is ACTIVE', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      subscriptionStatus: 'ACTIVE',
      isPastDue: false,
    });

    const { PaymentFailedBanner } = await import('@/components/PaymentFailedBanner');
    const { container } = render(<PaymentFailedBanner />);

    expect(container.firstChild).toBeNull();
  });

  it('should call portal API when update payment clicked', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      subscriptionStatus: 'PAST_DUE',
      isPastDue: true,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://billing.stripe.com/portal' }),
    });

    const { PaymentFailedBanner } = await import('@/components/PaymentFailedBanner');
    render(<PaymentFailedBanner />);

    const button = screen.getByRole('button', { name: /update payment/i });
    fireEvent.click(button);

    // Wait for async operation
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/portal', {
        method: 'POST',
      });
    });
  });
});
