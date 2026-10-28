import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom', include: ['behavior.test.tsx'] }, esbuild: { jsx: 'automatic' } });
