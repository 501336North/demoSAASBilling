describe('Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw error when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    expect(() => require('@/lib/env')).toThrow('DATABASE_URL');
  });

  it('should throw error when NEXTAUTH_SECRET is missing', () => {
    process.env.DATABASE_URL = 'postgresql://test';
    delete process.env.NEXTAUTH_SECRET;
    expect(() => require('@/lib/env')).toThrow('NEXTAUTH_SECRET');
  });

  it('should throw error when STRIPE_SECRET_KEY is missing', () => {
    process.env.DATABASE_URL = 'postgresql://test';
    process.env.NEXTAUTH_SECRET = 'secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    delete process.env.STRIPE_SECRET_KEY;
    expect(() => require('@/lib/env')).toThrow('STRIPE_SECRET_KEY');
  });

  it('should export validated env object when all vars present', () => {
    // Set all required env vars
    process.env.DATABASE_URL = 'postgresql://test';
    process.env.NEXTAUTH_SECRET = 'secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_xxx';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_xxx';
    process.env.STRIPE_PRICE_ID = 'price_xxx';

    const { env } = require('@/lib/env');
    expect(env.DATABASE_URL).toBe('postgresql://test');
    expect(env.STRIPE_SECRET_KEY).toBe('sk_test_xxx');
  });
});
