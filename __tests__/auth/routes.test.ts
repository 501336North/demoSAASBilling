import { NextRequest } from 'next/server';

// Mock the auth handler
jest.mock('@/auth', () => ({
  handlers: {
    GET: jest.fn().mockImplementation(async () => new Response('OK', { status: 200 })),
    POST: jest.fn().mockImplementation(async () => new Response('OK', { status: 200 })),
  },
}));

describe('Auth API Routes', () => {
  it('should have auth API route handler', async () => {
    const { GET, POST } = await import('@/app/api/auth/[...nextauth]/route');
    expect(GET).toBeDefined();
    expect(POST).toBeDefined();
  });
});
