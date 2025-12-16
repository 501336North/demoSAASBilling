import fs from 'fs';
import path from 'path';

describe('Prisma Setup', () => {
  it('should have prisma schema file', () => {
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const exists = fs.existsSync(schemaPath);
    expect(exists).toBe(true);
  });

  it('should have prisma client configuration', () => {
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');
    expect(content).toContain('generator client');
    expect(content).toContain('provider = "postgresql"');
  });

  it('should have prisma config file with database URL', () => {
    const configPath = path.join(process.cwd(), 'prisma.config.ts');
    const exists = fs.existsSync(configPath);
    expect(exists).toBe(true);

    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain('DATABASE_URL');
  });
});
