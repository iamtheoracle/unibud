import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/oracle/kernel/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/oracle/kernel/**/*.ts'],
      exclude: [
        'src/oracle/kernel/__tests__/**',
        'src/oracle/kernel/types/**',
        'src/oracle/kernel/vitest.config.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
});
