// Mock Google provider before importing
jest.mock('next-auth/providers/google', () => {
  return jest.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth',
  }));
});

describe('Auth Configuration', () => {
  it('should configure Google OAuth provider', async () => {
    // Import the auth config
    const { providers } = await import('@/auth.config');

    // Check Google provider is configured
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
    const googleProvider = providers.find((p: any) => p.id === 'google');
    expect(googleProvider).toBeDefined();
  });
});
