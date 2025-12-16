import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock useCurrentUser
jest.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show subscription status', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'ACTIVE',
    });

    const SettingsPage = (await import('@/app/app/settings/page')).default;
    render(<SettingsPage />);

    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('should have manage billing button', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'ACTIVE',
    });

    const SettingsPage = (await import('@/app/app/settings/page')).default;
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: /manage billing/i })).toBeInTheDocument();
  });

  it('should call portal API when manage billing clicked', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'ACTIVE',
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://billing.stripe.com/portal' }),
    });

    const SettingsPage = (await import('@/app/app/settings/page')).default;
    render(<SettingsPage />);

    const button = screen.getByRole('button', { name: /manage billing/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/portal', {
        method: 'POST',
      });
    });
  });

  it('should show user email', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'ACTIVE',
    });

    const SettingsPage = (await import('@/app/app/settings/page')).default;
    render(<SettingsPage />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should have sign out button', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'ACTIVE',
    });

    const SettingsPage = (await import('@/app/app/settings/page')).default;
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('should call signOut when sign out button clicked', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');
    const { signOut } = await import('next-auth/react');

    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'ACTIVE',
    });

    const SettingsPage = (await import('@/app/app/settings/page')).default;
    render(<SettingsPage />);

    const button = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(button);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('should show different status colors for different subscription states', async () => {
    const { useCurrentUser } = await import('@/hooks/useCurrentUser');

    // Test PAST_DUE status
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'PAST_DUE',
    });

    const SettingsPage = (await import('@/app/app/settings/page')).default;
    const { rerender } = render(<SettingsPage />);

    expect(screen.getByText(/past_due/i)).toBeInTheDocument();

    // Test INACTIVE status
    (useCurrentUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      subscriptionStatus: 'INACTIVE',
    });

    rerender(<SettingsPage />);
    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });
});
