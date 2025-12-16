import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock useCurrentUser
jest.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Subscribe Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    const SubscribePage = (await import('@/app/subscribe/page')).default;
    render(<SubscribePage />);

    // Should show login message and link
    expect(screen.getByRole('heading', { name: /sign in to subscribe/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show subscribe button for authenticated users', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      subscriptionStatus: 'INACTIVE',
    });

    const SubscribePage = (await import('@/app/subscribe/page')).default;
    render(<SubscribePage />);

    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('should call checkout API on subscribe click', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      subscriptionStatus: 'INACTIVE',
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' }),
    });

    const SubscribePage = (await import('@/app/subscribe/page')).default;
    render(<SubscribePage />);

    const button = screen.getByRole('button', { name: /subscribe/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
        method: 'POST',
      });
    });
  });

  it('should receive checkout URL from API', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      subscriptionStatus: 'INACTIVE',
    });

    const checkoutUrl = 'https://checkout.stripe.com/test';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: checkoutUrl }),
    });

    const SubscribePage = (await import('@/app/subscribe/page')).default;
    render(<SubscribePage />);

    const button = screen.getByRole('button', { name: /subscribe/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
        method: 'POST',
      });
    });
  });

  it('should show loading state while subscribing', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      subscriptionStatus: 'INACTIVE',
    });

    // Mock a delayed fetch
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' }),
        }), 100)
      )
    );

    const SubscribePage = (await import('@/app/subscribe/page')).default;
    render(<SubscribePage />);

    const button = screen.getByRole('button', { name: /subscribe/i });
    fireEvent.click(button);

    // Should show processing state
    expect(screen.getByRole('button', { name: /processing/i })).toBeInTheDocument();
  });

  it('should display pricing information', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      subscriptionStatus: 'INACTIVE',
    });

    const SubscribePage = (await import('@/app/subscribe/page')).default;
    render(<SubscribePage />);

    // Should show pricing details
    expect(screen.getByText(/\$9\.99/i)).toBeInTheDocument();
    expect(screen.getByText(/month/i)).toBeInTheDocument();
  });

  it('should show loading state while checking authentication', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    const SubscribePage = (await import('@/app/subscribe/page')).default;
    render(<SubscribePage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
