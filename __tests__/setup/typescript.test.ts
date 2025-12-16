import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

describe('TypeScript Configuration', () => {
  test('should have valid TypeScript configuration', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.json');

    // Check if tsconfig.json exists
    expect(existsSync(tsconfigPath)).toBe(true);

    // Parse and verify strict mode is enabled
    const tsconfigContent = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    expect(tsconfigContent.compilerOptions?.strict).toBe(true);
  });
});
