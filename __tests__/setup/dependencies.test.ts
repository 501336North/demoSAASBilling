import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

describe('Project Dependencies', () => {
  test('should have required dependencies installed', () => {
    const packageJsonPath = resolve(process.cwd(), 'package.json');

    // Check if package.json exists
    expect(existsSync(packageJsonPath)).toBe(true);

    // Parse and verify required dependencies
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Check for Next.js
    expect(packageJson.dependencies?.next).toBeDefined();

    // Check for React
    expect(packageJson.dependencies?.react).toBeDefined();
    expect(packageJson.dependencies?.['react-dom']).toBeDefined();

    // Check for TypeScript dev dependencies
    expect(packageJson.devDependencies?.typescript).toBeDefined();
    expect(packageJson.devDependencies?.['@types/node']).toBeDefined();
    expect(packageJson.devDependencies?.['@types/react']).toBeDefined();
  });
});
