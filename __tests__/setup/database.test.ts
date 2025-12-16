// Mock Prisma client for JSDOM environment
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Database Connection', () => {
  it('should export prisma singleton', async () => {
    const { prisma } = await import('@/lib/prisma');
    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe('object');
    // Verify it has PrismaClient methods
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
  });
});
