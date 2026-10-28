// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', include: ['lab_tests/**/*.test.tsx'],
          setupFiles: ['./lab_tests/setup.ts'], restoreMocks: true },
});
