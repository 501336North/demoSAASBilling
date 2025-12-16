import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Google sign in button', async () => {
    const { useSession } = await import('next-auth/react');
    const { useRouter } = await import('next/navigation');

    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    const LoginPage = (await import('@/app/login/page')).default;
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('should call signIn when button clicked', async () => {
    const { useSession, signIn } = await import('next-auth/react');
    const { useRouter } = await import('next/navigation');

    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    const LoginPage = (await import('@/app/login/page')).default;
    render(<LoginPage />);

    const button = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(button);

    expect(signIn).toHaveBeenCalledWith('google', expect.objectContaining({
      callbackUrl: expect.any(String)
    }));
  });

  it('should show loading state when session status is loading', async () => {
    const { useSession } = await import('next-auth/react');
    const { useRouter } = await import('next/navigation');

    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading'
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    const LoginPage = (await import('@/app/login/page')).default;
    render(<LoginPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should redirect authenticated users to /app', async () => {
    const { useSession } = await import('next-auth/react');
    const { useRouter } = await import('next/navigation');

    const mockPush = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated'
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    const LoginPage = (await import('@/app/login/page')).default;
    render(<LoginPage />);

    expect(mockPush).toHaveBeenCalledWith('/app');
  });
});
