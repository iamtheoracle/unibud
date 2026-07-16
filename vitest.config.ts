import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/education/__tests__/**/*.test.ts', 'src/oracle/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/education/**/*.ts', 'src/oracle/kernel/**/*.ts'],
      exclude: ['src/education/__tests__/**', 'src/education/index.ts'],
    },
  },
});
