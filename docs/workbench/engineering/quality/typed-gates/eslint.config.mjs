// eslint.config.mjs — TS-only lab scope; JS/config files need their own rule scope.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
export default defineConfig({
  files: ['src/**/*.ts'],
  extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }
  },
  rules: {
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error'
  }
});
