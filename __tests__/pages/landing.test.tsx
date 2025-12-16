import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Landing Page', () => {
  it('should render without auth', async () => {
    const LandingPage = (await import('@/app/page')).default;
    render(<LandingPage />);

    // Should have a heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should have call to action to sign up', async () => {
    const LandingPage = (await import('@/app/page')).default;
    render(<LandingPage />);

    // Should have Get Started button/link
    const ctaLink = screen.getByRole('link', { name: /get started/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/login');
  });
});
